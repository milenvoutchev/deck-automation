import List from '../models/list';
import Card from '../models/card';
import asyncMiddleware from '../helpers/asyncMiddleware';

const indexAction = asyncMiddleware(async (request, response, next) => {
  const countList = await List.count();
  const countCard = await Card.count();
  response.render('index', {
    title: 'Hello',
    countList: countList || 0,
    countCard: countCard || 0,
  });
});

export default {
  indexAction,
};
