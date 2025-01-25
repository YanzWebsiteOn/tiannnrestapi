const axios = require('axios');

module.exports = function (app) {
  // Scraper function
  async function getJokoResponse(text) {
    try {
      const url = `https://api.siputzx.my.id/api/ai/joko?content=${encodeURIComponent(text)}`;
      const response = await axios.get(url);

      if (response.data.status) {
        return response.data.data; // Mengambil data jawaban langsung
      } else {
        throw new Error('API Error: Response status is false');
      }
    } catch (error) {
      console.error('Error fetching Joko response:', error.message);
      throw new Error('Terjadi kesalahan saat memproses permintaan ke API Joko.');
    }
  }

  // Endpoint '/jokoai'
  app.get('/api/ai/jokoai', async (req, res) => {
    try {
      const { text } = req.query;

      // Validasi parameter
      if (!text) {
        return res.status(400).json({
          status: 400,
          error: 'Parameter "text" tidak ditemukan. Tolong masukkan perintah.',
        });
      }

      // Memanggil fungsi scraper
      const jokoResponse = await getJokoResponse(text);

      res.status(200).json({
        status: 200,
        creator: 'Yanz',
        data: jokoResponse,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        error: error.message,
      });
    }
  });
};
