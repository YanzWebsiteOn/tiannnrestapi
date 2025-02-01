const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {

  // Full Kode Di Github Saya : https://github.com/Lenwyy/

  async function fetchTekaTekiNjir() {
    try {
      const response = await axios.get('https://api.siputzx.my.id/api/games/tekateki');
      return response.data;
    } catch (error) {
      console.error('Error Scraping Teka Teki', error);
      return null;
    }
  }

  // Endpoint untuk Games teka teki dari API asli
  app.get('/api/games/tekateki', async (req, res) => {
    try {
      const data = await fetchTekaTekiNjir();
      if (!data) {
        return res.status(500).json({ error: 'Tidak dapat mengambil data teka teki.' });
      }

      res.status(200).json({
          data
      });
    } catch (error) {
      res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data.' });
    }
  });
};
