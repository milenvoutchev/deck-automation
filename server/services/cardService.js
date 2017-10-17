
class CardService {
  static PROJECTION_SHORT = 'isStaged wordDe wordEn url';

  constructor(Card) {
    this.Card = Card;
  }

  async fetchStaged(projection = null) {
    return this.Card.find({ isStaged: true }, projection);
  }

  async fetchAll(projection = null) {
    return this.Card.find({}, projection);
  }

  async fetchOne(conditions = {}, projection = null) {
    return this.Card.findOne(conditions, projection);
  }

  async fetchById(id) {
    return this.Card.findById(id);
  }

  async purge() {
    return this.Card.deleteMany({});
  }

  async delete(id) {
    return this.Card.findByIdAndRemove(id);
  }

  async fetchByIdAndUpdate(id, update = {}) {
    return this.Card.findByIdAndUpdate(id, update, {
      new: true,
    });
  }

  async create(docs = {}) {
    return this.Card.create(docs);
  }

  async countStaged() {
    return this.Card.count({ isStaged: true });
  }

  async count(conditions) {
    return this.Card.count(conditions);
  }
}

export default CardService;
