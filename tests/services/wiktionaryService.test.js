/* eslint-disable no-unused-vars */
import WiktionaryService from '../../server/services/wiktionaryService';
import mocks from '../mocks/wiktionary.json';

describe('wiktionaryService', () => {
  describe('createWordResearch()', () => {
    const wiktionaryService = new WiktionaryService();

    it('created objects are as expected, according to stored data set', () => {
      expect.assertions(2);

      for(const mock of mocks) {
        const { wikitext, categories } = mock.rawData;
        const wordResearch = wiktionaryService.createWordResearch(wikitext, categories);
        expect(wordResearch).toEqual(mock.expected);
      }
    });
  });

  describe('isValidWordType()', () => {
    it('correctly recognises valid/invalid word types', () => {
      expect(WiktionaryService.isValidWordType('Verb')).toBeTruthy();
      expect(WiktionaryService.isValidWordType('Substantiv')).toBeTruthy();
      expect(WiktionaryService.isValidWordType('Adjektiv')).toBeTruthy();
      expect(WiktionaryService.isValidWordType('Deklinierte Form')).toBeFalsy();
    });
  });

  describe('getLanguageTranslations()', () => {
    // Test here abnormal cases (presume that the most common cases are tested with 'createWordResearch()')

    it('containing ISO tag', () => {
      const input = "\n*{{bg}} <small>([[w:ISO 9|ISO 9]])</small>: [1] {{Üt|bg|герб|gerb}} {{m}}\n*";
      const expected = [ { code: '[1]', translations: [ 'герб' ] } ];
      expect(WiktionaryService.getLanguageTranslations(input, 'bg')).toEqual(expected);
    });
  });
});
