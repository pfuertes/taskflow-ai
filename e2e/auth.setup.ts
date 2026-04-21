import { test as setup, expect } from '@playwright/test';
import path from 'path';

const STORAGE_STATE = path.join(__dirname, '../playwright/.auth/user.json');

/**
 * Authenticates against the Supabase REST API and persists the browser session
 * so all E2E tests can reuse it without going through the login UI each time.
 *
 * Required env vars (add to .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   TEST_USER_EMAIL      — email of a test user that exists in Supabase
 *   TEST_USER_PASSWORD   — password for that test user
 */
setup('authenticate', async ({ request, page }) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // 1. Exchange credentials for tokens via Supabase Auth REST API
  const res = await request.post(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      headers: {
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      data: {
        email: process.env.TEST_USER_EMAIL!,
        password: process.env.TEST_USER_PASSWORD!,
      },
    }
  );

  expect(res.ok(), `Supabase auth failed: ${await res.text()}`).toBeTruthy();
  const session = await res.json();

  // 2. Inject the session cookie that @supabase/ssr expects on the server side.
  //    The cookie name is derived from the project ref in the Supabase URL.
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  const cookieName = `sb-${projectRef}-auth-token`;
  const cookieValue = encodeURIComponent(
    JSON.stringify({
      access_token: session.access_token,
      token_type: 'bearer',
      expires_in: session.expires_in,
      expires_at: session.expires_at,
      refresh_token: session.refresh_token,
      user: session.user,
    })
  );

  await page.context().addCookies([
    {
      name: cookieName,
      value: cookieValue,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);

  // 3. Confirm the session grants access to the protected route
  await page.goto('/dashboard');
  await expect(page).toHaveURL('/dashboard');

  // 4. Persist browser state (cookies + localStorage) for all dependent tests
  await page.context().storageState({ path: STORAGE_STATE });
});
