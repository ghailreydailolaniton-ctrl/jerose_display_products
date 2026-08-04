// email/email.js – Messenger (manual copy + paste) & Email Fallback

/* ------- Messenger (Manual Copy-Paste) with fallback ------- */
function sendOrderToMessenger(oid) {
  const o = orders.find(x => x.id === oid);
  if (!o) { toast('Order not found','err'); return; }
  if (!sellerMessenger) { toast('Set Messenger username in Settings first','err'); return; }

  const msg = buildOrderMessage(o);
  const messengerUrl = `https://m.me/${sellerMessenger}`;

  // Ipakita ang modal na may order text at manual copy button
  openModal(`
    <button class="mclose" onclick="closeAll()">✕</button>
    <div style="padding:28px 24px;max-width:600px;margin:0 auto;">
      <h2 style="font-size:22px;font-weight:800;margin-bottom:12px;">💬 Send Order to Seller via Messenger</h2>
      <p style="color:var(--text-soft);margin-bottom:16px;">
        Copy the order below, then tap "Open Messenger" and <strong>paste (long press → Paste)</strong> the message to the seller.
      </p>
      <div class="glass" style="background:var(--bg-2);padding:16px;border-radius:12px;max-height:300px;overflow:auto;white-space:pre-wrap;font-family:monospace;font-size:13px;line-height:1.6;margin-bottom:16px;">${escapeHTML(msg)}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;">
        <button class="btn btn-accent" style="flex:1;" onclick="copyOrderText('${oid}')">📋 Copy to Clipboard</button>
        <button class="btn btn-primary" style="flex:1;" onclick="openMessengerFallback('${messengerUrl}')">💬 Open Messenger</button>
      </div>
      <p style="font-size:12px;color:var(--text-mute);margin-top:12px;">After tapping "Open Messenger", paste the copied message and send it.</p>
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

/**
 * Attempt to open Messenger via window.open.
 * If blocked (returns null), show fallback with a clickable link and copy link button.
 */
function openMessengerFallback(url) {
  var newWindow = window.open(url, '_blank');
  
  // Check if popup was blocked (newWindow is null or undefined in many cases)
  if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
    // Popup blocked – show fallback inside a modal or custom notification
    showFallbackLink(url);
  }
}

/* Show fallback: direct link and "Copy link" button */
function showFallbackLink(url) {
  // Close any existing modal first (optional)
  closeAll();
  
  // Create a simple toast-like modal
  const fallbackHtml = `
    <div style="padding:24px;text-align:center;">
      <h3 style="margin-bottom:12px;">📱 Messenger didn't open automatically</h3>
      <p style="color:var(--text-soft);margin-bottom:16px;">
        Your browser may have blocked the pop‑up. Use the link below:
      </p>
      <div style="background:var(--bg-2);padding:12px;border-radius:8px;word-break:break-all;margin-bottom:12px;font-size:14px;">${url}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
        <button class="btn btn-primary" onclick="copyFallbackLink('${url}')">📋 Copy Link</button>
        <a class="btn btn-accent" style="text-decoration:none;" href="${url}" target="_blank">↗️ Open Anyway</a>
      </div>
      <p style="font-size:12px;color:var(--text-mute);margin-top:12px;">You can also long‑press the link and open in Messenger.</p>
    </div>
  `;
  
  // Use existing openModal function
  openModal(`
    <button class="mclose" onclick="closeAll()">✕</button>
    ${fallbackHtml}
  `);
}

/* Copy the fallback link to clipboard */
function copyFallbackLink(url) {
  copyToClipboard(url);
  toast('📋 Link copied! Open Messenger and paste it in the chat.');
}

/* (The rest of the file remains the same) */