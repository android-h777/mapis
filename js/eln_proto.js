/* MAPIS ELN 프로토타입 전용 동작 — 합칠 때 이 파일 = ELN이 추가한 JS 전부. */
(function () {
  'use strict';
  window.ELN = window.ELN || {};

  /* ── TaskA0: 액션 인프라(토스트·모달) — 모든 버튼 액션이 재사용 ── */

  // 토스트: ELN.toast('메시지', 'info'|'ok'|'warn'|'err')
  window.ELN.toast = function (msg, type) {
    type = type || 'info';
    var wrap = document.getElementById('elnToastWrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'elnToastWrap';
      wrap.className = 'elnToastWrap';
      document.body.appendChild(wrap);
    }
    var icons = { info: 'info', ok: 'check_circle', warn: 'warning', err: 'error' };
    var t = document.createElement('div');
    t.className = 'elnToast ' + type;
    var ic = document.createElement('i');
    ic.className = 'material-symbols-outlined';
    ic.textContent = icons[type] || 'info';
    var sp = document.createElement('span');
    sp.textContent = msg;
    t.appendChild(ic); t.appendChild(sp);
    wrap.appendChild(t);
    setTimeout(function () {
      t.classList.add('fade');
      setTimeout(function () { t.remove(); }, 260);
    }, 2400);
  };

  // 모달: ELN.modal({title, icon, body(HTMLElement|string), actions:[{label,type,onClick}]})
  // body가 문자열이면 textContent로 안전 삽입, HTMLElement면 그대로 append(XSS 방지).
  window.ELN.modal = function (opts) {
    opts = opts || {};
    var back = document.createElement('div');
    back.className = 'elnModalBack';
    var modal = document.createElement('div');
    modal.className = 'elnModal';

    var head = document.createElement('div');
    head.className = 'elnModalHead';
    if (opts.icon) {
      var hi = document.createElement('i');
      hi.className = 'material-symbols-outlined';
      hi.textContent = opts.icon;
      head.appendChild(hi);
    }
    var htit = document.createElement('span');
    htit.textContent = opts.title || '';
    head.appendChild(htit);
    var xbtn = document.createElement('button');
    xbtn.className = 'x'; xbtn.type = 'button'; xbtn.textContent = '×';
    head.appendChild(xbtn);

    var body = document.createElement('div');
    body.className = 'elnModalBody';
    if (typeof opts.body === 'string') body.textContent = opts.body;
    else if (opts.body) body.appendChild(opts.body);

    var foot = document.createElement('div');
    foot.className = 'elnModalFoot';

    function close() { back.remove(); }
    xbtn.addEventListener('click', close);
    back.addEventListener('click', function (e) { if (e.target === back) close(); });

    (opts.actions || [{ label: 'Close', type: '' }]).forEach(function (a) {
      var b = document.createElement('a');
      b.href = 'javascript:;';
      b.className = 'waves-effect waves-light hBtn ' + (a.type || '');
      var lab = document.createElement('span');
      lab.className = 'label'; lab.textContent = a.label;
      b.appendChild(lab);
      b.addEventListener('click', function () {
        var keep = a.onClick && a.onClick();
        if (!keep) close();
      });
      foot.appendChild(b);
    });

    modal.appendChild(head); modal.appendChild(body); modal.appendChild(foot);
    back.appendChild(modal);
    document.body.appendChild(back);
    return { close: close, body: body };
  };

  // 팝오버: ELN.popover({anchor, content(HTMLElement), width}) — 누른 자리에 뜨는 경량 선택 UI(모달 대체).
  // 앵커 아래 기본, 화면 아래로 넘치면 위로 뒤집기. 바깥 클릭/ESC로 닫힘.
  window.ELN.popover = function (opts) {
    document.querySelectorAll('.elnPopover').forEach(function (p) { p.remove(); }); // 한 번에 하나만
    var pop = document.createElement('div');
    pop.className = 'elnPopover';
    if (opts.width) pop.style.width = (opts.width + 12) + 'px';
    pop.appendChild(opts.content);
    document.body.appendChild(pop);
    var r = opts.anchor.getBoundingClientRect();
    var x = Math.min(Math.max(8, r.left), window.innerWidth - pop.offsetWidth - 8);
    var y = r.bottom + 6;
    if (y + pop.offsetHeight > window.innerHeight - 8) y = Math.max(8, r.top - pop.offsetHeight - 6);
    pop.style.left = x + 'px'; pop.style.top = y + 'px';
    function close() {
      pop.remove();
      document.removeEventListener('mousedown', onDoc, true);
      document.removeEventListener('keydown', onKey, true);
    }
    function onDoc(e) { if (!pop.contains(e.target)) close(); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    // 픽커를 연 클릭 자체가 바로 닫아버리지 않도록 다음 틱에 등록
    setTimeout(function () {
      document.addEventListener('mousedown', onDoc, true);
      document.addEventListener('keydown', onKey, true);
    }, 0);
    return { close: close, el: pop };
  };

  /* ── Task3: status 칩 + 드롭다운 (헤더→Overview 본문으로 이동) ── */
  // 4-버튼 세그먼트 → 단일 상태 칩. 클릭 시 ELN.popover로 4개 옵션 펼침(노트북 픽커와 동일 패턴).
  var STATUS_ORDER = ['ing', 'ok', 'fail', 'hold'];

  function applyStatusChip(chip, st) {
    chip.setAttribute('data-status', st);
    var lb = chip.querySelector('.elnStatusLabel');
    if (lb) lb.textContent = STATUS_LABEL[st] || st;
  }

  function openStatusPicker(chip) {
    var cur = chip.getAttribute('data-status');
    var menu = document.createElement('div');
    menu.className = 'elnStatusMenu';
    STATUS_ORDER.forEach(function (st) {
      var it = document.createElement('div');
      it.className = 'elnStatusMenuItem';
      it.setAttribute('data-status', st);
      var dot = document.createElement('span'); dot.className = 'dot';
      var nm = document.createElement('span'); nm.textContent = STATUS_LABEL[st] || st;
      it.appendChild(dot); it.appendChild(nm);
      if (st === cur) {
        var chk = document.createElement('i');
        chk.className = 'material-symbols-outlined chk'; chk.textContent = 'check';
        it.appendChild(chk);
      }
      it.addEventListener('click', function () {
        ref.close();
        if (st === cur) return;
        applyStatusChip(chip, st);
        window.ELN.onStatusChange && window.ELN.onStatusChange(st); // 우측 패널 연동(Task4)
        window.ELN.onStatusToast && window.ELN.onStatusToast(st);   // 토스트(TaskA0)
      });
      menu.appendChild(it);
    });
    var ref = ELN.popover({ anchor: chip, content: menu });
  }

  function initStatusSeg() {
    var chip = document.getElementById('elnStatus');
    if (!chip) return;
    chip.addEventListener('click', function () { openStatusPicker(chip); });
  }
  document.addEventListener('DOMContentLoaded', initStatusSeg);

  /* ── TaskA0: 기본 버튼 액션 연결(Save) + status 변경 토스트 ── */
  var STATUS_LABEL = { ing: 'In Progress', ok: 'Success', fail: 'Failed', hold: 'On Hold' };

  function initBaseActions() {
    var save = document.getElementById('elnSaveBtn');
    if (save) {
      save.addEventListener('click', function () {
        ELN.toast('Note saved.', 'ok');
      });
    }
    // status 변경 시 토스트(패널 연동은 Task4의 onStatusChange가 별도 담당)
    ELN.onStatusToast = function (st) {
      ELN.toast('Status changed to "' + (STATUS_LABEL[st] || st) + '".', 'info');
    };
  }
  document.addEventListener('DOMContentLoaded', initBaseActions);

  /* ── Task4: 우측 접이식 연계패널 + status 연동 + 참조 클릭 액션 ── */
  var REF_INFO = {
    fml:  { title: 'FML-EM-2208 v3', icon: 'blender', msg: 'Opening formulation in formulator.' },
    rm:   { title: 'Rawmathub · 5 materials', icon: 'communities', msg: 'Opening Rawmathub material list.' },
    npdi: { title: 'NPDI-2026-031', icon: 'rocket_launch', msg: 'Navigating to NPDI project.' },
    note: { title: 'EXP-26-0118 (v2)', icon: 'link', msg: 'Opening linked note.' }
  };

  function initRightAside() {
    var aside = document.getElementById('elnRight');
    var toggle = document.getElementById('elnRightToggle');
    if (!aside || !toggle) return;

    // 패널(collapsed)과 손잡이(open)를 항상 함께 제어 — 손잡이는 분리된 fixed 버튼
    function setPanel(open) {
      aside.classList.toggle('collapsed', !open);
      toggle.classList.toggle('open', open);
    }
    toggle.addEventListener('click', function () {
      setPanel(aside.classList.contains('collapsed')); // 접혀있으면 펼치기
    });

    // status 연동: 진행중=접힘, 결말(성공/실패/보류)=펼침
    window.ELN.onStatusChange = function (st) {
      setPanel(st !== 'ing');
    };
    window.ELN.onStatusChange('ing'); // 초기 상태(접힘, 손잡이는 노출)

    // 참조 항목 클릭 → 액션(토스트 + 이동 모달)
    var list = document.getElementById('elnRefList');
    if (list) {
      list.addEventListener('click', function (e) {
        var li = e.target.closest('li[data-ref]');
        if (!li) return;
        var info = REF_INFO[li.getAttribute('data-ref')];
        if (!info) return;
        ELN.toast(info.msg, 'info');
      });
    }
  }
  document.addEventListener('DOMContentLoaded', initRightAside);

  /* ── TaskA1: 배합 연계 동작(선택→임베드→분석 100%→formulator 열기→원료 클릭) ── */

  // 배합 목업 데이터 (formulator가 만든 결과를 ELN은 읽기 임베드만)
  var FORMULATIONS = {
    'FML-EM-2208': {
      code: 'FML-EM-2208', ver: 'v3', sys: 'EM Formulator', sync: '2026-05-27',
      rows: [
        { name: 'Silicone PSA Base', code: 'RM-S1042', wt: 62.0, role: 'Base', note: '' },
        { name: 'Solvent (Toluene)', code: 'RM-T55', wt: 30.0, role: 'Solvent', note: '' },
        { name: 'Viscosity Modifier', code: 'RM-V210', wt: 4.0, role: 'Modifier', note: '↑ +1.5 vs v2' },
        { name: 'Crosslinker', code: 'RM-X07', wt: 2.5, role: 'Crosslinker', note: '' },
        { name: 'UV Photoinitiator', code: 'RM-P318', wt: 1.5, role: 'Initiator', note: '' }
      ],
      metrics: [
        { k: 'NV (solids)', v: '38.5 %' }, { k: 'VOC', v: '312 g/L' },
        { k: 'Viscosity', v: '4,520 cP' }, { k: 'Cost', v: '$ 12.4 /kg' }, { k: 'P/B ratio', v: '0.82' }
      ],
      chart: { cats: ['NV %', 'VOC(×10)', 'Visc(×1k)', 'Cost'], data: [38.5, 31.2, 4.52, 12.4] }
    },
    'FML-EM-2207': {
      code: 'FML-EM-2207', ver: 'v2', sys: 'EM Formulator', sync: '2026-05-19',
      rows: [
        { name: 'Silicone PSA Base', code: 'RM-S1042', wt: 63.5, role: 'Base', note: '' },
        { name: 'Solvent (Toluene)', code: 'RM-T55', wt: 30.0, role: 'Solvent', note: '' },
        { name: 'Viscosity Modifier', code: 'RM-V210', wt: 2.5, role: 'Modifier', note: '' },
        { name: 'Crosslinker', code: 'RM-X07', wt: 2.5, role: 'Crosslinker', note: '' },
        { name: 'UV Photoinitiator', code: 'RM-P318', wt: 1.5, role: 'Initiator', note: '' }
      ],
      metrics: [
        { k: 'NV (solids)', v: '39.1 %' }, { k: 'VOC', v: '318 g/L' },
        { k: 'Viscosity', v: '4,780 cP' }, { k: 'Cost', v: '$ 12.1 /kg' }, { k: 'P/B ratio', v: '0.80' }
      ],
      chart: { cats: ['NV %', 'VOC(×10)', 'Visc(×1k)', 'Cost'], data: [39.1, 31.8, 4.78, 12.1] }
    },
    'FML-PA-3310': {
      code: 'FML-PA-3310', ver: 'v1', sys: 'PA Formulator', sync: '2026-05-30',
      rows: [
        { name: 'Acrylic Base', code: 'RM-A220', wt: 70.0, role: 'Base', note: '' },
        { name: 'Tackifier', code: 'RM-TK9', wt: 18.0, role: 'Tackifier', note: '' },
        { name: 'Plasticizer', code: 'RM-PL3', wt: 8.0, role: 'Plasticizer', note: '' },
        { name: 'Curing Agent', code: 'RM-C12', wt: 4.0, role: 'Curing', note: '' }
      ],
      metrics: [
        { k: 'NV (solids)', v: '45.0 %' }, { k: 'VOC', v: '280 g/L' },
        { k: 'Viscosity', v: '3,900 cP' }, { k: 'Cost', v: '$ 9.8 /kg' }, { k: 'P/B ratio', v: '0.88' }
      ],
      chart: { cats: ['NV %', 'VOC(×10)', 'Visc(×1k)', 'Cost'], data: [45.0, 28.0, 3.9, 9.8] }
    }
  };
  // 원료 상세 목업
  var RM_INFO = {
    'RM-S1042': 'Silicone PSA Base · Viscosity 5,000cP · CAS 63148-62-9 · Supplier KCC',
    'RM-T55': 'Solvent (Toluene) · BP 110.6°C · CAS 108-88-3',
    'RM-V210': 'Viscosity Modifier · Non-volatile · Recommended 2~5wt%',
    'RM-X07': 'Crosslinker · Platinum-catalyzed · Store cool & dark',
    'RM-P318': 'UV Photoinitiator · λmax 320nm · Recommended 1~2wt%',
    'RM-A220': 'Acrylic Base Polymer · Tg -20°C',
    'RM-TK9': 'Tackifier · Softening point 95°C',
    'RM-PL3': 'Plasticizer · Low-volatility · Phthalate-free',
    'RM-C12': 'Curing Agent · Isocyanate-based'
  };

  // 이 노트에 연결된 배합들(다중) — 본문은 배합별 컬럼 비교로 표시
  var linkedFmls = ['FML-EM-2208', 'FML-EM-2207'];
  var fmlChart = null;

  function fmlList() {
    return linkedFmls.map(function (k) { return FORMULATIONS[k]; }).filter(Boolean);
  }

  // 조성 비교표: 원료 union(행) × 배합(열) wt%. 배합 간 값이 다르면 강조.
  function renderFmlCompTable() {
    var thead = document.getElementById('fmlCmpCompHead');
    var tbody = document.getElementById('fmlTableBody');
    if (!thead || !tbody) return;
    var fmls = fmlList();
    thead.innerHTML = ''; tbody.innerHTML = '';
    var htr = document.createElement('tr');
    ['Material (Rawmathub)', 'Code'].forEach(function (h) { var th = document.createElement('th'); th.textContent = h; htr.appendChild(th); });
    fmls.forEach(function (f) { var th = document.createElement('th'); th.className = 'ar'; th.innerHTML = f.code + ' <b>' + f.ver + '</b>'; htr.appendChild(th); });
    thead.appendChild(htr);
    // 원료 union(첫 등장 순서 보존)
    var order = [], map = {};
    fmls.forEach(function (f) { f.rows.forEach(function (r) { if (!map[r.code]) { map[r.code] = r.name; order.push(r.code); } }); });
    var totals = fmls.map(function () { return 0; });
    order.forEach(function (code) {
      var tr = document.createElement('tr');
      var nameTd = document.createElement('td'); nameTd.className = 'rmName'; nameTd.textContent = map[code];
      nameTd.style.cursor = 'pointer'; nameTd.dataset.rm = code; tr.appendChild(nameTd);
      var codeTd = document.createElement('td'); codeTd.className = 'ac'; codeTd.textContent = code; tr.appendChild(codeTd);
      var vals = fmls.map(function (f) { var row = f.rows.filter(function (r) { return r.code === code; })[0]; return row ? row.wt : null; });
      var present = vals.filter(function (v) { return v != null; });
      var diff = present.length > 1 && Math.max.apply(null, present) !== Math.min.apply(null, present);
      fmls.forEach(function (f, i) {
        var td = document.createElement('td'); td.className = 'ar';
        if (vals[i] == null) { td.textContent = '–'; td.classList.add('cGray'); }
        else { td.textContent = vals[i].toFixed(1); totals[i] += vals[i]; if (diff) td.classList.add('elnCmpDiff'); }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    // 합계 행
    var sum = document.createElement('tr');
    var l = document.createElement('td'); l.className = 'ar fontBold'; l.textContent = 'Total'; sum.appendChild(l);
    sum.appendChild(document.createElement('td'));
    totals.forEach(function (t) { var td = document.createElement('td'); td.className = 'ar fontBold'; td.textContent = t.toFixed(1); sum.appendChild(td); });
    tbody.appendChild(sum);
  }

  // 지표 비교표: 지표(행) × 배합(열)
  function renderFmlMetricTable() {
    var thead = document.getElementById('fmlCmpMetricHead');
    var tbody = document.getElementById('fmlMetricBody');
    if (!thead || !tbody) return;
    var fmls = fmlList();
    thead.innerHTML = ''; tbody.innerHTML = '';
    var htr = document.createElement('tr');
    var th0 = document.createElement('th'); th0.textContent = 'Metric'; htr.appendChild(th0);
    fmls.forEach(function (f) { var th = document.createElement('th'); th.className = 'ar'; th.innerHTML = f.code + ' <b>' + f.ver + '</b>'; htr.appendChild(th); });
    thead.appendChild(htr);
    var keys = fmls.length ? fmls[0].metrics.map(function (m) { return m.k; }) : [];
    keys.forEach(function (k) {
      var tr = document.createElement('tr');
      var kt = document.createElement('td'); kt.textContent = k; tr.appendChild(kt);
      fmls.forEach(function (f) {
        var mm = f.metrics.filter(function (m) { return m.k === k; })[0];
        var td = document.createElement('td'); td.className = 'ar fontBold'; td.textContent = mm ? mm.v : '–'; tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  // 그룹 컬럼 차트: 핵심 지표를 배합별 series로 비교
  function renderFmlChart() {
    if (!window.Highcharts) return;
    var fmls = fmlList();
    if (!fmls.length) return;
    var palette = ['#A47864', '#8ca571', '#5a7d9a', '#c98a5a'];
    var series = fmls.map(function (f, i) { return { name: f.code + ' ' + f.ver, data: f.chart.data, color: palette[i % palette.length], borderRadius: 3 }; });
    fmlChart = Highcharts.chart('chartFmlAnalysis', {
      chart: { type: 'column', height: 240, backgroundColor: 'transparent' },
      title: { text: 'Key Metrics — comparison', style: { fontSize: '13px', color: '#5a3e30' } },
      credits: { enabled: false },
      legend: { enabled: fmls.length > 1, itemStyle: { fontSize: '10px', color: '#5a3e30' } },
      xAxis: { categories: fmls[0].chart.cats, lineColor: '#d9cfc2' },
      yAxis: { title: { text: null }, gridLineColor: '#eee6da' },
      tooltip: { shared: true },
      plotOptions: { column: { groupPadding: 0.12, pointPadding: 0.04 } },
      series: series
    });
  }

  function renderFml() {
    renderFmlCompTable();
    renderFmlMetricTable();
    renderFmlChart();
    if (typeof initAllHBorderTableOverlays === 'function') {
      try { initAllHBorderTableOverlays(); } catch (e) { /* 오버레이 실패는 무시(시각 효과) */ }
    }
  }

  // 비교할 배합 다중 선택 모달(체크박스)
  function openFmlSelect() {
    var list = document.createElement('div');
    var chosen = linkedFmls.slice();
    Object.keys(FORMULATIONS).forEach(function (key) {
      var f = FORMULATIONS[key];
      var item = document.createElement('div');
      item.className = 'elnFmlPick' + (chosen.indexOf(key) >= 0 ? ' on' : '');
      var chk = document.createElement('i'); chk.className = 'material-symbols-outlined chk';
      chk.textContent = chosen.indexOf(key) >= 0 ? 'check_box' : 'check_box_outline_blank';
      var txt = document.createElement('div'); txt.className = 'txt';
      var t = document.createElement('div'); t.className = 'tit'; t.textContent = f.code + ' ' + f.ver;
      var s = document.createElement('div'); s.className = 'sub'; s.textContent = f.sys + ' · ' + f.rows.length + ' materials · ' + f.metrics[2].v;
      txt.appendChild(t); txt.appendChild(s);
      item.appendChild(chk); item.appendChild(txt);
      item.addEventListener('click', function () {
        var i = chosen.indexOf(key);
        if (i >= 0) chosen.splice(i, 1); else chosen.push(key);
        var on = chosen.indexOf(key) >= 0;
        item.classList.toggle('on', on);
        chk.textContent = on ? 'check_box' : 'check_box_outline_blank';
      });
      list.appendChild(item);
    });
    ELN.modal({
      title: 'Select formulations to compare', icon: 'checklist', body: list,
      actions: [
        { label: 'Cancel', type: '' },
        { label: 'Apply', type: 'hViva', onClick: function () {
            if (!chosen.length) { ELN.toast('Select at least one formulation.', 'warn'); return true; } // 모달 유지
            linkedFmls = Object.keys(FORMULATIONS).filter(function (k) { return chosen.indexOf(k) >= 0; }); // 원본 순서 유지
            renderFml();
            ELN.toast('Linked ' + linkedFmls.length + ' formulation' + (linkedFmls.length > 1 ? 's' : '') + '.', 'ok');
          } }
      ]
    });
  }

  function openInFormulator(key) {
    var f = FORMULATIONS[key]; if (!f) return;
    ELN.toast(f.code + ' ' + f.ver + ' · opening formulator in new window', 'info');
  }

  function openFmlRmInfo(code) {
    ELN.modal({
      title: 'Rawmathub · ' + code, icon: 'communities',
      body: RM_INFO[code] || ('No info for ' + code + '.'),
      actions: [
        { label: 'Open in Rawmathub', type: 'hBlue', onClick: function () { ELN.toast('Opening ' + code + ' in Rawmathub.', 'info'); } },
        { label: 'Close', type: '' }
      ]
    });
  }

  function initFmlActions() {
    if (!document.getElementById('card_fml')) return;
    renderFml(); // 초기 렌더(비교)

    // Open in formulator — 연결된 배합 중 골라서 진입(여럿이면 팝오버, 하나면 바로)
    var btnOpen = document.getElementById('btnOpenFormulator');
    if (btnOpen) btnOpen.addEventListener('click', function () {
      if (linkedFmls.length <= 1) { if (linkedFmls[0]) openInFormulator(linkedFmls[0]); return; }
      var menu = document.createElement('div'); menu.className = 'elnNbPopList';
      linkedFmls.forEach(function (key) {
        var f = FORMULATIONS[key]; if (!f) return;
        var it = document.createElement('div'); it.className = 'elnNbPopItem';
        var ic = document.createElement('i'); ic.className = 'material-symbols-outlined fill'; ic.textContent = 'science';
        var nm = document.createElement('span'); nm.innerHTML = f.code + ' <b>' + f.ver + '</b>';
        it.appendChild(ic); it.appendChild(nm);
        it.addEventListener('click', function () { ref.close(); openInFormulator(key); });
        menu.appendChild(it);
      });
      var ref = ELN.popover({ anchor: btnOpen, content: menu });
    });

    // Select — 비교할 배합 다중 선택
    var btnChange = document.getElementById('btnChangeFml');
    if (btnChange) btnChange.addEventListener('click', openFmlSelect);

    // 원료명 클릭 → Rawmathub 정보 (이벤트 위임)
    var tbody = document.getElementById('fmlTableBody');
    if (tbody) tbody.addEventListener('click', function (e) {
      var cell = e.target.closest('td.rmName[data-rm]');
      if (!cell) return;
      openFmlRmInfo(cell.getAttribute('data-rm'));
    });
  }
  document.addEventListener('DOMContentLoaded', initFmlActions);

  /* ── Task5: 카테고리 전환 + 자유태그 칩 ── */
  // 보안: 태그 텍스트는 사용자 입력이므로 innerHTML 조립 금지. textContent + createElement.
  function addTag(text) {
    text = text.trim();
    if (!text) return;
    if (text[0] !== '#') text = '#' + text;
    var wrap = document.getElementById('elnTags');
    if (!wrap) return;
    var existing = Array.prototype.some.call(wrap.children, function (c) {
      return c.dataset && c.dataset.tag === text;
    });
    if (existing) { ELN.toast('Tag already exists.', 'warn'); return; }
    var chip = document.createElement('span');
    chip.className = 'elnTag';
    chip.dataset.tag = text;
    chip.appendChild(document.createTextNode(text));
    var icon = document.createElement('i');
    icon.className = 'material-symbols-outlined';
    icon.textContent = 'close';
    chip.appendChild(icon);
    wrap.appendChild(chip);
    ELN.toast('Tag ' + text + ' added', 'ok');
  }

  function initTags() {
    var input = document.getElementById('elnTagInput');
    var tags = document.getElementById('elnTags');
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); addTag(input.value); input.value = ''; }
      });
    }
    if (tags) {
      tags.addEventListener('click', function (e) {
        if (e.target.tagName === 'I') {
          var t = e.target.parentNode.dataset.tag;
          e.target.parentNode.remove();
          ELN.toast('Tag ' + t + ' removed', 'info');
        }
      });
    }
    document.querySelectorAll('.elnRecentTags a').forEach(function (a) {
      a.addEventListener('click', function () { addTag(a.getAttribute('data-tag')); });
    });
  }

  // 카테고리 = 생성 시 1회 고정. 작성 중 변경 불가.
  var FML_CARDS = ['card_fml', 'card_cond', 'card_result'];
  var CAT_META = {
    fml: { label: 'Formulation', icon: 'blender', sub: 'Composition · Process · Results layout + formulator link' },
    gen: { label: 'General/Memo', icon: 'description', sub: 'Free-form note, no layout' }
  };

  // 헤더 배지 + 골격(배합 전용 카드) 표시를 카테고리에 맞게 적용
  function applyCategory(cat) {
    var meta = CAT_META[cat] || CAT_META.fml;
    var badge = document.getElementById('elnCatBadge');
    if (badge) {
      badge.setAttribute('data-cat', cat);
      var ic = badge.querySelector('i.left');
      var lb = badge.querySelector('.elnCatLabel');
      if (ic) ic.textContent = meta.icon;
      if (lb) lb.textContent = meta.label;
    }
    var hide = cat === 'gen';
    FML_CARDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = hide ? 'none' : '';
      var menu = document.querySelector('.menu-item[data-target="' + id + '"]');
      if (menu) menu.style.display = hide ? 'none' : '';
    });
  }

  // "새 노트" → 카테고리 선택 모달(생성 시 1회 결정)
  function openNewNoteModal() {
    var wrap = document.createElement('div');
    wrap.className = 'elnNewCats';
    var chosen = 'fml';
    Object.keys(CAT_META).forEach(function (cat) {
      var m = CAT_META[cat];
      var item = document.createElement('div');
      item.className = 'elnNewCat' + (cat === 'fml' ? ' on' : '');
      item.dataset.cat = cat;
      var ic = document.createElement('i'); ic.className = 'material-symbols-outlined'; ic.textContent = m.icon;
      var txt = document.createElement('div');
      var t = document.createElement('div'); t.className = 'tit'; t.textContent = m.label;
      var s = document.createElement('div'); s.className = 'sub'; s.textContent = m.sub;
      txt.appendChild(t); txt.appendChild(s);
      var pick = document.createElement('i'); pick.className = 'material-symbols-outlined pick'; pick.textContent = 'check_circle';
      item.appendChild(ic); item.appendChild(txt); item.appendChild(pick);
      item.addEventListener('click', function () {
        chosen = cat;
        wrap.querySelectorAll('.elnNewCat').forEach(function (n) { n.classList.remove('on'); });
        item.classList.add('on');
      });
      wrap.appendChild(item);
    });
    ELN.modal({
      title: 'New Note — Select Category', icon: 'note_add', body: wrap,
      actions: [
        { label: 'Start with this category', type: 'hViva', onClick: function () {
            applyCategory(chosen);
            ELN.toast('Started a new ' + CAT_META[chosen].label + ' note. (Category cannot be changed)', 'ok');
          } },
        { label: 'Cancel', type: '' }
      ]
    });
  }

  function initCategory() {
    applyCategory('fml'); // 초기: 현재 노트는 배합실험
    var newBtn = document.getElementById('elnNewBtn');
    if (newBtn) newBtn.addEventListener('click', openNewNoteModal);
    // 잠금 배지 클릭 시 안내(변경 불가)
    var badge = document.getElementById('elnCatBadge');
    if (badge) badge.addEventListener('click', function () {
      ELN.toast('Category is set at note creation and cannot be changed.', 'info');
    });
  }
  document.addEventListener('DOMContentLoaded', function () { initTags(); initCategory(); });

  /* ── Task6: 계보 미니맵(목업) + 노드 클릭 액션 ── */
  var LINEAGE = [
    { name: 'EXP-26-0098 Initial Trial', st: 'fail', ver: 'v1', desc: 'Initial formulation — 5,200cP, spec not met (failed)' },
    { name: 'EXP-26-0118 Viscosity Tuning', st: 'hold', ver: 'v2', desc: 'Viscosity modifier tuning — 4,780cP, on hold for review' },
    { name: 'EXP-26-0142 (current)',   st: 'ing',  ver: 'v3', desc: 'Current note — 4,520cP, spec met, in progress', current: true }
  ];

  function initLineage() {
    var box = document.getElementById('elnLineage');
    if (!box) return;
    box.innerHTML = '';
    LINEAGE.forEach(function (n, i) {
      var node = document.createElement('div');
      node.className = 'elnLineNode' + (n.current ? ' current' : '');
      node.dataset.idx = i;
      var dot = document.createElement('span');
      dot.className = 'elnLineDot ' + n.st;
      var name = document.createElement('span');
      name.textContent = n.name;
      var ver = document.createElement('span');
      ver.className = 'ver';
      ver.textContent = n.ver;
      node.appendChild(dot); node.appendChild(name); node.appendChild(ver);
      box.appendChild(node);
    });
    box.addEventListener('click', function (e) {
      var node = e.target.closest('.elnLineNode[data-idx]');
      if (!node) return;
      var n = LINEAGE[+node.dataset.idx];
      if (n.current) { ELN.toast('This is the note you are viewing.', 'info'); return; }
      ELN.modal({
        title: n.name, icon: 'account_tree', body: n.desc,
        actions: [
          { label: 'Open this note', type: 'hBlue', onClick: function () { ELN.toast('Opening ' + n.name + '.', 'info'); } },
          { label: 'Close', type: '' }
        ]
      });
    });
  }
  document.addEventListener('DOMContentLoaded', initLineage);

  /* ── BIOVIA식 모듈러 노트: 기본 템플릿 + 모듈 추가/삭제(고정 템플릿 탈피) ── */
  var MODULE_TYPES = [
    { key: 'text',     icon: 'notes',       title: 'Text Note',          desc: 'Free-form rich text' },
    { key: 'table',    icon: 'table_chart', title: 'Data Table',         desc: 'Structured measurement table' },
    { key: 'chart',    icon: 'bar_chart',   title: 'Chart',              desc: 'Plot a quick chart' },
    { key: 'process',  icon: 'tune',        title: 'Process Conditions', desc: 'Temp · time · dose …' },
    { key: 'material', icon: 'science',     title: 'Materials',          desc: 'Raw materials (Rawmathub)' },
    { key: 'obs',      icon: 'visibility',  title: 'Observation',        desc: 'What you observed' },
    { key: 'fml',      icon: 'blender',     title: 'Formulation',        desc: 'Embed from formulator' },
    { key: 'concl',    icon: 'summarize',   title: 'Conclusion',         desc: 'Summary & next steps' },
    { key: 'attach',   icon: 'attach_file', title: 'Attachments',        desc: 'Files & documents' },
    { key: 'links',    icon: 'link',        title: 'Links',              desc: 'External URLs' }
  ];

  function moduleSampleBody(key) {
    switch (key) {
      case 'text':  return '<textarea class="browser-default elnModText" placeholder="Write here…"></textarea>';
      case 'obs':   return '<textarea class="browser-default elnModText" placeholder="Describe what you observed…"></textarea>';
      case 'concl': return '<textarea class="browser-default elnModText" placeholder="Conclusion & next steps…"></textarea>';
      case 'table': return '<div class="fixedTable hBorderTable hScroll"><table><thead><tr><th>Item</th><th>Value</th><th>Unit</th></tr></thead>'
        + '<tbody><tr><td>—</td><td>—</td><td>—</td></tr><tr><td>—</td><td>—</td><td>—</td></tr></tbody></table></div>';
      case 'chart': return '<div class="elnModChartPh"><i class="material-symbols-outlined">bar_chart</i>Chart placeholder — bind data to render</div>';
      case 'process': return '<div class="elnMeta">'
        + '<div class="elnMetaItem metric"><i class="material-symbols-outlined">device_thermostat</i><div class="elnMetaText"><span class="k">Temp</span><span class="v">— <em>°C</em></span></div></div>'
        + '<div class="elnMetaItem metric"><i class="material-symbols-outlined">timer</i><div class="elnMetaText"><span class="k">Time</span><span class="v">— <em>min</em></span></div></div></div>';
      case 'material': return '<div class="fixedTable hBorderTable hScroll"><table><thead><tr><th>Material</th><th>Code</th><th>wt%</th></tr></thead>'
        + '<tbody><tr><td>—</td><td>—</td><td>—</td></tr></tbody></table></div>';
      case 'fml': return '<div class="elnFmlHead"><i class="material-symbols-outlined">science</i>'
        + '<div class="elnFmlId">No formulation linked yet</div>'
        + '<a href="javascript:;" class="elnLinkChip" style="cursor:pointer;"><i class="material-symbols-outlined">link</i>Link…</a></div>';
      case 'attach': return '<div class="elnAttachBox">'
        + '<label class="elnAttachDrop"><i class="material-symbols-outlined">upload_file</i>'
        + '<span>Drop files or <b>choose</b></span><input type="file" class="elnFileInput" multiple hidden></label>'
        + '<ul class="elnAttachList"></ul></div>';
      case 'links': return '<div class="elnAttachBox">'
        + '<div class="elnLinkAdd"><input type="text" class="elnLinkInput browser-default" placeholder="Paste a URL, then Add">'
        + '<button type="button" class="elnLinkAddBtn">Add</button></div>'
        + '<ul class="elnLinkList"></ul></div>';
      default: return '<div class="elnModText">…</div>';
    }
  }

  // 카드 헤더 우측에 자물쇠 — 클릭 시 해당 섹션을 읽기전용 view 모드로 토글
  function injectLockBtn(card) {
    var tit = card.querySelector('.cardTit2');
    if (!tit || tit.querySelector('.elnModLock')) return;
    var lock = document.createElement('a');
    lock.href = 'javascript:;'; lock.className = 'elnModLock'; lock.title = 'Lock section (view only)';
    lock.innerHTML = '<i class="material-symbols-outlined">lock_open</i>';
    lock.addEventListener('click', function (e) { e.preventDefault(); toggleCardLock(card); });
    tit.appendChild(lock);
  }

  function toggleCardLock(card) {
    var locked = !card.classList.contains('locked');
    card.classList.toggle('locked', locked);
    var lock = card.querySelector('.elnModLock');
    if (lock) {
      var ic = lock.querySelector('i'); if (ic) ic.textContent = locked ? 'lock' : 'lock_open';
      lock.title = locked ? 'Unlock section (edit)' : 'Lock section (view only)';
    }
    // 실제 입력요소는 readonly/disabled, 커스텀 편집 affordance 차단은 CSS .locked가 담당
    card.querySelectorAll('.elnBasic input, .elnBasic textarea').forEach(function (el) { el.readOnly = locked; });
    card.querySelectorAll('.elnBasic select').forEach(function (el) { el.disabled = locked; });
    card.querySelectorAll('.elnModTitle, .elnModMemo').forEach(function (el) { el.setAttribute('contenteditable', locked ? 'false' : 'true'); });
    ELN.toast(locked ? 'Section locked — view only.' : 'Section unlocked — editable.', locked ? 'info' : 'ok');
  }

  // 좌측 목차 라벨을 카드 제목과 동기
  function syncTocLabel(cardId, text) {
    var sp = document.querySelector('.leftAside .menuUl .menu-item[data-target="' + cardId + '"] span');
    if (sp) sp.textContent = text;
  }

  // 카드 헤더 크롬: 제목 인라인 편집(span) + 메모(설명) 줄 — 모든 카드 공용, 1회만 적용
  function setupCardChrome(card) {
    var tit = card.querySelector('.cardTit2');
    if (!tit) return;
    // 1) 제목 → 편집 가능한 span (헤더의 첫 텍스트 노드를 감쌈)
    if (!tit.querySelector('.elnModTitle')) {
      var node = null;
      for (var i = 0; i < tit.childNodes.length; i++) {
        var c = tit.childNodes[i];
        if (c.nodeType === 3 && c.textContent.trim()) { node = c; break; }
      }
      var span = document.createElement('span');
      span.className = 'elnModTitle';
      span.setAttribute('contenteditable', 'true');
      span.spellcheck = false;
      span.title = 'Click to rename';
      span.textContent = node ? node.textContent.trim() : 'Untitled';
      if (node) tit.replaceChild(span, node); else tit.appendChild(span);
      span.addEventListener('input', function () { syncTocLabel(card.id, span.textContent.trim() || 'Untitled'); });
      span.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); span.blur(); } });
      span.addEventListener('blur', function () {
        if (!span.textContent.trim()) span.textContent = 'Untitled';
        syncTocLabel(card.id, span.textContent.trim());
      });
    }
    // 2) 메모(설명) 줄 — 헤더 다음, 본문 앞
    if (!card.querySelector('.elnModMemo')) {
      var memo = document.createElement('div');
      memo.className = 'elnModMemo';
      memo.setAttribute('contenteditable', 'true');
      memo.spellcheck = false;
      memo.setAttribute('data-ph', 'Add a short description…');
      tit.insertAdjacentElement('afterend', memo);
    }
  }

  var modSeq = 0;
  // after = 이 카드 다음에 삽입할 기준 카드(null이면 맨 끝 — 상시 + 블록 앞)
  function addNoteModule(t, after) {
    var article = document.getElementById('tab_ov');
    if (!article) return;
    var id = 'card_mod_' + (++modSeq);
    var sec = document.createElement('section');
    sec.className = 'cardBox animate__animated animate__fadeIn mt10';
    sec.id = id;
    var tit = document.createElement('div');
    tit.className = 'cardTit2';
    var ic = document.createElement('i'); ic.className = 'material-symbols-outlined left'; ic.textContent = t.icon;
    tit.appendChild(ic);
    tit.appendChild(document.createTextNode(t.title));
    sec.appendChild(tit);
    var body = document.createElement('div'); body.className = 'elnBasic';
    body.innerHTML = moduleSampleBody(t.key);
    wireModuleBody(t.key, body);   // 첨부/링크 모듈이면 인스턴스 배선
    sec.appendChild(body);
    if (after && after.parentNode === article) article.insertBefore(sec, after.nextSibling);
    else article.insertBefore(sec, document.getElementById('elnAddEnd'));
    injectLockBtn(sec);
    setupCardChrome(sec);   // 제목 인라인 편집 + 메모 줄
    // 좌측 목차도 같은 순서로 동기(기준 카드의 li 뒤에 삽입)
    var ul = document.querySelector('.leftAside .menuUl');
    if (ul) {
      var li = document.createElement('li');
      li.className = 'menu-item waves-effect waves-hColor';
      li.setAttribute('data-target', id);
      li.innerHTML = '<i class="material-symbols-outlined left">' + t.icon + '</i><span>' + t.title + '</span>';
      var refLi = after ? ul.querySelector('.menu-item[data-target="' + after.id + '"]') : null;
      if (refLi) ul.insertBefore(li, refLi.nextSibling);
      else ul.appendChild(li);
      setupNavItem(li);   // 새 목차 항목도 드래그 핸들 적용
    }
    refreshDividers();
    if (typeof initAllHBorderTableOverlays === 'function') { try { initAllHBorderTableOverlays(); } catch (e) {} }
    ELN.toast('Module "' + t.title + '" added.', 'ok');
    sec.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // 모듈 픽커 — 모달 대신 누른 자리에 앵커되는 popover(기존 8종 그리드 재사용)
  function openModulePicker(anchor, after) {
    var grid = document.createElement('div'); grid.className = 'elnModGrid';
    MODULE_TYPES.forEach(function (t) {
      var item = document.createElement('div'); item.className = 'elnModType';
      var ic = document.createElement('i'); ic.className = 'material-symbols-outlined'; ic.textContent = t.icon;
      var txt = document.createElement('div');
      var tt = document.createElement('div'); tt.className = 'tt'; tt.textContent = t.title;
      var dd = document.createElement('div'); dd.className = 'dd'; dd.textContent = t.desc;
      txt.appendChild(tt); txt.appendChild(dd);
      item.appendChild(ic); item.appendChild(txt);
      item.addEventListener('click', function () { ref.close(); addNoteModule(t, after); });
      grid.appendChild(item);
    });
    var ref = ELN.popover({ anchor: anchor, content: grid, width: 400 });
  }

  // 카드 사이 hover '+' 라인 — Notion식 위치 지정 삽입. 추가/삭제 때마다 재배치.
  function refreshDividers() {
    var article = document.getElementById('tab_ov');
    if (!article) return;
    article.querySelectorAll(':scope > .elnModDivider').forEach(function (d) { d.remove(); });
    var cards = article.querySelectorAll(':scope > .cardBox');
    cards.forEach(function (card, i) {
      if (i === cards.length - 1) return; // 마지막 카드 뒤는 상시 + 블록이 담당
      var div = document.createElement('div');
      div.className = 'elnModDivider';
      div.title = 'Insert module here';
      div.innerHTML = '<span class="pl"><i class="material-symbols-outlined">add</i></span>';
      div.addEventListener('click', function () { openModulePicker(div, card); });
      article.insertBefore(div, card.nextSibling);
    });
  }

  function initModuleSystem() {
    var btn = document.getElementById('elnAddModule');
    if (!btn) return; // 상세 화면에서만 동작
    var article = document.getElementById('tab_ov');
    // 본문 끝 상시 '+ Add module' 점선 블록
    var end = document.createElement('div');
    end.id = 'elnAddEnd'; end.className = 'elnAddEnd';
    end.innerHTML = '<i class="material-symbols-outlined">add</i>Add module';
    end.addEventListener('click', function () { openModulePicker(end, null); });
    article.appendChild(end);
    // 좌측 버튼(보조 진입점) — popover 픽커, 맨 끝에 추가
    btn.addEventListener('click', function () { openModulePicker(btn, null); });
    // 모든 카드(Overview 포함) 헤더에 자물쇠 + 제목 편집/메모 주입.
    document.querySelectorAll('.contArea article > .cardBox').forEach(function (card) {
      injectLockBtn(card);
      setupCardChrome(card);
    });
    refreshDividers();
    // 좌측 메뉴(목차) 클릭 위임 → 동적 모듈도 스크롤 + active
    var ul = document.querySelector('.leftAside .menuUl');
    if (ul) ul.addEventListener('click', function (e) {
      var li = e.target.closest('.menu-item'); if (!li) return;
      var el = document.getElementById(li.getAttribute('data-target'));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      ul.querySelectorAll('.menu-item').forEach(function (m) { m.classList.remove('active'); });
      li.classList.add('active');
    });
  }
  document.addEventListener('DOMContentLoaded', initModuleSystem);

  /* ── Notebook 지정(Unfiled → 노트북 선택) — Overview 메타 클릭 → popover ── */
  // 워크스페이스(apis_eln_list.html)의 NB 키와 동일하게 유지(프로토타입 목업 데이터)
  var NOTEBOOKS = [
    { key: 'unfiled',   name: 'Unfiled',             icon: 'label_off' },
    { key: 'rgboled',   name: 'RGBOLED Adhesive',    icon: 'folder' },
    { key: 'foled',     name: 'Flexible OLED',       icon: 'folder' },
    { key: 'optical',   name: 'Optical Clear Resin', icon: 'folder' },
    { key: 'customerA', name: 'Customer A Project',  icon: 'folder_shared' }
  ];

  function setNotebookMeta(name) {
    var v = document.getElementById('elnNbMeta');
    if (!v) return;
    v.setAttribute('data-nb', name);
    v.innerHTML = '';
    v.appendChild(document.createTextNode(name));
    var ic = document.createElement('i');
    ic.className = 'material-symbols-outlined'; ic.textContent = 'expand_more';
    v.appendChild(ic);
    v.classList.toggle('unfiled', name === 'Unfiled');
  }

  function openNotebookPicker(anchor) {
    var v = document.getElementById('elnNbMeta');
    var cur = v ? (v.getAttribute('data-nb') || '') : '';
    var list = document.createElement('div'); list.className = 'elnNbPopList';
    NOTEBOOKS.forEach(function (nb) {
      var it = document.createElement('div');
      it.className = 'elnNbPopItem' + (nb.key === 'unfiled' ? ' unfiled' : ''); // 점선·흐림 = 임시 보관소
      var ic = document.createElement('i'); ic.className = 'material-symbols-outlined fill'; ic.textContent = nb.icon;
      var nm = document.createElement('span'); nm.textContent = nb.name;
      it.appendChild(ic); it.appendChild(nm);
      if (nb.name === cur) {
        var chk = document.createElement('i');
        chk.className = 'material-symbols-outlined fill chk'; chk.textContent = 'check';
        it.appendChild(chk);
      }
      it.addEventListener('click', function () {
        ref.close();
        if (nb.name === cur) return;
        var wasUnfiled = cur === 'Unfiled';
        setNotebookMeta(nb.name);
        ELN.toast(nb.name === 'Unfiled' ? 'Note moved to Unfiled.'
          : (wasUnfiled ? 'Note filed to "' + nb.name + '".' : 'Note moved to "' + nb.name + '".'), 'ok');
      });
      list.appendChild(it);
    });
    // New notebook… — list 화면의 New Notebook 모달 패턴 재사용
    var nw = document.createElement('div'); nw.className = 'elnNbPopItem new';
    nw.innerHTML = '<i class="material-symbols-outlined">create_new_folder</i><span>New notebook</span>';
    nw.addEventListener('click', function () {
      ref.close();
      var inp = document.createElement('input');
      inp.type = 'text'; inp.className = 'browser-default'; inp.placeholder = 'Notebook name';
      ELN.modal({
        title: 'New Notebook', icon: 'create_new_folder', body: inp,
        actions: [
          { label: 'Cancel' },
          { label: 'Create', type: 'hViva', onClick: function () {
            var name = (inp.value || '').trim() || 'Untitled Notebook';
            NOTEBOOKS.push({ key: 'nb' + NOTEBOOKS.length, name: name, icon: 'folder' });
            setNotebookMeta(name);
            ELN.toast('Notebook "' + name + '" created — note filed.', 'ok');
          } }
        ]
      });
      setTimeout(function () { inp.focus(); }, 60);
    });
    list.appendChild(nw);
    var ref = ELN.popover({ anchor: anchor, content: list });
  }

  function initNotebookMeta() {
    var v = document.getElementById('elnNbMeta');
    if (!v) return; // 상세 화면에서만
    // 워크스페이스에서 ?nb= 로 진입 — Unfiled 노트북의 노트면 'Unfiled' 상태로 시작
    var key = null;
    try { key = new URLSearchParams(location.search).get('nb'); } catch (e) {}
    var nb = NOTEBOOKS.filter(function (n) { return n.key === key; })[0];
    setNotebookMeta(nb ? nb.name : (v.getAttribute('data-nb') || 'RGBOLED Adhesive'));
    v.addEventListener('click', function () { openNotebookPicker(v); });
  }
  document.addEventListener('DOMContentLoaded', initNotebookMeta);

  /* ── animate.css 진입 연출 1회성 처리 — 끝나면 클래스 제거 ── */
  // fadeInLeft(목차)·fadeIn(동적 모듈)은 최초 마운트 연출용. 끝난 뒤 클래스가 남으면
  // 이후 드래그 재정렬 등과 어수선하게 얽힘. animationend는 버블링 → document 한 곳에서 위임 정리.
  function initAnimateCleanup() {
    document.addEventListener('animationend', function (e) {
      var el = e.target;
      if (el && el.classList && el.classList.contains('animate__animated')) {
        el.classList.remove('animate__animated', 'animate__fadeInLeft', 'animate__fadeIn');
      }
    });
  }
  document.addEventListener('DOMContentLoaded', initAnimateCleanup);

  /* ── 좌측 목차 드래그 핸들 — hover 시 좌측 아이콘이 swap_vert(↑↓)로 바뀜. 그 아이콘 = sortable handle ── */
  function setupNavItem(li) {
    if (!li || li.getAttribute('data-target') === 'card_basic') return; // Overview 고정 → 핸들 없음
    var ic = li.querySelector('.material-symbols-outlined.left');
    if (!ic || ic.classList.contains('elnNavHandle')) return;            // 이미 처리됨
    ic.classList.add('elnNavHandle');
    ic.dataset.icon = (ic.textContent || '').trim();                     // 원본 글리프 보관
    li.addEventListener('mouseenter', function () { ic.textContent = 'swap_vert'; }); // PC에서 위아래 재정렬 = 직관적
    li.addEventListener('mouseleave', function () { ic.textContent = ic.dataset.icon; });
  }
  function initNavHandles() {
    document.querySelectorAll('.leftAside .menuUl .menu-item').forEach(setupNavItem);
  }
  document.addEventListener('DOMContentLoaded', initNavHandles);

  /* ── 카드 & 좌측 목차 드래그 재정렬(jQuery UI sortable, 상호 동기) ── */
  // Overview(card_basic)는 노트 필수 앵커 → 최상단 고정(드래그/드롭 대상 제외).
  function initSortable() {
    var $ = window.jQuery;
    if (!$ || !$.fn || !$.fn.sortable) return; // jQuery UI sortable 없으면 조용히 패스
    var article = document.getElementById('tab_ov');
    var $article = $(article);
    var $menu = $('.leftAside .menuUl');
    if (!$article.length || !$menu.length) return; // 상세 화면에서만

    function pinBasicFirst(ids) {
      var i = ids.indexOf('card_basic');
      if (i > 0) { ids.splice(i, 1); ids.unshift('card_basic'); }
      return ids;
    }
    // 카드 DOM 순서 → 좌측 목차를 같은 순서로 재배치
    function syncMenuToCards() {
      var ids = pinBasicFirst($article.children('.cardBox').map(function () { return this.id; }).get());
      ids.forEach(function (id) {
        var li = $menu.children('.menu-item[data-target="' + id + '"]')[0];
        if (li) $menu[0].appendChild(li);
      });
    }
    // 좌측 목차 순서 → 카드를 같은 순서로 재배치(끝의 '+ Add module' 블록 앞에 삽입)
    function syncCardsToMenu() {
      var end = document.getElementById('elnAddEnd');
      var ids = pinBasicFirst($menu.children('.menu-item').map(function () { return $(this).attr('data-target'); }).get());
      ids.forEach(function (id) {
        var card = document.getElementById(id);
        if (card) article.insertBefore(card, end);
      });
    }

    // 좌측 목차: Overview 항목 제외. 옮기면 카드가 따라옴.
    $menu.sortable({
      items: '> .menu-item:not([data-target="card_basic"])',
      handle: '.elnNavHandle',        // 좌측 아이콘만 드래그 손잡이
      placeholder: 'elnSortPhMenu',
      forcePlaceholderSize: true,
      tolerance: 'pointer',
      distance: 5,
      opacity: 0.92,
      update: function () {
        syncCardsToMenu();
        if (typeof refreshDividers === 'function') refreshDividers();
        ELN.toast('Module order updated.', 'ok');
      }
    });
  }
  document.addEventListener('DOMContentLoaded', initSortable);

  /* ── 첨부(파일)·링크(URL) 모듈 — 각 모듈 본문에 인스턴스로 배선(전역 id 싱글톤 아님) ── */
  function fmtFileSize(n) {
    if (n == null) return '';
    if (n < 1024) return n + ' B';
    if (n < 1048576) return Math.round(n / 1024) + ' KB';
    return (n / 1048576).toFixed(1) + ' MB';
  }
  function fileGlyph(name) {
    var ext = (name.split('.').pop() || '').toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].indexOf(ext) >= 0) return 'image';
    if (ext === 'pdf') return 'picture_as_pdf';
    if (['xls', 'xlsx', 'csv'].indexOf(ext) >= 0) return 'table_view';
    if (['doc', 'docx'].indexOf(ext) >= 0) return 'description';
    if (['zip', '7z', 'rar'].indexOf(ext) >= 0) return 'folder_zip';
    return 'draft';
  }
  function attachRemoveIcon(li) {
    var rm = document.createElement('i'); rm.className = 'material-symbols-outlined x'; rm.textContent = 'close';
    rm.title = 'Remove';
    rm.addEventListener('click', function (e) { e.preventDefault(); li.remove(); });
    return rm;
  }
  function addFileItem(listEl, name, size) {
    var li = document.createElement('li'); li.className = 'elnAttachItem';
    var ic = document.createElement('i'); ic.className = 'material-symbols-outlined'; ic.textContent = fileGlyph(name);
    var nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = name;
    var sz = document.createElement('em'); sz.textContent = fmtFileSize(size);
    li.appendChild(ic); li.appendChild(nm); li.appendChild(sz); li.appendChild(attachRemoveIcon(li));
    listEl.appendChild(li);
  }
  function normalizeUrl(u) {
    u = (u || '').trim();
    if (!u) return '';
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    return u;
  }
  function addUrlItem(listEl, url) {
    var li = document.createElement('li'); li.className = 'elnLinkItem';
    var a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    var ic = document.createElement('i'); ic.className = 'material-symbols-outlined'; ic.textContent = 'link';
    var nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = url.replace(/^https?:\/\//, '');
    var go = document.createElement('i'); go.className = 'material-symbols-outlined go'; go.textContent = 'open_in_new';
    a.appendChild(ic); a.appendChild(nm); a.appendChild(go);
    li.appendChild(a); li.appendChild(attachRemoveIcon(li));
    listEl.appendChild(li);
  }

  // Attachments 모듈 본문 배선(파일 선택·드롭) — scope = 해당 모듈 본문
  function wireFileModule(scope) {
    var drop = scope.querySelector('.elnAttachDrop');
    var input = scope.querySelector('.elnFileInput');
    var list = scope.querySelector('.elnAttachList');
    if (!drop || !list) return;
    function addFiles(files) {
      if (!files || !files.length) return;
      Array.prototype.forEach.call(files, function (f) { addFileItem(list, f.name, f.size); });
      ELN.toast(files.length + ' file' + (files.length > 1 ? 's' : '') + ' attached.', 'ok');
    }
    if (input) input.addEventListener('change', function () { addFiles(input.files); input.value = ''; });
    drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('drag'); });
    drop.addEventListener('dragleave', function () { drop.classList.remove('drag'); });
    drop.addEventListener('drop', function (e) { e.preventDefault(); drop.classList.remove('drag'); addFiles(e.dataTransfer && e.dataTransfer.files); });
  }

  // Links 모듈 본문 배선(URL 추가) — scope = 해당 모듈 본문
  function wireLinkModule(scope) {
    var addBtn = scope.querySelector('.elnLinkAddBtn');
    var inp = scope.querySelector('.elnLinkInput');
    var list = scope.querySelector('.elnLinkList');
    if (!list) return;
    function add() {
      var url = normalizeUrl(inp && inp.value);
      if (!url) { ELN.toast('Enter a URL first.', 'warn'); return; }
      addUrlItem(list, url);
      if (inp) inp.value = '';
      ELN.toast('Link added.', 'ok');
    }
    if (addBtn) addBtn.addEventListener('click', add);
    if (inp) inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); add(); } });
  }
  // 모듈 본문 키별 추가 배선(첨부/링크 등)
  function wireModuleBody(key, body) {
    if (key === 'attach') wireFileModule(body);
    else if (key === 'links') wireLinkModule(body);
  }

  /* ── 우측 패널 가로 리사이즈 — 좌측 가장자리 드래그. 폭은 CSS 변수 --eln-right-w로 공유 ── */
  function initRightResize() {
    var aside = document.getElementById('elnRight');
    if (!aside) return;
    var rz = document.createElement('div');
    rz.className = 'elnRightResizer';
    rz.title = 'Drag to resize';
    aside.appendChild(rz);
    var root = document.documentElement;
    var startX = 0, startW = 0;
    function onMove(e) {
      var maxW = Math.round(window.innerWidth * 0.5);   // 화면 절반
      var w = Math.max(240, Math.min(maxW, startW + (startX - e.clientX)));
      root.style.setProperty('--eln-right-w', w + 'px');
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.classList.remove('elnResizing');
      rz.classList.remove('drag');
    }
    rz.addEventListener('mousedown', function (e) {
      e.preventDefault();
      startX = e.clientX;
      startW = aside.getBoundingClientRect().width;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.body.classList.add('elnResizing');
      rz.classList.add('drag');
    });
  }
  document.addEventListener('DOMContentLoaded', initRightResize);
})();
