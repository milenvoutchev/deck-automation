import List from '../models/List';
import asyncMiddleware from '../helpers/asyncMiddleware';
import { l10n, cardService } from '../services';
import CardService from '../services/cardService';

const indexAction = asyncMiddleware(async (request, response) => {
  const countList = await List.count();
  const countCard = await cardService.count();
  const countStaged = await cardService.countStaged();
  const cards = await cardService.fetchStaged(CardService.PROJECTION_SHORT);

  response.render('home', {
    ...l10n.home,
    countList: countList || 0,
    countCard: countCard || 0,
    countStaged: countStaged || 0,
    cards,
  });
});

export default {
  indexAction,
};
