import config from '../config';
import ResearchService from './researchService';
import WiktionaryService from './wiktionaryService';
import OxfordService from './oxfordService';

const researchService = new ResearchService();
const wiktionaryService = new WiktionaryService();
const oxfordService = new OxfordService(config.oxford);

export {
  researchService,
  wiktionaryService,
  oxfordService,
};
