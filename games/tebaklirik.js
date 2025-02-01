const axios = require('axios');

module.exports = function (app) {

  async function fetchTebakLiriks() {
    try {
      const response = await axios.get('https://api.siputzx.my.id/api/games/tebaklirik');
      return response.data;
    } catch (error) {
      console.error('Error Scraping tebak lirik', error);
      return null;
    }
  }

  // Endpoint untuk Games tebak lirik dari API asli
  app.get('/api/games/tebaklirik', async (req, res) => {
    try {
      const data = await fetchTebakLiriks();
      if (!data || !data.data) {
        return res.status(500).json({ status: false, error: 'Tidak dapat mengambil data Tebak Lirik.' });
      }

      res.status(200).json({
        status: true,
        data: data.data
      });
    } catch (error) {
      res.status(500).json({ status: false, error: 'Terjadi kesalahan saat mengambil data.' });
    }
  });
};
