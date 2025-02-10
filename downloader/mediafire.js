const axios = require('axios');
const { API_KEYS, RESET_TIME, TIMEZONE } = require('../settings');
const moment = require('moment-timezone');

const limits = new Map(); // Menyimpan jumlah request per API Key

// Fungsi untuk reset limit setiap hari pada pukul 00:00 WIB
function scheduleReset() {
  const now = moment().tz(TIMEZONE);
  const resetTime = moment.tz(`${now.format('YYYY-MM-DD')} ${RESET_TIME}`, "YYYY-MM-DD HH:mm", TIMEZONE);

  if (now.isAfter(resetTime)) {
    resetTime.add(1, 'day');
  }

  const timeUntilReset = resetTime.diff(now);

  setTimeout(() => {
    limits.clear();
    console.log("Request limit telah direset!");
    scheduleReset();
  }, timeUntilReset);
}

// Jalankan fungsi reset saat server dimulai
scheduleReset();

module.exports = function (app) {
  // Scraper function untuk MediaFire
  async function getMediaFireResponse(url) {
    try {
      const apiUrl = `https://api.siputzx.my.id/api/d/mediafire?url=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl);

      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('API Error: Response data is invalid or empty');
      }
    } catch (error) {
      console.error('Error:', error.message);
      return 'Terjadi kesalahan saat memproses permintaan ke API MediaFire.';
    }
  }

  // Endpoint '/mediafire'
  app.get('/api/dl/mediafire', async (req, res) => {
    try {
      const { url, apikey } = req.query; // Mengambil parameter URL dan API Key dari query

      // Validasi API Key
      if (!apikey || !API_KEYS[apikey]) {
        return res.status(401).json({
          status: 401,
          error: 'API Key tidak valid atau tidak ditemukan!'
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
            error: 'Limit request telah habis! Silakan coba lagi besok.'
          });
        }

        // Tambah jumlah request
        limits.set(apikey, limits.get(apikey) + 1);
      }

      if (!url) {
        return res.status(400).json({ error: 'Parameter "url" tidak ditemukan, harap masukkan URL yang valid.' });
      }

      const response = await getMediaFireResponse(url);

      if (typeof response === 'string') {
        return res.status(500).json({ error: response });
      }

      res.status(200).json({
        status: 200,
        creator: "Arix",
        data: {
          fileName: response.fileName,
          downloadLink: response.downloadLink,
          fileSize: response.fileSize,
          meta: response.meta,
        },
      });
    } catch (error) {
      console.error('Server Error:', error.message);
      res.status(500).json({ error: 'Terjadi kesalahan di server.' });
    }
  });
};
