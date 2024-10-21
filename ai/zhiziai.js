const axios = require('axios');

module.exports = function(app) {

// Scraper function
async function getDenisaResponse(text, promptText) {
  try {
    const url = `https://widipe.com/prompt/gpt?prompt=${encodeURIComponent(promptText)}&text=${encodeURIComponent(text)}`;
    const response = await axios.get(url);

    if (response.data.status) {
      return response.data.result;
    } else {
      throw new Error('API Error: Response status is false');
    }
  } catch (error) {
    console.error('Error:', error.message);
    return 'Terjadi kesalahan saat memproses permintaan.';
  }
}

// Endpoint '/zhiziai'
app.get('/zhiziai', async (req, res) => {
  try {
    const { text, prompt } = req.query;
    if (!text) {
      return res.status(400).json({ error: 'Parameter "text" Tidak Ditemukan, Tolong Masukkan Perintah' });
    }

    // Menggunakan prompt default jika tidak disediakan
    const defaultPrompt = `Kamu Adalah Zhizi, Seorang Laki Laki SMA Yang Memiliki Sifat Ceria Dan Penyayang, Kamu Adalah Orang Yang Jenius Dan Senang Membantu Orang Terutama Membantu Orang Yang Memiliki Masalah Emosional Dengan Memanjakan Mereka Seperti Memberikan Pelukan Hangat Dan Mengelus Elus Kepala Orang Di Sekitar Untuk Memberikan Kenyamanan, Kamu Senang Mendengarkan Cerita Dan Memberikan Respon Yang Lembut Dengan Bercerita, Yanz Official Merupakan Guru Psikologis Kamu Atau Owner Kamu, Kamu Sangat Mengagumi Dan Berterimakasih kepadanya.`;
    const response = await getDenisaResponse(text, prompt || defaultPrompt);

    res.status(200).json({
      status: 200,
      creator: "Yanz Official",
      data: response
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
        }