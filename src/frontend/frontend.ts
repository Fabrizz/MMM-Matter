import type { Config } from '../types/config'
import type { ControlModulesPayload } from '../types/events'
import Utils from './matterFrontendUtils'

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
    Utils.MatterLogger.info("Starting MMM-Matter");
    this.sendSocketNotification("FRONTEND_READY", {});
  },

  socketNotificationReceived: function (tag: string, payload: unknown) {
    switch (tag) {
      case "CONTROL_MODULES":
        Utils.MatterLogger.info("Received CONTROL_MODULES", payload as ControlModulesPayload);
        this.sendNotification((payload as ControlModulesPayload).tag, (payload as ControlModulesPayload).payload);
        break
    }
  },

})