import * as Log from 'logger';
import { COLORS } from "./utils";
import type { LocalStorage } from "node-persist";
import type { matterLogLevel, matterLogFormat } from '../types/module';

import { EndpointServer, Environment, ServerNode, StorageService, Time } from "@matter/main";
import { FabricAction, logEndpoint } from "@matter/main/protocol";
import { AggregatorEndpoint } from "@matter/main/endpoints/aggregator";
import { QrCode, VendorId } from "@matter/main/types";

const MODULE_TAG = `${COLORS.reset}[${COLORS.FG.magenta}MMM-Matter${COLORS.reset}] (${COLORS.FG.green}MatterServer${COLORS.reset})`;

export class MatterServer {
  environment: Environment;
  storageService: StorageService;
  moduleStorageService: LocalStorage;
  mdnsInterface: string;
  
  moduleVersionString: string;

  serverNode: ServerNode<ServerNode.RootEndpoint>;

  constructor(
    moduleStorageService: LocalStorage,
    matterStorePath: string,
    matterLogLevel: matterLogLevel,
    matterLogFormat: matterLogFormat,
    moduleVersionString,
    mdnsInterface?: string,
  ) {
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
  
  async startServerNode() {
    const productName = "MMM-Matter Bridge";
    const deviceName = "MMM Bridge";
    const vendorName = "fabrizz";
    const port = 5540;

    const deviceStorage = (await this.storageService.open("device")).createContext("data");
    const passcode = await deviceStorage.get("passcode", 20202021);
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
      // Required: Give the Node a unique ID which is used to store the state of this node
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
        productUrl: "https://github.com/Fabrizz/MMM-Matter",
        reachable: true,
        location: "MagicMirror2"
      },
    });

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

    await this.serverNode.start();
    logEndpoint(EndpointServer.forEndpoint(this.serverNode));

    // Commisioning logic
    if (!this.serverNode.lifecycle.isCommissioned) {
      const { qrPairingCode, manualPairingCode } = this.serverNode.state.commissioning.pairingCodes;

        console.log(QrCode.get(qrPairingCode));
        console.log(`QR Code URL: https://project-chip.github.io/connectedhomeip/qrcode.html?data=${qrPairingCode}`);
        console.log(`Manual pairing code: ${manualPairingCode}`);
    } else {
        console.log("Device is already commissioned. Waiting for controllers to connect ...");
    }

  }
}