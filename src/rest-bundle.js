(function (exports) {
  const ResourceMethod = require("./resource-method");
  const EventEmitter = require("events");
  const RbHash = require("./rb-hash");
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

  class RestBundle {
    constructor(options = {}) {
      let { name="test" } = options;
      if (typeof name !== "string") {
        throw new Error(`bundle name is required: ${name}`);
      }
      logger.info(`RestBundle.ctor(${name})`);
      this.name = name;
      this.appDir =
        options.appDir || 
        require.resolve("scv-bilara").split("/node_modules")[0];

      let privateProps = {
        uribase: options.uribase || "/" + this.name,
        scvDir: options.scvDir || path.join(__dirname, ".."),
        node_modules: path.join(this.appDir, "node_modules"),
        $onRequestSuccess: 
          options.onRequestSuccess || RestBundle.onRequestSuccess,
        $onRequestFail:
         options.onRequestFail || RestBundle.onRequestFail,
        taskBag: [], // unordered task collection with duplicates
      };
      Object.keys(privateProps).forEach(prop=>{
        Object.defineProperty(this, prop, {
          value: privateProps[prop],
        });
      });
    }

    resourceMethod(method, name, handler, mime) {
      if (handler == null) {
        throw new Error(
          "resourceMethod(" +
            method +
            ", " +
            name +
            ", ?handler?, ...) handler is required"
        );
      }

      var thatHandler = (req, res, next) => {
        return handler.call(this, req, res, next);
      };
      return new ResourceMethod(method, name, thatHandler, mime);
    }

    get handlers() {
      return [
        this.resourceMethod("get", "identity", this.getIdentity),
        this.resourceMethod("get", "state", this.getState),
        this.resourceMethod("get", "app/stats/:stat", this.getAppStats),
        this.resourceMethod("post", "identity", this.postIdentity),
        this.resourceMethod("post", "echo", this.postEcho),
      ];
    }

    static onRequestSuccess(req, res, data, next, mime) {
      try {
        res.status(res.locals.status);
        res.type(res.locals.mime);
        res.send(data);
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
      logger.warn("RestBundle.pushState() ignored (no web socket)");
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
      this.pushState();
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
      this.pushState();
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
      logger.warn(`RestBundle.handleRequestError(${req.method} ${req.url})`);
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

    bindResource(app, resource) {
      var mime = resource.mime || "application/json";
      var method = (resource.method || "get").toUpperCase();
      var path = "/" + resource.name;
      if (method === "GET") {
        app.get(path, (req, res, next) =>
          this.processRequest(req, res, next, resource.handler, mime)
        );
      } else if (method === "POST") {
        app.post(path, (req, res, next) =>
          this.processRequest(req, res, next, resource.handler, mime)
        );
      } else if (method === "PUT") {
        app.put(path, (req, res, next) =>
          this.processRequest(req, res, next, resource.handler, mime)
        );
      } else if (method === "DELETE") {
        app.delete(path, (req, res, next) =>
          this.processRequest(req, res, next, resource.handler, mime)
        );
      } else if (method === "HEAD") {
        app.head(path, (req, res, next) =>
          this.processRequest(req, res, next, resource.handler, mime)
        );
      } else {
        throw new Error("Unsupported HTTP method:", method);
      }
    }

    bindExpress(rootApp, restHandlers = this.handlers) {
      var app = (this.app = express());
      this.rootApp = rootApp;
      rootApp.use("/node_modules", express.static(this.node_modules));
      app.use(bodyParser.json());
      restHandlers.sort((a, b) => {
        var cmp = a.method.localeCompare(b.method);
        if (cmp === 0) {
          cmp = a.name.localeCompare(b.name);
          if (cmp === 0) {
            var msg =
              "REST resources must have unique handlers: " +
              a.method +
              " " +
              a.name;
            throw new Error(msg);
          }
        }
        return cmp;
      });
      restHandlers.forEach((resource) => {
        logger.debug(
          "RestBundle.bindExpress:",
          resource.method,
          "/" + this.name + "/" + resource.name + " => " + resource.mime
        );
        this.bindResource(app, resource);
      });
      rootApp.use(this.uribase, app); // don't pollute client's app
      rootApp.disable("x-powered-by"); // suppress header warning
      app.disable("x-powered-by"); // suppress header warning
      return this;
    }

  } // class RestBundle

  module.exports = exports.RestBundle = RestBundle;
})(typeof exports === "object" ? exports : (exports = {}));
