import config from '../config';
import l10n from '../l10n';
import ResearchService from './researchService';
import WiktionaryService from './wiktionaryService';
import OxfordService from './oxfordService';

const wiktionaryService = new WiktionaryService();
const oxfordService = new OxfordService(config.oxford);
const researchService = new ResearchService(wiktionaryService, oxfordService);

export {
  researchService,
  wiktionaryService,
  oxfordService,
  l10n,
};
