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

  async function tiktokStalk(username) {
    return new Promise(async (resolve, reject) => {
      try {
        let res = await fetch(
          "https://tools.revesery.com/stalktk/revesery.php?username=" +
            encodeURI(username.replace(/[^\w\d]/gi, ""))
        );
        if (!res.ok) return reject("User Not Found");
        res = await res.json();
        delete res.base64;
        console.log(res);
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }

  app.get('/api/tools/ttstalk', async (req, res) => {
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
          error: 'Parameter "text" tidak ditemukan. Silakan masukkan username TikTok untuk dicari.',
        });
      }

      const response = await tiktokStalk(text);
      res.status(200).json({
        status: 200,
        creator: "Arix",
        data: response
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        error: `Internal server error: ${error.message}`,
      });
    }
  });
};
