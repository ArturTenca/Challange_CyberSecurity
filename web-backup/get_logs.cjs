const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.text().includes('MESH:')) {
      console.log(msg.text());
    }
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await browser.close();
})();
