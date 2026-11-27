// HearthBudget charts — hand-drawn canvas charts, no libraries.
//
// Both charts size themselves to the element on the page and scale for
// sharp (retina) screens, so they stay crisp on a phone and a desktop.
// Every value is also written out as text beside the canvas, so the page
// still reads if canvas drawing is ever unavailable.

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const INK = '#1f2430';
const MUTED = '#6b7280';
const GRID = '#e5e7eb';
const INCOME_GREEN = '#2f6f5e';
const SPEND_ROSE = '#c25e7e';

// Fit a canvas to its CSS box and return a context scaled for the screen.
function prepare(canvas) {
  const ratio = window.devicePixelRatio || 1;
  const box = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(box.width));
  const height = Math.max(1, Math.round(box.height));
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return { ctx, width, height };
}

export function money(amount) {
  return '$' + Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function dollarsShort(amount) {
  return '$' + (Math.round(amount / 100) / 10).toFixed(1) + 'k';
}

// Donut of spending by category, drawn as thick ring segments so the
// centre stays free for the month total. slices: [{label, value, color}].
export function drawDonut(canvas, slices) {
  const { ctx, width, height } = prepare(canvas);
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 18;
  const thickness = 30; // ring stays inside the box: radius + 15 < half-size
  if (total <= 0) {
    ctx.fillStyle = MUTED;
    ctx.font = `14px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No spending yet', cx, cy);
    return;
  }
  let start = -Math.PI / 2;
  for (const slice of slices) {
    const sweep = (slice.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.strokeStyle = slice.color;
    ctx.lineWidth = thickness;
    ctx.arc(cx, cy, radius, start, start + sweep);
    ctx.stroke();
    start += sweep;
  }
  ctx.fillStyle = INK;
  ctx.font = `700 19px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(money(total), cx, cy - 9);
  ctx.fillStyle = MUTED;
  ctx.font = `12px ${FONT}`;
  ctx.fillText('spent in November', cx, cy + 12);
}

// Grouped bars: income next to spending for each month in rows.
// rows: [{month, income, spent}]. Each bar carries its own value label.
export function drawBars(canvas, rows) {
  const { ctx, width, height } = prepare(canvas);
  const left = 54;
  const right = 12;
  const top = 16;
  const bottom = 28;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const peak = Math.max(...rows.flatMap((row) => [row.income, row.spent]), 1);
  const ceiling = Math.ceil(peak / 2000) * 2000;
  const barHeight = (value) => (value / ceiling) * plotHeight;

  ctx.font = `11px ${FONT}`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let step = 0; step <= 4; step += 1) {
    const value = (ceiling * step) / 4;
    const y = top + plotHeight - (plotHeight * step) / 4;
    ctx.fillStyle = MUTED;
    ctx.fillText('$' + Math.round(value).toLocaleString('en-US'), left - 8, y);
    ctx.strokeStyle = GRID;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(width - right, y);
    ctx.stroke();
  }

  const slot = plotWidth / rows.length;
  const barWidth = Math.max(10, Math.min(24, (slot - 22) / 2));
  rows.forEach((row, index) => {
    const groupX = left + index * slot + (slot - barWidth * 2 - 6) / 2;
    const incomeH = barHeight(row.income);
    const spentH = barHeight(row.spent);
    ctx.fillStyle = INCOME_GREEN;
    ctx.fillRect(groupX, top + plotHeight - incomeH, barWidth, incomeH);
    ctx.fillStyle = SPEND_ROSE;
    ctx.fillRect(groupX + barWidth + 6, top + plotHeight - spentH, barWidth, spentH);
    ctx.fillStyle = INK;
    ctx.font = `11px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(dollarsShort(row.income), groupX + barWidth / 2, top + plotHeight - incomeH - 5);
    ctx.fillText(dollarsShort(row.spent), groupX + barWidth * 1.5 + 6, top + plotHeight - spentH - 5);
    ctx.font = `12px ${FONT}`;
    ctx.fillText(row.month, groupX + barWidth + 3, height - 8);
  });
}
