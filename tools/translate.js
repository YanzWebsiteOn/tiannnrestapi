const puppeteer = require('puppeteer');

module.exports = (app) => {
    // Fungsi untuk melakukan terjemahan
    const translateText = async (text, lang) => {
        try {
            const browser = await puppeteer.launch({ headless: true }); // Jalankan di mode headless
            const page = await browser.newPage();

            // Navigasi ke halaman Google Translate
            await page.goto('https://translate.google.co.id/');

            // Mengisi teks yang ingin diterjemahkan
            await page.type('textarea[aria-label="Source text"]', text);

            // Tunggu sampai Google Translate mendeteksi bahasa dan terjemahan muncul
            await page.waitForTimeout(2000); // Tunggu sebentar untuk proses terjemahan

            // Mengambil hasil terjemahan
            const translatedText = await page.$eval('span[jsname="W297wb"]', el => el.innerText);

            await browser.close(); // Tutup browser
            return translatedText; // Kembalikan hasil terjemahan
        } catch (error) {
            throw new Error(`Gagal mengambil terjemahan: ${error.message}`);
        }
    };

    // Endpoint untuk mengakses terjemahan
    app.get('/translate', async (req, res) => {
        try {
            const { text, lang } = req.query; // Mengambil parameter dari query string
            if (!text || !lang) {
                return res.status(400).json({ error: 'Parameter "text" dan "lang" tidak boleh kosong.' });
            }

            const result = await translateText(text, lang); // Memanggil fungsi terjemahan
            res.status(200).json({
                status: 200,
                creator: "Zhizi",
                data: result // Mengembalikan hasil terjemahan
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};
