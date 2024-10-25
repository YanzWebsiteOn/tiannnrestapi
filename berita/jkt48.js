const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeJkt48() {
    const url = 'https://jkt48.com/member'; // URL yang sesuai untuk member JKT48
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const members = [];

    $('.member-list .member').each((index, element) => {
        const name = $(element).find('.name').text().trim();
        const image = $(element).find('img').attr('src');
        const profileLink = $(element).find('a').attr('href');
        const id = profileLink ? profileLink.split('/').pop() : null; // Mengambil ID member

        // Mengambil detail member dari halaman profil
        const memberDetails = {
            id,
            name,
            image,
            profileLink,
            birthday: null,
            bloodType: null,
            horoscope: null,
            height: null,
        };

        // Mengambil detail lebih lanjut dari halaman member
        axios.get(profileLink).then(profileResponse => {
            const profilePage = cheerio.load(profileResponse.data);

            // Ambil informasi tambahan (ini bisa disesuaikan dengan elemen yang ada di halaman)
            memberDetails.birthday = profilePage('.birthday').text().trim() || 'Tidak ada data';
            memberDetails.bloodType = profilePage('.blood-type').text().trim() || 'Tidak ada data';
            memberDetails.horoscope = profilePage('.horoscope').text().trim() || 'Tidak ada data';
            memberDetails.height = profilePage('.height').text().trim() || 'Tidak ada data';

            members.push(memberDetails);
        });
    });

    // Tunggu sampai semua detail member diambil
    await new Promise(resolve => setTimeout(resolve, 1000));

    return members;
}

app.get('/memberjkt48', async (req, res) => {
    try {
        const searchQuery = req.query.search ? req.query.search.toLowerCase() : '';
        const data = await scrapeJkt48();

        // Filter data berdasarkan query pencarian
        const filteredData = searchQuery
            ? data.filter(member => member.name.toLowerCase().includes(searchQuery))
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
        console.error(error); // Menampilkan error di konsol
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data.', details: error.message });
    }
});
