import List from '../models/List';
import Card from '../models/Card';
import asyncMiddleware from '../helpers/asyncMiddleware';
import { l10n } from '../services';

const indexAction = asyncMiddleware(async (request, response) => {
  const countList = await List.count();
  const countCard = await Card.count();

  response.render('home', {
    ...l10n.home,
    countList: countList || 0,
    countCard: countCard || 0,
  });
});

export default {
  indexAction,
};
