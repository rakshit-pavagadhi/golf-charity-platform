const app = require('../../server/server.js');
const withPrefix = require('../_withPrefix');

module.exports = withPrefix(app, '/api/charities');
