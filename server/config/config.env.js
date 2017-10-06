require('dotenv').config({ silent: true });

module.exports = {
  mongoDB: {
    URI: process.env.MONGODB_URI,
  },
};
