import should from "should";
import fs from "fs";
import path from "path";
import running from "why-is-node-running";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.dirname(__dirname);
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

    after(()=>{
      Object.keys(TEST_SERVERS).forEach(port=>{
        logger.info(`Closing test server on port:${port}`);
        let scv = TEST_SERVERS[port];
        scv.httpServer.close();
      });
    });

    function sleep(ms = 600) {
      // The testing server takes a while to wakeup
      // and will report 404 until it's ready
      return new Promise((r) => setTimeout(() => r(), ms));
    }

    async function testServer(args={}) {
      let { port, protocol="http" } = args;
      port = port || (protocol === "https" ? 443 : 3000);
      let scv = TEST_SERVERS[port];
      
      if (scv == null) {
        args = Object.assign({port}, args);
        TEST_SERVERS[port] = scv = new ScvServer(args);
        should(scv).instanceOf(ScvServer);
        should(await scv.initialize()).equal(scv);
        should(scv).properties({
          initialized:true,
          port,
          protocol,
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

    it("default ctor()", async()=>{ 
      let port = 80;
      let scv = new ScvServer();
      should(scv).instanceOf(ScvServer);
      should(scv).properties({
        port,
        apiUrl: "http://suttacentral.net/api",
        appDir: path.dirname(__dirname),
        initialized: undefined,
        protocol: "http",
        sslPath: path.join(APP_DIR, "local", "ssl"),
      });
    })
    it("custom ctor()", async()=>{ 
      let port = 3000;
      let appDir = "testAppDir";
      let distDir = "testDistDir";
      let apiUrl = "http://apiUrl";
      let app = "testApp";
      let scApi = "testScApi";
      let protocol = "https";
      let sslPath = "testSSLPath";
      let scv = new ScvServer({
        apiUrl,
        app,
        appDir,
        distDir,
        port,
        protocol,
        scApi,
        sslPath,
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
        sslPath,
      });

      // injected properties are not enumerable
      should(scv.app).equal(app);
      should(scv.scApi).equal(scApi);
    })
    it("TESTTESTcustom ctor() protocol and port", async()=>{ 
      let appDir = "testAppDir";
      let distDir = "testDistDir";
      let apiUrl = "http://apiUrl";
      let app = "testApp";
      let scApi = "testScApi";
      let protocol = "https";
      let sslPath = "testSSLPath";
      let scv = new ScvServer({
        apiUrl,
        app,
        appDir,
        distDir,
        protocol,
        scApi,
        sslPath,
      });
      should(scv).instanceOf(ScvServer);

      // configured properties are enumerable
      should.deepEqual(Object.assign({}, scv), {
        apiUrl,
        appDir,
        distDir,
        port: 443,
        protocol,
        initialized: undefined,
        sslPath,
      });

      // injected properties are not enumerable
      should(scv.app).equal(app);
      should(scv.scApi).equal(scApi);
    })
    it("GET /test", async()=>{ 
      //logger.logLevel = 'info';
      let scv = await testServer();
      var res = await supertest(scv.app)
        .get('/test')
        .set('Accept', 'application/json')
        .expect(200)
        .expect("Content-Type", /json/)
        .expect({test:"TEST OK"});
    })
    it("GET /favicon", async()=>{ 
      let scv = await testServer();
      var res = await supertest(scv.app)
        .get('/favicon.ico')
        .expect(200)
        .expect("Content-Type", /image/)
    })

    it("GET /index.html", async()=>{ 
      let scv = await testServer();
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
    it("TESTTESTGET SSL /index.html", async()=>{ 
      let port = 3443;
      let sslPath = path.join(APP_DIR, 'test', 'ssl');
      let scv = await testServer({protocol: 'https', port, sslPath});
      let certificate = fs.readFileSync(path.join(sslPath, 'server.crt'));
      let privateKey = fs.readFileSync(path.join(sslPath, 'server.key'));
      let indexUrl = '/scv/index.html';
      await supertest(scv.app).get(indexUrl)
        .trustLocalhost()
        .key(privateKey)
        .cert(certificate)
        .expect(200)
        .expect("Content-Type", /html/);
    })

  });
