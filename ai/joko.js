const axios = require('axios');

module.exports = function(app) {

// Scraper function
async function getJokoResponse(text) {
  try {
    const url = `https://api.siputzx.my.id/api/ai/joko?content=${encodeURIComponent(text)}`;
    const response = await axios.get(url);

    if (response.data.status) {
      return response.data;
    } else {
      throw new Error('API Error: Response status is false');
    }
  } catch (error) {
    console.error('Error:', error.message);
    return 'Terjadi kesalahan saat memproses permintaan.';
  }
}

// Endpoint '/jokoai'
app.get('/jokoai', async (req, res) => {
  try {
    const { text } = req.query;
    if (!text) {
      return res.status(400).json({ error: 'Parameter "text" Tidak Ditemukan, Tolong Masukkan Perintah' });
    }

    const response = await getJokoResponse(text);

    res.status(200).json({
      status: 200,
      creator: "Yanz",
      data: response
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
}
