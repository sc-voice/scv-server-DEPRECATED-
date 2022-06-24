(function (exports) {
  class ResourceMethod {
    constructor(
      method = "get",
      name,
      handler,
      mime = "application/json",
      options = {}
    ) {
      if (typeof name !== 'string') {
        throw new Error("ResourceMethod() expected: name");
      }
      if (typeof handler !== 'function') {
        throw new Error("ResourceMethod() expected: handler");
      }
      this.method = method;
      this.name = name;
      this.handler = handler;
      this.mime = mime;
    }

    async processRequest(req, res, next) {
      try {
        let { method, name, mime, handler } = this;
        res.type(mime);
        let value = await handler(req, res);
        res.status(200);
        res.send(value);
      } catch(e) {
        res.status(500);
        logger.error('HTTP500:', e.message);
        res.send({error:e.message});
      }
    }
  }

  module.exports = exports.ResourceMethod = ResourceMethod;
})(typeof exports === "object" ? exports : (exports = {}));
