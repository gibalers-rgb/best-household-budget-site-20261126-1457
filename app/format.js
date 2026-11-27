/* DompetKeluarga — format angka dan tanggal (id-ID, Rupiah). */
export function formatRupiah(n) {
  return 'Rp' + Number(n || 0).toLocaleString('id-ID');
}

export function formatRupiahShort(n) {
  const v = Number(n || 0);
  if (Math.abs(v) >= 1000000) return 'Rp' + (v / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' jt';
  if (Math.abs(v) >= 1000) return 'Rp' + Math.round(v / 1000) + ' rb';
  return 'Rp' + v;
}

export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return d + ' ' + months[m - 1] + ' ' + y;
}

export function pct(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
