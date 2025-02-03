export type SocketNotificationsFrontend =
  | "FRONTEND_READY"
  | "FRONTEND_TRANSLATIONS"
  | "CONTROL_DEVICE"

export type SocketNotificationsBackend =
  | "CONTROL_MODULES"
  | "REGISTER_NOTIFICATIONS"
  | "LOG2_CONSOLE"

export type TranslationKeys = 
  | "CONSOLE_USEWEB"
  | "TRANSLATOR_GLOBALERROR"
  | "CONSOLE_LISTENTO"

export type ControlModulesPayload = {
  tag: string
  payload: unknown
}

export type Config = {

}