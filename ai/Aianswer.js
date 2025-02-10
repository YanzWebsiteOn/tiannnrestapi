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
  const aiAnswer = {
    chat: async function (input) {
      try {
        const response = await axios.post(
          'https://aianswer.pro/api',
          { question: input },
          {
            headers: {
              'content-type': 'application/json',
              'origin': 'https://aianswer.pro',
              'referer': 'https://aianswer.pro/',
              'user-agent': 'Postify/1.0.0',
            },
          }
        );
        return response.data;
      } catch (error) {
        return {
          status: 'error',
          code: error.response ? error.response.status : 500,
          message: error.message,
        };
      }
    },
  };

  // Endpoint '/api/ai/aianswer'
  app.get('/api/ai/aianswer', async (req, res) => {
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

      // Memanggil metode 'chat'
      const response = await aiAnswer.chat(text);

      res.status(200).json({
        status: 200,
        creator: 'Arix',
        data: response,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        error: error.message,
      });
    }
  });
};
