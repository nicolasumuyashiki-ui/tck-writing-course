/**
 * 管理者セッション管理（adminId + password 方式）
 *
 * 認証フロー:
 *  1. admin-login.html で adminId と password を入力
 *  2. 既存の認証GAS（"Anyone" デプロイ）に fetch
 *  3. GAS が admins シートを参照、adminId と password の一致を確認
 *  4. OK なら success + adminId + name を JSON で返す
 *  5. フロントが localStorage に保存して admin.html に遷移
 *
 * 設計判断:
 *  - admin の追加は運営者が admins シートに行追加する形なので、
 *    自動的に「事前承認済み」扱い → ドメイン制限は不要
 *  - 学生用 ログインと同じ ID + password パターンに統一
 */
const ADMIN_AUTH = {
  // 既存の認証 GAS（受講者ログインと同じ "Anyone" デプロイ）
  AUTH_GAS_URL: 'https://script.google.com/macros/s/AKfycbx9ohGwz8pz-tmrvthxWTy5zoEwvq77WonVlivFwQB48bq_VVkiRemmERE41y9PRKeg6w/exec',
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
