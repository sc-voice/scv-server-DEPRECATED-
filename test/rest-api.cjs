const supertest = require("supertest");

typeof describe === "function" &&
  describe("rest-api", function () {
    const should = require("should");
    const pkg = require("../package.json");
    const jwt = require("jsonwebtoken");
    const RestApi = require("../src/rest-api.cjs");
    const supertest = require("supertest");
    const express = require("express");
    const fs = require("fs");
    const path = require("path");
    const { exec } = require("child_process");
    const util = require("util");
    const { logger } = require("log-instance");
    const RbHash = require("../src/rb-hash.cjs");
    const ResourceMethod = require("../src/resource-method.cjs");
    const APPDIR = path.join(__dirname, '..');
    const LOCAL = path.join(APPDIR, 'local');
    logger.level = "warn";
    function testRb(app, name="test") {
      return app.locals.restApis.filter((ra) => ra.name === name)[0];
    }
    const TEST_ADMIN = {
      username: "test-admin",
      isAdmin: true,
    };

    this.timeout(5 * 1000);

    class TestApi extends RestApi {
      constructor(name, options = {}) {
        super(Object.assign({name}, options));
        let { resourceMethods } = this;
        resourceMethods.push(new ResourceMethod( "get", "color", 
          (req,res,next)=>this.getColor(req,res,next)));
      }

      getColor(req, res, next) {
        return { color: "blue" };
      }
    }

    async function testAuthGet(opts={}) {
      let {
        app,
        url,
        contentType='application/json', 
        accept=contentType,
      } = opts;
      should(app==null).equal(false);
      should(url==null).equal(false);
    
      var token = jwt.sign(TEST_ADMIN, RestApi.JWT_SECRET);
      return supertest(app).get(url)
        .set("Authorization", `Bearer ${token}`)
        .set('Content-Type', contentType)
        .set('Accept', accept)
        .expect('Content-Type', new RegExp(contentType))
        ;
    }

    function testAuthPost(opts={}) {
      let {
        app,
        url,
        data,
        contentType='application/json', 
        accept=contentType,
      } = opts;
      var token = jwt.sign(TEST_ADMIN, RestApi.JWT_SECRET);
      return supertest(app).post(url)
        .set("Authorization", `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send(data);
    }

    function testHandlers(restApi) {
      return [
        new ResourceMethod("get", "identity", 
          (req,res,next)=>restApi.getIdentity(req,res,next)),
        new ResourceMethod("get", "state", 
          (req,res,next)=>restApi.getState(req,res,next)),
        new ResourceMethod("get", "app/stats/:stat", 
          (req,res,next)=>restApi.getAppStats(req,res,next)),
        new ResourceMethod("post", "identity", 
          (req,res,next)=>restApi.postIdentity(req,res,next)),
        new ResourceMethod("post", "echo", 
          (req,res,next)=>restApi.postEcho(req,res,next)),
      ];
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
      var app = express();
      let name = "testExtended";
      var tb = new TestApi(name).bindExpress(app);
      let res = await supertest(app)
        .get(`/${name}/color`)
        .expect(200);

      should.deepEqual(res.body, { color: "blue", });
    });
    it("RestApi resources should be unique", ()=>{
      class TestApi extends RestApi {
        constructor(name, options = {}) {
          super(Object.assign({name}, options));
          let { resourceMethods } = this;
          resourceMethods.push(new ResourceMethod( "get", "state", 
            (req,res,next)=>this.getState(req,res,next)));
          resourceMethods.push(new ResourceMethod( "get", "state", 
            (req,res,next)=>this.getState(req,res,next)));
        }
      }
      var app = express();
      should.throws(() => tb.bindExpress(app));
    });
    it("RestApi returns 500 for bad responses", async()=>{
      class TestApi extends RestApi {
        constructor(name, options = {}) {
          super(Object.assign({name}, options));
          let { resourceMethods } = this;
          this.rm = new ResourceMethod("get", "bad-json", 
            (req,res,next)=>this.getBadJson(req,res,next));
          resourceMethods.push(this.rm);
          this.rm.logLevel = 'error'; // suppress error during test
        }
        getBadJson(req, res, next) {
          var badJson = {
            name: "circular",
          };
          badJson.self = badJson;
          return badJson;
        }
      }
      var app = express();
      var tb = (new TestApi("testBadJSON").bindExpress(app));
      let res = await supertest(app) .get("/testBadJSON/bad-json")
      should(res.body.error).match(/Converting circular structure to JSON/);
      should(res.statusCode).equal(500);
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
      let app = express();
      ra.bindExpress(app);
      should(testRb(app, name)).equal(ra);
      var res = await ra.getIdentity();
      let prec = 10E6;
      should(Math.round(res.diskavail/prec)).equal(Math.round(avail/prec));
      should(Math.round(res.diskfree/prec)).equal(Math.round(avail/prec));
      should(Math.round(res.disktotal/prec)).equal(Math.round(total/prec));
      //console.log(`dbg getIdientity`, res);
    });
    it("GET /identity generates HTTP200 response", async()=>{
      let app = express();
      let name = "testIdentity";
      let ra = new RestApi({ name});
      ra.bindExpress(app, testHandlers(ra));
      should(testRb(app, name)).equal(ra);
      let res = await supertest(app)
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
      let app = express();
      let name = "testEcho";
      let ra = new RestApi({ name });
      ra.bindExpress(app, testHandlers(ra));
      var service = testRb(app, name);
      ra.taskBag.length.should.equal(0);
      ra.taskBegin("testTask");
      ra.taskBag.length.should.equal(1);
      let echoJson = { greeting: "smile" }
      await supertest(app)
        .post(`/${name}/echo`)
        .send(echoJson)
        .expect(200)
        .expect('content-type', /json/)
        .expect('content-type', /utf-8/)
        .expect(echoJson);
    });
    it("taskBegin/taskEnd", async()=>{
      let app = express();
      let name = "testTask";
      let ra = new RestApi({ name });
      ra.bindExpress(app, testHandlers(ra));
      ra.taskBag.length.should.equal(0);

      // Begin server task
      ra.taskBegin("testTask");
      ra.taskBag.length.should.equal(1);
      await supertest(app).get(`/${name}/state`)
        .expect(200)
        .expect('content-type', /json/)
        .expect('content-type', /utf-8/)
        .expect({tasks:['testTask']});
      ra.taskBag.length.should.equal(1);
      ra.taskBag[0].should.equal("testTask");

      // End server task
      ra.taskEnd("testTask");
      ra.taskBag.length.should.equal(0);
      await supertest(app).get(`/${name}/state`)
        .expect(200)
        .expect('content-type', /json/)
        .expect('content-type', /utf-8/)
        .expect({tasks:[]});
    });
    it("POST => HTTP500 response for thrown exception", async()=>{
      let name = "test500";
      let app = express();
      let ra = new RestApi({ name });
      let msg = `${name} expected error`;
      let rm = new ResourceMethod("post", "throwMe", (req,res)=>{
        throw new Error(msg);
      });
      ra.bindExpress(app, [rm]);
      rm.logLevel = "error"; // suppress error log 
      let res = await supertest(app)
        .post(`/${name}/throwMe`)
        .send({ greeting: "whoa" })
        .expect(500)
        .expect('content-type', /json/)
        .expect('content-type', /utf-8/);

      res.body.should.properties("error");
      res.body.error.should.match(msg);
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
      let app = express();
      let ra = new RestApi({name:"test"});
      ra.bindExpress(app, testHandlers(ra));
      let res = await supertest(app)
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
    it("GET /auth/secret => hello", async()=>{
      let app = express();
      let name = "testAuthGet";
      let ra = new RestApi({name});
      let theSecret =  {secret: "hello"};
      let authPath = "auth/secret";
      var url = `/${name}/${authPath}`;
      let authMethod = new ResourceMethod("get", authPath, (req,res) => {
        ra.requireAdmin(req, res);
        return theSecret;
      });
      ra.bindExpress(app, [authMethod]);

      // authorized
      var resAuth = await testAuthGet({url, app});
      resAuth.statusCode.should.equal(200);
      should.deepEqual(resAuth.body, theSecret);

      // unauthorized
      let eCaught;
      let errMsg = `requireAdmin() GET /${authPath} ` +
        `user:unidentified-user => UNAUTHORIZED`;
      ra.logLevel = 'error';
      authMethod.logLevel = 'error';
      let resPublic = await supertest(app).get(url)
        .expect(401)
        .expect("content-type", /application\/json/)
        .expect({ error: errMsg });
    });
    it("POST /auth/secret => hello", async()=>{
      let app = express();
      let name = "testAuthPost";
      let ra = new RestApi({name});
      let authPath = "auth/secret";
      let url = `/${name}/${authPath}`;
      let authMethod = new ResourceMethod("post", authPath, (req, res)=>{
        ra.requireAdmin(req, res);
        return req.body;
      });
      ra.bindExpress(app, [authMethod]);

      let data = {secret: "hello"};
      let resAuth = await testAuthPost({url, app, data});
      resAuth.statusCode.should.equal(200);
      should.deepEqual(resAuth.body, data);

      ra.logLevel = 'error';
      authMethod.logLevel = 'error';
      let errMsg = `requireAdmin() POST /${authPath} ` +
        `user:unidentified-user => UNAUTHORIZED`;
      let resNoAuth = await supertest(app).post(url).send(data)
        .expect(401)
        .expect("content-type", /application\/json/)
        .expect({error:errMsg});
    });
  });
