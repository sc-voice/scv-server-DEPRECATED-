import { SuttaRef }  from "scv-esm/main.mjs";

export default class Links {
  constructor() {
  }

  voiceLink(suttaRef) {
    let { sutta_uid, lang, author, segnum } = suttaRef;
    if (lang === 'pli') {
      lang = 'en';
    }
    return [
      `https://voice.suttacentral.net/scv/#`,
      `?search=${sutta_uid}&lang=${lang||'en'}`,
    ].join('/');
  }

  ebtSuttaRefLink(sref) {
    const msg = "Links.ebtSuttaRefLink() ";
    let suttaRef = SuttaRef.create(sref, 'en');
    let { sutta_uid, lang='en', author, segnum } = suttaRef;
    let sr = suttaRef.toString();

    switch (lang) {
      case 'de':
        return `https://dhammaregen.net/#/sutta/${sr}`;
      case 'pli':
      case 'en':
      default: 
        return `https://sc-voice.net/#/sutta/${sr}`;
        //return this.voiceLink(suttaRef);
    }
  }
}
