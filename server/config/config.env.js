require('dotenv').config({ silent: true });

module.exports = {
  mongoDB: {
    URI: process.env.MONGODB_URI,
  },
  oxford: {
    apiURL: process.env.OXFORD_API_URL,
    appId: process.env.OXFORD_APP_ID,
    appKey: process.env.OXFORD_APP_KEY,
  },
};
