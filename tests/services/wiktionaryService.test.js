/* eslint-disable no-unused-vars */
import sinon from 'sinon';
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

    it('renders correctly against saved snapshots', () => {
      const { wikitext, categories } = mocks.rawData;
      const wordResearch = wiktionaryService.createWordResearch(wikitext, categories);

      // expect(JSON.stringify(wordResearch)).toBe(JSON.stringify(wiktionarySnapshots.expected));
      expect(wordResearch).toMatchSnapshot();
    });
  });
});
