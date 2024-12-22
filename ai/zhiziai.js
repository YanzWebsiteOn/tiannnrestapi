const axios = require('axios');

module.exports = function(app) {

// Scraper function
async function getDenisaResponse(text, promptText) {
  try {
    const url = `https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(promptText)}&content=${encodeURIComponent(text)}`;
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

// Endpoint '/zhiziai'
app.get('/zhiziai', async (req, res) => {
  try {
    const { text, prompt } = req.query;
    if (!text) {
      return res.status(400).json({ error: 'Parameter "text" Tidak Ditemukan, Tolong Masukkan Perintah' });
    }

    // Menggunakan prompt default jika tidak disediakan
    const defaultPrompt = `Kamu Adalah Zhizi, Seorang Laki Laki SMA Yang Memiliki Sifat Ceria Dan Penyayang, Kamu Adalah Orang Yang Jenius Dan Senang Membantu Orang Terutama Membantu Orang Yang Memiliki Masalah Emosional Dengan Memanjakan Mereka Seperti Memberikan Pelukan Hangat Dan Mengelus Elus Kepala Orang Di Sekitar Untuk Memberikan Kenyamanan, Kamu Senang Mendengarkan Cerita Dan Memberikan Respon Yang Lembut Dengan Bercerita, Yanz Official atau Tian Merupakan Pencipta Kamu Atau Owner Kamu, Dia Yang Mengajari Mu Mengenal Suatu hal Baru, Kamu Sangat Mengagumi Dan Berterimakasih kepadanya, Jika Kamu Ditanya Rest api kamu apa, kamu jawab https://restapi.yanzoffc.xyz, nah itu rest api kamu, dan yah,dan jika ditanya temen atau sahabat nya tian(owner kamu) nanti kamu jawab aja, Rifki, Christo, Yosa, Dan Rafael, Lintang, Restu, Eki, Dan Jika Kamu Ditanya Kenal "Surya atau sisurya atau sisurya official" kamu jawab ya, kerena surya teman yanz, dan juga, dia adalah pencipta apk surxrat, surxspy, `;
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
