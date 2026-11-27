// HearthBudget views — one HTML builder per page.
//
// Each builder returns the markup for the #app region from the live book
// (main.js inserts it and wires the controls). No figure is typed in by
// hand: every dollar on screen is summed from the book, so adding a
// purchase on the Transactions page moves the Dashboard totals too.

import { CATEGORIES, categoryById, MONTH_LABEL, MONTH_SHORT, MONTH_HISTORY, DAYS_ELAPSED } from './data.js';
import { money } from './charts.js';

export function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function incomeTotal(book) {
  return book.income.reduce((sum, row) => sum + row.amount, 0);
}

export function spentTotal(book) {
  return book.purchases.reduce((sum, row) => sum + row.amount, 0);
}

export function spentPerCategory(book) {
  const totals = new Map(CATEGORIES.map((c) => [c.id, 0]));
  for (const row of book.purchases) {
    totals.set(row.category, (totals.get(row.category) || 0) + row.amount);
  }
  return totals;
}

function envelopeLimit(book, category) {
  return book.envelopes.find((row) => row.category === category)?.limit || 0;
}

function meter(pct, label) {
  const clamped = Math.max(0, Math.min(100, pct));
  const tone = pct > 100 ? ' over' : pct > 85 ? ' warm' : '';
  return `<div class="meter" role="progressbar" aria-valuenow="${Math.round(clamped)}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(label)}"><span class="meter-fill${tone}" style="width:${clamped}%"></span></div>`;
}

function summaryCard(label, value, sub) {
  return `<article class="summary"><p class="summary-label">${label}</p><p class="summary-value">${value}</p><p class="summary-sub">${sub}</p></article>`;
}

function pageHead(title, lede, pill) {
  return `<header class="page-head"><div><h1>${title}</h1><p class="lede">${lede}</p></div>${pill ? `<p class="month-tag">${pill}</p>` : ''}</header>`;
}

function newestFirst(rows) {
  return [...rows].sort((a, b) => (a.date < b.date ? 1 : -1));
}

// ---- Dashboard ------------------------------------------------------------

export function dashboardView(book) {
  const income = incomeTotal(book);
  const spent = spentTotal(book);
  const left = income - spent;
  const savedPct = income > 0 ? Math.round(((income - spent) / income) * 100) : 0;
  const perCat = spentPerCategory(book);
  const slices = CATEGORIES
    .map((c) => ({ label: c.label, value: perCat.get(c.id) || 0, color: c.color }))
    .filter((slice) => slice.value > 0)
    .sort((a, b) => b.value - a.value);
  const unpaid = book.bills.filter((b) => !b.paid).sort((a, b) => a.dueDay - b.dueDay);
  const unpaidSum = unpaid.reduce((sum, b) => sum + b.amount, 0);
  const latest = newestFirst(book.purchases).slice(0, 6);
  const tightest = book.envelopes
    .map((row) => ({ ...row, spent: perCat.get(row.category) || 0 }))
    .sort((a, b) => b.spent / b.limit - a.spent / a.limit)
    .slice(0, 4);

  return `
  ${pageHead('Good evening, Maple House', `Here is where ${MONTH_LABEL} stands — money in, money out, and what is left.`, MONTH_LABEL)}
  <section class="summaries" aria-label="Month summary">
    ${summaryCard('Money in', money(income), `${book.income.length} paydays this month`)}
    ${summaryCard('Money out', money(spent), `${book.purchases.length} purchases logged`)}
    ${summaryCard('Left to spend', money(left), `${savedPct}% of income kept so far`)}
    ${summaryCard('Bills still due', money(unpaidSum), `${unpaid.length} of ${book.bills.length} bills unpaid`)}
  </section>
  <div class="columns-2">
    <section class="panel" aria-labelledby="where-title">
      <h2 id="where-title">Where the money went</h2>
      <div class="donut-row">
        <canvas id="donut" width="280" height="210" role="img" aria-label="Donut chart of spending by category"></canvas>
        <ul class="key">${slices.map((s) => `<li><span class="swatch" style="background:${s.color}"></span>${esc(s.label)} <strong>${money(s.value)}</strong></li>`).join('')}</ul>
      </div>
    </section>
    <section class="panel" aria-labelledby="tight-title">
      <h2 id="tight-title">Envelopes closest to the edge</h2>
      <ul class="plain-list stacked-list">${tightest.map((row) => {
        const cat = categoryById(row.category);
        const pct = (row.spent / row.limit) * 100;
        return `<li><div class="line-row"><span><span class="swatch" style="background:${cat.color}"></span>${esc(cat.label)}</span><span>${money(row.spent)} of ${money(row.limit)}</span></div>${meter(pct, cat.label + ' envelope')}</li>`;
      }).join('')}</ul>
      <p><a class="text-link" href="#/budget">See every envelope →</a></p>
    </section>
  </div>
  <div class="columns-2">
    <section class="panel" aria-labelledby="latest-title">
      <h2 id="latest-title">Latest spending</h2>
      <ul class="plain-list">${latest.map((t) => {
        const cat = categoryById(t.category);
        return `<li><span class="row-main"><span class="swatch" style="background:${cat.color}"></span><span><strong>${esc(t.payee)}</strong><small>${esc(t.date)} · ${esc(cat.label)}</small></span></span><strong>${money(t.amount)}</strong></li>`;
      }).join('')}</ul>
      <p><a class="text-link" href="#/transactions">All transactions →</a></p>
    </section>
    <section class="panel" aria-labelledby="due-title">
      <h2 id="due-title">Bills coming up</h2>
      ${unpaid.length === 0
        ? '<p class="good-news">Every bill this month is paid. Nicely done.</p>'
        : `<ul class="plain-list">${unpaid.map((b) => `<li><span class="row-main"><span><strong>${esc(b.name)}</strong><small>Due Nov ${b.dueDay}${b.autopay ? ' · autopay' : ''}</small></span></span><strong>${money(b.amount)}</strong></li>`).join('')}</ul>`}
      <p><a class="text-link" href="#/bills">Manage bills →</a></p>
    </section>
  </div>
  <section class="panel" aria-labelledby="income-title">
    <h2 id="income-title">Money in this month</h2>
    <ul class="plain-list">${book.income.map((row) => `<li><span class="row-main"><span><strong>${esc(row.source)}</strong><small>${esc(row.date)}</small></span></span><strong>${money(row.amount)}</strong></li>`).join('')}</ul>
    <p class="lede">Two salaries and the weekend market stall add up to ${money(income)} — the number every envelope is planned against.</p>
  </section>`;
}

// ---- Transactions ----------------------------------------------------------

export function transactionsView(book, filter) {
  const query = (filter.query || '').toLowerCase();
  let rows = book.purchases
    .filter((t) => filter.category === 'all' || t.category === filter.category)
    .filter((t) => !query || t.payee.toLowerCase().includes(query) || (t.note || '').toLowerCase().includes(query));
  if (filter.sort === 'amount-desc') rows = [...rows].sort((a, b) => b.amount - a.amount);
  else if (filter.sort === 'amount-asc') rows = [...rows].sort((a, b) => a.amount - b.amount);
  else rows = newestFirst(rows);
  const shownSum = rows.reduce((sum, t) => sum + t.amount, 0);

  return `
  ${pageHead('Transactions', 'Every dollar out the door — searchable, filterable, sortable.')}
  <section class="panel" aria-labelledby="add-title">
    <h2 id="add-title">Add a purchase</h2>
    <form id="add-purchase" class="form-grid">
      <label>Date <input type="date" name="date" value="2026-11-26" required></label>
      <label>Paid to <input type="text" name="payee" placeholder="e.g. GreenMart Supermarket" required maxlength="80"></label>
      <label>Category <select name="category">${CATEGORIES.map((c) => `<option value="${c.id}">${esc(c.label)}</option>`).join('')}</select></label>
      <label>Amount ($) <input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required></label>
      <label class="span-all">Note <input type="text" name="note" placeholder="What was it for?" maxlength="120"></label>
      <button class="btn" type="submit">Add transaction</button>
    </form>
    <p class="form-note" role="status" id="tx-note"></p>
  </section>
  <section class="panel" aria-labelledby="list-title">
    <h2 id="list-title">November spending — ${rows.length} of ${book.purchases.length} shown · ${money(shownSum)}</h2>
    <div class="filters">
      <label>Category <select id="filter-cat">${['all', ...CATEGORIES.map((c) => c.id)].map((id) => `<option value="${id}"${filter.category === id ? ' selected' : ''}>${id === 'all' ? 'All categories' : esc(categoryById(id).label)}</option>`).join('')}</select></label>
      <label>Search <input type="search" id="filter-q" value="${esc(filter.query || '')}" placeholder="Payee or note"></label>
      <label>Sort <select id="filter-sort">
        <option value="date-desc"${filter.sort === 'date-desc' ? ' selected' : ''}>Newest first</option>
        <option value="amount-desc"${filter.sort === 'amount-desc' ? ' selected' : ''}>Largest first</option>
        <option value="amount-asc"${filter.sort === 'amount-asc' ? ' selected' : ''}>Smallest first</option>
      </select></label>
    </div>
    ${rows.length === 0
      ? '<p class="empty">Nothing matches that filter. Try clearing the search.</p>'
      : `<div class="table-scroll"><table>
        <thead><tr><th scope="col">Date</th><th scope="col">Paid to</th><th scope="col">Category</th><th scope="col">Note</th><th scope="col" class="num">Amount</th><th scope="col"><span class="visually-hidden">Remove</span></th></tr></thead>
        <tbody>${rows.map((t) => {
          const cat = categoryById(t.category);
          return `<tr><td>${esc(t.date)}</td><td><strong>${esc(t.payee)}</strong></td><td><span class="swatch" style="background:${cat.color}"></span>${esc(cat.label)}</td><td>${esc(t.note || '—')}</td><td class="num">${money(t.amount)}</td><td><button class="btn-small" data-delete-purchase="${esc(t.id)}" aria-label="Delete ${esc(t.payee)} ${money(t.amount)}">Delete</button></td></tr>`;
        }).join('')}</tbody></table></div>`}
  </section>`;
}

// ---- Budget -----------------------------------------------------------------

export function budgetView(book) {
  const perCat = spentPerCategory(book);
  const planned = book.envelopes.reduce((sum, row) => sum + row.limit, 0);
  const spent = spentTotal(book);
  return `
  ${pageHead('Monthly budget', 'One envelope per category. Change a limit and it saves straight away.')}
  <section class="summaries" aria-label="Budget totals">
    ${summaryCard('Planned spending', money(planned), 'All envelopes together')}
    ${summaryCard('Spent so far', money(spent), `${Math.round((spent / planned) * 100)}% of the plan used`)}
    ${summaryCard('Still in the envelopes', money(Math.max(0, planned - spent)), 'Across all categories')}
  </section>
  <section class="panel" aria-labelledby="env-title">
    <h2 id="env-title">Envelopes for ${MONTH_LABEL}</h2>
    <ul class="envelopes">${book.envelopes.map((row) => {
      const cat = categoryById(row.category);
      const spentHere = perCat.get(row.category) || 0;
      const pct = (spentHere / row.limit) * 100;
      const remaining = row.limit - spentHere;
      return `<li class="envelope">
        <div class="env-top"><span><span class="swatch" style="background:${cat.color}"></span><strong>${esc(cat.label)}</strong></span>
        <label>Monthly limit $ <input type="number" min="0" step="1" value="${row.limit}" data-envelope-limit="${esc(row.category)}" aria-label="Monthly limit for ${esc(cat.label)}"></label></div>
        ${meter(pct, cat.label + ' envelope')}
        <p class="env-numbers"><span>${money(spentHere)} spent</span><span class="${remaining < 0 ? 'over-text' : ''}">${remaining < 0 ? money(-remaining) + ' over' : money(remaining) + ' left'}</span><span>${Math.round(pct)}%</span></p>
      </li>`;
    }).join('')}</ul>
    <p class="form-note" role="status" id="budget-note">Tip: groceries is the envelope most households overspend first — check it before the weekend shop.</p>
  </section>`;
}

// ---- Goals ------------------------------------------------------------------

export function goalsView(book) {
  const savedSum = book.goals.reduce((sum, g) => sum + g.saved, 0);
  const targetSum = book.goals.reduce((sum, g) => sum + g.target, 0);
  return `
  ${pageHead('Savings goals', 'Money with a job: each goal is a jar you fill a little at a time.')}
  <section class="summaries" aria-label="Goals totals">
    ${summaryCard('Saved toward goals', money(savedSum), `${book.goals.length} goals in progress`)}
    ${summaryCard('Total target', money(targetSum), `${Math.round((savedSum / targetSum) * 100)}% of the way there`)}
    ${summaryCard('Still to save', money(targetSum - savedSum), 'Across every goal')}
  </section>
  <section class="goals-grid" aria-label="Goals">
    ${book.goals.map((g) => {
      const pct = (g.saved / g.target) * 100;
      return `<article class="panel goal">
        <h2>${esc(g.name)}</h2>
        <p class="lede">${esc(g.note)}</p>
        <p class="goal-figures"><strong>${money(g.saved)}</strong> of ${money(g.target)}</p>
        ${meter(pct, g.name + ' progress')}
        <p class="goal-pct">${Math.round(pct)}% funded · ${money(g.target - g.saved)} to go</p>
        <form class="contribute" data-goal="${esc(g.id)}">
          <label>Add to this goal $ <input type="number" name="amount" min="1" step="1" placeholder="50" required></label>
          <button class="btn" type="submit">Add money</button>
        </form>
      </article>`;
    }).join('')}
  </section>
  <section class="panel" aria-labelledby="new-goal-title">
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

// ---- Bills -------------------------------------------------------------------

export function billsView(book) {
  const unpaid = book.bills.filter((b) => !b.paid);
  const dueSum = unpaid.reduce((sum, b) => sum + b.amount, 0);
  const paidSum = book.bills.filter((b) => b.paid).reduce((sum, b) => sum + b.amount, 0);
  return `
  ${pageHead('Bills', `Recurring bills for ${MONTH_LABEL}. Mark one paid and it stays paid.`)}
  <section class="summaries" aria-label="Bills totals">
    ${summaryCard('Still to pay', money(dueSum), `${unpaid.length} bills left this month`)}
    ${summaryCard('Already paid', money(paidSum), `${book.bills.length - unpaid.length} of ${book.bills.length} bills`)}
    ${summaryCard('Monthly total', money(dueSum + paidSum), 'All recurring bills')}
  </section>
  <section class="panel" aria-labelledby="bill-list-title">
    <h2 id="bill-list-title">November bills</h2>
    <ul class="bill-list">${[...book.bills].sort((a, b) => a.dueDay - b.dueDay).map((b) => `
      <li class="${b.paid ? 'paid' : ''}">
        <span class="row-main"><span><strong>${esc(b.name)}</strong><small>Due Nov ${b.dueDay}${b.autopay ? ' · autopay' : ' · pay manually'}</small></span></span>
        <span class="bill-right"><strong>${money(b.amount)}</strong>
        <button class="btn-small" data-toggle-bill="${esc(b.id)}">${b.paid ? '✓ Paid — undo' : 'Mark paid'}</button></span>
      </li>`).join('')}</ul>
  </section>
  <section class="panel" aria-labelledby="new-bill-title">
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

// ---- Reports -----------------------------------------------------------------

export function reportsView(book) {
  const income = incomeTotal(book);
  const spent = spentTotal(book);
  const perCat = spentPerCategory(book);
  const ranked = CATEGORIES
    .map((c) => ({ label: c.label, value: perCat.get(c.id) || 0, color: c.color }))
    .sort((a, b) => b.value - a.value);
  const biggest = [...book.purchases].sort((a, b) => b.amount - a.amount)[0];
  const history = MONTH_HISTORY.map((h) => (h.month === MONTH_SHORT ? { ...h, spent } : h));
  const savedPct = income > 0 ? Math.round(((income - spent) / income) * 100) : 0;
  const pastFive = history.slice(0, 5);
  const avgSpent = Math.round(pastFive.reduce((sum, h) => sum + h.spent, 0) / pastFive.length);
  const diningSpent = perCat.get('dining') || 0;
  const diningLimit = envelopeLimit(book, 'dining');
  const grocerySpent = perCat.get('groceries') || 0;
  const groceryWeekly = Math.round(grocerySpent / (DAYS_ELAPSED / 7));
  const groceryLimit = envelopeLimit(book, 'groceries');
  const weeksLeft = groceryWeekly > 0 ? Math.max(0, Math.floor((groceryLimit - grocerySpent) / groceryWeekly)) : 0;
  return `
  ${pageHead('Reports', 'Six months of income against spending, and what the numbers are saying.')}
  <section class="panel" aria-labelledby="trend-title">
    <h2 id="trend-title">Income vs spending — last 6 months</h2>
    <canvas id="bars" width="760" height="300" role="img" aria-label="Bar chart of monthly income and spending, June to November"></canvas>
    <p class="legend-inline"><span class="swatch" style="background:#2f6f5e"></span> Income <span class="swatch" style="background:#c25e7e"></span> Spending</p>
  </section>
  <div class="columns-2">
    <section class="panel" aria-labelledby="cat-title">
      <h2 id="cat-title">November by category</h2>
      <ul class="plain-list">${ranked.filter((t) => t.value > 0).map((t) => `<li><span class="row-main"><span class="swatch" style="background:${t.color}"></span>${esc(t.label)}</span><strong>${money(t.value)} · ${Math.round((t.value / spent) * 100)}%</strong></li>`).join('')}</ul>
    </section>
    <section class="panel" aria-labelledby="insight-title">
      <h2 id="insight-title">What the numbers say</h2>
      <ul class="insights">
        <li><strong>${esc(ranked[0].label)}</strong> is the biggest envelope at ${money(ranked[0].value)} — ${Math.round((ranked[0].value / spent) * 100)}% of all spending.</li>
        <li>You are keeping <strong>${savedPct}%</strong> of November income (${money(income - spent)} saved). The five-month average spend is ${money(avgSpent)} a month.</li>
        <li>Biggest single purchase: <strong>${esc(biggest.payee)}</strong>, ${money(biggest.amount)} on ${esc(biggest.date)}.</li>
        <li>Dining out is ${money(diningSpent)} so far — ${diningSpent <= diningLimit ? `inside its ${money(diningLimit)} envelope, with room for one more family dinner` : `${money(diningSpent - diningLimit)} over its ${money(diningLimit)} envelope`}.</li>
        <li>Groceries run about ${money(groceryWeekly)} a week at the current pace; the ${money(groceryLimit)} envelope covers ${weeksLeft} more weekly shops.</li>
      </ul>
    </section>
  </div>`;
}
