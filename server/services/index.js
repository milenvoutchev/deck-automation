import config from '../config';
import l10n from '../l10n';
import ResearchService from './researchService';
import WiktionaryService from './wiktionaryService';
import OxfordService from './oxfordService';
import CardService from './cardService';
import ExportService from './exportService';
import Card from '../models/Card';

const wiktionaryService = new WiktionaryService();
const oxfordService = new OxfordService(config.oxford);
const researchService = new ResearchService(wiktionaryService, oxfordService, config.research);
const cardService = new CardService(Card);
const exportService = new ExportService(config.export);

export {
  researchService,
  wiktionaryService,
  oxfordService,
  l10n,
  cardService,
  exportService,
};
