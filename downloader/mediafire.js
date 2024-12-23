const axios = require('axios');

module.exports = function(app) {
  // Scraper function untuk MediaFire
  async function getMediaFireResponse(url) {
    try {
      const apiUrl = `https://domainkmu.com/mediafire?url=${encodeURIComponent(url)}`;
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

  // Endpoint '/spotify'
  app.get('/mediafire', async (req, res) => {
    try {
      const search = req.query.search;
      if (!search) {
        return res.status(400).json({ error: 'Parameter "search" tidak ditemukan. Tolong masukkan parameter pencarian.' });
      }

      const response = await getMeidafireResponse(url);

      if (typeof response === 'string') {
        return res.status(500).json({ error: response });
      }

      res.status(200).json({
        data: response
      });
    } catch (error) {
      console.error('Server Error:', error.message);
      res.status(500).json({ error: 'Terjadi kesalahan di server.' });
    }
  });

  // Endpoint '/mediafire'
  app.get('/mediafire', async (req, res) => {
    try {
      const url = req.query.url;
      if (!url) {
        return res.status(400).json({ error: 'Parameter "url" tidak ditemukan. Tolong masukkan URL MediaFire.' });
      }

      const response = await getMediaFireResponse(url);

      if (typeof response === 'string') {
        return res.status(500).json({ error: response });
      }

      res.status(200).json({
        data: response
      });
    } catch (error) {
      console.error('Server Error:', error.message);
      res.status(500).json({ error: 'Terjadi kesalahan di server.' });
    }
  });
};
