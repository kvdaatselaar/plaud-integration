import * as path from 'node:path';
import * as os from 'node:os';
import { chromium } from 'playwright';
import { PlaudConfig } from '../src/plaud/index.js';
import type { PlaudTokenData } from '../src/plaud/types.js';

const PROFILE_DIR = path.join(os.homedir(), '.plaud-integration', 'browser-profile');
const TIMEOUT_MS = 3 * 60_000;

function decodePayload(jwt: string): any {
  const parts = jwt.split('.');
  if (parts.length !== 3) throw new Error('Not a JWT');
  return JSON.parse(Buffer.from(parts[1], 'base64url').toString());
}

async function main(): Promise<void> {
  console.log(`Launching Chrome with profile at ${PROFILE_DIR}`);
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: false,
    viewport: { width: 1280, height: 800 },
  }).catch(async err => {
    if (String(err).includes('Chromium distribution') || String(err).includes("channel")) {
      console.log('Chrome not found via channel — falling back to bundled Chromium.');
      console.log('If this fails, run once: npx playwright install chromium');
      return chromium.launchPersistentContext(PROFILE_DIR, {
        headless: false,
        viewport: { width: 1280, height: 800 },
      });
    }
    throw err;
  });

  const state: { captured: { token: string; region: 'eu' | 'us' } | null } = { captured: null };

  context.on('request', (req) => {
    if (state.captured) return;
    const url = req.url();
    if (!(url.includes('api-euc1.plaud.ai') || url.includes('api.plaud.ai'))) return;
    const auth = req.headers()['authorization'];
    if (!auth || !auth.toLowerCase().startsWith('bearer ')) return;
    const token = auth.slice(7).trim();
    try {
      const payload = decodePayload(token);
      if (typeof payload.exp !== 'number') return;
      const region = url.includes('euc1') ? 'eu' : 'us';
      state.captured = { token, region };
      const daysLeft = Math.round(((payload.exp ?? 0) * 1000 - Date.now()) / 86_400_000);
      console.log(`✓ Captured bearer (${region}, expires in ${daysLeft}d) via ${new URL(url).pathname}`);
    } catch {
      /* non-JWT, skip */
    }
  });

  const page = context.pages()[0] ?? (await context.newPage());
  await page.goto('https://app.plaud.ai', { waitUntil: 'domcontentloaded' }).catch(() => {/* continue */});

  console.log('');
  console.log('Browser is open. If needed:');
  console.log('  1. Log in with Google.');
  console.log('  2. Wait tot de app je opnames toont (API-calls fire automatisch).');
  console.log('  3. Dit venster sluit zichzelf zodra de token is opgepakt.');
  console.log('');

  const start = Date.now();
  while (!state.captured && Date.now() - start < TIMEOUT_MS) {
    await new Promise(r => setTimeout(r, 250));
  }

  const result = state.captured;
  if (!result) {
    await context.close();
    throw new Error(`Timeout na ${TIMEOUT_MS / 1000}s — geen bearer opgevangen. Log in en klik op "Files" / "Recordings" om API-calls te triggeren.`);
  }

  const payload = decodePayload(result.token);
  const tokenData: PlaudTokenData = {
    accessToken: result.token,
    tokenType: 'Bearer',
    issuedAt: (payload.iat ?? 0) * 1000,
    expiresAt: (payload.exp ?? 0) * 1000,
  };

  const config = new PlaudConfig();
  config.saveToken(tokenData);
  config.save({ credentials: { region: result.region } });

  console.log(`\nToken opgeslagen in ~/.plaud/config.json`);
  console.log(`Expires: ${new Date(tokenData.expiresAt).toISOString()}`);

  await context.close();
  console.log('Browser gesloten. Test met: npm run sync');
}

main().catch(err => {
  console.error('\nBrowser-login failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
