// email/email.js – Messenger (manual copy + paste) & Email Fallback

/* ------- Messenger (Manual Copy-Paste) ------- */
function sendOrderToMessenger(oid) {
  const o = orders.find(x => x.id === oid);
  if (!o) { toast('Order not found','err'); return; }
  if (!sellerMessenger) { toast('Set Messenger username in Settings first','err'); return; }

  const msg = buildOrderMessage(o);

  // Ipakita ang modal na may order text at manual copy button
  openModal(`
    <button class="mclose" onclick="closeAll()">✕</button>
    <div style="padding:28px 24px;max-width:600px;margin:0 auto;">
      <h2 style="font-size:22px;font-weight:800;margin-bottom:12px;">💬 Send Order to Seller via Messenger</h2>
      <p style="color:var(--text-soft);margin-bottom:16px;">
        Copy the order below, then click "Open Messenger" and <strong>paste (Ctrl+V)</strong> the message to the seller.
      </p>
      <div class="glass" style="background:var(--bg-2);padding:16px;border-radius:12px;max-height:300px;overflow:auto;white-space:pre-wrap;font-family:monospace;font-size:13px;line-height:1.6;margin-bottom:16px;">${escapeHTML(msg)}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;">
        <button class="btn btn-accent" style="flex:1;" onclick="copyOrderText('${oid}')">📋 Copy to Clipboard</button>
        <button class="btn btn-primary" style="flex:1;" onclick="openMessenger()">💬 Open Messenger</button>
      </div>
      <p style="font-size:12px;color:var(--text-mute);margin-top:12px;">After clicking "Open Messenger", paste the copied message and press Send.</p>
    </div>
  `);

  // Save the current message in a temporary variable para magamit ng copy button
  window._tempOrderMsg = msg;
}

/* Helper: Copy the order text to clipboard */
function copyOrderText(oid) {
  const text = window._tempOrderMsg || buildOrderMessage(orders.find(x=>x.id===oid));
  copyToClipboard(text);
  toast('📋 Order copied! Now open Messenger and paste it.');
}

/* Helper: Open Messenger of seller */
function openMessenger() {
  if (!sellerMessenger) return;
  window.open(`https://m.me/${sellerMessenger}`, '_blank');
}

/* Helper: Escape HTML for display */
function escapeHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ------- Email (Fallback) ------- */
function sendOrderToEmail(oid) {
  const o = orders.find(x => x.id === oid);
  if (!o) { toast('Order not found','err'); return; }
  if (!orderEmail) { toast('Set an order email in Settings first','err'); go('profile','settings'); return; }

  const subject = `New Order #${o.id} for Jerose (${money(o.total)})`;
  const msg = buildOrderMessage(o);
  const url = `mailto:${encodeURIComponent(orderEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;
  window.location.href = url;
  toast('Opening email client... ✉️');
}

/* ------- Build Order Message ------- */
function buildOrderMessage(o) {
  const shipLabel = { delivery: 'Delivery (₱20)', pickup: 'Store Pickup' }[o.info?.ship] || 'Delivery';
  const payLabel = { gcash: 'GCash', gpay: 'Google Pay', cod: 'Cash on Delivery' }[o.info?.pay] || 'GCash';
  const lines = o.items.map(it => {
    const cust = Object.keys(it.custom || {}).filter(k => k[0] !== '_' && it.custom[k]).map(k => `${k}: ${String(it.custom[k]).slice(0, 40)}`);
    return `• ${it.name} (${it.color}) x${it.qty} — ${money(it.price * it.qty)}` + (cust.length ? `\n   ↳ ${cust.join(', ')}` : '');
  }).join('\n');
  return [
    `🛍️ NEW ORDER — Jerose`,
    `To: Jerose (Shop Owner)`,
    `Order ID: #${o.id}`,
    `Date: ${o.date}`,
    ``,
    `👤 Customer: ${o.info?.name || '-'}`,
    `📞 Phone: ${o.info?.phone || '-'}`,
    `📍 Address: ${o.info?.addr || '-'}, ${o.info?.city || ''} ${o.info?.zip || ''}`,
    `🚚 Delivery: ${shipLabel}`,
    `💰 Payment: ${payLabel}`,
    ``,
    `🧾 Items:`,
    lines,
    ``,
    `💰 TOTAL: ${money(o.total)}`,
    ``,
    `Please confirm my order. Thank you! ✨`
  ].join('\n');
}

/* ------- Clipboard Helper ------- */
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}
function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  try { document.execCommand('copy'); } catch(e) {}
  document.body.removeChild(textarea);
}