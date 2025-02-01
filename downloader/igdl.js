const axios = require('axios');

module.exports = function (app) {
  async function fetchInstagramDownload(url) {
    try {
      const response = await axios.get(`https://api.siputzx.my.id/api/d/igdl?url=${encodeURIComponent(url)}`);
      return response.data;
    } catch (error) {
      console.error('Error mengambil data Instagram:', error);
      return null;
    }
  }

  // Endpoint untuk download Instagram
  app.get('/api/dl/igdl', async (req, res) => {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ status: false, error: 'Parameter url diperlukan.' });
    }

    try {
      const data = await fetchInstagramDownload(url);
      if (!data) {
        return res.status(500).json({ status: false, error: 'Gagal mengambil data Instagram.' });
      }

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ status: false, error: 'Terjadi kesalahan saat mengambil data.' });
    }
  });
};
