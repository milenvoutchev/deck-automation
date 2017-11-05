import express from 'express';
import passport from 'passport';
import Account from '../models/Account';
import logger from '../helpers/logger';
import ensureAuthenticated from '../helpers/ensureAuthenticated';

const router = express.Router();

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', (req, res, next) => {
  Account.register(new Account({ username: req.body.username }), req.body.password, (err, account) => {
    if (err) {
      logger.error('Could not register account', account);
      return res.render('register', { account });
    }

    logger.info('Created account.');

    passport.authenticate('local')(req, res, function () {
      req.session.save(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    });
  });
});

router.get('/login', (req, res) => {
  res.render('login', { user: req.user });
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  logger.info('Logged in.');
  res.redirect('/');
});

router.get('/logout', (req, res) => {
  req.logout();
  logger.info('Logged out.');
  res.redirect('/');
});

router.get('/ping', ensureAuthenticated, (req, res) => {
  logger.debug('req.user', req.user);
  logger.debug('isAuthenticated', req.isAuthenticated());
  res.status(200).send('pong!');
});

module.exports = router;
