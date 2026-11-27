// HearthBudget app shell — routing, the saved book, and every control.
//
// The site is a single page with hash routes (#/, #/transactions,
// #/budget, #/goals, #/bills, #/reports): each section has its own link,
// works from a bookmark, and renders from the same live book. Edits are
// kept in localStorage, so a purchase added on one visit is still there
// on the next — and the Dashboard totals move with it.

import { CATEGORIES, freshBook, MONTH_HISTORY } from './data.js';
import { drawDonut, drawBars, money } from './charts.js';
import {
  dashboardView,
  transactionsView,
  budgetView,
  goalsView,
  billsView,
  reportsView,
  spentPerCategory,
  spentTotal,
} from './views.js';

const HEARTH_KEY = 'hearthbudget-v2';

const PAGES = {
  '/': { render: dashboardView, title: 'Dashboard' },
  '/transactions': { render: transactionsView, title: 'Transactions' },
  '/budget': { render: budgetView, title: 'Budget' },
  '/goals': { render: goalsView, title: 'Goals' },
  '/bills': { render: billsView, title: 'Bills' },
  '/reports': { render: reportsView, title: 'Reports' },
};

let book = readBook();
const purchaseFilter = { category: 'all', query: '', sort: 'date-desc' };

function readBook() {
  try {
    const raw = localStorage.getItem(HEARTH_KEY);
    if (!raw) return freshBook();
    const parsed = JSON.parse(raw);
    const ok = parsed && Array.isArray(parsed.purchases) && Array.isArray(parsed.bills)
      && Array.isArray(parsed.goals) && Array.isArray(parsed.envelopes) && Array.isArray(parsed.income);
    return ok ? parsed : freshBook();
  } catch {
    // A damaged store falls back to the seed book, never a blank page.
    return freshBook();
  }
}

function keepBook() {
  try {
    localStorage.setItem(HEARTH_KEY, JSON.stringify(book));
  } catch {
    // Storage can refuse in private mode; the page still works for the visit.
  }
}

function routeNow() {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  return PAGES[hash] ? hash : '/';
}

function paint() {
  const route = routeNow();
  const mount = document.getElementById('app');
  const page = PAGES[route];
  mount.innerHTML = route === '/transactions' ? page.render(book, purchaseFilter) : page.render(book);
  document.querySelectorAll('.topnav a').forEach((link) => {
    const here = link.getAttribute('href') === '#' + route;
    link.classList.toggle('active', here);
    if (here) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.title = `${page.title} — HearthBudget`;
  hookControls(route);
  paintCharts(route);
  mount.focus({ preventScroll: true });
}

function paintCharts(route) {
  if (route === '/') {
    const canvas = document.getElementById('donut');
    if (!canvas) return;
    const perCat = spentPerCategory(book);
    const slices = CATEGORIES
      .map((c) => ({ label: c.label, value: perCat.get(c.id) || 0, color: c.color }))
      .filter((slice) => slice.value > 0)
      .sort((a, b) => b.value - a.value);
    drawDonut(canvas, slices);
  }
  if (route === '/reports') {
    const canvas = document.getElementById('bars');
    if (!canvas) return;
    const spent = spentTotal(book);
    const rows = MONTH_HISTORY.map((h) => (h.month === 'Nov' ? { ...h, spent } : h));
    drawBars(canvas, rows);
  }
}

function hookControls(route) {
  if (route === '/transactions') hookPurchases();
  else if (route === '/budget') hookEnvelopes();
  else if (route === '/goals') hookGoals();
  else if (route === '/bills') hookBills();
}

function announce(id, text) {
  const note = document.getElementById(id);
  if (note) note.textContent = text;
}

function hookPurchases() {
  const form = document.getElementById('add-purchase');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const amount = Number(data.get('amount'));
    const payee = String(data.get('payee') || '').trim();
    if (!payee || !Number.isFinite(amount) || amount <= 0) return;
    book.purchases.push({
      id: 'p-' + Date.now().toString(36),
      date: String(data.get('date') || '2026-11-26'),
      payee,
      category: String(data.get('category') || 'other'),
      amount: Math.round(amount * 100) / 100,
      note: String(data.get('note') || '').trim(),
    });
    keepBook();
    paint();
    announce('tx-note', `Added ${payee} — ${money(amount)}. Total spending is now ${money(spentTotal(book))}.`);
  });

  document.getElementById('filter-cat').addEventListener('change', (event) => {
    purchaseFilter.category = event.target.value;
    paint();
  });
  document.getElementById('filter-sort').addEventListener('change', (event) => {
    purchaseFilter.sort = event.target.value;
    paint();
  });
  const search = document.getElementById('filter-q');
  search.addEventListener('input', (event) => {
    purchaseFilter.query = event.target.value;
    paint();
    const box = document.getElementById('filter-q');
    box.focus();
    box.setSelectionRange(box.value.length, box.value.length);
  });
  document.querySelectorAll('[data-delete-purchase]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-delete-purchase');
      const gone = book.purchases.find((row) => row.id === id);
      book.purchases = book.purchases.filter((row) => row.id !== id);
      keepBook();
      paint();
      if (gone) announce('tx-note', `Removed ${gone.payee} (${money(gone.amount)}).`);
    });
  });
}

function hookEnvelopes() {
  document.querySelectorAll('[data-envelope-limit]').forEach((input) => {
    input.addEventListener('change', () => {
      const category = input.getAttribute('data-envelope-limit');
      const limit = Math.max(0, Math.round(Number(input.value) || 0));
      const row = book.envelopes.find((entry) => entry.category === category);
      if (row) row.limit = limit;
      keepBook();
      paint();
      announce('budget-note', `Saved: the ${category} envelope is now ${money(limit)} a month.`);
    });
  });
}

function hookGoals() {
  document.querySelectorAll('.contribute').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const goal = book.goals.find((g) => g.id === form.getAttribute('data-goal'));
      const amount = Math.round(Number(new FormData(form).get('amount')) || 0);
      if (!goal || amount <= 0) return;
      goal.saved = Math.min(goal.target, goal.saved + amount);
      keepBook();
      paint();
      announce('goal-note', `Added ${money(amount)} to ${goal.name} — now ${money(goal.saved)} of ${money(goal.target)}.`);
    });
  });
  document.getElementById('add-goal').addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const name = String(data.get('name') || '').trim();
    const target = Math.round(Number(data.get('target')) || 0);
    if (!name || target <= 0) return;
    book.goals.push({
      id: 'g-' + Date.now().toString(36),
      name,
      target,
      saved: Math.max(0, Math.round(Number(data.get('saved')) || 0)),
      note: String(data.get('note') || '').trim() || 'A new jar to fill',
    });
    keepBook();
    paint();
    announce('goal-note', `Goal created: ${name} (${money(target)}).`);
  });
}

function hookBills() {
  document.querySelectorAll('[data-toggle-bill]').forEach((button) => {
    button.addEventListener('click', () => {
      const row = book.bills.find((b) => b.id === button.getAttribute('data-toggle-bill'));
      if (!row) return;
      row.paid = !row.paid;
      keepBook();
      paint();
    });
  });
  document.getElementById('add-bill').addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const name = String(data.get('name') || '').trim();
    const amount = Math.round(Number(data.get('amount')) * 100) / 100;
    const dueDay = Math.min(31, Math.max(1, Math.round(Number(data.get('dueDay')) || 1)));
    if (!name || !Number.isFinite(amount) || amount <= 0) return;
    book.bills.push({
      id: 'b-' + Date.now().toString(36),
      name,
      amount,
      dueDay,
      autopay: data.get('autopay') === 'on',
      paid: false,
    });
    keepBook();
    paint();
    announce('bill-note', `Bill added: ${name} — ${money(amount)}, due day ${dueDay}.`);
  });
}

document.getElementById('reset-demo').addEventListener('click', () => {
  localStorage.removeItem(HEARTH_KEY);
  book = freshBook();
  paint();
});

window.addEventListener('hashchange', paint);
window.addEventListener('resize', () => paintCharts(routeNow()));
paint();
