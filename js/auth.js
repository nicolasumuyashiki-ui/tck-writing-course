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
