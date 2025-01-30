import * as NodeHelper from 'node_helper'
import * as Log from 'logger'
import * as express from 'express';
import * as path from 'path';
import { EventEmitter } from 'events';

const PATH_MATTER_STORAGE = path.join(__dirname, "/matter-store");
const PATH_CLIENT_DIST = path.join(__dirname, "client", "dist");

module.exports = NodeHelper.create({
  start() {
    Log.log("[\x1b[35mMMM-Matter\x1b[0m] by Fabrizz >> Node helper loaded.");

    /**************************** Declarations */
    this.frontendReady = false;
    this.apiEventsConsumers = []
    this.events = new EventEmitter();

    /**************************** Api routes */
    const router = express.Router();

    router.route("/api/state/:deviceId")
      .get((q, r) => {
        r.send({ data: "test", tsr: Date.now(), via: "MMM-MATTER by Fabrizz" });
      })

    router.route("/api/actions/:actionId")
      .get((q, r) => {
        r.send({ data: "test", tsr: Date.now(), via: "MMM-MATTER by Fabrizz" });
      })
      .post((q, r) => {
        r.send({ data: "test", tsr: Date.now(), via: "MMM-MATTER by Fabrizz" });
      })
      .put((q, r) => {
        r.send({ data: "test", tsr: Date.now(), via: "MMM-MATTER by Fabrizz" });
      })
      .delete((q, r) => {
        r.send({ data: "test", tsr: Date.now(), via: "MMM-MATTER by Fabrizz" });
      });

    router.route("/api/config")
      .get((q, r) => {
        r.send({ data: "test", tsr: Date.now(), via: "MMM-MATTER by Fabrizz" });
      })
      .post((q, r) => {
        r.send({ data: "test", tsr: Date.now(), via: "MMM-MATTER by Fabrizz" });
      })
      .put((q, r) => {
        r.send({ data: "test", tsr: Date.now(), via: "MMM-MATTER by Fabrizz" });
      });

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
        this.apiEventsConsumers = this.apiEventsConsumers.filter((client) => client.id !== clientId)
      );
    });

    router.use("/", express.static(PATH_CLIENT_DIST));
    this.expressApp.use("/matter", router);
  },

  socketNotificationReceived: async function (notification, payload) {
    switch (notification) {
      case "FRONTEND_READY":
        if (this.frontendReady) {
          Log.log("[\x1b[35mMMM-Matter\x1b[0m] MM2 FRONTEND >> Frontend reload detected.");
        } else {
          this.frontendReady = true;
          // START MATTER SERVER
          this.sendToMM2EventStream("SOME_DATA_ANASHE", { tsr: Date.now() });
        }
        break;
      case "CONTROL_MATTER":
        break;
    }
  },

  sendToMM2EventStream(tag: string, payload: unknown) {
    this.apiEventsConsumers.forEach((client: { id: string, res: express.Response }) => {
      client.res.write(`data: ${JSON.stringify({ tag: "CONTROL_MODULES", payload: { tag, payload } })}\n\n`);
    });
    this.sendSocketNotification("CONTROL_MODULES", { tag, payload });
  }

})
