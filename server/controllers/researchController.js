import asyncMiddleware from '../helpers/asyncMiddleware';
import { wiktionaryService, oxfordService } from '../services';

const indexAction = asyncMiddleware(async (request, response) => {
  const wiktionaryData = await wiktionaryService.getWord(request.params.word);
  const oxfordData = await oxfordService.getWord(request.params.word);

  const results = { ...wiktionaryData, ...oxfordData };

  response.json(results);
});

export default {
  indexAction,
};
