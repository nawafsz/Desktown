
const dns = require('dns');
dns.resolve('db.svgvrasmudxtwzhrfkmk.supabase.co', 'ANY', (err, records) => {
    if (err) {
        console.error('Resolve ANY error:', err);
        // Fallback to separate A/AAAA checks
        dns.resolve4('db.svgvrasmudxtwzhrfkmk.supabase.co', (err, a) => console.log('A:', a, err));
        dns.resolve6('db.svgvrasmudxtwzhrfkmk.supabase.co', (err, aaaa) => console.log('AAAA:', aaaa, err));
        dns.resolveCname('db.svgvrasmudxtwzhrfkmk.supabase.co', (err, cname) => console.log('CNAME:', cname, err));
    } else {
        console.log('Records:', records);
    }
});
