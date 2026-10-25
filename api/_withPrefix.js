module.exports = (app, prefix) => (req, res) => {
  if (!req.url.startsWith(prefix)) {
    req.url = `${prefix}${req.url.startsWith('/') ? req.url : `/${req.url}`}`;
  }
  return app(req, res);
};
