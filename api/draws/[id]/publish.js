const app = require('../../../server/server.js');

module.exports = (req, res) => {
  const id = req.query.id;
  req.url = `/api/draws/${id}/publish`;
  return app(req, res);
};
