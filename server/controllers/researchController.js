import asyncMiddleware from '../helpers/asyncMiddleware';
import { researchService } from '../services';


const jsonAction = asyncMiddleware(async (request, response) => {
  const word = request.query.q;
  const wordResearch = await researchService.getWordResearch(word);

  response.json(wordResearch);
});

export default {
  jsonAction,
};
