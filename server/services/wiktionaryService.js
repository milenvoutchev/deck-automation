import got from 'got';
import convert from 'xml-js';

class WiktionaryService {
  constructor() {
    this.languageShort = 'de';
  }

  async fetchWordData(word) {
    const wiktionaryResponse = await got(this.getQuery(word), { json: true });
    const error = wiktionaryResponse.body.error;
    if (error) {
      throw new Error(`Error fetching word data: ${error.info}`);
    }

    return wiktionaryResponse.body;
  }

  async getWord(word) {
    const wordData = await this.fetchWordData(word);
    this.parsetree = wordData.parse.parsetree['*'];
    this.wikitext = wordData.parse.wikitext['*'];
    this.json = convert.xml2js(this.parsetree, { ignoreComment: true, addParent: true });

    return {
      word_de: this.getWordDe(),
      word_en: this.getWordEn(),
      genus: this.getGenus(),
    };
  }

  getQuery(word) {
    return `https://${this.languageShort}.wiktionary.org/w/api.php?format=json&action=parse&prop=wikitext|categories|parsetree&redirects=1&contentmodel=wikitext&page=${word}`;
  }

  getWordDe() {
    return this.wikitext.match(/\|Nominativ Singular=(\w+)\n\|/)[1];
  }
  getWordEn() {
    const re = /{{Ü\|en\|(\w+)}}/g;
    const found = this.wikitext.match(re)
      .map(fullMatch => fullMatch.match(/{{Ü\|en\|(\w+)}}/)[1]);

    return found.join(', ');
  }
  getGenus() {
    return this.wikitext.match(/\|Genus=(\w+)\n\|/i)[1];
  }
}

export default WiktionaryService;
