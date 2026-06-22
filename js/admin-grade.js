/**
 * 添削返却ツール — フロントエンドロジック
 *
 * - Claude 用プロンプト（Write an Email / Academic Discussion）を組み立てる
 * - Claude 出力の JSON ブロックを取り込み、編集可能なフォームに展開する
 * - 合算バンドスコアを再計算する
 * - 返却 PDF プレビュー HTML を生成し iframe に流し込む
 * - GAS の returnGrade エンドポイントを叩いて返却メール（PDF添付）を送る
 */

const GAS_RETURN_URL = 'https://script.google.com/macros/s/AKfycbwXSB3bHsGwuFxZKcIsF6PBC332ZUVSQ10tWC7w-dL3YMa2ZLtdFyL50tTJ99EW8T9xag/exec';

const EMAIL_PROMPT_TEMPLATE =
`あなたは TOEFL iBT Writing — Writing for an Academic Discussion とは別の "Write an Email" タスク（最初の Writing 課題）の専属採点者です。受講者 __NAME__ さんの提出メール（Set __SET__）を、ETS 公式ルーブリック（0〜5）に基づいて厳しく・正確に採点してください。

【評価の観点】
- 用件の達成（指示された 3 ポイントを過不足なくカバー）
- レジスター（書き出し / 締めくくり / 全体のトーン）が宛先に対し適切か
- 文法・語彙の正確さと幅（ESL 観点での自然さも含む）
- 文章構成（段落分け / 論理の流れ / つなぎ語）
- メールとしての完結性（件名行・宛名・署名がある／無いの妥当性）

【出力ルール】
- 必ず以下の JSON 形式で、コードブロック内に出力してください。
- "score" は 0.0 から 5.0 まで 0.5 刻みの数値。
- "summary" は受講者宛の総評（120〜220字程度・敬体）。良かった点と改善点を 1〜2 ずつ。
- "corrections" は原文から修正したい箇所を最大 8 つ。1 つ 1 文単位を基本に。
  - "original": 受講者の原文をそのまま
  - "revised":  添削後の自然な英文
  - "comment":  日本語で 1〜2 行・なぜ直したか / 学習ポイント
- "notes" は「次回までに意識して欲しいこと」を 1〜2 個（このタスク = Email 特有の学習ポイントに絞ること）。
  - 各要素は短い日本語の一文（30〜60字目安・敬体・命令形は避ける）。

\`\`\`json
{
  "score": 4.0,
  "summary": "ここに総評（受講者宛・敬体）",
  "corrections": [
    {
      "original": "I want to apply for the room.",
      "revised":  "I would like to apply for the room.",
      "comment":  "would like to を使うとフォーマル度が上がり、依頼メールに適した丁寧さになります。"
    }
  ],
  "notes": [
    "Email では Yours sincerely / Best regards の使い分けに注意して、宛先のフォーマル度に合わせて選びましょう。",
    "Also や And で接続するのは口語寄りなので、In addition / Furthermore など書き言葉のつなぎ語を意識的に使ってみてください。"
  ]
}
\`\`\`

【受講者の答案】
__ANSWER__`;

const AD_PROMPT_TEMPLATE =
`あなたは TOEFL iBT Writing — "Writing for an Academic Discussion" タスク（2 つ目の Writing 課題）の専属採点者です。受講者 __NAME__ さんの提出投稿（Set __SET__）を、ETS 公式ルーブリック（0〜5）に基づいて厳しく・正確に採点してください。

【評価の観点】
- 教授の問いに正面から答えられているか（立場の明確さ）
- 他の 2 人の学生（投稿者）の意見に触れているか／反応しているか
- 主張を支える具体例の質（具体性・関連性）
- 文法・語彙の幅と正確さ（アカデミックなレジスター）
- 100 語以上の十分な長さで、議論として完結しているか

【出力ルール】
- 必ず以下の JSON 形式で、コードブロック内に出力してください。
- "score" は 0.0 から 5.0 まで 0.5 刻みの数値。
- "summary" は受講者宛の総評（120〜220字程度・敬体）。
- "corrections" は最大 8 つ。原文→修正文→コメント（日本語）。
- "notes" は「次回までに意識して欲しいこと」を 1〜2 個（このタスク = Academic Discussion 特有の学習ポイントに絞ること）。
  - 各要素は短い日本語の一文（30〜60字目安・敬体・命令形は避ける）。

\`\`\`json
{
  "score": 3.5,
  "summary": "ここに総評（受講者宛・敬体）",
  "corrections": [
    {
      "original": "I agree with Andrew opinion.",
      "revised":  "I agree with Andrew's opinion.",
      "comment":  "所有格 's が必要です。Andrew that he 〜 のように具体的に何に同意したかを続けると更に説得力が上がります。"
    }
  ],
  "notes": [
    "Academic Discussion では必ず他の学生の意見を 1 度引用してから自分の主張を展開するようにしましょう。",
    "具体例は「いつ・どこで・どのくらい」まで踏み込むと評価が上がります。"
  ]
}
\`\`\`

【受講者の答案（教授の問い・他の学生の投稿も含めて貼り付け）】
__ANSWER__`;

const AdminGrade = (() => {
  /* ---------- state ---------- */
  const state = {
    email: { score: null, summary: '', corrections: [], notes: [] },
    ad:    { score: null, summary: '', corrections: [], notes: [] }
  };

  /* ---------- utils ---------- */
  const $ = id => document.getElementById(id);
  const esc = s => String(s || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const escAttr = s => esc(s);
  const nl2br = s => esc(s).replace(/\n/g,'<br>');

  const showToast = (msg, ms=1800) => {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(()=>t.classList.remove('show'), ms);
  };

  const toggleCollapse = id => {
    const card = $(id);
    if (!card) return;
    card.classList.toggle('is-collapsed');
    const btn = card.querySelector('.collapsible-toggle');
    if (btn) btn.textContent = card.classList.contains('is-collapsed') ? '開く ▼' : '折りたたむ ▲';
  };

  /* ---------- prompt builders ---------- */
  const buildPrompt = type => {
    const name = ($('stuName').value || '＿＿＿').trim();
    const set  = ($('stuSetNo').value || '＿').trim();
    const tpl  = type === 'email' ? EMAIL_PROMPT_TEMPLATE : AD_PROMPT_TEMPLATE;
    return tpl
      .replace(/__NAME__/g, name)
      .replace(/__SET__/g, set)
      .replace(/__ANSWER__/g, '（ここに受講者の答案を貼り付け）');
  };
  const refreshPrompts = () => {
    $('emailPrompt').textContent = buildPrompt('email');
    $('adPrompt').textContent    = buildPrompt('ad');
  };

  const copyPrompt = async type => {
    const text = type === 'email' ? $('emailPrompt').textContent : $('adPrompt').textContent;
    try {
      await navigator.clipboard.writeText(text);
      showToast('プロンプトをコピーしました');
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta);
      ta.select(); document.execCommand('copy'); ta.remove();
      showToast('プロンプトをコピーしました');
    }
  };

  /* ---------- score select ---------- */
  const populateScoreSelect = id => {
    const sel = $(id);
    sel.innerHTML = '';
    for (let v = 0; v <= 5; v += 0.5) {
      const o = document.createElement('option');
      o.value = v.toFixed(1);
      o.textContent = v.toFixed(1);
      sel.appendChild(o);
    }
  };

  /* ---------- JSON extraction ---------- */
  const extractJSON = raw => {
    if (!raw) return null;
    let text = String(raw).trim();
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) text = fence[1].trim();
    // try direct parse
    try { return JSON.parse(text); } catch (_) {}
    // try to find first {...} block
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try { return JSON.parse(m[0]); } catch (_) {}
    }
    return null;
  };

  /* ---------- corrections table ---------- */
  const renderCorrections = type => {
    const tbody = $(type + 'CorrTbody');
    tbody.innerHTML = '';
    state[type].corrections.forEach((c, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td class="num-cell">' + (i+1) + '</td>' +
        '<td><textarea data-k="original">'  + esc(c.original  || '') + '</textarea></td>' +
        '<td><textarea data-k="revised">'   + esc(c.revised   || '') + '</textarea></td>' +
        '<td><textarea data-k="comment">'   + esc(c.comment   || '') + '</textarea></td>' +
        '<td><button type="button" class="del-btn" title="削除">×</button></td>';
      // wire edits
      tr.querySelectorAll('textarea').forEach(ta => {
        ta.addEventListener('input', () => {
          state[type].corrections[i][ta.dataset.k] = ta.value;
        });
      });
      tr.querySelector('.del-btn').addEventListener('click', () => {
        state[type].corrections.splice(i, 1);
        renderCorrections(type);
      });
      tbody.appendChild(tr);
    });
  };

  const addCorrection = type => {
    state[type].corrections.push({ original: '', revised: '', comment: '' });
    renderCorrections(type);
  };

  /* ---------- ingest ---------- */
  const ingest = type => {
    const raw = $(type + 'ClaudeOut').value;
    const data = extractJSON(raw);
    if (!data) {
      showToast('JSON ブロックが見つかりません。出力をそのまま貼り直してください。', 2600);
      return;
    }
    let score = parseFloat(data.score);
    if (!isFinite(score)) score = 0;
    score = Math.max(0, Math.min(5, Math.round(score * 2) / 2));

    state[type].score = score;
    state[type].summary = String(data.summary || '');
    state[type].corrections = Array.isArray(data.corrections)
      ? data.corrections.map(c => ({
          original: String(c.original || ''),
          revised:  String(c.revised  || ''),
          comment:  String(c.comment  || '')
        }))
      : [];
    state[type].notes = Array.isArray(data.notes)
      ? data.notes.map(n => String(n || '').trim()).filter(Boolean)
      : [];

    $(type + 'Parsed').style.display = 'block';
    $(type + 'Score').value = score.toFixed(1);
    $(type + 'Summary').value = state[type].summary;
    renderCorrections(type);
    rebuildNotes();
    recompute();
    showToast('取り込み完了：必要に応じて編集してください');
  };

  /* notes textarea = email.notes + ad.notes を ・ プレフィックスで結合 */
  const rebuildNotes = () => {
    const lines = [].concat(
      state.email.notes.map(n => '・' + n),
      state.ad.notes.map(n => '・' + n)
    );
    if (lines.length) $('notes').value = lines.join('\n');
  };

  const clearIngest = type => {
    $(type + 'ClaudeOut').value = '';
    state[type] = { score: null, summary: '', corrections: [], notes: [] };
    $(type + 'Parsed').style.display = 'none';
    $(type + 'Summary').value = '';
    $(type + 'CorrTbody').innerHTML = '';
    rebuildNotes();
    recompute();
  };

  /* ---------- recompute ---------- */
  const recompute = () => {
    const basRaw = parseInt($('basCorrect').value, 10);
    const bas10 = Math.max(0, Math.min(10, isNaN(basRaw) ? 0 : basRaw));
    const bas5  = bas10 / 2;
    $('basOut').textContent = bas5.toFixed(2);

    // pull current score selects (if visible)
    const emailSel = $('emailScore');
    const adSel    = $('adScore');
    const eVis = $('emailParsed').style.display !== 'none';
    const aVis = $('adParsed').style.display !== 'none';
    const eS = eVis ? parseFloat(emailSel.value) : null;
    const aS = aVis ? parseFloat(adSel.value)    : null;
    if (eS !== null) state.email.score = eS;
    if (aS !== null) state.ad.score    = aS;

    const eOk = state.email.score !== null && !isNaN(state.email.score);
    const aOk = state.ad.score    !== null && !isNaN(state.ad.score);
    const breakdown = $('breakdown');
    const bandNumEl = $('bandNum');
    const bandDescEl= $('bandDesc');

    if (!eOk || !aOk) {
      breakdown.innerHTML = '<span>BAS:</span> <b>' + bas5.toFixed(2) + ' / 5</b><br>' +
                            '<span>Email:</span> <b>' + (eOk ? state.email.score.toFixed(1) : '–') + ' / 5</b><br>' +
                            '<span>AD:</span> <b>'    + (aOk ? state.ad.score.toFixed(1)    : '–') + ' / 5</b><br>' +
                            '<span style="color:#9FB3AA;font-size:11px">Email と AD の両方が入力されると合算バンドが算出されます</span>';
      bandNumEl.textContent = '–';
      bandDescEl.textContent = 'Email・AD 待ち';
      return;
    }
    const avg = (bas5 + state.email.score + state.ad.score) / 3;
    let band = avg + 1; // 0〜5 平均 + 1 → 1〜6
    band = Math.round(band * 2) / 2;
    band = Math.max(1, Math.min(6, band));

    breakdown.innerHTML =
      '<span>BAS:</span> <b>' + bas5.toFixed(2) + ' / 5</b>　（' + bas10 + '/10 正答）<br>' +
      '<span>Write an Email:</span> <b>' + state.email.score.toFixed(1) + ' / 5</b><br>' +
      '<span>Academic Discussion:</span> <b>' + state.ad.score.toFixed(1) + ' / 5</b><br>' +
      '<span>3 タスク平均:</span> <b>' + avg.toFixed(2) + ' / 5</b><br>' +
      '<span>計算式:</span> <b>平均 + 1 → 0.5 刻みで四捨五入</b>';
    bandNumEl.textContent = band.toFixed(1);
    bandDescEl.textContent = describeBand(band);
  };

  const describeBand = b => {
    if (b >= 5.5) return '卓越（C1 上位レベル）';
    if (b >= 5.0) return '優秀（B2/C1 境界）';
    if (b >= 4.5) return '良好（B2 上位レベル）';
    if (b >= 4.0) return '良好（B2 レベル）';
    if (b >= 3.5) return '中位（B1 上位レベル）';
    if (b >= 3.0) return '中位（B1 レベル）';
    if (b >= 2.5) return '基礎（A2 上位レベル）';
    return '基礎（A2 以下）';
  };

  /* ---------- preview HTML ---------- */
  const buildPreviewHTML = () => {
    const name  = $('stuName').value.trim() || '（受講者名）';
    const setNo = $('stuSetNo').value.trim() || '–';
    const dateS = $('stuSubmitDate').value.trim() || todayStr();
    const dateR = todayStr();
    const adminName = (window.ADMIN && (ADMIN.name || ADMIN.id)) || 'TCK Workshop';

    const basRaw = parseInt($('basCorrect').value, 10);
    const bas10  = Math.max(0, Math.min(10, isNaN(basRaw) ? 0 : basRaw));
    const bas5   = bas10 / 2;
    const eS = state.email.score || 0;
    const aS = state.ad.score    || 0;
    const avg = (bas5 + eS + aS) / 3;
    let band = avg + 1;
    band = Math.max(1, Math.min(6, Math.round(band * 2) / 2));
    const bandDesc = describeBand(band);

    const notes = $('notes').value.trim();
    const emailSummary = ($('emailSummary').value || state.email.summary || '').trim();
    const adSummary    = ($('adSummary').value    || state.ad.summary    || '').trim();

    const renderCorrTable = (corrs, label) => {
      if (!corrs || !corrs.length) return '';
      const rows = corrs.map((c, i) =>
        '<tr>' +
          '<td class="num-cell">' + (i+1) + '</td>' +
          '<td class="orig">' + nl2br(c.original) + '</td>' +
          '<td class="revd">' + nl2br(c.revised)  + '</td>' +
          '<td class="cmt">'  + nl2br(c.comment)  + '</td>' +
        '</tr>'
      ).join('');
      return (
        '<table class="corr-table">' +
          '<thead><tr><th>#</th><th>原文</th><th>修正文</th><th>添削コメント</th></tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>'
      );
    };

    const notesHTML = notes
      ? '<ul class="notes-list">' + notes.split(/\n+/).map(l => l.replace(/^[・\-•\s]+/, '').trim()).filter(Boolean).map(l => '<li>' + esc(l) + '</li>').join('') + '</ul>'
      : '<p style="color:#5A6861;font-size:12px">（記入なし）</p>';

    return (
'<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>添削結果</title>' +
'<style>' +
':root{--green:#007646;--green-dark:#004D2E;--green-deep:#002817;--gold:#C9A961;--cream:#FBF6EC;--paper:#F5E9D3;--ink-900:#0F1511;--ink-500:#5A6861;}' +
'*{margin:0;padding:0;box-sizing:border-box;}' +
'html,body{background:#e8e8e3;font-family:"Manrope","Noto Sans JP",sans-serif;color:var(--ink-900);}' +
'@page{size:A4;margin:0;}@media print{html,body{background:#fff;}}' +
'.page{width:210mm;height:297mm;margin:24px auto;padding:18mm 18mm 22mm;background:#fff;box-shadow:0 8px 32px rgba(0,40,23,.12);position:relative;display:flex;flex-direction:column;overflow:hidden;page-break-after:always;}' +
'.score-table,.feedback-block,.notes-card,.corr-table,.calc-box,.student-card,.band-result{page-break-inside:avoid;break-inside:avoid;}' +
'.page:last-child{page-break-after:avoid;}' +
'.page-header{display:flex;align-items:center;gap:10px;padding-bottom:10px;border-bottom:1px solid var(--paper);margin-bottom:14px;flex-shrink:0;}' +
'.page-header .brand{font-size:11px;letter-spacing:.14em;color:var(--green);font-weight:800;text-transform:uppercase;}' +
'.page-header .meta{margin-left:auto;font-size:11px;color:var(--ink-500);}' +
'.page-footer{position:absolute;bottom:10mm;left:18mm;right:18mm;padding-top:6px;border-top:1px solid var(--paper);font-size:9px;color:#8a8f8c;display:flex;justify-content:space-between;}' +
'.cover{flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;}' +
'.cover .kicker{font-size:13px;letter-spacing:.18em;color:var(--gold);font-weight:800;text-transform:uppercase;margin-bottom:12px;}' +
'.cover h1{font-size:30px;font-weight:700;color:var(--green-deep);margin-bottom:6px;line-height:1.3;}' +
'.cover .subtitle{font-size:13px;color:var(--ink-500);margin-bottom:40px;}' +
'.student-card{background:var(--cream);border:1px solid var(--paper);border-radius:14px;padding:20px 30px;margin-bottom:36px;min-width:320px;}' +
'.student-card .row{display:flex;justify-content:space-between;gap:24px;padding:5px 0;font-size:13px;}' +
'.student-card .row .label{color:var(--ink-500);}.student-card .row .value{color:var(--green-deep);font-weight:600;}' +
'.band-result{background:linear-gradient(135deg,var(--green-deep),var(--green-dark));color:#fff;border-radius:18px;padding:28px 52px;text-align:center;box-shadow:0 8px 26px rgba(0,40,23,.18);}' +
'.band-result .label{font-size:11px;letter-spacing:.18em;font-weight:700;color:var(--gold);text-transform:uppercase;margin-bottom:8px;}' +
'.band-result .number{display:flex;align-items:baseline;justify-content:center;gap:6px;}' +
'.band-result .number .big{font-size:82px;font-weight:800;line-height:1;font-family:"Manrope",sans-serif;}' +
'.band-result .number .of{font-size:22px;color:rgba(255,255,255,.65);font-weight:600;}' +
'.band-result .desc{font-size:12px;color:rgba(255,255,255,.85);margin-top:6px;}' +
'.section-title{font-size:16px;font-weight:700;color:var(--green-deep);border-bottom:2px solid var(--green);padding-bottom:5px;margin-bottom:14px;display:flex;align-items:center;gap:10px;}' +
'.section-title .num{background:var(--green);color:#fff;width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;}' +
'.score-table{width:100%;border-collapse:collapse;margin-bottom:14px;font-size:12.5px;}' +
'.score-table th{background:var(--cream);color:var(--green);padding:10px 12px;text-align:left;font-weight:700;font-size:11px;letter-spacing:.04em;border-bottom:1px solid var(--paper);}' +
'.score-table td{padding:11px 12px;border-bottom:1px solid var(--paper);}' +
'.score-table tr:last-child td{border-bottom:none;}' +
'.score-table .task{font-weight:700;color:var(--green-deep);}' +
'.score-table .raw{color:var(--ink-500);font-size:11px;}' +
'.score-table .conv{font-weight:700;color:var(--green);text-align:right;}' +
'.score-table tr.total{background:var(--cream);}.score-table tr.total td{padding:12px;font-weight:700;color:var(--green-deep);}' +
'.calc-box{background:#FDF7E8;border-left:4px solid var(--gold);border-radius:6px;padding:12px 14px;margin-bottom:18px;font-size:11.5px;line-height:1.75;color:#5A4A1E;}' +
'.calc-box b{color:var(--green-deep);}' +
'.calc-box code{background:#fff;padding:1px 5px;border-radius:4px;font-size:11px;color:var(--green-deep);font-family:"Manrope","SF Mono",Consolas,monospace;}' +
'.feedback-block{background:var(--cream);border-radius:10px;padding:16px 20px;margin-bottom:12px;}' +
'.feedback-block h3{font-size:12.5px;font-weight:700;color:var(--green);margin-bottom:4px;letter-spacing:.04em;}' +
'.feedback-block .sub{font-size:11px;color:var(--ink-500);margin-bottom:8px;}' +
'.feedback-block .body{font-size:12px;color:var(--ink-900);line-height:1.85;white-space:pre-wrap;}' +
'.corr-table{width:100%;border-collapse:collapse;font-size:11.5px;margin-top:8px;margin-bottom:14px;background:#fff;border:1px solid var(--paper);border-radius:8px;overflow:hidden;}' +
'.corr-table th{background:var(--green-deep);color:#fff;padding:8px 10px;text-align:left;font-weight:700;font-size:11px;letter-spacing:.04em;}' +
'.corr-table th:first-child{width:32px;text-align:center;}' +
'.corr-table td{padding:9px 10px;border-bottom:1px solid #ECE1CB;vertical-align:top;line-height:1.6;}' +
'.corr-table tr:last-child td{border-bottom:none;}' +
'.corr-table td.num-cell{text-align:center;font-weight:700;color:var(--ink-500);}' +
'.corr-table td.orig{color:#7A2E1A;}.corr-table td.revd{color:#0E5530;font-weight:600;}.corr-table td.cmt{color:var(--ink-900);font-size:11px;}' +
'.notes-card{background:linear-gradient(135deg,#FBF6EC,#fff);border:1px solid var(--paper);border-radius:12px;padding:16px 20px;margin-top:18px;}' +
'.notes-card h3{font-size:13px;font-weight:700;color:var(--green);margin-bottom:8px;}' +
'.notes-list{padding-left:18px;font-size:12px;line-height:1.85;color:var(--ink-900);}' +
'.notes-list li{margin-bottom:3px;}' +
'.signoff{margin-top:22px;text-align:right;font-size:11.5px;color:var(--ink-500);line-height:1.7;}' +
'.signoff b{color:var(--green-deep);}' +
'</style></head><body>' +

  '<div class="page">' +
    '<div class="page-header"><span class="brand">TCK Workshop ライティング添削コース</span><span class="meta">添削結果 / RETURN</span></div>' +
    '<div class="cover">' +
      '<div class="kicker">Writing Feedback</div>' +
      '<h1>ライティング添削結果</h1>' +
      '<p class="subtitle">TOEFL iBT&reg; テスト Writing 対策</p>' +
      '<div class="student-card">' +
        '<div class="row"><span class="label">受講者</span><span class="value">' + esc(name) + ' 様</span></div>' +
        '<div class="row"><span class="label">セット</span><span class="value">Practice Set ' + esc(setNo) + '</span></div>' +
        '<div class="row"><span class="label">提出日</span><span class="value">' + esc(dateS) + '</span></div>' +
        '<div class="row"><span class="label">返却日</span><span class="value">' + esc(dateR) + '</span></div>' +
        '<div class="row"><span class="label">担当講師</span><span class="value">' + esc(adminName) + ' (TCK Workshop)</span></div>' +
      '</div>' +
      '<div class="band-result">' +
        '<div class="label">合算バンドスコア</div>' +
        '<div class="number"><span class="big">' + band.toFixed(1) + '</span><span class="of">/ 6.0</span></div>' +
        '<div class="desc">' + esc(bandDesc) + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="page-footer"><div>TOEFL および TOEFL iBT は ETS の登録商標です。本教材は ETS の承認・推奨を受けたものではありません。</div><div>1 / 4</div></div>' +
  '</div>' +

  '<div class="page">' +
    '<div class="page-header"><span class="brand">TCK Workshop ライティング添削コース</span><span class="meta">Set ' + esc(setNo) + ' / ' + esc(name) + ' 様</span></div>' +
    '<div class="section-title"><span class="num">1</span>各タスクの素点</div>' +
    '<table class="score-table"><thead><tr><th style="width:38%">タスク</th><th style="width:32%">素点</th><th style="width:30%;text-align:right">0〜5 換算</th></tr></thead><tbody>' +
      '<tr><td><span class="task">Build a Sentence</span><br><span class="raw">並べ替え 10 問・自動採点</span></td>' +
        '<td><b>' + bas10 + ' / 10</b><span class="raw"> （正答数）</span></td>' +
        '<td class="conv">' + bas5.toFixed(2) + ' / 5</td></tr>' +
      '<tr><td><span class="task">Write an Email</span><br><span class="raw">ETS Rubric 0〜5</span></td>' +
        '<td><b>' + eS.toFixed(1) + ' / 5</b></td>' +
        '<td class="conv">' + eS.toFixed(2) + ' / 5</td></tr>' +
      '<tr><td><span class="task">Academic Discussion</span><br><span class="raw">ETS Rubric 0〜5</span></td>' +
        '<td><b>' + aS.toFixed(1) + ' / 5</b></td>' +
        '<td class="conv">' + aS.toFixed(2) + ' / 5</td></tr>' +
      '<tr class="total"><td>3 タスク平均</td><td>—</td><td class="conv">' + avg.toFixed(2) + ' / 5</td></tr>' +
    '</tbody></table>' +
    '<div class="calc-box"><b>計算式（同梱の「採点基準と計算方法 PDF」もご参照ください）：</b><br>' +
      'バンドスコア = <code>平均（0〜5） + 1</code> を 0.5 刻みで四捨五入 → <b>' + band.toFixed(1) + ' / 6.0</b></div>' +

    '<div class="section-title"><span class="num">2</span>総評</div>' +
    '<div class="feedback-block"><h3>WRITE AN EMAIL</h3><div class="sub">' + eS.toFixed(1) + ' / 5</div><div class="body">' + esc(emailSummary || '（総評未入力）') + '</div></div>' +
    '<div class="feedback-block"><h3>ACADEMIC DISCUSSION</h3><div class="sub">' + aS.toFixed(1) + ' / 5</div><div class="body">' + esc(adSummary || '（総評未入力）') + '</div></div>' +

    '<div class="page-footer"><div>TOEFL および TOEFL iBT は ETS の登録商標です。本教材は ETS の承認・推奨を受けたものではありません。</div><div>2 / 4</div></div>' +
  '</div>' +

  '<div class="page">' +
    '<div class="page-header"><span class="brand">TCK Workshop ライティング添削コース</span><span class="meta">Set ' + esc(setNo) + ' / ' + esc(name) + ' 様</span></div>' +
    '<div class="section-title"><span class="num">3</span>原文と添削コメント — Write an Email</div>' +
    (renderCorrTable(state.email.corrections, 'email') || '<p style="color:#5A6861;font-size:11.5px;margin-bottom:14px">添削対象の文がありません。</p>') +

    '<div class="page-footer"><div>TOEFL および TOEFL iBT は ETS の登録商標です。本教材は ETS の承認・推奨を受けたものではありません。</div><div>3 / 4</div></div>' +
  '</div>' +

  '<div class="page">' +
    '<div class="page-header"><span class="brand">TCK Workshop ライティング添削コース</span><span class="meta">Set ' + esc(setNo) + ' / ' + esc(name) + ' 様</span></div>' +
    '<div class="section-title"><span class="num">4</span>原文と添削コメント — Academic Discussion</div>' +
    (renderCorrTable(state.ad.corrections, 'ad') || '<p style="color:#5A6861;font-size:11.5px;margin-bottom:14px">添削対象の文がありません。</p>') +

    '<div class="section-title" style="margin-top:14px"><span class="num">5</span>次回までに意識すること</div>' +
    '<div class="notes-card"><h3>注意ポイント</h3>' + notesHTML + '</div>' +

    '<div class="signoff">引き続きお取組みをお待ちしております。<br><b>TCK Workshop ライティング添削コース</b> / 担当：' + esc(adminName) + '</div>' +

    '<div class="page-footer"><div>TOEFL および TOEFL iBT は ETS の登録商標です。本教材は ETS の承認・推奨を受けたものではありません。</div><div>4 / 4</div></div>' +
  '</div>' +

'</body></html>'
    );
  };

  const todayStr = () => {
    const d = new Date();
    return d.getFullYear() + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + String(d.getDate()).padStart(2,'0');
  };

  /* ---------- preview modal ---------- */
  const openPreview = () => {
    // sync summaries back into state in case user edited
    state.email.summary = $('emailSummary').value || state.email.summary;
    state.ad.summary    = $('adSummary').value    || state.ad.summary;
    const html = buildPreviewHTML();
    const f = $('previewFrame');
    f.srcdoc = html;
    $('previewModal').classList.add('show');
  };
  const closePreview = () => $('previewModal').classList.remove('show');

  /* ---------- send ---------- */
  const sendReturnMail = async () => {
    const to = $('stuEmailTo').value.trim();
    if (!to) { showToast('宛先メール (To) を入力してください', 2600); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) { showToast('宛先メールアドレスの形式を確認してください', 2600); return; }
    if (state.email.score === null || state.ad.score === null) {
      if (!confirm('Email または AD のスコアが入力されていません。このまま送信しますか？')) return;
    }
    if (!confirm(to + ' 宛に返却メールを送信します。よろしいですか？')) return;

    const btn = $('sendBtn');
    btn.disabled = true;
    btn.textContent = '送信中…';

    const payload = {
      action: 'returnGrade',
      to: to,
      cc:  $('stuEmailCc').value.trim(),
      studentName: $('stuName').value.trim(),
      setNo: $('stuSetNo').value.trim(),
      submitDate: $('stuSubmitDate').value.trim() || todayStr(),
      returnDate: todayStr(),
      adminName: (window.ADMIN && (ADMIN.name || ADMIN.id)) || '',
      bas: parseInt($('basCorrect').value, 10) || 0,
      emailScore: state.email.score,
      adScore:    state.ad.score,
      emailSummary: $('emailSummary').value || '',
      adSummary:    $('adSummary').value    || '',
      emailCorrections: state.email.corrections,
      adCorrections:    state.ad.corrections,
      notes: $('notes').value || '',
      html: buildPreviewHTML()
    };

    try {
      const form = new URLSearchParams();
      Object.keys(payload).forEach(k => {
        const v = payload[k];
        form.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
      });
      const res = await fetch(GAS_RETURN_URL, { method:'POST', body: form });
      const json = await res.json();
      if (json && json.success) {
        showToast('返却メールを送信しました', 2600);
        closePreview();
      } else {
        alert('送信に失敗しました：' + (json && json.error ? json.error : '不明なエラー'));
      }
    } catch (e) {
      alert('通信エラーが発生しました：' + e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = '📧 返却メールを送信';
    }
  };

  /* ---------- reset ---------- */
  const resetAll = () => {
    if (!confirm('入力中のすべての内容をクリアします。よろしいですか？')) return;
    ['stuName','stuEmailTo','stuSetNo','stuSubmitDate','emailClaudeOut','adClaudeOut','emailSummary','adSummary','notes'].forEach(id => { const el = $(id); if (el) el.value = ''; });
    $('basCorrect').value = 0;
    state.email = { score:null, summary:'', corrections:[], notes:[] };
    state.ad    = { score:null, summary:'', corrections:[], notes:[] };
    $('emailParsed').style.display = 'none';
    $('adParsed').style.display    = 'none';
    $('emailCorrTbody').innerHTML  = '';
    $('adCorrTbody').innerHTML     = '';
    refreshPrompts();
    recompute();
    showToast('クリアしました');
  };

  /* ---------- init ---------- */
  const init = () => {
    populateScoreSelect('emailScore');
    populateScoreSelect('adScore');
    refreshPrompts();

    // refresh prompts when name or set changes
    ['stuName','stuSetNo'].forEach(id => {
      $(id).addEventListener('input', refreshPrompts);
    });

    recompute();
  };

  return {
    init, copyPrompt, ingest, clearIngest, addCorrection,
    recompute, openPreview, closePreview, sendReturnMail,
    resetAll, toggleCollapse, showToast
  };
})();

// expose function-style names that admin.html calls inline
const copyPrompt    = AdminGrade.copyPrompt;
const ingest        = AdminGrade.ingest;
const clearIngest   = AdminGrade.clearIngest;
const addCorrection = AdminGrade.addCorrection;
const recompute     = AdminGrade.recompute;
const openPreview   = AdminGrade.openPreview;
const closePreview  = AdminGrade.closePreview;
const sendReturnMail= AdminGrade.sendReturnMail;
const resetAll      = AdminGrade.resetAll;
const toggleCollapse= AdminGrade.toggleCollapse;
