document.addEventListener('DOMContentLoaded', function () {
        let batteryLevel = 95; // Initial battery level
        const batteryElement = document.querySelector('#counter .display-4');
        
        function updateBatteryLevel() {
            const currentHour = new Date().getHours();
            
            if (currentHour >= 19 || currentHour < 6) { // Malam hari (19:00 - 06:00)
                batteryLevel = 100;
            } else {
                batteryLevel = Math.max(0, batteryLevel - 5); // Kurangi 5% setiap 5 menit
            }
            
            batteryElement.textContent = `${batteryLevel}%`;
        }
        
        // Jalankan setiap 5 menit
        updateBatteryLevel(); // Jalankan pertama kali
        setInterval(updateBatteryLevel, 5 * 60 * 1000); // Setiap 5 menit
    });
