/* eslint func-names: 0 */ // mongoose virtual().get() explicitly depends on passing `this` context, so es6 arrow functions break it's behavior
import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const CardSchema = Schema(
  {
    isStaged: { type: Boolean, required: true, default: true },
    wordDe: { type: String, required: true, max: 100 },
    wordEn: { type: String, required: true, max: 100 },
    exampleSentenceDe: { type: String }, // array ofStrings?
    exampleSentenceEn: { type: String },
  },
);

CardSchema
  .virtual('csv')
  .get(function () {
    return [
      this.wordDe,
      this.wordEn,
    ].join(',');
  });

CardSchema.virtual('url')
  .get(function () {
    return `/cards/${this._id}`; // eslint-disable-line no-underscore-dangle
  });

export default mongoose.model('Card', CardSchema);
