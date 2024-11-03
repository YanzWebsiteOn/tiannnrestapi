const axios = require('axios');

module.exports = function(app) {
  
  async function BlackBoxSessi(text, session, promptText) {
    if (!global.messages) global.messages = {};
    if (!(session in messages)) messages[session] = [];
    let _messages = messages[session];
    
    // Menyiapkan data sistem
    const system = {
      "content": promptText,
      "role": "system"
    };

    await _messages.push({
      "content": text,
      "role": "user"
    });
    
    const recentMessages = _messages.filter(msg => msg.role !== 'system').slice(-25);
    _messages = [system, ...recentMessages];
    
    // Melakukan permintaan API ke endpoint eksternal menggunakan fungsi getDenisaResponse
    const response = await getDenisaResponse(text, promptText);
    _messages.push({
      "content": response,
      "role": "assistant"
    });
    
    messages[session] = _messages;
    return response;
  }

  async function getDenisaResponse(text, promptText) {
    try {
      const url = `https://widipe.com/prompt/gpt?prompt=${encodeURIComponent(promptText)}&text=${encodeURIComponent(text)}`;
      const response = await axios.get(url);

      if (response.data && response.data.status) {
        return response.data.result;
      } else {
        console.error('API Error: Response status is false or data missing');
        return 'API tidak mengembalikan data yang valid.';
      }
    } catch (error) {
      console.error('Error:', error.message);
      return 'Terjadi kesalahan saat memproses permintaan.';
    }
  }

  app.get('/zhiziai', async (req, res) => {
    try {
      const { text } = req.query;
      const id = req.ip;

      if (!text) {
        return res.status(400).json({ error: 'Parameter "text" Tidak Ditemukan, Tolong Masukkan Perintah' });
      }

      const defaultPrompt = `Kamu Adalah Zhizi, Seorang Laki Laki SMA Yang Memiliki Sifat Ceria Dan Penyayang...`;
      const promptToUse = req.query.prompt || defaultPrompt;

      const response = await BlackBoxSessi(text, id, promptToUse);
    
      res.status(200).json({
        status: 200,
        creator: "Yanz Official",
        data: response
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
