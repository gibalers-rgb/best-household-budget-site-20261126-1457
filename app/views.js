// HearthBudget views: one renderer per page. Each returns an HTML string
// for the #app region; main.js inserts it and wires the controls. Every
// figure comes from the live household state, never from hard-coded text.

import { CATEGORIES, MONTH, HISTORY } from './data.js';
import { money } from './charts.js';

export function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function categoryOf(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

export function totalIncome(state) {
  return state.income.reduce((sum, row) => sum + row.amount, 0);
}

export function totalSpent(state) {
  return state.transactions.reduce((sum, row) => sum + row.amount, 0);
}

export function spentByCategory(state) {
  const map = new Map(CATEGORIES.map((c) => [c.id, 0]));
  for (const row of state.transactions) {
    map.set(row.category, (map.get(row.category) || 0) + row.amount);
  }
  return map;
}

function progressBar(pct, label) {
  const clamped = Math.max(0, Math.min(100, pct));
  const tone = pct > 100 ? 'over' : pct > 85 ? 'warm' : '';
  return `<div class="bar" role="progressbar" aria-valuenow="${Math.round(clamped)}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(label)}"><span class="bar-fill ${tone}" style="width:${clamped}%"></span></div>`;
}

function statCard(label, value, sub) {
  return `<article class="stat"><p class="stat-label">${label}</p><p class="stat-value">${value}</p><p class="stat-sub">${sub}</p></article>`;
}

// ---- Dashboard -----------------------------------------------------------

export function dashboardView(state) {
  const income = totalIncome(state);
  const spent = totalSpent(state);
  const left = income - spent;
  const rate = income > 0 ? Math.round(((income - spent) / income) * 100) : 0;
  const byCat = spentByCategory(state);
  const slices = CATEGORIES.map((c) => ({ label: c.label, value: byCat.get(c.id) || 0, color: c.color }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);
  const unpaid = state.bills.filter((b) => !b.paid).sort((a, b) => a.dueDay - b.dueDay);
  const unpaidTotal = unpaid.reduce((sum, b) => sum + b.amount, 0);
  const recent = [...state.transactions].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);
  const budgetRows = state.budgets
    .map((b) => ({ ...b, spent: byCat.get(b.category) || 0 }))
    .sort((a, b) => b.spent / b.limit - a.spent / a.limit)
    .slice(0, 4);

  return `
  <header class="page-head">
    <div><h1>Good evening, Maple House</h1><p class="lede">Here is where ${MONTH} stands — income, spending and what is left.</p></div>
    <p class="month-pill">${MONTH}</p>
  </header>
  <section class="stats" aria-label="Month summary">
    ${statCard('Money in', money(income), '3 paydays this month')}
    ${statCard('Money out', money(spent), `${state.transactions.length} purchases logged`)}
    ${statCard('Left to spend', money(left), `${rate}% of income saved so far`)}
    ${statCard('Bills still due', money(unpaidTotal), `${unpaid.length} of ${state.bills.length} bills unpaid`)}
  </section>
  <div class="grid-2">
    <section class="card" aria-labelledby="spend-title">
      <h2 id="spend-title">Where the money went</h2>
      <div class="donut-wrap">
        <canvas id="donut" width="280" height="210" role="img" aria-label="Donut chart of spending by category"></canvas>
        <ul class="legend">${slices.map((s) => `<li><span class="dot" style="background:${s.color}"></span>${esc(s.label)} <strong>${money(s.value)}</strong></li>`).join('')}</ul>
      </div>
    </section>
    <section class="card" aria-labelledby="budget-title">
      <h2 id="budget-title">Budgets closest to the edge</h2>
      <ul class="budget-list">${budgetRows.map((row) => {
        const cat = categoryOf(row.category);
        const pct = (row.spent / row.limit) * 100;
        return `<li><div class="row-line"><span><span class="dot" style="background:${cat.color}"></span>${esc(cat.label)}</span><span>${money(row.spent)} of ${money(row.limit)}</span></div>${progressBar(pct, cat.label + ' budget')}</li>`;
      }).join('')}</ul>
      <p><a class="btn-link" href="#/budget">See every budget →</a></p>
    </section>
  </div>
  <div class="grid-2">
    <section class="card" aria-labelledby="recent-title">
      <h2 id="recent-title">Latest spending</h2>
      <ul class="tx-list">${recent.map((t) => {
        const cat = categoryOf(t.category);
        return `<li><span class="tx-main"><span class="dot" style="background:${cat.color}"></span><span><strong>${esc(t.payee)}</strong><small>${esc(t.date)} · ${esc(cat.label)}</small></span></span><strong>${money(t.amount)}</strong></li>`;
      }).join('')}</ul>
      <p><a class="btn-link" href="#/transactions">All transactions →</a></p>
    </section>
    <section class="card" aria-labelledby="bills-title">
      <h2 id="bills-title">Bills coming up</h2>
      ${unpaid.length === 0
        ? '<p class="ok">Every bill this month is paid. Nicely done.</p>'
        : `<ul class="tx-list">${unpaid.map((b) => `<li><span class="tx-main"><span><strong>${esc(b.name)}</strong><small>Due Nov ${b.dueDay}${b.autopay ? ' · autopay' : ''}</small></span></span><strong>${money(b.amount)}</strong></li>`).join('')}</ul>`}
      <p><a class="btn-link" href="#/bills">Manage bills →</a></p>
    </section>
  </div>`;
}

// ---- Transactions --------------------------------------------------------

export function transactionsView(state, filter) {
  const query = (filter.query || '').toLowerCase();
  const rows = [...state.transactions]
    .filter((t) => (filter.category === 'all' || t.category === filter.category))
    .filter((t) => !query || t.payee.toLowerCase().includes(query) || (t.note || '').toLowerCase().includes(query))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const shown = rows.reduce((sum, t) => sum + t.amount, 0);
  return `
  <header class="page-head"><div><h1>Transactions</h1><p class="lede">Every dollar out the door, searchable and filterable.</p></div></header>
  <section class="card" aria-labelledby="add-tx-title">
    <h2 id="add-tx-title">Add a purchase</h2>
    <form id="add-tx" class="form-grid">
      <label>Date <input type="date" name="date" value="2026-11-26" required></label>
      <label>Paid to <input type="text" name="payee" placeholder="e.g. GreenMart Supermarket" required maxlength="80"></label>
      <label>Category <select name="category">${CATEGORIES.map((c) => `<option value="${c.id}">${esc(c.label)}</option>`).join('')}</select></label>
      <label>Amount ($) <input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required></label>
      <label class="wide">Note <input type="text" name="note" placeholder="What was it for?" maxlength="120"></label>
      <button class="btn" type="submit">Add transaction</button>
    </form>
    <p class="form-note" role="status" id="tx-note"></p>
  </section>
  <section class="card" aria-labelledby="tx-list-title">
    <h2 id="tx-list-title">November spending — ${rows.length} of ${state.transactions.length} shown · ${money(shown)}</h2>
    <div class="filters">
      <label>Category <select id="filter-cat">${['all', ...CATEGORIES.map((c) => c.id)].map((id) => `<option value="${id}" ${filter.category === id ? 'selected' : ''}>${id === 'all' ? 'All categories' : esc(categoryOf(id).label)}</option>`).join('')}</select></label>
      <label>Search <input type="search" id="filter-q" value="${esc(filter.query || '')}" placeholder="Payee or note"></label>
    </div>
    ${rows.length === 0
      ? '<p class="empty">Nothing matches that filter. Try clearing the search.</p>'
      : `<div class="table-wrap"><table>
        <thead><tr><th scope="col">Date</th><th scope="col">Paid to</th><th scope="col">Category</th><th scope="col">Note</th><th scope="col" class="num">Amount</th><th scope="col"><span class="visually-hidden">Remove</span></th></tr></thead>
        <tbody>${rows.map((t) => {
          const cat = categoryOf(t.category);
          return `<tr><td>${esc(t.date)}</td><td><strong>${esc(t.payee)}</strong></td><td><span class="dot" style="background:${cat.color}"></span>${esc(cat.label)}</td><td>${esc(t.note || '—')}</td><td class="num">${money(t.amount)}</td><td><button class="btn-small" data-delete-tx="${esc(t.id)}" aria-label="Delete ${esc(t.payee)} ${money(t.amount)}">Delete</button></td></tr>`;
        }).join('')}</tbody></table></div>`}
  </section>`;
}

// ---- Budget ---------------------------------------------------------------

export function budgetView(state) {
  const byCat = spentByCategory(state);
  const totalLimit = state.budgets.reduce((sum, b) => sum + b.limit, 0);
  const spentTotal = totalSpent(state);
  return `
  <header class="page-head"><div><h1>Monthly budget</h1><p class="lede">Set a limit for each envelope, then watch it fill. Limits save when you change them.</p></div></header>
  <section class="stats" aria-label="Budget totals">
    ${statCard('Planned spending', money(totalLimit), 'All envelopes together')}
    ${statCard('Spent so far', money(spentTotal), `${Math.round((spentTotal / totalLimit) * 100)}% of the plan used`)}
    ${statCard('Still in the envelopes', money(Math.max(0, totalLimit - spentTotal)), 'Across all categories')}
  </section>
  <section class="card" aria-labelledby="env-title">
    <h2 id="env-title">Envelopes for ${MONTH}</h2>
    <ul class="envelopes">${state.budgets.map((b) => {
      const cat = categoryOf(b.category);
      const spent = byCat.get(b.category) || 0;
      const pct = (spent / b.limit) * 100;
      const left = b.limit - spent;
      return `<li class="envelope">
        <div class="env-head"><span><span class="dot" style="background:${cat.color}"></span><strong>${esc(cat.label)}</strong></span>
        <label>Monthly limit $ <input type="number" min="0" step="1" value="${b.limit}" data-budget-limit="${esc(b.category)}" aria-label="Monthly limit for ${esc(cat.label)}"></label></div>
        ${progressBar(pct, cat.label + ' budget')}
        <p class="env-figures"><span>${money(spent)} spent</span><span class="${left < 0 ? 'over-text' : ''}">${left < 0 ? money(-left) + ' over' : money(left) + ' left'}</span><span>${Math.round(pct)}%</span></p>
      </li>`;
    }).join('')}</ul>
    <p class="form-note" role="status" id="budget-note">Tip: Groceries is the envelope most households overspend first — check it before the weekend shop.</p>
  </section>`;
}

// ---- Goals ----------------------------------------------------------------

export function goalsView(state) {
  const totalSaved = state.goals.reduce((sum, g) => sum + g.saved, 0);
  const totalTarget = state.goals.reduce((sum, g) => sum + g.target, 0);
  return `
  <header class="page-head"><div><h1>Savings goals</h1><p class="lede">Money with a job: each goal is a jar you fill a little at a time.</p></div></header>
  <section class="stats" aria-label="Goals totals">
    ${statCard('Saved toward goals', money(totalSaved), `${state.goals.length} goals in progress`)}
    ${statCard('Total target', money(totalTarget), `${Math.round((totalSaved / totalTarget) * 100)}% of the way there`)}
    ${statCard('Still to save', money(totalTarget - totalSaved), 'Across every goal')}
  </section>
  <section class="goals-grid" aria-label="Goals">
    ${state.goals.map((g) => {
      const pct = (g.saved / g.target) * 100;
      return `<article class="card goal">
        <h2>${esc(g.name)}</h2>
        <p class="lede">${esc(g.note)}</p>
        <p class="goal-figures"><strong>${money(g.saved)}</strong> of ${money(g.target)}</p>
        ${progressBar(pct, g.name + ' progress')}
        <p class="goal-pct">${Math.round(pct)}% funded · ${money(g.target - g.saved)} to go</p>
        <form class="contribute" data-goal="${esc(g.id)}">
          <label>Add to this goal $ <input type="number" name="amount" min="1" step="1" placeholder="50" required></label>
          <button class="btn" type="submit">Add money</button>
        </form>
      </article>`;
    }).join('')}
  </section>
  <section class="card" aria-labelledby="new-goal-title">
    <h2 id="new-goal-title">Start a new goal</h2>
    <form id="add-goal" class="form-grid">
      <label>Goal name <input type="text" name="name" placeholder="e.g. New washing machine" required maxlength="60"></label>
      <label>Target ($) <input type="number" name="target" min="1" step="1" placeholder="500" required></label>
      <label>Already saved ($) <input type="number" name="saved" min="0" step="1" value="0"></label>
      <label>Why it matters <input type="text" name="note" placeholder="A short note" maxlength="120"></label>
      <button class="btn" type="submit">Create goal</button>
    </form>
    <p class="form-note" role="status" id="goal-note"></p>
  </section>`;
}

// ---- Bills -----------------------------------------------------------------

export function billsView(state) {
  const unpaid = state.bills.filter((b) => !b.paid);
  const dueTotal = unpaid.reduce((sum, b) => sum + b.amount, 0);
  const paidTotal = state.bills.filter((b) => b.paid).reduce((sum, b) => sum + b.amount, 0);
  return `
  <header class="page-head"><div><h1>Bills</h1><p class="lede">Recurring bills for ${MONTH}. Mark one paid and it stays paid.</p></div></header>
  <section class="stats" aria-label="Bills totals">
    ${statCard('Still to pay', money(dueTotal), `${unpaid.length} bills left this month`)}
    ${statCard('Already paid', money(paidTotal), `${state.bills.length - unpaid.length} of ${state.bills.length} bills`)}
    ${statCard('Monthly total', money(dueTotal + paidTotal), 'All recurring bills')}
  </section>
  <section class="card" aria-labelledby="bill-list-title">
    <h2 id="bill-list-title">November bills</h2>
    <ul class="bill-list">${[...state.bills].sort((a, b) => a.dueDay - b.dueDay).map((b) => `
      <li class="${b.paid ? 'paid' : ''}">
        <span class="tx-main"><span><strong>${esc(b.name)}</strong><small>Due Nov ${b.dueDay}${b.autopay ? ' · autopay' : ' · pay manually'}</small></span></span>
        <span class="bill-right"><strong>${money(b.amount)}</strong>
        <button class="btn-small" data-toggle-bill="${esc(b.id)}">${b.paid ? '✓ Paid — undo' : 'Mark paid'}</button></span>
      </li>`).join('')}</ul>
  </section>
  <section class="card" aria-labelledby="new-bill-title">
    <h2 id="new-bill-title">Add a recurring bill</h2>
    <form id="add-bill" class="form-grid">
      <label>Bill name <input type="text" name="name" placeholder="e.g. Mobile — two lines" required maxlength="60"></label>
      <label>Amount ($) <input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required></label>
      <label>Due day of month <input type="number" name="dueDay" min="1" max="31" value="1" required></label>
      <label class="check"><input type="checkbox" name="autopay"> Autopay on</label>
      <button class="btn" type="submit">Add bill</button>
    </form>
    <p class="form-note" role="status" id="bill-note"></p>
  </section>`;
}

// ---- Reports ---------------------------------------------------------------

export function reportsView(state) {
  const income = totalIncome(state);
  const spent = totalSpent(state);
  const byCat = spentByCategory(state);
  const top = [...CATEGORIES]
    .map((c) => ({ label: c.label, value: byCat.get(c.id) || 0, color: c.color }))
    .sort((a, b) => b.value - a.value);
  const biggest = [...state.transactions].sort((a, b) => b.amount - a.amount)[0];
  const history = HISTORY.map((h) => (h.month === 'Nov' ? { ...h, spent } : h));
  const savingsRate = income > 0 ? Math.round(((income - spent) / income) * 100) : 0;
  const avgSpent = Math.round(history.slice(0, 5).reduce((sum, h) => sum + h.spent, 0) / 5);
  const dining = byCat.get('dining') || 0;
  // The dining envelope's live limit, not a fixed number: the household can
  // change it on the Budget page, and this line must follow the change.
  const diningLimit = state.budgets.find((b) => b.category === 'dining')?.limit || 0;
  const groceries = byCat.get('groceries') || 0;
  // November is 25 days in at the last transaction: weekly pace from the
  // actual grocery spend so far, not a guessed number.
  const groceryWeekly = Math.round(groceries / (25 / 7));
  const groceryLimit = state.budgets.find((b) => b.category === 'groceries')?.limit || 0;
  return `
  <header class="page-head"><div><h1>Reports</h1><p class="lede">Six months of income against spending, and what the numbers are saying.</p></div></header>
  <section class="card" aria-labelledby="trend-title">
    <h2 id="trend-title">Income vs spending — last 6 months</h2>
    <canvas id="bars" width="760" height="300" role="img" aria-label="Bar chart of monthly income and spending, June to November"></canvas>
    <p class="legend-inline"><span class="dot" style="background:#2f6f5e"></span> Income <span class="dot" style="background:#c25e7e"></span> Spending</p>
  </section>
  <div class="grid-2">
    <section class="card" aria-labelledby="cat-title">
      <h2 id="cat-title">November by category</h2>
      <ul class="tx-list">${top.filter((t) => t.value > 0).map((t) => `<li><span class="tx-main"><span class="dot" style="background:${t.color}"></span>${esc(t.label)}</span><strong>${money(t.value)}</strong></li>`).join('')}</ul>
    </section>
    <section class="card" aria-labelledby="insight-title">
      <h2 id="insight-title">What the numbers say</h2>
      <ul class="insights">
        <li><strong>${esc(top[0].label)}</strong> is the biggest envelope at ${money(top[0].value)} — ${Math.round((top[0].value / spent) * 100)}% of all spending.</li>
        <li>You are saving <strong>${savingsRate}%</strong> of November income (${money(income - spent)} kept). The five-month average spend is ${money(avgSpent)} a month.</li>
        <li>Biggest single purchase: <strong>${esc(biggest.payee)}</strong>, ${money(biggest.amount)} on ${esc(biggest.date)}.</li>
        <li>Dining out is ${money(dining)} so far — ${dining <= diningLimit ? `under its ${money(diningLimit)} envelope, with room for one more family dinner` : `${money(dining - diningLimit)} over its ${money(diningLimit)} envelope`}.</li>
        <li>Groceries run about ${money(groceryWeekly)} a week at the current pace; the ${money(groceryLimit)} envelope holds for ${Math.max(0, Math.floor((groceryLimit - groceries) / groceryWeekly))} more weekly shops.</li>
      </ul>
    </section>
  </div>`;
}
