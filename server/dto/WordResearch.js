const structure = {
  wordDe: undefined,
  wordEn: undefined,
  wordType: undefined,
  lautschrift: undefined,
  verbPresentThirdPerson: undefined,
  verbPreteriteFirstPerson: undefined,
  verbPreteriteThirdPerson: undefined,
  verbPerfectAuxiliaryThird: undefined,
  verbPastParticiple: undefined,
  nounArticle: undefined,
  nounPlural: undefined,
  nounGender: undefined,
  usages: undefined,
  examples: undefined,
};

export default class WordResearch {
  constructor(passedProperties) {
    return Object.assign(Object.seal(structure), passedProperties);
  }
}
