import config from '../config';

const ensureAuthenticated = (req, res, next) => {
  if (config.app.disableAuth || req.isAuthenticated()) {
    // req.user is available for use here
    res.locals.user = req.user;

    return next();
  }

  // denied. redirect to login
  return res.redirect('/account/login');
};
export default ensureAuthenticated;
