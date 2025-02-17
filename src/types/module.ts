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
  | "NOTIFICATION_FORBACKEND"

export type SocketNotificationsBackend =
  | "CONTROL_MODULES"
  | "REGISTER_NOTIFICATIONS"

export type TranslationKeys =
  | "CONSOLE_USEWEB"
  | "TRANSLATOR_GLOBALERROR"
  | "CONSOLE_LISTENTO"
  | "WEB_OPEN_DOCS"
  | "WEB_ADD_DEVICE"