const axios = require('axios');

module.exports = function(app) {
  // Scraper function
  async function getDenisaResponse(text) {
    try {
      const url = `https://api.siputzx.my.id/api/s/spotify?query=${encodeURIComponent(text)}`;
      const response = await axios.get(url);

      if (response.data && response.data.data) {
        // Format data to match the expected response structure
        const formattedData = response.data.data.map(data => ({
          thumbnail: data.thumbnail || '',
          title: data.title || 'Unknown Title',
          artist: data.artist ? {
            external_urls: data.artist.external_urls || {},
            href: data.artist.href || '',
            id: data.artist.id || '',
            name: data.artist.name || 'Unknown Artist',
            type: data.artist.type || '',
            uri: data.artist.uri || ''
          } : null,
          duration: data.duration || 'N/A',
          preview: data.preview || null
        }));
        return formattedData;
      } else {
        throw new Error('API Error: Response data structure is not as expected');
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
      console.error('Server Error:', error.message);
      res.status(500).json({ error: 'Terjadi kesalahan di server.' });
    }
  });
};
