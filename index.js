const express = require('express');
const cors = require('cors');
const path = require('path');

// Full Kode Di Github Saya : https://github.com/Lenwyy/

const app = express();
const PORT = process.env.PORT || 3000;
app.enable("trust proxy");
app.set("json spaces", 2);

app.use(express.static(path.join(__dirname, 'public')));

// Middleware CORS
app.use(cors());

// Import AI
require('./ai/ai4chat')(app);
require('./ai/Aianswer')(app);
require('./ai/Blackbox')(app);
require('./ai/LuminAI')(app);
require('./ai/zhiziai')(app);
require('./ai/Thinkai')(app);
require('./ai/ChristyAi')(app);
require('./ai/joko')(app);

// Import Berita
require('./berita/liputan6')(app);

// Import Downloader 
require('./downloader/tiktok')(app);
require('./downloader/mp4')(app);
require('./downloader/mediafire')(app);

// Import Search
require('./search/goodread')(app);
require('./search/ypia')(app);
require('./search/rumaysho')(app);
require('./search/surah')(app);
require('./search/jadwalsholat')(app);
require('./search/playstore')(app);
require('./search/spotify')(app);

// Import Tools
require('./tools/morse')(app);
require('./tools/totext')(app);
require('./tools/ttstalk')(app);
require('./tools/tekstoimg')(app);

// Full Kode Di Github Saya : https://github.com/YanzOffc/

// Endpoint untuk halaman HTML utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle 404 error
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

// Handle error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
