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
    const TEST_SERVERS = {};
    this.timeout(10*1000);

    function sleep(ms = 600) {
      // The testing server takes a while to wakeup
      // and will report 404 until it's ready
      return new Promise((r) => setTimeout(() => r(), ms));
    }

    async function testServer(port = 3000) {
      let scv = TEST_SERVERS[port];
      
      if (scv == null) {
        TEST_SERVERS[port] = scv = new ScvServer({port});
        should(scv).instanceOf(ScvServer);
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
      }
      return scv;
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
      let port = 3000;
      let appDir = "testAppDir";
      let distDir = "testDistDir";
      let apiUrl = "http://apiUrl";
      let app = "testApp";
      let scApi = "testScApi";
      let protocol = "https";
      let scv = new ScvServer({
        apiUrl,
        app,
        appDir,
        distDir,
        port,
        protocol,
        scApi,
      });
      should(scv).instanceOf(ScvServer);

      // configured properties are enumerable
      should.deepEqual(Object.assign({}, scv), {
        apiUrl,
        appDir,
        distDir,
        port,
        protocol,
        initialized: undefined,
      });

      // injected properties are not enumerable
      should(scv.app).equal(app);
      should(scv.scApi).equal(scApi);
    })
    it("TESTTESTGET /test", async()=>{ 
      //logger.logLevel = 'info';
      let scv = await testServer(3000);
      var res = await supertest(scv.app)
        .get('/test')
        .set('Accept', 'application/json')
        .expect(200)
        .expect("Content-Type", /json/)
        .expect({test:"TEST OK"});
    })
    it("TESTTESTGET /favicon", async()=>{ 
      let scv = await testServer(3000);
      var res = await supertest(scv.app)
        .get('/favicon.ico')
        .expect(200)
        .expect("Content-Type", /image/)
    })

    it("TESTTESTGET /index.html", async()=>{ 
      let scv = await testServer(3000);
      let indexUrl = '/scv/index.html';
      let res = [
        await supertest(scv.app).get(indexUrl)
          .expect(200)
          .expect("Content-Type", /html/),
        await supertest(scv.app).get('/')
          .expect(302)
          .expect("Location", indexUrl),
        await supertest(scv.app).get('/scv')
          .expect(302)
          .expect("Location", indexUrl),
      ]
    })

  });
