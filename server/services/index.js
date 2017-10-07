// import config from '../config';
import ResearchService from './researchService';
import WiktionaryService from './wiktionaryService';
// import WiktionaryDeAdapter from './adapters/wiktionaryDeAdapter';

const researchService = new ResearchService();
const wiktionaryService = new WiktionaryService();

export {
  researchService,
  wiktionaryService,
};
