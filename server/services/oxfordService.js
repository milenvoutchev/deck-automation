import got from 'got';
import WordResearch from '../dto/WordResearch';

class OxfordService {
  constructor(config) {
    this.apiURL = config.apiURL;
    this.appId = config.appId;
    this.appKey = config.appKey;
    this.sourceLanguage = 'de';
    this.translationLanguage = 'en';
  }

  getUri(query) {
    return `${this.apiURL}/entries/${this.sourceLanguage}/${query}/translations=${this.translationLanguage}`;
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
    wordResearch.examples = examples;

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
}

export default OxfordService;
