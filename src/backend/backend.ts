/// <reference path="../types/magicmirror-module.d.ts" />

import * as NodeHelper from 'node_helper'
import * as Log from 'logger'
import * as express from 'express';
import * as path from 'path';
import { EventEmitter } from 'events';
import { COLORS } from "./utils"
import { FrontendReadyPayload, NotificationForBackendPayload } from '../types/module';
import { MatterServer } from './matter';

import type NodePersist from 'node-persist';
/** Module storage, saves user-facing notification definitions */
const storage: NodePersist.LocalStorage = require('node-persist');

const PATH_MODULE_STORE = path.join(__dirname, "/module-store");
const PATH_MATTER_STORE = path.join(__dirname, "/matter-store");
const PATH_CLIENT_DIST = path.join(__dirname, "client", "dist");

// @ts-expect-error __VERSION__ is replaced by Rollup
const MODULE_VERSION: string = __VERSION__;
const MODULE_TAG = `${COLORS.reset}[${COLORS.FG.magenta}MMM-Matter${COLORS.reset}] (NodeHelper)`;

storage.init({ dir: PATH_MODULE_STORE }).then(async () => {
  Log.info(`${MODULE_TAG} Module store initiated. ${COLORS.FG.gray}Path: ${PATH_MODULE_STORE}${COLORS.reset}`);

  //const devices = await storage.getItem("isFirstSession");
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
            (x, y) => this.sendToClientEventStream(x, y),
            (x, y) => this.sendSocketNotification(x, y),
            this.events,
            storage, 
            PATH_MATTER_STORE,
            (payload as FrontendReadyPayload).matterLogLevel,
            (payload as FrontendReadyPayload).matterLogFormat,
            MODULE_VERSION
          );

          await this.matterServer.createServerNode();

          await this.matterServer.addDeviceToBridge({
            id: "onofftest",
            matter: {
              type: "switch.onoff",
              nodeLabel: "Test Switch",
              productName: "Test Switch",
              productLabel: "Test Switch",
              serialNumber: "1234567890",
            },
            behavior: {
              setOnWithNotification: "TEST_SET_ON",
              setOffWithNotification: "TEST_SET_OFF",
              onOnSend: "TEST_ON",
              onOffSend: "TEST_OFF",
            },
            description: {
              isUserDefined: true,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }
          })

          await this.matterServer.startServerNode()

          
          
        }
        break;
      case "FRONTEND_TRANSLATIONS":
        this.translations = payload;
        this.sendToClientEventStream("RELOAD_FRONTEND");
        break
      case "EXTERNAL_CONTROL":
        Log.debug("NOTIFICATION_FORBACKEND", `__${(payload as NotificationForBackendPayload).tag} \n`, JSON.stringify(payload)); // <-------------
        this.events.emit(`__${(payload as NotificationForBackendPayload).tag}`, payload as NotificationForBackendPayload);
        this.sendToClientEventStream("EXTERNAL_CONTROL", payload as NotificationForBackendPayload);
        break
      case "EXTERNAL_SUGGESTION":
        Log.debug("EXTERNAL_SUGGESTION", payload);
        break
    }
  },

  sendToClientEventStream(tag, payload = {}) {
    this.apiEventsConsumers.forEach((res: express.Response) => 
      res.write(`data: ${JSON.stringify({ tag, payload })}\n\n`));
  },
})
