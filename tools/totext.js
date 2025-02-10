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

  const morseToTextMap = {
    '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F', '--.': 'G',
    '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N',
    '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T', '..-': 'U',
    '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y', '--..': 'Z', 
    '.----': '1', '..---': '2', '...--': '3', '....-': '4', '.....': '5',
    '-....': '6', '--...': '7', '---..': '8', '----.': '9', '-----': '0',
    '/': ' '
  };

  async function convertToText(morseCode) {
    let text = '';
    const morseSymbols = morseCode.split(' ');

    for (let symbol of morseSymbols) {
      if (morseToTextMap[symbol]) {
        text += morseToTextMap[symbol];
      } else {
        text += '?';
      }
    }

    return text;
  }

  app.get('/api/tools/totext', async (req, res) => {
    try {
      const { morse, apikey } = req.query;

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

      if (!morse) {
        return res.status(400).json({
          status: 400,
          error: 'Parameter "morse" tidak ditemukan. Silakan masukkan kode Morse untuk diubah ke teks.',
        });
      }

      const result = await convertToText(morse);
      res.status(200).json({
        status: 200,
        creator: "Ariix",
        data: {
          originalMorse: morse,
          TextResult: result
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        error: error.message,
      });
    }
  });
};
