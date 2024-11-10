const axios = require('axios');

module.exports = function(app) {
  // Fungsi untuk mengunduh MP4 dari URL yang diberikan
  async function Mp4(url) {
    let title, image;

    const getDownloadId = async () => {
      try {
        const response = await axios.get(`https://ab.cococococ.com/ajax/download.php?copyright=0&format=360&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`);
        return response.data;
      } catch (error) {
        throw new Error('Gagal mendapatkan ID unduhan');
      }
    };

    const checkProgress = async (id) => {
      try {
        const response = await axios.get(`https://p.oceansaver.in/ajax/progress.php?id=${id}`);
        return response.data;
      } catch (error) {
        throw new Error('Gagal memeriksa progres unduhan');
      }
    };

    const pollProgress = async (id) => {
      try {
        const data = await checkProgress(id);
        if (data.progress === 1000) {
          return {
            type: 'mp4 (360p)',
            title: title,
            image: image,
            download_url: data.download_url
          };
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Tunggu 1 detik
          return pollProgress(id);
        }
      } catch (error) {
        throw error;
      }
    };

    const data = await getDownloadId();
    if (data.success && data.id) {
      title = data.info.title;
      image = data.info.image;
      return pollProgress(data.id);
    } else {
      throw new Error('Gagal mendapatkan ID unduhan');
    }
  }

  // Endpoint untuk mengunduh MP4
  app.get('/mp4', async (req, res) => {
    const { url } = req.query; // Mengambil parameter URL dari query
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan, harap masukkan URL yang valid.' });
    }

    try {
      const result = await Mp4(url);
      res.status(200).json({
        status: 200,
        creator: "Yanz",
        data: result
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
