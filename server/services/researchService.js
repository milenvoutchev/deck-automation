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

    console.log((Array.isArray(combined.examples) && Array.isArray(combined.usages)));

    if (Array.isArray(combined.examples) && Array.isArray(combined.usages)) {
      combined.examples = combined.examples.concat(combined.usages);
    }

    return combined;
  }
}

export default ResearchService;
