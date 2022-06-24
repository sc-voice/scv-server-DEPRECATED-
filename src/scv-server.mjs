import fs from "fs";
import path from "path";
import https from 'node:https';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.dirname(__dirname);
const LOCAL_DIR = path.join(APP_DIR, 'local');
global.__appdir = APP_DIR;

import compression from "compression";
import express from "express";
import favicon from "serve-favicon";
import jwt from 'express-jwt';
import { logger, } from 'log-instance';
import pkgScApi from 'suttacentral-api';
const { ScApi } = pkgScApi;
import RestApi from './rest-api.cjs';
import ScvApi from './scv-api.cjs';
import ResourceMethod from './resource-method.cjs';
//TBD import ScvApi from "./scv-rest.js";

//TBD import pkgRestApi from "rest-api";
//TBD const { RestApi, RbServer, } = pkgRestApi;
const MS_MINUTE = 60*1000;

const portMap = {};

export default class ScvServer extends RestApi {
  constructor(opts={}) {
    super(Object.assign({
      name: opts.name || "scv",
    }, opts));
    logger.logInstance(this)

    // configuration
    this.appDir = opts.appDir || APP_DIR;
    this.distDir = opts.distDir || path.join(APP_DIR, 'dist');
    this.initialized = undefined;
    this.sslPath = opts.sslPath || path.join(LOCAL_DIR, 'ssl');
    this.protocol = opts.protocol || "http";
    this.port =  opts.port || 
      this.protocol === "https" && 443 ||
      80;
    let apiUrl = opts.apiUrl || 'http://suttacentral.net/api';
    this.apiUrl = apiUrl;

    // injection
    let app = opts.app || express();
    Object.defineProperty(this, "app", {value: app});
    let scApi = opts.scApi || new ScApi({apiUrl});
    Object.defineProperty(this, "scApi", {value: scApi});
    let scvApi = opts.scvApi || new ScvApi({});
    Object.defineProperty(this, "scvApi", {value: scvApi});
    //TBD let rbServer = opts.rbServer || new RbServer();
    //TBD Object.defineProperty(this, "rbServer", {value: rbServer});

    this.info("ctor", opts);
    this.debug("ctor", this);
  }

  static get portMap() { return portMap }

  async listenSSL(restBundles=[], sslOpts) {
    let { port, app, sslPath } = this;
    if (!fs.existsSync(sslPath)) {
      throw new Error(`Nonexistent sslPath:${sslPath}`);
    }
    sslOpts = sslOpts || {
      cert: fs.readFileSync(path.join(sslPath, 'server.crt')),
      key: fs.readFileSync(path.join(sslPath, 'server.key')),
    };
    if (portMap[port]) {
      throw new Error(
        `ScvServer.listenSSL() conflict with active port:${port}`);
    }
    this.port = port;
    portMap[port] = this;
    //TBD if (restBundles.filter(rb=>rb===this)[0] == null) {
      //TBD restBundles.push(this);
    //TBD }
    //TBD restBundles.forEach(rb => rb.bindExpress(app));
    var server = https.createServer(sslOpts, app);
    let httpServer = await server.listen(port);
    if (!httpServer.listening) {
      throw new Error([
        `Could not create active HTTPS listener on port ${port}`,
        `(NOTE: TCP ports below 1024 are restricted to superusers).`,
      ].join(' '));
    }
    // TBD this.rbss = new RbSingleton(restBundles, this.httpServer);
    return httpServer;
  }

  async listen(restBundles=[]) {
    let { app, port} = this;
    if (portMap[port]) {
      throw new Error(
        `ScvServer.listen() conflict with active port:${port}`);
    }
    this.port = port;
    portMap[port] = this;
    return app.listen(port);
  }

  async close() {
    let { httpServer, port } = this;
    if (httpServer) {
      if (httpServer.listening) {
        this.info(`server shutting down (port:${port})`);
        await new Promise((resolve, reject) => {
          httpServer.close(()=>resolve());
        });
        this.info(`server shutdown completed (port:${port})`);
        this.httpServer = undefined;
        portMap[port] = undefined;
      } else {
        this.warn(`server is not running on port:${port}`);
      }
    } else {
      this.warn(`server is not initialized (port:${port})`);
    }
  }

  async initialize() {
    let { app, port, scApi, name, protocol, distDir } = this;
    if (portMap[port]) {
      throw new Error([
        `${name} conflict`,
        `with ${portMap[port].name}`,
        `on active port:${port}`].join(' '));
    }
    if (this.initialized != null) {
      this.warn(`already initialized on port:${port}`);
      return this;
    }
    this.initialized = false;
    this.bindExpress(app);

    app.use(compression());
    app.all('*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", [
            "X-Requested-With",
            "Content-Type",
            "Access-Control-Allow-Headers",
            "Authorization",
        ].join(","));
        res.header("Access-Control-Allow-Methods", "GET, OPTIONS, PUT, POST");
        next();
    });
   
    //TBD app.get('/scv/auth/*',
        //TBD jwt({secret: ScvApi.JWT_SECRET, algorithms:['HS256']}),
        //TBD (req, res, next) => {
            //TBD this.debug(`authenticated path:${req.path}`);
            //TBD next();
        //TBD });

    Object.entries({
      "/scv/index.html": "index.html",
      "/scv/img": "img",
      "/audio": "audio",
      "/css": "css",
      "/fonts": "fonts",
      "/MaterialIcons.css": "MaterialIcons.css",
      "/MaterialIcons.ttf": "MaterialIcons.ttf",
      "/scv/js": "js",
      "/scv/css": "css",
      "/scv/fonts":  "fonts",
      "/scv/sounds": "../local/sounds",
    }).forEach(kv => {
      let [ urlPath, value ] = kv;
      let filePath = path.join(distDir, value);
      app.use(urlPath, express.static(filePath));
      this.debug(`initialize() static: ${urlPath} => ${filePath}`);
    });

    app.use(favicon(path.join(distDir, "img/favicon.png")));

    app.get(["/","/scv"], function(req,res,next) {
        res.redirect("/scv/index.html");
        next();
    });

    //TBD await scApi.initialize();
    //TBD var rbServer =  app.locals.rbServer = new RbServer();

    // create RestApis
    //TBD let restBundles = app.locals.restBundles = [];
    //TBD var opts = {
        //TBD scApi,
        //TBD ephemeralAge: 60*MS_MINUTE,
    //TBD };
    //TBD let scvApi = new ScvApi(opts);
    //TBD app.locals.scvApi = scvApi;
    //TBD await scvApi.initialize();
    //TBD restBundles.push(scvApi);

    let httpServer = protocol === "https"
      ? await this.listenSSL()
      : await this.listen()
    Object.defineProperty(this, "httpServer", {
      writable: true,
      value: httpServer,
    });

    this.info("initialize() => listening on port:", port);
    this.initialized = true;
    return this;
  }
}
