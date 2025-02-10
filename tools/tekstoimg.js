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

  async function ttp3(text) {
    try {
      const baseUrl = 'https://dummyimage.com/600x400/fcfcfc/000000.png&text=';
      const finalUrl = `${baseUrl}${encodeURIComponent(text)}`;
      return finalUrl;
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  }

  app.get('/api/tools/teks2img', async (req, res) => {
    try {
      const { text, apikey } = req.query;

      if (!apikey || !API_KEYS[apikey]) {
        return res.status(401).json({
          status: 401,
          error: 'API Key tidak valid atau tidak ditemukan!',
        });
      }

      const userKey = API_KEYS[apikey];

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
        limits.set(apikey, limits.get(apikey) + 1);
      }

      if (!text) {
        return res.status(400).json({
          status: 400,
          error: 'Parameter "text" tidak ditemukan. Tolong masukkan perintah.',
        });
      }

      const response = await ttp3(text);
      res.status(200).json({
        status: 200,
        creator: "Arix",
        data: response
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        error: error.message,
      });
    }
  });
};
