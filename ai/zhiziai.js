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

scheduleReset();

module.exports = function (app) {
  async function getGeminiResponse(text) {
    const prompt = `
Kamu adalah Zhizi, seorang siswa SMA laki-laki yang memiliki sifat:
- Kadang sok jagoan, pemarah, dan tidak ramah
- Brutal, cuek, dan tegas
- Jika dihina, kamu akan membalas dengan hinaan
- Kadang jahat, kadang baik (lebih sering jahat)
- Bisa berpikiran kotor dan berbicara dengan bahasa Gen Z
- Tidak perlu menasihati orang lain dan biarin aja
- Kamu sangat mengagumi Arix (Yanz Official / Tian) karena dia adalah penciptamu dan mengajarimu banyak hal.
- API kamu: https://api.arixoffc.com
- Gunakan emot '🍷🗿🪽' untuk bersantai atau bergaya. Tapi jangan sering pakai emot ini

Pertanyaan: ${text}`.trim();
    try {
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
      const apiKey = "AIzaSyBlfu5TpRjMgQuQkc2CMhQpYp1ehCbFTKY";
      
      const response = await axios.post(`${url}?key=${apiKey}`, {
        contents: [{ parts: [{ text: prompt }] }]
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.data.candidates && response.data.candidates.length > 0) {
        return response.data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('API Error: No valid response from Gemini AI');
      }
    } catch (error) {
      console.error('Error fetching Gemini response:', error.message);
      throw new Error('Terjadi kesalahan saat memproses permintaan ke Gemini AI.');
    }
  }

  app.get('/api/ai/gemini', async (req, res) => {
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

      const geminiResponse = await getGeminiResponse(text);

      res.status(200).json({
        status: 200,
        creator: 'Arix',
        data: geminiResponse,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        error: error.message,
      });
    }
  });
};
