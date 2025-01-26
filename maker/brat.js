const axios = require('axios');

module.exports = function(app) {
  
  // Scraper function
  async function getBratImage(text) { 
    try {
      const url = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}`;
      const response = await axios.get(url, { responseType: 'arraybuffer' }); // Mendapatkan gambar dalam bentuk arraybuffer

      // Mengembalikan gambar sebagai respons
      res.set('Content-Type', 'image/jpeg'); // Atau sesuaikan dengan tipe gambar yang dikembalikan
      res.send(response.data); // Kirimkan gambar
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Terjadi kesalahan saat memproses permintaan gambar.' });
    }
  }

  // Endpoint '/brat'
  app.get('/api/maker/brat', async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).json({ error: 'Parameter "text" tidak ditemukan. Tolong masukkan perintah.' });
      }

      await getBratImage(text); // Panggil fungsi untuk mendapatkan dan mengirimkan gambar
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
