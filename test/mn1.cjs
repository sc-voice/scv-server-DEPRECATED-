typeof describe === "function" &&
  describe("mn1", function () {
    const should = require("should");
    const fs = require("fs");
    const path = require("path");
    const { logger } = require("log-instance");
    const logLevel = logger.logLevel = 'warn';
    const { ScApi, SuttaCentralId } = require("suttacentral-api");
    const Sutta = require("../src/sutta.cjs");
    const SuttaStore = require("../src/sutta-store.cjs");
    const SuttaFactory = require("../src/sutta-factory.cjs");
    const SoundStore = require("../src/sound-store.cjs");
    const Voice = require("../src/voice.cjs");
    const Words = require("../src/words.cjs");
    const LOCAL = path.join(__dirname, "../local");
    const SC = path.join(LOCAL, "sc");
    this.timeout(20 * 1000);

    var suttaStore = new SuttaStore({ logLevel });

    it("loadSutta(scid) parses mn1/bodhi", async () => {
      var scApi = await new ScApi().initialize();
      var factory = new SuttaFactory({
        scApi,
        logLevel,
      });
      var sutta = await factory.loadSutta({
        scid: "mn1",
        translator: "bodhi",
        language: "en",
      });
      should.deepEqual(
        Object.keys(sutta).sort(),
        [
          "translation",
          "suttaCode",
          "sutta_uid",
          "author_uid",
          "sections",
          "support",
          "suttaplex",
          "lang",
          "author",
          "titles",
        ].sort()
      );
      should(sutta.suttaCode).equal("mn1/en/bodhi");
      should(sutta.support.value).equal("Legacy");
      should(sutta.suttaplex).properties({
        type: "leaf",
        root_lang: "pli",
      });
      should(sutta.suttaplex.translated_title).match(/The Root of All Things/);
    });
    it("speak() generates mn1 sounds", async () => {
      console.log(`TODO`, __filename);
      return;
      // rewrite this to just test playlist with cached audio
      console.log("mn1.speak()  may take 1-2 minutes...");
      this.timeout(120 * 1000);

      // This is real-world system test that exercises and requires:
      // 1. AWS Polly
      // 2. Internet connection
      // 3. An actual section of MN1
      // 4. The local sound cache
      // 5. >5MB of local disk for sound storage
      var msStart = Date.now();
      var scApi = await new ScApi().initialize();
      this.suttaFactory = new SuttaFactory({
        scApi,
        autoSection: true,
      });
      var voice = Voice.createVoice({
        name: "amy",
        localeIPA: "pli",
      });
      var store = await new SuttaStore({
        scApi,
        suttaFactory,
        voice,
      }).initialize();
      var pl = await store.createPlaylist({
        pattern: "mn1",
        languages: ["en"], // speaking order
      });
      var result = await pl.speak({
        voices: {
          en: voice,
        },
        volume: "test-mn1",
      });
      should(result.signature.guid).match(/162fe0ead1e4e3ea4476dd42b1f80134/);
      console.log(
        `mn1.speak() done`,
        ((Date.now() - msStart) / 1000).toFixed(1)
      );
    });
  });
