/// <reference path="./magicmirror-module.d.ts" />

export type Config = {
}

export type NotificationForBackendPayload = {
  tag: string;
  payload: any;
  sender: Module.ModuleProperties<any>;
}