// Password configuration
const CORRECT_PASSWORD = "OSISJHS24BANDUNG";

// Data absensi disimpan di localStorage
let absensiData = JSON.parse(localStorage.getItem('absensiData')) || [];

// Fungsi untuk mengecek password - FIXED VERSION
function checkPassword() {
    console.log('checkPassword function called'); // Debug log
    const passwordInput = document.getElementById('password');
    const errorElement = document.getElementById('passwordError');
    
    if (!passwordInput) {
        console.error('Password input not found!');
        return;
    }
    
    const passwordValue = passwordInput.value;
    console.log('Password entered:', passwordValue); // Debug log
    
    if (passwordValue === CORRECT_PASSWORD) {
        console.log('Password correct!'); // Debug log
        // Password benar, tampilkan aplikasi utama
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        localStorage.setItem('isLoggedIn', 'true');
        tampilkanNotifikasi('Login berhasil!');
    } else {
        console.log('Password incorrect!'); // Debug log
        // Password salah, tampilkan pesan error
        errorElement.textContent = 'Password salah! Mau passwordnya? Tanya pemiliknya!';
        passwordInput.value = '';
        passwordInput.focus();
        
        // Tambah efek shake pada input
        passwordInput.classList.add('shake');
        setTimeout(() => {
            passwordInput.classList.remove('shake');
        }, 500);
    }
}

// Event listener yang lebih robust untuk password
function setupPasswordListeners() {
    const passwordInput = document.getElementById('password');
    const loginBtn = document.querySelector('.btn-primary');
    
    console.log('Setting up password listeners...'); // Debug log
    
    if (passwordInput) {
        // Enter key listener
        passwordInput.addEventListener('keypress', function(e) {
            console.log('Key pressed:', e.key); // Debug log
            if (e.key === 'Enter') {
                console.log('Enter key pressed, calling checkPassword'); // Debug log
                checkPassword();
            }
        });
        
        // Pastikan input bisa difocus
        passwordInput.focus();
    } else {
        console.error('Password input element not found!');
    }
    
    if (loginBtn) {
        // Click listener untuk tombol login
        loginBtn.addEventListener('click', function(e) {
            console.log('Login button clicked'); // Debug log
            e.preventDefault();
            checkPassword();
        });
    } else {
        console.error('Login button not found!');
    }
}

// Fungsi untuk auto login jika sudah login sebelumnya
function checkAutoLogin() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    console.log('Auto login check:', isLoggedIn); // Debug log
    
    if (isLoggedIn === 'true') {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        console.log('Auto login successful'); // Debug log
    }
}

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
    
    const currentTimeElement = document.getElementById('currentTime');
    if (currentTimeElement) {
        currentTimeElement.textContent = 
            `Waktu Sekarang: ${now.toLocaleDateString('id-ID', options)}`;
    }
}

// Cek status keterlambatan
function cekStatus() {
    const now = new Date();
    const batasWaktuInput = document.getElementById('batasWaktu');
    
    if (!batasWaktuInput) return 'Tepat Waktu';
    
    const batasWaktu = batasWaktuInput.value;
    
    // Buat objek Date untuk batas waktu hari ini
    const [jam, menit] = batasWaktu.split(':');
    const batas = new Date();
    batas.setHours(parseInt(jam), parseInt(menit), 0, 0);
    
    return now > batas ? 'Telat' : 'Tepat Waktu';
}

// Update statistik
function updateStatistik() {
    const hariIni = new Date().toDateString();
    const dataHariIni = absensiData.filter(item => {
        const itemDate = new Date(item.timestamp).toDateString();
        return itemDate === hariIni;
    });
    
    const total = dataHariIni.length;
    const tepat = dataHariIni.filter(item => item.status === 'Tepat Waktu').length;
    const telat = dataHariIni.filter(item => item.status === 'Telat').length;
    
    // Update elements dengan pengecekan null
    const statTotal = document.getElementById('statTotal');
    const statTepat = document.getElementById('statTepat');
    const statTelat = document.getElementById('statTelat');
    
    if (statTotal) statTotal.textContent = total;
    if (statTepat) statTepat.textContent = tepat;
    if (statTelat) statTelat.textContent = telat;
}

// Simpan absensi
function simpanAbsensi() {
    const nama = document.getElementById('nama')?.value.trim();
    const tingkat = document.getElementById('tingkat')?.value;
    const kelas = document.getElementById('kelas')?.value;
    
    if (!nama || !tingkat || !kelas) {
        tampilkanNotifikasi('❌ Harap isi semua data!', 'error');
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
    if (statusElement) {
        statusElement.textContent = `Siswa ${nama} - Status: ${status}`;
        statusElement.className = `status-indicator ${status === 'Telat' ? 'status-telat' : 'status-tepat'}`;
    }
    
    // Reset form
    document.getElementById('nama').value = '';
    document.getElementById('tingkat').value = '';
    const kelasSelect = document.getElementById('kelas');
    if (kelasSelect) {
        kelasSelect.innerHTML = '<option value="">Pilih Tingkat terlebih dahulu</option>';
    }
    
    // Update tabel dan statistik
    tampilkanData();
    updateStatistik();
    
    tampilkanNotifikasi(`✅ Absensi ${nama} berhasil disimpan!`);
}

// Tampilkan data di tabel
function tampilkanData() {
    const tbody = document.getElementById('tabelAbsensi');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Urutkan berdasarkan waktu terbaru
    const dataTerurut = [...absensiData].sort((a, b) => b.timestamp - a.timestamp);
    
    dataTerurut.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.nama}</td>
            <td>${item.kelas}</td>
            <td>${item.waktu}</td>
            <td style="color: ${item.status === 'Telat' ? '#DC2626' : '#059669'}; font-weight: bold;">
                ${item.status === 'Telat' ? '🔴' : '🟢'} ${item.status}
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
        updateStatistik();
        const statusInfo = document.getElementById('statusInfo');
        if (statusInfo) statusInfo.textContent = '';
        tampilkanNotifikasi('🗑️ Semua data telah dihapus!');
    }
}

// Format data untuk dikirim
function formatData() {
    if (absensiData.length === 0) {
        return "Tidak ada data absensi.";
    }
    
    let teks = "Siap ka/teh izin mengirim list yang telat: (Tnggl/Bln/Thn)\n\n";
    
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
    
    teks += `📈 STATISTIK:\n`;
    teks += `Tepat Waktu: ${totalTepat} siswa\n`;
    teks += `Terlambat: ${totalTelat} siswa\n`;
    teks += `📊 Total: ${absensiData.length} siswa\n\n`;
    teks += `*Data diambil pada: ${new Date().toLocaleString('id-ID')}*`;
    
    return teks;
}

// Salin data ke clipboard
function salinData() {
    const teks = formatData();
    
    // Salin ke clipboard
    navigator.clipboard.writeText(teks).then(() => {
        tampilkanNotifikasi('Data berhasil disalin ke clipboard!');
    }).catch(err => {
        // Fallback untuk browser yang tidak support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = teks;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        tampilkanNotifikasi('Data berhasil disalin ke clipboard!');
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
function tampilkanNotifikasi(pesan, tipe = 'success') {
    const notifikasi = document.getElementById('notification');
    if (!notifikasi) return;
    
    notifikasi.textContent = pesan;
    
    // Warna berdasarkan tipe
    if (tipe === 'error') {
        notifikasi.style.background = '#EF4444';
    } else {
        notifikasi.style.background = '#10B981';
    }
    
    notifikasi.classList.add('show');
    
    setTimeout(() => {
        notifikasi.classList.remove('show');
    }, 3000);
}

// Inisialisasi yang lebih robust
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing app...'); // Debug log
    
    // Cek auto login terlebih dahulu
    checkAutoLogin();
    
    // Setup password listeners
    setupPasswordListeners();
    
    updateWaktu();
    setInterval(updateWaktu, 1000);
    tampilkanData();
    updateStatistik();
    
    // Set batas waktu default ke 07:00
    const batasWaktuInput = document.getElementById('batasWaktu');
    if (batasWaktuInput) {
        batasWaktuInput.value = '07:00';
    }
    
    console.log('App initialization complete'); // Debug log
});

// Tambahkan style untuk efek shake
const style = document.createElement('style');
style.textContent = `
    .shake {
        animation: shake 0.5s ease-in-out;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    /* Pastikan elemen login visible */
    .login-container {
        display: flex !important;
    }
    
    .hidden {
        display: none !important;
    }
`;
document.head.appendChild(style);

// Fallback: Jika semua gagal, coba setup ulang setelah 1 detik
setTimeout(() => {
    if (document.getElementById('loginScreen') && 
        !document.getElementById('loginScreen').classList.contains('hidden')) {
        console.log('Fallback: Re-setting up password listeners');
        setupPasswordListeners();
    }
}, 1000);