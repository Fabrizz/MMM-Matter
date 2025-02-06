import { Endpoint, EndpointServer, Environment, ServerNode, StorageService, Time } from "@matter/main";
import { OnOffLightDevice } from "@matter/main/devices/on-off-light";
import { OnOffPlugInUnitDevice } from "@matter/main/devices/on-off-plug-in-unit";
import { logEndpoint } from "@matter/main/protocol";
import { DeviceTypeId, VendorId } from "@matter/main/types";

export default class MatterServer {
  environment: Environment;
  storageService: StorageService;

  MatterServer() {
    this.environment = Environment.default;
    this.storageService = this.environment.get(StorageService);
  }

  addServerNode(config) {
    
  }
}