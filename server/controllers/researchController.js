import defaultsDeep from 'lodash/defaultsDeep';
import asyncMiddleware from '../helpers/asyncMiddleware';
import { wiktionaryService, oxfordService } from '../services';

const indexAction = asyncMiddleware(async (request, response) => {
  const oxfordData = oxfordService.getWord(request.params.word);
  const wiktionaryData = wiktionaryService.getWord(request.params.word);

  // run both parallel
  const results = defaultsDeep(await wiktionaryData, await oxfordData);

  response.json(results);
});

export default {
  indexAction,
};
