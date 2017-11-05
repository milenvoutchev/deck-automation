/* eslint no-underscore-dangle: */

import { cardService, exportService, researchService } from '../services';
import CardService from '../services/cardService';
import asyncMiddleware from '../helpers/asyncMiddleware';
import logger from '../helpers/logger';

// @TODO is there no better way?
const validateCardInBody = (request) => {
  request.checkBody('wordDe', 'wordDe is required').notEmpty();
  request.checkBody('wordEn', 'wordEn is required').notEmpty();
  request.sanitize('wordDe').trim();
  request.sanitize('wordEn').trim();
  request.sanitize('lautschrift').trim();
  request.sanitize('wordType').trim();
  request.sanitize('verbPresentThirdPerson').trim();
  request.sanitize('verbPreteriteFirstPerson').trim();
  request.sanitize('verbPreteriteThirdPerson').trim();
  request.sanitize('verbPerfectAuxiliaryThird').trim();
  request.sanitize('verbPastParticiple').trim();
  request.sanitize('nounArticle').trim();
  request.sanitize('nounPlural').trim();
  request.sanitize('nounGender').trim();
  request.sanitize('exampleSentenceDe').trim();
  request.sanitize('exampleSentenceEn').trim();
};

const getExistingCardByWord = (wordDe) => cardService.fetchOne({ wordDe });

const listAction = asyncMiddleware(async (request, response) => {
  const cards = await cardService.fetchAll(CardService.PROJECTION_SHORT);
  response.render('card_list', { title: 'Cards', cards });
});

const purgeAction = asyncMiddleware(async (request, response) => {
  if (request.method === 'POST') {
    const result = await cardService.purge();
    logger.info('Purged all cards'); // eslint-disable-line no-underscore-dangle
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

    await cardService.fetchByIdAndUpdate(request.body._id, request.body); // eslint-disable-line no-underscore-dangle
    logger.info(`Updated card: ${request.body._id}`); // eslint-disable-line no-underscore-dangle

    return response.redirect('/');
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

    const foundCard = await getExistingCardByWord(request.body.wordDe);
    if (foundCard) {
      throw new Error(`Card already exists: ${foundCard._id}`);
    }

    const card = await cardService.create(request.body);
    logger.info(`Created card:${card._id}`);

    return response.redirect('/');
  }

  request.sanitize('q').escape().trim();
  const word = request.query.q;

  const foundCard = await getExistingCardByWord(word);
  if (foundCard) {
    logger.info(`Already existing Card: ${foundCard._id}`);
    return response.redirect(foundCard.url);
  }
  logger.info(`New card: ${request.query.q}`);

  const wordResearch = await researchService.getWordResearch(word);

  return response.render('card_update', wordResearch);
});

const deleteAction = asyncMiddleware(async (request, response) => {
  const card = await cardService.fetchById(request.params.id);
  if (request.method === 'POST') {
    const deleted = await cardService.delete(request.params.id);
    logger.info(`Deleted card: ${deleted._id}`);

    return response.redirect('/');
  }

  return response.render('delete', card);
});

const exportAction = asyncMiddleware(async (request, response) => {
  const cards = await cardService.fetchStaged();

  const { content, format } = exportService.getExported(cards);
  const now = new Date().getTime(); // used to generate unique-ish filename; high-res time (hrtime()) would be overkill though

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
