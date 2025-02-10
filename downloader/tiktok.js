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

module.exports = function(app) {

    async function tiktok2(query) {
        return new Promise(async (resolve, reject) => {
          try {
            const encodedParams = new URLSearchParams();
            encodedParams.set('url', query);
            encodedParams.set('hd', '1');
      
            const response = await axios({
              method: 'POST',
              url: 'https://tikwm.com/api/',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Cookie': 'current_language=en',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
              },
              data: encodedParams
            });
      
            const videos = response.data.data;
            const result = {
              title: videos.title,
              cover: videos.cover,
              origin_cover: videos.origin_cover,
              no_watermark: videos.play,
              watermark: videos.wmplay,
              music: videos.music
            };
      
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      }

  // Endpoint Tiktok Downloader
  app.get('/api/dl/tiktok', async (req, res) => {
    try {
      const { url, apikey } = req.query;
      
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
        return res.status(400).json({ error: 'Parameter "url" Tidak Ditemukan, Tolong Masukkan Link' });
      }
      const response = await tiktok2(url);
      res.status(200).json({
        status: 200,
        creator: "Yanz",
        data: response
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
