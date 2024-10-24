const axios = require('axios');

module.exports = (app) => {
    // Fungsi untuk scraping terjemahan
    const translateText = async (text, lang) => {
        try {
            const response = await axios.get('https://translate-api-example.com/translate', {
                params: {
                    q: text,
                    target: lang
                }
            });

            const translatedText = response.data.translatedText;
            return translatedText;
        } catch (error) {
            throw new Error('Gagal mengambil terjemahan: ' + error.message);
        }
    };

    // Endpoint untuk scraper multi-bahasa
    app.get('/translate', async (req, res) => {
        try {
            const { text, lang } = req.query;
            if (!text || !lang) {
                return res.status(400).json({ error: 'Parameter "text" atau "lang" tidak ditemukan.' });
            }

            const result = await translateText(text, lang);
            res.status(200).json({
                status: 200,
                creator: "Zhizi",
                data: result
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};
