// Data absensi disimpan di localStorage
let absensiData = JSON.parse(localStorage.getItem('absensiData')) || [];

// Fungsi untuk update pilihan kelas berdasarkan tingkat
function updateKelas() {
    const tingkat = document.getElementById('tingkat').value;
    const kelasSelect = document.getElementById('kelas');
    
    // Kosongkan pilihan kelas
    kelasSelect.innerHTML = '<option value="">Pilih Kelas</option>';
    
    if (tingkat) {
        // Tambahkan kelas A sampai I untuk tingkat yang dipilih
        for (let i = 'A'.charCodeAt(0); i <= 'I'.charCodeAt(0); i++) {
            const kelas = String.fromCharCode(i);
            const option = document.createElement('option');
            option.value = `${tingkat}${kelas}`;
            option.textContent = `${tingkat}${kelas}`;
            kelasSelect.appendChild(option);
        }
    }
}

// Update waktu real-time
function updateWaktu() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit'
    };
    document.getElementById('currentTime').textContent = 
        `Waktu Sekarang: ${now.toLocaleDateString('id-ID', options)}`;
}

// Cek status keterlambatan
function cekStatus() {
    const now = new Date();
    const batasWaktu = document.getElementById('batasWaktu').value;
    
    // Buat objek Date untuk batas waktu hari ini
    const [jam, menit] = batasWaktu.split(':');
    const batas = new Date();
    batas.setHours(parseInt(jam), parseInt(menit), 0, 0);
    
    return now > batas ? 'Telat' : 'Tepat Waktu';
}

// Simpan absensi
function simpanAbsensi() {
    const nama = document.getElementById('nama').value.trim();
    const tingkat = document.getElementById('tingkat').value;
    const kelas = document.getElementById('kelas').value;
    
    if (!nama || !tingkat || !kelas) {
        alert('Harap isi semua data!');
        return;
    }
    
    const sekarang = new Date();
    const waktu = sekarang.toLocaleString('id-ID');
    const status = cekStatus();
    
    // Tambah ke data
    const absensi = {
        nama: nama,
        kelas: kelas,
        waktu: waktu,
        status: status,
        timestamp: sekarang.getTime()
    };
    
    absensiData.push(absensi);
    localStorage.setItem('absensiData', JSON.stringify(absensiData));
    
    // Tampilkan status
    const statusElement = document.getElementById('statusInfo');
    statusElement.textContent = `Siswa ${nama} - Status: ${status}`;
    statusElement.className = `status-indicator ${status === 'Telat' ? 'status-telat' : 'status-tepat'}`;
    
    // Reset form
    document.getElementById('nama').value = '';
    document.getElementById('tingkat').value = '';
    document.getElementById('kelas').innerHTML = '<option value="">Pilih Tingkat terlebih dahulu</option>';
    
    // Update tabel
    tampilkanData();
    
    alert(`Absensi berhasil disimpan!\nStatus: ${status}`);
}

// Tampilkan data di tabel
function tampilkanData() {
    const tbody = document.getElementById('tabelAbsensi');
    tbody.innerHTML = '';
    
    // Urutkan berdasarkan waktu terbaru
    const dataTerurut = [...absensiData].sort((a, b) => b.timestamp - a.timestamp);
    
    dataTerurut.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.nama}</td>
            <td>${item.kelas}</td>
            <td>${item.waktu}</td>
            <td style="color: ${item.status === 'Telat' ? '#c62828' : '#2e7d32'}; font-weight: bold;">
                ${item.status}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Reset semua data
function resetData() {
    if (confirm('Apakah Anda yakin ingin menghapus semua data absensi?')) {
        absensiData = [];
        localStorage.removeItem('absensiData');
        tampilkanData();
        document.getElementById('statusInfo').textContent = '';
        alert('Semua data telah dihapus!');
    }
}

// Format data untuk dikirim
function formatData() {
    if (absensiData.length === 0) {
        return "Tidak ada data absensi.";
    }
    
    let teks = "Assalamualaikum siap ka/teh pagi, siap ka/teh izin kirim yang telat masuk sekolah\n\n";
    
    // Kelompokkan data berdasarkan kelas
    const dataPerKelas = {};
    absensiData.forEach(item => {
        if (!dataPerKelas[item.kelas]) {
            dataPerKelas[item.kelas] = [];
        }
        dataPerKelas[item.kelas].push(item);
    });
    
    // Format per kelas
    Object.keys(dataPerKelas).sort().forEach(kelas => {
        teks += `📚 KELAS ${kelas}:\n`;
        const dataKelas = dataPerKelas[kelas];
        
        dataKelas.forEach((item, index) => {
            const statusIcon = item.status === 'Telat' ? '' : '';
            teks += `${index + 1}. ${item.nama} - ${item.waktu} ${statusIcon} ${item.status}\n`;
        });
        teks += "\n";
    });
    
    // Statistik
    const totalTelat = absensiData.filter(item => item.status === 'Telat').length;
    const totalTepat = absensiData.filter(item => item.status === 'Tepat Waktu').length;
    
    teks += `Total yang telat:\n`;
    teks += `Yang Terlambat: ${totalTelat} siswa\n`;
    teks += `Total Yang Terlambat: ${absensiData.length} siswa\n\n`;
    teks += `*Absensi dibuat pada: ${new Date().toLocaleString('id-ID')}*`;
    
    return teks;
}

// Salin data ke clipboard
function salinData() {
    const teks = formatData();
    
    // Salin ke clipboard
    navigator.clipboard.writeText(teks).then(() => {
        tampilkanNotifikasi('Absensi berhasil di salin!');
    }).catch(err => {
        // Fallback untuk browser yang tidak support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = teks;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        tampilkanNotifikasi('✅ Data berhasil disalin ke clipboard!');
    });
}

// Kirim via WhatsApp
function kirimWhatsApp() {
    const teks = formatData();
    
    // Encode teks untuk URL WhatsApp
    const teksEncoded = encodeURIComponent(teks);
    
    // Buat link WhatsApp
    const urlWhatsApp = `https://wa.me/?text=${teksEncoded}`;
    
    // Buka WhatsApp
    window.open(urlWhatsApp, '_blank');
}

// Tampilkan notifikasi
function tampilkanNotifikasi(pesan) {
    const notifikasi = document.getElementById('notification');
    notifikasi.textContent = pesan;
    notifikasi.classList.add('show');
    
    setTimeout(() => {
        notifikasi.classList.remove('show');
    }, 3000);
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', function() {
    updateWaktu();
    setInterval(updateWaktu, 1000);
    tampilkanData();
    
    // Set batas waktu default ke 07:00
    document.getElementById('batasWaktu').value = '07:00';
});