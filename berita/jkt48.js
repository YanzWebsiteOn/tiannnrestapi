const axios = require('axios');

module.exports = function(app) {

// Scraper function
async function getInfoJktResponse() { 
  try {
    const url = 'https://api.siputzx.my.id/api/berita/jkt48';  // URL API JKT48
    const response = await axios.get(url);

    if (response.data.status) {
      // Mengambil hanya bagian "data" dari respon API
      return response.data.data; 
    } else {
      throw new Error('API Error: Response status is false');
    }
  } catch (error) {
    console.error('Error:', error.message);
    return 'Terjadi kesalahan saat memproses permintaan.';
  }
}

// Endpoint '/api/berita/jkt48'
app.get('/api/berita/jkt48', async (req, res) => {
  try {
    // Mendapatkan data berita
    const newsData = await getInfoJktResponse();

    // Mengirimkan hasilnya dalam format JSON
    res.status(200).json({
      status: 200,
      creator: "Yanz",
      data: newsData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
}
