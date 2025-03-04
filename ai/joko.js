const axios = require('axios');
const { API_KEYS, RESET_TIME, TIMEZONE } = require('../settings');
const moment = require('moment-timezone');

const limits = new Map(); // Menyimpan jumlah request per API Key

// Fungsi untuk reset limit setiap hari pada pukul 00:00 WIB
function scheduleReset() {
  const now = moment().tz(TIMEZONE);
  const resetTime = moment.tz(`${now.format('YYYY-MM-DD')} ${RESET_TIME}`, "YYYY-MM-DD HH:mm", TIMEZONE);
  
  // Jika waktu reset sudah lewat, jadwalkan untuk besok
  if (now.isAfter(resetTime)) {
    resetTime.add(1, 'day');
  }

  const timeUntilReset = resetTime.diff(now);
  
  setTimeout(() => {
    limits.clear();
    console.log("Request limit telah direset!");
    scheduleReset(); // Jadwalkan ulang untuk hari berikutnya
  }, timeUntilReset);
}

// Jalankan fungsi reset saat server dimulai
scheduleReset();

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
            error: 'Limit request telah habis! Silakan coba lagi besok.',
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
        creator: 'Arix',
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
