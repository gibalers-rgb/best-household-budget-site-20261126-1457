// HearthBudget app shell: routing, state and every control's behaviour.
// The site is one page with hash routes (#/, #/transactions, #/budget,
// #/goals, #/bills, #/reports) so each section has its own link, works
// from a bookmark, and renders from the same live household state.

import { seedState, HISTORY, CATEGORIES } from './data.js';
import { drawDonut, drawBars, money } from './charts.js';
import {
  dashboardView,
  transactionsView,
  budgetView,
  goalsView,
  billsView,
  reportsView,
  spentByCategory,
  totalSpent,
} from './views.js';

const STORE_KEY = 'hearthbudget-v1';
const ROUTES = {
  '/': { view: dashboardView, label: 'Dashboard' },
  '/transactions': { view: transactionsView, label: 'Transactions' },
  '/budget': { view: budgetView, label: 'Budget' },
  '/goals': { view: goalsView, label: 'Goals' },
  '/bills': { view: billsView, label: 'Bills' },
  '/reports': { view: reportsView, label: 'Reports' },
};

let state = loadState();
let txFilter = { category: 'all', query: '' };

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.transactions) && Array.isArray(parsed.bills)) return parsed;
    }
  } catch {
    // A corrupt store falls back to the seed data below.
  }
  return seedState();
}

function saveState() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // Private mode can refuse storage; the page still works for the visit.
  }
}

function currentRoute() {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  return ROUTES[hash] ? hash : '/';
}

function render() {
  const route = currentRoute();
  const app = document.getElementById('app');
  const view = ROUTES[route].view;
  app.innerHTML = route === '/transactions' ? view(state, txFilter) : view(state);
  document.querySelectorAll('#site-nav a').forEach((link) => {
    const active = link.getAttribute('href') === '#' + route;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.title = `${ROUTES[route].label} — HearthBudget`;
  wirePage(route);
  drawPageCharts(route);
  app.focus({ preventScroll: true });
}

function donutSlices(byCat) {
  return CATEGORIES.map((c) => ({ label: c.label, value: byCat.get(c.id) || 0, color: c.color }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);
}

function drawPageCharts(route) {
  if (route === '/') {
    const canvas = document.getElementById('donut');
    if (canvas) drawDonut(canvas, donutSlices(spentByCategory(state)));
  }
  if (route === '/reports') {
    const canvas = document.getElementById('bars');
    if (canvas) {
      const spent = totalSpent(state);
      const rows = HISTORY.map((h) => (h.month === 'Nov' ? { ...h, spent } : h));
      drawBars(canvas, rows);
    }
  }
}

function wirePage(route) {
  if (route === '/transactions') wireTransactions();
  if (route === '/budget') wireBudget();
  if (route === '/goals') wireGoals();
  if (route === '/bills') wireBills();
}

function wireTransactions() {
  const form = document.getElementById('add-tx');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const amount = Number(data.get('amount'));
    if (!Number.isFinite(amount) || amount <= 0) return;
    state.transactions.push({
      id: 't-' + Date.now().toString(36),
      date: String(data.get('date') || '2026-11-26'),
      payee: String(data.get('payee') || '').trim(),
      category: String(data.get('category') || 'other'),
      amount: Math.round(amount * 100) / 100,
      note: String(data.get('note') || '').trim(),
    });
    saveState();
    const message = `Added ${data.get('payee')} — ${money(amount)}. Total spending is now ${money(totalSpent(state))}.`;
    render();
    document.getElementById('tx-note').textContent = message;
  });
  document.getElementById('filter-cat').addEventListener('change', (event) => {
    txFilter.category = event.target.value;
    render();
  });
  document.getElementById('filter-q').addEventListener('input', (event) => {
    txFilter.query = event.target.value;
    render();
    const box = document.getElementById('filter-q');
    box.focus();
    box.setSelectionRange(box.value.length, box.value.length);
  });
  document.querySelectorAll('[data-delete-tx]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-delete-tx');
      const gone = state.transactions.find((t) => t.id === id);
      state.transactions = state.transactions.filter((t) => t.id !== id);
      saveState();
      render();
      const note = document.getElementById('tx-note');
      if (note && gone) note.textContent = `Removed ${gone.payee} (${money(gone.amount)}).`;
    });
  });
}

function wireBudget() {
  document.querySelectorAll('[data-budget-limit]').forEach((input) => {
    input.addEventListener('change', () => {
      const category = input.getAttribute('data-budget-limit');
      const limit = Math.max(0, Math.round(Number(input.value) || 0));
      const row = state.budgets.find((b) => b.category === category);
      if (row) row.limit = limit;
      saveState();
      render();
      const note = document.getElementById('budget-note');
      if (note) note.textContent = `Saved: the ${category} envelope is now ${money(limit)} a month.`;
    });
  });
}

function wireGoals() {
  document.querySelectorAll('.contribute').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const goal = state.goals.find((g) => g.id === form.getAttribute('data-goal'));
      const amount = Math.round(Number(new FormData(form).get('amount')) || 0);
      if (!goal || amount <= 0) return;
      goal.saved = Math.min(goal.target, goal.saved + amount);
      saveState();
      render();
      const note = document.getElementById('goal-note');
      if (note) note.textContent = `Added ${money(amount)} to ${goal.name} — now ${money(goal.saved)} of ${money(goal.target)}.`;
    });
  });
  document.getElementById('add-goal').addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const target = Math.round(Number(data.get('target')) || 0);
    if (!String(data.get('name') || '').trim() || target <= 0) return;
    state.goals.push({
      id: 'g-' + Date.now().toString(36),
      name: String(data.get('name')).trim(),
      target,
      saved: Math.max(0, Math.round(Number(data.get('saved')) || 0)),
      note: String(data.get('note') || '').trim() || 'A new jar to fill',
    });
    saveState();
    render();
    const note = document.getElementById('goal-note');
    if (note) note.textContent = `Goal created: ${data.get('name')} (${money(target)}).`;
  });
}

function wireBills() {
  document.querySelectorAll('[data-toggle-bill]').forEach((button) => {
    button.addEventListener('click', () => {
      const bill = state.bills.find((b) => b.id === button.getAttribute('data-toggle-bill'));
      if (!bill) return;
      bill.paid = !bill.paid;
      saveState();
      render();
    });
  });
  document.getElementById('add-bill').addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const amount = Math.round(Number(data.get('amount')) * 100) / 100;
    const dueDay = Math.min(31, Math.max(1, Math.round(Number(data.get('dueDay')) || 1)));
    if (!String(data.get('name') || '').trim() || !Number.isFinite(amount) || amount <= 0) return;
    state.bills.push({
      id: 'b-' + Date.now().toString(36),
      name: String(data.get('name')).trim(),
      amount,
      dueDay,
      autopay: data.get('autopay') === 'on',
      paid: false,
    });
    saveState();
    render();
    const note = document.getElementById('bill-note');
    if (note) note.textContent = `Bill added: ${data.get('name')} — ${money(amount)}, due day ${dueDay}.`;
  });
}

document.getElementById('reset-demo').addEventListener('click', () => {
  localStorage.removeItem(STORE_KEY);
  state = seedState();
  render();
});

window.addEventListener('hashchange', render);
window.addEventListener('resize', () => drawPageCharts(currentRoute()));
render();
