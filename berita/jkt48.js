// File: ./berita/jkt48.js
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = (app) => {
  // Fungsi untuk melakukan scraping berita dari JKT48
  async function newsjkt() {
    try {
      const response = await axios.get('https://jkt48.com');
      const html = response.data;
      const $ = cheerio.load(html);

      const beritaList = [];
      
      $('.news-list').find('li').each((index, element) => {
        const title = $(element).find('.news-title').text().trim();
        const date = $(element).find('.news-date').text().trim();
        const link = $(element).find('a').attr('href');
        const id = link.split('/').pop(); // Mengambil ID dari URL berita
        
        if (title && date && link) {
          beritaList.push({
            title,
            date,
            link: `https://jkt48.com${link}`,
            id // Menambahkan ID ke objek berita
          });
        }
      });

      return beritaList;
    } catch (error) {
      console.error('Error fetching JKT48 news:', error);
      throw error;
    }
  }

  // Endpoint untuk scraper Info JKT48 dengan query parameter
  app.get('/beritajkt48', async (req, res) => { 
    const { text } = req.query; // Mendapatkan nilai dari query parameter

    try {
      const data = await newsjkt(); 
      if (data.length === 0) {
        return res.status(404).json({ message: 'Tidak ada berita terbaru yang ditemukan.' });
      }

      // Jika ada parameter text, filter berita berdasarkan judul
      const filteredData = text
        ? data.filter(berita => berita.title.toLowerCase().includes(text.toLowerCase()) || 
                                berita.title.toLowerCase().startsWith(text.toLowerCase()))
        : data;

      if (filteredData.length === 0) {
        return res.status(404).json({ message: 'Tidak ada berita yang cocok dengan kriteria.' });
      }

      res.status(200).json({
        status: 200,
        creator: "Zhizi", 
        data: filteredData.map(berita => ({
          title: berita.title,
          date: berita.date,
          link: berita.link,
          id: berita.id // Menyertakan ID di respons
        }))
      });
    } catch (error) {
      console.error('Terjadi kesalahan saat mengambil data:', error);
      res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data.' });
    }
  });

  // Endpoint untuk mengambil detail berita berdasarkan ID
  app.get('/beritajkt48/:id', async (req, res) => {
    const { id } = req.params; // Mendapatkan ID dari parameter URL
    const detailUrl = `https://jkt48.com/news/detail/id/${id}?lang=id`;

    try {
      const response = await axios.get(detailUrl);
      const html = response.data;
      const $ = cheerio.load(html);

      // Mengambil detail berita
      const title = $('.news-title').text().trim();
      const date = $('.news-date').text().trim();
      const content = $('.news-content').html(); // Ambil HTML konten berita

      if (!title || !date || !content) {
        return res.status(404).json({ message: 'Detail berita tidak ditemukan.' });
      }

      res.status(200).json({
        status: 200,
        creator: "Zhizi",
        data: {
          title,
          date,
          content
        }
      });
    } catch (error) {
      console.error('Terjadi kesalahan saat mengambil detail berita:', error);
      res.status(500).json({ error: 'Terjadi kesalahan saat mengambil detail berita.' });
    }
  });
};
