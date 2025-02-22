const axios = require('axios');

module.exports = function (app) {

async function createSubdomains(hostname, ip, zone, apitoken, tld) {
return new Promise(async (resolve) => {
try {
const regularSubdomain = await axios.post(
`https://api.cloudflare.com/client/v4/zones/${zone}/dns_records`,
{
type: "A",
name: hostname.replace(/[^a-z0-9.-]/gi, "") + "." + tld,
content: ip.replace(/[^0-9.]/gi, ""),
ttl: 3600,
priority: 10,
proxied: false
},
{
headers: {
Authorization: "Bearer " + apitoken,
"Content-Type": "application/json",
},
}
);

const nodesSubdomain = await axios.post(
`https://api.cloudflare.com/client/v4/zones/${zone}/dns_records`,
{
type: "A",
name: "node." + hostname.replace(/[^a-z0-9.-]/gi, "") + "." + tld,
content: ip.replace(/[^0-9.]/gi, ""),
ttl: 3600,
priority: 10,
proxied: false
},
{
headers: {
Authorization: "Bearer " + apitoken,
"Content-Type": "application/json",
},
}
);

if (regularSubdomain.data.success && nodesSubdomain.data.success) {
resolve({
success: true,
regularDomain: regularSubdomain.data.result.name,
nodesDomain: nodesSubdomain.data.result.name,
ip: regularSubdomain.data.result.content
});
} else {
throw new Error("Failed to create one or both subdomains");
}
} catch (error) {
let errorMessage = error.response?.data?.errors?.[0]?.message ||
error.response?.data?.errors ||
error.response?.data ||
error.response ||
error;
resolve({ success: false, error: String(errorMessage) });
}
});
}

    app.get('/api/maker/createsubdo', async (req, res) => {
        const { hostname, ip, zone, apitoken, tld } = req.query;

        if (!hostname || !ip || !zone || !apitoken || !tld) {
            return res.status(400).json({ error: "parameter 'hostname', 'ip', 'zone', 'apitoken', 'tld' diperlukan!" });
        }

        try {
            const result = await createSubdomains(hostname, ip, zone, apitoken, tld);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: "Terjadi kesalahan dalam pembuatan Subdomain" });
        }
    });

};
