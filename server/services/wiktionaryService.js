import got from 'got';

const WORD_TYPE_VERB = 'Verb';
const WORD_TYPE_NOUN = 'Substantiv';
const wordTypes = [WORD_TYPE_VERB, WORD_TYPE_NOUN];

// @TODO extract/inject language-specific rules as adapter/strategy

class WiktionaryService {
  constructor() {
    this.languageShort = 'de';
  }

  async fetchRawData(word) {
    const getUri = query => `https://${this.languageShort}.wiktionary.org/w/api.php?format=json&action=parse&prop=wikitext|categories|parsetree&redirects=1&contentmodel=wikitext&page=${query}`;
    const wiktionaryResponse = await got(getUri(word), { json: true });
    const error = wiktionaryResponse.body.error;
    if (error) {
      throw new Error(`Error fetching word data: ${error.info}`);
    }

    return wiktionaryResponse.body;
  }

  async getWord(word) {
    const wordData = await this.fetchRawData(word);
    const wikitext = wordData.parse.wikitext['*'];
    const wordType = WiktionaryService.getWordType(wikitext);

    if (!wordTypes.includes(wordType)) {
      throw new Error(`Unknown word type: ${wordType}`);
    }

    return {
      word_de: WiktionaryService.getWordDe(wikitext),
      word_en: WiktionaryService.getWordEn(wikitext),
      word_type: WiktionaryService.getWordType(wikitext),
      lautschrift: WiktionaryService.getLautschrift(wikitext),
      verb_present_third_person: wordType === WORD_TYPE_VERB ? WiktionaryService.getVerbPresentThirdPerson(wikitext) : null,
      verb_preterite_first_person: wordType === WORD_TYPE_VERB ? WiktionaryService.getVerbPreteriteFirstPerson(wikitext) : null,
      verb_preterite_third_person: wordType === WORD_TYPE_VERB ? WiktionaryService.getVerbPreteriteFirstPerson(wikitext) : null, // we take 1st person, as it seems to be the same as 3rd person most of the time
      verb_perfect_auxiliary_3rd: wordType === WORD_TYPE_VERB ? WiktionaryService.getVerbPerfectAuxiliaryThirdPerson(wikitext) : null,
      verb_past_participle: wordType === WORD_TYPE_VERB ? WiktionaryService.getVerbPastParticiple(wikitext) : null,
      noun_article: wordType === WORD_TYPE_NOUN ? WiktionaryService.getNounArticle(wikitext) : null,
      noun_plural: wordType === WORD_TYPE_NOUN ? WiktionaryService.getNounPlural(wikitext) : null,
      noun_gender: wordType === WORD_TYPE_NOUN ? WiktionaryService.getNounGender(wikitext) : null,
    };
  }

  static getWordType(wikitext) {
    return wikitext.match(/{{Wortart\|(\w+)\|Deutsch}}/)[1];
  }

  static getWordDe(wikitext) {
    return wikitext.match(/== ([A-zÀ-ÿ]+) \({{Sprache\|Deutsch}}\)/)[1]; // match accented words
  }

  static getWordEn(wikitext) {
    const re = /{{Ü\|en\|(\w+)}}/g;
    const found = wikitext.match(re)
      .map(fullMatch => fullMatch.match(/{{Ü\|en\|(\w+)}}/)[1]);

    return found.join(', ');
  }

  static getLautschrift(wikitext) {
    return wikitext.match(/{{Lautschrift\|(\S+)}}\n/i)[1];
  }

  static getVerbPresentThirdPerson(wikitext) {
    return wikitext.match(/\|Präsens_er, sie, es=([A-zÀ-ÿ ]+)\n\|/i)[1];
  }

  static getVerbPreteriteFirstPerson(wikitext) {
    return wikitext.match(/\|Präteritum_ich=([A-zÀ-ÿ ]+)\n\|/i)[1];
  }

  static getVerbPerfectAuxiliaryThirdPerson(wikitext) {
    const auxilaryVerb = wikitext.match(/\|Hilfsverb=(\w+)\n}}/i)[1];
    return auxilaryVerb === 'haben' ? 'hat' : 'ist';
  }

  static getVerbPastParticiple(wikitext) {
    return wikitext.match(/\|Partizip II=([A-zÀ-ÿ ]+)\n\|/i)[1];
  }

  static getNounArticle(wikitext) {
    const genusToArticle = {
      m: 'der',
      f: 'die',
      n: 'das',
    };
    return genusToArticle[WiktionaryService.getNounGender(wikitext)];
  }

  static getNounPlural(wikitext) {
    return wikitext.match(/\|Nominativ Plural=([A-zÀ-ÿ ]+)\n\|/i)[1];
  }

  static getNounGender(wikitext) {
    return wikitext.match(/\|Genus=(\w+)\n\|/i)[1];
  }
}

export default WiktionaryService;
