class ResearchService {
  constructor(wiktionaryService, oxfordService) {
    this.wiktionaryService = wiktionaryService;
    this.oxfordService = oxfordService;
  }

  async getWordResearch(word) {
    const oxfordData = this.oxfordService.getWord(word);
    const wiktionaryData = this.wiktionaryService.getWord(word);

    // run both parallel
    const combined = Object.assign({}, await wiktionaryData, await oxfordData);

    if (Array.isArray(combined.examples) && Array.isArray(combined.usages)) {
      combined.examples = combined.examples.concat(combined.usages);
    }

    combined.exampleSentenceDe = ResearchService.concatExamplesByLanguage(combined.examples, 'de');
    combined.exampleSentenceEn = ResearchService.concatExamplesByLanguage(combined.examples, 'en');

    return combined;
  }

  static concatExamplesByLanguage = (examples, language) =>
    examples
      .map(example => example[language])
      .filter(element => !!element)
      .join(', \n');
}

export default ResearchService;
