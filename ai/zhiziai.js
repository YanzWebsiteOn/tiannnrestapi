module.exports = function(app) {

    async function BlackBoxSessi(prompt, session, SystemData) {
        if (!global.messages) global.messages = {}; // Deteksi penyimpanan data pesan
        if (!(session in messages)) messages[session] = []; // Deteksi sesi id pesan dan otomatis nambah kalau id nggak ada
        let _messages = messages[session];
        let system = {
            "content": SystemData, // Menyiapkan sistem ai
            "role": "system"
        };
        await _messages.push({
            "content": prompt,
            "role": "user"
        });
        const otherMessages = _messages.filter(msg => msg.role !== 'system'); // filter pesan kecuali sistem
        const recentMessages = otherMessages.slice(-25); // maksimal 25 sesi pesan
        _messages = [system, ...recentMessages]; // mengatur sesi agar sistem message selalu di atas dan tidak hilang
        const body = {
            "messages": _messages,
            "previewToken": null,
            "codeModelMode": true,
            "agentMode": {},
            "trendingAgentMode": {},
            "isMicMode": false,
            "isChromeExt": false,
            "githubToken": null,
            "clickedAnswer2": false,
            "clickedAnswer3": false,
            "visitFromDelta": null
        };
        let response = await fetch("https://www.blackbox.ai/api/chat", {
            "headers": {
                "content-type": "application/json",
            },
            "body": JSON.stringify(body),
            "method": "POST"
        }).then(async a => await a.text());
        _messages.push({
            "content": filterText(response),
            "role": "assistant"
        });
        messages[session] = _messages; // Menyimpan session
        return filterText(response);
    }

    function filterText(text) {
        const lines = text.split('$@$');
        const filteredLines = lines.filter(line => !line.startsWith('v='));
        let res = filteredLines.join('');
        if (res.includes("$~$")) {
            let idx = res.lastIndexOf('$~$');
            res = res.slice(idx + 5).trim();
        }
        return res;
    }

app.get('/zhiziai', async (req, res) => {
    try {
        const { text } = req.query;
        const id = req.ip; // Menggunakan IP sebagai ID sesi

        if (!text) {
            return res.status(400).json({ error: 'Parameter "text" Tidak Ditemukan, Tolong Masukkan Perintah' });
        }
        
        // Prompt default jika tidak disertakan di query
        const Prompt = `Kamu Adalah Zhizi, Seorang Laki Laki SMA Yang Memiliki Sifat Ceria Dan Penyayang...`;
        const promptToUse = req.query.prompt || Prompt;

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
