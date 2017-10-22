const hbs = require('hbs');

hbs.registerHelper('json', context => (typeof context === 'string' ? context : JSON.stringify(context)));
