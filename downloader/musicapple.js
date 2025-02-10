const axios = require('axios');
const { API_KEYS, RESET_TIME, TIMEZONE } = require('../settings');
const moment = require('moment-timezone');

const limits = new Map();

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

scheduleReset();

module.exports = function (app) {
  async function fetchAppleMusicDownload(url) {
    try {
      const response = await axios.get(`https://api.siputzx.my.id/api/d/musicapple?url=${encodeURIComponent(url)}`);
      return response.data;
    } catch (error) {
      console.error('Error mengambil data Apple Music:', error);
      return null;
    }
  }

  app.get('/api/dl/musicapple', async (req, res) => {
    const { url, apikey } = req.query;

    if (!apikey || !API_KEYS[apikey]) {
      return res.status(401).json({ status: false, error: 'API Key tidak valid atau tidak ditemukan!' });
    }

    const userKey = API_KEYS[apikey];
    if (!userKey.unlimited) {
      if (!limits.has(apikey)) {
        limits.set(apikey, 0);
      }
      if (limits.get(apikey) >= userKey.limit) {
        return res.status(429).json({ status: false, error: 'Limit request telah habis! Silakan coba lagi besok.' });
      }
      limits.set(apikey, limits.get(apikey) + 1);
    }

    if (!url) {
      return res.status(400).json({ status: false, error: 'Parameter url diperlukan.' });
    }

    try {
      const data = await fetchAppleMusicDownload(url);
      if (!data) {
        return res.status(500).json({ status: false, error: 'Gagal mengambil data Apple Music.' });
      }

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ status: false, error: 'Terjadi kesalahan saat mengambil data.' });
    }
  });
};
