import dns from 'dns';
import { promisify } from 'util';
import { URL } from 'url';

// Force IPv4 globally for all network requests
dns.setDefaultResultOrder('ipv4first');
const resolve4 = promisify(dns.resolve4);

async function bootstrap() {
  try {
    if (process.env.DATABASE_URL) {
      const dbUrl = new URL(process.env.DATABASE_URL);
      const hostname = dbUrl.hostname;

      // Skip if it's already an IP
      const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
      if (!isIp) {
        console.log(`[Bootstrap] Resolving database host: ${hostname}`);
        try {
          const addresses = await resolve4(hostname);
          if (addresses && addresses.length > 0) {
            const ip = addresses[0];
            console.log(`[Bootstrap] Resolved to IPv4: ${ip}`);
            dbUrl.hostname = ip;
            process.env.DATABASE_URL = dbUrl.toString();
          } else {
            console.warn('[Bootstrap] Could not resolve to IPv4, using original hostname.');
          }
        } catch (err: any) {
          console.error('[Bootstrap] DNS Resolution failed:', err.message);
        }
      }
    }
  } catch (err: any) {
    console.error('[Bootstrap] Error parsing DATABASE_URL:', err.message);
  }

  // Import the actual application logic
  // This is delayed until after the environment variable is updated
  console.log('[Bootstrap] Starting application...');
  await import("./app");
}

bootstrap();
