/**
 * 管理者セッション管理（@tckworkshop.co.jp 限定）
 *
 * 認証方式（手動 email + password）:
 *  1. admin-login.html で email と password を入力
 *  2. 既存の認証GAS（"Anyone" デプロイ）に fetch
 *  3. GAS が admins シートを参照し、email が @tckworkshop.co.jp で
 *     終わり、かつ password が一致することを確認
 *  4. OK なら success + email + name を JSON で返す
 *  5. フロントが localStorage に保存して admin.html に遷移
 *
 * セキュリティ:
 *  - GAS 側で email.endsWith('@tckworkshop.co.jp') を厳格チェック
 *    （admins シートに非 tckworkshop メールを誤って入れても弾く二重防御）
 *  - localStorage の email も読み込み時に再チェック
 *    （DevTools で他ドメインに改竄しても次のロードでクリアされる）
 *  - 8 時間で自動失効
 */
const ADMIN_AUTH = {
  // 既存の認証 GAS（受講者ログインと同じ "Anyone" デプロイ）
  AUTH_GAS_URL: 'https://script.google.com/macros/s/AKfycbx9ohGwz8pz-tmrvthxWTy5zoEwvq77WonVlivFwQB48bq_VVkiRemmERE41y9PRKeg6w/exec',
  ALLOWED_DOMAIN: 'tckworkshop.co.jp',
  STORAGE_KEY: 'tck_admin',
  SESSION_MS: 8 * 60 * 60 * 1000, // 8 時間

  async login(email, pass) {
    const url = this.AUTH_GAS_URL
      + '?action=adminLogin'
      + '&email=' + encodeURIComponent(email)
      + '&pass=' + encodeURIComponent(pass);
    const res = await fetch(url, { redirect: 'follow' });
    return res.json();
  },

  acceptSession(data) {
    const email = String((data && data.email) || '').toLowerCase().trim();
    if (!email || !email.endsWith('@' + this.ALLOWED_DOMAIN)) return false;
    const name = (data && data.name) || email.split('@')[0];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      email: email,
      name: name,
      savedAt: Date.now()
    }));
    return true;
  },

  get() {
    try {
      const raw = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
      if (!raw) return null;
      // 念のため email ドメインを再チェック (localStorage 改竄対策)
      if (!raw.email || !String(raw.email).toLowerCase().endsWith('@' + this.ALLOWED_DOMAIN)) {
        localStorage.removeItem(this.STORAGE_KEY);
        return null;
      }
      if (raw.savedAt && (Date.now() - raw.savedAt) > this.SESSION_MS) {
        localStorage.removeItem(this.STORAGE_KEY);
        return null;
      }
      return raw;
    } catch {
      return null;
    }
  },

  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
  },

  require() {
    const u = this.get();
    if (!u) {
      location.href = 'admin-login.html';
      return null;
    }
    return u;
  },

  logout() {
    if (!confirm('管理者ログアウトしますか？')) return;
    this.clear();
    location.href = 'admin-login.html';
  }
};
