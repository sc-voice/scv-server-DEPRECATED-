import should from "should";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.dirname(__dirname);
import express from "express";
import bodyParser from "body-parser";
import supertest from "supertest";
import { logger } from "log-instance";
import ResourceMethod from '../src/resource-method.cjs';
import ScvServer from '../src/scv-server.mjs';

logger.logLevel = 'warn';

typeof describe === "function" &&
  describe("scv-server", function() {
    const msStart = Date.now();
    const TEST_SERVERS = {};
    this.timeout(5*1000);

    after(()=>{
      Object.keys(TEST_SERVERS).forEach(port=>{
        logger.info(`Closing test server on port:${port}`);
        let scv = TEST_SERVERS[port];
        scv.close();
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
        name: "scv",
        port,
        apiUrl: "http://suttacentral.net/api",
        appDir: path.dirname(__dirname),
        initialized: undefined,
        protocol: "http",
        sslPath: path.join(APP_DIR, "local", "ssl"),
      });
      should(typeof scv.app).equal('function'); // express instance
    })
    it("custom ctor()", async()=>{ 
      let port = 3000;
      let name = "testCustom";
      let appDir = "testAppDir";
      let distDir = "testDistDir";
      let apiUrl = "http://apiUrl";
      let app = "testApp";
      let scApi = "testScApi";
      let protocol = "https";
      let sslPath = "testSSLPath";
      let scv = new ScvServer({
        name,
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
        name,
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
    it("custom ctor() protocol and port", async()=>{ 
      let appDir = "testAppDir";
      let distDir = "testDistDir";
      let apiUrl = "http://apiUrl";
      let app = "testApp";
      let scApi = "testScApi";
      let protocol = "https";
      let sslPath = "testSSLPath";
      let name = "TestHttps";
      let scv = new ScvServer({
        name,
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
        name,
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
    it("ScvServer() => express instance", async()=>{ 
      //logger.logLevel = 'info';
      let port = 3001;
      let scv = await new ScvServer({port}).initialize();
      let { app } = scv;
      let testPath = '/testExpress';
      let testResponse = { testExpress: 'TEST OK' };
      app.get(testPath, (req, res, next)=>{
        res.status(200).json(testResponse);
      });

      var res = await supertest(scv.app)
        .get(testPath)
        .set('Accept', 'application/json')
        .expect(200)
        .expect("Content-Type", /json/)
        .expect(testResponse);
      scv.close();
    })
    it("ScvServer() testColor", async()=>{ 
      //logger.logLevel = 'info';
      let name = "testColor";
      let testResponse = { [name]: 'blue' };
      let apiMethod = req => testResponse;
      let rm = new ResourceMethod("get", name, apiMethod);
      let port = 3001;
      let resourceMethods = [ rm ];
      let scv = new ScvServer({port, resourceMethods});
      should(scv.resourceMethods).equal(resourceMethods);
      await scv.initialize();
      let { app } = scv;
      var res = await supertest(app)
        .get(`/scv/${name}`)
        .set('Accept', 'application/json')
        .expect(200)
        .expect("Content-Type", /json/)
        .expect(testResponse);
      await scv.close();
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
    it("GET SSL /index.html", async()=>{ 
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
    it("GET port conflict", async()=>{ 
      //logger.logLevel = 'info';
      let port = 3001;
      let scv1 = new ScvServer({port});
      let scv2 = new ScvServer({port});
      await scv1.initialize();
      let eCaught;
      try { await scv2.initialize() } catch(e) { eCaught = e; }
      should(eCaught.message).match(/conflict with.*on active port:3001/);
      should(ScvServer.portMap).properties({[port]:scv1});
      await scv1.close();
      should(ScvServer.portMap[port]).equal(undefined);
      await scv2.initialize();
      should(ScvServer.portMap).properties({[port]:scv2});
      await scv2.close();
    })
    it("GET /scv/search/:pattern", async()=>{
      let scv = await testServer();
      let pattern = encodeURI(`root of suffering`);

      var maxResults = 5; // the default
      var url = `/scv/search/${pattern}`;
      var res = await supertest(scv.app).get(url)
        .expect(200)
        .expect("Content-Type", /application.json/);

      // Default results
      var { method, results, } = res.body;
      should(method).equal('phrase');
      should(results).instanceOf(Array);
      should(results.length).equal(maxResults);
      should.deepEqual(results.map(r => r.uid),[
        'sn42.11', 'mn105', 'mn1', 'sn56.21', 'mn116',
      ]);
      should.deepEqual(results.map(r => r.count),
        [ 5.091, 3.016, 2.006, 1.043, 1.01 ]);

      // custom results
      var maxResults = 3; // custom
      var url = `/scv/search/${pattern}?maxResults=${maxResults}`;
      var res = await supertest(scv.app).get(url)
        .expect(200)
        .expect("Content-Type", /application.json/);

      var { method, results, } = res.body;
      should(method).equal('phrase');
      should(results).instanceOf(Array);
      should(results.length).equal(3);
      should.deepEqual(results.map(r => r.uid),[
        'sn42.11', 'mn105', 'mn1',
      ]);
      should.deepEqual(results.map(r => r.count),
        [ 5.091, 3.016, 2.006  ]);

      await scv.close();
    })
    it("GET /scv/search/:pattern/:lang", async()=>{
      let scv = await testServer();
      let pattern = encodeURI(`wurzel des leidens`);
      let lang = 'de';
      let maxResults = 3; // custom
      var url = `/scv/search/${pattern}/${lang}?maxResults=${maxResults}`;
      var res = await supertest(scv.app).get(url)
        .expect(200)
        .expect("Content-Type", /application.json/);

      var { method, results, } = res.body;
      should(method).equal('phrase');
      should(results).instanceOf(Array);
      should(results.length).equal(3);
      should.deepEqual(results.map(r => r.uid),[
        'sn42.11', 'sn56.21', 'dn16',
      ]);

      await scv.close();
    })

  });
