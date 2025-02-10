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
  async function fetchYtmp4Download(url) {
    try {
      const response = await axios.get(`https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(url)}`);
      return response.data;
    } catch (error) {
      console.error('Error mengambil data YTMP4:', error);
      return null;
    }
  }

  // Endpoint untuk download YTMP4
  app.get('/api/dl/ytmp4', async (req, res) => {
    const { url, apikey } = req.query;

    // Validasi API Key
    if (!apikey || !API_KEYS[apikey]) {
      return res.status(401).json({
        status: false,
        error: 'API Key tidak valid atau tidak ditemukan!',
      });
    }

    const userKey = API_KEYS[apikey];

    // Cek limit API Key
    if (!userKey.unlimited) {
      if (!limits.has(apikey)) {
        limits.set(apikey, 0);
      }
      if (limits.get(apikey) >= userKey.limit) {
        return res.status(429).json({
          status: false,
          error: 'Limit request telah habis! Silakan coba lagi besok.',
        });
      }
      limits.set(apikey, limits.get(apikey) + 1);
    }

    if (!url) {
      return res.status(400).json({ status: false, error: 'Parameter url diperlukan.' });
    }

    try {
      const data = await fetchYtmp4Download(url);
      if (!data) {
        return res.status(500).json({ status: false, error: 'Gagal mengambil data YTMP4.' });
      }

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ status: false, error: 'Terjadi kesalahan saat mengambil data.' });
    }
  });
};
