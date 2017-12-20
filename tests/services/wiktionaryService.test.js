/* eslint-disable no-unused-vars */
import WiktionaryService from '../../server/services/wiktionaryService';
import mocks from '../mocks/wiktionary.json';

describe('wiktionaryService', () => {

  describe('isValidWordType()', () => {
    it('correctly recognises valid/invalid word types', () => {
      expect(WiktionaryService.isValidWordType('Verb')).toBeTruthy();
      expect(WiktionaryService.isValidWordType('Substantiv')).toBeTruthy();
      expect(WiktionaryService.isValidWordType('Adjektiv')).toBeTruthy();
      expect(WiktionaryService.isValidWordType('Deklinierte Form')).toBeFalsy();
    });
  });

  describe('createWordResearch()', () => {
    const wiktionaryService = new WiktionaryService();

    it('created objects are as expected according to stored data set', () => {

      for(const mock of mocks) {
        const { wikitext, categories } = mock.rawData;
        const wordResearch = wiktionaryService.createWordResearch(wikitext, categories);
        // JSON.stringify needed for when there were 'undefined' values (e.g. for wordEn: undefined)
        expect(JSON.stringify(wordResearch)).toBe(JSON.stringify(mock.expected));
      }
    });
  });
});
