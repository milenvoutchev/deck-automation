import got from 'got';
import flattenDeep from 'lodash/flattenDeep';
import WordResearch from '../dto/WordResearch';
import logger from '../helpers/logger';

class OxfordService {
  constructor(config) {
    this.apiURL = config.apiURL;
    this.appId = config.appId;
    this.appKey = config.appKey;
    this.sourceLanguage = 'de';
    this.translationLanguage = 'en';
  }

  getUri(query) {
    return `${this.apiURL}/entries/${this.sourceLanguage}/${encodeURIComponent(query)}/translations=${this.translationLanguage}`;
  }

  async fetchRawData(word) {
    const options = {
      json: true,
      headers: {
        app_id: this.appId,
        app_key: this.appKey,
      },
    };
    const rawResponse = await got(this.getUri(word), options);

    return rawResponse.body.results;
  }

  async getWord(word) {
    const results = await this.fetchRawData(word);

    const examples = OxfordService.getExamples(results)
      .map(example => OxfordService.getFormattedExample(example, this.sourceLanguage));

    const wordResearch = new WordResearch();
    wordResearch.wordEn = OxfordService.getTranslation(results);
    wordResearch.examples = examples;
    wordResearch.sources = { oxford: results[0] };

    logger.silly('OxfordService::wordResearch: ', wordResearch);

    return wordResearch;
  }

  static getExamples(results) {
    return results[0].lexicalEntries[0].entries[0].senses[0].examples || [];
  }

  static getFormattedExample(rawExample, sourceLanguage) {
    return {
      [sourceLanguage]: rawExample.text,
      [rawExample.translations[0].language]: rawExample.translations[0].text,
    };
  }

  static getTranslation(results) {
    const translations = results[0].lexicalEntries[0].entries.map(entry =>
      entry.senses.map(sense =>
        sense.translations.map(translation =>
          translation.text)));
    return [...new Set(flattenDeep(translations))].join(', '); // flatten, unique
  }
}

export default OxfordService;
