class WiktionaryDeAdapter {
  static getUri(word) {
    return `https://de.wiktionary.org/w/api.php?format=json&action=parse&prop=wikitext|categories|parsetree&redirects=1&contentmodel=wikitext&page=${word}`;
  }
}

export default WiktionaryDeAdapter;
