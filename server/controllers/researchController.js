import asyncMiddleware from '../helpers/asyncMiddleware';
import { wiktionaryService } from '../services';

const indexAction = asyncMiddleware(async (request, response) => {
  const researchData = await wiktionaryService.getWord(request.params.word);
  response.json(researchData);
});

export default {
  indexAction,
};
