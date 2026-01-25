
import dns from 'dns';
import { promisify } from 'util';
import { URL } from 'url';
import { spawn } from 'child_process';

// Force IPv4 for DNS resolution within this script
dns.setDefaultResultOrder('ipv4first');
const resolve4 = promisify(dns.resolve4);

async function start() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set');
      process.exit(1);
    }

    const dbUrl = new URL(process.env.DATABASE_URL);
    const hostname = dbUrl.hostname;

    // Skip if it's already an IP
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    if (!isIp) {
        console.log(`[Start Wrapper] Resolving database host: ${hostname}`);
        try {
            const addresses = await resolve4(hostname);
            if (addresses && addresses.length > 0) {
                const ip = addresses[0];
                console.log(`[Start Wrapper] Resolved to IPv4: ${ip}`);
                dbUrl.hostname = ip;
                process.env.DATABASE_URL = dbUrl.toString();
            } else {
                console.warn('[Start Wrapper] Could not resolve to IPv4, using original hostname.');
            }
        } catch (err) {
            console.error('[Start Wrapper] DNS Resolution failed:', err.message);
            // Proceed anyway
        }
    }
  } catch (err) {
      console.error('[Start Wrapper] Error parsing DATABASE_URL:', err.message);
  }

  // Determine which script to run
  // Default to dist/index.cjs (Full App)
  const args = process.argv.slice(2);
  const scriptToRun = args[0] || 'dist/index.cjs';
  const scriptArgs = args.slice(1);

  // Add --dns-result-order=ipv4first just in case
  const nodeArgs = ['--dns-result-order=ipv4first', scriptToRun, ...scriptArgs];

  console.log(`[Start Wrapper] Starting application: node ${nodeArgs.join(' ')}`);

  // Inherit stdio to see logs
  const child = spawn('node', nodeArgs, { 
      stdio: 'inherit',
      env: process.env 
  });

  child.on('exit', (code) => {
      process.exit(code);
  });
}

start();
