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
  research: {
    limitPreselectedExamples: process.env.LIMIT_PRESELECTED_EXAMPLES,
  },
  export: {
    fields: process.env.EXPORT_FIELDS,
  },
  app: {
    sessionSecret: process.env.APP_SESSION_SECRET,
    disableAuth: process.env.APP_DISABLE_AUTH,
  },
};
