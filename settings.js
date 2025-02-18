module.exports = {
  API_KEYS: {
    freekey: { key: "freekey", limit: 200, unlimited: false }, // 100 request per hari
    rezzxarix: { key: "rezzxarix", limit: 10000, unlimited: false }, // 100 request per hari
    arixs: { key: "arixs", limit: Infinity, unlimited: true }, // Unlimited request
    visualstrom: { key: "visualstrom", limit: Infinity, unlimited: true }, 
  },
  RESET_TIME: "00:00", // Reset limit setiap hari pukul 00:00 WIB
  TIMEZONE: "Asia/Jakarta", // Zona waktu reset
};
