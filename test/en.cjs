typeof describe === "function" &&
  describe("en", function () {
    const should = require("should");
    const fs = require("fs");
    const path = require("path");
    const { logger } = require("log-instance");
    const { ScApi } = require("suttacentral-api");
    const { English } = require("scv-bilara");
    const Polly = require('../src/polly.cjs');
    const SCAudio = require('../src/sc-audio.cjs');
    const SoundStore = require('../src/sound-store.cjs');
    const SuttaFactory = require('../src/sutta-factory.cjs');
    const Voice = require('../src/voice.cjs');
    const VoiceFactory = require('../src/voice-factory.cjs');
    const Words = require('../src/words.cjs');
    const ELLIPSIS = "\u2026";
    const ELLIPSIS_BREAK = '<break time="1.000s"/>';
    const BREAK = `<break time="0.001s"/>`;
    const tmp = require("tmp");
    this.timeout(10 * 1000);

    function phoneme(ph, word) {
      var ph = `<phoneme alphabet="ipa" ph="${ph}">${word}</phoneme>${BREAK}`;
      return ph;
    }

    it("Amy speaks", async () => {
      var voice = Voice.createVoice({
        name: "Amy",
      });
      should(voice.name).equal("Amy");
      should(voice.locale).equal("en-GB");
      var recite = voice.services.recite;
      await English.wordSet(); // await words.fwsEn
      should(recite.wordSSML("unburdensome")).equal("unburdensome");
      should(recite.wordSSML("hello")).equal("hello");
    });
  });
