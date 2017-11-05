import defaultsDeep from 'lodash/defaultsDeep';
import logger from '../helpers/logger';

class ResearchService {
  constructor(wiktionaryService, oxfordService, config) {
    this.wiktionaryService = wiktionaryService;
    this.oxfordService = oxfordService;
    this.limitPreselectedExamples = config.limitPreselectedExamples;
  }

  async getWordResearch(word) {
    logger.profile('getWordResearch');

    const baseForm = await this.getBaseForm(word);
    if (baseForm !== word) {
      logger.info('Base form different, continue with it.');
    }
    const { wiktionaryData, oxfordData } = {
      wiktionaryData: await this.wiktionaryService.getWord(baseForm),
      oxfordData: await this.oxfordService.getWord(baseForm),
    };

    const combined = defaultsDeep({}, wiktionaryData, oxfordData);

    if (Array.isArray(combined.examples) && Array.isArray(combined.usages)) {
      combined.examples = combined.examples.concat(combined.usages);
    }

    const preselectedExamples = combined.examples.slice(0, this.limitPreselectedExamples);

    combined.exampleSentenceDe = ResearchService.getPreselectedExamplesByLanguage(preselectedExamples, 'de');
    combined.exampleSentenceEn = ResearchService.getPreselectedExamplesByLanguage(preselectedExamples, 'en');

    logger.profile('getWordResearch');

    return combined;
  }

  getBaseForm(word) {
    return this.wiktionaryService.getBaseForm(word);
  }

  static getPreselectedExamplesByLanguage = (examples, language) =>
    examples
      .map(example => example[language])
      .filter(element => !!element)
      .join(', \n');
}

export default ResearchService;
