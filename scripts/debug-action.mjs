import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // Intercept all responses
  page.on('response', async (response) => {
    if (response.url().includes('localhost:3000') && response.status() >= 400) {
      const body = await response.text().catch(() => '(no body)');
      console.log(`\n[${response.status()}] ${response.url()}`);
      console.log('Body:', body.substring(0, 1000));
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
  });

  // Login
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('#email', 'usuario-a@test.com');
  await page.fill('#password', 'Claudecode2026*');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 20000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Open modal and submit
  await page.click('button:has-text("Nueva Tarea")');
  await page.waitForTimeout(500);
  await page.fill('#title', 'Debug Test');
  await page.selectOption('#priority', 'high');
  await page.waitForTimeout(300);

  console.log('\nSubmitting form...');
  await page.click('button:has-text("Crear Tarea")');
  await page.waitForTimeout(5000);

  // Check error text
  const errorEl = await page.locator('.text-red-400').textContent().catch(() => null);
  console.log('\nError en modal:', errorEl);

  await browser.close();
})();
