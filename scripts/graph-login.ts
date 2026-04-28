import { createGraphApp } from '../src/graph-auth.js';
import { config } from '../src/config.js';

async function main(): Promise<void> {
  const app = createGraphApp();
  const result = await app.acquireTokenByDeviceCode({
    scopes: config.graph.scopes,
    deviceCodeCallback: (response) => {
      console.log('');
      console.log('==============================================');
      console.log(response.message);
      console.log('==============================================');
      console.log('');
    },
  });
  if (!result) throw new Error('Device code auth returned no result');
  console.log(`Signed in as ${result.account?.username ?? '(unknown)'}`);
  console.log(`Token cached at: ${config.paths.msalCache}`);
}

main().catch(err => {
  console.error('Login failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
