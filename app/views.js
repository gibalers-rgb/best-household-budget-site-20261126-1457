/* DompetKeluarga — semua tampilan (satu fungsi per halaman).
   Setiap halaman menghitung angkanya dari state yang sama, jadi angka di
   Beranda, Anggaran, dan Laporan selalu cocok satu sama lain. */
import { formatRupiah, formatRupiahShort, formatDate, pct, escapeHtml } from './format.js';

export function totals(state) {
  const income = state.income.reduce((s, i) => s + i.amount, 0);
  const spentByCat = {};
  let spent = 0;
  for (const t of state.transactions) {
    if (t.cat === 'income') continue;
    spent += t.amount;
    spentByCat[t.cat] = (spentByCat[t.cat] || 0) + t.amount;
  }
  const budgetTotal = state.budgets.reduce((s, b) => s + b.limit, 0);
  return { income, spent, spentByCat, budgetTotal, left: income - spent };
}

export function budgetOf(state, id) {
  return state.budgets.find((b) => b.id === id);
}

function progressBar(used, limit, color) {
  const p = Math.min(100, pct(used, limit));
  const over = used > limit;
  return '<div class="bar" role="progressbar" aria-valuenow="' + p + '" aria-valuemin="0" aria-valuemax="100">' +
    '<span style="width:' + p + '%;background:' + (over ? '#b23a2e' : color) + '"></span></div>';
}

function daysLeft(state) {
  const day = Number(String(state.today || '2026-11-27').split('-')[2]);
  return Math.max(0, (state.monthDays || 30) - day);
}

function budgetCard(state, b, t) {
  const used = t.spentByCat[b.id] || 0;
  const left = b.limit - used;
  const over = used > b.limit;
  const leftDays = daysLeft(state);
  const pace = leftDays > 0 && !over ? ' · ' + formatRupiah(Math.floor(left / leftDays)) + '/hari untuk ' + leftDays + ' hari tersisa' : '';
  return '<article class="card budget-card">' +
    '<div class="budget-head"><span class="cat-icon" aria-hidden="true">' + b.icon + '</span>' +
    '<div><h3>' + escapeHtml(b.name) + '</h3>' +
    '<p class="muted">' + formatRupiah(used) + ' dari ' + formatRupiah(b.limit) + '</p></div>' +
    '<span class="pct-badge' + (over ? ' over' : '') + '">' + pct(used, b.limit) + '%</span></div>' +
    progressBar(used, b.limit, b.color) +
    '<p class="budget-left">' + (over
      ? '⚠️ Lewat ' + formatRupiah(-left) + ' dari limit — kurangi minggu depan.'
      : 'Sisa ' + formatRupiah(left) + ' sampai akhir bulan' + pace + '.') + '</p>' +
    '<form class="limit-form" data-action="set-limit" data-cat="' + b.id + '">' +
    '<label>Ubah limit <input type="number" name="limit" min="0" step="1000" value="' + b.limit + '" aria-label="Limit ' + escapeHtml(b.name) + '"> </label>' +
    '<button type="submit" class="btn small">Simpan limit</button></form>' +
    '</article>';
}

export function renderHome(state) {
  const t = totals(state);
  const recent = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const topBudgets = [...state.budgets]
    .map((b) => ({ b, used: t.spentByCat[b.id] || 0 }))
    .sort((x, y) => pct(y.used, y.b.limit) - pct(x.used, x.b.limit))
    .slice(0, 4);
  const goal = state.goals[0];
  const rows = recent.map((tx) => {
    const b = tx.cat === 'income' ? null : budgetOf(state, tx.cat);
    return '<li class="tx-row"><span class="cat-icon" aria-hidden="true">' + (b ? b.icon : '💰') + '</span>' +
      '<div><strong>' + escapeHtml(tx.desc) + '</strong><span class="muted">' + formatDate(tx.date) + ' · ' + (b ? escapeHtml(b.name) : 'Pemasukan') + '</span></div>' +
      '<span class="amount ' + (tx.cat === 'income' ? 'in' : 'out') + '">' + (tx.cat === 'income' ? '+' : '−') + formatRupiah(tx.amount) + '</span></li>';
  }).join('');
  return '' +
    '<section class="hero"><h1>Anggaran ' + escapeHtml(state.household) + '</h1>' +
    '<p>' + escapeHtml(state.month) + ' · ' + state.members.join(' · ') + ' — semua angka di bawah dihitung langsung dari catatan transaksi keluarga.</p></section>' +
    '<section class="cards-3" aria-label="Ringkasan bulan ini">' +
    '<div class="card stat"><span class="stat-label">Pemasukan</span><strong class="in">' + formatRupiah(t.income) + '</strong><span class="muted">' + state.income.length + ' sumber</span></div>' +
    '<div class="card stat"><span class="stat-label">Pengeluaran</span><strong class="out">' + formatRupiah(t.spent) + '</strong><span class="muted">' + pct(t.spent, t.income) + '% dari pemasukan</span></div>' +
    '<div class="card stat"><span class="stat-label">Sisa bulan ini</span><strong>' + formatRupiah(t.left) + '</strong><span class="muted">tabungan ' + pct(t.left, t.income) + '% dari pemasukan</span></div>' +
    '</section>' +
    '<div class="grid-2">' +
    '<section class="card"><h2>Belanja per kategori</h2><canvas id="donut" aria-label="Grafik donat belanja per kategori"></canvas>' +
    '<ul class="legend">' + state.budgets.map((b) => {
      const used = t.spentByCat[b.id] || 0;
      return '<li><span class="dot" style="background:' + b.color + '"></span>' + escapeHtml(b.name) + ' — <strong>' + formatRupiahShort(used) + '</strong></li>';
    }).join('') + '</ul></section>' +
    '<section class="card"><h2>Anggaran paling ketat</h2>' +
    topBudgets.map(({ b, used }) => '<div class="mini-budget"><div class="mini-head"><span>' + b.icon + ' ' + escapeHtml(b.name) + '</span><strong>' + pct(used, b.limit) + '%</strong></div>' + progressBar(used, b.limit, b.color) + '</div>').join('') +
    '<p><a class="btn" href="#/anggaran">Lihat semua anggaran →</a></p></section>' +
    '</div>' +
    '<div class="grid-2">' +
    '<section class="card"><h2>Transaksi terbaru</h2><ul class="tx-list">' + rows + '</ul>' +
    '<p><a class="btn" href="#/transaksi">Semua transaksi & tambah baru →</a></p></section>' +
    '<section class="card goal-teaser"><h2>Tujuan menabung</h2>' +
    '<p><strong>' + escapeHtml(goal.name) + '</strong></p>' + progressBar(goal.saved, goal.target, '#2e7d5b') +
    '<p>' + formatRupiah(goal.saved) + ' dari ' + formatRupiah(goal.target) + ' (' + pct(goal.saved, goal.target) + '%)</p>' +
    '<p><a class="btn" href="#/tujuan">Lihat 4 tujuan keluarga →</a></p></section>' +
    '</div>';
}

export function renderBudgets(state) {
  const t = totals(state);
  return '<section class="hero"><h1>Anggaran Bulanan</h1>' +
    '<p>Total limit ' + formatRupiah(t.budgetTotal) + ' dari pemasukan ' + formatRupiah(t.income) + '. Ubah limit apa pun di bawah — laporan ikut berubah karena semua insight membaca limit yang sedang aktif.</p></section>' +
    '<section class="cards-3"><div class="card stat"><span class="stat-label">Total limit</span><strong>' + formatRupiah(t.budgetTotal) + '</strong></div>' +
    '<div class="card stat"><span class="stat-label">Sudah terpakai</span><strong class="out">' + formatRupiah(t.spent) + '</strong></div>' +
    '<div class="card stat"><span class="stat-label">Sisa anggaran</span><strong>' + formatRupiah(t.budgetTotal - t.spent) + '</strong></div></section>' +
    '<section class="budget-grid">' + state.budgets.map((b) => budgetCard(state, b, t)).join('') + '</section>' +
    '<p class="hint">Tips: anggaran yang sudah lewat 80% diberi tanda — pindahkan sisa dari kategori yang masih longgar sebelum akhir bulan.</p>';
}

export function renderTransactions(state, filter) {
  const t = totals(state);
  const cats = [{ id: 'all', name: 'Semua' }, { id: 'income', name: 'Pemasukan' }, ...state.budgets];
  const list = [...state.transactions]
    .filter((tx) => filter === 'all' || tx.cat === filter)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const rows = list.map((tx) => {
    const b = tx.cat === 'income' ? null : budgetOf(state, tx.cat);
    return '<li class="tx-row"><span class="cat-icon" aria-hidden="true">' + (b ? b.icon : '💰') + '</span>' +
      '<div><strong>' + escapeHtml(tx.desc) + '</strong><span class="muted">' + formatDate(tx.date) + ' · ' + (b ? escapeHtml(b.name) : 'Pemasukan') + '</span></div>' +
      '<span class="amount ' + (tx.cat === 'income' ? 'in' : 'out') + '">' + (tx.cat === 'income' ? '+' : '−') + formatRupiah(tx.amount) + '</span>' +
      '<button class="btn small danger" data-action="delete-tx" data-id="' + tx.id + '">Hapus</button></li>';
  }).join('');
  const options = state.budgets.map((b) => '<option value="' + b.id + '">' + escapeHtml(b.name) + '</option>').join('');
  return '<section class="hero"><h1>Transaksi</h1>' +
    '<p>' + state.transactions.length + ' transaksi di ' + escapeHtml(state.month) + ' — pemasukan ' + formatRupiah(t.income) + ', pengeluaran ' + formatRupiah(t.spent) + '.</p></section>' +
    '<section class="card"><h2>Tambah transaksi baru</h2>' +
    '<form class="add-form" data-action="add-tx">' +
    '<label>Tanggal <input type="date" name="date" value="2026-11-27" required></label>' +
    '<label>Keterangan <input type="text" name="desc" placeholder="cth: Belanja mingguan" maxlength="80" required></label>' +
    '<label>Kategori <select name="cat"><option value="income">Pemasukan</option>' + options + '</select></label>' +
    '<label>Jumlah (Rp) <input type="number" name="amount" min="1000" step="1000" placeholder="150000" required></label>' +
    '<button type="submit" class="btn primary">+ Tambah</button></form>' +
    '<p class="hint">Transaksi baru langsung mengubah ringkasan, anggaran, dan laporan — tersimpan di perangkat ini.</p></section>' +
    '<section class="card"><h2>Daftar transaksi</h2>' +
    '<div class="filters" role="group" aria-label="Saring kategori">' +
    cats.map((c) => '<button class="chip' + (filter === c.id ? ' active' : '') + '" data-action="filter" data-cat="' + c.id + '">' + escapeHtml(c.name) + '</button>').join('') +
    '</div><ul class="tx-list">' + (rows || '<li class="muted">Belum ada transaksi untuk saringan ini.</li>') + '</ul>' +
    '<p><button class="btn small" data-action="reset">⟲ Kembalikan data contoh</button></p></section>';
}

export function renderReports(state) {
  const t = totals(state);
  const byCat = state.budgets.map((b) => ({ label: b.name, value: t.spentByCat[b.id] || 0, color: b.color }));
  const biggest = [...byCat].sort((a, b) => b.value - a.value)[0];
  const saving = t.left;
  const savingRate = pct(saving, t.income);
  // Insight makan di luar: limit dibaca LANGSUNG dari state.budgets yang sedang aktif,
  // jadi kalau pengguna mengubah limit di halaman Anggaran, angka di sini ikut berubah.
  const dining = budgetOf(state, 'makan');
  const diningUsed = t.spentByCat.makan || 0;
  const diningLimit = dining ? dining.limit : 0;
  const diningPct = pct(diningUsed, diningLimit);
  const diningLeft = diningLimit - diningUsed;
  const dailyFood = Math.round(diningUsed / 27);
  const leftDays = daysLeft(state);
  const dailyBudget = leftDays > 0 ? Math.round((t.budgetTotal - t.spent) / leftDays) : t.budgetTotal - t.spent;
  const insights = [
    { title: '🍜 Makan di luar: ' + formatRupiah(diningUsed) + ' dari limit ' + formatRupiah(diningLimit) + ' (' + diningPct + '%)',
      body: diningLeft >= 0
        ? 'Masih sisa ' + formatRupiah(diningLeft) + ' sampai akhir bulan — rata-rata ' + formatRupiah(dailyFood) + ' per hari sejauh ini. Kalau pola ini berlanjut, keluarga ini menutup bulan di bawah limit makan di luar.'
        : 'Sudah lewat ' + formatRupiah(-diningLeft) + ' dari limit. Kurangi 2x makan di luar minggu depan, atau pindahkan sisa dari kategori Hiburan yang masih longgar.' },
    { title: '🏆 Pengeluaran terbesar: ' + biggest.label + ' — ' + formatRupiah(biggest.value),
      body: 'Kategori ini menyerap ' + pct(biggest.value, t.spent) + '% dari semua pengeluaran. Cek struk mingguannya: belanja harian yang direncanakan per minggu biasanya memangkas 10–15% dibanding belanja tanpa daftar.' },
    { title: '💰 Tabungan bulan ini: ' + formatRupiah(saving) + ' (' + savingRate + '% pemasukan)',
      body: savingRate >= 20
        ? 'Di atas patokan sehat 20%. Masukkan ' + formatRupiah(Math.round(saving * 0.6)) + ' ke Dana Darurat dan sisanya ke Liburan Akhir Tahun.'
        : 'Di bawah patokan sehat 20%. Targetkan menekan satu kategori paling longgar — biasanya Makan di Luar atau Hiburan — sebesar ' + formatRupiah(Math.round(t.income * 0.2) - saving) + ' untuk mencapai 20%.' },
    { title: '📅 ' + leftDays + ' hari tersisa di bulan ini',
      body: 'Sisa anggaran ' + formatRupiah(t.budgetTotal - t.spent) + ' untuk ' + leftDays + ' hari — sekitar ' + formatRupiah(dailyBudget) + ' per hari. Cukup untuk belanja harian terakhir tanpa menyentuh tabungan.' },
  ];
  return '<section class="hero"><h1>Laporan ' + escapeHtml(state.month) + '</h1>' +
    '<p>Ringkasan akhir bulan untuk ' + escapeHtml(state.household) + ': pemasukan ' + formatRupiah(t.income) + ', pengeluaran ' + formatRupiah(t.spent) + ', sisa ' + formatRupiah(t.left) + '.</p></section>' +
    '<section class="cards-3"><div class="card stat"><span class="stat-label">Pemasukan</span><strong class="in">' + formatRupiah(t.income) + '</strong><span class="muted">3 sumber</span></div>' +
    '<div class="card stat"><span class="stat-label">Pengeluaran</span><strong class="out">' + formatRupiah(t.spent) + '</strong><span class="muted">' + state.transactions.filter((x) => x.cat !== 'income').length + ' transaksi</span></div>' +
    '<div class="card stat"><span class="stat-label">Tingkat tabungan</span><strong>' + savingRate + '%</strong><span class="muted">' + formatRupiah(saving) + ' tersisa</span></div></section>' +
    '<section class="card"><h2>Pengeluaran per kategori</h2><canvas id="bars" aria-label="Grafik batang pengeluaran per kategori"></canvas></section>' +
    '<section><h2>Yang bisa dilakukan minggu ini</h2><div class="insights">' +
    insights.map((s) => '<article class="card insight"><h3>' + escapeHtml(s.title) + '</h3><p>' + escapeHtml(s.body) + '</p></article>').join('') +
    '</div></section>' +
    '<section class="card"><h2>Per kategori</h2><table class="report-table"><thead><tr><th>Kategori</th><th>Limit</th><th>Terpakai</th><th>Sisa</th><th>%</th></tr></thead><tbody>' +
    state.budgets.map((b) => {
      const used = t.spentByCat[b.id] || 0;
      return '<tr><td>' + b.icon + ' ' + escapeHtml(b.name) + '</td><td>' + formatRupiah(b.limit) + '</td><td>' + formatRupiah(used) + '</td><td>' + formatRupiah(b.limit - used) + '</td><td>' + pct(used, b.limit) + '%</td></tr>';
    }).join('') +
    '</tbody></table></section>';
}

export function renderGoals(state) {
  return '<section class="hero"><h1>Tujuan Menabung</h1>' +
    '<p>Empat tujuan keluarga — setiap rupiah sisa bulan ini punya tempatnya. Tambah tabungan ke tujuan mana pun; progresnya langsung berubah.</p></section>' +
    '<section class="goal-grid">' + state.goals.map((g) => '<article class="card goal-card">' +
      '<div class="goal-head"><span class="cat-icon big" aria-hidden="true">' + g.icon + '</span><div><h3>' + escapeHtml(g.name) + '</h3>' +
      '<p class="muted">' + formatRupiah(g.saved) + ' dari ' + formatRupiah(g.target) + '</p></div>' +
      '<span class="pct-badge">' + pct(g.saved, g.target) + '%</span></div>' +
      progressBar(g.saved, g.target, '#2e7d5b') +
      '<p class="budget-left">Kurang ' + formatRupiah(Math.max(0, g.target - g.saved)) + ' lagi.</p>' +
      '<form class="limit-form" data-action="add-saving" data-id="' + g.id + '">' +
      '<label>Tambah tabungan <input type="number" name="amount" min="1000" step="1000" placeholder="100000" aria-label="Tambah tabungan ' + escapeHtml(g.name) + '"> </label>' +
      '<button type="submit" class="btn small">+ Simpan</button></form></article>').join('') + '</section>' +
    '<section class="card"><h2>Cara keluarga ini menabung</h2><ol class="tips">' +
    '<li><strong>Bayar diri sendiri dulu:</strong> begitu gajian masuk, pindahkan 20% ke Dana Darurat sebelum belanja apa pun.</li>' +
    '<li><strong>Satu tujuan, satu amplop:</strong> uang liburan tidak dicampur dengan uang sekolah — kalau satu habis, yang lain tetap aman.</li>' +
    '<li><strong>Rayakan tonggak kecil:</strong> setiap tujuan melewati 25%, 50%, dan 75%, keluarga ini makan malam bersama dari anggaran Hiburan.</li>' +
    '</ol></section>';
}
