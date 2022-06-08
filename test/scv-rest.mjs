import ScvRest from "../src/scv-rest.cjs";

import { MerkleJson } from "merkle-json";

typeof describe === "function" &&
  describe("scv-rest", function() {

    it ("TESTTESTdefault ctor", ()=>{
      let rest = new ScvRest();
      should(rest).properties({
        name: 'scv',
        wikiUrl: 'https://github.com/sc-voice/sc-voice/wiki',
        jwtExpires: '1h',
        downloadMap: {},
      });
      should(rest.mj).instanceOf(MerkleJson);
    });
  });
