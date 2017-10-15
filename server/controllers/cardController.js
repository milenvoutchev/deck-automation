import Card from '../models/Card';
import asyncMiddleware from '../helpers/asyncMiddleware';

// @TODO is there no better way?
const validateCardInBody = (request) => {
  request.checkBody('wordDe', 'wordDe is required').notEmpty();
  request.checkBody('wordEn', 'wordEn is required').notEmpty();
  request.sanitize('wordDe').escape();
  request.sanitize('wordDe').trim();
  request.sanitize('wordEn').escape();
  request.sanitize('wordEn').trim();
  request.sanitize('exampleSentenceDe').escape();
  request.sanitize('exampleSentenceDe').trim();
  request.sanitize('exampleSentenceEn').escape();
  request.sanitize('exampleSentenceEn').trim();
};

const listAction = asyncMiddleware(async (request, response) => {
  const cards = await Card.find({}, 'isStaged wordDe wordEn url');
  response.render('card_list', { title: 'Cards', cards });
});

const purgeAction = asyncMiddleware(async (request, response) => {
  if (request.method === 'POST') {
    const result = await Card.deleteMany({});
    return response.send(`Purged ${result.deletedCount} cards.`);
  }
  return response.render('purge');
});

const updateAction = asyncMiddleware(async (request, response) => {
  if (request.method === 'POST') {
    validateCardInBody(request);

    const errors = request.validationErrors();
    if (errors) {
      throw new Error(`Validation error: ${errors[0].msg}`);
    }

    const result = await Card.findByIdAndUpdate(request.body._id, request, { // eslint-disable-line no-underscore-dangle
      new: true,
    });
    return response.send(result);
  }
  console.log(request.params);

  const card = await Card.findById(request.params.id); // eslint-disable-line no-underscore-dangle
  console.log(card.wordDe);

  return response.render('card_update', card);
});

const createAction = asyncMiddleware(async (request, response) => {
  validateCardInBody(request);

  const errors = request.validationErrors();
  if (errors) {
    throw new Error(`Validation error: ${errors[0].msg}`);
  }

  const foundCard = await Card.findOne({ wordDe: request.body.wordDe });
  if (foundCard) {
    console.log(`Already existing Card: ${foundCard.wordDe}`);
    return response.redirect(foundCard.url);
  }

  const card = await Card.create({
    wordDe: request.body.wordDe,
    wordEn: request.body.wordEn,
    exampleSentenceDe: request.body.exampleSentenceDe,
    exampleSentenceEn: request.body.exampleSentenceEn,
  });

  return response.send(card);
});

const detailAction = (request, response) => {
  response.send('NOT IMPLEMENTED: detailAction');
};

export default {
  listAction,
  detailAction,
  createAction,
  purgeAction,
  updateAction,
};
