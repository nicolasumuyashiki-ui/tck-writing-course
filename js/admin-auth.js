/**
 * 管理者セッション管理（email + password 方式・自動登録対応）
 *
 * 設計:
 *  - admin-login.html で email + password を入力 → GAS の admins シート
 *    で照合
 *  - 初回ログイン／パスワード忘れは "初回ログイン" モーダルから
 *    @tckworkshop.co.jp のアドレスを入力 → GAS がランダムパスワードを
 *    発行して当該アドレスにメール送信
 *  - @tckworkshop.co.jp 以外には絶対にパスワードを送らない＝メール所有
 *    確認でドメイン制限を実現
 *
 * セキュリティ:
 *  - GAS 側で email.endsWith('@tckworkshop.co.jp') を厳格チェック
 *  - localStorage の email も読み込み時に再チェック
 *  - 8 時間で自動失効
 */
const ADMIN_AUTH = {
  AUTH_GAS_URL: 'https://script.google.com/macros/s/AKfycbwXSB3bHsGwuFxZKcIsF6PBC332ZUVSQ10tWC7w-dL3YMa2ZLtdFyL50tTJ99EW8T9xag/exec',
  ALLOWED_DOMAIN: 'tckworkshop.co.jp',
  STORAGE_KEY: 'tck_admin',
  EMAIL_KEY: 'tck_admin_email',
  SESSION_MS: 8 * 60 * 60 * 1000, // 8 時間

  async login(email, pass) {
    const url = this.AUTH_GAS_URL
      + '?action=adminLogin'
      + '&email=' + encodeURIComponent(email)
      + '&pass=' + encodeURIComponent(pass);
    const res = await fetch(url, { redirect: 'follow' });
    return res.json();
  },

  async issuePassword(email) {
    const url = this.AUTH_GAS_URL
      + '?action=adminIssuePassword'
      + '&email=' + encodeURIComponent(email);
    const res = await fetch(url, { redirect: 'follow' });
    return res.json();
  },

  acceptSession(data) {
    if (!data || !data.success || !data.email) return false;
    const email = String(data.email).toLowerCase().trim();
    if (!email.endsWith('@' + this.ALLOWED_DOMAIN)) return false;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      email: email,
      name: (data.name && String(data.name)) || email.split('@')[0],
      savedAt: Date.now()
    }));
    return true;
  },

  saveEmail(email) {
    try { localStorage.setItem(this.EMAIL_KEY, String(email || '').trim()); } catch {}
  },

  getSavedEmail() {
    try { return localStorage.getItem(this.EMAIL_KEY) || ''; } catch { return ''; }
  },

  get() {
    try {
      const raw = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
      if (!raw || !raw.email) return null;
      if (!String(raw.email).toLowerCase().endsWith('@' + this.ALLOWED_DOMAIN)) {
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
