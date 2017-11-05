import express from 'express';
import passport from 'passport';
// import Account from '../models/Account';
import logger from '../helpers/logger';

const router = express.Router();

/* Disabled registration until app can support multiple users
router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', (req, res, next) => {
  const newAccount = new Account({ username: req.body.username });
  Account.register(newAccount, req.body.password, (err, account) => {
    if (err) {
      logger.error('Could not register account', account);
      return res.render('register', { account });
    }

    logger.info('Created account.');
    return res.redirect('/');
  });
});
*/

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

module.exports = router;
