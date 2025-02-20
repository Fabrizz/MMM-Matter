/// <reference path="./magicmirror-module.d.ts" />

export type matterLogLevel = "fatal" | "error" | "warn" | "notice" | "info" | "debug";
export type matterLogFormat = "ansi" | "plain" | "html";

export type Config = {
  matterLogLevel: matterLogLevel;
  matterLogFormat: matterLogFormat;
}

export type NotificationForBackendPayload = {
  tag: string;
  payload: any;
  sender: Module.ModuleProperties<any>;
}

export type FrontendReadyPayload = {
  matterLogLevel: matterLogLevel;
  matterLogFormat: matterLogFormat;
}

export type SocketNotificationsFrontend =
  | "FRONTEND_READY"
  | "FRONTEND_TRANSLATIONS"
  | "EXTERNAL_CONTROL"
  | "EXTERNAL_SUGGESTION"

export type SocketNotificationsBackend =
  | "CONTROL_MODULES"
  | "REGISTER_NOTIFICATIONS"

export type TranslationKeys =
  | "CONSOLE_USEWEB"
  | "TRANSLATOR_GLOBALERROR"
  | "CONSOLE_LISTENTO"
  | "WEB_OPEN_DOCS"
  | "WEB_ADD_DEVICE"


// ----------------------------------------------- Matter
/** MMM-Matter supported devices */
export type MMMMatterSupportedDevices =
  | "switch.onoff"
  | "switch.multiple"
  | "light.dimmable"
  | "light.rgb"
  | "sensor.binary"

export type matterDeviceDefinition = {
  matter: {
    type: MMMMatterSupportedDevices;
    nodeLabel: string;
    productName: string;
    productLabel: string;
    serialNumber: string;
  }
  description: {
    isUserDefined: boolean;
    moduleRef?: ModuleRefDevice;
    createdAt: number;
    updatedAt: number;
  };
  behavior:
    | MMMMatterDeviceSwitchOnOffBehavior
  id: string;
}

export type ModuleRefDevice = {
  module: string;
  version: string;
  
}

// ----------------------------------------------- Matter Internal Behaviors

/** Defines a basic binary switch that works in various ways:
 *  - OnOff with different notifications
 *  - OnOff with the notification payload
 *  - Toggle with one notification
 */
export type MMMMatterDeviceSwitchOnOffBehavior = {
  /** Turn on with notification x */
  setOnWithNotification?: string,
  /** Turn off with notification x */
  setOffWithNotification?: string,
  /** Toggle with notification x */
  toggleWithNotification?: string,
  /** Set state with true/false payload from notification x */
  setWithNotificationPayload?: string,

  /** Send this notification when the switch is turned on */
  onOnSend?: string,
  /** Send this notification when the switch is turned off */
  onOffSend?: string,
  /** Send this notification when the switch is toggled */
  onToggleSend?: string | [string, {}],
}

/** Defines a dimmable light where:
 * - 0% to 100% brightness (rcv int)
 * - 0% is off
 */
export type MMMMatterDeviceLightDimmerBehavior = {
  /** Set brigthness with notification x */
  setBrightnessWithNotification?: string,
  /** Send this notification with the payload as an INT */
  onBrightnessSend?: string
}