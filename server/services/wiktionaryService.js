import got from 'got';
import flatten from 'lodash/flatten';
import WordResearch from '../dto/WordResearch';
import logger from '../helpers/logger';

// @TODO extract/inject language-specific rules as adapter/strategy/config

class WiktionaryService {
  constructor() {
    this.languageShort = 'de';
  }

  static WORD_TYPE_VERB = 'Verb';
  static WORD_TYPE_NOUN = 'Substantiv';
  static WORD_TYPE_ADJECTIVE = 'Adjektiv';
  static WORD_TYPE_DECLINED_FORM = 'Deklinierte Form';

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
    if (!WiktionaryService.isValidWordType(wordType)) {
      throw new Error(`Unknown word type: ${wordType}`);
    }

    const wordResearch = new WordResearch();
    wordResearch.wordDe = WiktionaryService.getWordDe(wikitext);
    wordResearch.wordEn = WiktionaryService.getTranslation(wikitext, categories) || undefined;
    wordResearch.wordType = wordType;
    wordResearch.lautschrift = WiktionaryService.getLautschrift(wikitext);
    wordResearch.verbPresentThirdPerson = wordType === WiktionaryService.WORD_TYPE_VERB ? WiktionaryService.getVerbPresentThirdPerson(wikitext) : null;
    wordResearch.verbPreteriteFirstPerson = wordType === WiktionaryService.WORD_TYPE_VERB ? WiktionaryService.getVerbPreteriteFirstPerson(wikitext) : null;
    wordResearch.verbPreteriteThirdPerson = wordType === WiktionaryService.WORD_TYPE_VERB ? WiktionaryService.getVerbPreteriteFirstPerson(wikitext) : null; // we take 1st person, as it seems to be the same as 3rd person most of the time
    wordResearch.verbPerfectAuxiliaryThird = wordType === WiktionaryService.WORD_TYPE_VERB ? WiktionaryService.getVerbPerfectAuxiliaryThirdPerson(wikitext) : null;
    wordResearch.verbPastParticiple = wordType === WiktionaryService.WORD_TYPE_VERB ? WiktionaryService.getVerbPastParticiple(wikitext) : null;
    wordResearch.nounArticle = wordType === WiktionaryService.WORD_TYPE_NOUN ? WiktionaryService.getNounArticle(wikitext) : null;
    wordResearch.nounPlural = wordType === WiktionaryService.WORD_TYPE_NOUN ? WiktionaryService.getNounPlural(wikitext) : null;
    wordResearch.nounGender = wordType === WiktionaryService.WORD_TYPE_NOUN ? WiktionaryService.getNounGender(wikitext) : null;
    wordResearch.usages = WiktionaryService.getExamples(wikitext, this.languageShort) || [];
    wordResearch.senses = WiktionaryService.getSenses(wikitext) || [];
    wordResearch.sources = { wikitext };

    logger.silly('WiktionaryService::wordResearch: ', wordResearch);

    return wordResearch;
  }

  async getBaseForm(word) {
    const { wikitext } = await this.fetchRawData(word);

    if (WiktionaryService.getWordType(wikitext) === WiktionaryService.WORD_TYPE_DECLINED_FORM) {
      return wikitext.match(/{{Grundformverweis Dekl\|([\w\s]+)}}/)[1];
    }

    return word;
  }

  static isValidWordType(wordType) {
    const VALID_WORD_TYPES = [
      WiktionaryService.WORD_TYPE_VERB,
      WiktionaryService.WORD_TYPE_NOUN,
      WiktionaryService.WORD_TYPE_ADJECTIVE,
    ];

    return VALID_WORD_TYPES.includes(wordType);
  }

  static getWordType(wikitext) {
    const wordType = wikitext.match(/{{Wortart\|([\w\s]+)\|Deutsch}}/)[1];
    logger.debug(`wordType: ${wordType}`);
    return wordType;
  }

  static getWordDe(wikitext) {
    return wikitext.match(/== ([A-zÀ-ÿ]+) \({{Sprache\|Deutsch}}\)/)[1]; // match accented words
  }

  static getTranslation(wikitext, categories) {
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

    const languages = [
      {
        code: 'bg',
        category: 'Übersetzungen_(Bulgarisch)',
      },
      {
        code: 'en',
        category: 'Übersetzungen_(Englisch)',
      },
    ];

    const languagesTranslations = languages
      .filter(language => categories.includes(language.category))
      .map(language => WiktionaryService.getLanguageTranslations(wikitext, language.code));

    return flatten(languagesTranslations);
  }

  static getLanguageTranslations(wikitext, langCode) {
    logger.debug(`Parsing '${langCode}' translations...`);

    const rawTranslationsBlock = wikitext.match(String.raw`\*{{${langCode}}}:(.*?)\n\*`);
    logger.debug('rawTranslationsBlock:', !!rawTranslationsBlock);

    const rawSensesPlusTranslations = rawTranslationsBlock[0].match(/([\d, ]+]) (.+?)(\[|\n)/g);
    logger.debug('rawSensesPlusTranslations:', rawSensesPlusTranslations.length);

    return rawSensesPlusTranslations.map(rawSense => WiktionaryService.getSenseComponents(rawSense, langCode));
  }

  static getSenseComponents(rawSense, langCode) {
    const senseCode = WiktionaryService.getSenseCode(rawSense);
    const senseTranslations = WiktionaryService.getSenseTranslations(rawSense, langCode);

    if (senseTranslations.length <= 0) {
      throw new Error(`Unexpectedly found no translations for langCode:${langCode}`);
    }

    logger.debug('senseTranslations:', senseTranslations.length);

    return {
      code: senseCode,
      translations: senseTranslations,
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

  static getSenseTranslations(rawSense, langCode) {
    try {
      // handle all of "{{Ü|en|deer}}", "{{Ü|en|cuckold}}", "{{Üt|bg|гребен|grében}}", "{{Üt|bg|кормило|kormílo}}"
      const oneTranslationRe = String.raw`{{Üt?\|${langCode}\|([а-я\w\s|-]+?)(\|([\u0000-\u007F\u0080-\u00FF\u0100-\u017F\u0180-\u024F\s-]+))?}}`;

      const rawTranslations = rawSense.match(new RegExp(oneTranslationRe, 'g'));
      logger.debug('rawTranslations:', rawTranslations.length);

      return rawTranslations.map(raw => raw.match(oneTranslationRe)[1]);
    } catch (error) {
      throw new Error(`Could not parse '${langCode}' translations`, error);
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
    // sometimes there are two forms, e.g. "Plural 1", " Plural 2"; or only one, e.g. "Plural"
    return wikitext.match(/\|Nominativ Plural[ \d]{0,2}=([A-zÀ-ÿ ]+)\n\|/i)[1];
  }

  static getNounGender(wikitext) {
    return wikitext.match(/{{Wortart\|Substantiv\|Deutsch}}, {{(\w)}} ===\n\n/i)[1];
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
