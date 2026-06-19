/**
 * 管理者セッション管理（@tckworkshop.co.jp 限定）
 *
 * 認証フロー（Google Cloud 不要・GAS のみ）:
 *  1. admin-login.html で「Googleでログイン」をクリック
 *  2. 認証GAS（"Anyone with Google account" デプロイ）に遷移
 *  3. Google が自動ログインを要求 → ログイン後 GAS の doGet が実行
 *  4. GAS が Session.getActiveUser().getEmail() でメール取得
 *  5. ドメインが @tckworkshop.co.jp なら admin.html#admin_email=... に
 *     JS リダイレクト。そうでなければ「アクセス権限なし」HTMLを返す
 *  6. admin.html が URL hash から email を取り出して acceptEmail() で
 *     localStorage に保存
 *
 * セキュリティ:
 *  - GAS デプロイの「Anyone with Google account」設定が Google ログイン強制
 *  - GAS 側で endsWith('@tckworkshop.co.jp') を厳格チェック（攻撃面のメイン）
 *  - localStorage に保存される email も読み込み時に再チェック
 *    （DevTools で他ドメインに改竄しても次のロードでクリアされる）
 *  - リダイレクト先 URL は GAS 側ホワイトリストで制限（オープンリダイレクト防止）
 *  - 8 時間で自動失効
 *
 * 注意:
 *  - GitHub Pages は静的配信のため、最終的な保護はクライアントサイド
 *  - 採点ツール自体は機密データを持たないため、本実装で十分
 *  - 将来サーバーサイド処理を追加する際は GAS 側で email を再検証すること
 */
const ADMIN_AUTH = {
  // ★ 認証 GAS の "Anyone with Google account" デプロイ URL（学生用「Anyone」とは別）
  AUTH_GAS_URL: 'https://script.google.com/macros/s/AKfycbwHRX2qM_Ow2viWMKKrTLsx1TW0B4_bM9NgyzzICQoCVh-F27K_7MnlVTJqErlMmHBU2Q/exec',
  ALLOWED_DOMAIN: 'tckworkshop.co.jp',
  STORAGE_KEY: 'tck_admin',
  SESSION_MS: 8 * 60 * 60 * 1000, // 8 時間

  loginUrl(returnTo) {
    return this.AUTH_GAS_URL + '?action=adminAuth&redirect=' + encodeURIComponent(returnTo);
  },

  acceptEmail(email) {
    email = String(email || '').toLowerCase().trim();
    if (!email || !email.endsWith('@' + this.ALLOWED_DOMAIN)) return false;
    const name = email.split('@')[0];
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
