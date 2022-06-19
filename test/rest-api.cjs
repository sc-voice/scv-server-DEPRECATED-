const supertest = require("supertest");

typeof describe === "function" &&
  describe("rest-api", function () {
    const should = require("should");
    const pkg = require("../package.json");
    const RestApi = require("../src/rest-api.cjs");
    const supertest = require("supertest");
    const express = require("express");
    const fs = require("fs");
    const path = require("path");
    const { exec } = require("child_process");
    const util = require("util");
    const { logger } = require("log-instance");
    const RbHash = require("../src/rb-hash.cjs");
    const testApp = express();
    const APPDIR = path.join(__dirname, '..');
    logger.level = "warn";
    function testRb(rootApp, name="test") {
      return rootApp.locals.restBundles.filter((ra) => ra.name === name)[0];
    }
    this.timeout(5 * 1000);

    class TestBundle extends RestApi {
      constructor(name, options = {}) {
        super(Object.assign({name}, options));
        let { handlers } = this;
        handlers.push(this.resourceMethod( "get", "color", this.getColor));
      }

      getColor(req, res, next) {
        return { color: "blue" };
      }
    }

    it("default ctor", ()=>{
      let ra = new RestApi();
      let appDir = APPDIR;
      should.deepEqual(Object.keys(ra).sort(), [
        "appDir",
        "name", 
      ]);
      should(ra.appDir).equal(appDir);
      should(ra.name).equal("test");
      should(ra.uribase).equal("/test");
    });
    it("RestApi can be extended", async()=>{
      var rootApp = express();
      let name = "testExtended";
      var tb = new TestBundle(name).bindExpress(rootApp);
      let res = await supertest(rootApp)
        .get(`/${name}/color`)
        .expect(200);

      should.deepEqual(res.body, { color: "blue", });
    });
    it("RestApi resources should be unique", ()=>{
      class TestBundle extends RestApi {
        constructor(name, options = {}) {
          super(Object.assign({name}, options));
          let { handlers } = this;
          handlers.push(this.resourceMethod( "get", "state", this.getState));
          handlers.push(this.resourceMethod( "get", "state", this.getState));
        }
      }
      var rootApp = express();
      should.throws(() => tb.bindExpress(rootApp));
    });
    it("RestApi returns 500 for bad responses", async()=>{
      class TestBundle extends RestApi {
        constructor(name, options = {}) {
          super(Object.assign({name}, options));
          let { handlers } = this;
          handlers.push(this.resourceMethod(
            "get", "bad-json", this.getBadJson));
        }
        getBadJson(req, res, next) {
          var badJson = {
            name: "circular",
          };
          badJson.self = badJson;
          return badJson;
        }
      }
      var rootApp = express();
      var tb = (new TestBundle("testBadJSON").bindExpress(rootApp));
      let logLevel = logger.logLevel;
      logger.logLevel = "error";
      try {
        logger.warn("Expected error (BEGIN)");
        let res = await supertest(rootApp) .get("/testBadJSON/bad-json")
        should(res.statusCode).equal(500);
        should(res.body.error).match(/Converting circular structure to JSON/);
      } finally {
        logger.warn("Expected error (END)");
        logger.logLevel = logLevel;
      }
    });
    it("diskusage", async () => {
      var execPromise = util.promisify(exec);
      var cmd = "df --total -B 1 /";
      var execOpts = {
        cwd: __dirname,
      };
      var res = await execPromise(cmd, execOpts);
      var stdout = res.stdout.split("\n");
      var stats = stdout[2].split(/\s+/);
      let used = Number(stats[2]);
      let avail = Number(stats[3]);
      let total = used + avail;
      let name="testDiskUsage";
      //console.log(`dbg diskusage`, {used, avail, total});

      let ra = new RestApi({ name, });
      let rootApp = express();
      ra.bindExpress(rootApp);
      should(testRb(rootApp, name)).equal(ra);
      var res = await ra.getIdentity();
      let prec = 10E6;
      should(Math.round(res.diskavail/prec)).equal(Math.round(avail/prec));
      should(Math.round(res.diskfree/prec)).equal(Math.round(avail/prec));
      should(Math.round(res.disktotal/prec)).equal(Math.round(total/prec));
      //console.log(`dbg getIdientity`, res);
    });
    it("GET /identity generates HTTP200 response", async()=>{
      let rootApp = express();
      let name = "testIdentity";
      let ra = new RestApi({ name});
      ra.bindExpress(rootApp, ra.testHandlers);
      should(testRb(rootApp, name)).equal(ra);
      let res = await supertest(rootApp)
        .get(`/${name}/identity`)
        .expect(200)
        .expect("content-type", /json/)
        .expect("content-type", /utf-8/)
      res.body.should.properties({
        name,
        package: pkg.name,
      });
      res.body.should.properties([
        "version",
        "hostname",
        "uptime",
        "loadavg",
        "totalmem",
        "freemem",
        "diskfree",
        "diskavail",
        "disktotal",
      ]);
      should(res.body.diskavail).below(res.body.diskfree + 1);
      should(res.body.diskfree).below(res.body.disktotal);
      should(res.body.totalmem).below(res.body.disktotal);
      res.body.version.should.match(/\d+.\d+.\d+/);
    });
    it("POST /echo => HTTP200 response with a Promise", async()=>{
      let rootApp = express();
      let name = "testEcho";
      let ra = new RestApi({ name });
      ra.bindExpress(rootApp, ra.testHandlers);
      var service = testRb(rootApp, name);
      ra.taskBag.length.should.equal(0);
      ra.taskBegin("testTask");
      ra.taskBag.length.should.equal(1);
      let echoJson = { greeting: "smile" }
      await supertest(rootApp)
        .post(`/${name}/echo`)
        .send(echoJson)
        .expect(200)
        .expect('content-type', /json/)
        .expect('content-type', /utf-8/)
        .expect(echoJson);
    });
    it("taskBegin/taskEnd", async()=>{
      let rootApp = express();
      let name = "testTask";
      let ra = new RestApi({ name });
      ra.bindExpress(rootApp, ra.testHandlers);
      ra.taskBag.length.should.equal(0);

      // Begin server task
      ra.taskBegin("testTask");
      ra.taskBag.length.should.equal(1);
      await supertest(rootApp).get(`/${name}/state`)
        .expect(200)
        .expect('content-type', /json/)
        .expect('content-type', /utf-8/)
        .expect({tasks:['testTask']});
      ra.taskBag.length.should.equal(1);
      ra.taskBag[0].should.equal("testTask");

      // End server task
      ra.taskEnd("testTask");
      ra.taskBag.length.should.equal(0);
      await supertest(rootApp).get(`/${name}/state`)
        .expect(200)
        .expect('content-type', /json/)
        .expect('content-type', /utf-8/)
        .expect({tasks:[]});
    });
    it("POST => HTTP500 response for thrown exception", async()=>{
      let name = "test500";
      let rootApp = express();
      let ra = new RestApi({ name });
      ra.bindExpress(rootApp, ra.testHandlers);
      let logLevel = logger.logLevel;
      logger.logLevel = "error";
      logger.warn("Expected error (BEGIN)");
      let res = await supertest(rootApp)
        .post(`/${name}/identity`)
        .send({ greeting: "whoa" })
        .expect(500)
        .expect('content-type', /json/)
        .expect('content-type', /utf-8/);
      logger.warn("Expected error (END)");
      logger.logLevel = logLevel;

      res.body.should.properties("error");
      res.body.error.should.match(/POST not supported/);
      res.body.error.should.match(/{"greeting":"whoa"}/);
    });
    it("kebab(id) => kebab case of id", function () {
      var kebab = (id) =>
        id
          .replace(/([A-Z])/g, "-$1")
          .toLowerCase()
          .replace(/^-/, "");
      kebab("XFooBar").should.equal("x-foo-bar");
      kebab("xFooBar").should.equal("x-foo-bar");
      kebab("abc").should.equal("abc");
      kebab("aBC").should.equal("a-b-c");
    });
    it("GET /app/stats/heap => v8.getHeapSpaceStatistics", async()=>{
      let rootApp = express();
      let ra = new RestApi({name:"test"});
      ra.bindExpress(rootApp, ra.testHandlers);
      let res = await supertest(rootApp)
        .get("/test/app/stats/heap")
        .expect(200)
      let { body:stats } = res;

      should(stats instanceof Array);
      should(stats.length).above(5);
      res.body.forEach((b) => {
        var mb = b.space_used_size / 10e6;
        logger.info(`heap used ${mb.toFixed(1)}MB ${b.space_name}`);
      });
    });
  });
