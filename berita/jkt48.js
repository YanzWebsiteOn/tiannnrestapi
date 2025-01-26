const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {

  // Full Kode Di Github Saya : https://github.com/Lenwyy/

  // Fungsi untuk fetch dari API https://api.siputzx.my.id/api/berita/jkt48
  async function fetchJkt48News() {
    try {
      const response = await axios.get('https://api.siputzx.my.id/api/berita/jkt48');
      return response.data;
    } catch (error) {
      console.error('Error fetching JKT48 news:', error);
      return null;
    }
  }

  // Endpoint untuk berita JKT48 dari API asli
  app.get('/api/berita/jkt48', async (req, res) => {
    try {
      const data = await fetchJkt48News();
      if (!data) {
        return res.status(500).json({ error: 'Tidak dapat mengambil data dari API.' });
      }

      res.status(200).json({
        status: 200,
        creator: "Yanz",
        data: data
      });
    } catch (error) {
      res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data.' });
    }
  });
};
