(function (exports) {
  const ResourceMethod = require("./resource-method.cjs");
  const EventEmitter = require("events");
  const RbHash = require("./rb-hash.cjs");
  const srcPkg = require("../package.json");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");
  const express = require("express");
  const bodyParser = require("body-parser");
  const logger = require("log-instance").LogInstance.singleton;
  const _rbHash = new RbHash();
  const { exec } = require("child_process");
  const util = require("util");
  const v8 = require("v8");

  class RestApi {
    constructor(opts = {}) {
      let { name="test" } = opts;
      if (typeof name !== "string") {
        throw new Error(`bundle name is required: ${name}`);
      }
      logger.info(`RestApi.ctor(${name})`);
      this.name = name;
      this.appDir =
        opts.appDir || 
        require.resolve("scv-bilara").split("/node_modules")[0];

      let privateProps = {
        handlers: opts.handlers || [],
        uribase: opts.uribase || `/${name}`,
        scvDir: opts.scvDir || path.join(__dirname, ".."),
        $onRequestSuccess: 
          opts.onRequestSuccess || RestApi.onRequestSuccess,
        $onRequestFail:
         opts.onRequestFail || RestApi.onRequestFail,
        taskBag: [], // unordered task collection with duplicates
        router: express.Router(),
      };
      Object.keys(privateProps).forEach(prop=>{
        Object.defineProperty(this, prop, {
          value: privateProps[prop],
        });
      });
    }

    get testHandlers() {
      return [
        new ResourceMethod("get", "identity", 
          (req,res,next)=>this.getIdentity(req,res,next)),
        new ResourceMethod("get", "state", 
          (req,res,next)=>this.getState(req,res,next)),
        new ResourceMethod("get", "app/stats/:stat", 
          (req,res,next)=>this.getAppStats(req,res,next)),
        new ResourceMethod("post", "identity", 
          (req,res,next)=>this.postIdentity(req,res,next)),
        new ResourceMethod("post", "echo", 
          (req,res,next)=>this.postEcho(req,res,next)),
      ];
    }

    static onRequestSuccess(req, res, data, next, mime) {
      try {
        res.type(res.locals.mime);
        res.status(res.locals.status).send(data);
      } catch (err) {
        logger.warn(err.stack);
        res.status(500);
        res.send({ error: err.message });
      }
      next && next("route");
    }

    static onRequestFail(req, res, err, next) {
      var status = (res.locals.status !== 200 && res.locals.status) || 500;
      res.status(status);
      res.type(res.locals.mime || "application/json");
      res.send(res.locals.data || { error: err.message });
      next && next("route");
    }

    pushState() {
      logger.warn("RestApi.pushState() ignored (no web socket)");
    }

    taskPromise(name, cbPromise) {
      return new Promise((resolve, reject) => {
        var onError = (err, n, level) => {
          logger[level]("taskPromise#" + n + ":", err.stack);
          this.taskEnd(name);
          reject(err);
        };
        try {
          this.taskBegin(name);
          try {
            cbPromise(
              (data) => {
                try {
                  this.taskEnd(name);
                  resolve(data);
                } catch (err) {
                  onError(err, 1, "warn"); // implementation error
                }
              },
              (err) => onError(err, 2, "info")
            ); // cbpromise error
          } catch (err) {
            onError(err, 3, "info"); // cbpromise error
          }
        } catch (err) {
          onError(err, 4, "warn"); // implementation error
        }
      });
    }

    taskBegin(name) {
      this.taskBag.push(name);
    }

    taskEnd(name) {
      if (this.taskBag.length < 1) {
        throw new Error(
          "taskEnd() expected:" + name + " actual:(no pending tasks)"
        );
      }
      var iName = this.taskBag.indexOf(name);
      if (iName < 0) {
        throw new Error("taskEnd() could not locate pending task:" + name);
      }
      this.taskBag.splice(iName, 1);
    }

    getAppStats(req, res, next) {
      var stat = req.params.stat || "heap";
      return new Promise((resolve, reject) => {
        try {
          if (stat === "heap") {
            resolve(v8.getHeapSpaceStatistics());
          } else {
            resolve(v8.getHeapSpaceStatistics());
          }
        } catch (e) {
          logger.warn(e.stack);
          reject(e);
        }
      });
    }

    getState(req, res, next) {
      return {
        tasks: this.taskBag,
      };
    }

    async getIdentity(req, res, next) {
      try {
        var execPromise = util.promisify(exec);
        var cmd = "df --total -B 1 /";
        var execOpts = {
          cwd: __dirname,
        };
        var res = await execPromise(cmd, execOpts);
        var stdout = res.stdout.split("\n");
        var stats = stdout[2].split(/\s\s*/);
        let diskused = Number(stats[2]);
        let diskavail = Number(stats[3]);
        let disktotal = diskused + diskavail;
        return {
          name: this.name,
          package: srcPkg.name,
          version: srcPkg.version,
          hostname: os.hostname(),
          uptime: os.uptime(),
          loadavg: os.loadavg(),
          totalmem: os.totalmem(),
          freemem: os.freemem(),
          diskavail,
          diskfree: diskavail,
          disktotal: disktotal,
        };
      } catch (e) {
        logger.warn(`getIdentity()`, e.message);
        throw e;
      }
    }

    postIdentity(req, res, next) {
      throw new Error("POST not supported: " + JSON.stringify(req.body));
    }

    postEcho(req, res, next) {
      return this.taskPromise("postEcho", (resolve, reject) => {
        setTimeout(() => resolve(req.body), 0);
      });
    }

    handleRequestError(req, res, err, next) {
      logger.warn(`RestApi.handleRequestError(${req.method} ${req.url})`);
      logger.warn(err.stack);
      this.$onRequestFail(req, res, err, next);
    }

    processRequest(req, res, next, handler, mime) {
      res.locals.status = 200;
      res.locals.mime = mime;
      try {
        var result = handler(req, res);
        if (result instanceof Promise) {
          result
            .then((data) => {
              this.$onRequestSuccess(req, res, data, next, mime);
            })
            .catch((err) => {
              this.handleRequestError(req, res, err, next);
            });
        } else {
          this.$onRequestSuccess(req, res, result, next, mime);
        }
      } catch (err) {
        this.handleRequestError(req, res, err, next);
      }
    }

    bindResource(router, resource) {
      var mime = resource.mime || "application/json";
      var method = (resource.method || "get").toUpperCase();
      var path = "/" + resource.name;
      if (method === "GET") {
        router.get(path, (req, res, next) =>
          this.processRequest(req, res, next, resource.handler, mime)
        );
      } else if (method === "POST") {
        router.post(path, (req, res, next) =>
          this.processRequest(req, res, next, resource.handler, mime)
        );
      } else if (method === "PUT") {
        router.put(path, (req, res, next) =>
          this.processRequest(req, res, next, resource.handler, mime)
        );
      } else if (method === "DELETE") {
        router.delete(path, (req, res, next) =>
          this.processRequest(req, res, next, resource.handler, mime)
        );
      } else if (method === "HEAD") {
        router.head(path, (req, res, next) =>
          this.processRequest(req, res, next, resource.handler, mime)
        );
      } else {
        throw new Error("Unsupported HTTP method:", method);
      }
    }

    bindExpress(app, restHandlers) {
      let { router, name, uribase, handlers} = this;

      restHandlers && restHandlers.forEach(h=>handlers.push(h));
      let { locals } = app;
      router.use(bodyParser.json());
      let restApis = locals.restApis = locals.restApis || [];
      restApis.push(this);
      handlers.sort((a, b) => {
        var cmp = a.method.localeCompare(b.method);
        if (cmp === 0) {
          cmp = a.name.localeCompare(b.name);
          if (cmp === 0) {
            var msg =
              "duplicate REST resource handler: " +
              a.method +
              " " +
              a.name;
            throw new Error(msg);
          }
        }
        return cmp;
      });
      handlers.forEach((resource) => {
        logger.debug(
          "RestApi.bindExpress:",
          resource.method,
          `/${name}/${resource.name} => ${resource.mime}`
        );
        this.bindResource(router, resource);
      });
      app.disable("x-powered-by"); // suppress header warning
      app.use(uribase, router); // mount API
      return this;
    }

  } // class RestApi

  module.exports = exports.RestApi = RestApi;
})(typeof exports === "object" ? exports : (exports = {}));
