/**
 * 管理者セッション管理（adminId + password 方式・PR #24 系に復帰）
 *
 * Google サインイン方式は GAS の制約（Workspace 設定／multi-account
 * 取扱／OAuth 未確認警告）により安定運用が難しかったため、確実に動く
 * 手動 ID+password 方式に戻す。
 *
 * セキュリティ:
 *  - admins シートで adminId + password 一致を確認
 *  - 同シートの email 列が @tckworkshop.co.jp ドメインで終わることを
 *    GAS で検証（運用ミス防止 + 漏洩時の被害最小化）
 *  - localStorage の email も読み込み時に再チェック
 *  - 8 時間で自動失効
 */
const ADMIN_AUTH = {
  // 既存の認証 GAS（"Anyone" デプロイ・受講者ログインと同じ URL）
  AUTH_GAS_URL: 'https://script.google.com/macros/s/AKfycbwXSB3bHsGwuFxZKcIsF6PBC332ZUVSQ10tWC7w-dL3YMa2ZLtdFyL50tTJ99EW8T9xag/exec',
  ALLOWED_DOMAIN: 'tckworkshop.co.jp',
  STORAGE_KEY: 'tck_admin',
  SESSION_MS: 8 * 60 * 60 * 1000, // 8 時間

  async login(id, pass) {
    const url = this.AUTH_GAS_URL
      + '?action=adminLogin'
      + '&id=' + encodeURIComponent(id)
      + '&pass=' + encodeURIComponent(pass);
    const res = await fetch(url, { redirect: 'follow' });
    return res.json();
  },

  acceptSession(data) {
    if (!data || !data.success || !data.adminId) return false;
    const adminId = String(data.adminId).trim();
    if (!adminId) return false;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      adminId: adminId,
      name: (data.name && String(data.name)) || adminId,
      savedAt: Date.now()
    }));
    return true;
  },

  get() {
    try {
      const raw = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
      if (!raw || !raw.adminId) return null;
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
