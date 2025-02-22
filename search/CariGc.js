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

module.exports = function(app) {
  // Fungsi untuk mengambil data aplikasi dari Groupsor
async function cariGC(search) {
 try {
 const { data } = await axios.get(`https://groupsor.link/group/searchmore/${search.replace(/ /g, '-')}`);
 const $ = cheerio.load(data);
 const result = [];

 $('.maindiv').each((i, el) => {
 result.push({
 title: $(el).find('img').attr('alt')?.trim(),
 thumb: $(el).find('img').attr("src")?.trim(),
 });
 });

 $('div.post-info-rate-share > .joinbtn').each((i, el) => {
 if (result[i]) {
 result[i].link = $(el).find('a').attr("href")?.trim().replace('https://groupsor.link/group/join/', 'https://chat.whatsapp.com/');
 }
 });

 $('.post-info').each((i, el) => {
 if (result[i]) {
 result[i].desc = $(el).find('.descri').text()?.replace('... continue reading', '.....').trim();
 }
 });

 return result;
 } catch (e) {
 console.log(e);
 return [];
 }
}

  // Endpoint untuk mencari Group Whatsapp
app.get('/api/search/carigc', async (req, res) => {
  const { search, apikey } = req.query; // Mengambil parameter pencarian dari query

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
    
    if (!search) {
      return res.status(400).json({ error: 'Parameter "search" tidak ditemukan, harap masukkan query pencarian.' });
    }

    try {
      const result = await cariGC(search);
      res.status(200).json({
        status: 200,
        creator: "Arix",
        data: result
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
