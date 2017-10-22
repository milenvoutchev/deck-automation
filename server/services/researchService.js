import defaultsDeep from 'lodash/defaultsDeep';

class ResearchService {
  constructor(wiktionaryService, oxfordService, config) {
    this.wiktionaryService = wiktionaryService;
    this.oxfordService = oxfordService;
    this.limitPreselectedExamples = config.limitPreselectedExamples;
  }

  async getWordResearch(word) {
    const { wiktionaryData, oxfordData } = {
      wiktionaryData: await this.wiktionaryService.getWord(word),
      oxfordData: await this.oxfordService.getWord(word),
    };

    const combined = defaultsDeep({}, wiktionaryData, oxfordData);

    if (Array.isArray(combined.examples) && Array.isArray(combined.usages)) {
      combined.examples = combined.examples.concat(combined.usages);
    }

    const preselectedExamples = combined.examples.slice(0, this.limitPreselectedExamples);

    combined.exampleSentenceDe = ResearchService.getPreselectedExamplesByLanguage(preselectedExamples, 'de');
    combined.exampleSentenceEn = ResearchService.getPreselectedExamplesByLanguage(preselectedExamples, 'en');

    return combined;
  }

  static getPreselectedExamplesByLanguage = (examples, language) =>
    examples
      .map(example => example[language])
      .filter(element => !!element)
      .join(', \n');
}

export default ResearchService;
