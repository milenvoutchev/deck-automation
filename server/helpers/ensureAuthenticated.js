const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    // req.user is available for use here
    return next();
  }

  // denied. redirect to login
  return res.redirect('/account/login');
};
export default ensureAuthenticated;
