const axios = require('axios');

module.exports = function(app) {
  // Scraper function
  async function getDenisaResponse(text) {
    try {
      const url = `https://api.siputzx.my.id/api/s/spotify?query=${encodeURIComponent(text)}`;
      const response = await axios.get(url);

      if (response.data.status) {
        // Format data to match the expected response structure
        const formattedData = response.data.data.map(item => ({
          thumbnail: item.thumbnail,
          title: item.title,
          artist: {
            external_urls: {
              spotify: item.artist.external_urls.spotify
            },
            href: item.artist.href,
            id: item.artist.id,
            name: item.artist.name,
            type: item.artist.type,
            uri: item.artist.uri
          },
          duration: item.duration,
          preview: item.preview
        }));
        return formattedData;
      } else {
        throw new Error('API Error: Response status is false');
      }
    } catch (error) {
      console.error('Error:', error.message);
      return 'Terjadi kesalahan saat memproses permintaan.';
    }
  }

  // Endpoint '/spotify'
  app.get('/spotify', async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).json({ error: 'Parameter "text" Tidak Ditemukan, Tolong Masukkan Perintah' });
      }

      const response = await getDenisaResponse(text);

      if (typeof response === 'string') {
        return res.status(500).json({ error: response });
      }

      res.status(200).json({
        data: response
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
