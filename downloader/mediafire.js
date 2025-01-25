const axios = require('axios');

module.exports = function (app) {
  // Scraper function untuk MediaFire
  async function getMediaFireResponse(url) {
    try {
      const apiUrl = `https://api.siputzx.my.id/api/d/mediafire?url=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl);

      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('API Error: Response data is invalid or empty');
      }
    } catch (error) {
      console.error('Error:', error.message);
      return 'Terjadi kesalahan saat memproses permintaan ke API MediaFire.';
    }
  }

  // Endpoint '/mediafire'
  app.get('/api/dl/mediafire', async (req, res) => {
    try {
      const { url } = req.query; // Mengambil parameter URL dari query
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan, harap masukkan URL yang valid.' });
    }

      const response = await getMediaFireResponse(url);

      if (typeof response === 'string') {
        return res.status(500).json({ error: response });
      }

      res.status(200).json({
        status: 200,
        creator: "Yanz",
        data: {
          fileName: response.fileName,
          downloadLink: response.downloadLink,
          fileSize: response.fileSize,
          meta: response.meta,
        },
      });
    } catch (error) {
      console.error('Server Error:', error.message);
      res.status(500).json({ error: 'Terjadi kesalahan di server.' });
    }
  });
};
