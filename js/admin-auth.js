/**
 * 管理者セッション管理（Google サインイン方式・自動登録対応）
 *
 * 認証フロー:
 *  1. admin-login.html で「Google でサインイン」をクリック
 *  2. 認証GAS の「TCKWorkshop 内の全員」デプロイにリダイレクト
 *  3. Google が tckworkshop.co.jp Workspace 所属を検証（Google レイヤーで強制）
 *  4. GAS が Session.getActiveUser() でメール取得
 *  5. admins シートに無ければ自動追加、あれば既存情報を取得
 *  6. admin.html?#admin_email=...&admin_id=...&admin_name=... にリダイレクト
 *  7. admin.html が hash から取り出して localStorage に保存
 *
 * セキュリティ:
 *  - 「TCKWorkshop 内の全員」設定により、Google レイヤーで Workspace 所属を強制
 *  - GAS 側でも email.endsWith('@tckworkshop.co.jp') を二重検証
 *  - localStorage の email も読み込み時に再チェック
 *  - 8 時間で自動失効
 */
const ADMIN_AUTH = {
  // 認証 GAS の「TCKWorkshop 内の全員」デプロイ URL
  AUTH_GAS_URL: 'https://script.google.com/macros/s/AKfycbwu6uddwmTUEKTOWWLGifyEVUHrzK-3S5WPJEWBCQLecdsZBryMzS3KAmQrRlL5QgLvhw/exec',
  ALLOWED_DOMAIN: 'tckworkshop.co.jp',
  STORAGE_KEY: 'tck_admin',
  SESSION_MS: 8 * 60 * 60 * 1000, // 8 時間

  loginUrl(returnTo) {
    const gasUrl = this.AUTH_GAS_URL + '?action=adminAuth&redirect=' + encodeURIComponent(returnTo);
    // 複数 Google アカウントログイン対策：AccountChooser を経由して
    // ユーザーに tckworkshop アカウントを選択させてから GAS に遷移する。
    // これがないと Google がデフォルトで authuser=0 を使ってしまい、別アカウントで認証されてしまう。
    return 'https://accounts.google.com/AccountChooser?continue=' + encodeURIComponent(gasUrl);
  },

  acceptSession(data) {
    if (!data || !data.email) return false;
    const email = String(data.email).toLowerCase().trim();
    if (!email.endsWith('@' + this.ALLOWED_DOMAIN)) return false;
    const adminId = String(data.adminId || email.split('@')[0]).trim();
    const name = (data.name && String(data.name)) || adminId;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      adminId: adminId,
      email: email,
      name: name,
      savedAt: Date.now()
    }));
    return true;
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
