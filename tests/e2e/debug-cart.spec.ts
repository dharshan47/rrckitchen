import { test } from '@playwright/test';

test('check /cart response completeness', async ({ page }) => {
  const t0 = Date.now();
  const res = (await page.goto('/cart', { waitUntil: 'domcontentloaded', timeout: 30000 }))!;
  const initHeaders = await res.allHeaders();
  const bodyPromise = res.text();
  const body = await Promise.race([
    bodyPromise,
    new Promise<string>((_, reject) => setTimeout(() => reject(new Error('response.text() never resolved (stream stuck)')), 25000)),
  ]);
  const ms = Date.now() - t0;
  console.log(`status=${res.status()} encoding=${initHeaders['content-encoding']} chunked=${initHeaders['transfer-encoding']}`);
  console.log(`body length=${body.length} after ${ms}ms`);
  console.log('--- tail (last 1500 chars) ---');
  console.log(body.slice(-1500));
});