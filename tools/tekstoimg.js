const axios = require('axios');

module.exports = function(app) {

async function ttp3(text) {
  try {
    const baseUrl = 'https://dummyimage.com/600x400/fcfcfc/000000.png&text=';
    const finalUrl = `${baseUrl}${encodeURIComponent(text)}`;
    return finalUrl;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

  // Endpoint TeksToImage
  app.get('/tekstoimg', async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).json({ error: 'Parameter "text" Tidak Ditemukan, Tolong Masukkan Perintah' });
      }
      const response = await ttp3(text);
      res.status(200).json({
        status: 200,
        creator: "Yanz",
        data: response
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
