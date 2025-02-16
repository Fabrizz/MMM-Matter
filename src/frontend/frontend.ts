/// <reference path="../types/magicmirror-module.d.ts" />
import type { Config } from '../types/module'
import Utils from './utils'

// @ts-expect-error __VERSION__ is replaced by Rollup
const MMTR_MODULE_VERSION: string = __VERSION__;

Module.register<Config>('MMM-Matter', {
  defaults: {
    matterLogLevel: "warn",
    matterLogFormat: "ansi"
  },

  getScripts() { return [] },
  getStyles() { return [] },

  getTranslations() {
    return {
      es: 'translations/es.json',
      en: 'translations/en.json',
    }
  },

  getDom: function () {
    const d = document.createElement("div");
    d.id = "MTTR-NOTIFICATIONS";
    d.append(
      document.createComment(`MMM-MTTR Version: ${this.VERSION}`),
      document.createComment("MMM-Matter by Fabrizz | https://github.com/Fabrizz/MMM-Matter")
    );
    return d;
  },

  start() {
    Utils.MatterLogger.badge();
    this.VERSION = MMTR_MODULE_VERSION || "";
    this.backendListensTo = new Set();
    this.translations = {};

    this.sendSocketNotification("FRONTEND_READY", {
      matterLogFormat: this.config.matterLogFormat,
      matterLogLevel: this.config.matterLogLevel
    });
  },

  socketNotificationReceived: function (tag, payload) {
    switch (tag) {
      case "CONTROL_MODULES":
        Utils.MatterLogger.debug("Received CONTROL_MODULES", payload); ////////////////////////////////////////////////////////////////////////////////////////////////////
        this.sendNotification(payload.tag as string, payload.payload);
        break
      case "REGISTER_NOTIFICATIONS":
        Utils.MatterLogger.info(this.translate("CONSOLE_LISTENTO"), payload);
        (payload as Array<string>).forEach(n => this.backendListensTo.add(n));
        break
    }
  },

  notificationReceived: function (notification: string, payload: unknown, sender: Module.ModuleProperties<any>) {
    switch (notification) {
      case "ALL_MODULES_STARTED":
        Utils.MatterLogger.info(`${this.translate("CONSOLE_USEWEB")} | ${new URL("/matter", window.location.href).href} ←`);
        this.sendSocketNotification("FRONTEND_TRANSLATIONS", this.getTranslationsFromGlobal());
        break
    }
    if (this.backendListensTo.has(notification)) {
      Utils.MatterLogger.debug("Notification received to be resent", { tag: notification, payload, sender }); ////////////////////////////////////////////////////////////////////////////////////////////////////
      this.sendSocketNotification("NOTIFICATION_FORBACKEND", { tag: notification, payload, sender });
    }
  },

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getTranslationsFromGlobal: function () {
    let translations = {};
    try {
      translations = globalThis.Translator.translations["MMM-Matter"]
    } catch (error) {
      Utils.MatterLogger.error(this.translate("TRANSLATOR_GLOBALERROR"), error);
    }
    return translations;
  }

})