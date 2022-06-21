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
  }

  module.exports = exports.ResourceMethod = ResourceMethod;
})(typeof exports === "object" ? exports : (exports = {}));
