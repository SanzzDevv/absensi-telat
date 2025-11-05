// Password
const PASSWORD = "OSISJHS24BANDUNG";
let absensiData = JSON.parse(localStorage.getItem('absensiData')) || [];

// Fungsi login
function checkPassword() {
    const password = document.getElementById('password').value;
    const error = document.getElementById('error');
    
    if (password === PASSWORD) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        localStorage.setItem('isLoggedIn', 'true');
        document.getElementById('inputData').focus();
    } else {
        error.textContent = 'Password salah!';
        document.getElementById('password').value = '';
    }
}

// Auto login
if (localStorage.getItem('isLoggedIn') === 'true') {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
}

// Update waktu
function updateWaktu() {
    const now = new Date();
    document.getElementById('currentTime').textContent = 
        'Waktu: ' + now.toLocaleString('id-ID');
}
setInterval(updateWaktu, 1000);
updateWaktu();

// Cek status telat
function cekStatus() {
    const now = new Date();
    const jam = now.getHours();
    const menit = now.getMinutes();
    
    // Batas waktu jam 7:00
    return (jam > 7 || (jam === 7 && menit > 0)) ? 'Telat' : 'Tepat Waktu';
}

// Simpan absensi
function simpanAbsensi() {
    const input = document.getElementById('inputData').value.trim();
    if (!input) {
        tampilkanNotifikasi('Isi nama dan kelas!');
        return;
    }

    // Pisahkan nama dan kelas (ambil angka dan huruf terakhir sebagai kelas)
    const parts = input.split(' ');
    let nama = input;
    let kelas = '';
    
    // Cari bagian yang mengandung kelas (angka + huruf)
    for (let i = parts.length - 1; i >= 0; i--) {
        if (/^[7-9][A-I]$/i.test(parts[i])) {
            kelas = parts[i].toUpperCase();
            nama = parts.slice(0, i).join(' ');
            break;
        }
    }

    if (!kelas) {
        tampilkanNotifikasi('Format: Nama Kelas (contoh: Andi 7A)');
        return;
    }

    const waktu = new Date().toLocaleString('id-ID');
    const status = cekStatus();

    // Simpan data
    absensiData.unshift({
        nama: nama,
        kelas: kelas,
        waktu: waktu,
        status: status
    });

    localStorage.setItem('absensiData', JSON.stringify(absensiData));

    // Reset input dan fokus kembali
    document.getElementById('inputData').value = '';
    document.getElementById('inputData').focus();

    // Tampilkan status
    const statusElement = document.getElementById('status');
    statusElement.textContent = `${nama} (${kelas}) - ${status}`;
    statusElement.className = `status ${status === 'Telat' ? 'status-telat' : 'status-tepat'}`;

    // Update tampilan
    tampilkanData();
    tampilkanNotifikasi(`✅ ${nama} (${kelas}) - ${status}`);
}

// Tampilkan data
function tampilkanData() {
    const dataList = document.getElementById('dataList');
    dataList.innerHTML = '';

    absensiData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'data-item';
        div.innerHTML = `
            <div>
                <strong>${item.nama}</strong> (${item.kelas})
                <div style="font-size: 12px; color: #666;">${item.waktu}</div>
            </div>
            <div style="color: ${item.status === 'Telat' ? '#DC2626' : '#059669'}; font-weight: bold;">
                ${item.status}
            </div>
        `;
        dataList.appendChild(div);
    });
}

// Reset data
function resetData() {
    if (confirm('Hapus semua data?')) {
        absensiData = [];
        localStorage.removeItem('absensiData');
        tampilkanData();
        document.getElementById('status').textContent = '';
        tampilkanNotifikasi('Data direset');
    }
}

// Format data untuk dikirim
function formatData() {
    if (absensiData.length === 0) return 'Belum ada data absensi.';
    
    let teks = '📊 ABSENSI KETERLAMBATAN\n\n';
    
    // Kelompokkan per kelas
    const perKelas = {};
    absensiData.forEach(item => {
        if (!perKelas[item.kelas]) perKelas[item.kelas] = [];
        perKelas[item.kelas].push(item);
    });

    Object.keys(perKelas).sort().forEach(kelas => {
        teks += `📚 ${kelas}:\n`;
        perKelas[kelas].forEach((item, i) => {
            teks += `${i+1}. ${item.nama} - ${item.status}\n`;
        });
        teks += '\n';
    });

    const telat = absensiData.filter(item => item.status === 'Telat').length;
    const tepat = absensiData.filter(item => item.status === 'Tepat Waktu').length;
    
    teks += `📈 STATISTIK:\n`;
    teks += `✅ Tepat: ${tepat}\n`;
    teks += `🔴 Telat: ${telat}\n`;
    teks += `📊 Total: ${absensiData.length}\n\n`;
    teks += `Waktu: ${new Date().toLocaleString('id-ID')}`;

    return teks;
}

// Salin data
function salinData() {
    const teks = formatData();
    navigator.clipboard.writeText(teks).then(() => {
        tampilkanNotifikasi('📋 Data disalin!');
    });
}

// Kirim WhatsApp
function kirimWhatsApp() {
    const teks = formatData();
    const url = `https://wa.me/?text=${encodeURIComponent(teks)}`;
    window.open(url, '_blank');
}

// Notifikasi
function tampilkanNotifikasi(pesan) {
    const notif = document.getElementById('notification');
    notif.textContent = pesan;
    notif.style.display = 'block';
    setTimeout(() => {
        notif.style.display = 'none';
    }, 2000);
}

// Enter untuk submit
document.getElementById('inputData').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') simpanAbsensi();
});

document.getElementById('password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') checkPassword();
});

// Load data saat start
tampilkanData();