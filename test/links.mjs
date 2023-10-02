import Links from "../src/links.mjs";
import { SuttaRef }  from "scv-esm/main.mjs";
import should from "should";

const VOICE="https://voice.suttacentral.net/scv/#";
const DHAMMAREGEN = "https://dhammaregen.net/#";
const EBT_VUE3 = "https://ebt-vue3.sc-voice.net/#";

typeof describe === "function" && describe("links", function() {
  it ("TESTTESTebtSuttaRefLink)()", ()=>{
    let links = new Links();
    let test = (sutta_uid, lang, author)=>links.ebtSuttaRefLink({
      sutta_uid, lang, author });

    should(test('thig1.1')).equal(
      `${EBT_VUE3}/sutta/thig1.1/en`);

    // de
    should(test('thig1.1', 'de', 'sabbamitta')).equal(
      `${DHAMMAREGEN}/sutta/thig1.1/de/sabbamitta`);
    should(test('thig1.1', 'de')).equal(
      `${DHAMMAREGEN}/sutta/thig1.1/de`);

    // en
    should(test('thig1.1')).equal(
      `${EBT_VUE3}/sutta/thig1.1/en`);
    should(test('thig1.1:1.2')).equal(
      `${EBT_VUE3}/sutta/thig1.1:1.2/en`);
    should(test('thig1.1', 'en')).equal(
      `${EBT_VUE3}/sutta/thig1.1/en`);

    //`${VOICE}/?search=thig1.1&lang=en`);
  });
})
