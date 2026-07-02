import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3001';
const OUTPUT_DIR = path.join(process.cwd(), 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const pages = [
  { name: '01-Login', url: '/login', wait: 2000 },
  { name: '02-Register', url: '/register', wait: 2000 },
  { name: '03-Home', url: '/app', wait: 3000, login: true },
  { name: '04-Explore', url: '/app/explore', wait: 3000 },
  { name: '05-Quiz', url: '/app/quiz', wait: 3000 },
  { name: '06-Rankings', url: '/app/rankings', wait: 3000 },
  { name: '07-Forum', url: '/app/forum', wait: 3000 },
  { name: '08-Profile', url: '/app/profile', wait: 3000 },
  { name: '09-Admin-Dashboard', url: '/admin', wait: 3000 },
  { name: '10-Admin-Content', url: '/admin/content', wait: 3000 },
  { name: '11-Admin-Review', url: '/admin/review', wait: 3000 },
  { name: '12-Admin-Users', url: '/admin/users', wait: 3000 },
  { name: '13-Admin-Quiz', url: '/admin/quiz', wait: 3000 },
];

async function login(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'admin@isptec.co.ao');
  await page.type('input[type="password"]', '1234567890');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));
}

(async () => {
  console.log('A iniciar browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Login first
  console.log('A fazer login...');
  await login(page);

  for (const p of pages) {
    try {
      console.log(`A capturar: ${p.name}`);
      await page.goto(`${BASE_URL}${p.url}`, { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, p.wait));
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `${p.name}.png`),
        fullPage: false,
      });
      console.log(`  OK: ${p.name}.png`);
    } catch (err) {
      console.log(`  ERRO: ${p.name} - ${err.message}`);
    }
  }

  // Mobile screenshots
  console.log('\nA capturar versao mobile...');
  await page.setViewport({ width: 390, height: 844 });

  const mobilePages = [
    { name: 'Mobile-Home', url: '/app' },
    { name: 'Mobile-Explore', url: '/app/explore' },
    { name: 'Mobile-Quiz', url: '/app/quiz' },
    { name: 'Mobile-Profile', url: '/app/profile' },
  ];

  for (const p of mobilePages) {
    try {
      console.log(`A capturar: ${p.name}`);
      await page.goto(`${BASE_URL}${p.url}`, { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, 3000));
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `${p.name}.png`),
        fullPage: false,
      });
      console.log(`  OK: ${p.name}.png`);
    } catch (err) {
      console.log(`  ERRO: ${p.name} - ${err.message}`);
    }
  }

  await browser.close();
  console.log(`\nScreenshots guardados em: ${OUTPUT_DIR}`);
  console.log(`Total: ${fs.readdirSync(OUTPUT_DIR).length} imagens`);
})();
