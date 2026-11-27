/* DompetKeluarga — grafik kanvas tanpa library: batang dan donat. */
import { formatRupiahShort } from './format.js';

function setupCanvas(canvas, height) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || canvas.parentElement.clientWidth || 600;
  canvas.width = w * dpr;
  canvas.height = height * dpr;
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, w };
}

export function drawBarChart(canvas, items) {
  // items: [{label, value, color}] — batang vertikal dengan nilai di atasnya.
  const { ctx, w } = setupCanvas(canvas, 220);
  const max = Math.max(...items.map((i) => i.value), 1);
  const gap = 10;
  const barW = Math.min(64, (w - gap * (items.length + 1)) / items.length);
  const shortLabel = w < 560;
  ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#ddd5c2';
  ctx.beginPath();
  ctx.moveTo(gap, 190);
  ctx.lineTo(w - gap, 190);
  ctx.stroke();
  items.forEach((item, i) => {
    const h = Math.max(4, ((item.value / max) * 160) | 0);
    const x = gap + i * (barW + gap);
    const y = 190 - h;
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, h, 4);
    ctx.fill();
    ctx.fillStyle = '#24352e';
    ctx.fillText(formatRupiahShort(item.value), x + barW / 2, y - 6);
    ctx.fillStyle = '#5c6b62';
    ctx.fillText(shortLabel ? item.label.slice(0, 7) : item.label.slice(0, 12), x + barW / 2, 208);
  });
}

export function drawDonut(canvas, items) {
  // items: [{label, value, color}] — donat + legenda di bawah kanvas (dirender HTML).
  const { ctx, w } = setupCanvas(canvas, 200);
  const shown = items.filter((i) => i.value > 0);
  const total = shown.reduce((s, i) => s + i.value, 0) || 1;
  const cx = w / 2;
  const cy = 100;
  const r = 78;
  let a = -Math.PI / 2;
  shown.forEach((item) => {
    const sweep = (item.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, a, a + sweep);
    ctx.closePath();
    ctx.fillStyle = item.color;
    ctx.fill();
    a += sweep;
  });
  ctx.beginPath();
  ctx.arc(cx, cy, 46, 0, Math.PI * 2);
  ctx.fillStyle = '#fffdf8';
  ctx.fill();
  ctx.fillStyle = '#24352e';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(formatRupiahShort(total), cx, cy - 2);
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = '#5c6b62';
  ctx.fillText('total belanja', cx, cy + 16);
}
