/// <reference types="node" />
/// <reference types="express" />

// Custom types for MagicMirror Matter module, extended for this module, may interfer when developing other module
// From https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/magicmirror-module/index.d.ts

/** Magic Mirror Module
 *  @see https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/magicmirror-module/index.d.ts
 */
declare namespace Module {
  /* tslint:disable:no-unnecessary-generics */
  function register<T>(
    moduleName: string,
    moduleProperties: ThisType<NonNullable<ModuleProperties<T>>> & Partial<ModuleProperties<T>>,
  ): void;

  interface ModuleProperties<T> {
    readonly name: string;
    readonly identifier: string;
    readonly hidden: boolean;
    readonly data: { classes: string; file: string; path: string; header: string; position: string };
    readonly lockStrings: string[];
    config: T;
    defaults: T;
    requiresVersion: string;

    /** MMM-Matter Module version */
    VERSION: string;
    /** What MM2 should be resent to the backend */
    backendListensTo: Set<string>;
    /** All the translations for the backend */
    translations: Partial<Record<TranslationKeys, string>>;
    /** Returns the complete translation object, but from the window object and not directly from MM2 */
    getTranslationsFromGlobal: () => Partial<Record<TranslationKeys, string>>;

    // Subclassable methods
    init: () => void;
    loaded: (callback?: () => void) => void;
    start: () => void;
    getScripts: () => string[];
    getStyles: () => string[];
    getTranslations: () => { [key: string]: string };
    getTemplate: () => string;
    getTemplateData: () => any;
    getDom: () => HTMLElement;
    getHeader: () => string;
    notificationReceived: (notification: string, payload: any, sender: ModuleProperties<any>) => void;
    socketNotificationReceived: (notification: SocketNotificationsBackend, payload: any) => void;
    suspend: () => void;
    resume: () => void;

    // Instance methods
    readonly file: (filename: string) => string;
    readonly updateDom: (speed?: number) => void;
    readonly sendNotification: (notification: string, payload: any) => void;
    readonly sendSocketNotification: (notification: SocketNotificationsFrontend, payload: any) => void;
    readonly hide: NonNullable<(speed?: number, callback?: () => void, options?: { lockString: string }) => void>;
    readonly show: (
      speed?: number,
      callback?: () => void,
      options?: { lockString?: string; force?: boolean; onError?: () => void },
    ) => void;
    readonly translate: (identifier: TranslationKeys, variables?: any) => string;
  }
}

/* tslint:disable:no-single-declare-module */
declare module "node_helper" {
  function create(object: ThisType<NonNullable<NodeHelperModule>> & Partial<NodeHelperModule>): void;

  interface NodeHelperModule {
    readonly name: string;
    readonly path: string;
    readonly expressApp: any;
    readonly io: any;
    readonly requiresVersion: string;

    /** MMM-Matter Module version */
    VERSION: string;
    /** If the frontend has already connected once */
    frontendReady: boolean;
    /** Module frontend clients for sending updates */
    apiEventsConsumers: Map<string, Express.Response>;
    /** Matter devices and control events */
    events: NodeJS.EventEmitter;
    /** Notifications to listen to in te frontend from other modules */
    frontendShouldListenTo: Set<string>;
    /** Translations synced from the frontend */
    translations: Partial<Record<TranslationKeys, string>>;

    /** Send an event to the module frontend */
    sendToClientEventStream: (event: string, payload?: any) => void;
    /** Send an event to the MM2 frontend */
    sendToMM2EventStream: (event: string, payload?: any) => void;

    // Subclassable methods
    init: () => void;
    start: () => void;
    stop: () => void;
    socketNotificationReceived: (notification: SocketNotificationsFrontend, payload: any) => void;
    sendSocketNotification: (notification: SocketNotificationsBackend, payload: any) => void;
  }
}

declare module "logger" {
  function debug(message?: any, ...optionalParams: any[]): void;
  function info(message?: any, ...optionalParams: any[]): void;
  function log(message?: any, ...optionalParams: any[]): void;
  function error(message?: any, ...optionalParams: any[]): void;
  function warn(message?: any, ...optionalParams: any[]): void;
  function group(groupTitle?: string, ...optionalParams: any[]): void;
  function groupCollapsed(groupTitle?: string, ...optionalParams: any[]): void;
  function groupEnd(): void;
  function time(timerName?: string): void;
  function timeEnd(timerName?: string): void;
  function timeStamp(timerName?: string): void;
}

declare const config: {
  address: string;
  customCss: string;
  electronOptions: any;
  ipWhitelist: string[];
  language: string;
  locale: string;
  modules: any[];
  port: number;
  timeFormat: 12 | 24;
  units: "metric" | "imperial";
  zoom: number;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

declare type SocketNotificationsFrontend =
  | "FRONTEND_READY"
  | "FRONTEND_TRANSLATIONS"
  | "NOTIFICATION_FORBACKEND"

declare type SocketNotificationsBackend =
  | "CONTROL_MODULES"
  | "REGISTER_NOTIFICATIONS"

declare type TranslationKeys =
  | "CONSOLE_USEWEB"
  | "TRANSLATOR_GLOBALERROR"
  | "CONSOLE_LISTENTO"