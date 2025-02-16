/// <reference path="../types/magicmirror-module.d.ts" />

import * as NodeHelper from 'node_helper'
import * as Log from 'logger'
import * as express from 'express';
import * as path from 'path';
import { EventEmitter } from 'events';
import { COLORS } from "./utils"
import { FrontendReadyPayload, NotificationForBackendPayload } from '../types/module';
import MatterServer from './matter';

import type NodePersist from 'node-persist';
/** Module storage, saves user-facing notification definitions */
const storage: NodePersist.LocalStorage = require('node-persist');
let storageInitiated = false;

const PATH_MODULE_STORE = path.join(__dirname, "/module-store");
const PATH_MATTER_STORE = path.join(__dirname, "/matter-store");
const PATH_CLIENT_DIST = path.join(__dirname, "client", "dist");

// @ts-expect-error __VERSION__ is replaced by Rollup
const MODULE_VERSION: string = __VERSION__;
const MODULE_TAG = `${COLORS.reset}[${COLORS.FG.magenta}MMM-Matter${COLORS.reset}] (NodeHelper)`;

storage.init({ dir: PATH_MODULE_STORE }).then(async () => {
  Log.info(`${MODULE_TAG} Module store initiated. ${COLORS.FG.gray}Path: ${PATH_MODULE_STORE}${COLORS.reset}`);

  const isFirstSession = await storage.getItem("isFirstSession");
  if (isFirstSession === undefined) { await storage.setItem("isFirstSession", true) }
  storageInitiated = true;
});

module.exports = NodeHelper.create({
  start() {
    Log.log(`${MODULE_TAG} ${COLORS.FG.black}${COLORS.BG.white} ⠖ MMM-Matter by Fabrizz ${COLORS.reset} Node helper loaded.`);

    //////////////////////////////////////// Declarations
    this.VERSION = MODULE_VERSION || "";
    this.frontendReady = false;
    this.apiEventsConsumers = new Map();
    this.events = new EventEmitter();
    this.translations = {};
    this.matterServer = null;

   //////////////////////////////////////// Api routes
    const router = express.Router();
    const apiRouter = express.Router();

    apiRouter.route("/version").get((q, r) => { r.send(this.VERSION) });
    apiRouter.route("/paths").get((q, r) => { r.send({ PATH_MODULE_STORE, PATH_MATTER_STORE, PATH_CLIENT_DIST }) });
    apiRouter.route("/translations").get((q, r) => { r.send(this.translations) });
    apiRouter.route("/store").get(async (q, r) => { r.send(await storage.keys()) });
    apiRouter.route("/store/:key").get(async (q, r) => { r.send(await storage.getItem(q.params.key)) });

    apiRouter.route("/state/:deviceId").get((q, r) => {
        r.send({ data: "test", ts: Date.now() });
      })

    apiRouter.get("/events", async (req, res) => {
      res.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });
      res.flushHeaders();
      res.write("retry: 10000\n\n");

      const clientId = Date.now().toString(16);
      this.apiEventsConsumers.set(clientId, res);
      res.on("close", () => this.apiEventsConsumers.delete(clientId));
    });

    router.use("/", express.static(PATH_CLIENT_DIST));
    router.use("/api", apiRouter);
    this.expressApp.use("/matter", router);
    Log.info(`${MODULE_TAG} Started frontend. ${COLORS.FG.gray}Build path: ${PATH_CLIENT_DIST}${COLORS.reset}`);
  },

  socketNotificationReceived: async function (notification: SocketNotificationsFrontend, payload: unknown) {
    switch (notification) {
      case "FRONTEND_READY":
        if (this.frontendReady) {
          Log.info(`${MODULE_TAG} Frontend has been reloaded.`);
        } else {
          this.frontendReady = true;
          this.matterServer = new MatterServer(
            storage, 
            PATH_MATTER_STORE,
            (payload as FrontendReadyPayload).matterLogLevel,
            (payload as FrontendReadyPayload).matterLogFormat
          );
          this.sendToClientEventStream("FRONTEND_READY");
        }
        break;
      case "FRONTEND_TRANSLATIONS":
        this.translations = payload;
        this.sendToClientEventStream("FRONTEND_TRANSLATIONS", this.translations);
        break
      case "NOTIFICATION_FORBACKEND":
        Log.debug("NOTIFICATION_FORBACKEND", `__${(payload as NotificationForBackendPayload).tag} \n`, JSON.stringify(payload)); // <-------------
        this.events.emit(`__${(payload as NotificationForBackendPayload).tag}`, payload as NotificationForBackendPayload);
        break
    }
  },

  sendToMM2EventStream(tag, payload = {}) {
    this.sendToClientEventStream("CONTROL_MODULES" as SocketNotificationsBackend, { tag, payload });
    this.sendSocketNotification("CONTROL_MODULES", { tag, payload });
  },

  sendToClientEventStream(tag, payload = {}) {
    this.apiEventsConsumers.forEach((res: express.Response) => 
      res.write(`data: ${JSON.stringify({ tag, payload })}\n\n`));
  }

})
