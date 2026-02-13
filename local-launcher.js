import { resolve4, resolve6 } from 'dns/promises';
import { spawn } from 'child_process';
import { URL } from 'url';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

async function start() {
    let dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('DATABASE_URL is not set');
        process.exit(1);
    }

    try {
        const url = new URL(dbUrl);
        const hostname = url.hostname;

        console.log(`[Local Launcher] Resolving DNS for ${hostname}...`);
        
        let ipAddress = null;
        
        // Try IPv4 first
        try {
            const ipv4 = await resolve4(hostname);
            if (ipv4 && ipv4.length > 0) {
                ipAddress = ipv4[0];
                console.log(`[Local Launcher] Found IPv4: ${ipAddress}`);
            }
        } catch (e) {
            console.log(`[Local Launcher] IPv4 resolution failed: ${e.message}`);
        }

        // If no IPv4, try IPv6
        /* 
        if (!ipAddress) {
            try {
                const ipv6 = await resolve6(hostname);
                if (ipv6 && ipv6.length > 0) {
                    ipAddress = ipv6[0];
                    console.log(`[Local Launcher] Found IPv6: ${ipAddress}`);
                }
            } catch (e) {
                console.log(`[Local Launcher] IPv6 resolution failed: ${e.message}`);
            }
        }
        */

        if (ipAddress) {
            // Manually handle IPv6 brackets if needed
            if (ipAddress.includes(':') && !ipAddress.startsWith('[')) {
                try {
                    url.hostname = `[${ipAddress}]`;
                } catch (e) {
                    // If setting with brackets fails, try without
                    url.hostname = ipAddress;
                }
            } else {
                url.hostname = ipAddress;
            }
            
            dbUrl = url.toString();
            console.log(`[Local Launcher] DATABASE_URL updated with IP.`);
        } else {
            console.warn(`[Local Launcher] Could not resolve IP for ${hostname}, using original hostname.`);
        }
    } catch (err) {
        console.warn(`[Local Launcher] DNS resolution process error: ${err.message}`);
    }

    console.log('[Local Launcher] Starting dev server on port 5025...');

    // Windows compatibility: use npm.cmd, and use shell option
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

    const env = { ...process.env };
    // Remove potential duplicates with different casing
    Object.keys(env).forEach(key => {
        if (key.toLowerCase() === 'database_url') {
            delete env[key];
        }
    });
    env.DATABASE_URL = dbUrl;
    env.PORT = '5025';
    env.NODE_ENV = 'development';
    env.USE_MEMORY_SESSION = 'true';

    console.log(`[Local Launcher] Spawning with DATABASE_URL length: ${dbUrl.length}`);
    if (dbUrl.includes('[')) {
        console.log(`[Local Launcher] DATABASE_URL contains brackets (IPv6)`);
    }

    const child = spawn(npmCmd, ['run', 'dev'], {
        stdio: 'inherit',
        shell: true,
        env: env
    });

    child.on('exit', (code) => {
        process.exit(code || 0);
    });
}

start();
