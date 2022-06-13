typeof describe === "function" &&
  describe("section", function () {
    const should = require("should");
    const fs = require("fs");
    const path = require("path");
    const Words = require("../src/words.cjs");
    const Section = require("../src/section.cjs");

    var segments = [
      {
        // 0
        scid: "s:0.1",
        en: "a1 a2, a3",
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
        en: `d1 y1 ${Words.U_ELLIPSIS}`,
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

    it("Section(parms) creates a section", ()=>{
      var section = new Section({
        segments,
      });
      should(section).properties({
        segments,
        type: "Section",
        title: `a1 a2, a3`,
      });
    });
    it("Section is serializable", ()=>{
      var section = new Section({
        segments,
        template: [segments[1], segments[2]],
        values: ["x1", "y1", "y2a y2b", "y3", "y4"],
        prefix: "q1 ",
      });
      var json = JSON.stringify(section);
      var sectCopy = new Section(JSON.parse(json));
      should.deepEqual(sectCopy, section);
    });
  });
