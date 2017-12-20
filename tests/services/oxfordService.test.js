/* eslint-disable no-unused-vars */
import OxfordService from '../../server/services/oxfordService';
import mocks from '../mocks/oxford.json';

describe('wiktionaryService', () => {
  describe('createWordResearch()', () => {
    const config = {
      apiURL: null,
      appId: null,
      appKey: null,
      sourceLanguage: 'de',
      translationLanguage: 'en',
    };
    const oxfordService = new OxfordService(config);

    it('created objects are as expected, according to stored data set', () => {
      expect.assertions(2);

      for(const mock of mocks) {
        const wordResearch = oxfordService.createWordResearch(mock.rawData);
        expect(wordResearch).toEqual(mock.expected);
      }
    });

  });

});
