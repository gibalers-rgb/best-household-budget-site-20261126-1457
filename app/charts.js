// HearthBudget charts: small canvas drawings, no libraries. Both charts
// scale for sharp screens, draw a text fallback next to the canvas, and
// keep every value readable at a glance.

function fitCanvas(canvas) {
  const ratio = window.devicePixelRatio || 1;
  const box = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(box.width));
  const height = Math.max(1, Math.round(box.height));
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, width, height };
}

// A donut of spending by category. slices: [{label, value, color}].
export function drawDonut(canvas, slices) {
  const { ctx, width, height } = fitCanvas(canvas);
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const cx = width / 2;
  const cy = height / 2;
  const outer = Math.min(width, height) / 2 - 8;
  const inner = outer * 0.62;
  ctx.clearRect(0, 0, width, height);
  if (total <= 0) {
    ctx.fillStyle = '#8a8f98';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No spending yet', cx, cy);
    return;
  }
  let angle = -Math.PI / 2;
  for (const slice of slices) {
    const sweep = (slice.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    angle += sweep;
  }
  // Punch the hole and label the total in the middle.
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#1f2430';
  ctx.font = '700 18px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(money(total), cx, cy - 2);
  ctx.fillStyle = '#6b7280';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText('spent in November', cx, cy + 16);
}

// Grouped bars: income vs spending for each month.
// rows: [{label, income, spent}].
export function drawBars(canvas, rows) {
  const { ctx, width, height } = fitCanvas(canvas);
  const padLeft = 52;
  const padBottom = 26;
  const padTop = 14;
  const plotW = width - padLeft - 12;
  const plotH = height - padTop - padBottom;
  const max = Math.max(...rows.flatMap((r) => [r.income, r.spent]), 1);
  const nice = Math.ceil(max / 2000) * 2000;
  ctx.clearRect(0, 0, width, height);
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = '#6b7280';
  ctx.textAlign = 'right';
  for (let step = 0; step <= 4; step += 1) {
    const value = (nice * step) / 4;
    const y = padTop + plotH - (plotH * step) / 4;
    ctx.fillText('$' + Math.round(value).toLocaleString('en-US'), padLeft - 8, y + 4);
    ctx.strokeStyle = '#e5e7eb';
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - 12, y);
    ctx.stroke();
  }
  const groupW = plotW / rows.length;
  const barW = Math.min(26, (groupW - 18) / 2);
  rows.forEach((row, i) => {
    const x0 = padLeft + i * groupW + (groupW - barW * 2 - 6) / 2;
    const incomeH = (row.income / nice) * plotH;
    const spentH = (row.spent / nice) * plotH;
    ctx.fillStyle = '#2f6f5e';
    ctx.fillRect(x0, padTop + plotH - incomeH, barW, incomeH);
    ctx.fillStyle = '#c25e7e';
    ctx.fillRect(x0 + barW + 6, padTop + plotH - spentH, barW, spentH);
    // Value labels above each bar, so the chart reads without guessing.
    ctx.fillStyle = '#1f2430';
    ctx.textAlign = 'center';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText('$' + Math.round(row.income / 100) / 10 + 'k', x0 + barW / 2, padTop + plotH - incomeH - 4);
    ctx.fillText('$' + Math.round(row.spent / 100) / 10 + 'k', x0 + barW * 1.5 + 6, padTop + plotH - spentH - 4);
    ctx.fillStyle = '#1f2430';
    ctx.textAlign = 'center';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(row.month ?? row.label ?? '', x0 + barW + 3, height - 8);
  });
}

export function money(amount) {
  return '$' + Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
