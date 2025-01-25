const axios = require('axios');

module.exports = function(app) {


    async function bossMode(prompt) {
        const url = new URL("https://yw85opafq6.execute-api.us-east-1.amazonaws.com/default/boss_mode_15aug");
        url.search = new URLSearchParams({
            text: prompt,
            country: "Europe",
            user_id: "Av0SkyG00D"
        }).toString();

        try {
            const response = await axios.get(url.toString(), {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Linux; Android 11; Infinix) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.0.0 Mobile Safari/537.36",
                    Referer: "https://www.ai4chat.co/pages/riddle-generator"
                }
            });

            if (response.status !== 200) {
                throw new Error(`Error: ${response.status}`);
            }

            return response.data;
        } catch (error) {
            console.error("Fetch error:", error.message);
            throw error;
        }
    }

    // Endpoint untuk scraper Boss Mode
    app.get('/api/ai/ai4chat', async (req, res) => {
        try {
            const { text } = req.query;
            if (!text) {
                return res.status(400).json({ error: 'Parameter "text" tidak ditemukan.' });
            }

            const result = await bossMode(text);
            res.status(200).json({
                status: 200,
                creator: "Yanz",
                data: result
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};
