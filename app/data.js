// HearthBudget seed data: one household's November 2026 money, in plain
// objects. The app loads this on first run and then keeps the household's
// own edits in localStorage, so every figure on screen is real data the
// household can change — nothing here is a placeholder.

export const CATEGORIES = [
  { id: 'housing', label: 'Housing', color: '#2f6f5e', icon: '⌂' },
  { id: 'groceries', label: 'Groceries', color: '#3e8e5a', icon: '◍' },
  { id: 'utilities', label: 'Utilities', color: '#c98a1b', icon: '⚡' },
  { id: 'transport', label: 'Transport', color: '#4a6fa5', icon: '➤' },
  { id: 'dining', label: 'Dining out', color: '#b4552d', icon: '✦' },
  { id: 'health', label: 'Health', color: '#7a5ba6', icon: '+' },
  { id: 'kids', label: 'Kids & school', color: '#c25e7e', icon: '✎' },
  { id: 'fun', label: 'Fun & streaming', color: '#2a9d8f', icon: '♪' },
  { id: 'clothing', label: 'Clothing', color: '#8a6d3b', icon: '✂' },
  { id: 'other', label: 'Everything else', color: '#6b7280', icon: '•' },
];

export const MONTH = 'November 2026';

export const INCOME = [
  { id: 'inc-1', source: 'Maya — salary (Nov 1)', amount: 3850, date: '2026-11-01' },
  { id: 'inc-2', source: 'Jordan — salary (Nov 15)', amount: 2700, date: '2026-11-15' },
  { id: 'inc-3', source: 'Weekend market stall', amount: 300, date: '2026-11-08' },
];

export const BUDGETS = [
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

export const TRANSACTIONS = [
  { id: 't-01', date: '2026-11-01', payee: 'Maple Court Apartments', category: 'housing', amount: 1850, note: 'Monthly rent' },
  { id: 't-02', date: '2026-11-02', payee: 'GreenMart Supermarket', category: 'groceries', amount: 96.4, note: 'Weekly shop' },
  { id: 't-03', date: '2026-11-02', payee: 'City Power & Light', category: 'utilities', amount: 128.75, note: 'October electricity' },
  { id: 't-04', date: '2026-11-03', payee: 'Northside Pharmacy', category: 'health', amount: 42.1, note: 'Allergy medicine' },
  { id: 't-05', date: '2026-11-04', payee: 'Sunoco Fuel', category: 'transport', amount: 48.2, note: 'Fill-up' },
  { id: 't-06', date: '2026-11-05', payee: 'GreenMart Supermarket', category: 'groceries', amount: 73.55, note: 'Weekly shop' },
  { id: 't-07', date: '2026-11-06', payee: 'Pasta Rosa', category: 'dining', amount: 54.8, note: 'Friday dinner out' },
  { id: 't-08', date: '2026-11-07', payee: 'BrightNet Internet', category: 'utilities', amount: 69.0, note: 'Monthly broadband' },
  { id: 't-09', date: '2026-11-08', payee: 'Kids’ Book Fair', category: 'kids', amount: 38.5, note: 'Two storybooks' },
  { id: 't-10', date: '2026-11-09', payee: 'GreenMart Supermarket', category: 'groceries', amount: 112.3, note: 'Weekly shop + pantry' },
  { id: 't-11', date: '2026-11-10', payee: 'Metro Transit', category: 'transport', amount: 56.0, note: 'Monthly bus passes' },
  { id: 't-12', date: '2026-11-11', payee: 'River Cinema', category: 'fun', amount: 32.0, note: 'Family movie night' },
  { id: 't-13', date: '2026-11-12', payee: 'GreenMart Supermarket', category: 'groceries', amount: 84.9, note: 'Weekly shop' },
  { id: 't-14', date: '2026-11-13', payee: 'Dental Care Plus', category: 'health', amount: 85.0, note: 'Leo’s check-up' },
  { id: 't-15', date: '2026-11-14', payee: 'Sunoco Fuel', category: 'transport', amount: 44.6, note: 'Fill-up' },
  { id: 't-16', date: '2026-11-15', payee: 'Taco Verde', category: 'dining', amount: 41.25, note: 'Lunch with friends' },
  { id: 't-17', date: '2026-11-16', payee: 'GreenMart Supermarket', category: 'groceries', amount: 91.2, note: 'Weekly shop' },
  { id: 't-18', date: '2026-11-17', payee: 'Aqua City Water', category: 'utilities', amount: 54.3, note: 'Water bill' },
  { id: 't-19', date: '2026-11-18', payee: 'School Lunch Program', category: 'kids', amount: 64.0, note: 'November lunches' },
  { id: 't-20', date: '2026-11-19', payee: 'StreamBox', category: 'fun', amount: 15.99, note: 'Monthly streaming' },
  { id: 't-21', date: '2026-11-20', payee: 'Thread & Co.', category: 'clothing', amount: 58.75, note: 'Winter jackets for kids' },
  { id: 't-22', date: '2026-11-21', payee: 'GreenMart Supermarket', category: 'groceries', amount: 102.45, note: 'Weekly shop' },
  { id: 't-23', date: '2026-11-22', payee: 'Sunoco Fuel', category: 'transport', amount: 52.1, note: 'Fill-up' },
  { id: 't-24', date: '2026-11-23', payee: 'Pasta Rosa', category: 'dining', amount: 47.6, note: 'Sunday dinner out' },
  { id: 't-25', date: '2026-11-24', payee: 'Northside Pharmacy', category: 'health', amount: 18.9, note: 'Vitamins' },
  { id: 't-26', date: '2026-11-25', payee: 'GreenMart Supermarket', category: 'groceries', amount: 88.15, note: 'Thanksgiving prep' },
];

export const BILLS = [
  { id: 'b-1', name: 'Rent — Maple Court', amount: 1850, dueDay: 1, autopay: true, paid: true },
  { id: 'b-2', name: 'City Power & Light', amount: 128.75, dueDay: 3, autopay: true, paid: true },
  { id: 'b-3', name: 'BrightNet Internet', amount: 69, dueDay: 7, autopay: true, paid: true },
  { id: 'b-4', name: 'Aqua City Water', amount: 54.3, dueDay: 17, autopay: false, paid: true },
  { id: 'b-5', name: 'Metro Transit passes', amount: 56, dueDay: 10, autopay: false, paid: true },
  { id: 'b-6', name: 'StreamBox', amount: 15.99, dueDay: 19, autopay: true, paid: true },
  { id: 'b-7', name: 'Mobile — two lines', amount: 92, dueDay: 26, autopay: true, paid: false },
  { id: 'b-8', name: 'Home insurance', amount: 148, dueDay: 28, autopay: false, paid: false },
  { id: 'b-9', name: 'Gym — Family Fit', amount: 45, dueDay: 30, autopay: true, paid: false },
];

export const GOALS = [
  { id: 'g-1', name: 'Emergency fund', target: 10000, saved: 6400, note: 'Six months of essentials' },
  { id: 'g-2', name: 'Summer road trip', target: 2400, saved: 1150, note: 'Two weeks by the coast' },
  { id: 'g-3', name: 'New living-room sofa', target: 900, saved: 520, note: 'The old one sags' },
  { id: 'g-4', name: 'Kids’ college jar', target: 5000, saved: 1800, note: 'A little every month' },
];

// Six months of totals for the Reports page (income vs spending).
export const HISTORY = [
  { month: 'Jun', income: 6720, spent: 4980 },
  { month: 'Jul', income: 6850, spent: 5340 },
  { month: 'Aug', income: 6680, spent: 5120 },
  { month: 'Sep', income: 6850, spent: 4875 },
  { month: 'Oct', income: 6910, spent: 5410 },
  { month: 'Nov', income: 6850, spent: 0 }, // filled in live from transactions
];

export function seedState() {
  return {
    income: structuredClone(INCOME),
    budgets: structuredClone(BUDGETS),
    transactions: structuredClone(TRANSACTIONS),
    bills: structuredClone(BILLS),
    goals: structuredClone(GOALS),
  };
}
