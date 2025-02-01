const axios = require('axios');

module.exports = function (app) {
  async function fetchYtmp4Download(url) {
    try {
      const response = await axios.get(`https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(url)}`);
      return response.data;
    } catch (error) {
      console.error('Error mengambil data YTMP4:', error);
      return null;
    }
  }

  // Endpoint untuk download YTMP4
  app.get('/api/dl/ytmp4', async (req, res) => {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ status: false, error: 'Parameter url diperlukan.' });
    }

    try {
      const data = await fetchYtmp4Download(url);
      if (!data) {
        return res.status(500).json({ status: false, error: 'Gagal mengambil data YTMP4.' });
      }

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ status: false, error: 'Terjadi kesalahan saat mengambil data.' });
    }
  });
};
