import asyncMiddleware from '../helpers/asyncMiddleware';
import { researchService } from '../services';

const concatExamplesByLanguage = (examples, language) =>
  examples
    .map(example => example[language])
    .filter(element => !!element)
    .join(', ');

const indexAction = asyncMiddleware(async (request, response) => {
  const word = request.query.q;
  const wordResearch = await researchService.getWordResearch(word);

  const exampleSentenceDe = concatExamplesByLanguage(wordResearch.examples, 'de');
  const exampleSentenceEn = concatExamplesByLanguage(wordResearch.examples, 'en');

  response.render('research', {
    ...wordResearch,
    exampleSentenceDe,
    exampleSentenceEn,
  });
});

const jsonAction = asyncMiddleware(async (request, response) => {
  const word = request.query.q;
  const wordResearch = await researchService.getWordResearch(word);

  // run both parallel
  response.json(wordResearch);
});

export default {
  indexAction,
  jsonAction,
};
