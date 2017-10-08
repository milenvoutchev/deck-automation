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

    WiktionaryService.getExamples(wikitext);

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
      usages: WiktionaryService.getExamples(wikitext) || [],
    };
  }

  static getWordType(wikitext) {
    return wikitext.match(/{{Wortart\|(\w+)\|Deutsch}}/)[1];
  }

  static getWordDe(wikitext) {
    return wikitext.match(/== ([A-zÀ-ÿ]+) \({{Sprache\|Deutsch}}\)/)[1]; // match accented words
  }

  static getWordEn(wikitext) {
    const senses = WiktionaryService.getSenses(wikitext).map(sense => sense.value);

    return senses.join(', ');
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

  static getSenses(wikitext) {
    const mathedSenses = wikitext.match(/\[\d+] {{Ü\|en\|[\w\s]+}}/g);

    return mathedSenses.map(raw => {
      const matches = raw.match(/(\[\d+]) {{Ü\|en\|([\w\s]+)}}/);
      return {
        id: matches[1],
        value: matches[2],
      };
    });
  }

  static removeTagAndContents(text, tag) {
    const re = new RegExp(`<${tag}>.+?<\\/${tag}>`, 'g');

    return text.replace(re, '');
  }

  static getExamples(wikitext) {
    const examplesContainer = WiktionaryService
      .removeTagAndContents(wikitext, 'ref') // remove quote references
      .replace(/{{Beispiele fehlen\|spr=de}}/, '') // clean "empty" example, as we use '^{' in the regex below
      .match(/{{Beispiele}}\n:([^{]+)/i); // match until next '{'
    const examples = examplesContainer[1].split('\n:');

    const examplesStructured = examples
      .map(exampleRaw => {
        const matches = exampleRaw.match(/(\[\d+]) (.+)/);

        if (!matches) {
          return null; // sometimes we get empty examples (e.g. when cleaned above)
        }

        return {
          sense: matches[1],
          value: matches[2],
        };
      });

    return examplesStructured
      .filter(example => !!example) // remove empty
      .map(example => example.value);
  }
}

export default WiktionaryService;
