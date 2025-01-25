const axios = require('axios');

module.exports = function(app) {
  // Scraper function
  async function getDenisaResponse(search) {
    try {
      const url = `https://api.siputzx.my.id/api/s/spotify?query=${encodeURIComponent(search)}`;
      const response = await axios.get(url);

      if (response.data && Array.isArray(response.data.data)) {
        const formattedData = response.data.data.map(data => ({
          thumbnail: data.thumbnail,
          title: data.title,
          artist: {
            external_urls: {
              spotify: data.artist?.external_urls?.spotify || null
            },
            href: data.artist?.href || null,
            id: data.artist?.id || null,
            name: data.artist?.name || null,
            type: data.artist?.type || null,
            uri: data.artist?.uri || null
          },
          duration: data.duration,
          preview: data.preview || null
        }));
        return formattedData;
      } else {
        throw new Error('API Error: Response data is invalid or empty');
      }
    } catch (error) {
      console.error('Error:', error.message);
      return 'Terjadi kesalahan saat memproses permintaan ke API.';
    }
  }

  // Endpoint '/spotify'
  app.get('/api/search/spotify', async (req, res) => {
    try {
      const search = req.query.search;
      if (!search) {
        return res.status(400).json({ error: 'Parameter "search" tidak ditemukan. Tolong masukkan parameter pencarian.' });
      }

      const response = await getDenisaResponse(search);

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
