import List from '../models/List';
import Card from '../models/Card';
import asyncMiddleware from '../helpers/asyncMiddleware';
import { l10n } from '../services';

const indexAction = asyncMiddleware(async (request, response) => {
  const countList = await List.count();
  const countCard = await Card.count();
  const countCardStaged = await Card.count({ isStaged: true });

  response.render('home', {
    ...l10n.home,
    countList: countList || 0,
    countCard: countCard || 0,
    countCardStaged: countCardStaged || 0,
  });
});

export default {
  indexAction,
};
