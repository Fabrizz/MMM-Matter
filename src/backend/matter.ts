import * as Log from 'logger';
import { COLORS } from "./utils";
import { Endpoint, EndpointServer, Environment, ServerNode, StorageService, Time } from "@matter/main";
import { FabricAction, logEndpoint } from "@matter/main/protocol";
import { AggregatorEndpoint } from "@matter/main/endpoints/aggregator";
import { VendorId } from "@matter/main/types";
import { MatterSwitchOnOff } from '@backend/devices/MatterSwitchOnOff';
import { MatterBaseDevice } from '@backend/devices/MatterBaseDevice';
import type { LocalStorage } from "node-persist";
import type { matterLogLevel, matterLogFormat, matterDeviceDefinition } from '@typesd/module';

const MODULE_TAG = `${COLORS.reset}[${COLORS.FG.magenta}MMM-Matter${COLORS.reset}] (${COLORS.FG.green}MatterServer${COLORS.reset})`;

export class MatterServer {
  sendToClientEventStream: (event: string, payload?: any) => void;
  sendSocketNotification: (event: string, payload?: any) => void;
  events: NodeJS.EventEmitter;

  environment: Environment;
  storageService: StorageService;
  moduleStorageService: LocalStorage;
  mdnsInterface: string;
  moduleVersionString: string;

  serverNode: ServerNode<ServerNode.RootEndpoint>;
  serverAggregator: Endpoint<AggregatorEndpoint>;
  endpoints: Map<string, {
    endpoint: Endpoint<any>;
    device: matterDeviceDefinition;
  }> = new Map();

  constructor(
    sendToClientEventStream: (event: string, payload?: any) => void,
    sendSocketNotification: (event: SocketNotificationsBackend, payload?: any) => void,
    events: NodeJS.EventEmitter,
    moduleStorageService: LocalStorage,
    matterStorePath: string,
    matterLogLevel: matterLogLevel,
    matterLogFormat: matterLogFormat,
    moduleVersionString,
    mdnsInterface?: string,
  ) {
    this.sendToClientEventStream = sendToClientEventStream;
    this.sendSocketNotification = sendSocketNotification;
    this.events = events;

    this.environment = Environment.default;
    this.environment.vars.set("storage.path", matterStorePath);
    Log.info(`${MODULE_TAG} Store path updated. ${COLORS.FG.gray}${matterStorePath}${COLORS.reset}`);

    if (mdnsInterface) this.environment.vars.set("mdns.networkInterface", mdnsInterface);
    this.mdnsInterface = mdnsInterface;
    this.environment.vars.set("log.level", matterLogLevel);
    this.environment.vars.set("log.format", matterLogFormat);
    
    this.storageService = this.environment.get(StorageService);
    this.moduleStorageService = moduleStorageService;
    this.moduleVersionString = moduleVersionString;

  }
  
  async createServerNode() {
    const productName = "MMM-Matter Bridge";
    const deviceName = "MMM Bridge";
    const vendorName = "fabrizz";
    const port = 5540;

    const deviceStorage = (await this.storageService.open("device")).createContext("data");
    const passcode = await deviceStorage.get("passcode", 20240303);
    const discriminator = await deviceStorage.get("discriminator", 3840);
    const vendorId = await deviceStorage.get("vendorid", 0xfff1);
    const productId = await deviceStorage.get("productid", 0x8000);
    const uniqueId = (await deviceStorage.get("uniqueid", Time.nowMs().toString()));

    await deviceStorage.set({
      passcode,
      discriminator,
      vendorid: vendorId,
      productid: productId,
      uniqueid: uniqueId,
    });

    this.serverNode = await ServerNode.create({
      id: uniqueId,
      network: {
        port
      },
      commissioning: {
        passcode,
        discriminator,
      },
      productDescription: {
        name: deviceName,
        deviceType: AggregatorEndpoint.deviceType,
      },
      // Provide defaults for the BasicInformation cluster on the Root endpoint
      basicInformation: {
        vendorName,
        vendorId: VendorId(vendorId),
        nodeLabel: productName,
        productName,
        productLabel: productName,
        productId,
        serialNumber: `MMM-MATTER-${uniqueId}`,
        uniqueId,
        hardwareVersionString: this.moduleVersionString,
        softwareVersionString: this.moduleVersionString,
        hardwareVersion: 1,
        softwareVersion: 1,
        productUrl: "https://github.com/Fabrizz/MMM-Matter",
        reachable: true,
      },
    });

    this.serverAggregator = new Endpoint(AggregatorEndpoint, { id: "aggregator" });
    await this.serverNode.add(this.serverAggregator);

    /**
     * This event is triggered when the device is initially commissioned successfully.
     * This means: It is added to the first fabric.
     */
    this.serverNode.lifecycle.commissioned.on(() => console.log("Server was initially commissioned successfully!"));

    /** This event is triggered when all fabrics are removed from the device, usually it also does a factory reset then. */
    this.serverNode.lifecycle.decommissioned.on(() => console.log("Server was fully decommissioned successfully!"));

    /** This event is triggered when the device went online. This means that it is discoverable in the network. */
    this.serverNode.lifecycle.online.on(() => {
      console.log("Server is online");
      console.log("Initial Fabrics when coming online", this.serverNode.state.commissioning.fabrics);
    });

    /** This event is triggered when the device went offline. It is no longer discoverable or connectable in the network. */
    this.serverNode.lifecycle.offline.on(() => console.log("Server is offline"));

    /** This event is triggered when a fabric is added, removed or updated on the device. */
    this.serverNode.events.commissioning.fabricsChanged.on((fabricIndex, fabricAction) => {
      let action = "";
      switch (fabricAction) {
        case FabricAction.Added:
          action = "added";
          break;
        case FabricAction.Removed:
          action = "removed";
          break;
        case FabricAction.Updated:
          action = "updated";
          break;
      }
      console.log(`Commissioned Fabrics changed event (${action}) for ${fabricIndex} triggered`, this.serverNode.state.commissioning.fabrics[fabricIndex]);
    });

    logEndpoint(EndpointServer.forEndpoint(this.serverNode));

    // Commisioning logic
    if (!this.serverNode.lifecycle.isCommissioned) {
      const { qrPairingCode, manualPairingCode } = this.serverNode.state.commissioning.pairingCodes;
        console.log(`QR Code URL: https://project-chip.github.io/connectedhomeip/qrcode.html?data=${qrPairingCode}`);
        console.log(`Manual pairing code: ${manualPairingCode}`);
    } else {
        console.log("Device is already commissioned. Waiting for controllers to connect ...");
    }

  }

  async startServerNode() {
    await this.serverNode.start();
  }

  async destroyServerNode() {
    await this.serverNode.close();
  }

  async eraseServerNode() {
    await this.serverNode.erase()
  }

  async addDeviceToBridge(deviceDefinition: matterDeviceDefinition) {
    let device: MatterBaseDevice<any>;

    const deviceData: [
      matterDeviceDefinition,
      (tag: string, payload?: any) => void,
      NodeJS.EventEmitter
    ] = [
      deviceDefinition,
      (tag: string, payload = {}) => {
        this.sendToClientEventStream("CONTROL_MODULES" as SocketNotificationsBackend, { tag, payload });
        this.sendSocketNotification("CONTROL_MODULES", { tag, payload });
      },
      this.events
    ];

    switch (deviceDefinition.matter.type) {
      case "switch.onoff":
        device = new MatterSwitchOnOff(...deviceData);
      break;
    }

    // @ts-ignore | Type instantiation is excessively deep
    await this.serverAggregator.add(device.endpoint);
  }
}