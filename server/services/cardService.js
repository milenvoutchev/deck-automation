
class CardService {
  static PROJECTION_SHORT = 'isStaged wordDe wordEn url';

  constructor(Card) {
    this.Card = Card;
  }

  fetchStaged(projection = null) {
    return this.Card.find({ isStaged: true }, projection);
  }

  fetchAll(projection = null) {
    return this.Card.find({}, projection);
  }

  fetchOne(conditions = {}, projection = null) {
    return this.Card.findOne(conditions, projection);
  }

  fetchById(id) {
    return this.Card.findById(id);
  }

  purge() {
    return this.Card.deleteMany({});
  }

  delete(id) {
    return this.Card.findByIdAndRemove(id);
  }

  fetchByIdAndUpdate(id, update = {}) {
    return this.Card.findByIdAndUpdate(id, update, {
      new: true,
    });
  }

  create(docs = {}) {
    return this.Card.create(docs);
  }

  countStaged() {
    return this.Card.count({ isStaged: true });
  }

  count(conditions) {
    return this.Card.count(conditions);
  }
}

export default CardService;
