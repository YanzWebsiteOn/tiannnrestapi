// Fungsi untuk mengisi baterai dan menampilkan konten baru
        function fillBattery() {
            const chargeElement = document.getElementById('charge');
            const batteryElement = document.getElementById('battery');
            const newContent = document.getElementById('Docss');

            chargeElement.style.width = '100%'; // Mengatur lebar isi menjadi 100%
            
            // Menampilkan konten baru setelah pengisian selesai
            setTimeout(() => {
                batteryElement.style.display = 'none'; // Menyembunyikan baterai
                newContent.style.display = 'block'; // Menampilkan konten baru
            }, 1000); // Delay 1 detik setelah pengisian penuh
        }

        // Memanggil fungsi setelah delay untuk memberi waktu animasi loading
        setTimeout(fillBattery, 1000); // Mengisi baterai setelah 1 detik
