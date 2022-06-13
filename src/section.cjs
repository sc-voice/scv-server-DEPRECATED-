(function (exports) {
  const Words = require("./words.cjs");
  const DEFAULT_PROP = "en";
  const RE_ELLIPSIS = new RegExp(`${Words.U_ELLIPSIS} *$`);
  const RE_TITLE_END = new RegExp(`[.?;,${Words.U_EMDASH}].*$`, "u");

  class Section {
    constructor(opts = {}) {
      var segments = opts.segments;
      if (!(segments instanceof Array)) {
        throw new Error("expected Array of segments");
      }
      this.segments = segments;
      this.type = this.constructor.name;
      this.prefix = opts.prefix || "";
      this.values = opts.values || [];
      this.prop = opts.prop || DEFAULT_PROP;
      var seg0 = this.segments[0];
      this.title = opts.title || Section.titleOfText(seg0 && seg0[this.prop]);
      this.expandable = false; // deprecated
    }

    static titleOfText(text = "(untitled)") {
      return text; // Title truncation delegated to client
    }

    expandAll() {
      throw new Error("expandAll() is no longer supported");
    }

    expand(segment) {
      throw new Error("expand() is no longer supported");
    }

    toJSON() {
      return this;
    }
  }

  module.exports = exports.Section = Section;
})(typeof exports === "object" ? exports : (exports = {}));
