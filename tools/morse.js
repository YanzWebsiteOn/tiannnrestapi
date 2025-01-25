const axios = require('axios');

module.exports = function(app) {

    // Peta kode Morse
    const morseCodeMap = {
        'A': '.-',    'B': '-...',  'C': '-.-.',  'D': '-..',   'E': '.',     'F': '..-.',
        'G': '--.',   'H': '....',  'I': '..',    'J': '.---',  'K': '-.-',   'L': '.-..',
        'M': '--',    'N': '-.',    'O': '---',   'P': '.--.',  'Q': '--.-',  'R': '.-.',
        'S': '...',   'T': '-',     'U': '..-',   'V': '...-',  'W': '.--',   'X': '-..-',
        'Y': '-.--',  'Z': '--..',  '1': '.----', '2': '..---', '3': '...--', '4': '....-', 
        '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
        ' ': '/'
    };

    // Fungsi untuk mengonversi teks menjadi kode Morse
    async function convertToMorse(text) {
        const upperText = text.toUpperCase(); // Konversi teks ke huruf kapital
        let morseCode = '';

        for (let char of upperText) {
            if (morseCodeMap[char]) {
                morseCode += morseCodeMap[char] + ' '; // Tambahkan sandi Morse dengan spasi antar karakter
            } else {
                morseCode += '? '; // Jika karakter tidak ditemukan di peta, gunakan tanda tanya
            }
        }

        // Hapus spasi berlebih di akhir string
        return morseCode.trim();
    }

    // Endpoint untuk scraper Morse
    app.get('/api/tools/morse', async (req, res) => {
        try {
            const { text } = req.query;
            if (!text) {
                return res.status(400).json({ error: 'Parameter "text" tidak ditemukan : Silahkan Masukan Text Untuk Diubah Ke Sandi Morse' });
            }

            // Mengonversi teks ke kode Morse
            const result = await convertToMorse(text);
            res.status(200).json({
                status: 200,
                creator: "Yanz",
                data: {
                    originalText: text,
                    morseCode: result
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};
