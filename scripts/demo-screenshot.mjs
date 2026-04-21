import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  const browser = await chromium.launch({ headless: true, slowMo: 300 });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  page.setDefaultTimeout(20000);

  // 1. Login
  console.log('1. Navegando a /login...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  console.log('2. Ingresando credenciales...');
  await page.fill('#email', 'usuario-a@test.com');
  await page.fill('#password', 'Claudecode2026*');
  await page.click('button[type="submit"]');

  // 2. Wait for dashboard
  console.log('3. Esperando dashboard...');
  await page.waitForURL('**/dashboard', { timeout: 20000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // 3. Click "Nueva Tarea"
  console.log('4. Abriendo modal Nueva Tarea...');
  await page.click('button:has-text("Nueva Tarea")');
  await page.waitForTimeout(800);

  // Screenshot modal open (empty)
  await page.screenshot({ path: path.join(__dirname, '../screenshot-modal-open.png') });

  // 4. Fill form
  console.log('5. Llenando formulario...');
  await page.fill('#title', 'Demo MCP en vivo');
  await page.selectOption('#priority', 'high');
  await page.waitForTimeout(400);

  // Screenshot with modal filled
  const screenshotModal = path.join(__dirname, '../screenshot-modal-filled.png');
  await page.screenshot({ path: screenshotModal });
  console.log('Screenshot del modal listo guardado.');

  // 5. Submit
  console.log('6. Creando tarea...');
  await page.click('button:has-text("Crear Tarea")');
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle');

  // Check for error
  const errorEl = await page.locator('.text-red-400').first().textContent().catch(() => null);
  if (errorEl) {
    console.log('Error:', errorEl);
  }

  // 6. Final screenshot showing the dashboard with the new task
  console.log('7. Tomando screenshot final del dashboard...');
  const screenshotFinal = path.join(__dirname, '../screenshot-task-created.png');
  await page.screenshot({ path: screenshotFinal });
  console.log('Screenshot final guardado:', screenshotFinal);

  // Check task visibility
  const taskVisible = await page.locator('text=Demo MCP en vivo').count();
  console.log('Tarea visible en dashboard:', taskVisible > 0 ? 'SI ✓' : 'NO - puede requerir reload');

  if (taskVisible === 0) {
    console.log('Recargando...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const screenshotReloaded = path.join(__dirname, '../screenshot-task-reloaded.png');
    await page.screenshot({ path: screenshotReloaded });
    const taskVisibleAfterReload = await page.locator('text=Demo MCP en vivo').count();
    console.log('Tarea visible tras reload:', taskVisibleAfterReload > 0 ? 'SI ✓' : 'NO');
  }

  await browser.close();
  console.log('Proceso completado.');
})();
