const axios = require('axios');
const cheerio = require('cheerio');

// Fungsi untuk melakukan scraping biodata member JKT48
async function scrapeJkt48() {
    const url = 'https://jkt48.com/member'; // URL untuk member JKT48
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const members = [];

    // Ambil daftar member
    const memberLinks = [];

    $('.member-list .member').each((index, element) => {
        const name = $(element).find('.name').text().trim(); // Mengambil nama member
        const profileLink = $(element).find('a').attr('href'); // Mengambil link profil
        memberLinks.push({ name, profileLink }); // Simpan nama dan link profil
    });

    // Ambil detail setiap member
    for (const member of memberLinks) {
        const profileResponse = await axios.get(member.profileLink);
        const profilePage = cheerio.load(profileResponse.data);

        // Mengambil ID dari URL
        const id = member.profileLink.split('/').pop(); // Mengambil ID member dari URL

        // Mengambil data dari halaman profil
        const image = profilePage('.member-image img').attr('src'); // Selector untuk gambar
        const birthday = profilePage('.member-detail .birthday').text().trim() || 'Tidak ada data'; // Selector untuk tanggal lahir
        const bloodType = profilePage('.member-detail .blood-type').text().trim() || 'Tidak ada data'; // Selector untuk golongan darah
        const horoscope = profilePage('.member-detail .horoscope').text().trim() || 'Tidak ada data'; // Selector untuk horoskop
        const height = profilePage('.member-detail .height').text().trim() || 'Tidak ada data'; // Selector untuk tinggi badan

        members.push({
            id, // ID member
            name: id, // Mengganti nama member dengan ID
            image,
            profileLink: member.profileLink,
            birthday,
            bloodType,
            horoscope,
            height,
        });
    }

    return members;
}

// Fungsi untuk menghubungkan ke aplikasi Express
module.exports = (app) => {
    app.get('/memberjkt48', async (req, res) => {
        try {
            const searchQuery = req.query.search ? req.query.search.toLowerCase() : '';
            const data = await scrapeJkt48();

            // Filter data berdasarkan query pencarian
            const filteredData = searchQuery
                ? data.filter(member => member.id.includes(searchQuery)) // Mencari berdasarkan ID
                : data;

            if (filteredData.length === 0) {
                return res.status(404).json({ message: 'Tidak ada member ditemukan.' });
            }

            res.status(200).json({
                status: 200,
                creator: "Zhizi",
                data: filteredData
            });
        } catch (error) {
            console.error(error); // Untuk debug
            res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data.', details: error.message });
        }
    });
};
