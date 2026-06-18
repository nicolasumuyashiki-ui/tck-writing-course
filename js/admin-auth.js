/**
 * 管理者セッション管理（@tckworkshop.co.jp 限定）
 *
 * セキュリティ方針:
 *  - Google Identity Services の ID トークン (JWT) を受け取る
 *  - hd クレームが ALLOWED_DOMAIN であることを必須チェック
 *  - email が "@tckworkshop.co.jp" で終わることも追加チェック（二重防御）
 *  - 上記のいずれかが満たされなければ session を保存しない
 *  - localStorage のセッションは 8 時間で自動失効
 *  - 失効時／email ドメイン不一致時は自動でクリアして login へ
 *
 * 注意:
 *  - GitHub Pages は静的配信のため、最終的な保護はクライアントサイド
 *  - 採点ツール自体は機密データを持たないため、本実装で十分
 *  - 将来サーバーサイド処理を追加する際は GAS 側でも hd クレームを検証すること
 */
const ADMIN_AUTH = {
  CLIENT_ID: 'PASTE_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com',
  ALLOWED_DOMAIN: 'tckworkshop.co.jp',
  STORAGE_KEY: 'tck_admin',
  SESSION_MS: 8 * 60 * 60 * 1000, // 8 時間

  decodeJwt(token) {
    try {
      const part = token.split('.')[1];
      const padded = part + '='.repeat((4 - part.length % 4) % 4);
      const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return JSON.parse(new TextDecoder('utf-8').decode(bytes));
    } catch (e) {
      return null;
    }
  },

  acceptCredential(credential) {
    const payload = this.decodeJwt(credential);
    if (!payload) return { ok: false, reason: 'invalid_token' };

    // 二重防御: hd クレーム + email ドメイン両方が tckworkshop.co.jp であること
    if (payload.hd !== this.ALLOWED_DOMAIN) {
      return { ok: false, reason: 'domain' };
    }
    if (!payload.email || !payload.email.toLowerCase().endsWith('@' + this.ALLOWED_DOMAIN)) {
      return { ok: false, reason: 'email_domain' };
    }
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return { ok: false, reason: 'token_expired' };
    }

    const session = {
      email: payload.email,
      name: payload.name || payload.email,
      picture: payload.picture || '',
      savedAt: Date.now()
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    return { ok: true, session };
  },

  get() {
    try {
      const raw = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
      if (!raw) return null;
      // 念のため email ドメインを再チェック (localStorage 改竄対策)
      if (!raw.email || !raw.email.toLowerCase().endsWith('@' + this.ALLOWED_DOMAIN)) {
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
