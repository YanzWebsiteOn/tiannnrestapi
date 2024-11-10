const axios = require('axios');

module.exports = function(app) {

    // Peta kode Morse ke teks
    const morseToTextMap = {
        '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F', '--.': 'G',
        '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N',
        '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T', '..-': 'U',
        '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y', '--..': 'Z', 
        '.----': '1', '..---': '2', '...--': '3', '....-': '4', '.....': '5',
        '-....': '6', '--...': '7', '---..': '8', '----.': '9', '-----': '0',
        '/': ' ' // Pembatas kata dalam kode Morse
    };

    // Fungsi untuk mengonversi kode Morse menjadi teks
    async function convertToText(morseCode) {
        let text = '';

        // Pisahkan kode Morse berdasarkan spasi antar karakter
        const morseSymbols = morseCode.split(' ');

        for (let symbol of morseSymbols) {
            if (morseToTextMap[symbol]) {
                text += morseToTextMap[symbol];
            } else {
                text += '?'; // Jika simbol tidak dikenali, tambahkan tanda tanya
            }
        }

        return text;
    }

    // Endpoint untuk scraper teks dari Morse
    app.get('/totext', async (req, res) => {
        try {
            const { morse } = req.query;
            if (!morse) {
                return res.status(400).json({ error: 'Parameter "morse" tidak ditemukan : Silahkan Masukan Kode Morse Untuk Diubah Ke Teks' });
            }

            // Mengonversi kode Morse ke teks
            const result = await convertToText(morse);
            res.status(200).json({
                status: 200,
                creator: "Yanz",
                data: {
                    originalMorse: morse,
                    TextResult: result
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};
