const { app, initializeApp } = require('../server/src/app');

module.exports = async (req, res) => {
  await initializeApp();
  return app(req, res);
};