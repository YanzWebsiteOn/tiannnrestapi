const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {

  // Full Kode Di Github Saya : https://github.com/Lenwyy/

  async function fetchtebakLirik() {
    try {
      const response = await axios.get('https://api.siputzx.my.id/api/games/tebaklirik');
      return response.data;
    } catch (error) {
      console.error('Error Scraping Games:', error);
      return null;
    }
  }

  // Endpoint untuk Games Tebak Lirik
  app.get('/api/games/tebaklirik', async (req, res) => {
    try {
      const data = await fetchtebakLirik();
      if (!data) {
        return res.status(500).json({ error: 'Tidak dapat mengambil data games.' });
      }

      res.status(200).json({
          data
      });
    } catch (error) {
      res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data.' });
    }
  });
};
