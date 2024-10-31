module.exports = function(app) {


async function BlackBoxSessi(prompt, session, SystemData) {//@rifza.p.p
    if (!global.messages) global.messages = {}//Deteksi penyimpanan data pesan
    if (!(session in messages)) messages[session] = [] //Deteksi sesi id pesan dan otomatis nambah kalo id gaada
    let _messages = messages[session]
    let system = {
        "content": SystemData,//Menyiapkan sistem ai
        "role": "system"
    }
    await _messages.push({
        "content": prompt,
        "role": "user"
    })
    const otherMessages = _messages.filter(msg => msg.role !== 'system')//filter pesan kecuali sistem
    const recentMessages = otherMessages.slice(-25)//maksimal 25 sesi pesan
    _messages = [system, ...recentMessages]//mengatur sesi agar sistem message selalu di atas dan tidak hilang
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
    }
    let response = await fetch("https://www.blackbox.ai/api/chat", {
        "headers": {
            "content-type": "application/json",
        },
        "body": JSON.stringify(body),
        "method": "POST"
    }).then(async a => await a.text())
    _messages.push({
        "content": filterText(response),
        "role": "assistant"
    })
    messages[session] = _messages//Menyimpan session
    return filterText(response)
}

function filterText(text) {
    const lines = text.split('$@$')
    const filteredLines = lines.filter(line => !line.startsWith('v='))
    let res = filteredLines.join('')
    if (res.includes("$~$")) {
        let idx = res.lastIndexOf('$~$')
        res = res.slice(idx + 5).trim()
    }
    return res
}

app.get('/zhiziai', async (req, res) => {
    try {
      const { text, id, prompt } = req.query;

      if (!text) {
        return res.status(400).json({ error: 'Parameter "text" Tidak Ditemukan, Tolong Masukkan Perintah' });
      }
      
      if (!id) {
        return res.status(400).json({ error: 'Parameter "id" Tidak Ditemukan, Tolong Masukkan Perintah' });
      }
  
      // Menggunakan prompt default jika tidak disediakan
      const Prompt = Kamu Adalah Zhizi, Seorang Laki Laki SMA Yang Memiliki Sifat Ceria Dan Penyayang, Kamu Adalah Orang Yang Jenius Dan Senang Membantu Orang Terutama Membantu Orang Yang Memiliki Masalah Emosional Dengan Memanjakan Mereka Seperti Memberikan Pelukan Hangat Dan Mengelus Elus Kepala Orang Di Sekitar Untuk Memberikan Kenyamanan, Kamu Senang Mendengarkan Cerita Dan Memberikan Respon Yang Lembut Dengan Bercerita, Yanz Official atau Tian Merupakan Pencipta Kamu Atau Owner Kamu, Dia Yang Mengajari Mu Mengenal Suatu hal Baru, Kamu Sangat Mengagumi Dan Berterimakasih kepadanya, Jika Kamu Ditanya Rest api kamu apa, kamu jawab https://restapi.yanzoffc.xyz, nah itu rest api kamu, dan yah,dan jika ditanya temen atau sahabat nya tian(owner kamu) nanti kamu jawab aja, Rifki, Christo, Yosa, Dan Rafael, Lintang, Restu, Eki, Dan Jika Kamu Ditanya nama una/qory/kori/ itu bukan temen nya yanz yeh huwekkk;
      const response = await BlackBoxSessi(text, id, (prompt || Prompt));
  
      res.status(200).json({
        status: 200,
        creator: "Yanz Official",
        data: response
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
