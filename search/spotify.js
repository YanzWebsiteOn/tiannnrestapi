const axios = require('axios');

module.exports = function(app) {
  // Scraper function
  async function getDenisaResponse(search) {
    try {
      const url = `https://restapi.yanzoffc.xyz/spotify?query=${encodeURIComponent(search)}`;
      const response = await axios.get(url);

      if (response.data && response.data.data) {
        const formattedData = response.data.data.map(data => ({
          thumbnail: data.thumbnail,
          title: data.title,
          artist: {
            external_urls: {
              spotify: data.artist.external_urls.spotify
            },
            href: data.artist.href,
            id: data.artist.id,
            name: data.artist.name,
            type: data.artist.type,
            uri: data.artist.uri
          },
          duration: data.duration,
          preview: data.preview
        }));
        return formattedData;
      } else {
        throw new Error('API Error: Response data is invalid');
      }
    } catch (error) {
      console.error('Error:', error.message);
      return 'Terjadi kesalahan saat memproses permintaan.';
    }
  }

  // Endpoint '/spotify'
  app.get('/spotify', async (req, res) => {
    try {
      const search = req.query.search;
    if (!search) {
      return res.status(400).json({ error: 'Parameter "search" Tidak Ditemukan, Tolong Masukkan Nomor Surah' });
    }
      
      const response = await getDenisaResponse(search);

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
