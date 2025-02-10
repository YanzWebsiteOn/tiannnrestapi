const axios = require('axios');
const cheerio = require('cheerio');
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
  // Fungsi scraper liputan6
  async function liputan6() {
    try {
      const response = await axios.get('https://www.liputan6.com/');
      const $ = cheerio.load(response.data);

      const latestNews = $('.articles--iridescent-list').eq(2).find('article');
      const results = [];

      latestNews.each(function () {
        try {
          const title = $(this).find('figure a').attr('title');
          const link = $(this).find('figure a').attr('href');
          const image = $(this).find('figure a picture img').attr('data-src');
          const tag = $(this).find('aside header a').text();

          results.push({ title, link, tag, image, source: 'liputan6' });
        } catch (e) {
          console.error('Error scraping article:', e);
        }
      });

      return results;
    } catch (error) {
      console.error('Error fetching:', error);
      return [];
    }
  }

  // Endpoint '/api/berita/liputan6'
  app.get('/api/berita/liputan6', async (req, res) => {
    try {
      const { apikey } = req.query;

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

      // Mengambil data berita dari Liputan6
      const data = await liputan6();
      if (data.length === 0) {
        return res.status(404).json({ message: 'Tidak ada berita terbaru yang ditemukan.' });
      }

      res.status(200).json({
        status: 200,
        creator: "Arix",
        data: data
      });
    } catch (error) {
      res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data.' });
    }
  });
};
