import type { Config, ControlModulesPayload, SocketNotificationsBackend, SocketNotificationsFrontend } from '../types/module'
import Utils from './utils'

Module.register<Config>('MMM-Matter', {
  defaults: {
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
    const md = document.createComment(`MMM-MTTR Version: ${this.VERSION}`);
    const mv = document.createComment("MMM-Matter by Fabrizz | https://github.com/Fabrizz/MMM-Matter");
    d.append(md, mv);
    return d;
  },

  start() {
    Utils.MatterLogger.badge();
    this.VERSION = "0.1.0";
    this.backendListensTo = new Set();
    this.sendSocketNotification("FRONTEND_READY", {});
  },

  socketNotificationReceived: function (tag: SocketNotificationsBackend, payload: unknown) {
    switch (tag) {
      case "CONTROL_MODULES":
        Utils.MatterLogger.debug("Received CONTROL_MODULES", payload); ////////////////////////////////////////////////////////////////////////////////////////////////////
        this.sendNotification((payload as ControlModulesPayload).tag, (payload as ControlModulesPayload).payload);
        break
      case "REGISTER_NOTIFICATIONS":
        Utils.MatterLogger.info(this.translate("CONSOLE_LISTENTO"), payload);
        (payload as Array<String>).forEach(n => (this.backendListensTo as Set<String>).add(n));
        break
      case "LOG2_CONSOLE":
        break
    }
  },

  notificationReceived: function (notification: string, payload: unknown, sender: Module.ModuleProperties<any>) {
    switch (notification) {
      case "ALL_MODULES_STARTED":
        Utils.MatterLogger.info(this.translate("CONSOLE_USEWEB") + ": " + new URL("/matter", window.location.href).href);
        this.sendSocketNotification("FRONTEND_TRANSLATIONS", this.getTranslationsFromGlobal());
        break
    }
    if ((this.backendListensTo as Set<String>).has(notification)) {
      Utils.MatterLogger.debug("Notification received to be resent", { notification, payload, sender }); ////////////////////////////////////////////////////////////////////////////////////////////////////
      this.sendSocketNotification("CONTROL_DEVICE" as SocketNotificationsFrontend, { tag: notification, payload, sender });
    }
  },

  /**********************************************************************************************************/

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