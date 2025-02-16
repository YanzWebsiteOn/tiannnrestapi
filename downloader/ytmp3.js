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

const headers = {
    'Accept': '/',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Origin': 'https://ytmp3.cc',
    'Pragma': 'no-cache',
    'Referer': 'https://ytmp3.cc/', 
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.3',
    'sec-ch-ua': '"Not-A.Brand";v="99", "Chromium";v="124"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Windows"'
};

const ytRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|shorts\/)?([a-zA-Z0-9_-]{11})/;

function decodeToken(nyxz, ndbz = '') {
    for (let i = 0; i < atob(nyxz[0]).split(nyxz.f[6]).length; i++) {
        ndbz += (nyxz.f[5] > 0 ? nyxz[1].split('').reverse().join('') : nyxz[1])[atob(nyxz[0]).split(nyxz.f[6])[i] - nyxz.f[4]];
    }
    return nyxz.f[2] === 1 ? ndbz.toLowerCase() : (nyxz.f[2] === 2 ? ndbz.toUpperCase() : ndbz);
}

async function ytdl(url, type = 'mp3') {
    if (!ytRegex.test(url)) {
        throw new Error('Invalid YouTube link.');
    }
    if (!['mp3', 'mp4'].includes(type)) {
        throw new Error('Invalid format. Choose mp3 or mp4.');
    }

    try {
        const vidId = url.match(ytRegex)[1];
        const webpage = await axios.get('https://ytmp3.cc/Vluk/', { headers });
        const tokenJson = JSON.parse(atob(webpage.data?.match(/atob👦'(.?)'👦/)?.[1]).match(/var gC = ({[\s\S]?});/)?.[1]); 
        const token = btoa(tokenJson[2] + '-' + decodeToken(tokenJson, tokenJson.f[7]));

        const init = await axios.get(https://d.ecoe.cc/api/v1/init?k=${token}&_=${Math.random()}, { headers }).then(res => res.data);
        const convert = await axios.get(${init.convertURL}&v=https://www.youtube.com/watch?v=${vidId}&f=${type}&_=${Math.random()}, { headers }).then(res => res.data);

        if (convert.redirectURL) {
            const res = await axios.get(convert.redirectURL, { headers }).then(res => res.data);
            return { type, title: res.title, link: res.downloadURL };
        } else {
            let res, retry = 0;
            do {
                if (retry > 50) throw new Error('Conversion timeout.');
                res = await axios.get(convert.progressURL, { headers }).then(res => res.data);
                await new Promise(resolve => setTimeout(resolve, 1000));
                retry++;
            } while (res.progress !== 3);
            return { type, title: res.title, link: convert.downloadURL };
        }
    } catch (error) {
        throw new Error(Download error: ${error.message});
    }
}

  // Endpoint Tiktok Downloader
  app.get('/api/dl/ytmp3', async (req, res) => {
    try {
      const { url, apikey, type } = req.query;
      
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
        const result = await ytdl(url, type || 'mp3');
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
};
