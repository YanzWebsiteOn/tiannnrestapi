const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {

  // Full Kode Di Github Saya : https://github.com/Lenwyy/

const heroes = [
        { hero: "Alucard", clue1: "Monastery of Light", clue2: "Tigreal", clue3: "Pedang" },
        { hero: "Lancelot", clue1: "Land of Dawn", clue2: "Odette", clue3: "Rapier" },
        { hero: "Gusion", clue1: "House Paxley", clue2: "Aamon", clue3: "Dagger" },
        { hero: "Lesley", clue1: "Vance Family", clue2: "Harley", clue3: "Sniper" },
        { hero: "Balmond", clue1: "Tempat tinggal dekat Abyss", clue2: "Pemimpin klan sadis", clue3: "Konflik dengan ras Elf" },
        { hero: "Khaleed", clue1: "Pemimpin klan pemberani", clue2: "Rekan Moskov", clue3: "Pasir" },
        { hero: "Ruby", clue1: "Tinggal di Moniyan, di desa", clue2: "Dilatih Roger", clue3: "Suka dengan darah" },
        { hero: "Grock", clue1: "Penjaga Ancient Ones", clue2: "Tertidur sampai yang dijaga dicuri", clue3: "Manusia batu" },
        { hero: "Chang'e", clue1: "Murid termuda di Great Dragon", clue2: "Diajar Zilong karena nakal", clue3: "Bulan sabit" },
        { hero: "Tigreal", clue1: "Monastery of Light", clue2: "Alucard", clue3: "Perisai" },
        { hero: "Miya", clue1: "Moon Elf", clue2: "Belerick", clue3: "Busur dan Panah" },
        { hero: "Layla", clue1: "Eruditio", clue2: "Claude", clue3: "Meriam" },
        { hero: "Fanny", clue1: "Monastery of Light", clue2: "Tigreal", clue3: "Kabel Baja" },
        { hero: "Moskov", clue1: "Desert of Exile", clue2: "Khaleed", clue3: "Tombak" },
        { hero: "Clint", clue1: "Wild West", clue2: "Layla", clue3: "Revolver" },
        { hero: "Roger", clue1: "Black Forest", clue2: "Aldous", clue3: "Serigala" },
        { hero: "Aldous", clue1: "Land of Dawn", clue2: "Roger", clue3: "Tangan Batu" },
        { hero: "Wanwan", clue1: "Cadia Riverlands", clue2: "Zilong", clue3: "Shuriken" },
        { hero: "Zilong", clue1: "Cadia Riverlands", clue2: "Wanwan", clue3: "Tombak" },
        { hero: "Hayabusa", clue1: "Scarlet Shadow", clue2: "Hanabi", clue3: "Shuriken" },
        { hero: "Kaja", clue1: "Celestial Palace", clue2: "Uranus", clue3: "Kait Petir" },
        { hero: "Thamuz", clue1: "Abyss", clue2: "Alice", clue3: "Kapak Api" },
        { hero: "Alice", clue1: "Abyss", clue2: "Thamuz", clue3: "Darah" },
        { hero: "Karina", clue1: "Shadow Abyss", clue2: "Selena", clue3: "Pedang Ganda" },
        { hero: "Selena", clue1: "Shadow Abyss", clue2: "Karina", clue3: "Panah Kegelapan" },
        { hero: "Cyclops", clue1: "Land of Dawn", clue2: "Grock", clue3: "Bola Sihir" },
        { hero: "Vale", clue1: "Moniyan Empire", clue2: "Valir", clue3: "Angin" },
        { hero: "Valir", clue1: "Moniyan Empire", clue2: "Vale", clue3: "Api" },
        { hero: "Khufra", clue1: "Desert of Exile", clue2: "Esmeralda", clue3: "Mumi" },
        { hero: "Esmeralda", clue1: "Desert of Exile", clue2: "Khufra", clue3: "Perisai Bulan" },
        { hero: "Lunox", clue1: "Order & Chaos", clue2: "Zhask", clue3: "Keseimbangan" },
        { hero: "Zhask", clue1: "Void Abyss", clue2: "Lunox", clue3: "Serangga Void" },
        { hero: "Harley", clue1: "Magic Academy", clue2: "Lesley", clue3: "Kartu Sihir" },
        { hero: "Claude", clue1: "Eruditio", clue2: "Dexter", clue3: "Pistol Kembar" },
        { hero: "Franco", clue1: "Frozen Sea", clue2: "Bane", clue3: "Kait Besi" },
        { hero: "Bane", clue1: "Frozen Sea", clue2: "Franco", clue3: "Tangan Gurita" },
        { hero: "Johnson", clue1: "Eruditio", clue2: "Layla", clue3: "Mobil Balap" },
        { hero: "Pharsa", clue1: "Moniyan Empire", clue2: "Verri", clue3: "Burung" },
        { hero: "Cecilion", clue1: "Abyss", clue2: "Carmilla", clue3: "Vampir" },
        { hero: "Carmilla", clue1: "Abyss", clue2: "Cecilion", clue3: "Darah" },
        { hero: "Paquito", clue1: "Land of Dawn", clue2: "Manny Pacquiao", clue3: "Tinju" },
        { hero: "Benedetta", clue1: "Moniyan Empire", clue2: "Lancelot", clue3: "Pedang Bayangan" },
        { hero: "Yin", clue1: "Cadia Riverlands", clue2: "Wanwan", clue3: "Dewa Petarung" },
        { hero: "Melissa", clue1: "Land of Dawn", clue2: "Masha", clue3: "Jarum Boneka" },
        { hero: "Fredrinn", clue1: "Eruditio", clue2: "Layla", clue3: "Pedang Kristal" }
    ];

  // Endpoint untuk Games teka teki dari API asli
  app.get('/api/games/tebakheroml', async (req, res) => {
    try {
        let randomIndex = Math.floor(Math.random() * heroes.length);
        let chosenHero = heroes[randomIndex];

      res.status(200).json({
            status: true,
            hero: chosenHero.hero,
            clues: [chosenHero.clue1, chosenHero.clue2, chosenHero.clue3]
      });
    } catch (error) {
      res.status(500).json({ status: false, error: 'Terjadi kesalahan saat mengambil data.' });
    }
  });
};
