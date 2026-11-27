/* DompetKeluarga — data awal rumah tangga contoh.
   Semua angka adalah contoh realistis satu keluarga (2 dewasa, 1 anak),
   dan bisa diubah lewat situsnya: tambah transaksi, ubah limit anggaran,
   atau reset ke contoh ini dari halaman Transaksi. */
export const seedState = {
  household: 'Keluarga Santoso',
  month: 'November 2026',
  today: '2026-11-27',
  monthDays: 30,
  members: ['Ayah (Budi)', 'Ibu (Sari)', 'Anak (Dimas, 9 th)'],
  income: [
    { id: 'g1', label: 'Gaji Budi — November', amount: 8500000 },
    { id: 'g2', label: 'Gaji Sari — November', amount: 6200000 },
    { id: 'g3', label: 'Usaha sampingan (kue)', amount: 1350000 },
  ],
  budgets: [
    { id: 'belanja', name: 'Belanja Harian', icon: '🛒', limit: 2800000, color: '#2e7d5b' },
    { id: 'makan', name: 'Makan di Luar', icon: '🍜', limit: 900000, color: '#c2703d' },
    { id: 'tagihan', name: 'Listrik, Air & Internet', icon: '💡', limit: 1100000, color: '#3d6e9e' },
    { id: 'transport', name: 'Transport & Bensin', icon: '🛵', limit: 1200000, color: '#6a5a9e' },
    { id: 'sekolah', name: 'Sekolah Dimas', icon: '🎒', limit: 1500000, color: '#a04a6e' },
    { id: 'hiburan', name: 'Hiburan & Nonton', icon: '🎬', limit: 500000, color: '#4a7a8c' },
    { id: 'kesehatan', name: 'Kesehatan', icon: '💊', limit: 600000, color: '#7a8c3d' },
    { id: 'lainnya', name: 'Lain-lain', icon: '🧺', limit: 400000, color: '#8a8a7a' },
  ],
  transactions: [
    { id: 't01', date: '2026-11-01', desc: 'Gaji Budi — November', cat: 'income', amount: 8500000 },
    { id: 't02', date: '2026-11-01', desc: 'Gaji Sari — November', cat: 'income', amount: 6200000 },
    { id: 't03', date: '2026-11-02', desc: 'Belanja mingguan — Pasar Minggu', cat: 'belanja', amount: 486000 },
    { id: 't04', date: '2026-11-03', desc: 'Token listrik 200 kWh', cat: 'tagihan', amount: 312000 },
    { id: 't05', date: '2026-11-04', desc: 'Bensin motor (2x isi)', cat: 'transport', amount: 124000 },
    { id: 't06', date: '2026-11-05', desc: 'Makan malam keluarga — warteg langganan', cat: 'makan', amount: 87000 },
    { id: 't07', date: '2026-11-06', desc: 'SPP + les renang Dimas', cat: 'sekolah', amount: 950000 },
    { id: 't08', date: '2026-11-07', desc: 'Belanja mingguan — supermarket', cat: 'belanja', amount: 523000 },
    { id: 't09', date: '2026-11-08', desc: 'Nonton bioskop keluarga', cat: 'hiburan', amount: 185000 },
    { id: 't10', date: '2026-11-09', desc: 'Internet rumah — November', cat: 'tagihan', amount: 349000 },
    { id: 't11', date: '2026-11-10', desc: 'Usaha sampingan — pesanan kue', cat: 'income', amount: 1350000 },
    { id: 't12', date: '2026-11-11', desc: 'Makan siang kantor Sari (3x)', cat: 'makan', amount: 142000 },
    { id: 't13', date: '2026-11-12', desc: 'Obat flu + vitamin Dimas', cat: 'kesehatan', amount: 96000 },
    { id: 't14', date: '2026-11-14', desc: 'Belanja mingguan — Pasar Minggu', cat: 'belanja', amount: 441000 },
    { id: 't15', date: '2026-11-15', desc: 'Ojek online (antar jemput sekolah)', cat: 'transport', amount: 210000 },
    { id: 't16', date: '2026-11-16', desc: 'Makan malam — ayam geprek', cat: 'makan', amount: 112000 },
    { id: 't17', date: '2026-11-18', desc: 'Air galon + gas LPG', cat: 'tagihan', amount: 168000 },
    { id: 't18', date: '2026-11-19', desc: 'Buku + alat tulis Dimas', cat: 'sekolah', amount: 187000 },
    { id: 't19', date: '2026-11-20', desc: 'Belanja mingguan — supermarket', cat: 'belanja', amount: 498000 },
    { id: 't20', date: '2026-11-21', desc: 'Bensin motor + servis ringan', cat: 'transport', amount: 265000 },
    { id: 't21', date: '2026-11-22', desc: 'Makan siang keluarga — bakso', cat: 'makan', amount: 98000 },
    { id: 't22', date: '2026-11-23', desc: 'Langganan streaming keluarga', cat: 'hiburan', amount: 59000 },
    { id: 't23', date: '2026-11-24', desc: 'Sabun, sampo & kebutuhan rumah', cat: 'lainnya', amount: 154000 },
    { id: 't24', date: '2026-11-25', desc: 'Cek gigi Dimas', cat: 'kesehatan', amount: 175000 },
    { id: 't25', date: '2026-11-26', desc: 'Belanja mingguan — Pasar Minggu', cat: 'belanja', amount: 512000 },
    { id: 't26', date: '2026-11-27', desc: 'Makan malam — soto + es teh', cat: 'makan', amount: 76000 },
  ],
  goals: [
    { id: 'g-dana', name: 'Dana Darurat (6x pengeluaran)', icon: '🛟', target: 12000000, saved: 7450000 },
    { id: 'g-libur', name: 'Liburan Akhir Tahun — Bandung', icon: '🏖️', target: 4500000, saved: 2980000 },
    { id: 'g-laptop', name: 'Laptop Baru untuk Sari', icon: '💻', target: 8000000, saved: 2150000 },
    { id: 'g-sekolah', name: 'Tabungan Sekolah Dimas 2027', icon: '🎓', target: 6000000, saved: 1200000 },
  ],
};

export function cloneSeed() {
  return JSON.parse(JSON.stringify(seedState));
}
