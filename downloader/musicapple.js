const axios = require('axios');

module.exports = function (app) {
  async function fetchAppleMusicDownload(url) {
    try {
      const response = await axios.get(`https://api.siputzx.my.id/api/d/musicapple?url=${encodeURIComponent(url)}`);
      return response.data;
    } catch (error) {
      console.error('Error mengambil data Apple Music:', error);
      return null;
    }
  }

  // Endpoint untuk download Apple Music
  app.get('/api/dl/musicapple', async (req, res) => {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ status: false, error: 'Parameter url diperlukan.' });
    }

    try {
      const data = await fetchAppleMusicDownload(url);
      if (!data) {
        return res.status(500).json({ status: false, error: 'Gagal mengambil data Apple Music.' });
      }

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ status: false, error: 'Terjadi kesalahan saat mengambil data.' });
    }
  });
};
