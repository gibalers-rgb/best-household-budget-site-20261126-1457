# HearthBudget

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/gibalers-rgb/best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/gibalers-rgb/best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

A household budget site that a real family can actually use: track spending,
set monthly envelopes, save toward goals, stay on top of bills, and see six
months of income against spending — all in the browser, with nothing sent
anywhere.

## What it does

- **Dashboard** — money in, money out, what is left, a donut of spending by
  category, budgets closest to the edge, latest purchases and bills coming up.
- **Transactions** — every purchase, filterable by category and searchable,
  with an add form and delete. Saved in the browser.
- **Budget** — one envelope per category with an editable monthly limit and a
  progress bar that turns amber, then red, as it fills.
- **Goals** — savings jars with targets, progress and a way to add money.
- **Bills** — recurring bills with due days and a mark-paid toggle.
- **Reports** — a six-month income-vs-spending bar chart, a category
  breakdown, and plain-language insights computed from the numbers.

The demo household (Maple House, November 2026) ships with real
figures — $6,850 of income, 26 transactions, 9 bills, 4 goals — and every
control works: add a transaction and the totals move; change a budget limit
and it saves; mark a bill paid and it stays paid.

## Run it

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

Or open `app/index.html` through any static server with `app/` at its root.
No build step, no network requests, no libraries — plain HTML, CSS and ES
modules, plus canvas charts drawn by hand.

## How the entry is handed in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to the output directory and writes `dossier.json` with the vendored
`vendor/makefun-frontend.ts` library:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
