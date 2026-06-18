/**
 * セッション管理 (localStorage)
 *  - ログイン状態は localStorage に保存され、明示的にログアウトされるまで永続
 *  - ログアウトボタンは showBadge() がバッジ内に同梱して描画する
 */
const Auth = {
  save(user) {
    localStorage.setItem('toefl_user', JSON.stringify(user));
  },
  get() {
    try {
      return JSON.parse(localStorage.getItem('toefl_user'));
    } catch { return null; }
  },
  clear() {
    localStorage.removeItem('toefl_user');
  },
  require() {
    const u = this.get();
    if (!u) { location.href = 'index.html'; return null; }
    return u;
  },
  logout() {
    if (document.querySelector('.tck-logout-modal')) return;
    if (!document.getElementById('tck-logout-styles')) {
      const s = document.createElement('style');
      s.id = 'tck-logout-styles';
      s.textContent =
        ".tck-logout-modal{position:fixed;inset:0;background:rgba(0,40,23,.55);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px;font-family:'Zen Kaku Gothic New','Noto Sans JP',system-ui,sans-serif}" +
        ".tck-logout-card{background:#fff;border-radius:14px;max-width:380px;width:100%;padding:24px;box-shadow:0 12px 40px rgba(0,40,23,.25)}" +
        ".tck-logout-card h2{font-size:1.1em;font-weight:700;color:#002817;margin:0 0 10px}" +
        ".tck-logout-card p{font-size:.9em;color:#5A6861;line-height:1.7;margin:0 0 18px}" +
        ".tck-logout-actions{display:flex;gap:10px;justify-content:flex-end}" +
        ".tck-logout-actions button{padding:10px 20px;font-family:inherit;font-size:.9em;font-weight:700;border-radius:999px;cursor:pointer;border:none;letter-spacing:.04em}" +
        ".tck-logout-actions .cancel{background:#F5E9D3;color:#5A6861}" +
        ".tck-logout-actions .cancel:hover{background:#ead9be}" +
        ".tck-logout-actions .confirm{background:#007646;color:#fff}" +
        ".tck-logout-actions .confirm:hover{background:#004D2E}";
      document.head.appendChild(s);
    }
    const m = document.createElement('div');
    m.className = 'tck-logout-modal';
    m.innerHTML =
      '<div class="tck-logout-card" role="dialog" aria-modal="true" aria-labelledby="tckLogoutTitle">' +
        '<h2 id="tckLogoutTitle">ログアウトしますか？</h2>' +
        '<p>次回ログインする際は、受講者IDとパスワードが必要です。控えをお手元にご準備ください。</p>' +
        '<div class="tck-logout-actions">' +
          '<button type="button" class="cancel">キャンセル</button>' +
          '<button type="button" class="confirm">ログアウト</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(m);
    const close = () => { m.remove(); document.removeEventListener('keydown', esc); };
    const esc = e => { if (e.key === 'Escape') close(); };
    m.querySelector('.cancel').onclick = close;
    m.querySelector('.confirm').onclick = () => { this.clear(); location.href = 'index.html'; };
    m.onclick = e => { if (e.target === m) close(); };
    document.addEventListener('keydown', esc);
  },
  showBadge(elementId) {
    const u = this.get();
    const el = document.getElementById(elementId);
    if (!(u && u.name && el)) return;
    if (!document.getElementById('tck-badge-styles')) {
      const s = document.createElement('style');
      s.id = 'tck-badge-styles';
      s.textContent =
        ".auth-logout-btn{display:inline-flex;align-items:center;gap:6px;margin-left:14px;padding:7px 14px 7px 12px;" +
          "border:1px solid rgba(255,255,255,.4);border-radius:999px;color:inherit;text-decoration:none;" +
          "font-size:.88em;font-weight:600;line-height:1;transition:all .15s;vertical-align:middle;white-space:nowrap;min-height:30px}" +
        ".auth-logout-btn svg{width:14px;height:14px;fill:currentColor;flex-shrink:0}" +
        ".auth-logout-btn:hover{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.7)}" +
        ".auth-logout-btn:focus-visible{outline:2px solid #C9A961;outline-offset:2px}";
      document.head.appendChild(s);
    }
    el.innerHTML = 'Welcome, <strong>' + u.name + '</strong>' +
      ' <a href="#" class="auth-logout-btn" onclick="Auth.logout();return false;" aria-label="ログアウト">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>' +
        'ログアウト' +
      '</a>';
  }
};
