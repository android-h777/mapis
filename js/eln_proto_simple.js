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
    // 글래스엔진 색추적 — 시스템 전역 glassTrack/glassClear 재사용(--olx/--oly/--ol-angle 갱신 → ::before conic)
    t.addEventListener('mousemove', function (e) { if (typeof glassTrack === 'function') glassTrack.call(t, e); });
    t.addEventListener('mouseleave', function () { if (typeof glassClear === 'function') glassClear(t); });
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
    var x, y, w = pop.offsetWidth, h = pop.offsetHeight, gap = 6;
    if (opts.atPointer) {                              // 섹션 사이/하단 '+': 마우스 포인터 위치 추종
      var px = opts.atPointer.x, py = opts.atPointer.y;
      x = Math.min(Math.max(8, px - w / 2), window.innerWidth - w - 8);
      var upY = py - h - gap, downY = py + gap;
      if (upY >= 8) y = upY;                            // 기본: 위로
      else if (downY + h <= window.innerHeight - 8) y = downY;  // 위 공간 없으면 아래로
      else y = 8;                                       // 둘 다 없으면 위(클램프)
    } else {                                            // 좌측 Add module 버튼: 앵커 기준(기존 위치 유지)
      var r = opts.anchor.getBoundingClientRect();
      x = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
      y = r.bottom + 6;
      if (y + h > window.innerHeight - 8) y = Math.max(8, r.top - h - 6);
    }
    pop.style.left = x + 'px'; pop.style.top = y + 'px';
    function close() {
      pop.remove();
      document.removeEventListener('mousedown', onDoc, true);
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('scroll', onScroll, true);
    }
    function onDoc(e) { if (!pop.contains(e.target)) close(); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    function onScroll(e) { if (e && pop.contains(e.target)) return; close(); }   // 바깥 스크롤이면 닫기(앵커서 떨어짐), 팝오버 내부 스크롤은 유지
    // 픽커를 연 클릭 자체가 바로 닫아버리지 않도록 다음 틱에 등록
    setTimeout(function () {
      document.addEventListener('mousedown', onDoc, true);
      document.addEventListener('keydown', onKey, true);
      document.addEventListener('scroll', onScroll, true);   // capture → 모든 스크롤 컨테이너 포착
    }, 0);
    return { close: close, el: pop };
  };

  /* ── Task3: status 칩 + 드롭다운 (헤더→Overview 본문으로 이동) ── */
  // simple: 워크플로우 3종(In Progress → In Approval → Approved). 클릭 시 ELN.popover로 옵션 펼침.
  var STATUS_ORDER = ['ing', 'appr', 'ok'];

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
  var STATUS_LABEL = { ing: 'In Progress', appr: 'In Approval', ok: 'Approved' };

  // 헤더 status 알약(roundBox) — simple: 수동 드롭다운 제거, 결재 흐름이 값을 갱신.
  var STATUS_PILL = { ing: 'blue', appr: 'viola25', ok: 'green' };   // ing=파랑, appr=보라(Viola), ok=초록
  function setHeadStatus(st) {
    var el = document.getElementById('elnHeadStatus'); if (!el) return;
    el.className = 'roundBox ' + (STATUS_PILL[st] || 'grey');
    el.setAttribute('data-status', st);
    el.textContent = STATUS_LABEL[st] || st;
  }

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
    fml:  { msg: 'Opening formulation in formulator' },
    rm:   { msg: 'Opening material in Rawmathub', url: 'apis_item_pop.html' },
    npdi: { msg: 'Navigating to project' },
    note: { msg: 'Opening parent note' }
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
    var body = document.querySelector('.elnRightBody');
    if (body) {
      body.addEventListener('click', function (e) {
        var item = e.target.closest('.elnRefItem[data-ref]');
        if (!item) return;
        var info = REF_INFO[item.getAttribute('data-ref')];
        if (!info) return;
        var label = (item.textContent || '').trim().replace(/\s+/g, ' ');
        if (info.url) {   // material 등: 모달/토스트 없이 바로 팝업 창
          var code = (label.split(/\s+/)[0] || '');
          window.open(info.url + (code ? '?code=' + encodeURIComponent(code) : ''),
            'eln_' + item.getAttribute('data-ref') + '_' + code,
            'width=1480,height=900,scrollbars=yes,resizable=yes');
          return;
        }
        ELN.toast(info.msg + (label ? ' — ' + label : '') + '.', 'info');
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
    // siliconeFormula 를 mapis 하위로 가져옴(배포용) → mapis 기준 상대경로
    window.open('siliconeFormula/index.html?code=' + encodeURIComponent(f.code),
      'siliconeFormulator', 'width=1480,height=900,scrollbars=yes,resizable=yes');
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

    // Open in formulator — 클릭 즉시 포뮬레이터 팝업. 연결 배합 있으면 첫 배합 코드로, 없으면 그냥 열기
    var btnOpen = document.getElementById('btnOpenFormulator');
    if (btnOpen) btnOpen.addEventListener('click', function () {
      if (linkedFmls[0]) openInFormulator(linkedFmls[0]);
      else window.open('siliconeFormula/index.html', 'siliconeFormulator', 'width=1480,height=900,scrollbars=yes,resizable=yes');
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

  /* ── Note List — 이 과제의 연구노트(스테이지별 그룹). 헤더 NoteList 버튼 → 우측 슬라이드 패널 ── */
  // 목업 데이터: 같은 과제(SN-26-0031)의 노트들. current = 지금 열려있는 노트
  // modules: 이 노트가 보유한 '동적 모듈' 구성(basic·approval은 고정이라 제외).
  //   'fml'=정적 Formulation 리치카드(show/hide로 보존), 나머지는 addNoteModule로 동적 재생성.
  //   노트마다 모듈 종류·개수가 달라 카드 수와 좌측 목차가 실제로 바뀜.
  var PROJECT_NOTES = [
    { code: 'NT-2604-00098', title: 'PSA Base Polymer Screening',                         stage: 'LAB FORMULATION', date: '2026-04-12', status: 'done',   modules: ['fml','table','editor'] },
    { code: 'NT-2604-00115', title: 'Tackifier Compatibility Study',                       stage: 'LAB FORMULATION', date: '2026-04-28', status: 'done',   modules: ['fml','table','chem','related'] },
    { code: 'NT-2605-00131', title: 'Crosslinker Ratio Optimization',                      stage: 'LAB FORMULATION', date: '2026-05-06', status: 'review', modules: ['fml','table','editor','attach'] },
    { code: 'NT-2605-00142', title: 'UV-Curable PSA Viscosity Improvement — RGBOLED',      stage: 'SCALE-UP',        date: '2026-05-15', status: 'ing', current: true, modules: ['fml','editor','table','chem','related','attach'] },
    { code: 'NT-2605-00150', title: 'Pilot Coating Trial #1',                              stage: 'SCALE-UP',        date: '2026-05-22', status: 'ing',    modules: ['editor','attach'] },
    { code: 'NT-2606-00171', title: 'Mass-Production Validation Plan',                     stage: 'COMMERCIAL GO',   date: '2026-06-03', status: 'draft',  modules: ['editor'] }
  ];
  var NOTE_STATUS_TXT = { done: 'Done', ing: 'In Progress', review: 'In Review', draft: 'Draft' };
  // 노트 상태 → 헤더 알약(roundBox) 색. 헤더 워크플로우 어휘와 달라 전환 시 직접 매핑
  var NOTE_STATUS_PILL = { done: 'green', ing: 'blue', review: 'viola25', draft: 'grey' };

  function renderNoteList() {
    var body = document.getElementById('elnNoteListBody'); if (!body) return;
    // 스테이지 순서는 과제 스케줄(PROJ_SCHEDULE) 기준 — 노트 있는 스테이지만, 스케줄 밖 스테이지는 뒤에
    var order = (typeof PROJ_SCHEDULE !== 'undefined') ? PROJ_SCHEDULE.map(function (s) { return s.stage; }) : [];
    var stages = order.filter(function (st) { return PROJECT_NOTES.some(function (n) { return n.stage === st; }); });
    PROJECT_NOTES.forEach(function (n) { if (stages.indexOf(n.stage) < 0) stages.push(n.stage); });
    if (!stages.length) { body.innerHTML = '<div class="elnNlEmpty">No notes in this project.</div>'; return; }
    var html = '';
    stages.forEach(function (st) {
      var items = PROJECT_NOTES.filter(function (n) { return n.stage === st; });
      html += '<div class="elnNlGroup"><div class="elnNlGroupHead">' + esc(st) + '<span class="cnt">' + items.length + '</span></div>';
      items.forEach(function (n) {
        html += '<div class="elnNlItem' + (n.current ? ' current' : '') + '" data-code="' + esc(n.code) + '">'
          + '<div class="elnNlTop"><span class="elnNlTit">' + esc(n.title) + '</span>'
          + '<span class="elnNlStatus ' + n.status + '">' + (NOTE_STATUS_TXT[n.status] || n.status) + '</span></div>'
          + '<div class="elnNlSub"><span class="code">' + esc(n.code) + '</span><span class="date">' + esc(n.date) + '</span></div>'
          + '</div>';
      });
      html += '</div>';
    });
    body.innerHTML = html;
  }

  function initNoteList() {
    var btn = document.getElementById('elnNoteListBtn');
    var panel = document.getElementById('elnNoteListPanel');
    if (!btn || !panel) return;   // 상세 팝업에서만
    var scrim = document.getElementById('elnNoteListScrim');
    var closeBtn = document.getElementById('elnNoteListClose');
    renderNoteList();
    function onKey(e) { if (e.key === 'Escape') closePanel(); }
    function openPanel() { panel.classList.add('on'); if (scrim) scrim.classList.add('on'); document.addEventListener('keydown', onKey); }
    function closePanel() { panel.classList.remove('on'); if (scrim) scrim.classList.remove('on'); document.removeEventListener('keydown', onKey); }
    btn.addEventListener('click', function () { panel.classList.contains('on') ? closePanel() : openPanel(); });
    if (closeBtn) closeBtn.addEventListener('click', closePanel);
    if (scrim) scrim.addEventListener('click', closePanel);
    var proj = document.getElementById('elnNoteListProj');
    if (proj) proj.addEventListener('click', function () {
      ELN.toast('Opening project detail — ' + proj.textContent.trim() + '.', 'info');
    });
    var body = document.getElementById('elnNoteListBody');
    if (body) body.addEventListener('click', function (e) {
      var it = e.target.closest('.elnNlItem'); if (!it) return;
      if (it.classList.contains('current')) { closePanel(); return; }   // 현재 노트면 그냥 닫기
      selectNote(it.getAttribute('data-code'));
    });

    // 프로토타입 노트 전환 — 헤더 제목·상태 알약·Note Title 교체 + 노트별 모듈 구성 재생성
    //  + 리스트 current 이동 + 패널 닫고 상단으로 + 본문 페이드. 실제 모듈 시스템을 그대로 구동.
    function selectNote(code) {
      var n; for (var i = 0; i < PROJECT_NOTES.length; i++) if (PROJECT_NOTES[i].code === code) { n = PROJECT_NOTES[i]; break; }
      if (!n) return;
      // 헤더 제목
      var tit = document.querySelector('.popup header .statusTit .tit');
      if (tit) tit.textContent = '[' + n.code + '] ' + n.title;
      // 본문 Basic Data의 'Note Title' 입력값도 동기화(헤더만 바뀌면 어색)
      var titIn = document.querySelector('.elnBasicTitle input');
      if (titIn) titIn.value = n.title;
      // 헤더 상태 알약(노트 상태 어휘 → 색/라벨 직접 매핑)
      var pill = document.getElementById('elnHeadStatus');
      if (pill) { pill.className = 'roundBox ' + (NOTE_STATUS_PILL[n.status] || 'grey');
        pill.setAttribute('data-status', n.status); pill.textContent = NOTE_STATUS_TXT[n.status] || n.status; }
      // 노트별 모듈 구성 적용 — 기존 add/removeModule 메커니즘으로 카드·목차 재생성(개수가 달라져 드라마틱)
      applyNoteModules(n.modules || []);
      // current 플래그 이동 후 리스트 재렌더 → 좌측 바/하이라이트가 클릭한 노트로
      PROJECT_NOTES.forEach(function (x) { x.current = (x.code === code); });
      if (typeof CURRENT_CODE !== 'undefined') CURRENT_CODE = code;   // "지금 보는 노트" 체크들과 동기화
      renderNoteList();
      closePanel();
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e2) { window.scrollTo(0, 0); }
      // 본문 페이드 스왑(로딩된 듯). offsetWidth 리플로우로 연속 클릭 시 애니메이션 재시작
      var cont = document.querySelector('.contArea');
      if (cont) { cont.classList.remove('elnSwapping'); void cont.offsetWidth; cont.classList.add('elnSwapping');
        cont.addEventListener('animationend', function h() { cont.classList.remove('elnSwapping'); cont.removeEventListener('animationend', h); }); }
      ELN.toast('Switched to ' + n.code + ' — ' + n.title + '.', 'ok');
    }

    // 노트 모듈 구성 적용 — 실제 모듈 시스템(addNoteModule/removeSection) 재사용.
    //  · basic(Overview)·approval: 고정 → 손대지 않음
    //  · fml(Formulation): 정적 리치카드 → 제거 대신 show/hide(제거 시 세션 내 복구 불가)
    //  · editor/table/chem/related/attach: 동적 → 전부 제거 후 타깃 순서대로 재생성(순서·구성 정확)
    var DYN_MOD_KEYS = ['editor', 'table', 'chem', 'related', 'attach'];
    function applyNoteModules(modules) {
      var article = document.getElementById('tab_ov'); if (!article) return;
      // 1) Formulation 정적 카드: 보유 여부에 따라 show/hide (카드+목차)
      var onFml = modules.indexOf('fml') >= 0;
      var fmlCard = document.getElementById('card_fml');
      if (fmlCard) fmlCard.style.display = onFml ? '' : 'none';
      var fmlLi = document.querySelector('.leftAside .menuUl .menu-item[data-target="card_fml"]');
      if (fmlLi) fmlLi.style.display = onFml ? '' : 'none';
      // 2) 기존 동적 모듈 전부 제거(카드+목차)
      article.querySelectorAll('.cardBox[data-modtype]').forEach(function (card) {
        if (DYN_MOD_KEYS.indexOf(card.getAttribute('data-modtype')) >= 0) removeSection(card.id);
      });
      // 3) 타깃 동적 모듈을 순서대로 재생성(조용히 — addNoteModule이 card+목차 함께 생성)
      modules.forEach(function (key) {
        if (DYN_MOD_KEYS.indexOf(key) < 0) return;
        var mt = MODULE_TYPES.filter(function (m) { return m.key === key; })[0];
        if (mt) addNoteModule(mt, null, true);
      });
      if (typeof refreshDividers === 'function') { try { refreshDividers(); } catch (e3) {} }
      // 목차 active는 Basic Data로 리셋
      var ul = document.querySelector('.leftAside .menuUl');
      if (ul) { ul.querySelectorAll('.menu-item').forEach(function (m) { m.classList.remove('active'); });
        var first = ul.querySelector('.menu-item[data-target="card_basic"]'); if (first) first.classList.add('active'); }
    }
  }
  document.addEventListener('DOMContentLoaded', initNoteList);

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
    renderRecommended();   // 추가된 태그는 추천에서 제외
  }

  /* ── 태그 추천(Recommended) — AI 없이 컨텍스트 기반 ──
     실구현: (1) 노트 본문 TF-IDF로 희소 키워드 추출(흔한 단어 자동 배제),
     (2) 태그 DB co-occurrence로 통제어휘 랭킹, (3) 선택적 LLM 의미추천.
     프로토타입은 (2)통제어휘 + (3)필드파생을 목업으로 시뮬레이션. */
  var TAG_VOCAB = ['#PSA', '#silicone', '#UVcure', '#adhesive', '#crosslinker', '#viscosity',
    '#RGBOLED', '#OLED', '#coating', '#optical', '#reliability', '#lowtemp', '#masstransfer', '#CoC', '#customerA'];
  // 이 노트의 구조화 필드(카테고리·formulation·재료·프로젝트)에서 파생된 강추천(목업)
  var DERIVED_TAGS = ['#PSA', '#silicone', '#UVcure', '#adhesive', '#crosslinker', '#reliability'];

  function currentTags() {
    var wrap = document.getElementById('elnTags');
    return wrap ? Array.prototype.map.call(wrap.children, function (c) { return (c.dataset && c.dataset.tag) || ''; }) : [];
  }
  function recommendTags(limit) {
    var applied = currentTags(), seen = {}, out = [];
    DERIVED_TAGS.concat(TAG_VOCAB).forEach(function (t) {       // 필드파생 우선 → 통제어휘
      if (!t || seen[t] || applied.indexOf(t) >= 0) return;
      seen[t] = 1; out.push(t);
    });
    return out.slice(0, limit || 6);
  }
  function renderRecommended() {
    var box = document.getElementById('elnRecTags');
    if (!box) return;
    box.innerHTML = '';
    // 선두 레이블 — 이 칩들이 '추천 태그'임을 명시(클릭=추가)
    var lab = document.createElement('span'); lab.className = 'elnRecLabel';
    lab.innerHTML = '<i class="material-symbols-outlined">auto_awesome</i>Recommended';
    box.appendChild(lab);
    var recs = recommendTags(6);
    if (!recs.length) {
      var none = document.createElement('span'); none.className = 'elnRecEmpty'; none.textContent = 'No more suggestions';
      box.appendChild(none); return;
    }
    recs.forEach(function (t) {
      var a = document.createElement('a'); a.href = 'javascript:;'; a.className = 'elnRecChip'; a.setAttribute('data-tag', t);
      var ic = document.createElement('i'); ic.className = 'material-symbols-outlined'; ic.textContent = 'add';
      a.appendChild(ic); a.appendChild(document.createTextNode(t));
      a.addEventListener('click', function () { addTag(t); renderRecommended(); });
      box.appendChild(a);
    });
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
          renderRecommended();   // 제거된 태그는 다시 추천 가능
        }
      });
    }
    renderRecommended();   // 컨텍스트 기반 추천 칩 렌더(클릭 → 추가)
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

  /* ── Task6: History = parent 포인터로 계산하는 파생 트리(분기 지원) ──
     apis_eln_list.html과 동일 모델. 계보를 배열로 저장하지 않고 각 노트의 parent만 두고
     트리를 유도한다(git 커밋 그래프식). 데이터는 list의 RGBOLED 노트북 서브트리(NT-코드)와 일치. */
  var LINEAGE_NOTES = [
    { code: 'NT-2605-00098', title: 'Initial trial — spec not met',                   st: 'fail', ver: 'v1', date: '2026-05-21', nb: 'Flexible OLED',      project: 'SN-26-0018' },
    { code: 'NT-2605-00118', title: 'Viscosity Modifier ratio tuning (v2)',           st: 'hold', ver: 'v2', date: '2026-05-27', parent: 'NT-2605-00098', nb: 'RGBOLED Adhesive',   project: 'SN-26-0031' },
    { code: 'NT-2605-00097', title: 'Cure rate vs UV dose — condition sweep',         st: 'ok',   ver: 'v1', date: '2026-05-24', parent: 'NT-2605-00118', nb: 'RGBOLED Adhesive',   project: 'SN-26-0031' },
    { code: 'NT-2605-00072', title: 'Crosslinker screening for adhesion',             st: 'ing',  ver: '',   date: '2026-05-15', parent: 'NT-2605-00098', nb: 'Crosslinker Studies', project: 'SN-26-0031' },
    { code: 'NT-2605-00142', title: 'UV-Curable PSA Viscosity Improvement — RGBOLED', st: 'ing',  ver: 'v3', date: '2026-05-28', parent: 'NT-2605-00118', nb: 'RGBOLED Adhesive',   project: 'SN-26-0031' }
  ];
  var CURRENT_CODE = 'NT-2605-00142';  // 지금 보고 있는 노트(헤더 [NT-2605-00142]와 일치)
  var newVerSeq = 3;                   // 현재 v3 → "New version"은 v4부터

  function lineageIndex() { var idx = {}; LINEAGE_NOTES.forEach(function (n) { idx[n.code] = n; }); return idx; }
  function lineageChildren(code) { return LINEAGE_NOTES.filter(function (n) { return n.parent === code; }); }
  function lineageRoot(note, idx) { var r = note, g = 0; while (r && r.parent && idx[r.parent] && g++ < 100) r = idx[r.parent]; return r; }
  // 파생 트리를 평탄화: [{note, depth, current}] (자식은 날짜 오름차순). 루트부터 DFS
  function computeLineage(code) {
    var idx = lineageIndex();
    var start = idx[code]; if (!start) return [];
    var root = lineageRoot(start, idx);
    var out = [];
    (function walk(c, depth) {
      var node = idx[c]; if (!node) return;
      out.push({ note: node, depth: depth, current: node.code === CURRENT_CODE });
      lineageChildren(c).sort(function (a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); })
        .forEach(function (k) { walk(k.code, depth + 1); });
    })(root.code, 0);
    return out;
  }

  function directLineage(code) {
    // 직계만: 조상 전부(root→current) + 분기 전까지의 자손. 전체 분기는 Full view 그래프
    var idx = lineageIndex(), start = idx[code]; if (!start) return [];
    var out = [], c = start, g = 0;
    while (c && g++ < 200) { out.unshift({ note: c, current: c.code === CURRENT_CODE }); c = c.parent ? idx[c.parent] : null; }
    var cur = start, h = 0;
    while (h++ < 200) { var kids = lineageChildren(cur.code); if (kids.length !== 1) break; cur = kids[0]; out.push({ note: cur, current: false }); }
    return out;
  }

  function renderLineage() {
    var box = document.getElementById('elnLineage');
    if (!box) return;
    box.innerHTML = '';
    box.className = 'elnLineage elnGraphScroll';
    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('class', 'elnHistoryGraph');
    box.appendChild(svg);
    // History 열면 그래프(구 Full view 내용)를 바로 표시 — 모달/Full view 링크 없이
    ELN.historyGraph(svg, { notes: LINEAGE_NOTES, currentCode: CURRENT_CODE, onOpenNote: openNoteFromGraph });
  }

  function initLineage() {
    var box = document.getElementById('elnLineage');
    if (!box) return;
    renderLineage();
    box.addEventListener('click', function (e) {
      var node = e.target.closest('.elnLineNode[data-code]');
      if (!node) return;
      var n = lineageIndex()[node.dataset.code];
      if (!n) return;
      if (n.code === CURRENT_CODE) { ELN.toast('This is the note you are viewing.', 'info'); return; }
      ELN.modal({
        title: n.title, icon: 'account_tree',
        body: n.code + ' · ' + (n.ver || '—') + ' · ' + (STATUS_LABEL[n.st] || n.st),
        actions: [
          { label: 'Open this note', type: 'hBlue', onClick: function () { ELN.toast('Opening ' + n.code + '.', 'info'); } },
          { label: 'Close', type: '' }
        ]
      });
    });
    // "New version" → 보고 있는 노트를 parent로 자동 지정한 파생 노트 생성(= History 모델 실동작)
    var nv = document.getElementById('elnNewVersion');
    if (nv) nv.addEventListener('click', function (e) {
      e.preventDefault();
      newVerSeq += 1;
      var ver = 'v' + newVerSeq;
      var code = 'NT-2605-00' + (142 + newVerSeq - 3);  // 데모용 신규 코드(143, 144 …)
      LINEAGE_NOTES.push({
        code: code, title: 'New version (draft)', st: 'ing', ver: ver,
        date: '2026-05-29', parent: CURRENT_CODE, _new: true
      });
      renderLineage();                                   // 현재 노트 History에 새 버전 노드 반영
      ELN.toast('Created ' + code + ' (' + ver + ') — opening…', 'ok');
      // 즉시 새 버전 팝업으로 이동해 작업(파생: parent=현재 노트)
      window.open('apis_eln_pop.html?newver=' + encodeURIComponent(ver) + '&parent=' + encodeURIComponent(CURRENT_CODE),
        'elnNote_' + code, 'width=1480,height=900,scrollbars=yes,resizable=yes');
    });
  }
  document.addEventListener('DOMContentLoaded', initLineage);

  /* ── History "Full view" 모달 그래프 = 재사용 가능한 공개 렌더러 ──
     pop·list 양쪽이 호출. notes(parent 포함 배열)+currentCode를 주면 트리/접기/SVG를 자체 계산.
     요약 인라인은 일직선, 이 그래프는 분기 트리. 점=접기/펴기(점 안 +/−), 타이틀=onOpenNote(code). */
  var SVGNS = 'http://www.w3.org/2000/svg';
  var STATUS_COLOR = { ing: '#2f80ed', appr: '#a893bd', ok: '#3aaa6f' };
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  // 모든 textarea: 수동 resize·스크롤 없이 내용에 따라 높이 자동 조절. 위임 input 리스너로 동적 모듈까지 커버
  function autoGrowTextarea(el) {
    if (!el || el.classList.contains('note-codable')) return;   // Summernote codeview 제외
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }
  document.addEventListener('input', function (e) { if (e.target && e.target.tagName === 'TEXTAREA') autoGrowTextarea(e.target); }, true);
  document.addEventListener('DOMContentLoaded', function () { document.querySelectorAll('textarea').forEach(autoGrowTextarea); });

  ELN.historyGraph = function (svg, opts) {
    opts = opts || {};
    var notes = opts.notes || [], current = opts.currentCode, onOpen = opts.onOpenNote || function () {};
    var W = opts.width || 516, collapsedSet = {};
    function index() { var m = {}; notes.forEach(function (n) { m[n.code] = n; }); return m; }
    function kids(c) { return notes.filter(function (n) { return n.parent === c; }); }
    function rootOf(n, m) { var r = n, g = 0; while (r && r.parent && m[r.parent] && g++ < 100) r = m[r.parent]; return r; }
    function descN(c) { var n = 0; kids(c).forEach(function (k) { n += 1 + descN(k.code); }); return n; }
    // 접힘 반영한 "보이는 노드 목록"(자식 날짜 오름차순). 루트부터 DFS, 접힌 노드는 자식으로 안 내려감
    function visible() {
      var m = index(), s = m[current]; if (!s) return [];
      var root = rootOf(s, m), out = [];
      (function walk(c, depth) {
        var nd = m[c]; if (!nd) return;
        var kk = kids(c).sort(function (a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });
        out.push({ note: nd, depth: depth, current: nd.code === current,
          hasKids: kk.length > 0, collapsed: !!collapsedSet[c], hidden: collapsedSet[c] ? descN(c) : 0 });
        if (!collapsedSet[c]) kk.forEach(function (k) { walk(k.code, depth + 1); });
      })(root.code, 0);
      return out;
    }
    // 직접 SVG: depth=레인(x), 순서=행(y), 부모로 ㄴ자 연결선
    function render() {
      var lin = visible();
      var LEFT = 24, LANE = 24, TOP = 34, ROW = 62, CR = 9, LABELGAP = 20, R = 8;
      var laneX = function (d) { return LEFT + d * LANE; };
      var rowY = function (i) { return TOP + i * ROW; };
      var rowOf = {}; lin.forEach(function (L, i) { rowOf[L.note.code] = i; });
      // 현재 노트의 notebook/project — 같으면 생략, 다른 노드에만 표시(계보는 그룹 경계를 넘나듦)
      var curNote = (function () { for (var k = 0; k < notes.length; k++) if (notes[k].code === current) return notes[k]; return {}; })();
      var frag = '';
      lin.forEach(function (L, i) {
        var p = L.note.parent; if (!p || rowOf[p] == null) return;
        var pi = rowOf[p], px = laneX(lin[pi].depth), py = rowY(pi), cx = laneX(L.depth), cy = rowY(i);
        frag += '<path class="gLink" d="M' + px + ' ' + py + ' V' + (cy - CR) + ' Q' + px + ' ' + cy + ' ' + (px + CR) + ' ' + cy + ' H' + cx + '"/>';
      });
      lin.forEach(function (L, i) {
        var n = L.note, col = STATUS_COLOR[n.st] || STATUS_COLOR.ing, x = laneX(L.depth), y = rowY(i), labelX = x + LABELGAP;
        frag += '<g class="gNode' + (L.hasKids ? ' exp' : '') + '" data-code="' + esc(n.code) + '">';
        if (L.current) frag += '<circle class="curRingPing" cx="' + x + '" cy="' + y + '" r="12"/><circle class="curRing" cx="' + x + '" cy="' + y + '" r="11.5"/>';
        frag += '<circle class="gDot' + (L.hasKids ? ' exp' : '') + '" cx="' + x + '" cy="' + y + '" r="' + R + '" fill="' + col + '"/>';
        if (L.hasKids) {
          frag += '<line class="gSign" x1="' + (x - 3.2) + '" y1="' + y + '" x2="' + (x + 3.2) + '" y2="' + y + '"/>';
          if (L.collapsed) frag += '<line class="gSign" x1="' + x + '" y1="' + (y - 3.2) + '" x2="' + x + '" y2="' + (y + 3.2) + '"/>';
        }
        frag += '<text class="gTitle' + (L.current ? ' cur' : '') + '" x="' + labelX + '" y="' + (y - 3) + '">' + esc(n.title) +
          '' +
          (L.collapsed ? '   <tspan class="gHidden">+' + L.hidden + ' hidden</tspan>' : '') + '</text>';
        frag += '<text class="gCode" x="' + labelX + '" y="' + (y + 13) + '">' + esc(n.code) +
          '   <tspan class="gPill" fill="' + col + '">● ' + esc(STATUS_LABEL[n.st] || n.st) + '</tspan>' +
          (n.nb && n.nb !== curNote.nb ? '   <tspan class="gDiff">▸ ' + esc(n.nb) + '</tspan>' : '') +
          (n.project && n.project !== curNote.project ? '   <tspan class="gDiff">· ' + esc(n.project) + '</tspan>' : '') +
          '</text>';
        frag += '<rect class="gHit" data-code="' + esc(n.code) + '" x="' + labelX + '" y="' + (y - 16) + '" width="' + (W - labelX - 8) + '" height="32" fill="transparent"/>';
        frag += '</g>';
      });
      svg.setAttribute('width', W);
      svg.setAttribute('height', rowY(lin.length - 1) + TOP);
      svg.innerHTML = frag;
      svg.querySelectorAll('.gDot.exp').forEach(function (d) {     // 점 = 접기/펴기
        d.addEventListener('click', function (e) {
          e.stopPropagation();
          var code = d.parentNode.getAttribute('data-code');
          collapsedSet[code] = !collapsedSet[code];
          render();
        });
      });
      svg.querySelectorAll('.gHit').forEach(function (h) {         // 타이틀 = 노트 이동(onOpenNote)
        var g = h.parentNode;
        h.addEventListener('click', function () { onOpen(h.getAttribute('data-code')); });
        h.addEventListener('mouseenter', function () { g.classList.add('lnkHover'); });
        h.addEventListener('mouseleave', function () { g.classList.remove('lnkHover'); });
      });
    }
    render();
  };

  function openNoteFromGraph(code) {
    if (code === CURRENT_CODE) { ELN.toast('This is the note you are viewing.', 'info'); return; }
    var n = lineageIndex()[code];
    ELN.toast('Opening ' + code + (n ? ' — ' + n.title : '') + '.', 'info');
  }

  function openHistoryModal() {
    var wrap = document.createElement('div');
    wrap.className = 'elnGraphScroll';
    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('class', 'elnHistoryGraph');
    wrap.appendChild(svg);
    ELN.modal({ title: 'Note History', icon: 'account_tree', body: wrap, actions: [{ label: 'Close', type: '' }] });
    ELN.historyGraph(svg, { notes: LINEAGE_NOTES, currentCode: CURRENT_CODE, onOpenNote: openNoteFromGraph });
  }

  function initHistoryFull() {
    var btn = document.getElementById('elnHistoryFull');
    if (btn) btn.addEventListener('click', function (e) { e.preventDefault(); openHistoryModal(); });
  }
  document.addEventListener('DOMContentLoaded', initHistoryFull);

  /* ── BIOVIA식 모듈러 노트: 기본 템플릿 + 모듈 추가/삭제(고정 템플릿 탈피) ── */
  var MODULE_TYPES = [
    { key: 'editor',   icon: 'edit_note',   title: 'Editor',             desc: 'Rich text — text, tables, images' },
    { key: 'table',    icon: 'insert_chart', title: 'Data Visualization', desc: 'Editable table + multi-series chart' },
    { key: 'chem',     icon: 'hexagon',     title: 'ChemStudio',         desc: 'Sketch a chemical structure' },
    { key: 'fml',      icon: 'blender',     title: 'Formulation',        desc: 'Embed from formulator' },
    { key: 'related',  icon: 'hub',         title: 'Related Items',      desc: 'Link materials · projects · notes · URLs' },
    { key: 'attach',   icon: 'attach_file', title: 'Attachments',        desc: 'Files & documents' }
  ];

  function moduleSampleBody(key) {
    switch (key) {
      case 'editor': return '<div class="elnSummernote"></div>';
      case 'table': {
        var VIZ = [['table', 'table_chart', 'Table'], ['column', 'bar_chart', 'Column'], ['bar', 'bar_chart', 'Bar'], ['line', 'show_chart', 'Line'], ['area', 'area_chart', 'Area'], ['pie', 'pie_chart', 'Pie'], ['donut', 'donut_small', 'Donut'], ['scatter', 'scatter_plot', 'Scatter'], ['bubble', 'bubble_chart', 'Bubble']];
        var vizTiles = VIZ.map(function (v) { return '<button type="button" class="elnVizOpt' + (v[0] === 'bar' ? ' bar' : '') + '" data-viz="' + v[0] + '"><i class="material-symbols-outlined">' + v[1] + '</i><span>' + v[2] + '</span></button>'; }).join('');
        return '<div class="elnDataBox">'
          + '<div class="elnVizLabel">Visualize as</div>'
          + '<div class="elnVizPick">' + vizTiles + '</div>'
          + '<div class="elnVizStage">'
          + '<div class="elnVizEmpty"><i class="material-symbols-outlined">insights</i>Pick a view above to see your data</div>'
          + '<div class="elnDataChart" style="display:none;"></div>'
          + '<div class="elnChartGrip" style="display:none;" title="Drag to resize chart height"><i class="material-symbols-outlined">drag_handle</i></div>'
          + '<div class="elnDataTableTools" style="display:none;">'
          + '<a href="javascript:;" class="waves-effect waves-light hBtn hSmall elnDataBtn" data-act="addRow"><i class="material-symbols-outlined left">add</i><span class="label">Row</span></a>'
          + '<a href="javascript:;" class="waves-effect waves-light hBtn hSmall elnDataBtn" data-act="addCol"><i class="material-symbols-outlined left">add</i><span class="label">Series</span></a>'
          + '<span class="elnDataHint"><i class="material-symbols-outlined">content_paste</i>Click a cell, then Ctrl+V to paste from Excel</span>'
          + '<span class="elnDataPieHint"></span>'
          + '</div>'
          + '<div class="fixedTable hBorderTable hScroll elnDataTableWrap" style="display:none;"><table class="elnDataTable">'
          + '<thead><tr><th contenteditable="true">Category</th><th contenteditable="true">Sample A</th><th contenteditable="true">Sample B</th></tr></thead>'
          + '<tbody>'
          + '<tr><td contenteditable="true">Item 1</td><td contenteditable="true">38</td><td contenteditable="true">31</td></tr>'
          + '<tr><td contenteditable="true">Item 2</td><td contenteditable="true">12</td><td contenteditable="true">18</td></tr>'
          + '<tr><td contenteditable="true">Item 3</td><td contenteditable="true">28</td><td contenteditable="true">24</td></tr>'
          + '<tr><td contenteditable="true">Item 4</td><td contenteditable="true">22</td><td contenteditable="true">27</td></tr>'
          + '</tbody></table></div>'
          + '</div></div>';
      }
      case 'fml': return '<div class="elnFmlHead"><i class="material-symbols-outlined">science</i>'
        + '<div class="elnFmlId">No formulation linked yet</div>'
        + '<a href="javascript:;" class="waves-effect waves-light hBtn elnFmlLink"><i class="material-symbols-outlined left">link</i>Link…</a></div>';
      case 'attach': return '<div class="elnAttachBox">'
        + '<label class="elnAttachDrop"><i class="material-symbols-outlined">upload_file</i>'
        + '<span>Drop files or <b>choose</b></span><input type="file" class="elnFileInput" multiple hidden></label>'
        + '<ul class="elnAttachList"></ul></div>';
      case 'related': return '<div class="elnRelBox">'
        + '<ul class="elnRelList">'
        + '<li class="elnRelItem"><i class="material-symbols-outlined">science</i><span class="elnRelType">Material</span><a href="javascript:;" class="elnRelLink">[RM-0421] UV Photoinitiator</a><i class="material-symbols-outlined elnRelDel" title="Remove">close</i></li>'
        + '<li class="elnRelItem"><i class="material-symbols-outlined">rocket_launch</i><span class="elnRelType">Project</span><a href="javascript:;" class="elnRelLink">[SN-26-0031] RGBOLED Display Adhesive</a><i class="material-symbols-outlined elnRelDel" title="Remove">close</i></li>'
        + '</ul>'
        + '<a href="javascript:;" class="waves-effect waves-light hBtn elnRelAddBtn"><i class="material-symbols-outlined left">add</i>Add Item</a></div>';
      case 'chem': return '<div class="elnChemBox">'
        + '<ul class="elnChemList"></ul>'
        + '<div class="elnChemEmptyLine"><i class="material-symbols-outlined">hexagon</i>No structures yet — add one or more from ChemStudio.</div>'
        + '<div class="elnChemAdd">'
        + '<a href="javascript:;" class="waves-effect waves-light hBtn elnChemOpen"><i class="material-symbols-outlined left">add</i>Add New</a>'
        + '<a href="javascript:;" class="waves-effect waves-light hBtn elnChemLink"><i class="material-symbols-outlined left">library_add</i>Add Existing</a>'
        + '</div></div>';
      default: return '<div class="elnModText">…</div>';
    }
  }

  // (개별 섹션 lock 제거됨 — 노트 전체 view 모드는 Approval 'Approve'가 일괄 전환. setNoteApproved 참조)

  // 카드 헤더 우측 끝 × — 섹션(모듈) 삭제. (VS Code Local History E7sZ.js@06-08에서 원본 복원)
  function removeNoteModule(id) {
    var sec = document.getElementById(id); if (sec) sec.remove();
    var li = document.querySelector('.menuUl .menu-item[data-target="' + id + '"]'); if (li) li.remove();
    refreshDividers();
    ELN.toast('Module removed.', 'info');
  }

  function injectDeleteBtn(card) {
    var tit = card.querySelector('.cardTit2');
    if (!tit || tit.querySelector('.elnModDel')) return;
    var del = document.createElement('a');
    del.href = 'javascript:;'; del.className = 'elnModDel right'; del.title = 'Remove module';
    del.innerHTML = '<i class="material-symbols-outlined">close</i>';
    var cid = card.id;
    del.addEventListener('click', function () {
      if (typeof Swal === 'undefined') { if (window.confirm('Remove this section?')) removeNoteModule(cid); return; }
      Swal.fire({ title: 'Remove this section?', text: 'This module will be removed from the note.', icon: 'warning',
        showCancelButton: true, confirmButtonText: 'Remove', cancelButtonText: 'Cancel', confirmButtonColor: '#d65a5a' })
        .then(function (r) { if (r.isConfirmed) removeNoteModule(cid); });
    });
    tit.appendChild(del);   // lock 뒤(소스순서 마지막) → 우측 코너 끝(원래 × 자리)
  }

  // 좌측 목차 라벨을 카드 제목과 동기
  function syncTocLabel(cardId, text) {
    var sp = document.querySelector('.leftAside .menuUl .menu-item[data-target="' + cardId + '"] span');
    if (sp) sp.textContent = text;
  }
  // 좌측 메뉴 라벨 = 카드 제목(헤더) > '(Untitled)'
  function tocLabelFor(card) {
    var title = card.querySelector('.elnModTitle');
    var full = title ? (title.value != null ? title.value : title.textContent).trim() : '';
    return full || '(Untitled)';
  }

  // 카드 헤더 크롬: 제목 인라인 편집(input) — 모든 카드 공용, 1회만 적용
  function setupCardChrome(card) {
    var tit = card.querySelector('.cardTit2');
    if (!tit) return;
    // 1) 제목 → aniInput 텍스트 입력(원래 input과 동일 룩, 헤더 flex에서 남은 폭 전부 차지). 헤더의 첫 텍스트 노드를 input value로
    if (!tit.querySelector('.elnModTitle')) {
      var node = null;
      for (var i = 0; i < tit.childNodes.length; i++) {
        var c = tit.childNodes[i];
        if (c.nodeType === 3 && c.textContent.trim()) { node = c; break; }
      }
      var wrap = document.createElement('div');
      wrap.className = 'aniInput elnModTitleWrap';
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'browser-default elnModTitle';
      input.spellcheck = false;
      input.title = 'Click to rename';
      input.placeholder = 'Section title';
      input.value = node ? node.textContent.trim() : '';
      wrap.appendChild(input);
      var fb = document.createElement('span'); fb.className = 'focus-border';
      wrap.appendChild(fb);
      if (node) tit.replaceChild(wrap, node); else tit.appendChild(wrap);
      input.addEventListener('input', function () { syncTocLabel(card.id, tocLabelFor(card)); });
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
      input.addEventListener('blur', function () { syncTocLabel(card.id, tocLabelFor(card)); });  // 빈 제목은 카드엔 그대로, 메뉴만 '(Untitled)'
    }
    setupIconPicker(card);   // 2) 헤더 lead 아이콘 클릭 → 아이콘/채움 변경
  }
  // 헤더 lead 아이콘 변경 — 후보 그리드 + Fill 토글(라이브 적용). 패밀리는 material-symbols-outlined 하나로 통일
  var ICON_CANDIDATES = ['science', 'experiment', 'biotech', 'hexagon', 'blender', 'labs',
    'summarize', 'notes', 'description', 'article', 'edit_note', 'table_chart', 'bar_chart', 'show_chart', 'timeline',
    'hub', 'attach_file', 'link', 'draw', 'checklist', 'task_alt', 'fact_check', 'groups', 'inventory_2',
    'category', 'rocket_launch', 'account_tree', 'sell', 'lightbulb', 'target', 'thermostat', 'water_drop',
    'analytics', 'query_stats', 'monitoring', 'bubble_chart', 'scatter_plot', 'stacked_line_chart', 'calculate',
    'schema', 'polyline', 'colorize', 'opacity', 'eco', 'factory', 'precision_manufacturing', 'engineering',
    'build', 'tune', 'settings', 'key', 'verified', 'workspace_premium', 'emoji_objects', 'psychology',
    'vaccines', 'clinical_notes', 'assignment', 'flag', 'bookmark', 'label', 'image', 'picture_as_pdf',
    'event', 'bolt', 'whatshot', 'ac_unit', 'grade', 'recycling',
    'cancel', 'linked_services', 'search_check', 'info', 'help', 'error'];
  // 헤더 lead 아이콘 → 좌측 목차(menu-item) 아이콘 동기화(이름·채움)
  function syncNavIcon(ic) {
    var card = ic.closest('.cardBox'); if (!card) return;
    var nav = document.querySelector('.leftAside .menu-item[data-target="' + card.id + '"] i'); if (!nav) return;
    nav.textContent = (ic.textContent || '').trim();
    nav.classList.toggle('fill', ic.classList.contains('fill'));
  }
  // 같은 문자열을 아이콘폰트 / 일반폰트로 각각 측정. 유효 ligature는 한 글리프로 합쳐져 텍스트보다 훨씬 좁아짐
  function _measureW(name, asIcon) {
    var p = document.createElement('span');
    if (asIcon) p.className = 'material-symbols-outlined';
    p.style.cssText = 'position:absolute;left:-9999px;top:-9999px;visibility:hidden;font-size:48px;line-height:1;white-space:nowrap;letter-spacing:normal;font-variation-settings:normal;' + (asIcon ? '' : 'font-family:sans-serif;');
    p.textContent = name;
    document.body.appendChild(p);
    var w = p.offsetWidth; document.body.removeChild(p);
    return w;
  }
  function isValidSymbol(name) {
    if (!/^[a-z0-9_]{2,}$/.test(name)) return false;              // 형식: 소문자·숫자·언더스코어(2자+)
    var iconW = _measureW(name, true), textW = _measureW(name, false);
    return iconW > 0 && textW > 0 && iconW < textW * 0.7;        // 글리프(좁음) vs 텍스트(넓음)
  }
  function setupIconPicker(card) {
    if (card.id === 'card_basic' || card.id === 'card_approval') return;   // 고정 시스템 카드(Overview·Approval)는 아이콘 변경 불가
    var tit = card.querySelector('.cardTit2'); if (!tit) return;
    var ic = tit.querySelector('i.left'); if (!ic || ic._iconWired) return;
    ic._iconWired = true;
    ic.classList.add('elnIconPick');
    ic.title = 'Change icon';
    ic.addEventListener('click', function (e) {
      if (document.body.classList.contains('elnApproved')) return;   // 승인(전체 view) 시 변경 불가
      e.stopPropagation();
      openIconPicker(ic);
    });
  }
  function openIconPicker(ic) {
    var wrap = document.createElement('div'); wrap.className = 'elnIconPicker';
    var grid = document.createElement('div'); grid.className = 'elnIconGrid hScroll';
    var cur = (ic.textContent || '').trim();
    ICON_CANDIDATES.filter(function (n, i, a) { return a.indexOf(n) === i; }).sort().forEach(function (name) {   // 중복 제거 + 알파벳 정렬
      var b = document.createElement('button'); b.type = 'button';
      b.className = 'elnIconOpt' + (name === cur ? ' on' : '');
      b.title = name;
      b.innerHTML = '<i class="material-symbols-outlined' + (ic.classList.contains('fill') ? ' fill' : '') + '">' + name + '</i>';
      b.addEventListener('click', function () {
        ic.textContent = name;
        syncNavIcon(ic);                                          // 좌측 목차 아이콘도 동기화
        grid.querySelectorAll('.elnIconOpt').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
      });
      grid.appendChild(b);
    });
    var filled = ic.classList.contains('fill');
    var fillRow = document.createElement('div'); fillRow.className = 'elnIconFill';
    fillRow.innerHTML = '<span class="lbl">Style</span><div class="elnIconFillToggle">'
      + '<button type="button" class="elnFillOpt' + (!filled ? ' on' : '') + '" data-fill="0">Outline</button>'
      + '<button type="button" class="elnFillOpt' + (filled ? ' on' : '') + '" data-fill="1">Fill</button></div>';
    fillRow.querySelectorAll('.elnFillOpt').forEach(function (opt) {
      opt.addEventListener('click', function () {
        var on = opt.getAttribute('data-fill') === '1';
        ic.classList.toggle('fill', on);
        syncNavIcon(ic);                                          // 좌측 목차 아이콘 채움도 동기화
        fillRow.querySelectorAll('.elnFillOpt').forEach(function (x) { x.classList.remove('on'); });
        opt.classList.add('on');
        grid.querySelectorAll('.elnIconOpt i').forEach(function (gi) { gi.classList.toggle('fill', on); });   // 미리보기도 채움 반영
      });
    });
    // 전체 목록 access — 폰트에 codepoints가 없어 추출 불가하므로, 어떤 Material Symbol이든 이름을 직접 입력
    var custom = document.createElement('div'); custom.className = 'elnIconCustom';
    custom.innerHTML = '<input type="text" class="browser-default elnIconInput" placeholder="Type any Material Symbol name…">'
      + '<span class="elnIconPreview" title="Apply"><i class="material-symbols-outlined' + (ic.classList.contains('fill') ? ' fill' : '') + '">' + esc((ic.textContent || '').trim() || 'add') + '</i></span>';
    var hint = document.createElement('div'); hint.className = 'elnIconHint';
    hint.innerHTML = 'Browse names at <a href="https://fonts.google.com/icons" target="_blank" rel="noopener" class="elnIconLink">fonts.google.com/icons</a>';
    var input = custom.querySelector('.elnIconInput'), prevI = custom.querySelector('.elnIconPreview i');
    function reflect() {                                          // 입력 반영 + 무효 감지(깨진 텍스트 대신 'block' 아이콘)
      var v = input.value.trim();
      if (!v) { prevI.textContent = 'add'; custom.classList.remove('invalid'); return; }
      var ok = isValidSymbol(v);
      custom.classList.toggle('invalid', !ok);
      prevI.textContent = ok ? v : 'block';
    }
    input.addEventListener('input', reflect);
    function applyCustom() {
      var v = input.value.trim(); if (!v) return;
      if (!isValidSymbol(v)) { ELN.toast('“' + v + '” is not a valid Material Symbol.', 'warn'); return; }
      ic.textContent = v; syncNavIcon(ic);
      grid.querySelectorAll('.elnIconOpt').forEach(function (x) { x.classList.remove('on'); });
      ELN.toast('Icon set: ' + v, 'ok');
    }
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); applyCustom(); } });
    custom.querySelector('.elnIconPreview').addEventListener('click', applyCustom);
    wrap.appendChild(grid); wrap.appendChild(custom); wrap.appendChild(hint); wrap.appendChild(fillRow);
    ELN.popover({ anchor: ic, content: wrap, width: 282 });
  }

  var modSeq = 0;
  // after = 이 카드 다음에 삽입할 기준 카드(null이면 맨 끝 — 상시 + 블록 앞)
  function addNoteModule(t, after, silent) {
    var article = document.getElementById('tab_ov');
    if (!article) return;
    var id = 'card_mod_' + (++modSeq);
    var sec = document.createElement('section');
    sec.className = 'cardBox animate__animated animate__fadeIn mt10';
    sec.id = id;
    sec.setAttribute('data-modtype', t.key);   // 템플릿 캡처용 — 이 카드의 모듈 타입
    var tit = document.createElement('div');
    tit.className = 'cardTit2';
    var ic = document.createElement('i'); ic.className = 'material-symbols-outlined left'; ic.textContent = t.icon;
    tit.appendChild(ic);
    tit.appendChild(document.createTextNode(t.title));
    sec.appendChild(tit);
    var body = document.createElement('div'); body.className = 'elnBasic';
    body.innerHTML = moduleSampleBody(t.key);
    wireModuleBody(t.key, body);   // 첨부/링크 모듈이면 인스턴스 배선
    body.querySelectorAll('textarea').forEach(autoGrowTextarea);   // 추가된 textarea 초기 높이

    // 모듈 add 컨트롤(Add New/Add Existing/Add Item/Link…) → 제목 아래 별도 툴바(우측 정렬). Formulation 카드(.elnFmlToolbar)와 동일
    var addCtl = body.querySelector('.elnChemAdd, .elnRelAddBtn, .elnFmlLink');
    if (addCtl) {
      var modToolbar = document.createElement('div');
      modToolbar.className = 'elnFmlToolbar';
      modToolbar.appendChild(addCtl);
      sec.appendChild(modToolbar);
    }

    sec.appendChild(body);
    if (after && after.parentNode === article) article.insertBefore(sec, after.nextSibling);
    else article.insertBefore(sec, document.getElementById('card_approval'));   // 좌측 'Add Module' → Approval 카드 위에 추가
    injectDeleteBtn(sec);   // 우측 코너에 삭제 ×
    setupCardChrome(sec);   // 제목 인라인 편집 + 메모 줄
    // 좌측 목차도 같은 순서로 동기(기준 카드의 li 뒤에 삽입)
    var ul = document.querySelector('.leftAside .menuUl');
    if (ul) {
      var li = document.createElement('li');
      li.className = 'menu-item waves-effect waves-hColor';
      li.setAttribute('data-target', id);
      li.innerHTML = '<i class="material-symbols-outlined left">' + t.icon + '</i><span>' + t.title + '</span>';
      var refLi = after ? ul.querySelector('.menu-item[data-target="' + after.id + '"]') : null;
      // Approval은 시스템 항목 — 항상 목차 맨 아래 고정. 기준 없으면 Approval 앞에 삽입
      var apprLi = ul.querySelector('.menu-item[data-target="card_approval"]');
      if (refLi) ul.insertBefore(li, refLi.nextSibling);
      else if (apprLi) ul.insertBefore(li, apprLi);
      else ul.appendChild(li);
      setupNavItem(li);   // 새 목차 항목도 드래그 핸들 적용
    }
    refreshDividers();
    if (typeof initAllHBorderTableOverlays === 'function') { try { initAllHBorderTableOverlays(); } catch (e) {} }
    if (!silent) { ELN.toast('Module "' + t.title + '" added.', 'ok'); sec.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }

  // Add Module 모달 — 시스템 Materialize 모달(#addModuleModal) 사용.
  // 글래스/오버레이/뒤배경 blur는 기본 .modal 규칙 + glass_engine.js(.modal mousemove)가 처리.
  // 여기선 모듈 타일 그리드만 렌더 + 모달 열기.
  function renderModulePicker(after) {
    var grid = document.getElementById('addModuleGrid');
    if (!grid) return;
    grid.innerHTML = '';
    MODULE_TYPES.forEach(function (t) {
      var card = document.createElement('div'); card.className = 'elnAddPickCard waves-effect';
      var ic = document.createElement('i'); ic.className = 'material-symbols-outlined'; ic.textContent = t.icon;
      var tt = document.createElement('div'); tt.className = 't'; tt.textContent = t.title;
      var dd = document.createElement('div'); dd.className = 'd'; dd.textContent = t.desc;
      card.appendChild(ic); card.appendChild(tt); card.appendChild(dd);
      // per-box 색추적 + 3D 틸트 — 색추적은 시스템 글래스엔진(glass_engine.js의 전역 glassTrack)을 그대로 재사용
      card.addEventListener('mousemove', function (e) {
        if (typeof glassTrack === 'function') glassTrack.call(card, e);   // --olx/--oly/--ol-angle 갱신 (카드 ::before 글로우)
        var r = card.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width) * 100, y = ((e.clientY - r.top) / r.height) * 100;
        card.style.transform = 'perspective(600px) rotateX(' + ((50 - y) / 50 * 8) + 'deg) rotateY(' + ((x - 50) / 50 * 8) + 'deg) scale(1.02)';
      });
      card.addEventListener('mouseleave', function () {
        if (typeof glassClear === 'function') glassClear(card);
        card.style.transition = 'transform .3s ease'; card.style.transform = '';
        setTimeout(function () { card.style.transition = ''; }, 300);
      });
      card.addEventListener('click', function () {
        var inst = window.M && M.Modal.getInstance(document.getElementById('addModuleModal'));
        if (inst) inst.close();
        addNoteModule(t, after);
      });
      grid.appendChild(card);
    });
  }
  function openAddModuleModal(after) {
    renderModulePicker(after);
    var el = document.getElementById('addModuleModal');
    var inst = window.M && (M.Modal.getInstance(el) || M.Modal.init(el));
    if (inst) inst.open();
  }

  // 모듈 픽커 — 모달 대신 누른 자리에 앵커되는 popover(기존 8종 그리드 재사용)
  function openModulePicker(anchor, after, ev) {
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
    var ref = ev ? ELN.popover({ atPointer: { x: ev.clientX, y: ev.clientY }, content: grid, width: 400 })
                 : ELN.popover({ anchor: anchor, content: grid, width: 400 });
  }

  // 카드 사이 hover '+' 라인 — Notion식 위치 지정 삽입. 추가/삭제 때마다 재배치.
  // simple: 카드 사이 '+' divider 미사용 — 좌측 'Add Module' 버튼이 유일 진입점. 잔존 divider만 정리.
  function refreshDividers() {
    var article = document.getElementById('tab_ov');
    if (!article) return;
    article.querySelectorAll(':scope > .elnModDivider').forEach(function (d) { d.remove(); });
  }

  function initModuleSystem() {
    var btn = document.getElementById('elnAddModule');
    if (!btn) return; // 상세 화면에서만 동작
    // simple: 본문 끝 '+Add module' 블록·카드 사이 divider 제거 — 좌측 'Add Module' 버튼이 유일 진입점.
    // Add Module 모달 초기화 — apis_npdi_pop ProcessMap과 동일: 열릴 때 뒤배경에 .modalBlur, 닫힐 때 해제
    var addModalEl = document.getElementById('addModuleModal');
    if (addModalEl && window.M && M.Modal) {
      M.Modal.init(addModalEl, {
        onOpenStart: function () { document.querySelectorAll('header, aside, .contArea').forEach(function (n) { n.classList.add('modalBlur'); }); },
        onCloseStart: function () { document.querySelectorAll('header, aside, .contArea').forEach(function (n) { n.classList.remove('modalBlur'); }); }
      });
    }
    btn.addEventListener('click', function () { openAddModuleModal(null); });
    // 모든 카드(Overview 포함) 헤더에 제목 편집/메모 주입. (Approval 카드는 시스템 섹션 — 제외)
    document.querySelectorAll('.contArea article > .cardBox').forEach(function (card) {
      if (card.id === 'card_approval') return;
      if (card.id !== 'card_basic') injectDeleteBtn(card);   // Overview(필수 노트)는 삭제 제외
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

  /* ── 시작 템플릿 — 초기 구조(?tmpl=)·교체·저장 통합. 핵심: realizeTemplate(현재→타깃 재조정) ── */
  var MY_TMPL_KEY = 'eln.myTemplates';
  function loadMyTemplates() { try { return JSON.parse(localStorage.getItem(MY_TMPL_KEY) || '[]'); } catch (e) { return []; } }
  function saveMyTemplates(arr) { try { localStorage.setItem(MY_TMPL_KEY, JSON.stringify(arr)); } catch (e) {} }
  var STATIC_SECTION = { card_basic: 'overview', card_fml: 'formulation', card_concl: 'conclusion' };
  var MODULE_KEYS = ['editor', 'table', 'fml', 'related', 'attach', 'chem'];
  // Public 템플릿 정의(pop 측) — sections는 [{type,label}]
  var PUBLIC_TEMPLATES = [
    { key: 'empty',       icon: 'description', name: 'Blank',       sections: [{ type: 'overview', label: 'Overview' }] },
    { key: 'general',     icon: 'note',        name: 'General',     sections: [{ type: 'overview', label: 'Overview' }, { type: 'editor', label: 'Notes' }] },
    { key: 'formulation', icon: 'science',     name: 'Formulation', sections: [{ type: 'overview', label: 'Overview' }, { type: 'formulation', label: 'Formulation' }, { type: 'conclusion', label: 'Conclusion' }] }
  ];
  function templateByKey(key) { return PUBLIC_TEMPLATES.concat(loadMyTemplates()).filter(function (t) { return t.key === key; })[0]; }
  function templateSections(key) { var t = templateByKey(key); return (t && t.sections) || []; }
  // 정적 섹션(Formulation/Conclusion) 표시·숨김(데이터 보존 — 제거 대신 hide) + 좌측 네비 동기화
  // 현재 노트의 섹션 구성을 [{type,label}] 순서대로 캡처(데이터 제외). 제목은 .elnModTitle(아이콘과 분리된 깨끗한 텍스트)
  function captureStructure() {
    var out = [];
    document.querySelectorAll('#tab_ov > .cardBox').forEach(function (card) {
      var type = STATIC_SECTION[card.id] || card.getAttribute('data-modtype');
      if (!type) return;
      var titEl = card.querySelector('.elnModTitle');
      var label = titEl ? ((titEl.value != null ? titEl.value : titEl.textContent) || '').trim() : '';
      if (!label) label = type.charAt(0).toUpperCase() + type.slice(1);
      out.push({ type: type, label: label });
    });
    return out;
  }
  function removeSection(id) {                                   // 카드 + 좌측 네비 함께 제거
    var card = document.getElementById(id); if (card) card.remove();
    var nav = document.querySelector('.menu-item[data-target="' + id + '"]'); if (nav) nav.remove();
  }
  // 현재 구조를 타깃 템플릿 구조로 재조정. Overview·겹치는 동적 모듈은 유지(데이터 보존),
  // 타깃에 없는 섹션은 제거(정적 리치카드는 재생성 불가 → 한 번 빠지면 그 세션에선 복구 안 됨),
  // 타깃에만 있는 동적 모듈은 빈 상태로 추가. 끝에 divider 재배치. {added,removed} 반환
  function realizeTemplate(key) {
    var target = templateSections(key);
    if (!target.length) return { added: 0, removed: 0 };
    var targetTypes = target.map(function (s) { return s.type; });
    var summary = { added: 0, removed: 0 };
    ['card_fml', 'card_concl'].forEach(function (id) {           // 정적 카드: 타깃에 없으면 제거
      if (targetTypes.indexOf(STATIC_SECTION[id]) >= 0) return;
      if (document.getElementById(id)) { removeSection(id); summary.removed++; }
    });
    var present = {};                                           // 동적 모듈 재조정
    document.querySelectorAll('#tab_ov > .cardBox').forEach(function (card) {
      if (STATIC_SECTION[card.id]) return;
      var type = card.getAttribute('data-modtype'); if (!type) return;
      if (targetTypes.indexOf(type) >= 0) present[type] = true; // 겹침 → 유지(데이터 보존)
      else { card.remove(); summary.removed++; }                // 타깃에 없음 → 제거
    });
    target.forEach(function (s) {                               // 타깃에만 있는 동적 모듈 추가(조용히)
      if (s.type === 'overview' || MODULE_KEYS.indexOf(s.type) < 0 || present[s.type]) return;
      var mt = MODULE_TYPES.filter(function (m) { return m.key === s.type; })[0];
      if (mt) { addNoteModule({ key: mt.key, icon: mt.icon, title: s.label || mt.title }, null, true); present[s.type] = true; summary.added++; }
    });
    refreshDividers();   // 카드 추가/제거 후 섹션 사이 '+' 정리(제거만 한 경우에도 orphan divider 제거)
    return summary;
  }
  function initTemplate() {                                     // 초기 로드: ?tmpl= 있으면 그 구조로
    var tmpl = '';
    try { tmpl = new URLSearchParams(location.search).get('tmpl') || ''; } catch (e) {}
    if (tmpl) realizeTemplate(tmpl);
  }
  document.addEventListener('DOMContentLoaded', initTemplate);  // initModuleSystem(elnAddEnd·addNoteModule) 이후 실행
  // 기본 배치 — 상세 진입 시 6개 모듈을 모두 깔아둠. fml은 정적 Formulation 카드(card_fml),
  // 나머지 5개(editor/table/chem/related/attach)는 동적 추가. Conclusion은 없어진 모듈이라 제거.
  function initDefaultModules() {
    if (!document.getElementById('elnAddModule')) return;   // 상세 화면에서만
    removeSection('card_concl');
    ['editor', 'table', 'chem', 'related', 'attach'].forEach(function (key) {
      if (document.querySelector('#tab_ov [data-modtype="' + key + '"]')) return;   // 이미 있으면 skip
      var mt = MODULE_TYPES.filter(function (m) { return m.key === key; })[0];
      if (mt) addNoteModule(mt, null, true);   // silent
    });
  }
  document.addEventListener('DOMContentLoaded', initDefaultModules);   // initTemplate 이후 실행
  // 두 구조가 완전히 동일한지(타입·라벨 순서까지) — 중복 저장 방지용
  function sectionsEqual(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) { if (a[i].type !== b[i].type || a[i].label !== b[i].label) return false; }
    return true;
  }
  // "Save template" — 현재 구조에 이름 붙여 My Templates(localStorage, list와 공유)에 저장.
  // 구조가 완전히 동일한 템플릿이 이미 있으면 저장 중단(실제 구현 시 서버측에서도 동일 체크 권장)
  function saveCurrentAsTemplate() {
    var sections = captureStructure();
    var dup = loadMyTemplates().filter(function (t) { return sectionsEqual(t.sections || [], sections); })[0];
    if (dup) { ELN.toast('An identical template already exists: “' + dup.name + '”. Not saved.', 'warn'); return; }
    var input = document.createElement('input');
    input.type = 'text'; input.className = 'browser-default'; input.placeholder = 'Template name (e.g. UV-cure workflow)';
    ELN.modal({
      title: 'Save as template', icon: 'bookmark_add', body: input,
      actions: [
        { label: 'Cancel', type: '' },
        { label: 'Save', type: 'hViva', onClick: function () {
          var name = (input.value || '').trim();
          if (!name) { ELN.toast('Enter a template name.', 'warn'); return true; }   // 빈 이름 — 모달 유지
          var arr = loadMyTemplates();
          arr.unshift({ key: 'my_' + Date.now(), name: name, icon: 'bookmark', custom: true, sections: sections });
          saveMyTemplates(arr);
          ELN.toast('Template “' + name + '” saved (' + sections.length + ' sections).', 'ok');
        } }
      ]
    });
    setTimeout(function () { input.focus(); }, 60);
  }
  // "Swap template" — 현재 노트를 다른 템플릿으로 교체(Overview·겹침 유지). 픽커 모달
  function openTemplateSwitcher() {
    var wrap = document.createElement('div'); wrap.className = 'elnTmplPicker';
    function card(t) {
      var chips = (t.sections || []).map(function (s) { var lbl = (typeof s === 'string') ? s : (s.label || s.type); return '<span class="elnTmplChip">' + esc(lbl) + '</span>'; }).join('');
      return '<button type="button" class="elnTmplCard" data-key="' + esc(t.key) + '">'
        + '<div class="elnTmplCardTop"><i class="material-symbols-outlined">' + esc(t.icon || 'description') + '</i><span class="elnTmplName">' + esc(t.name) + '</span></div>'
        + '<div class="elnTmplChips">' + chips + '</div></button>';
    }
    var mine = loadMyTemplates();
    wrap.innerHTML = '<div class="elnTmplSwitchNote"><i class="material-symbols-outlined">info</i>Overview and overlapping sections are kept with their data; non-matching sections are removed.</div>'
      + (mine.length ? '<div class="elnTmplGroupLabel">My Templates</div><div class="elnTmplGrid">' + mine.map(card).join('') + '</div>' : '')
      + '<div class="elnTmplGroupLabel">Public Templates</div><div class="elnTmplGrid">' + PUBLIC_TEMPLATES.map(card).join('') + '</div>';
    var ref = ELN.modal({ title: 'Swap template', icon: 'swap_horiz', body: wrap, actions: [ { label: 'Cancel', type: '' } ] });
    wrap.querySelectorAll('.elnTmplCard').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-key'), t = templateByKey(key);
        ref.close();
        var s = realizeTemplate(key);
        ELN.toast('Swapped to ' + (t ? t.name : key) + ' — data kept · +' + s.added + ' / −' + s.removed + ' section(s).', 'ok');
      });
    });
  }
  document.addEventListener('DOMContentLoaded', function () {
    var save = document.getElementById('elnSaveTemplate');
    if (save) save.addEventListener('click', function (e) { e.preventDefault(); saveCurrentAsTemplate(); });
    var swap = document.getElementById('elnChangeTemplate');
    if (swap) swap.addEventListener('click', function (e) { e.preventDefault(); openTemplateSwitcher(); });
  });

  /* ── 전자결재(Approval/결재선) — MAPIS 결재 패턴. 상신·승인·반려·반송·취소, 최종 승인 시 노트 잠금·불변 ── */
  function nowStamp() { try { return new Date().toISOString().slice(0, 16).replace('T', ' '); } catch (e) { return '—'; } }
  // MAPIS 결재선 구조: Type / Function(role) / Assignee / Date / Status / Comments. 옵션 정의
  var APPR_TYPES = [['APPR', 'Approval'], ['AGREE', 'Agree'], ['REF', 'Notification'], ['REQ', 'Request']];
  var APPR_ROLES = [['APPR_TECH', 'Technology'], ['APPR_MKT', 'Marketing'], ['APPR_GAPT', 'GAPT'], ['APPR_MFG', 'Manufacturing/Tolling'],
    ['APPR_OPS', 'Strategic OPS Leader'], ['APPR_PS', 'Product Stewardship'], ['APPR_QUAL', 'Quality'], ['APPR_PROCURE', 'Procurement'],
    ['APPR_PRODMNG', 'Product Management'], ['APPR_GTC', 'Global Trade Compliance']];
  var APPR_STATUSES = [['', '—'], ['APPR', 'Approved'], ['REJT', 'Not Approved']];
  var ELN_APPR_ROWS = [
    { type: 'APPR', role: 'APPR_TECH', assignee: 'Venkatakrishnan, Aishwarya', status: '', date: '', comment: '' },
    { type: 'APPR', role: 'APPR_MKT', assignee: '-', status: '', date: '', comment: '' },
    { type: 'APPR', role: 'APPR_OPS', assignee: '-', status: '', date: '', comment: '' },
    { type: 'APPR', role: 'APPR_GAPT', assignee: '-', status: '', date: '', comment: '' },
    { type: 'APPR', role: 'APPR_PS', assignee: '-', status: '', date: '', comment: '' },
    { type: 'APPR', role: 'APPR_PRODMNG', assignee: '-', status: '', date: '', comment: '' },
    { type: 'REF', role: 'APPR_QUAL', assignee: '-', status: '', date: '', comment: '' },
    { type: 'REF', role: 'APPR_GTC', assignee: '-', status: '', date: '', comment: '' }
  ];
  var apprView = false;   // false=Edit / true=View(승인 모드)
  function apprLabel(list, val) { for (var i = 0; i < list.length; i++) if (list[i][0] === val) return list[i][1]; return val; }
  function apprSel(cls, list, val) { return '<select class="browser-default ' + cls + '">' + list.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === val ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; }
  function apprStCls(s) { return s === 'APPR' ? 'approved' : (s === 'REJT' ? 'rejected' : 'pending'); }
  // 헤더 배지 — View(승인) 모드에서만 노출
  function renderApprovalBadge() {
    var el = document.getElementById('elnApprovalBadge'); if (!el) return;
    if (!apprView) { el.style.display = 'none'; return; }
    el.className = 'elnApprBadge approved';
    el.innerHTML = '<i class="material-symbols-outlined">verified</i>승인 모드 · View';
    el.style.display = '';
  }
  // 편집 테이블의 현재 select/input 값을 데이터에 반영(모드 전환·행 추가 전 보존)
  function readApprEditor(body) {
    body.querySelectorAll('#tbody_apprEditor tr[data-i]').forEach(function (tr) {
      var r = ELN_APPR_ROWS[+tr.getAttribute('data-i')]; if (!r) return;
      var t = tr.querySelector('.appr-type-sel'); if (t) r.type = t.value;
      var ro = tr.querySelector('.appr-role-sel'); if (ro) r.role = ro.value;
      var s = tr.querySelector('.appr-status-sel'); if (s) r.status = s.value;
      var c = tr.querySelector('.appr-comment-input'); if (c) r.comment = c.value;
    });
  }
  function renderApprovalCard() {
    var body = document.getElementById('elnApprCardBody'); if (!body) return;
    var statusBadge = apprView
      ? '<span class="roundBox green font12 pl10 pr10 fontR"><i class="material-symbols-outlined left font14 mr5">check_circle</i>승인 모드 · View</span>'
      : '<span class="roundBox grey font12 pl10 pr10 fontR"><i class="material-symbols-outlined left font14 mr5">circle</i>시작되지 않음 · Not started</span>';
    var head = '<div class="fLine vCenter hSB elnApprHead">' + statusBadge
      + '<div class="fLine elnApprActionBar">'
      + '<a href="javascript:;" class="waves-effect waves-hColor hBtn hBlue font13" data-act="sendEmail"><i class="material-symbols-outlined left font16">send</i>Send Email</a>'
      + '<a href="javascript:;" class="waves-effect waves-hColor hBtn ' + (apprView ? 'hGrey' : 'hViva') + '" data-act="toggleView"><i class="material-symbols-outlined left">' + (apprView ? 'edit' : 'done_all') + '</i><span class="label">' + (apprView ? '편집 · Edit' : '승인 · Approve') + '</span></a>'
      + '</div></div>';
    var table;
    if (apprView) {
      table = '<div class="fixedTable vMiddle elnApprTableWrap"><table class="elnApprTable appr-status-table">'
        + '<thead><tr><th>Type</th><th class="al">Function</th><th class="al">Assignee</th><th>Status</th><th class="al">Comments</th><th>Date</th></tr></thead><tbody>'
        + ELN_APPR_ROWS.map(function (r) {
          return '<tr><td class="ac">' + esc(apprLabel(APPR_TYPES, r.type)) + '</td><td class="al">' + esc(apprLabel(APPR_ROLES, r.role)) + '</td>'
            + '<td class="al">' + esc(r.assignee || '-') + '</td>'
            + '<td class="ac"><span class="elnApprChip ' + apprStCls(r.status) + '">' + (r.status ? esc(apprLabel(APPR_STATUSES, r.status)) : '—') + '</span></td>'
            + '<td class="al">' + esc(r.comment || '') + '</td><td class="ac">' + (r.date || '—') + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    } else {
      table = '<div class="fixedTable hBorderTable vMiddle elnApprTableWrap"><table class="elnApprTable appr-editor-mode">'
        + '<thead><tr><th class="al">Type</th><th class="al">Function</th><th class="al">Assignee</th><th class="ac">Date</th><th class="ac">Status</th><th class="al">Comments</th><th></th></tr></thead>'
        + '<tbody id="tbody_apprEditor">'
        + ELN_APPR_ROWS.map(function (r, i) {
          return '<tr data-i="' + i + '"><td>' + apprSel('appr-type-sel', APPR_TYPES, r.type) + '</td>'
            + '<td>' + apprSel('appr-role-sel', APPR_ROLES, r.role) + '</td>'
            + '<td class="appr-assignee">' + esc(r.assignee || '-') + '</td>'
            + '<td class="ac appr-date">' + (r.date || '') + '</td>'
            + '<td class="ac">' + apprSel('appr-status-sel', APPR_STATUSES, r.status) + '</td>'
            + '<td><input type="text" class="browser-default appr-comment-input" value="' + esc(r.comment || '') + '" placeholder="Comment…"></td>'
            + '<td class="ac"><a href="javascript:;" class="appr-del" title="Remove"><i class="material-symbols-outlined">close</i></a></td></tr>';
        }).join('') + '</tbody></table></div>'
        + '<div class="elnApprAddRow"><a href="javascript:;" data-act="addRow"><i class="material-symbols-outlined">add</i>Add approver</a></div>';
    }
    body.innerHTML = head + table
      + '<div class="grey-text mt5 elnApprNote">※ 여기에 표시하려면 \'Teams\' 섹션에서 \'승인자\'를 선택해야 합니다.</div>';
    body.querySelectorAll('[data-act]').forEach(function (el) { el.addEventListener('click', function (e) { e.preventDefault(); doApprAction(el.getAttribute('data-act'), body); }); });
    body.querySelectorAll('.appr-del').forEach(function (d) { d.addEventListener('click', function () { readApprEditor(body); ELN_APPR_ROWS.splice(+d.closest('tr').getAttribute('data-i'), 1); renderApprovalCard(); }); });
  }
  // 'Approve'(toggleView) 시 노트 전체를 읽기전용 view로 일괄 전환 / Edit 복귀 시 편집 가능 복원.
  // Approval 카드는 renderApprovalCard가 별도 관리하므로 제외. 값은 또렷하게 두고 편집 affordance만 CSS(body.elnApproved)가 숨김.
  function setNoteApproved(approved) {
    document.body.classList.toggle('elnApproved', approved);
    var article = document.getElementById('tab_ov'); if (!article) return;
    article.querySelectorAll('.cardBox:not(#card_approval)').forEach(function (card) {
      card.querySelectorAll('input, textarea').forEach(function (el) { el.readOnly = approved; });
      card.querySelectorAll('select').forEach(function (el) { el.disabled = approved; });
      // 카드 제목·메모, DataTable 셀, Summernote 에디터, 포스트잇 본문 등 모든 contenteditable
      card.querySelectorAll('[contenteditable]').forEach(function (el) { el.setAttribute('contenteditable', approved ? 'false' : 'true'); });
    });
  }

  function doApprAction(act, body) {
    if (act === 'toggleView') {
      if (!apprView) readApprEditor(body);                              // 편집값 보존
      apprView = !apprView;
      if (apprView) ELN_APPR_ROWS.forEach(function (r) { if (r.status === 'APPR' && !r.date) r.date = nowStamp().slice(0, 10); });   // 승인행 날짜 자동(목업)
      setNoteApproved(apprView);                                        // 노트 전체 view ⇄ edit 일괄 전환
      setHeadStatus(apprView ? 'ok' : 'appr');                          // 헤더 status: 승인=Approved / 편집복귀=In Approval
      renderApprovalCard(); renderApprovalBadge();
      ELN.toast(apprView ? '승인 모드 — 노트 전체를 View로 전환했습니다.' : '편집 모드로 전환했습니다.', 'ok');
    } else if (act === 'addRow') {
      readApprEditor(body);
      ELN_APPR_ROWS.push({ type: 'APPR', role: '', assignee: '-', status: '', date: '', comment: '' });
      renderApprovalCard();
    } else if (act === 'sendEmail') {
      setHeadStatus('appr');                                            // 결재 요청 발송 → In Approval
      ELN.toast('승인 요청 메일을 발송했습니다 (목업).', 'ok');
    }
  }
  // Approval 카드는 apis_npdi_pop 와 동일한 정적 내용(HTML)으로 대체 → JS 렌더(renderApprovalCard/Badge) 초기 호출 제거.
  // 워크플로 함수들은 트리거(버튼)가 없어 비활성 상태로 남음.

  /* ── 포스트잇 — 섹션에 우클릭으로 부착(섹션 상대좌표 → reflow에 강함). 드래그 이동·접기·삭제. 저장은 실구현에서(프로토타입 제외) ── */
  function addPostit(card, clientX, clientY) {
    card.classList.add('elnPostitHost');   // 섹션을 positioning context로(상대좌표 기준계)
    var rect = card.getBoundingClientRect(), W = 200;
    var x = Math.max(4, Math.min(clientX - rect.left, card.clientWidth - W - 4));
    var y = Math.max(4, Math.min(clientY - rect.top, card.clientHeight - 30 - 4));
    var p = document.createElement('div'); p.className = 'elnPostit';
    p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.width = W + 'px';
    p.innerHTML = '<div class="elnPostitBar"><i class="elnPostitGrip material-symbols-outlined">drag_indicator</i>'
      + '<a href="javascript:;" class="elnPostitCollapse" title="Collapse"><i class="material-symbols-outlined">expand_less</i></a>'
      + '<a href="javascript:;" class="elnPostitClose" title="Remove"><i class="material-symbols-outlined">close</i></a></div>'
      + '<div class="elnPostitBody" contenteditable="true" data-ph="Note…"></div>';
    card.appendChild(p);
    p.querySelector('.elnPostitCollapse').addEventListener('click', function () {
      var col = p.classList.toggle('collapsed');
      this.querySelector('i').textContent = col ? 'expand_more' : 'expand_less';
    });
    p.querySelector('.elnPostitClose').addEventListener('click', function () { p.remove(); });
    var bar = p.querySelector('.elnPostitBar');
    bar.addEventListener('mousedown', function (e) {
      if (e.target.closest('.elnPostitCollapse, .elnPostitClose')) return;
      e.preventDefault();
      var sx = e.clientX, sy = e.clientY, ox = parseFloat(p.style.left) || 0, oy = parseFloat(p.style.top) || 0;
      var cw = card.clientWidth, ch = card.clientHeight, pw = p.offsetWidth, ph = p.offsetHeight;
      function mv(ev) {
        p.style.left = Math.max(2, Math.min(ox + (ev.clientX - sx), cw - pw - 2)) + 'px';
        p.style.top = Math.max(2, Math.min(oy + (ev.clientY - sy), ch - ph - 2)) + 'px';
      }
      function up() { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); }
      document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up);
    });
    setTimeout(function () { try { p.querySelector('.elnPostitBody').focus(); } catch (e) {} }, 30);
  }
  document.addEventListener('DOMContentLoaded', function () {
    var article = document.getElementById('tab_ov'); if (!article) return;
    // 우클릭 → context menu(액션 배열 → 향후 확장 용이). 메뉴 아이템 클릭으로 액션 실행
    var CTX_ACTIONS = [
      { icon: 'sticky_note_2', label: 'Add sticky note', run: function (card, x, y) { addPostit(card, x, y); } }
    ];
    article.addEventListener('contextmenu', function (e) {
      // 편집/인터랙티브 요소·기존 포스트잇 위에선 네이티브 메뉴 유지
      if (e.target.closest('input, textarea, [contenteditable="true"], .note-editable, a, button, .elnPostit, .elnModDel')) return;
      var card = e.target.closest('.cardBox'); if (!card) return;
      e.preventDefault();
      var px = e.clientX, py = e.clientY;
      var menu = document.createElement('div'); menu.className = 'elnCtxMenu';
      CTX_ACTIONS.forEach(function (a) {
        var it = document.createElement('div'); it.className = 'elnCtxMenuItem';
        it.innerHTML = '<i class="material-symbols-outlined">' + a.icon + '</i><span>' + a.label + '</span>';
        it.addEventListener('click', function () { ref.close(); a.run(card, px, py); });
        menu.appendChild(it);
      });
      var ref = ELN.popover({ atPointer: { x: px, y: py }, content: menu });
    });
  });

  /* ── Notebook 지정(No Notebook → 노트북 선택) — Overview 메타 클릭 → popover ── */
  // 워크스페이스(apis_eln_list.html)의 NB 키와 동일하게 유지(프로토타입 목업 데이터)
  var NOTEBOOKS = [
    { key: 'unfiled',   name: 'No Notebook',         icon: 'folder_off' },
    { key: 'rgboled',   name: 'RGBOLED Adhesive',    icon: 'folder' },
    { key: 'foled',     name: 'Flexible OLED',       icon: 'folder' },
    { key: 'optical',   name: 'Optical Clear Resin', icon: 'folder' },
    { key: 'customerA', name: 'Customer A Project',  icon: 'folder_shared' }
  ];

  function setNotebookMeta(name) {
    var v = document.getElementById('elnNbMeta');
    if (!v) return;
    v.setAttribute('data-nb', name);
    v.classList.toggle('empty', name === 'No Notebook');
    var link = v.querySelector('.elnNbLink');
    if (link) link.textContent = name;
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
        var wasUnfiled = cur === 'No Notebook';
        setNotebookMeta(nb.name);
        ELN.toast(nb.name === 'No Notebook' ? 'Note removed from notebook.'
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
    // 워크스페이스에서 ?nb= 로 진입 — No Notebook이면 'No Notebook' 상태로 시작
    var key = null;
    try { key = new URLSearchParams(location.search).get('nb'); } catch (e) {}
    var nb = NOTEBOOKS.filter(function (n) { return n.key === key; })[0];
    setNotebookMeta(nb ? nb.name : (v.getAttribute('data-nb') || 'RGBOLED Adhesive'));
    var chg = v.querySelector('.elnNbChange');
    if (chg) chg.addEventListener('click', function (e) { e.preventDefault(); openNotebookPicker(chg); });   // 값은 무이벤트(plain text), swap만 dropdown 픽커
  }
  document.addEventListener('DOMContentLoaded', initNotebookMeta);

  /* ── Project 선택: quick-search 픽커(Notebook 픽커 패턴 + 검색 필터). 프로젝트가 많아 검색형 ── */
  var PROJECTS = [
    '[SN-26-0031] RGBOLED Display Adhesive',
    '[SN-26-0018] Flexible OLED Encapsulant',
    '[CN-25-0204] Optical Clear Resin v2',
    '[SN-26-0007] Low-Temp Cure PSA',
    '[PT-26-0112] High-Refractive Index Coating',
    '[PT-25-0088] Anti-Glare Hard Coat',
    '[CN-26-0045] Foldable Display Bonding Film',
    '[SN-25-0176] UV-Blocking Optical Adhesive'
  ];

  // Project = 텍스트 + 링크(읽기 표시). 링크 클릭 → 그 프로젝트 상세 팝업(조회). 변경 UI 없음.
  function openProjectDetail() {
    var val = document.getElementById('elnProjVal');
    var name = val ? (val.getAttribute('data-proj') || '') : '';
    if (!name) { ELN.toast('No project linked to this note.', 'info'); return; }
    var code = (name.match(/\[([^\]]+)\]/) || [])[1] || '';
    ELN.toast('Opening project ' + (code || name) + '…', 'info');
    window.open('apis_npdi_pop.html', 'elnProjectDetail', 'width=1480,height=900,scrollbars=yes,resizable=yes');
  }
  function initProjectMeta() {
    var val = document.getElementById('elnProjVal');
    if (!val) return;
    var link = val.querySelector('.elnProjLink');
    if (link) link.addEventListener('click', function (e) { e.preventDefault(); openProjectDetail(); });
  }
  document.addEventListener('DOMContentLoaded', initProjectMeta);

  /* ── Schedule 위치 — 이 노트가 작성된 과제 Detailed Schedule(apis_npdi_pop) 위치. 스테이지(L1) → 그 아래 태스크 선택 ── */
  var PROJ_SCHEDULE = [
    { stage:'NPC',                tasks:['Basic Data & Concept Overview','DFV Rating','NPC Review'] },
    { stage:'NPI GO',             tasks:['Project Overview','Update Basic Data','Initial Project Schedule','Select Project Team & Stakeholders','Initial Project Financials','Functional Deliverables','NPI GO Review'] },
    { stage:'LAB FORMULATION',    tasks:['Update Project Overview Section','Update Functional Deliverables','LAB FORM. Review'] },
    { stage:'SCALE-UP',           tasks:['Update Project Overview Section','Update Functional Deliverables','SCALE-UP Review'] },
    { stage:'COMMERCIAL GO',      tasks:['Update Project Overview Section','Update Functional Deliverables','COMM GO Review'] },
    { stage:'POST LAUNCH REVIEW', tasks:['Performance Review','Quality & Capability Review','Financials Review (Plan vs Actual)','Project Learnings Capture','Stake Holder Review and Sign Off'] }
  ];
  function schedStageByName(n){ return PROJ_SCHEDULE.filter(function (s){ return s.stage === n; })[0] || null; }
  // 선택 스테이지의 태스크로 Task select 채움
  function fillSchedTasks(stageName, selectedTask){
    var sel = document.getElementById('elnSchedTask'); if (!sel) return;
    var st = schedStageByName(stageName), tasks = st ? st.tasks : [];
    sel.innerHTML = tasks.map(function (t){ return '<option value="' + esc(t) + '"' + (t === selectedTask ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('');
  }
  // npdi와 동일하게 Materialize FormSelect로 렌더 (중복 wrapper 방지: destroy 먼저)
  function schedReinit(sel){ if (window.M && M.FormSelect && sel){ var i = M.FormSelect.getInstance(sel); if (i) i.destroy(); M.FormSelect.init(sel); } }
  function initScheduleMeta(){
    var stageSel = document.getElementById('elnSchedStage');
    var taskSel  = document.getElementById('elnSchedTask');
    if (!stageSel || !taskSel) return;   // 상세 페이지에서만
    // 기본값(목업): 이 노트는 SCALE-UP 스테이지 / Update Project Overview Section 태스크에 작성
    var defStage = 'SCALE-UP', defTask = 'Update Project Overview Section';
    stageSel.innerHTML = PROJ_SCHEDULE.map(function (s){ return '<option value="' + esc(s.stage) + '"' + (s.stage === defStage ? ' selected' : '') + '>' + esc(s.stage) + '</option>'; }).join('');
    fillSchedTasks(defStage, defTask);
    stageSel.addEventListener('change', function (){ fillSchedTasks(this.value, null); schedReinit(taskSel); });
    // 페이지 공통 FormSelect init(하단 inline) 이후 한 번 더 적용 → 옵션 반영 + 단일 wrapper 보장
    setTimeout(function (){ schedReinit(stageSel); schedReinit(taskSel); }, 0);
  }
  document.addEventListener('DOMContentLoaded', initScheduleMeta);

  /* ── 상위 노트(Derived from) 지정 — 모든 노트에서 검색 선택. 계보는 notebook/project와 무관, 부모만 따라감 ── */
  function setParentMeta(code) {
    var val = document.getElementById('elnParentVal');
    if (!val) return;
    var idx = lineageIndex(), p = code ? idx[code] : null;
    val.setAttribute('data-parent', code || '');
    val.classList.toggle('empty', !code);
    var link = val.querySelector('.elnParentLink');
    if (link) link.textContent = p ? ('[' + p.code + '] ' + p.title) : 'None (root note)';
    var cur = idx[CURRENT_CODE];
    if (cur) { if (code) cur.parent = code; else delete cur.parent; }
    renderLineage();   // parent 갱신 → History 그래프 재계산
  }
  function descendantsOf(code) {
    var out = {};
    (function walk(c) { lineageChildren(c).forEach(function (k) { if (!out[k.code]) { out[k.code] = 1; walk(k.code); } }); })(code);
    return out;
  }
  function openParentPicker(anchor) {
    var val = document.getElementById('elnParentVal');
    var cur = val ? (val.getAttribute('data-parent') || '') : '';
    var blocked = descendantsOf(CURRENT_CODE); blocked[CURRENT_CODE] = 1;   // 자기 자신·자손 제외(순환 방지)
    var wrap = document.createElement('div'); wrap.className = 'elnPickWrap';
    var search = document.createElement('input');
    search.type = 'text'; search.className = 'browser-default elnPickSearch'; search.placeholder = 'Search notes…';
    var list = document.createElement('div'); list.className = 'elnPickList';
    function render(q) {
      list.innerHTML = '';
      var ql = (q || '').toLowerCase();
      if (!ql || 'none root'.indexOf(ql) >= 0) {
        var none = document.createElement('div'); none.className = 'elnPickRow elnPickNone' + (!cur ? ' cur' : ''); none.textContent = 'None (root note)';
        none.addEventListener('click', function () { ref.close(); if (!cur) return; setParentMeta(''); ELN.toast('Parent removed — root note.', 'info'); });
        list.appendChild(none);
      }
      var cands = LINEAGE_NOTES.filter(function (n) { return !blocked[n.code] && (n.code + ' ' + n.title).toLowerCase().indexOf(ql) >= 0; });
      cands.forEach(function (n) {
        var it = document.createElement('div'); it.className = 'elnPickRow' + (n.code === cur ? ' cur' : '');
        it.textContent = '[' + n.code + '] ' + n.title;
        it.addEventListener('click', function () { ref.close(); if (n.code === cur) return; setParentMeta(n.code); ELN.toast('Parent set to ' + n.code + '.', 'ok'); });
        list.appendChild(it);
      });
      if (!cands.length && (ql && 'none root'.indexOf(ql) < 0)) { var em = document.createElement('div'); em.className = 'elnPickEmpty'; em.textContent = 'No notes match.'; list.appendChild(em); }
    }
    search.addEventListener('input', function () { render(search.value); });
    wrap.appendChild(search); wrap.appendChild(list); render('');
    var ref = ELN.popover({ anchor: anchor, content: wrap, width: 380 });
    setTimeout(function () { search.focus(); }, 60);
  }
  function initParentMeta() {
    var val = document.getElementById('elnParentVal');
    if (!val) return;
    var chg = val.querySelector('.elnParentChange');
    if (chg) chg.addEventListener('click', function (e) { e.preventDefault(); openParentPicker(chg); });
  }
  document.addEventListener('DOMContentLoaded', initParentMeta);

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
    var tgt = li && li.getAttribute('data-target');
    if (!li || tgt === 'card_basic' || tgt === 'card_approval') return; // Overview·Approval 고정 → 핸들 없음
    if (li.querySelector('.elnNavHandle')) return;                       // 이미 처리됨
    // 좌측 아이콘·레이블은 건드리지 않고, 우측에 별도 드래그 핸들(absolute)을 띄움 → 레이블 레이아웃 영향 없음
    var h = document.createElement('i');
    h.className = 'material-symbols-outlined elnNavHandle';
    h.textContent = 'swap_vert';
    h.title = 'Drag to reorder';
    li.appendChild(h);
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
    // 좌측 목차 순서 → 카드를 같은 순서로 재배치(최하단 고정 Approval 카드 앞에 삽입)
    function syncCardsToMenu() {
      var end = document.getElementById('card_approval');
      var ids = pinBasicFirst($menu.children('.menu-item').map(function () { return $(this).attr('data-target'); }).get());
      ids.forEach(function (id) {
        if (id === 'card_approval') return;             // 결재 카드는 최하단 고정 — 이동 안 함
        var card = document.getElementById(id);
        if (card) article.insertBefore(card, end);
      });
    }

    // 좌측 목차: Overview 항목 제외. 옮기면 카드가 따라옴.
    $menu.sortable({
      items: '> .menu-item:not([data-target="card_basic"]):not([data-target="card_approval"])',
      axis: "y",
      handle: '.elnNavHandle',        // 우측 별도 핸들(좌측 아이콘·레이블 불변)
      placeholder: 'elnSortPhMenu',
      revert: 200,
      forcePlaceholderSize: true,
      tolerance: 'pointer',
      distance: 5,
      opacity: 0.9,
      update: function (e, ui) {
        // 시스템 항목 재고정 — Basic은 항상 맨 위, Approval은 항상 맨 아래(아래로 드롭돼도 되돌림)
        var $basic = $menu.children('.menu-item[data-target="card_basic"]');
        if ($basic.length) $menu.prepend($basic);
        var $appr = $menu.children('.menu-item[data-target="card_approval"]');
        if ($appr.length) $menu.append($appr);
        syncCardsToMenu();
        if (typeof refreshDividers === 'function') refreshDividers();
        ELN.toast('Module order updated.', 'ok');
        // 정렬한 섹션으로 스크롤 + 좌측 목차 active 동기
        var id = ui && ui.item ? ui.item.attr('data-target') : null;
        var card = id ? document.getElementById(id) : null;
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'start' });
          $menu.children('.menu-item').removeClass('active');
          ui.item.addClass('active');
        }
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

  // Related Items 모듈 — Material/Project/Note/URL 혼합 링크. scope = 모듈 본문
  function wireRelatedModule(scope) {
    var list = scope.querySelector('.elnRelList');
    var addBtn = scope.querySelector('.elnRelAddBtn');
    if (!list || !addBtn) return;
    var TYPE_ICON = { Material: 'science', Project: 'rocket_launch', Note: 'description', URL: 'link' };
    // 타입별 후보 풀(프로토타입 목업) — Project·Note는 기존 데이터 재사용
    function poolFor(label) {
      if (label === 'Material') return ['[RM-0421] UV Photoinitiator', '[RM-0532] Acrylic Monomer', '[RM-0210] Silica Filler (12 nm)', '[RM-0388] Silane Coupling Agent', '[RM-0145] Defoamer'];
      if (label === 'Project') return (typeof PROJECTS !== 'undefined' ? PROJECTS : []);
      if (label === 'Note') return LINEAGE_NOTES.map(function (n) { return '[' + n.code + '] ' + n.title; });
      return [];
    }
    function addRow(label, text) {
      var li = document.createElement('li'); li.className = 'elnRelItem';
      li.innerHTML = '<i class="material-symbols-outlined">' + TYPE_ICON[label] + '</i><span class="elnRelType">' + label + '</span>'
        + '<a href="javascript:;" class="elnRelLink">' + esc(text) + '</a><i class="material-symbols-outlined elnRelDel" title="Remove">close</i>';
      li.querySelector('.elnRelDel').addEventListener('click', function () { li.remove(); });
      list.appendChild(li);
    }
    list.querySelectorAll('.elnRelDel').forEach(function (d) {                 // 샘플 행 삭제 배선
      d.addEventListener('click', function () { d.closest('.elnRelItem').remove(); });
    });
    // 2단계: 타입 선택 → 해당 타입 quick-search → 항목 선택
    function openTypeSearch(label) {
      var items = poolFor(label);
      var wrap = document.createElement('div'); wrap.className = 'elnPickWrap';
      var back = document.createElement('div'); back.className = 'elnPickBack';
      back.innerHTML = '<i class="material-symbols-outlined">chevron_left</i>' + label;
      var search = document.createElement('input'); search.type = 'text'; search.className = 'browser-default elnPickSearch'; search.placeholder = 'Search ' + label.toLowerCase() + '…';
      var ul = document.createElement('div'); ul.className = 'elnPickList';
      function render(q) {
        ul.innerHTML = '';
        var ql = (q || '').toLowerCase();
        var matches = items.filter(function (s) { return s.toLowerCase().indexOf(ql) >= 0; });
        if (!matches.length) { var em = document.createElement('div'); em.className = 'elnPickEmpty'; em.textContent = 'No ' + label.toLowerCase() + ' match.'; ul.appendChild(em); return; }
        matches.forEach(function (s) {
          var it = document.createElement('div'); it.className = 'elnPickRow'; it.textContent = s;
          it.addEventListener('click', function () { ref.close(); addRow(label, s); ELN.toast(label + ' linked.', 'ok'); });
          ul.appendChild(it);
        });
      }
      back.addEventListener('click', function () { ref.close(); openAddMenu(); });   // 타입 메뉴로 되돌아가기
      search.addEventListener('input', function () { render(search.value); });
      wrap.appendChild(back); wrap.appendChild(search); wrap.appendChild(ul); render('');
      var ref = ELN.popover({ anchor: addBtn, content: wrap, width: 380 });
      setTimeout(function () { search.focus(); }, 60);
    }
    // 1단계: 타입 메뉴(URL은 검색 불필요 → 인라인)
    function openAddMenu() {
      var wrap = document.createElement('div'); wrap.className = 'elnRelMenu';
      var urlRow = document.createElement('div'); urlRow.className = 'elnRelUrlRow';
      var inp = document.createElement('input'); inp.type = 'text'; inp.className = 'browser-default'; inp.placeholder = 'Paste a URL…';
      var ub = document.createElement('button'); ub.type = 'button'; ub.className = 'elnLinkAddBtn'; ub.textContent = 'Add';
      function addUrl() { var u = normalizeUrl(inp.value); if (!u) { ELN.toast('Enter a URL first.', 'warn'); return; } ref.close(); addRow('URL', u); ELN.toast('Link added.', 'ok'); }
      ub.addEventListener('click', addUrl);
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } });
      urlRow.appendChild(inp); urlRow.appendChild(ub); wrap.appendChild(urlRow);
      ['Material', 'Project', 'Note'].forEach(function (label) {              // 타입 → 다음 단계(quick-search)
        var b = document.createElement('div'); b.className = 'elnRelMenuItem';
        b.innerHTML = '<i class="material-symbols-outlined">' + TYPE_ICON[label] + '</i>' + label + '<i class="material-symbols-outlined elnRelMenuChev">chevron_right</i>';
        b.addEventListener('click', function () { ref.close(); openTypeSearch(label); });
        wrap.appendChild(b);
      });
      var ref = ELN.popover({ anchor: addBtn, content: wrap, width: 260 });
      setTimeout(function () { inp.focus(); }, 60);
    }
    addBtn.addEventListener('click', openAddMenu);
  }
  // 모듈 본문 키별 추가 배선(첨부/Related)
  function wireModuleBody(key, body) {
    if (key === 'attach') wireFileModule(body);
    else if (key === 'related') wireRelatedModule(body);
    else if (key === 'chem') wireChemModule(body);
    else if (key === 'editor') wireEditorModule(body);
    else if (key === 'table') wireDataModule(body);
  }
  /* ── Data Table 모듈 — 편집 셀 + 행/열 추가 + Excel 붙여넣기(탭/줄바꿈 파싱) + 선택적 차트 ── */
  function wireDataModule(body) {
    var box = body.querySelector('.elnDataBox'); if (!box) return;
    var table = box.querySelector('.elnDataTable');
    function colCount() { return table.querySelector('thead tr').children.length; }
    function newCell(tag, txt) { var c = document.createElement(tag); c.setAttribute('contenteditable', 'true'); c.textContent = txt || ''; return c; }
    function addRow() { var tr = document.createElement('tr'); for (var i = 0; i < colCount(); i++) tr.appendChild(newCell('td')); table.querySelector('tbody').appendChild(tr); }
    function addCol() {   // 새 열 = 새 시리즈. 헤더 기본값 'Series N'(첫 열=카테고리라 colCount()가 곧 다음 번호)
      table.querySelector('thead tr').appendChild(newCell('th', 'Series ' + colCount()));
      table.querySelectorAll('tbody tr').forEach(function (tr) { tr.appendChild(newCell('td')); });
    }
    box.querySelectorAll('.elnDataBtn').forEach(function (b) {
      b.addEventListener('click', function () { var a = b.getAttribute('data-act'); if (a === 'addRow') addRow(); else if (a === 'addCol') addCol(); refresh(); });
    });
    // Excel 붙여넣기 — 포커스 셀부터 탭(열)·줄바꿈(행)으로 채움. 부족하면 행/열 자동 확장
    table.addEventListener('paste', function (e) {
      var txt = ((e.clipboardData || window.clipboardData) || {}).getData ? (e.clipboardData || window.clipboardData).getData('text/plain') : '';
      if (!txt || (txt.indexOf('\t') < 0 && txt.indexOf('\n') < 0)) return;   // 단일 값은 기본 동작
      e.preventDefault();
      var grid = txt.replace(/\r/g, '').replace(/\n+$/, '').split('\n').map(function (r) { return r.split('\t'); });
      var startCell = e.target.closest('td, th'); if (!startCell) return;
      var startRow = startCell.closest('tr'), inHead = startRow.parentNode.tagName === 'THEAD';
      var startCol = Array.prototype.indexOf.call(startRow.children, startCell);
      var bodyRows = Array.prototype.slice.call(table.querySelectorAll('tbody tr'));
      var startBodyIdx = inHead ? -1 : bodyRows.indexOf(startRow);
      grid.forEach(function (cells, ri) {
        var targetRow;
        if (inHead && ri === 0) targetRow = table.querySelector('thead tr');
        else {
          var bi = inHead ? ri - 1 : startBodyIdx + ri;
          while (bodyRows.length <= bi) { addRow(); bodyRows = Array.prototype.slice.call(table.querySelectorAll('tbody tr')); }
          targetRow = bodyRows[bi];
        }
        cells.forEach(function (val, ci) {
          var ti = startCol + ci;
          while (targetRow.children.length <= ti) addCol();
          targetRow.children[ti].textContent = val;
        });
      });
      refresh();
      ELN.toast('Pasted ' + grid.length + ' rows from Excel.', 'ok');
    });
    // 뷰 스위처(Visualize as) — 아이콘+라벨 타일. 초기 미선택 → 뷰를 골라야 표/차트가 보임.
    //   Shape A(column/bar/line/area): 1열=카테고리, 나머지 숫자열 각각=시리즈(헤더=시리즈명)
    //   Shape B(pie/donut): 1열=라벨, 첫 값열만 슬라이스 · Table: 차트 없이 순수 표
    var chartBox = box.querySelector('.elnDataChart');
    var emptyEl = box.querySelector('.elnVizEmpty'), grip = box.querySelector('.elnChartGrip');
    var tools = box.querySelector('.elnDataTableTools'), tableWrap = box.querySelector('.elnDataTableWrap');
    var pieHint = box.querySelector('.elnDataPieHint'), pickBtns = box.querySelectorAll('.elnVizOpt');
    var PALETTE = ['#A47864', '#7391c9', '#899f6a', '#bb6b80', '#c9a14e', '#6f9b9b'];
    var MINH = 180, MAXH = 620;   // 차트 높이 드래그 범위(min이 바닥)
    var curViz = null;   // 초기 미선택(기본 강조 없음 — 뷰를 골라야 보임)
    var hc = null;       // 현재 Highcharts 인스턴스(높이 리사이즈 refit·재렌더용)
    function isPie(t) { return t === 'pie' || t === 'donut'; }
    function isChart(t) { return !!t && t !== 'table'; }
    function numOf(s) { var n = parseFloat((s || '').replace(/,/g, '')); return isNaN(n) ? 0 : n; }
    function readData() {
      var heads = Array.prototype.slice.call(table.querySelectorAll('thead th')).map(function (th) { return (th.textContent || '').trim(); });
      var rows = Array.prototype.slice.call(table.querySelectorAll('tbody tr'));
      var cols = heads.length, cats = [], seriesVals = [];
      for (var j = 1; j < cols; j++) seriesVals.push([]);
      rows.forEach(function (tr) {
        var c = tr.children; if (!c.length) return;
        cats.push((c[0].textContent || '').trim());
        for (var j = 1; j < cols; j++) seriesVals[j - 1].push(numOf(c[j] ? c[j].textContent : ''));
      });
      return { heads: heads, cats: cats, seriesVals: seriesVals };
    }
    function isSeriesType(t) { return t === 'column' || t === 'bar' || t === 'line' || t === 'area'; }
    function shapeCols(t) { return isPie(t) ? 1 : (t === 'scatter' ? 2 : (t === 'bubble' ? 3 : Infinity)); }   // 값열 개수(시리즈형은 전부)
    function roleOf(t, vi) {   // vi=값열 1-based 인덱스 → 역할명
      if (isSeriesType(t)) return '';
      if (isPie(t)) return vi === 1 ? 'Value' : '';
      if (t === 'scatter') return vi === 1 ? 'X' : (vi === 2 ? 'Y' : '');
      if (t === 'bubble') return vi === 1 ? 'X' : (vi === 2 ? 'Y' : (vi === 3 ? 'Size' : ''));
      return '';
    }
    function setColDisplay(i, show) {   // i번째 열(헤더+모든 행 셀) 표시/숨김
      var d = show ? '' : 'none', hr = table.querySelector('thead tr');
      if (hr.children[i]) hr.children[i].style.display = d;
      table.querySelectorAll('tbody tr').forEach(function (tr) { if (tr.children[i]) tr.children[i].style.display = d; });
    }
    function setColPh(i, ph) {   // i번째 열 셀 placeholder(빈 셀에 '이 자리에 뭐가 오는지' 표시)
      table.querySelectorAll('tbody tr').forEach(function (tr) { var c = tr.children[i]; if (!c) return; if (ph) c.setAttribute('data-ph', ph); else c.removeAttribute('data-ph'); });
    }
    function catRole(t) { return isSeriesType(t) ? 'Category' : 'Label'; }   // 1열 역할
    function phForCol(t, i) {   // 빈 셀 안내: 1열=Category/Label, 시리즈형=그 시리즈 이름(헤더), 그 외=역할(X/Y/Size/Value)
      if (i === 0) return catRole(t);
      if (!isSeriesType(t)) return roleOf(t, i) || 'value';
      var th = table.querySelector('thead tr').children[i];
      return (th && (th.textContent || '').trim()) || ('Series ' + i);
    }
    var SAMPLE_FILL = [24, 38, 30, 45, 28, 33];   // 자동 추가 열 샘플값(차트가 비어보이지 않게)
    // 차트에 맞춰 표를 스마트하게 변형 — 값열 자동 추가(샘플채움)·남는 열 숨김·모든 열에 역할 배지/placeholder
    function adaptTable() {
      var hr = table.querySelector('thead tr');
      Array.prototype.slice.call(hr.children).forEach(function (th, i) {
        th.classList.remove('elnColCat', 'elnColSer', 'elnColUsed', 'elnColUnused'); th.style.removeProperty('--ser'); th.removeAttribute('data-role');
        setColDisplay(i, true); setColPh(i, '');   // 초기화
      });
      if (!isChart(curViz)) return;   // Table/미선택: 원본 그대로
      var need = shapeCols(curViz);
      if (need !== Infinity) {
        while ((hr.children.length - 1) < need) {   // 부족한 값열 자동 추가(역할명 헤더 + 샘플값)
          addCol();
          var nIdx = hr.children.length - 1, nr = roleOf(curViz, nIdx);
          if (nr) hr.children[nIdx].textContent = nr;
          table.querySelectorAll('tbody tr').forEach(function (tr, ri) { if (tr.children[nIdx]) tr.children[nIdx].textContent = SAMPLE_FILL[ri % SAMPLE_FILL.length]; });
        }
      }
      Array.prototype.slice.call(hr.children).forEach(function (th, i) {
        setColPh(i, phForCol(curViz, i));   // 모든 셀에 placeholder
        if (i === 0) { th.classList.add('elnColCat'); var cr = catRole(curViz); if (cr !== (th.textContent || '').trim()) th.setAttribute('data-role', cr); return; }   // 카테고리(라벨) + 배지(헤더와 중복이면 생략)
        if (need !== Infinity && i > need) { setColDisplay(i, false); setColPh(i, ''); return; }   // 남는 값열 숨김(데이터 보존)
        if (isSeriesType(curViz)) { th.classList.add('elnColSer'); th.style.setProperty('--ser', PALETTE[(i - 1) % PALETTE.length]); return; }
        th.classList.add('elnColUsed');
        var r = roleOf(curViz, i);
        if (r && (th.textContent || '').trim() !== r) th.setAttribute('data-role', r);
      });
    }
    function renderChart() {   // curViz가 차트일 때만 호출됨
      if (!window.Highcharts) { chartBox.innerHTML = '<div class="elnModChartPh"><i class="material-symbols-outlined">bar_chart</i>Chart (Highcharts not loaded)</div>'; return; }
      var t = curViz, d = readData();
      chartBox.innerHTML = '';
      if (isPie(t)) {   // Shape B — 첫 값열만 슬라이스
        var pieData = d.cats.map(function (name, i) { return { name: name, y: d.seriesVals.length ? d.seriesVals[0][i] : 0 }; });
        hc = Highcharts.chart(chartBox, {
          chart: { type: 'pie', height: null, backgroundColor: 'transparent' }, title: { text: null }, credits: { enabled: false },
          plotOptions: { pie: { innerSize: t === 'donut' ? '60%' : 0, colors: PALETTE, dataLabels: { enabled: true, style: { fontWeight: '600', textOutline: 'none' } } } },
          legend: { enabled: true }, series: [{ name: d.heads[1] || 'Value', data: pieData }]
        });
      } else if (t === 'scatter' || t === 'bubble') {   // Shape C/D — (x,y[,z]) 점, 각 행=점
        var pts = d.cats.map(function (name, ri) {
          var p = { name: name, x: d.seriesVals[0] ? d.seriesVals[0][ri] : 0, y: d.seriesVals[1] ? d.seriesVals[1][ri] : 0 };
          if (t === 'bubble') p.z = (d.seriesVals[2] && d.seriesVals[2][ri]) ? d.seriesVals[2][ri] : 1;   // Size 비었으면 동일 크기(1)
          return p;
        });
        hc = Highcharts.chart(chartBox, {
          chart: { type: t, height: null, backgroundColor: 'transparent' }, title: { text: null }, credits: { enabled: false }, legend: { enabled: false },
          xAxis: { title: { text: d.heads[1] || 'X' }, gridLineColor: '#eee6da', lineColor: '#d9cfc2' },
          yAxis: { title: { text: d.heads[2] || 'Y' }, gridLineColor: '#eee6da' },
          tooltip: { pointFormat: t === 'bubble' ? '{point.name}: ({point.x}, {point.y}) · size {point.z}' : '{point.name}: ({point.x}, {point.y})' },
          plotOptions: { series: { color: '#A47864', dataLabels: { enabled: t === 'bubble', format: '{point.name}' } } },
          series: [{ data: pts }]
        });
      } else {          // Shape A — 숫자열마다 시리즈
        var series = d.seriesVals.map(function (vals, idx) {
          return { name: d.heads[idx + 1] || ('Series ' + (idx + 1)), data: vals, color: PALETTE[idx % PALETTE.length], borderRadius: (t === 'column' || t === 'bar') ? 3 : 0 };
        });
        hc = Highcharts.chart(chartBox, {
          chart: { type: t, height: null, backgroundColor: 'transparent' }, title: { text: null }, credits: { enabled: false },
          legend: { enabled: series.length > 1 },
          xAxis: { categories: d.cats, lineColor: '#d9cfc2' }, yAxis: { title: { text: null }, gridLineColor: '#eee6da' },
          plotOptions: { area: { fillOpacity: 0.35 }, series: { marker: { enabled: t === 'line' || t === 'area' } } }, series: series
        });
      }
    }
    var HINTS = { pie: 'Pie/Donut uses the first value column', donut: 'Pie/Donut uses the first value column', scatter: 'Scatter: X = col 1, Y = col 2', bubble: 'Bubble: X = col 1, Y = col 2, size = col 3' };
    function applyHint() { if (!pieHint) return; var h = HINTS[curViz]; pieHint.textContent = h || ''; pieHint.style.display = h ? '' : 'none'; }
    function refresh() { adaptTable(); if (isChart(curViz)) renderChart(); }
    function setViz(type) {   // 타일 선택 적용. type=null이면 초기 placeholder(표·차트 모두 숨김)
      curViz = type || null;
      pickBtns.forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-viz') === curViz); });
      var has = !!curViz, chart = isChart(curViz);
      if (emptyEl) emptyEl.style.display = has ? 'none' : '';
      if (tools) tools.style.display = has ? '' : 'none';
      if (tableWrap) tableWrap.style.display = has ? '' : 'none';
      chartBox.style.display = chart ? '' : 'none';
      if (grip) grip.style.display = chart ? '' : 'none';
      var addColBtn = box.querySelector('.elnDataTableTools [data-act="addCol"]');   // + Series/Column — 시리즈형·Table에서만 의미
      if (addColBtn) {
        addColBtn.style.display = (curViz === 'table' || isSeriesType(curViz)) ? '' : 'none';
        var addColLbl = addColBtn.querySelector('.label');
        if (addColLbl) addColLbl.textContent = (curViz === 'table') ? 'Column' : 'Series';
      }
      applyHint();
      adaptTable();
      if (chart) renderChart();
    }
    // 차트 높이 — 전용 그립을 위아래로 드래그(min~max 클램프). ResizeObserver가 새 높이에 맞춰 refit
    if (grip) grip.addEventListener('mousedown', function (e) {
      e.preventDefault();
      var startY = e.clientY, startH = chartBox.offsetHeight;
      function mv(ev) { chartBox.style.height = Math.max(MINH, Math.min(MAXH, startH + (ev.clientY - startY))) + 'px'; }
      function up() { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); }
      document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up);
    });
    if (window.ResizeObserver) {   // 폭/높이 변화 → Highcharts 리플로우(드래그 높이·패널 리사이즈 모두 대응)
      new ResizeObserver(function () { if (hc && isChart(curViz)) { try { hc.reflow(); } catch (e) {} } }).observe(chartBox);
    }
    pickBtns.forEach(function (b) { b.addEventListener('click', function () { setViz(b.getAttribute('data-viz')); }); });
    // 셀 편집·행/열 추가 시 차트·열표시 갱신
    table.addEventListener('input', refresh);
    setViz(null);   // 초기: 뷰 미선택 placeholder
  }
  /* 붙여넣기(Excel 등) 저장 전략 — 별도 'Excel Paste' 모듈은 제거(Editor가 붙여넣기 UX를 커버).
     실제 구현 시 참고: Summernote는 붙여넣은 이미지를 base64로 HTML(nvarchar(max))에 인라인하므로
     - 이미지: onImageUpload 훅에서 파일 스토리지로 업로드 → <img src=파일URL>로 치환(HTML 비대화 방지)
     - 표: 붙여넣은 <table> HTML을 그대로 nvarchar(max)에 보관(이미 그렇게 동작) */
  // Editor 모듈 — Summernote(lite) 초기화. 미로드 시 contenteditable 폴백
  function wireEditorModule(body) {
    var el = body.querySelector('.elnSummernote'); if (!el) return;
    if (window.$ && $.fn && $.fn.summernote) {
      $(el).summernote({
        placeholder: 'Write rich text — formatting, tables, images…',
        height: 200,
        toolbar: [
          ['style', ['style']],
          ['font', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
          ['color', ['color']],
          ['para', ['ul', 'ol', 'paragraph']],
          ['table', ['table']],
          ['insert', ['link', 'picture']],
          ['view', ['codeview']]
        ]
      });
    } else {
      el.setAttribute('contenteditable', 'true');
      el.classList.add('elnSummernoteFallback');
      el.setAttribute('data-ph', 'Write rich text…');
    }
  }

  /* ── ChemStudio 모듈 — 외부 화학구조식 앱(별도 프로그램) 연계. 엔진은 목업.
     실배포: Open=ChemStudio Thymeleaf 앱을 iframe 임베드 / Link=저장된 구조 조회.
     참고 계약(apis_item_pop.html): GET https://apisml.kccworld.co.kr:5112/chemDraw/?cas=&name= → {mol, molecule, formula} (3Dmol 렌더).
     데이터 모델(chemDrawPopup.jsp): Molecular Name · CAS-No · SMILES/Formula. ── */
  // ChemStudio에 저장돼 있다고 가정하는 구조 라이브러리(목업) — Link existing 통합검색 대상
  var CHEM_LIBRARY = [
    { name: 'Styrene', cas: '100-42-5', formula: 'C8H8' },
    { name: 'Acrylic acid', cas: '79-10-7', formula: 'C3H4O2' },
    { name: 'Methyl methacrylate', cas: '80-62-6', formula: 'C5H8O2' },
    { name: '2-Ethylhexyl acrylate', cas: '103-11-7', formula: 'C11H20O2' },
    { name: 'Isobornyl acrylate', cas: '5888-33-5', formula: 'C13H20O2' },
    { name: 'Trimethoxy(methyl)silane', cas: '1185-55-3', formula: 'C4H12O3Si' }
  ];
  // 샘플 분자 = 스타이렌(벤젠고리 + 비닐). 목업 썸네일/미리보기 공용. withHandles=에디터 캔버스용 원자 핸들 표시
  function chemMoleculeSvg(withHandles) {
    var handles = withHandles ? '<g class="elnChemHandles">'
      + ['72,40', '98,55', '98,85', '72,100', '46,85', '46,55', '122,43', '146,52'].map(function (p) { var c = p.split(','); return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="2.7"/>'; }).join('')
      + '</g>' : '';
    return '<svg class="elnChemMol" viewBox="0 0 180 130" xmlns="http://www.w3.org/2000/svg">'
      + '<polygon class="bond" points="72,40 98,55 98,85 72,100 46,85 46,55"/>'
      + '<circle class="aromatic" cx="72" cy="70" r="17"/>'
      + '<line class="bond" x1="98" y1="55" x2="122" y2="43"/>'
      + '<line class="bond" x1="122" y1="43" x2="146" y2="52"/>'
      + '<line class="bond" x1="124.5" y1="38.6" x2="148.5" y2="47.6"/>'
      + handles + '</svg>';
  }
  function chemFormulaHtml(f) { return esc(f).replace(/(\d+)/g, '<sub>$1</sub>'); }   // C8H8 → C₈H₈
  // ChemStudio = mapis 하위로 가져온 chemDraw 프로젝트(apis_chemDraw_list.html). 새 구조/편집 모두 실제 에디터 새 창으로.
  function openChemDraw(data) {
    var q = (data && data.name) ? ('?name=' + encodeURIComponent(data.name) + (data.cas ? '&cas=' + encodeURIComponent(data.cas) : '')) : '';
    window.open('chemDraw/apis_chemDraw_list.html' + q, 'apisChemStudio', 'width=1920,height=960,scrollbars=yes,resizable=yes');
  }
  function wireChemModule(body) {
    var box = body.querySelector('.elnChemBox'); if (!box) return;
    var list = box.querySelector('.elnChemList');
    var open = box.querySelector('.elnChemOpen'); if (open) open.addEventListener('click', function () { openChemDraw(null); });
    var link = box.querySelector('.elnChemLink'); if (link) link.addEventListener('click', function () { openChemLink(list, link, null); });
    syncChemEmpty(box);
  }
  // 빈 안내줄 표시/숨김 — 구조 0개일 때만 노출
  function syncChemEmpty(box) {
    var list = box.querySelector('.elnChemList'), line = box.querySelector('.elnChemEmptyLine');
    if (line) line.style.display = list.children.length ? 'none' : '';
  }
  // 구조 1건을 <li>에 렌더 + 액션 배선(편집/교체/삭제). source='drawn'(그림) | 'linked'(참조)
  function setChemItem(li, data) {
    // Drawn/Linked 구분 없음 — 내부에서 그린 것도 결국 ChemStudio에 저장·로드되므로 전부 동일(연결된 구조)
    li.className = 'elnChemItem';
    li._chemData = data;
    li.innerHTML = '<span class="elnChemStage">' + chemMoleculeSvg(false) + '</span>'
      + '<span class="elnChemInfo">'
      + '<span class="elnChemName2">' + esc(data.name) + '</span>'
      + '<span class="elnChemFormula2">' + (data.formula ? chemFormulaHtml(data.formula) : '')
        + (data.cas ? '<span class="elnChemCasTxt">· CAS ' + esc(data.cas) + '</span>' : '') + '</span>'
      + '</span>'
      + '<span class="elnChemItemActions">'
      + '<a href="javascript:;" class="elnChemOpenItem" title="Open in ChemStudio"><i class="material-symbols-outlined">open_in_new</i></a>'
      + '<a href="javascript:;" class="elnChemChange" title="Change structure"><i class="material-symbols-outlined">swap_horiz</i></a>'
      + '<i class="material-symbols-outlined elnChemDel" title="Remove">close</i></span>';
    var box = li.closest('.elnChemBox'), list = li.parentNode;
    var open = li.querySelector('.elnChemOpenItem'); if (open) open.addEventListener('click', function () { openChemDraw(li._chemData); });
    var change = li.querySelector('.elnChemChange'); if (change) change.addEventListener('click', function () { openChemLink(list, change, li); });
    var del = li.querySelector('.elnChemDel'); if (del) del.addEventListener('click', function () { li.remove(); if (box) syncChemEmpty(box); });
  }
  // 신규 추가(append) 또는 기존 <li> 제자리 교체
  function addOrUpdateChem(list, existingLi, data) {
    var li = existingLi || document.createElement('li');
    if (!existingLi) list.appendChild(li);
    setChemItem(li, data);
    var box = list.closest('.elnChemBox'); if (box) syncChemEmpty(box);
  }
  // [미사용] 임베드 ChemStudio 목업 — 이제 Add New/편집은 openChemDraw()로 실제 chemDraw(apis_chemDraw_list.html) 새 창 진입. 참고용 보존.
  function openChemStudio(list, existingLi) {
    var ex = (existingLi && existingLi._chemData) || null;
    var nm0 = (ex && ex.name) || 'Styrene';
    var cas0 = (ex && ex.cas) || '100-42-5';
    var fm0 = (ex && ex.formula) || 'C8H8';
    var TOOLS = [
      { k: 'select', ic: 'arrow_selector_tool', t: 'Select / move' },
      { k: 'single', glyph: '—', t: 'Single bond' },
      { k: 'double', glyph: '=', t: 'Double bond' },
      { k: 'triple', glyph: '≡', t: 'Triple bond' },
      { k: 'ring', ic: 'hexagon', t: 'Benzene ring' },
      { k: 'C', glyph: 'C', t: 'Carbon' },
      { k: 'N', glyph: 'N', t: 'Nitrogen' },
      { k: 'O', glyph: 'O', t: 'Oxygen' },
      { k: 'erase', ic: 'ink_eraser', t: 'Erase' }
    ];
    var toolsHtml = TOOLS.map(function (tl) {
      var inner = tl.ic ? '<i class="material-symbols-outlined">' + tl.ic + '</i>' : tl.glyph;
      return '<button type="button" class="elnChemToolBtn' + (tl.k === 'ring' ? ' on' : '') + '" data-tool="' + tl.k + '" title="' + tl.t + '">' + inner + '</button>';
    }).join('');
    var wrap = document.createElement('div');
    wrap.className = 'elnChemEditor';
    wrap.innerHTML =
      '<div class="elnChemFrame">'
      + '<div class="elnChemFrameBar"><span class="dots"><i></i><i></i><i></i></span>'
      + '<span class="elnChemFrameUrl"><i class="material-symbols-outlined">lock</i>apisml.kccworld.co.kr / chemStudio</span>'
      + '<span class="elnChemBrand"><b>Chem</b>Studio</span></div>'
      + '<div class="elnChemStudioMain">'
      + '<div class="elnChemTools">' + toolsHtml + '</div>'
      + '<div class="elnChemCanvasWrap">'
      + '<div class="elnChemCanvas">' + chemMoleculeSvg(true) + '</div>'
      + '<div class="elnChemHintBar"><i class="material-symbols-outlined">draw</i>Embedded ChemStudio — pick a tool, then sketch on the canvas.</div>'
      + '</div></div></div>'
      + '<div class="elnChemMeta">'
      + '<label>Molecular Name<input type="text" class="browser-default elnChemName" value="' + esc(nm0) + '"></label>'
      + '<label>CAS-No<input type="text" class="browser-default elnChemCas" value="' + esc(cas0) + '"></label>'
      + '<label>Formula<input type="text" class="browser-default elnChemFormula" value="' + esc(fm0) + '"></label>'
      + '</div>';
    wrap.querySelectorAll('.elnChemToolBtn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        wrap.querySelectorAll('.elnChemToolBtn').forEach(function (b) { b.classList.remove('on'); });
        btn.classList.add('on');
      });
    });
    var editing = !!existingLi;
    ELN.modal({
      title: 'ChemStudio', icon: 'hexagon', body: wrap,
      actions: [
        { label: 'Cancel', type: '' },
        { label: editing ? 'Update structure' : 'Insert into note', type: 'hViva', onClick: function () {
          addOrUpdateChem(list, existingLi, {
            name: (wrap.querySelector('.elnChemName').value || '').trim() || 'Untitled structure',
            cas: (wrap.querySelector('.elnChemCas').value || '').trim(),
            formula: (wrap.querySelector('.elnChemFormula').value || '').trim()
          });
          ELN.toast(editing ? 'Structure updated.' : 'Structure added.', 'ok');
        } }
      ]
    });
  }
  // ② Link existing — 저장된 구조 통합검색(Formula/명칭/CAS) 팝오버. 선택 시 참조로 삽입
  function openChemLink(list, anchor, existingLi) {
    var wrap = document.createElement('div'); wrap.className = 'elnPickWrap';
    var search = document.createElement('input');
    search.type = 'text'; search.className = 'browser-default elnPickSearch'; search.placeholder = 'Formula / name / CAS-No…';
    var ul = document.createElement('div'); ul.className = 'elnPickList';
    function render(q) {
      ul.innerHTML = '';
      var ql = (q || '').toLowerCase();
      var matches = CHEM_LIBRARY.filter(function (c) { return (c.name + ' ' + c.cas + ' ' + c.formula).toLowerCase().indexOf(ql) >= 0; });
      if (!matches.length) { var em = document.createElement('div'); em.className = 'elnPickEmpty'; em.textContent = 'No structure match.'; ul.appendChild(em); return; }
      matches.forEach(function (c) {
        var it = document.createElement('div'); it.className = 'elnPickRow elnChemRow';
        it.innerHTML = '<span class="elnChemRowThumb">' + chemMoleculeSvg(false) + '</span>'
          + '<span class="elnChemRowMeta"><b>' + esc(c.name) + '</b><span>' + chemFormulaHtml(c.formula) + ' · CAS ' + esc(c.cas) + '</span></span>';
        it.addEventListener('click', function () {
          ref.close();
          addOrUpdateChem(list, existingLi, { name: c.name, cas: c.cas, formula: c.formula });
          ELN.toast(existingLi ? 'Structure changed.' : 'Structure added from ChemStudio.', 'ok');
        });
        ul.appendChild(it);
      });
    }
    search.addEventListener('input', function () { render(search.value); });
    wrap.appendChild(search); wrap.appendChild(ul); render('');
    var ref = ELN.popover({ anchor: anchor, content: wrap, width: 360 });
    setTimeout(function () { search.focus(); }, 60);
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
