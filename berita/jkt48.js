const axios = require('axios');
const cheerio = require('cheerio');

// Fungsi untuk melakukan scraping biodata member JKT48
async function scrapeJkt48() {
    try {
        const url = 'https://jkt48.com/member'; // URL untuk member JKT48
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const members = [];

        // Ambil daftar member
        $('.member-list .member').each((index, element) => {
            const profileLink = $(element).find('a').attr('href'); // Mengambil link profil
            if (profileLink) {
                const id = profileLink.split('/').pop(); // Mengambil ID member dari URL

                // Menambahkan ID ke dalam data member
                members.push({ id, profileLink });
            }
        });

        console.log(members); // Debug: Menampilkan semua member yang ditemukan

        return members;
    } catch (error) {
        console.error('Error in scraping:', error.message); // Debug: Menampilkan pesan kesalahan
        throw error; // Lempar kesalahan untuk ditangani di luar
    }
}

// Fungsi untuk menghubungkan ke aplikasi Express
module.exports = (app) => {
    app.get('/memberjkt48', async (req, res) => {
        try {
            const data = await scrapeJkt48();

            if (data.length === 0) {
                return res.status(404).json({ message: 'Tidak ada member ditemukan.' });
            }

            res.status(200).json({
                status: 200,
                creator: "Zhizi",
                data: data
            });
        } catch (error) {
            console.error('Error in endpoint:', error.message); // Debug: Menampilkan kesalahan endpoint
            res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data.', details: error.message });
        }
    });
};
