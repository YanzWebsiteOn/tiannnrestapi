const axios = require('axios');

module.exports = function(app) {

  // Fungsi untuk mengambil gambar dari API
  async function getBratImage(text) {
    try {
      const url = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}`;
      const response = await axios.get(url, { responseType: 'arraybuffer' });  // Mendapatkan gambar dalam bentuk arraybuffer

      return response.data;
    } catch (error) {
      console.error('Error:', error.message);
      throw new Error('Terjadi kesalahan saat memproses permintaan.');
    }
  }

  // Endpoint untuk menampilkan gambar
  app.get('/api/maker/brat', async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).json({ error: 'Parameter "text" tidak ditemukan, tolong masukkan perintah' });
      }

      // Mendapatkan gambar
      const imageData = await getBratImage(text);

      // Menentukan tipe konten gambar (misalnya PNG atau JPEG)
      res.set('Content-Type', 'image/png');  // Sesuaikan dengan format gambar yang Anda terima
      res.status(200).send(imageData);  // Mengirim gambar langsung ke pengguna
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
