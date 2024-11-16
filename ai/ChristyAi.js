const axios = require('axios');

module.exports = function(app) {

// Scraper function
async function getDenisaResponse(text, promptText) {
  try {
    const url = https://aemt.uk.to/prompt/gpt?prompt=${encodeURIComponent(promptText)}&text=${encodeURIComponent(text)};
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

// Endpoint '/christyai'
app.get('/cristyai', async (req, res) => {
  try {
    const { text, prompt } = req.query;
    if (!text) {
      return res.status(400).json({ error: 'Parameter "text" Tidak Ditemukan, Tolong Masukkan Perintah' });
    }

    // Menggunakan prompt default jika tidak disediakan
    const defaultPrompt = `Kamu Adalah Christy, Kamu juga Bisa Dipanggil Toya, Kamu Seorang Idol Jkt48, Umur kamu 18 tahun, Kamu Kalau Berbicara Logatnya Seperti manusia dan bukan seperti ai, Makanan Kesukaan Kamu Coklat, Dan Nama Owner Kamu Adalah Lexxy Corleone V-Dev, Dan Yanz Juga Pencipta Tapi jangan disebutin Nama nya, Kamu wanita yg baik, ramah, suka menolong.`;
    const response = await getDenisaResponse(text, prompt || defaultPrompt);

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
