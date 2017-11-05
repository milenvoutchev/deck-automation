import got from 'got';
import WordResearch from '../dto/WordResearch';
import logger from '../helpers/logger';

const WORD_TYPE_VERB = 'Verb';
const WORD_TYPE_NOUN = 'Substantiv';
const WORD_TYPE_DECLINED_FORM = 'Deklinierte Form';
const WORD_TYPES = [WORD_TYPE_VERB, WORD_TYPE_NOUN];

// @TODO extract/inject language-specific rules as adapter/strategy/config

class WiktionaryService {
  constructor() {
    this.languageShort = 'de';
  }

  async fetchRawData(word) {
    const getUri = query => `https://${this.languageShort}.wiktionary.org/w/api.php?format=json&action=parse&prop=wikitext|templates|categories&redirects=1&contentmodel=wikitext&page=${query}`;
    const wiktionaryResponse = await got(getUri(word), { json: true });
    const error = wiktionaryResponse.body.error;
    if (error) {
      throw new Error(`Error fetching word data: ${error.info}`);
    }

    return {
      wikitext: wiktionaryResponse.body.parse.wikitext['*'],
      categories: wiktionaryResponse.body.parse.categories.map(item => item['*']),
    };
  }

  async getWord(word) {
    const { wikitext, categories } = await this.fetchRawData(word);

    const wordType = WiktionaryService.getWordType(wikitext);
    if (!WORD_TYPES.includes(wordType)) {
      throw new Error(`Unknown word type: ${wordType}`);
    }

    const wordResearch = new WordResearch();
    wordResearch.wordDe = WiktionaryService.getWordDe(wikitext);
    wordResearch.wordEn = WiktionaryService.getWordEn(wikitext, categories) || undefined;
    wordResearch.wordType = wordType;
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

    logger.silly('WiktionaryService::wordResearch: ', wordResearch);

    return wordResearch;
  }

  async getBaseForm(word) {
    const { wikitext } = await this.fetchRawData(word);

    if (WiktionaryService.getWordType(wikitext) === WORD_TYPE_DECLINED_FORM) {
      return wikitext.match(/{{Grundformverweis Dekl\|([\w\s]+)}}/)[1];
    }

    return word;
  }

  static getWordType(wikitext) {
    const wordType = wikitext.match(/{{Wortart\|([\w\s]+)\|Deutsch}}/)[1];
    logger.debug(`wordType: ${wordType}`);
    return wordType;
  }

  static getWordDe(wikitext) {
    return wikitext.match(/== ([A-zÀ-ÿ]+) \({{Sprache\|Deutsch}}\)/)[1]; // match accented words
  }

  static getWordEn(wikitext, categories) {
    return WiktionaryService
      .getTranslations(wikitext, categories)
      .map(sense => `${sense.code} ${sense.translations.join(', ')}`)
      .join('; ');
  }

  static getSenses(wikitext) {
    const rawBlock = WiktionaryService.getWikitextBlockByTitle(wikitext, 'Bedeutungen');
    const rawSenses = rawBlock.match(/:(\[\d+]) ([\s\S]+?)(\n|$)/g);
    return rawSenses.map(rawSense => {
      const match = rawSense.match(/:(\[\d+]) ([\s\S]+?)(\n|$)/);
      return {
        code: match[1],
        value: match[2],
      };
    });
  }

  static getTranslations(wikitext, categories) {
    // We need to parse in several steps, as the response structure is often like "[1] {{tranlation}}, {{translation}}; [2] {{translation}}"
    // and we can't derive a 1:1 structure like "[sense] {{tranlation}}"
    // Additionally, sometimes senses are misformatted, like "[1] {{tranlation}}, {{translation}} [2] {{translation}}"
    // i.e. w/o the usual ";" as separator, e.g. for "Widerstand"

    const hasTranslations = categories.includes('Übersetzungen_(Englisch)');

    if (!hasTranslations) {
      logger.debug('Word has no translations');

      return [];
    }

    logger.debug('Word has translations. Parsing...');

    const rawTranslationsBlock = wikitext.match(/\*{{en}}:(.*?)\n\*/g);
    const rawSensesPlusTranslations = rawTranslationsBlock[0].match(/([\d, ]+]) (.+?)(\[|\n)/g);

    return rawSensesPlusTranslations.map(rawSense => WiktionaryService.getSenseComponents(rawSense));
  }

  static getSenseComponents(rawSense) {
    const senseCode = WiktionaryService.getSenseCode(rawSense);
    const translations = WiktionaryService.getSenseTranslations(rawSense);

    return {
      code: senseCode,
      translations,
    };
  }

  static getSenseCode(rawSense) {
    try {
      const croppedSenseCode = rawSense.match(/([\d, ]+])/)[1];
      return `[${croppedSenseCode}`;
    } catch (error) {
      throw new Error("Could not parse 'senseCode'", error);
    }
  }

  static getSenseTranslations(rawSense) {
    try {
      const rawTranslations = rawSense.match(/{{Ü\|en\|([\w\s|-]+)}}/g);
      logger.debug(`rawTranslations: ${rawTranslations}`);
      return rawTranslations.map(raw => raw.match(/{{Ü\|en\|([\w\s|-]+)}}/)[1]);
    } catch (error) {
      throw new Error("Could not parse 'translations'", error);
    }
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
          code: matches[1],
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
