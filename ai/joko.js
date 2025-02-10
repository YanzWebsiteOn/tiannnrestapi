const axios = require('axios');

const limits = new Map(); // Menyimpan jumlah request per API Key

const API_KEYS = {
  apikey: { key: "freekey", limit: 5, unlimited: false },
  bakajsa: { key: "bakajsa", limit: Infinity, unlimited: true },
};

// Reset limit setiap 1 jam untuk apikey
setInterval(() => {
  limits.clear();
  console.log("Request limit telah direset!");
}, 60 * 60 * 1000); // 1 jam

module.exports = function (app) {
  async function getJokoResponse(text) {
    try {
      const url = `https://api.siputzx.my.id/api/ai/joko?content=${encodeURIComponent(text)}`;
      const response = await axios.get(url);

      if (response.data.status) {
        return response.data.data;
      } else {
        throw new Error('API Error: Response status is false');
      }
    } catch (error) {
      console.error('Error fetching Joko response:', error.message);
      throw new Error('Terjadi kesalahan saat memproses permintaan ke API Joko.');
    }
  }

  app.get('/api/ai/jokoai', async (req, res) => {
    try {
      const { text, apikey } = req.query;

      // Validasi API Key
      if (!apikey || !API_KEYS[apikey]) {
        return res.status(401).json({
          status: 401,
          error: 'API Key tidak valid atau tidak ditemukan!',
        });
      }

      const userKey = API_KEYS[apikey];

      // Jika API Key memiliki limit, cek jumlah request
      if (!userKey.unlimited) {
        if (!limits.has(apikey)) {
          limits.set(apikey, 0);
        }
        if (limits.get(apikey) >= userKey.limit) {
          return res.status(429).json({
            status: 429,
            error: 'Limit request telah habis! Silakan coba lagi nanti.',
          });
        }

        // Tambah jumlah request
        limits.set(apikey, limits.get(apikey) + 1);
      }

      // Validasi parameter
      if (!text) {
        return res.status(400).json({
          status: 400,
          error: 'Parameter "text" tidak ditemukan. Tolong masukkan perintah.',
        });
      }

      // Memanggil fungsi scraper
      const jokoResponse = await getJokoResponse(text);

      res.status(200).json({
        status: 200,
        creator: 'Yanz',
        request_count: userKey.unlimited ? "Unlimited" : limits.get(apikey),
        limit_per_hour: userKey.unlimited ? "Unlimited" : userKey.limit,
        data: jokoResponse,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        error: error.message,
      });
    }
  });
};
