import * as NodeHelper from 'node_helper'
import * as Log from 'logger'
import * as express from 'express';
import * as path from 'path';
import { EventEmitter } from 'events';
import { SocketNotificationsBackend, SocketNotificationsFrontend } from '../types/module';

const PATH_MATTER_STORAGE = path.join(__dirname, "/matter-store");
const PATH_CLIENT_DIST = path.join(__dirname, "client", "dist");

module.exports = NodeHelper.create({
  start() {
    Log.log("[\x1b[35mMMM-Matter\x1b[0m] by Fabrizz >> Node helper loaded.");

    /**************************** Declarations */
    this.frontendReady = false;
    this.apiEventsConsumers = []
    this.events = new EventEmitter();
    this.frontendShouldListenTo = new Set();
    this.translations = {};

    /**************************** Api routes */
    const router = express.Router();

    router.route("/api/state/:deviceId")
      .get((q, r) => {
        r.send({ data: "test", tsr: Date.now(), via: "MMM-MATTER by Fabrizz" });
      })

    router.get("/api/events", async (req, res) => {
      res.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });
      res.flushHeaders();
      res.write("retry: 10000\n\n");

      const clientId = Date.now().toString(16);
      this.apiEventsConsumers.push({ id: clientId, res });
      res.on("close", () => 
        this.apiEventsConsumers = this.apiEventsConsumers.filter((client: { id: string, res: express.Response }) => client.id !== clientId)
      );
    });

    router.use("/", express.static(PATH_CLIENT_DIST));
    Log.info("[\x1b[35mMMM-Matter\x1b[0m] Serving frontend from: " + PATH_CLIENT_DIST);
    this.expressApp.use("/matter", router);
  },

  socketNotificationReceived: async function (notification: SocketNotificationsFrontend, payload: unknown) {
    switch (notification) {
      case "FRONTEND_READY":
        if (this.frontendReady) {
          Log.info("[\x1b[35mMMM-Matter\x1b[0m] MM2 FRONTEND >> Frontend reload detected.");
        } else {
          this.frontendReady = true;
          
          // START MATTER SERVER
          // START MATTER SERVER
          // START MATTER SERVER

          Log.info("[\x1b[35mMMM-Matter\x1b[0m] Starting Matter server, saving data in: " + PATH_MATTER_STORAGE);
          this.sendToClientEventStream("FRONTEND_READY");
          this.sendSocketNotification("REGISTER_NOTIFICATIONS" as SocketNotificationsBackend, [...this.frontendShouldListenTo]);
        }
        break;
      case "FRONTEND_TRANSLATIONS":
        this.translations = payload;
        this.sendToClientEventStream("FRONTEND_TRANSLATIONS", this.translations);
        break
      case "CONTROL_DEVICE":
        Log.debug("CONTROL_DEVICE", payload);
        break
    }
  },

  sendToMM2EventStream(tag: string, payload: unknown = {}) {
    this.sendToClientEventStream("CONTROL_MODULES" as SocketNotificationsBackend, { tag, payload });
    this.sendSocketNotification("CONTROL_MODULES" as SocketNotificationsBackend, { tag, payload });
  },

  sendToClientEventStream(tag: string, payload: unknown = {}) {
    this.apiEventsConsumers.forEach((client: { id: string, res: express.Response }) => {
      client.res.write(`data: ${JSON.stringify({ tag, payload })}\n\n`);
    });
  }

})
