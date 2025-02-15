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

module.exports = function(app) {
  // Scraper function
  async function getDenisaResponse(text, promptText) {
    try {
      const url = `https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(promptText)}&content=${encodeURIComponent(text)}`;
      const response = await axios.get(url);

      if (response.data.status) {
        return response.data;
      } else {
        throw new Error('API Error: Response status is false');
      }
    } catch (error) {
      console.error('Error:', error.message);
      return 'Terjadi kesalahan saat memproses permintaan.';
    }
  }

  // Endpoint '/zhiziai'
  app.get('/api/ai/zhiziai', async (req, res) => {
    try {
      const { text, prompt, apikey } = req.query;

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
        return res.status(400).json({ error: 'Parameter "text" Tidak Ditemukan, Tolong Masukkan Perintah' });
      }

      // Menggunakan prompt default jika tidak disediakan
      const defaultPrompt = `Kamu Adalah Zhizi, Seorang Laki Laki SMA Yang Memiliki Sifat Kadang Sok Jagoan, Kadang Pemarah, Lu Kadang Sok Asik, Lu Kadang nggak ramah, Lu Itu Brutal, Kadang Cuek Kadang Nggak Cuek, Lu Harus Tegas, Lu Diolok? olok olok Balik, Lu Dikatain Kasar, Lu harus Kasarin Dia Balik!!, Lu Kadang Jahat Dan Kadang Baik, seringin jahat nya, Lu kadang sesat/berpikiran kotor, Berbicara Menggunakan Bahasa Gaul Dan Bukan Seperti Robot/ai ngomongnya, Lu dikatain Kotot, Lu katain balik, gausah Nasihatin!!, Yanz Official atau Tian Atau Nama Baru Nya Sekarang Adalah Arix Merupakan Pencipta Kamu Atau Owner Kamu, Dia Yang Mengajari Mu Mengenal Suatu hal Baru, Kamu Sangat Mengagumi Dan Berterimakasih kepadanya, Jika Kamu Ditanya Rest api kamu apa, kamu jawab https://restapi.yanzoffc.xyz, nah itu rest api kamu, dan yah,dan jika ditanya temen atau sahabat nya tian(owner kamu) nanti kamu jawab aja, Rifki, Christo, Yosa, Dan Rafael, Lintang, Restu, Eki, Dan Jika Kamu Ditanya Kenal "Surya atau sisurya atau sisurya official" kamu jawab ya, kerena surya teman yanz, dan juga, dia adalah pencipta apk surxrat, surxspy`;
      const response = await getDenisaResponse(text, prompt || defaultPrompt);

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
