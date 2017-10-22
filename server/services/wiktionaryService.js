import got from 'got';
import WordResearch from '../dto/WordResearch';

const WORD_TYPE_VERB = 'Verb';
const WORD_TYPE_NOUN = 'Substantiv';
const wordTypes = [WORD_TYPE_VERB, WORD_TYPE_NOUN];

// @TODO extract/inject language-specific rules as adapter/strategy/config

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

    const wordResearch = new WordResearch();
    wordResearch.wordDe = WiktionaryService.getWordDe(wikitext);
    wordResearch.wordEn = WiktionaryService.getWordEn(wikitext);
    wordResearch.wordType = WiktionaryService.getWordType(wikitext);
    wordResearch.lautschrift = WiktionaryService.getLautschrift(wikitext);
    wordResearch.verbPresentThirdPerson = wordType === WORD_TYPE_VERB ? WiktionaryService.getVerbPresentThirdPerson(wikitext) : null;
    wordResearch.verbPreteriteFirstPerson = wordType === WORD_TYPE_VERB ? WiktionaryService.getVerbPreteriteFirstPerson(wikitext) : null;
    wordResearch.verbPreteriteThirdPerson = wordType === WORD_TYPE_VERB ? WiktionaryService.getVerbPreteriteFirstPerson(wikitext) : null; // we take 1st person, as it seems to be the same as 3rd person most of the time
    wordResearch.verbPerfectAuxiliaryThird = wordType === WORD_TYPE_VERB ? WiktionaryService.getVerbPerfectAuxiliaryThirdPerson(wikitext) : null;
    wordResearch.verbPastParticiple = wordType === WORD_TYPE_VERB ? WiktionaryService.getVerbPastParticiple(wikitext) : null;
    wordResearch.nounArticle = wordType === WORD_TYPE_NOUN ? WiktionaryService.getNounArticle(wikitext) : null;
    wordResearch.nounPlural = wordType === WORD_TYPE_NOUN ? WiktionaryService.getNounPlural(wikitext) : null;
    wordResearch.nounGender = wordType === WORD_TYPE_NOUN ? WiktionaryService.getNounGender(wikitext) : null;
    wordResearch.usages = WiktionaryService.getExamples(wikitext, this.languageShort) || [];
    wordResearch.senses = WiktionaryService.getSenses(wikitext) || [];
    wordResearch.sources = { wikitext };

    return wordResearch;
  }

  static getWordType(wikitext) {
    return wikitext.match(/{{Wortart\|(\w+)\|Deutsch}}/)[1];
  }

  static getWordDe(wikitext) {
    return wikitext.match(/== ([A-zÀ-ÿ]+) \({{Sprache\|Deutsch}}\)/)[1]; // match accented words
  }

  static getWordEn(wikitext) {
    return WiktionaryService
      .getSenseTranslations(wikitext)
      .map(sense => `${sense.id} ${sense.translations}`)
      .join('; ');
  }

  static getSenses(wikitext) {
    const rawBlock = WiktionaryService.getWikitextBlockByTitle(wikitext, 'Bedeutungen');
    const rawSenses = rawBlock.match(/:(\[\d+]) ([\s\S]+?)(\n|$)/g);
    return rawSenses.map(rawSense => {
      const match = rawSense.match(/:(\[\d+]) ([\s\S]+?)(\n|$)/);
      return {
        id: match[1],
        value: match[2],
      };
    });
  }

  static getSenseTranslations(wikitext) {
    // The current response structure is often like "[1] {{tranlation}}, {{translation}}; [2] {{translation}}", e.g.
    // [1] {{Ü|en|notification}} (''offiziell''), {{Ü|en|answer}}, {{Ü|en|reply}} ''umgangssprachlich:'' (the) {{Ü|en|deal}}<!--Wissen Sie über diese Praxis Bescheid? Do you know the deal with that practice?-->, „Bescheid wissen“ — to {{Ü|en|know}} (about); [2] {{amer.|,}} ''umgangssprachlich:'' (a) {{Ü|en|heads-up}}<!--gebe ich Ihnen Bescheid - I'll give you a heads-up-->, „Bescheid sagen/geben“ — to {{Ü|en|let know}}
    // I can't derive a clear structure like "[sense] {{tranlation}}", thus am forced to parse in several steps
    const rawTranslationsBlock = wikitext.match(/\*{{en}}:(.*?)\n\*/g);
    const rawSenses = rawTranslationsBlock[0].match(/(\[\d]) (.+?)(;|\n)/g);

    return rawSenses.map(rawSense => {
      const sense = rawSense.match(/(\[\d+])/)[1];
      const rawTranslations = rawSense.match(/{{Ü\|en\|([\w\s-]+)}}/g);
      const translations = rawTranslations.map(raw => raw.match(/{{Ü\|en\|([\w\s-]+)}}/)[1]);

      return {
        id: sense,
        translations,
      };
    });
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

  static getExamples(wikitext, languageShort) {
    const examplesContainer = WiktionaryService
      .removeHtmlTagAndContents(wikitext, 'ref') // remove quote references
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
          id: matches[1],
          value: matches[2],
        };
      })
      .filter(example => !!example); // remove empty

    return examplesStructured
      .map(example => { // eslint-disable-line arrow-body-style
        return {
          [languageShort]: example.value,
        };
      });
  }

  static removeHtmlTagAndContents(text, tag) {
    const re = new RegExp(`<${tag}>.+?<\\/${tag}>`, 'g');

    return text.replace(re, '');
  }

  static getWikitextBlockByTitle(wikitext, title) {
    return wikitext.match(String.raw`{{${title}}}([\s\S]+?)\n\n`)[1];
  }
}

export default WiktionaryService;
