
const dns = require('dns');
dns.resolve4('db.svgvrasmudxtwzhrfkmk.supabase.co', (err, addresses) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('IPv4:', addresses);
});
