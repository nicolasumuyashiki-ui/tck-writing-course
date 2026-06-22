/**
 * 認証 GAS 通信モジュール — ライティング添削講座専用
 * users シートを参照する専用 GAS (JSON 応答) と通信する。
 *  - login:   ID/パスワード認証。成功時に { userId, userName, plan } を返す
 *  - getUser: ID だけで現在の plan を取得（course-home が同期に使う）
 */

const API_URL = 'https://script.google.com/macros/s/AKfycbwXSB3bHsGwuFxZKcIsF6PBC332ZUVSQ10tWC7w-dL3YMa2ZLtdFyL50tTJ99EW8T9xag/exec';

const API = {
  async login(id, pass) {
    const url = `${API_URL}?action=login&id=${encodeURIComponent(id)}&pass=${encodeURIComponent(pass)}`;
    const res = await fetch(url, { redirect: 'follow' });
    return res.json();
  },

  async getUser(id) {
    const url = `${API_URL}?action=getUser&id=${encodeURIComponent(id)}`;
    const res = await fetch(url, { redirect: 'follow' });
    return res.json();
  },

  async issuePassword(email) {
    const url = `${API_URL}?action=issuePassword&email=${encodeURIComponent(email)}`;
    const res = await fetch(url, { redirect: 'follow' });
    return res.json();
  }
};
