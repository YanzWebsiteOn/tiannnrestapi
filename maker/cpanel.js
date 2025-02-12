const axios = require('axios');

module.exports = function (app) {

    async function createPanel({ domain, apikeyp, username, ram, disk, cpu }) {
        const email = `${username}@gmail.com`;
        const name = `${username.charAt(0).toUpperCase() + username.slice(1)} Server`;
        const password = username + Math.random().toString(36).slice(-4);

        try {
            // Membuat user baru di panel
            let { data } = await axios.post(`${domain}/api/application/users`, {
                email,
                username,
                first_name: name,
                last_name: "Server",
                language: "en",
                password
            }, {
                headers: { Authorization: `Bearer ${apikeyp}` }
            });

            let user = data.attributes;
            let usr_id = user.id;

            // Mendapatkan startup command dari egg
            let { data: eggData } = await axios.get(`${domain}/api/application/nests/5/eggs/15`, {
                headers: { Authorization: `Bearer ${apikeyp}` }
            });

            let startup_cmd = eggData.attributes.startup;

            // Membuat server baru di panel
            let { data: serverData } = await axios.post(`${domain}/api/application/servers`, {
                name,
                description: "Server Created Succes",
                user: usr_id,
                egg: 15,
                docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
                startup: startup_cmd,
                environment: {
                    INST: "npm",
                    USER_UPLOAD: "0",
                    AUTO_UPDATE: "0",
                    CMD_RUN: "npm start"
                },
                limits: { memory: ram, swap: 0, disk, io: 500, cpu },
                feature_limits: { databases: 5, backups: 5, allocations: 5 },
                deploy: { locations: [1], dedicated_ip: false, port_range: [] }
            }, {
                headers: { Authorization: `Bearer ${apikeyp}` }
            });

            let server = serverData.attributes;

            return {
                id_server: server.id,
                username: user.username,
                password,
                login_url: domain,
                ram: ram == "0" ? "Unlimited" : `${ram / 1000}GB`,
                cpu: cpu == "0" ? "Unlimited" : `${cpu}%`,
                disk: disk == "0" ? "Unlimited" : `${disk / 1000}GB`,
                expired: "1 Bulan"
            };

        } catch (error) {
            console.error("Error creating panel:", error.response ? error.response.data : error.message);
            return { error: "Gagal membuat panel" };
        }
    }

    app.get('/api/maker/cpanel', async (req, res) => {
        const { domain, apikeyp, username, ram, disk, cpu } = req.query;

        if (!domain || !apikeyp || !username || !ram || !disk || !cpu) {
            return res.status(400).json({ error: "parameter domain, apikeyp, username, ram, disk, cpu diperlukan!" });
        }

        try {
            const result = await createPanel({ domain, apikeyp, username, ram, disk, cpu });
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: "Terjadi kesalahan dalam pembuatan panel" });
        }
    });

};
