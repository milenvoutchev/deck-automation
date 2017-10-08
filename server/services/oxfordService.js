import got from 'got';

class OxfordService {
  constructor(config) {
    this.apiURL = config.apiURL;
    this.appId = config.appId;
    this.appKey = config.appKey;
  }

  async fetchRawData(word) {
    return `${this.apiURL}?${word}`;
  }

  async getWord(word) {
    console.log('OxfordService.getWord');
    return {
      temp: this.fetchRawData(word),
    };
  }
}

export default OxfordService;
