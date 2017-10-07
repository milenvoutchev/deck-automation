import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CardSchema = Schema(
  {
    word_de: { type: String, required: true, max: 100 },
    word_en: { type: String, required: true, max: 100 },
    example_sentence_de: { type: String }, // array ofStrings?
    example_sentence_en: { type: String },
  },
);

CardSchema
  .virtual('csv')
  .get(() => [this.word_de, this.word_en].join(','));

export default mongoose.model('Card', CardSchema);
