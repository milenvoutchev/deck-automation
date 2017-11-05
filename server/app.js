/* eslint no-use-before-define: 0 */
/* eslint no-unused-vars: 0 */

import express from 'express';
import path from 'path';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import sassMiddleware from 'node-sass-middleware';
import mongoose from 'mongoose';
import expressValidator from 'express-validator';
import hbs from 'hbs';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import expressSession from 'express-session';
import config from './config';
import homeRouter from './routes/homeRouter';
import cardsRouter from './routes/cardsRouter';
import researchRouter from './routes/researchRouter';
import accountRouter from './routes/accountRouter';
import './helpers/handlebars';
import logger from './helpers/logger';
import Account from './models/Account';

hbs.registerPartials(path.join(__dirname, 'views/partials'));

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(sassMiddleware({
  src: path.join(__dirname, '../public'),
  dest: path.join(__dirname, '../public'),
  sourceMap: true,
}));
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(morgan('short')); // NB: logger is after express.static() meaning it will not log requests of static/existing files, e.g. .css
app.use(expressSession({
  saveUninitialized: true,
  resave: false,
  secret: config.session.secret,
  cookie: { httpOnly: true, maxAge: 2419200000 }, // configure when sessions expires
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', homeRouter);
app.use('/cards', cardsRouter);
app.use('/research', researchRouter);
app.use('/account', accountRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// setup passport
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// setup db
mongoose.Promise = Promise;
mongoose.connect(config.mongoDB.URI, {
  useMongoClient: true,
});
const db = mongoose.connection;
db.on('error', (error) => logger.error('DB error:', error));

module.exports = app;
