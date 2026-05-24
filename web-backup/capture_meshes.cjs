const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 600 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  const meshes = [
    'wire_143224087', 'wire_028089177', 'wire_229166215', 'wire_224086086',
    'wire_006134006', 'wire_087224198', 'wire_134006006', 'wire_177028149',
    'wire_224198087', 'wire_134110008'
  ];

  for (let i = 0; i < meshes.length; i++) {
    await page.evaluate((name) => window.highlightMesh(name), meshes[i]);
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: `C:/Users/artur/.gemini/antigravity/brain/4ba9f5f9-3fcb-4fb7-bd33-77ba46804e03/scratch/mesh_${meshes[i]}.png` });
    console.log(`Saved mesh_${meshes[i]}.png`);
  }

  await browser.close();
})();
