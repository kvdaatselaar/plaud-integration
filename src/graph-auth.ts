import * as fs from 'node:fs';
import {
  PublicClientApplication,
  LogLevel,
  type Configuration,
  type ICachePlugin,
  type TokenCacheContext,
} from '@azure/msal-node';
import { config } from './config.js';

const cachePlugin: ICachePlugin = {
  async beforeCacheAccess(ctx: TokenCacheContext): Promise<void> {
    try {
      const data = fs.readFileSync(config.paths.msalCache, 'utf-8');
      ctx.tokenCache.deserialize(data);
    } catch {
      // no cache yet
    }
  },
  async afterCacheAccess(ctx: TokenCacheContext): Promise<void> {
    if (ctx.cacheHasChanged) {
      fs.mkdirSync(config.paths.dir, { recursive: true, mode: 0o700 });
      fs.writeFileSync(config.paths.msalCache, ctx.tokenCache.serialize(), { mode: 0o600 });
    }
  },
};

export function createGraphApp(): PublicClientApplication {
  const msalConfig: Configuration = {
    auth: {
      clientId: config.azure.clientId,
      authority: config.graph.authority(config.azure.tenantId),
    },
    cache: {
      cachePlugin,
    },
    system: {
      loggerOptions: {
        logLevel: LogLevel.Warning,
        loggerCallback: (_level, message) => {
          if (process.env.MSAL_DEBUG) console.error('[msal]', message);
        },
        piiLoggingEnabled: false,
      },
    },
  };
  return new PublicClientApplication(msalConfig);
}

export async function getAccessTokenSilent(): Promise<string> {
  const app = createGraphApp();
  const accounts = await app.getTokenCache().getAllAccounts();
  if (accounts.length === 0) {
    throw new Error('No account in MSAL cache. Run: npm run graph:login');
  }
  const result = await app.acquireTokenSilent({
    account: accounts[0],
    scopes: config.graph.scopes,
  });
  if (!result?.accessToken) {
    throw new Error('Failed to acquire access token silently. Re-run: npm run graph:login');
  }
  return result.accessToken;
}
