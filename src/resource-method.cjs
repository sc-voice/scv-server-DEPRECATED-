(function (exports) {
  const { logger } = require("log-instance");

  class ResourceMethod {
    constructor(
      method = "get",
      name,
      handler,
      mime = "application/json",
      options = {}
    ) {
      logger.logInstance(this);
      if (typeof name !== 'string') {
        throw new Error("ResourceMethod() expected: name");
      }
      if (typeof handler !== 'function') {
        throw new Error("ResourceMethod() expected: handler");
      }
      this.method = method.toUpperCase();
      this.name = name;
      this.handler = handler;
      this.mime = mime;
    }

    async processRequest(req, res, next) {
      let { method, name, mime, handler } = this;
      let statusOk = 200;
      try {
        res.type(mime);
        let value = await handler(req, res);
        res.status(statusOk);
        res.send(value);
      } catch(e) {
        res.type("application/json");
        let { statusCode = statusOk } = res;
        statusCode === statusOk && res.status(500);
        this.warn('ResourceMethod.processRequest()',
          method, name, `HTTP${res.statusCode}:`, e.message);
        res.send({error:e.message});
      }
    }

    use(app) {
      let { name, method } = this;
      let that = this;
      if (method === "GET") {
        app.get(`/${name}`, async (req,res,next)=> {
          await that.processRequest(req,res);
        });
      } else if (method === "PUT") {
        app.put(`/${name}`, async (req,res,next)=> {
          await that.processRequest(req,res);
        });
      } else if (method === "POST") {
        app.post(`/${name}`, async (req,res,next)=> {
          await that.processRequest(req,res);
        });
      } else if (method === "DELETE") {
        app.delete(`/${name}`, async (req,res,next)=> {
          await that.processRequest(req,res);
        });
      } else if (method === "HEAD") {
        app.get(`/${name}`, async (req,res,next)=> {
          await that.processRequest(req,res);
        });
      } else {
        throw new Error([
          `ResourceMethod.use() unsupported HTTP method:${method}`,
          `[${name}]`,
        ].join(' '));
      }
    }

  }

  module.exports = exports.ResourceMethod = ResourceMethod;
})(typeof exports === "object" ? exports : (exports = {}));
