/* DompetKeluarga — router hash, state (localStorage + fallback memori),
   dan semua aksi: tambah/hapus transaksi, ubah limit, tambah tabungan. */
import { cloneSeed } from './data.js';
import { totals } from './views.js';
import { renderHome, renderBudgets, renderTransactions, renderReports, renderGoals } from './views.js';
import { drawBarChart, drawDonut } from './charts.js';

const KEY = 'dompetkeluarga-v1';
const view = document.getElementById('view');
const badge = document.getElementById('month-badge');
let memoryState = null;

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* penyimpanan tidak tersedia: pakai memori */ }
  return memoryState || cloneSeed();
}

function saveState(s) {
  memoryState = s;
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* abaikan */ }
}

let state = loadState();
let filter = 'all';

function route() {
  const hash = location.hash.replace(/^#\/?/, '') || '';
  const name = hash.split('/')[0] || 'home';
  document.querySelectorAll('[data-nav]').forEach((a) => {
    a.classList.toggle('active', a.dataset.nav === name);
  });
  badge.textContent = state.month;
  if (name === 'anggaran') view.innerHTML = renderBudgets(state);
  else if (name === 'transaksi') view.innerHTML = renderTransactions(state, filter);
  else if (name === 'laporan') {
    view.innerHTML = renderReports(state);
    const t = totals(state);
    const bars = document.getElementById('bars');
    if (bars) drawBarChart(bars, state.budgets.map((b) => ({ label: b.name, value: t.spentByCat[b.id] || 0, color: b.color })));
  } else if (name === 'tujuan') view.innerHTML = renderGoals(state);
  else {
    view.innerHTML = renderHome(state);
    const t = totals(state);
    const donut = document.getElementById('donut');
    if (donut) drawDonut(donut, state.budgets.map((b) => ({ label: b.name, value: t.spentByCat[b.id] || 0, color: b.color })));
  }
  window.scrollTo(0, 0);
}

function rerender() { saveState(state); route(); }

view.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const action = form.dataset.action;
  const data = new FormData(form);
  if (action === 'set-limit') {
    const limit = Math.max(0, Number(data.get('limit')) || 0);
    const b = state.budgets.find((x) => x.id === form.dataset.cat);
    if (b) { b.limit = limit; rerender(); }
  } else if (action === 'add-tx') {
    const amount = Math.max(0, Number(data.get('amount')) || 0);
    const desc = String(data.get('desc') || '').trim();
    const date = String(data.get('date') || '2026-11-27');
    const cat = String(data.get('cat') || 'lainnya');
    if (!amount || !desc) return;
    state.transactions.push({ id: 'u' + Date.now(), date, desc, cat, amount });
    if (cat === 'income') state.income.push({ id: 'g' + Date.now(), label: desc, amount });
    rerender();
  } else if (action === 'add-saving') {
    const amount = Math.max(0, Number(data.get('amount')) || 0);
    const g = state.goals.find((x) => x.id === form.dataset.id);
    if (g && amount) { g.saved += amount; rerender(); }
  }
});

view.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  if (btn.dataset.action === 'delete-tx') {
    const tx = state.transactions.find((t) => t.id === btn.dataset.id);
    state.transactions = state.transactions.filter((t) => t.id !== btn.dataset.id);
    // Pemasukan dicatat di dua tempat (daftar transaksi + ringkasan
    // pemasukan), jadi menghapusnya harus menghapus keduanya agar angka
    // Beranda dan Laporan tetap cocok.
    if (tx && tx.cat === 'income') {
      const idx = state.income.findIndex((i) => i.label === tx.desc && i.amount === tx.amount);
      if (idx !== -1) state.income.splice(idx, 1);
    }
    rerender();
  } else if (btn.dataset.action === 'filter') {
    filter = btn.dataset.cat;
    route();
  } else if (btn.dataset.action === 'reset') {
    state = cloneSeed();
    filter = 'all';
    rerender();
  }
});

window.addEventListener('hashchange', route);
route();
