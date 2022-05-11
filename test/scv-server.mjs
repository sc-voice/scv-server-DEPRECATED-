import should from "should";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import express from "express";
import supertest from "supertest";
import { logger } from "log-instance";
logger.logLevel = 'warn';

import { 
  ScvServer,
} from "../index.mjs";

typeof describe === "function" &&
  describe("scv-server", function() {
    this.timeout(10*1000);
    console.log('ScvServer', ScvServer);

    function sleep(ms = 600) {
      // The testing server takes a while to wakeup
      // and will report 404 until it's ready
      return new Promise((r) => setTimeout(() => r(), ms));
    }

    it("TESTTESTdefault ctor()", async()=>{ 
      let port = 80;
      let scv = new ScvServer();
      should(scv).instanceOf(ScvServer);
      should(scv).properties({
        port,
        apiUrl: "http://suttacentral.net/api",
        appDir: path.dirname(__dirname),
        initialized: undefined,
        protocol: "http",
      });
    })
    it("TESTTESTcustom ctor()", async()=>{ 
      // configured
      let port = 3000;
      let appDir = "testAppDir";
      let apiUrl = "http://apiUrl";
      let app = "testApp";
      let scApi = "testScApi";
      let protocol = "https";
      let rbServer = "testRbServer";
      let scv = new ScvServer({
        port,
        appDir,
        apiUrl,
        app,
        protocol,
        scApi,
        rbServer,
      });
      should(scv).instanceOf(ScvServer);
      should(scv).properties({
        port,
        apiUrl,
        appDir,
        initialized: undefined,
      });

      // injected
      should(scv.app).equal(app);
      should(scv.scApi).equal(scApi);
      //TBD should(scv.rbServer).equal(rbServer);
    })
    it("TESTTESTinitialize()", async()=>{ 
      let port = 3000;
      let scv = new ScvServer({port});
      should(scv).instanceOf(ScvServer);
      logger.logLevel = "info";
      should(await scv.initialize()).equal(scv);
      should(scv).properties({
        initialized:true,
        port,
        apiUrl: 'http://suttacentral.net/api',
      });

      let { app } = scv;
      should(app).not.equal(undefined);
      let { httpServer } = scv;
      should(httpServer.address().port).equal(port);
      should(httpServer.listening).equal(true);

      var res = await supertest(app)
        .get('/test')
        .set('Accept', 'application/json');

      should(res.status).equal(200);
      should.deepEqual(res.body, { test: "TEST OK" });
      console.log(res.headers);
      should(res.headers["content-type"]).match(/json/);
    })

  });
