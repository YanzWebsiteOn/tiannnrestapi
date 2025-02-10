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

// Jalankan reset saat server dimulai
scheduleReset();

module.exports = function (app) {
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

  // Endpoint untuk AI4Chat Boss Mode
  app.get('/api/ai/ai4chat', async (req, res) => {
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

      if (!text) {
        return res.status(400).json({ 
          status: 400, 
          error: 'Parameter "text" tidak ditemukan.' 
        });
      }

      const result = await bossMode(text);
      res.status(200).json({
        status: 200,
        creator: "Arix", // Mengubah creator ke "Arix"
        data: result
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
