const axios = require('axios');

module.exports = function (app) {
  async function fetchCapcutDownload(url) {
    try {
      const response = await axios.get(`https://api.siputzx.my.id/api/d/capcut?url=${encodeURIComponent(url)}`);
      return response.data;
    } catch (error) {
      console.error('Error mengambil data CapCut:', error);
      return null;
    }
  }

  // Endpoint untuk download CapCut
  app.get('/api/dl/capcut', async (req, res) => {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ status: false, error: 'Parameter url diperlukan.' });
    }

    try {
      const data = await fetchCapcutDownload(url);
      if (!data) {
        return res.status(500).json({ status: false, error: 'Gagal mengambil data CapCut.' });
      }

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ status: false, error: 'Terjadi kesalahan saat mengambil data.' });
    }
  });
};
