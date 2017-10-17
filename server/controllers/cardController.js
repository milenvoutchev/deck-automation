import { cardService, exportService, researchService } from '../services';
import CardService from '../services/cardService';
import asyncMiddleware from '../helpers/asyncMiddleware';

// @TODO is there no better way?
const validateCardInBody = (request) => {
  request.checkBody('wordDe', 'wordDe is required').notEmpty();
  request.checkBody('wordEn', 'wordEn is required').notEmpty();
  request.sanitize('wordDe').escape();
  request.sanitize('wordDe').trim();
  request.sanitize('wordEn').escape();
  request.sanitize('wordEn').trim();
  request.sanitize('lautschrift').escape();
  request.sanitize('lautschrift').trim();
  request.sanitize('wordType').escape();
  request.sanitize('wordType').trim();
  request.sanitize('verbPresentThirdPerson').escape();
  request.sanitize('verbPresentThirdPerson').trim();
  request.sanitize('verbPreteriteFirstPerson').escape();
  request.sanitize('verbPreteriteFirstPerson').trim();
  request.sanitize('verbPreteriteThirdPerson').escape();
  request.sanitize('verbPreteriteThirdPerson').trim();
  request.sanitize('verbPerfectAuxiliaryThird').escape();
  request.sanitize('verbPerfectAuxiliaryThird').trim();
  request.sanitize('verbPastParticiple').escape();
  request.sanitize('verbPastParticiple').trim();
  request.sanitize('nounArticle').escape();
  request.sanitize('nounArticle').trim();
  request.sanitize('nounPlural').escape();
  request.sanitize('nounPlural').trim();
  request.sanitize('nounGender').escape();
  request.sanitize('nounGender').trim();
  request.sanitize('exampleSentenceDe').escape();
  request.sanitize('exampleSentenceEn').trim();
};

const listAction = asyncMiddleware(async (request, response) => {
  const cards = await cardService.fetchAll(CardService.PROJECTION_SHORT);
  response.render('card_list', { title: 'Cards', cards });
});

const purgeAction = asyncMiddleware(async (request, response) => {
  if (request.method === 'POST') {
    const result = await cardService.purge();
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

    const card = await cardService.fetchByIdAndUpdate(request.body._id, request.body); // eslint-disable-line no-underscore-dangle

    return response.send(card);
  }

  const card = await cardService.fetchById(request.params.id);

  return response.render('card_update', card);
});

const createAction = asyncMiddleware(async (request, response) => {
  if (request.method === 'POST') {
    validateCardInBody(request);

    const errors = request.validationErrors();
    if (errors) {
      throw new Error(`Validation error: ${errors[0].msg}`);
    }

    const foundCard = await cardService.fetchOne({ wordDe: request.body.wordDe });
    if (foundCard) {
      console.log(`Already existing Card: ${foundCard.wordDe}`);
      return response.redirect(foundCard.url);
    }

    const card = await cardService.create(request.body);
    console.log(`Created card:${card._id}`); // eslint-disable-line no-underscore-dangle

    return response.redirect('/');
  }

  request.sanitize('q').escape().trim();

  const word = request.query.q;
  const wordResearch = await researchService.getWordResearch(word);

  return response.render('research', wordResearch);
});

const deleteAction = asyncMiddleware(async (request, response) => {
  // @TODO move to post with confirmation https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/forms

  const card = await cardService.delete(request.params.id);
  console.log(`Deleted card:${card._id}`); // eslint-disable-line no-underscore-dangle

  return response.redirect('/');
});

const exportAction = asyncMiddleware(async (request, response) => {
  const cards = await cardService.fetchStaged();

  const { content, format } = exportService.getExported(cards);
  const now = new Date().getTime(); // no need for hrtime, I reckon

  response.attachment(`staged-${now}.${format}`);
  response.send(content);
});

export default {
  listAction,
  createAction,
  purgeAction,
  updateAction,
  exportAction,
  deleteAction,
};
