
/* ===============================
   食事記録アプリ
   フェーズ3〜9対応（localStorage保存、削除、件数、空チェック、日付/時刻自動）
   =============================== */

(() => {
  const STORAGE_KEY = 'mealRecords_v1';

  // DOM取得（フェーズ2：イベント & 基本）
  const form = document.getElementById('mealForm');
  const dateInput = document.getElementById('date');
  const timeInput = document.getElementById('time');
  const typeInput = document.getElementById('type');
  const nameInput = document.getElementById('name');
  const calInput = document.getElementById('cal');
  const memoInput = document.getElementById('memo');

  const listEl = document.getElementById('list');
  const emptyMsg = document.getElementById('emptyMsg');
  const countEl = document.getElementById('count');
  // const clearAllBtn = document.getElementById('clearAllBtn'); // (発展10用)

  /** ---------- ユーティリティ ---------- */

  // 今日の YYYY-MM-DD, HH:MM を返す（フェーズ9：自動）
  const nowValues = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const HH = String(d.getHours()).padStart(2, '0');
    const MM = String(d.getMinutes()).padStart(2, '0');
    return { date: `${yyyy}-${mm}-${dd}`, time: `${HH}:${MM}` };
  };

  // 保存・読み込み（フェーズ5/6/7：localStorage + JSON.stringify）
  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };
  const save = (arr) => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

  // 配列データ（フェーズ3）
  let records = load();

  /** ---------- 初期表示（フェーズ6/7） ---------- */
  const setDefaultDateTime = () => {
    const { date, time } = nowValues();
    if (!dateInput.value) dateInput.value = date;
    if (!timeInput.value) timeInput.value = time;
  };

  const render = () => {
    listEl.innerHTML = '';

    if (records.length === 0) {
      emptyMsg.style.display = 'block';
      countEl.textContent = '0件';
      return;
    }

    emptyMsg.style.display = 'none';

    // 新しい順（日時降順）
    const sorted = [...records].sort((a, b) => {
      const ad = `${a.date} ${a.time}`;
      const bd = `${b.date} ${b.time}`;
      return bd.localeCompare(ad);
    });

    for (const r of sorted) {
      const li = document.createElement('li');
      li.className = 'item';

      const left = document.createElement('div');

      const title = document.createElement('div');
      title.className = 'title';
      title.textContent = `${r.type}：${r.name}（${r.cal} kcal）`;
      left.appendChild(title);

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = `${r.date} ${r.time} / ID:${r.id}`;
      left.appendChild(meta);

      if (r.memo) {
        const memo = document.createElement('div');
        memo.className = 'memo';
        memo.textContent = `メモ：${r.memo}`;
        left.appendChild(memo);
      }

      const ops = document.createElement('div');
      ops.className = 'ops';

      const delBtn = document.createElement('button');
      delBtn.textContent = '削除';
      delBtn.className = 'danger';
      delBtn.addEventListener('click', () => {
        // フェーズ8：削除→配列更新→保存→再表示
        records = records.filter(x => x.id !== r.id);
        save(records);
        render();
      });

      ops.appendChild(delBtn);

      li.appendChild(left);
      li.appendChild(ops);
      listEl.appendChild(li);
    }

    // フェーズ9：件数表示
    countEl.textContent = `${records.length}件`;
  };

  /** ---------- 追加（フェーズ3/4/7/9） ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // 空入力防止（フェーズ9）
    const name = nameInput.value.trim();
    const calStr = calInput.value.trim();
    const cal = Number(calStr);

    if (!name) {
      alert('メニュー名を入力してください。');
      nameInput.focus();
      return;
    }
    if (calStr === '' || isNaN(cal) || cal < 0) {
      alert('カロリーは0以上の数値で入力してください。');
      calInput.focus();
      return;
    }

    // 入力日時（指定が空なら自動補完）
    const d = dateInput.value || nowValues().date;
    const t = timeInput.value || nowValues().time;

    const rec = {
      id: Date.now(),          // 一意ID
      date: d,
      time: t,
      type: typeInput.value,
      name,
      cal,
      memo: memoInput.value.trim()
    };

    // フェーズ3：配列へ追加
    records.push(rec);

    // フェーズ5/7：保存
    save(records);

    // フェーズ4/7：表示更新
    render();

    // 入力欄リセット（フェーズ3）
    form.reset();
    setDefaultDateTime(); // 日付/時刻を再セット（フェーズ9）
    nameInput.focus();
  });

  // 任意：全削除（発展10の例）
  // clearAllBtn?.addEventListener('click', () => {
  //   if (!confirm('本当にすべて削除しますか？')) return;
  //   records = [];
  //   save(records);
  //   render();
  // });

  // 起動時処理（フェーズ6/7/9）
  setDefaultDateTime();
  render();
})();
