// HearthBudget seed data — the Maple House books for November 2026.
//
// On first visit the app loads this snapshot, then keeps the household's
// own edits in localStorage under HEARTH_KEY (see main.js). Nothing here
// is a placeholder: every number on screen comes from these records, and
// every record can be changed from the site itself.

export const MONTH_LABEL = 'November 2026';
export const MONTH_SHORT = 'Nov';
export const DAYS_ELAPSED = 25; // last transaction is dated Nov 25

// One spending category: an id the data uses, the label the site shows,
// a chart colour and a small glyph for the lists.
function cat(id, label, color, glyph) {
  return { id, label, color, glyph };
}

export const CATEGORIES = [
  cat('housing', 'Housing', '#2f6f5e', '⌂'),
  cat('groceries', 'Groceries', '#3e8e5a', '◍'),
  cat('utilities', 'Utilities', '#c98a1b', '⚡'),
  cat('transport', 'Transport', '#4a6fa5', '➤'),
  cat('dining', 'Dining out', '#b4552d', '✦'),
  cat('health', 'Health', '#7a5ba6', '+'),
  cat('kids', 'Kids & school', '#c25e7e', '✎'),
  cat('fun', 'Fun & streaming', '#2a9d8f', '♪'),
  cat('clothing', 'Clothing', '#8a6d3b', '✂'),
  cat('other', 'Everything else', '#6b7280', '•'),
];

export function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

// Money in this month: two salaries and a weekend market stall.
export const INCOME_ROWS = [
  { id: 'in-salary-maya', source: 'Maya — salary', amount: 3850, date: '2026-11-01' },
  { id: 'in-stall', source: 'Weekend market stall', amount: 300, date: '2026-11-08' },
  { id: 'in-salary-jordan', source: 'Jordan — salary', amount: 2700, date: '2026-11-15' },
];

// One envelope per category: what the household planned to spend.
export const ENVELOPES = [
  { category: 'housing', limit: 1950 },
  { category: 'groceries', limit: 720 },
  { category: 'utilities', limit: 310 },
  { category: 'transport', limit: 340 },
  { category: 'dining', limit: 220 },
  { category: 'health', limit: 180 },
  { category: 'kids', limit: 260 },
  { category: 'fun', limit: 120 },
  { category: 'clothing', limit: 100 },
  { category: 'other', limit: 150 },
];

// One purchase: the date, who was paid, the category, the amount, and a
// short note. Amounts are dollars; 26 purchases, $3,450.79 in total.
function tx(id, date, payee, category, amount, note) {
  return { id, date, payee, category, amount, note };
}

export const PURCHASES = [
  tx('p01', '2026-11-01', 'Maple Court Apartments', 'housing', 1850, 'Monthly rent'),
  tx('p02', '2026-11-02', 'GreenMart Supermarket', 'groceries', 96.4, 'Weekly shop'),
  tx('p03', '2026-11-02', 'City Power & Light', 'utilities', 128.75, 'October electricity'),
  tx('p04', '2026-11-03', 'Northside Pharmacy', 'health', 42.1, 'Allergy medicine'),
  tx('p05', '2026-11-04', 'Sunoco Fuel', 'transport', 48.2, 'Fill-up'),
  tx('p06', '2026-11-05', 'GreenMart Supermarket', 'groceries', 73.55, 'Weekly shop'),
  tx('p07', '2026-11-06', 'Pasta Rosa', 'dining', 54.8, 'Friday dinner out'),
  tx('p08', '2026-11-07', 'BrightNet Internet', 'utilities', 69, 'Monthly broadband'),
  tx('p09', '2026-11-08', 'Kids’ Book Fair', 'kids', 38.5, 'Two storybooks'),
  tx('p10', '2026-11-09', 'GreenMart Supermarket', 'groceries', 112.3, 'Weekly shop + pantry'),
  tx('p11', '2026-11-10', 'Metro Transit', 'transport', 56, 'Monthly bus passes'),
  tx('p12', '2026-11-11', 'River Cinema', 'fun', 32, 'Family movie night'),
  tx('p13', '2026-11-12', 'GreenMart Supermarket', 'groceries', 84.9, 'Weekly shop'),
  tx('p14', '2026-11-13', 'Dental Care Plus', 'health', 85, 'Leo’s check-up'),
  tx('p15', '2026-11-14', 'Sunoco Fuel', 'transport', 44.6, 'Fill-up'),
  tx('p16', '2026-11-15', 'Taco Verde', 'dining', 41.25, 'Lunch with friends'),
  tx('p17', '2026-11-16', 'GreenMart Supermarket', 'groceries', 91.2, 'Weekly shop'),
  tx('p18', '2026-11-17', 'Aqua City Water', 'utilities', 54.3, 'Water bill'),
  tx('p19', '2026-11-18', 'School Lunch Program', 'kids', 64, 'November lunches'),
  tx('p20', '2026-11-19', 'StreamBox', 'fun', 15.99, 'Monthly streaming'),
  tx('p21', '2026-11-20', 'Thread & Co.', 'clothing', 58.75, 'Winter jackets for kids'),
  tx('p22', '2026-11-21', 'GreenMart Supermarket', 'groceries', 102.45, 'Weekly shop'),
  tx('p23', '2026-11-22', 'Sunoco Fuel', 'transport', 52.1, 'Fill-up'),
  tx('p24', '2026-11-23', 'Pasta Rosa', 'dining', 47.6, 'Sunday dinner out'),
  tx('p25', '2026-11-24', 'Northside Pharmacy', 'health', 18.9, 'Vitamins'),
  tx('p26', '2026-11-25', 'GreenMart Supermarket', 'groceries', 88.15, 'Thanksgiving prep'),
];

// Recurring bills: name, amount, the day of the month it falls due,
// whether autopay is on, and whether this month's copy is paid.
function bill(id, name, amount, dueDay, autopay, paid) {
  return { id, name, amount, dueDay, autopay, paid };
}

export const BILL_ROWS = [
  bill('b01', 'Rent — Maple Court', 1850, 1, true, true),
  bill('b02', 'City Power & Light', 128.75, 3, true, true),
  bill('b03', 'BrightNet Internet', 69, 7, true, true),
  bill('b04', 'Metro Transit passes', 56, 10, false, true),
  bill('b05', 'Aqua City Water', 54.3, 17, false, true),
  bill('b06', 'StreamBox', 15.99, 19, true, true),
  bill('b07', 'Mobile — two lines', 92, 26, true, false),
  bill('b08', 'Home insurance', 148, 28, false, false),
  bill('b09', 'Gym — Family Fit', 45, 30, true, false),
];

// Savings jars: what the jar is for, the target, what is in it already.
function goal(id, name, target, saved, note) {
  return { id, name, target, saved, note };
}

export const GOAL_ROWS = [
  goal('g01', 'Emergency fund', 10000, 6400, 'Six months of essentials'),
  goal('g02', 'Summer road trip', 2400, 1150, 'Two weeks by the coast'),
  goal('g03', 'New living-room sofa', 900, 520, 'The old one sags'),
  goal('g04', 'Kids’ college jar', 5000, 1800, 'A little every month'),
];

// Monthly totals for the Reports chart. November's spending is filled in
// live from the purchases above; the five months before it are history.
export const MONTH_HISTORY = [
  { month: 'Jun', income: 6720, spent: 4980 },
  { month: 'Jul', income: 6850, spent: 5340 },
  { month: 'Aug', income: 6680, spent: 5120 },
  { month: 'Sep', income: 6850, spent: 4875 },
  { month: 'Oct', income: 6910, spent: 5410 },
  { month: 'Nov', income: 6850, spent: 0 },
];

// A fresh copy of the whole household book, for first run and for reset.
export function freshBook() {
  return {
    income: INCOME_ROWS.map((row) => ({ ...row })),
    envelopes: ENVELOPES.map((row) => ({ ...row })),
    purchases: PURCHASES.map((row) => ({ ...row })),
    bills: BILL_ROWS.map((row) => ({ ...row })),
    goals: GOAL_ROWS.map((row) => ({ ...row })),
  };
}
