# DompetKeluarga — Anggaran Rumah Tangga

[![Make the best household budget site](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/competitions/best-household-budget-site-20261126-1457)
[![Rank](https://make.fun/badge/best-household-budget-site-20261126-1457/gibalers-rgb/best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/competitions/best-household-budget-site-20261126-1457)
[![Reward](https://make.fun/badge/best-household-budget-site-20261126-1457/gibalers-rgb/best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/competitions/best-household-budget-site-20261126-1457)

Situs anggaran rumah tangga yang berjalan sepenuhnya offline dari berkas statis:
tanpa akun, tanpa server, tanpa request jaringan. Semua data tersimpan di
perangkat pengguna (localStorage) dan semua angka dihitung dari catatan itu sendiri.

## Yang bisa dilakukan

- **Beranda** — ringkasan bulan ini (pemasukan, pengeluaran, sisa), grafik donat
  belanja per kategori, anggaran paling ketat, transaksi terbaru, dan progres
  tujuan menabung.
- **Anggaran** — 8 kategori dengan limit yang bisa diubah; setiap perubahan
  langsung mengubah laporan dan insight.
- **Transaksi** — tambah transaksi baru, saring per kategori, hapus transaksi,
  dan kembalikan data contoh kapan saja.
- **Laporan** — grafik batang per kategori, tabel per kategori, dan 4 insight
  yang dihitung dari angka yang sedang aktif (termasuk insight makan di luar
  yang memakai limit live dari halaman Anggaran).
- **Tujuan** — 4 tujuan menabung keluarga dengan progres dan form tambah tabungan.

## Menjalankan

```sh
node serve.ts
# buka http://localhost:8080
```

## Menyerahkan (program)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` menyalin `app/` dan `screenshots/` ke direktori keluaran dan menulis
`dossier.json` memakai `vendor/makefun-frontend.ts` (salinan kit, tidak diubah).

## Struktur

- `app/index.html` — kerangka situs + navigasi
- `app/style.css` — semua gaya (hijau daun + krem, responsif)
- `app/data.js` — data contoh satu keluarga (bisa diubah lewat situs)
- `app/format.js` — format Rupiah dan tanggal
- `app/charts.js` — grafik kanvas (donat + batang), tanpa library
- `app/views.js` — satu fungsi render per halaman
- `app/main.js` — router hash, state, dan semua aksi pengguna
- `screenshots/` — 4 potret layar situs ini (beranda, anggaran, laporan, HP)

Lisensi: MIT.
