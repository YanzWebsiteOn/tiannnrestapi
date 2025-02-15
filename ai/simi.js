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

// Fungsi untuk mengambil respons dari SimSimi  
async function SimSimi(text, language = 'id') {  
  try {  
    const { data } = await axios.post("https://api.simsimi.vn/v1/simtalk",  
      new URLSearchParams({ text, lc: language }).toString(), {  
        headers: {  
          'Content-Type': 'application/x-www-form-urlencoded',  
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'  
        }  
      }  
    );  
    return data.message;  
  } catch (error) {  
    console.error('Error:', error.message);  
    return 'Terjadi kesalahan saat memproses permintaan.';  
  }  
}  

module.exports = function(app) {  
  // Endpoint '/simsimi'  
  app.get('/api/ai/simsimi', async (req, res) => {  
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
        return res.status(400).json({ error: 'Parameter "text" tidak ditemukan. Harap masukkan perintah.' });  
      }  

      // Ambil respons dari SimSimi  
      const response = await SimSimi(text);  

      res.status(200).json({  
        status: 200,  
        creator: "Arix",  
        data: response  
      });  
    } catch (error) {  
      res.status(500).json({ error: error.message });  
    }  
  });  
};
