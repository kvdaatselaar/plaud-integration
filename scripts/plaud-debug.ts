import { PlaudAuth, PlaudClient, PlaudConfig } from '../src/plaud/index.js';
import { BASE_URLS } from '../src/plaud/types.js';

async function main(): Promise<void> {
  const id = process.argv[2];
  if (!id) {
    console.error('Usage: npm run plaud:debug -- <recording-id>');
    console.error('(tip: npm run plaud:debug -- --list  geeft een ID-lijst)');
    process.exit(1);
  }

  const plaudConfig = new PlaudConfig();
  const creds = plaudConfig.getCredentials();
  const region = creds?.region ?? 'eu';
  const client = new PlaudClient(new PlaudAuth(plaudConfig), region);

  if (id === '--list') {
    const recs = await client.listRecordings();
    for (const r of recs.slice(0, 10)) {
      const date = new Date(r.start_time).toISOString().slice(0, 16).replace('T', ' ');
      console.log(`${r.id}  ${date}  ${r.filename}`);
    }
    return;
  }

  // Raw /file/detail to see full shape
  const auth = new PlaudAuth(plaudConfig);
  const token = await auth.getToken();
  const base = BASE_URLS[region] ?? BASE_URLS['us'];
  const res = await fetch(`${base}/file/detail/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const raw: any = await res.json();
  const data = raw.data ?? raw;

  console.log('=== Top-level keys ===');
  console.log(Object.keys(data));

  const list = data.pre_download_content_list ?? [];
  console.log(`\n=== pre_download_content_list (${list.length} items) ===`);
  for (const [i, item] of list.entries()) {
    console.log(`\n--- item #${i} ---`);
    console.log('keys:', Object.keys(item));
    const preview: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(item)) {
      if (typeof v === 'string') {
        preview[k] = v.length > 200 ? `${v.slice(0, 200)}... (${v.length} chars)` : v;
      } else {
        preview[k] = v;
      }
    }
    console.log(JSON.stringify(preview, null, 2));
  }
}

main().catch(err => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
