typeof describe === "function" &&
  describe("section-parser", function () {
    const should = require("should");
    const fs = require("fs");
    const path = require("path");
    const Section = require('../src/section.cjs');
    const SectionParser = require('../src/section-parser.cjs');
    const Sutta = require('../src/sutta.cjs');
    const SuttaStore = require('../src/sutta-store.cjs');
    const Words = require('../src/words.cjs');
    const { logger } = require("log-instance");
    this.timeout(10 * 1000);

    var segments = [
      {
        // 0
        scid: "s:0.1",
        en: "a1 a2 a3",
      },
      {
        // 1
        scid: "s:1.1",
        en: "b1 x1 b2",
      },
      {
        // 2
        scid: "s:1.2",
        en: "c1 x1 c2 x1 c3",
      },
      {
        // 3 (mn1:4.2)
        scid: "s:2.1",
        en: `b1 y1 ${Words.U_ELLIPSIS}`,
      },
      {
        // 4 (mn1:28-49.6)
        scid: "s:3.1",
        en: `y2a y2b ${Words.U_ELLIPSIS}`,
      },
      {
        // 5 (mn1:28-49.1)
        scid: "s:4.1",
        en: `q1 y3 ${Words.U_ELLIPSIS}`,
      },
      {
        // 5 (mn1:28-49.2)
        scid: "s:5.1",
        en: `y4 ${Words.U_ELLIPSIS}`,
      },
    ];

    const logLevel = false;
    const suttaStore = new SuttaStore({
      logLevel,
    });

    it("SectionParser(opts) creates a section parser", function () {
      // default
      var parser = new SectionParser();
      should(parser).properties({
        prop: "en",
        type: "SectionParser",
      });

      // custom
      var parser = new SectionParser({
        prop: "fr",
      });
      should(parser).properties({
        prop: "fr",
      });
    });
  });
