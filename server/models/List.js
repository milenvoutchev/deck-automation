import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ListSchema = new Schema(
  {
    name: { type: String, required: true, max: 100 },
    cards: [{ type: Schema.ObjectId, ref: 'Genre' }],
  },
);

export default mongoose.model('List', ListSchema);
