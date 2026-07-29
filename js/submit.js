/* =====================================================================
   TOEFL Writing 添削講座 — 提出モジュール
   答案を GAS（サーバー側）へ送信する。GAS が PDF を生成して
   writing2026@tckworkshop.co.jp へメール送信する。
   GitHub Pages の静的HTML単体ではメール送信できないため、この方式を使う
   （既存の録音アップロードと同じ iframe-POST 方式）。
   ▼▼ デプロイ後、下の URL を「自分のGASウェブアプリURL」に差し替える ▼▼
   ===================================================================== */
const SUBMIT_GAS_URL = 'https://script.google.com/macros/s/AKfycbwtgXCg8GMDR95wDwmCBvya3x5vPOgEeC5tTeqzIPzVc642qVL4ZNbFeCqMa3KoDViy/exec';

const Submit = {
  /**
   * 答案を GAS へ送る。
   *
   * 送信方式について:
   *   GAS の /exec は 302 リダイレクトを返し、そのリダイレクト応答には
   *   CORS ヘッダーが付かない。そのため通常の fetch では応答を読めず必ず例外に
   *   なるが、リクエスト自体は GAS に届いて処理されている。
   *   これを「失敗」と解釈して iframe で送り直していたため、同じ答案が
   *   二重に提出され、講師側に重複したメールが届いていた。
   *
   *   no-cors なら応答は読めないものの例外にはならず、送信は 1 回で済む。
   *   通信断など本当に送れなかった場合だけ reject するので、
   *   「届いていないのに提出済みと表示される」取りこぼしも防げる。
   */
  send: function(payload){
    if(!SUBMIT_GAS_URL || SUBMIT_GAS_URL.indexOf('PASTE_') === 0){
      return Promise.resolve({ success:false, notConfigured:true });
    }
    /* オフラインが分かっている場合は送らずに失敗を返す。
       送ってしまうと「成功」と表示されたまま答案が失われる。 */
    if (navigator.onLine === false){
      return Promise.resolve({ success:false, offline:true });
    }

    var body = new URLSearchParams();
    Object.keys(payload).forEach(function(k){
      body.append(k, (payload[k] == null) ? '' : String(payload[k]));
    });

    /* URLSearchParams を body にすると Content-Type が
       application/x-www-form-urlencoded になり、no-cors でも送れる単純リクエストと
       して扱われる。GAS 側は e.parameter で今までどおり受け取れるため、
       サーバー側の変更は不要。 */
    return fetch(SUBMIT_GAS_URL, { method:'POST', mode:'no-cors', body: body })
      .then(function(){ return { success:true }; })
      .catch(function(e){ return { success:false, error:String(e && e.message || e) }; });
  },

  /* localStorage に保存された 1 セット分の答案を組み立てて返す */
  collectPayload: function(setNumber){
    var user = {};
    try { user = JSON.parse(localStorage.getItem('tck_writing_user') || '{}') || {}; } catch(e){}
    var k = 'course_set' + setNumber + '_';
    var emailMeta = {}, adMeta = {};
    try { emailMeta = JSON.parse(localStorage.getItem(k + 'email_meta') || '{}'); } catch(e){}
    try { adMeta = JSON.parse(localStorage.getItem(k + 'ad_meta') || '{}'); } catch(e){}
    return {
      action:     'submitWriting',
      userName:   user.name || user.userName || '',
      userId:     user.id || user.userId || '',
      userEmail:  user.email || '',
      setNumber:  String(setNumber),
      basCorrect: localStorage.getItem(k + 'sentence_correct') || '0',
      basTotal:   localStorage.getItem(k + 'sentence_total') || '10',
      emailSubject: emailMeta.subject || '',
      emailScenario: emailMeta.scenario || '',
      emailAnswer:  localStorage.getItem(k + 'email_response') || '',
      adField:    adMeta.field || '',
      adPrompt:   adMeta.profPost || '',
      adAnswer:   localStorage.getItem(k + 'ad_response') || '',
      timestamp:  new Date().toISOString()
    };
  }
};
