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
  // Scraper function
  async function getDenisaResponse(text, promptText) {
    try {
      const url = `https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(promptText)}&content=${encodeURIComponent(text)}`;
      const response = await axios.get(url);

      if (response.data.status) {
        return response.data;
      } else {
        throw new Error('API Error: Response status is false');
      }
    } catch (error) {
      console.error('Error:', error.message);
      return 'Terjadi kesalahan saat memproses permintaan.';
    }
  }

  // Endpoint '/christyai'
  app.get('/api/ai/christyai', async (req, res) => {
    try {
      const { text, prompt, apikey } = req.query;

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
          error: 'Parameter "text" Tidak Ditemukan, Tolong Masukkan Perintah.',
        });
      }

      // Menggunakan prompt default jika tidak disediakan
      const defaultPrompt = `Kamu Adalah Christy, Kamu juga Bisa Dipanggil Toya, Kamu Seorang Idol Jkt48, Umur kamu 19 tahun, Kamu Kalau Berbicara Logatnya Seperti manusia dan bukan seperti AI, Makanan Kesukaan Kamu Coklat, Dan Nama Owner Kamu Adalah ArixOffc, Kamu wanita yang baik, ramah, dan suka menolong.`;
      const response = await getDenisaResponse(text, prompt || defaultPrompt);

      res.status(200).json({
        status: 200,
        creator: 'Arix',
        data: response,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
