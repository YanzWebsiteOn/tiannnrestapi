const axios = require('axios');
const cheerio = require('cheerio');

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
      
      if (title && date && link) {
        beritaList.push({
          title,
          date,
          link: `https://jkt48.com${link}`
        });
      }
    });

    return beritaList;
  } catch (error) {
    console.error('Error fetching JKT48 news:', error);
    throw error;
  }
}

// Endpoint untuk scraper Info JKT48
app.get('/beritajkt48', async (req, res) => { 
  try {
    const data = await newsjkt(); 
    if (data.length === 0) {
      return res.status(404).json({ message: 'Tidak ada berita terbaru yang ditemukan.' });
    }

    res.status(200).json({
      status: 200,
      creator: "Zhizi", 
      data: data.map(berita => ({
        title: berita.title,
        date: berita.date,
        link: berita.link
      }))
    });
  } catch (error) {
    console.error('Terjadi kesalahan saat mengambil data:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data.' });
  }
});
