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
  .get(() => [this.word_de, this.word_en].join(','));

export default mongoose.model('Card', CardSchema);
