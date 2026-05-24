const { app, initializeApp, purgeExpiredRecords, secureLog, config } = require('./app');

async function start() {
  await initializeApp();
  setInterval(purgeExpiredRecords, 24 * 60 * 60 * 1000);

  app.listen(config.port, () => {
    secureLog('info', 'server_started', {
      port: config.port,
      corsOrigins: config.corsOrigins,
    });
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
