import * as readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { PlaudAuth, PlaudConfig } from '../src/plaud/index.js';
import type { PlaudCredentials } from '../src/plaud/index.js';

async function prompt(rl: readline.Interface, q: string, silent = false): Promise<string> {
  if (!silent) return (await rl.question(q)).trim();

  stdout.write(q);
  stdin.setRawMode?.(true);
  stdin.resume();
  let input = '';
  return new Promise(resolve => {
    const onData = (data: Buffer) => {
      const s = data.toString('utf-8');
      for (const ch of s) {
        if (ch === '\r' || ch === '\n') {
          stdin.setRawMode?.(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          stdout.write('\n');
          resolve(input);
          return;
        }
        if (ch === '\u0003') { process.exit(130); }
        if (ch === '\u007f') { input = input.slice(0, -1); continue; }
        input += ch;
      }
    };
    stdin.on('data', onData);
  });
}

async function main(): Promise<void> {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    const email = await prompt(rl, 'Plaud email: ');
    const password = await prompt(rl, 'Plaud password: ', true);
    const regionInput = (await prompt(rl, 'Region [eu/us, default eu]: ')).toLowerCase() || 'eu';
    const region = (regionInput === 'us' ? 'us' : 'eu') as PlaudCredentials['region'];

    const config = new PlaudConfig();
    config.saveCredentials({ email, password, region });

    const auth = new PlaudAuth(config);
    await auth.login();
    console.log(`Logged in to Plaud (${region}). Credentials stored in ~/.plaud/config.json`);
  } finally {
    rl.close();
  }
}

main().catch(err => {
  console.error('Login failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
