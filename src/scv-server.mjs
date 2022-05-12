import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APPDIR = path.dirname(__dirname);
global.__appdir = APPDIR;

import compression from "compression";
import express from "express";
import favicon from "serve-favicon";
import jwt from 'express-jwt';
import { logger, } from 'log-instance';
import pkgScApi from 'suttacentral-api';
const { ScApi } = pkgScApi;
//TBD import ScvRest from "./scv-rest.js";

//TBD import pkgRestBundle from "rest-bundle";
//TBD const { RestBundle, RbServer, } = pkgRestBundle;
const MS_MINUTE = 60*1000;

export default class ScvService {
  constructor(opts={}) {
    logger.logInstance(this)

    // configuration
    this.port =  opts.port || 80;
    this.appDir = opts.appDir || APPDIR;
    this.distDir = opts.distDir || path.join(APPDIR, 'dist');
    this.initialized = undefined;
    this.protocol = opts.protocol || "http";
    let apiUrl = opts.apiUrl || 'http://suttacentral.net/api';
    this.apiUrl = apiUrl;

    // injection
    let app = opts.app || express();
    Object.defineProperty(this, "app", {value: app});
    let scApi = opts.scApi || new ScApi({apiUrl});
    Object.defineProperty(this, "scApi", {value: scApi});
    //TBD let rbServer = opts.rbServer || new RbServer();
    //TBD Object.defineProperty(this, "rbServer", {value: rbServer});

    logger.debug("ctor", opts);
  }

  async initialize() {
    let { app, port, scApi, protocol, distDir } = this;
    if (this.initialized != null) {
      this.warn("ScvService is already initialized");
      return this;
    }
    this.initialized = false;

    app.get('/test', function(req, res) {
      res.status(200).json({ test: 'TEST OK' });
    });

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
        //TBD jwt({secret: ScvRest.JWT_SECRET, algorithms:['HS256']}),
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
      this.info(`initialize() static: ${urlPath} => ${filePath}`);
    });

    app.use(favicon(path.join(distDir, "img/favicon.png")));

    app.get(["/","/scv"], function(req,res,next) {
        res.redirect("/scv/index.html");
        next();
    });

    //TBD await scApi.initialize();
    //TBD var rbServer =  app.locals.rbServer = new RbServer();

    // create RestBundles
    //TBD let restBundles = app.locals.restBundles = [];
    //TBD var opts = {
        //TBD scApi,
        //TBD ephemeralAge: 60*MS_MINUTE,
    //TBD };
    //TBD let scvRest = new ScvRest(opts);
    //TBD app.locals.scvRest = scvRest;
    //TBD await scvRest.initialize();
    //TBD restBundles.push(scvRest);

    //TBD if (protocol === "https") {
      //TBD await rbServer.listenSSL(app, restBundles); 
      //TBD this.info("initialize() listenSSL");
    //TBD } else {
      //TBD let ports = [port, 3000].concat(new Array(100).fill(3000)
        //TBD .map((p,i)=>p+i));
      //TBD await rbServer.listen(app, restBundles, ports); 
    //TBD }
    //TBD await rbServer.initialize();
    let httpListener = await app.listen(port);
    Object.defineProperty(this, "httpServer", {value: httpListener});

    this.info("initialize() => OK ", {APPDIR, port});
    this.initialized = true;
    return this;
  }
}


/*
const app = module.exports = express();

RbServer.logDefault();

// ensure argv is actually for script instead of mocha
var argv = process.argv[1].match(__filename) && process.argv || [];
argv.filter(a => a==='--log-debug').length && (logger.level = 'debug');
var port = argv.reduce((a,v)=>(v==='-3000' ? 3000 : a), 80);

// set up application
(async function() {
    try {


        // create http server and web socket
        if (argv.some((a) => a === '--ssl')) {
            rbServer.listenSSL(app, restBundles); 
        } else {
            var ports = [port, 3000].concat(new Array(100).fill(3000).map((p,i)=>p+i));
            rbServer.listen(app, restBundles, ports); 
        }
        await rbServer.initialize();
    } catch(e) {
        logger.error(e.stack);
        throw e;
    }
})();
*/
