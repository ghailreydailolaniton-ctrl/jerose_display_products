// email/email.js – Messenger (auto-fill with fallback) & Email Fallback

/* ------- Messenger (Auto-fill + Manual Copy-Paste) ------- */
function sendOrderToMessenger(oid) {
  const o = orders.find(x => x.id === oid);
  if (!o) { toast('Order not found','err'); return; }
  if (!sellerMessenger) { toast('Set Messenger username in Settings first','err'); return; }

  const msg = buildOrderMessage(o);
  const encodedMsg = encodeURIComponent(msg);
  const messengerUrl = `https://m.me/${sellerMessenger}?text=${encodedMsg}`;

  // Ipakita ang modal na may order text at dalawang button
  openModal(`
    <button class="mclose" onclick="closeAll()">✕</button>
    <div style="padding:28px 24px;max-width:600px;margin:0 auto;">
      <h2 style="font-size:22px;font-weight:800;margin-bottom:12px;">💬 Send Order to Seller via Messenger</h2>
      <p style="color:var(--text-soft);margin-bottom:16px;">
        Tap the button below to open Messenger with your order <strong>pre-filled</strong>. Then simply <strong>tap Send</strong>.
        <br><em>If the message is too long, use "Copy to Clipboard" and paste manually.</em>
      </p>
      <div class="glass" style="background:var(--bg-2);padding:16px;border-radius:12px;max-height:300px;overflow:auto;white-space:pre-wrap;font-family:monospace;font-size:13px;line-height:1.6;margin-bottom:16px;">${escapeHTML(msg)}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;">
        <button class="btn btn-primary" style="flex:1;" onclick="openMessengerWithMessage('${messengerUrl}')">💬 Open Messenger</button>
        <button class="btn btn-accent" style="flex:1;" onclick="copyOrderText('${oid}')">📋 Copy to Clipboard</button>
      </div>
      <p style="font-size:12px;color:var(--text-mute);margin-top:12px;">
        After tapping "Open Messenger", paste the message if it didn't appear automatically.
      </p>
    </div>
  `);

  // Save the current message for the copy button
  window._tempOrderMsg = msg;
}

/* Helper: Copy the order text to clipboard */
function copyOrderText(oid) {
  const text = window._tempOrderMsg || buildOrderMessage(orders.find(x => x.id === oid));
  copyToClipboard(text);
  toast('📋 Order copied! Now open Messenger and paste it.');
}

/* Helper: Open Messenger with pre-filled message (using ?text= parameter) */
function openMessengerWithMessage(url) {
  // Gamitin ang window.open para ma-trigger ang Messenger app
  var newWindow = window.open(url, '_blank');

  // Fallback kung hinarang ng browser (hal. in-app browser)
  if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
    // Ipakita ang link at copy button
    showFallbackLink(url);
  }
}

/* Helper: Fallback kung hindi bumukas ang Messenger */
function showFallbackLink(url) {
  openModal(`
    <button class="mclose" onclick="closeAll()">✕</button>
    <div style="padding:24px;text-align:center;">
      <h3 style="margin-bottom:12px;">📱 Messenger didn't open automatically</h3>
      <p style="color:var(--text-soft);margin-bottom:16px;">
        Your browser may have blocked the pop‑up. Use the link below:
      </p>
      <div style="background:var(--bg-2);padding:12px;border-radius:8px;word-break:break-all;margin-bottom:12px;font-size:14px;">${url}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
        <button class="btn btn-accent" onclick="copyFallbackLink('${url}')">📋 Copy Link</button>
        <a class="btn btn-primary" style="text-decoration:none;" href="${url}" target="_blank">↗️ Open Anyway</a>
      </div>
      <p style="font-size:12px;color:var(--text-mute);margin-top:12px;">You can also long‑press the link and open in Messenger.</p>
    </div>
  `);
}

function copyFallbackLink(url) {
  copyToClipboard(url);
  toast('📋 Link copied! Open Messenger and send it manually.');
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