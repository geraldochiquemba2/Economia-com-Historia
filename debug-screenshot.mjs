import puppeteer from 'puppeteer';

const BASE_URL = 'http://localhost:3001';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  
  console.log('Navegando para /login...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 3000));
  
  // Debug: check page content
  const html = await page.content();
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  console.log('Has email input:', html.includes('type="email"'));
  console.log('Has password input:', html.includes('type="password"'));
  console.log('Body text:', (await page.evaluate(() => document.body?.innerText?.substring(0, 300))) || 'empty');
  
  await page.screenshot({ path: 'screenshots/debug-login.png' });
  console.log('Debug screenshot saved');
  
  await browser.close();
})();
