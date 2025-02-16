import * as Log from 'logger';
import { COLORS } from "./utils";
import type { LocalStorage } from "node-persist";
import type { matterLogLevel, matterLogFormat } from '../types/module';

import { Endpoint, EndpointServer, Environment, ServerNode, StorageService, Time } from "@matter/main";
import { OnOffLightDevice } from "@matter/main/devices/on-off-light";
import { OnOffPlugInUnitDevice } from "@matter/main/devices/on-off-plug-in-unit";
import { logEndpoint } from "@matter/main/protocol";
import { DeviceTypeId, VendorId } from "@matter/main/types";

const MODULE_TAG = `${COLORS.reset}[${COLORS.FG.magenta}MMM-Matter${COLORS.reset}] (${COLORS.FG.green}MatterServer${COLORS.reset})`;

export default class MatterServer {
  environment: Environment;
  storageService: StorageService;
  moduleStorageService: LocalStorage;
  mdnsInterface: string;

  constructor(
    moduleStorageService: LocalStorage,
    matterStorePath: string,
    matterLogLevel: matterLogLevel,
    matterLogFormat: matterLogFormat,
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
  }
  
  addServerNode(config) {
    // dsds
  }
}