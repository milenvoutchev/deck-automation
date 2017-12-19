/* eslint-disable no-unused-vars */
import sinon from 'sinon';
import WiktionaryService from '../../server/services/wiktionaryService';

describe('wiktionaryService', () => {
  describe('#isValidWordType', () => {
    it('correctly recognises valid/invalid word types', () => {
      console.log(WiktionaryService.isValidWordType('Substantiv'));
      expect(WiktionaryService.isValidWordType('Substantiv')).toBeTruthy();
      expect(WiktionaryService.isValidWordType('WORD_TYPE_DECLINED_FORM')).toBeFalsy();
    });
  });
});
