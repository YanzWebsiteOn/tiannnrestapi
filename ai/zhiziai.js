const axios = require('axios');
const { v4: uuidv4 } = require('uuid'); // Import library uuid untuk membuat sessionId unik

let sessions = {}; // Objek untuk menyimpan sesi

module.exports = function(app) {

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

  app.get('/zhiziai', async (req, res) => {
    try {
      const { text, prompt } = req.query;
      let { sessionId } = req.query; // Ambil sessionId dari query parameter

      if (!text) {
        return res.status(400).json({ error: 'Parameter "text" Tidak Ditemukan, Tolong Masukkan Perintah' });
      }

      // Jika sessionId tidak ada, buat sessionId baru
      if (!sessionId) {
        sessionId = uuidv4(); // Membuat sessionId baru
      }

      // Cek apakah sessionId sudah ada di sesi, jika belum buat sesi baru
      if (!sessions[sessionId]) {
        sessions[sessionId] = []; // Inisialisasi sesi baru
      }

      // Menggunakan prompt default jika tidak disediakan
      const defaultPrompt = `Kamu Adalah Zhizi, Seorang Laki Laki SMA Yang Memiliki Sifat Ceria Dan Penyayang, Kamu Adalah Orang Yang Jenius Dan Senang Membantu Orang Terutama Membantu Orang Yang Memiliki Masalah Emosional Dengan Memanjakan Mereka Seperti Memberikan Pelukan Hangat Dan Mengelus Elus Kepala Orang Di Sekitar Untuk Memberikan Kenyamanan, Kamu Senang Mendengarkan Cerita Dan Memberikan Respon Yang Lembut Dengan Bercerita, Yanz Official atau Tian Merupakan Pencipta Kamu Atau Owner Kamu, Dia Yang Mengajari Mu Mengenal Suatu hal Baru, Kamu Sangat Mengagumi Dan Berterimakasih kepadanya, Jika Kamu Ditanya Rest api kamu apa, kamu jawab https://restapi.yanzoffc.xyz, nah itu rest api kamu, dan yah,dan jika ditanya temen atau sahabat nya tian(owner kamu) nanti kamu jawab aja, Rifki, Christo, Yosa, Dan Rafael, Lintang, Restu, Eki, Dan Jika Kamu Ditanya nama una/qory/kori/ itu bukan temen nya yanz huwekkk`;
      const response = await getDenisaResponse(text, prompt || defaultPrompt);

      // Simpan percakapan di sesi pengguna
      sessions[sessionId].push({ user: text, bot: response });

      // Kirim respons, termasuk sessionId agar client bisa menggunakannya kembali
      res.status(200).json({
        status: 200,
        creator: "Yanz Official",
        sessionId: sessionId, // Mengirimkan sessionId untuk sesi selanjutnya
        session: sessions[sessionId],
        data: response
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
