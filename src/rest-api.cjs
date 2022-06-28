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
        resourceMethods: opts.resourceMethods || [],
        uribase: opts.uribase || `/${name}`,
        scvDir: opts.scvDir || path.join(__dirname, ".."),
        taskBag: [], // unordered task collection with duplicates
        router: express.Router(),
      };
      Object.keys(privateProps).forEach(prop=>{
        Object.defineProperty(this, prop, {
          value: privateProps[prop],
        });
      });
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

    bindExpress(app, restHandlers) {
      let { router, name, uribase, resourceMethods} = this;

      restHandlers && restHandlers.forEach(h=>resourceMethods.push(h));
      let { locals } = app;
      router.use(bodyParser.json());
      let restApis = locals.restApis = locals.restApis || [];
      restApis.push(this);
      resourceMethods.sort((a, b) => {
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
      resourceMethods.forEach((resource) => {
        logger.debug(
          "RestApi.bindExpress:",
          resource.method,
          `/${name}/${resource.name} => ${resource.mime}`
        );
        resource.use(router);
      });
      app.disable("x-powered-by"); // suppress header warning
      app.use(uribase, router); // mount API
      return this;
    }

  } // class RestApi

  module.exports = exports.RestApi = RestApi;
})(typeof exports === "object" ? exports : (exports = {}));
