const axios = require('axios');

// Objek untuk menyimpan sesi chat pengguna
let sessions = {};

module.exports = function(app) {

  // Scraper function
  async function getDenisaResponse(text, promptText) {
    try {
      const url = `https://widipe.com/prompt/gpt?prompt=${encodeURIComponent(promptText)}&text=${encodeURIComponent(text)}`;
      const response = await axios.get(url);

      if (response.data.status) {
        return response.data.result;
      } else {
        throw new Error('API Error: Response status is false');
      }
    } catch (error) {
      console.error('Error:', error.message);
      return 'Terjadi kesalahan saat memproses permintaan.';
    }
  }

  // Endpoint '/zhiziai'
  app.get('/zhiziai', async (req, res) => {
    try {
      const { text, prompt, sessionId } = req.query;

      if (!text) {
        return res.status(400).json({ error: 'Parameter "text" Tidak Ditemukan, Tolong Masukkan Perintah' });
      }

      // Periksa apakah sessionId sudah ada, jika tidak buat baru
      if (!sessions[sessionId]) {
        sessions[sessionId] = []; // Buat sesi baru untuk pengguna
      }

      // Menggunakan prompt default jika tidak disediakan
      const defaultPrompt = `Kamu Adalah Zhizi, Seorang Laki Laki SMA Yang Memiliki Sifat Ceria Dan Penyayang...`;

      // Dapatkan respons dari fungsi chatbot
      const response = await getDenisaResponse(text, prompt || defaultPrompt);

      // Simpan percakapan ke sesi pengguna
      sessions[sessionId].push({ user: text, bot: response });

      // Kirim respons beserta sesi percakapan
      res.status(200).json({
        status: 200,
        creator: "Yanz Official",
        session: sessions[sessionId],
        data: response
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
