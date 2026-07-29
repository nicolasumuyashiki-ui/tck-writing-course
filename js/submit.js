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
   * 送信結果の判定について:
   *   以前は非表示 iframe に form を POST し、iframe の load を「成功」とみなしていた。
   *   しかし iframe はクロスオリジンのため中身を読めず、回線断・サーバーエラー・
   *   権限エラーのいずれでも load は発火する。つまり「届いていないのに成功」と
   *   判定され、受講者には「提出済み」と表示されたまま答案が講師に届かない。
   *   実際にこれが原因で提出が失われた事例が発生した。
   *
   *   そこで応答を実際に読める fetch を主経路にする。fetch なら
   *   通信失敗は reject、サーバーエラーは res.ok=false として確実に検出できる。
   *   fetch が使えない環境（CORS 不許可など）に備え、従来の iframe 送信を
   *   フォールバックとして残す。その場合は届いたか確認できないため
   *   verified:false を返し、呼び出し側で注意表示できるようにする。
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

    var self = this;
    /* URLSearchParams を body にすると Content-Type が
       application/x-www-form-urlencoded になり、プリフライトなしの単純リクエストと
       して扱われる。GAS 側は e.parameter で今までどおり受け取れるため、
       サーバー側の変更は不要。 */
    return fetch(SUBMIT_GAS_URL, { method:'POST', body: body, redirect:'follow' })
      .then(function(res){
        if (!res.ok) return { success:false, status: res.status };
        return { success:true, verified:true };
      })
      .catch(function(){
        /* ここに来るのは通信断か、応答を読めなかった場合。
           後者では既にサーバー側で処理済みの可能性があるため、
           取りこぼしを避けて従来方式でもう一度だけ送る。 */
        return self._sendViaIframe(body);
      });
  },

  /* 応答を読めない環境向けのフォールバック送信（届いたかは確認できない） */
  _sendViaIframe: function(body){
    return new Promise(function(resolve){
      var name = 'tckSubmit_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
      var iframe = document.createElement('iframe');
      iframe.name = name; iframe.style.display = 'none';
      document.body.appendChild(iframe);
      var form = document.createElement('form');
      form.method = 'POST'; form.action = SUBMIT_GAS_URL; form.target = name;
      form.acceptCharset = 'UTF-8'; form.style.display = 'none';
      body.forEach(function(v, k){
        var inp = document.createElement('input');
        inp.type = 'hidden'; inp.name = k; inp.value = v;
        form.appendChild(inp);
      });
      document.body.appendChild(form);
      var done = false;
      function cleanup(r){
        /* 応答を受け取り切る前に iframe を消すと遅い回線で送信が中断されるため、
           後片付けは十分に間をおいてから行う。 */
        if(done) return; done = true;
        setTimeout(function(){ try{ form.remove(); iframe.remove(); }catch(e){} }, 2000);
        resolve(r);
      }
      iframe.onload = function(){ cleanup({ success:true, verified:false }); };
      setTimeout(function(){ cleanup({ success:false, timeout:true }); }, 30000);
      try { form.submit(); }
      catch(e){ cleanup({ success:false, error:String(e) }); }
    });
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
