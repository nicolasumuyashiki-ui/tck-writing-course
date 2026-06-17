/**
 * セッション管理 (localStorage)
 *  - ログイン状態は localStorage に保存され、30 日経過すると自動失効する
 *  - ログアウトボタンは showBadge() がバッジ内に同梱して描画する
 */
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const Auth = {
  save(user) {
    const record = Object.assign({}, user, { savedAt: Date.now() });
    localStorage.setItem('toefl_user', JSON.stringify(record));
  },
  get() {
    try {
      const raw = JSON.parse(localStorage.getItem('toefl_user'));
      if (!raw) return null;
      if (raw.savedAt && (Date.now() - raw.savedAt) > SESSION_MAX_AGE_MS) {
        localStorage.removeItem('toefl_user');
        return null;
      }
      return raw;
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
    if (!confirm('ログアウトしますか？')) return;
    this.clear();
    location.href = 'index.html';
  },
  showBadge(elementId) {
    const u = this.get();
    const el = document.getElementById(elementId);
    if (u && u.name && el) {
      el.innerHTML = 'Welcome, <strong>' + u.name + '</strong>' +
        ' <a href="#" onclick="Auth.logout();return false;" ' +
        'style="margin-left:10px;color:inherit;text-decoration:underline;cursor:pointer;font-size:.9em">ログアウト</a>';
    }
  }
};
