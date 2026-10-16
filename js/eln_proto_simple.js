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
    // 시스템 Materialize 모달(M.Modal) 사용 — 운영 common.html 관례: <article class="modal" style="width:Npx"> + modal-header.mochaBg + modal-content(.btnArea).
    // 중첩 모달: Materialize 가 모달별 overlay/z-index(1000+2n)를 올려 쌓음. 뒤 배경 blur 는 열린 모달 수로 관리(마지막 모달이 닫힐 때만 해제).
    opts = opts || {};
    var WIDTH = { sm: 460, md: 580, lg: 680 };   // size: 'sm' | 'md' | 'lg' — 생략 시 560px
    var modal = document.createElement('article');
    modal.className = 'modal elnMz';
    modal.style.width = (WIDTH[opts.size] || 560) + 'px';
    modal.style.maxWidth = '90%';

    var head = document.createElement('div');
    head.className = 'modal-header mochaBg';
    var h5 = document.createElement('h5');
    if (opts.icon) {
      var hi = document.createElement('i');
      hi.className = 'material-symbols-outlined left';
      hi.textContent = opts.icon;
      h5.appendChild(hi);
    }
    h5.appendChild(document.createTextNode(opts.title || ''));
    head.appendChild(h5);
    var xbtn = document.createElement('div');
    xbtn.className = 'closeBtns';
    xbtn.innerHTML = '<i class="material-symbols-outlined">close</i>';
    head.appendChild(xbtn);

    var body = document.createElement('div');   // = .modal-content (본문 + 하단 .btnArea)
    body.className = 'modal-content hScroll';
    if (typeof opts.body === 'string') body.textContent = opts.body;
    else if (opts.body) body.appendChild(opts.body);

    var foot = document.createElement('div');
    foot.className = 'btnArea';

    var inst = null;
    function close() { if (inst && inst.isOpen) inst.close(); }
    xbtn.addEventListener('click', close);

    (opts.actions || [{ label: 'Close', type: '' }]).forEach(function (a) {
      var b = document.createElement('a');
      b.href = 'javascript:;';
      b.className = 'waves-effect waves-light hBtn ml10 ' + (a.type || '');
      if (a.icon) {   // 시스템 모달 버튼과 동일하게 아이콘+라벨 세트
        var ai = document.createElement('i');
        ai.className = 'material-symbols-outlined left';
        ai.textContent = a.icon;
        b.appendChild(ai);
      }
      var lab = document.createElement('span');
      lab.className = a.icon ? 'label' : 'label mr0';   // 아이콘 없는 라벨 전용 버튼: .hBtn .label 우측 margin(10px) 제거 → 가운데 정렬
      lab.textContent = a.label;
      b.appendChild(lab);
      b.addEventListener('click', function () {
        var keep = a.onClick && a.onClick();
        if (!keep) close();
      });
      foot.appendChild(b);
    });

    body.appendChild(foot);
    modal.appendChild(head); modal.appendChild(body);
    document.body.appendChild(modal);
    var BLUR = 'header, aside, .menuAside, .contArea';
    inst = M.Modal.init(modal, {
      onOpenStart: function () {
        ELN._mzOpen = (ELN._mzOpen || 0) + 1;
        document.querySelectorAll(BLUR).forEach(function (n) { n.classList.add('modalBlur'); });
      },
      onCloseStart: function () {
        ELN._mzOpen = Math.max(0, (ELN._mzOpen || 1) - 1);
        if (!ELN._mzOpen) document.querySelectorAll(BLUR).forEach(function (n) { n.classList.remove('modalBlur'); });   // 중첩 시 마지막 모달이 닫힐 때만
      },
      onCloseEnd: function () {
        try { inst.destroy(); } catch (e) {} modal.remove();
        // 중첩 모달: Materialize 가 열 때 body overflow 를 저장하는데, 두 번째 모달은 이미 'hidden' 을 저장 → 다 닫혀도 스크롤 잠김. 마지막 모달이 닫히면 해제
        if (!document.querySelector('.modal.open')) document.body.style.overflow = '';
      }
    });
    inst.open();
    return { close: close, body: body, el: modal, back: modal };   // back = el 별칭(구 호출부 호환)
  };

  // 팝오버: ELN.popover({anchor, content(HTMLElement), width}) — 누른 자리에 뜨는 경량 선택 UI(모달 대체).
  // 앵커 아래 기본, 화면 아래로 넘치면 위로 뒤집기. 바깥 클릭/ESC로 닫힘.
  window.ELN.popover = function (opts) {
    document.querySelectorAll('.elnPopover').forEach(function (p) { p.remove(); }); // 한 번에 하나만
    var pop = document.createElement('div');
    pop.className = 'elnPopover hScroll' + (opts.pad ? ' pad' : '');   // 표준 플로팅 레이어 스킨(CSS) — 메뉴는 패딩 0, 격자형 픽커만 opts.pad
    if (opts.width) pop.style.width = (opts.width + (opts.pad ? 20 : 0)) + 'px';
    pop.appendChild(opts.content);
    document.body.appendChild(pop);
    var x, y, w = pop.offsetWidth, h = pop.offsetHeight, gap = 6;
    if (opts.atPointer) {                              // 컨텍스트 메뉴/픽커 — 포인터 기준 표준 위치(좌상단 코너=포인터, 우측·하단으로 펼침)
      var px = opts.atPointer.x, py = opts.atPointer.y;
      x = (px + w <= window.innerWidth - 8) ? px : Math.max(8, px - w);     // 우측 방향 기본, 오른쪽 넘치면 좌측 플립
      y = (py + h <= window.innerHeight - 8) ? py : Math.max(8, py - h);    // 하단 방향 기본, 아래 넘치면 상단 플립
    } else {                                            // 좌측 Add module 버튼: 앵커 기준(기존 위치 유지)
      var r = opts.anchor.getBoundingClientRect();
      x = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
      y = r.bottom + 6;
      if (y + h > window.innerHeight - 8) { y = Math.max(8, r.top - h - 6); pop.classList.add('above'); }
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

  /* ── select2 표준 부품 ──────────────────────────────────────────────────────────────
     운영 common.html 과 같은 로드: select2.min.css(common.css 앞) + mpm_select2.js(mpm_materialize 뒤) → MAPIS 스킨은 common.css 가 이미 입힘.
     · 사람 = 운영은 getUserNameAjax 다중 select2('User ID / Name') → 프로토타입은 같은 옵션에 로컬 data(미니 데이터)
     · 짧은 단일 목록 = auSelect 기본값 {dropdownAutoWidth:true, minimumResultsForSearch:10}(검색창 없음)
     · 세련됨은 select2 공식 훅(templateResult/templateSelection) 안에서만 — 구조·박스·칩·키보드는 표준 그대로
     · 모달 안에서는 dropdownParent = 모달(.modal): Materialize 포커스 트랩 안에 있어야 검색창 입력이 유지됨 */
  var S2 = (function () {
    var $ = window.jQuery;
    function ready() { return !!($ && $.fn && $.fn.select2); }
    function muted(t) { return $('<span class="mt"></span>').text(t); }
    var T = {
      person: function (d) {   // 운영 표준 '이름 (ID)' — 사진·아바타·부서 없음(개인정보·운영 관례). 선택 칩은 이름만
        if (!d.id) return d.text;
        return $('<span class="elnS2Row"></span>').append($('<span class="nm"></span>').text(d.text), muted('(' + (d.uid || userId(d.text)) + ')'));
      },
      bracket: function (d) {   // [CODE] 제목 (MAPIS 대괄호 표기) + 흐린 보조정보
        if (!d.id) return d.text;
        var $r = $('<span class="elnS2Row"></span>').append($('<span class="nm"></span>').text('[' + d.code + '] ' + d.title));
        if (d.sub) $r.append(muted(d.sub));
        return $r;
      },
      fml: function (d) {   // FML-EM-2208(굵게, 유일한 강조) · 이름 · 흐린 버전/날짜
        if (!d.id) return d.text;
        var $r = $('<span class="elnS2Row"></span>').append($('<b></b>').text(d.code), $('<span class="nm"></span>').text('· ' + d.title));
        if (d.sub) $r.append(muted(d.sub));
        return $r;
      },
      chem: function (d) {   // 작은 구조 썸네일 + 이름 + 흐린 분자식
        if (!d.id) return d.text;
        var $th = $('<span class="elnS2Thumb"></span>');
        if (d.thumb) $th.html(d.thumb);   // 내부 목업 SVG 문자열(사용자 입력 아님)
        return $('<span class="elnS2Row"></span>').append($th, $('<span class="nm"></span>').text(d.title), $('<span class="mt elnChemSub"></span>').html(d.subHtml || ''));   // subHtml = esc 처리된 분자식(아래첨자)
      },
      sel: function (d) { return d.text; }
    };
    function matcher(params, data) {
      var q = $.trim(params.term || '').toLowerCase();
      if (!q) return data;
      return ((data.text || '') + ' ' + (data.hay || '')).toLowerCase().indexOf(q) >= 0 ? data : null;
    }
    // <select> 생성(단일은 placeholder 용 빈 option 포함). 문서에 붙인 뒤 mount()
    function make(multiple, cls) {
      var s = document.createElement('select'); s.className = 'browser-default' + (cls ? ' ' + cls : '');   // 페이지 일괄 FormSelect init 대상에서 제외(select2 전용)
      if (multiple) s.multiple = true; else s.appendChild(document.createElement('option'));
      return s;
    }
    function mount(sel, opts) {
      if (!ready()) return null;
      var o = $.extend({ dropdownAutoWidth: true, width: '100%', minimumResultsForSearch: 10, matcher: matcher, templateSelection: T.sel,
        language: { noResults: function () { return 'No match'; } } }, opts || {});
      // 이미 Materialize FormSelect 가 씌워졌으면 걷어냄(이중 렌더 방지) + 이후 일괄 init 에서 제외
      if (window.M && M.FormSelect) { var fi = M.FormSelect.getInstance(sel); if (fi) fi.destroy(); }
      sel.classList.add('browser-default');
      var back = sel.closest && sel.closest('.modal');
      if (back && !o.dropdownParent) o.dropdownParent = $(back);
      if (sel.multiple) o.closeOnSelect = false;   // auSelect 와 동일: 다중은 선택 후 열린 채 유지
      var $s = $(sel).select2(o);
      // 다중: 열린 채 유지하면 select2 가 검색어를 남겨 목록이 걸러진 채 굳음 → 고르면 검색칸 비우고 전체 목록으로(운영 techLibList 와 같은 처리)
      if (sel.multiple) $s.on('select2:select', function () {
        var s2 = $s.data('select2'), f = s2 && s2.$container.find('.select2-search__field');
        if (f && f.val()) f.val('').trigger('input');
      });
      return $s;
    }
    function people(names) { return names.map(function (n) { var u = userId(n); return { id: n, text: n, uid: u, hay: u }; }); }   // 운영 표준: 이름 (ID)
    return { T: T, make: make, mount: mount, people: people, ready: ready };
  })();

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
      it.className = 'elnStatusMenuItem' + (st === cur ? ' cur' : '');
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
    // 헤더(결재 진행)와 Note List 패널의 현재 노트 상태를 같은 값으로 — 한 노트가 두 곳에서 다른 상태로 보이지 않게
    var cur = (PROJECT_NOTES || []).filter(function (n) { return n.current; })[0];
    if (cur && cur.status !== st) { cur.status = st; renderNoteList(); }
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
        ELN.toast(info.msg + (label ? ': ' + label : '') + '.', 'info');
      });
    }
  }
  document.addEventListener('DOMContentLoaded', initRightAside);

  /* ── TaskA1: 배합 연계 동작(선택→임베드→분석 100%→formulator 열기→원료 클릭) ── */

  // 배합 목업 데이터 (formulator가 만든 결과를 ELN은 읽기 임베드만)
  var FORMULATIONS = {
    'FML-EM-2208': {
      code: 'FML-EM-2208', name: 'OLED Adhesive Silicone PSA', proj: 'SN-26-0031', ver: 'v3', sys: 'EM Formulator', sync: '2026-05-27',
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
      code: 'FML-EM-2207', name: 'OLED Adhesive Silicone PSA', proj: 'SN-26-0031', ver: 'v2', sys: 'EM Formulator', sync: '2026-05-19',
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
      code: 'FML-PA-3310', name: 'Silsoft Preservative Acrylic Base', proj: 'PT-26-0021', ver: 'v1', sys: 'PA Formulator', sync: '2026-05-30',
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
    },
    // 이 노트에 연결되지 않은 프로젝트의 배합(All projects 범위에서만 보임)
    'FML-EM-2215': {
      code: 'FML-EM-2215', name: 'OLED Lamination Adhesive', proj: 'CN-26-0064', ver: 'v2', sys: 'EM Formulator', sync: '2026-06-03',
      rows: [
        { name: 'Silicone PSA Base', code: 'RM-S1042', wt: 58.0, role: 'Base', note: '' },
        { name: 'Solvent (Toluene)', code: 'RM-T55', wt: 33.0, role: 'Solvent', note: '' },
        { name: 'Viscosity Modifier', code: 'RM-V210', wt: 5.0, role: 'Modifier', note: '' },
        { name: 'Crosslinker', code: 'RM-X07', wt: 3.0, role: 'Crosslinker', note: '' },
        { name: 'UV Photoinitiator', code: 'RM-P318', wt: 1.0, role: 'Initiator', note: '' }
      ],
      metrics: [
        { k: 'NV (solids)', v: '36.2 %' }, { k: 'VOC', v: '335 g/L' },
        { k: 'Viscosity', v: '3,980 cP' }, { k: 'Cost', v: '$ 13.0 /kg' }, { k: 'P/B ratio', v: '0.78' }
      ],
      chart: { cats: ['NV %', 'VOC(×10)', 'Visc(×1k)', 'Cost'], data: [36.2, 33.5, 3.98, 13.0] }
    },
    'FML-PA-3318': {
      code: 'FML-PA-3318', name: 'OCR Acrylic Resin', proj: 'CN-26-0090', ver: 'v1', sys: 'PA Formulator', sync: '2026-06-05',
      rows: [
        { name: 'Acrylic Base', code: 'RM-A220', wt: 74.0, role: 'Base', note: '' },
        { name: 'Tackifier', code: 'RM-TK9', wt: 14.0, role: 'Tackifier', note: '' },
        { name: 'Plasticizer', code: 'RM-PL3', wt: 7.0, role: 'Plasticizer', note: '' },
        { name: 'Curing Agent', code: 'RM-C12', wt: 5.0, role: 'Curing', note: '' }
      ],
      metrics: [
        { k: 'NV (solids)', v: '48.3 %' }, { k: 'VOC', v: '255 g/L' },
        { k: 'Viscosity', v: '4,200 cP' }, { k: 'Cost', v: '$ 10.6 /kg' }, { k: 'P/B ratio', v: '0.91' }
      ],
      chart: { cats: ['NV %', 'VOC(×10)', 'Visc(×1k)', 'Cost'], data: [48.3, 25.5, 4.2, 10.6] }
    },
    'FML-EM-2221': {
      code: 'FML-EM-2221', name: 'UV Conformal Coating', proj: 'CN-26-0112', ver: 'v1', sys: 'EM Formulator', sync: '2026-06-09',
      rows: [
        { name: 'Silicone PSA Base', code: 'RM-S1042', wt: 66.0, role: 'Base', note: '' },
        { name: 'Solvent (Toluene)', code: 'RM-T55', wt: 26.0, role: 'Solvent', note: '' },
        { name: 'Crosslinker', code: 'RM-X07', wt: 3.5, role: 'Crosslinker', note: '' },
        { name: 'UV Photoinitiator', code: 'RM-P318', wt: 4.5, role: 'Initiator', note: '' }
      ],
      metrics: [
        { k: 'NV (solids)', v: '41.0 %' }, { k: 'VOC', v: '290 g/L' },
        { k: 'Viscosity', v: '5,100 cP' }, { k: 'Cost', v: '$ 14.2 /kg' }, { k: 'P/B ratio', v: '0.85' }
      ],
      chart: { cats: ['NV %', 'VOC(×10)', 'Visc(×1k)', 'Cost'], data: [41.0, 29.0, 5.1, 14.2] }
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
        if (vals[i] == null) { td.textContent = '-'; td.classList.add('cGray'); }
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
        var td = document.createElement('td'); td.className = 'ar fontBold'; td.textContent = mm ? mm.v : '-'; tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  // 그룹 컬럼 차트: 핵심 지표를 배합별 series로 비교
  function renderFmlChart() {
    if (!window.Highcharts) return;
    var fmls = fmlList();
    if (!fmls.length) return;
    var palette = ['#A47864', '#8ca571', '#5a7d9a', '#c98a5a', '#8a77a8', '#4f9a94'];   // 연결 가능한 배합 수(6)만큼
    var series = fmls.map(function (f, i) { return { name: f.code + ' ' + f.ver, data: f.chart.data, color: palette[i % palette.length], borderRadius: 3 }; });
    fmlChart = Highcharts.chart('chartFmlAnalysis', {
      chart: { type: 'column', height: 240, backgroundColor: 'transparent' },
      title: { text: 'Key Metrics Comparison', style: { fontSize: '13px', color: '#5a3e30' } },
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
    // 운영 Compass 'select CI' 모달 패턴: 검색 인풋(aniInput) + fixedTable.hBorderTable 체크박스 표 + 선택 수
    var list = document.createElement('div');
    var picked = {}; linkedFmls.forEach(function (k) { picked[k] = true; });
    var wasLinked = linkedFmls.slice();   // 범위 밖이어도 이미 연결된 배합은 계속 보여 해제할 수 있게
    var keys = Object.keys(FORMULATIONS);
    var noteLabel = 'This note\'s projects (' + NOTE_PROJ.length + ')';
    var scope = NOTE_PROJ.length ? 'note' : 'all';   // 연결 프로젝트가 없으면 전체가 기본
    list.innerHTML = '<div class="elnFmlPickBar"><div class="elnFmlPickScope"></div>'
      + '<div class="aniInput"><input type="text" class="browser-default" placeholder="Search formulation #, name, project # or formulator"><span class="focus-border"></span></div></div>'
      + '<div class="fixedTable hBorderTable hScroll elnFmlPickTbl"><table><thead><tr><th class="ac" style="width:40px;"></th><th>Formulation #</th><th>Name</th><th>Project #</th><th>Formulator</th><th>Version</th><th>Last Synced</th></tr></thead><tbody></tbody></table></div>'
      + '<div class="elnFmlPickCnt"></div>';
    var tb = list.querySelector('tbody'), qIn = list.querySelector('input'), cntEl = list.querySelector('.elnFmlPickCnt');
    var scopeSel = S2.make(false); scopeSel.innerHTML = '';   // 값이 항상 있는 선택 — placeholder용 빈 옵션 제거
    list.querySelector('.elnFmlPickScope').appendChild(scopeSel);
    function pickCount() { var n = keys.filter(function (k) { return picked[k]; }).length; cntEl.textContent = n + ' selected'; }
    function drawPick() {
      var q = qIn.value.trim().toLowerCase(), h = '';
      keys.forEach(function (k) {
        var f = FORMULATIONS[k];
        if (scope === 'note' && NOTE_PROJ.indexOf(f.proj) < 0 && wasLinked.indexOf(k) < 0 && !picked[k]) return;   // 고른 것은 범위를 좁혀도 계속 보임(선택 수와 화면 일치)
        if (q && (f.code + ' ' + f.name + ' ' + f.proj + ' ' + f.sys).toLowerCase().indexOf(q) < 0) return;
        h += '<tr data-k="' + esc(k) + '"><td class="ac"><label><input type="checkbox" class="filled-in"' + (picked[k] ? ' checked' : '') + '><span></span></label></td>'
          + '<td class="fontBold">' + esc(f.code) + '</td><td>' + esc(f.name) + '</td><td>' + esc(f.proj) + '</td><td>' + esc(f.sys) + '</td><td>' + esc(f.ver) + '</td><td>' + esc(f.sync) + '</td></tr>';
      });
      tb.innerHTML = h || '<tr><td colspan="7" class="ac cGray">No match</td></tr>';
      pickCount();
    }
    qIn.addEventListener('input', drawPick);
    tb.addEventListener('change', function (e) {
      var tr = e.target.closest('tr[data-k]'); if (!tr) return;
      picked[tr.getAttribute('data-k')] = e.target.checked; pickCount();
    });
    tb.addEventListener('click', function (e) {   // 행 아무 곳이나 눌러도 토글
      var tr = e.target.closest('tr[data-k]'); if (!tr || e.target.closest('label')) return;
      var cb = tr.querySelector('input'); cb.checked = !cb.checked; picked[tr.getAttribute('data-k')] = cb.checked; pickCount();
    });
    drawPick();
    var chosen;
    ELN.modal({
      title: 'Link Formulations', icon: 'link', size: 'lg', body: list,
      actions: [
        { label: 'Cancel', type: '' },
        { label: 'Link', type: 'hViva', icon: 'link', onClick: function () {
            chosen = keys.filter(function (k) { return picked[k]; });
            if (!chosen.length) { ELN.toast('Select at least one formulation.', 'warn'); return true; } // 모달 유지
            var fmlBefore = linkedFmls.slice();
            linkedFmls = Object.keys(FORMULATIONS).filter(function (k) { return chosen.indexOf(k) >= 0; }); // 원본 순서 유지
            renderFml();
            if (fmlBefore.join('|') !== linkedFmls.join('|')) {
              var fmlNames = function (ks) { return ks.map(function (k) { return FORMULATIONS[k].code + ' ' + FORMULATIONS[k].ver; }).join(', '); };
              auditMod(document.getElementById('card_fml'), 'Formulations linked', { field: 'Linked formulations', before: fmlNames(fmlBefore), after: fmlNames(linkedFmls) });
            }
            ELN.toast('Linked ' + linkedFmls.length + ' formulation' + (linkedFmls.length > 1 ? 's' : '') + '.', 'ok');
          } }
      ]
    });
    S2.mount(scopeSel, { data: [{ id: 'note', text: noteLabel }, { id: 'all', text: 'All projects' }], minimumResultsForSearch: Infinity });
    if (window.jQuery) window.jQuery(scopeSel).val(scope).trigger('change.select2').on('change', function () { scope = this.value; drawPick(); });
    setTimeout(function () { qIn.focus(); }, 60);
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

    // Link — 노트에 연결할 배합 다중 선택(2개 이상이면 섹션이 비교 표시)
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
    { code: 'NT-2605-00142', title: 'UV-Curable PSA Viscosity Improvement (RGBOLED)',      stage: 'SCALE-UP',        date: '2026-05-15', status: 'ing', current: true, projects: ['SN-26-0031', 'PT-26-0021', 'TS-26-0205'], modules: ['fml','editor','table','chem','related','attach'] },
    { code: 'NT-2605-00150', title: 'Pilot Coating Trial #1',                              stage: 'SCALE-UP',        date: '2026-05-22', status: 'ing',    modules: ['editor','attach'] },
    { code: 'NT-2606-00171', title: 'Mass-Production Validation Plan',                     stage: 'COMMERCIAL GO',   date: '2026-06-03', status: 'draft',  modules: ['editor'] }
  ];
  // 노트 상태 표기는 결재 상태 하나로 통일(사용자 2026-10-16: "뭐든 하나로") — In Progress → In Approval → Approved.
  // 옛 키(done/review/draft)는 데이터 호환용으로만 남기고 같은 세 문구로 표시
  var NOTE_STATUS_TXT = { ing: 'In Progress', appr: 'In Approval', ok: 'Approved', draft: 'In Progress', review: 'In Approval', done: 'Approved' };
  // 노트 상태 → 헤더 알약(roundBox) 색. 리스트 어휘(ing/appr/ok)와 같음(패널을 opener.NOTES로 소싱)
  var NOTE_STATUS_PILL = { ing: 'blue', appr: 'viola25', ok: 'green', draft: 'blue', review: 'viola25', done: 'green' };

  function renderNoteList() {
    var body = document.getElementById('elnNoteListBody'); if (!body) return;
    if (!PROJECT_NOTES.length) { body.innerHTML = '<div class="elnNlEmpty">No notes in this project.</div>'; return; }
    function itemHtml(n) {
      return '<div class="elnNlItem' + (n.current ? ' current' : '') + '" data-code="' + esc(n.code) + '">'
        + '<div class="elnNlTop"><span class="elnNlTit">' + esc(n.title) + '</span>'
        + '<span class="roundBox outline ' + (NOTE_STATUS_PILL[n.status] || 'grey') + '">' + (NOTE_STATUS_TXT[n.status] || n.status) + '</span></div>'
        + '<div class="elnNlSub"><span class="code">' + esc(n.code) + '</span><span class="date">' + esc(n.date) + '</span></div>'
        + '</div>';
    }
    var html = '';
    var hasStage = PROJECT_NOTES.some(function (n) { return n.stage; });
    if (hasStage) {
      // 스테이지 순서는 과제 스케줄(PROJ_SCHEDULE) 기준 — 노트 있는 스테이지만, 스케줄 밖 스테이지는 뒤에
      var order = (typeof PROJ_SCHEDULE !== 'undefined') ? PROJ_SCHEDULE.map(function (s) { return s.stage; }) : [];
      var stages = order.filter(function (st) { return PROJECT_NOTES.some(function (n) { return normStage(n.stage) === st; }); });
      PROJECT_NOTES.forEach(function (n) { var s = normStage(n.stage); if (s && stages.indexOf(s) < 0) stages.push(s); });
      stages.forEach(function (st) {
        var items = PROJECT_NOTES.filter(function (n) { return normStage(n.stage) === st; });
        html += '<div class="elnNlGroup"><div class="elnNlGroupHead">' + esc(st) + '<span class="cnt">' + items.length + '</span></div>';
        items.forEach(function (n) { html += itemHtml(n); });
        html += '</div>';
      });
    } else {
      // 리스트(opener)에서 소싱한 노트 = 스테이지 없음 → 평면 리스트(리스트 페이지와 동일 최신순)
      html += '<div class="elnNlGroup">';
      PROJECT_NOTES.forEach(function (n) { html += itemHtml(n); });
      html += '</div>';
    }
    body.innerHTML = html;
  }
  // Formulation 정적 카드(+목차) show/hide — 리스트 포뮬라 마크(if(n.fml))와 동일 기준으로 상세를 맞춤
  function setFmlVisible(show) {
    var fmlCard = document.getElementById('card_fml');
    if (fmlCard) fmlCard.style.display = show ? '' : 'none';
    var fmlLi = document.querySelector('.leftAside .menuUl .menu-item[data-target="card_fml"]');
    if (fmlLi) fmlLi.style.display = show ? '' : 'none';
    if (ELN.signoff) ELN.signoff.refresh();
  }
  // 초기 로드: 리스트에서 연 노트(code)의 실제 fml 유무로 Formulation 카드 동기화(마크 없으면 카드도 없게).
  // 새 노트(tmpl)·직접 URL은 건드리지 않음 → realizeTemplate/정적 데모 흐름 보존.
  function initNoteFmlFromOpener() {
    try {
      var p = new URLSearchParams(location.search), code = p.get('code') || '';
      if (!code) return;
      var op = window.opener;
      var n = (op && !op.closed && op.NOTES) ? op.NOTES.filter(function (x) { return x.code === code; })[0] : null;
      if (!n) return;   // opener 없거나(직접 URL) 목록에 없으면 정적 데모 유지
      setFmlVisible(!!n.fml);
    } catch (e) {}
  }
  window.addEventListener('load', function () { setTimeout(initNoteFmlFromOpener, 80); });

  // 팝업 노트리스트 패널을 리스트(opener.NOTES)의 해당 프로젝트 노트로 맞춤. opener 없으면(직접 URL) 하드코딩 데모 유지.
  function syncProjectNotesFromOpener() {
    try {
      var op = window.opener; if (!op || op.closed || !op.NOTES) return;
      var p = new URLSearchParams(location.search);
      var proj = p.get('project') || '', code = p.get('code') || '';
      if (!proj) return;
      var mine = op.NOTES.filter(function (n) { return n.project === proj; });
      if (!mine.length) return;
      mine.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });   // 최신순(리스트와 동일)
      PROJECT_NOTES = mine.map(function (n) { return { code: n.code, title: n.title, date: n.date, status: n.st, stage: n.stage, fml: n.fml, project: n.project, current: (n.code === code) }; });
      if (code && !PROJECT_NOTES.some(function (n) { return n.current; }) && PROJECT_NOTES[0]) PROJECT_NOTES[0].current = true;
    } catch (e) {}
  }

  function initNoteList() {
    var btn = document.getElementById('elnNoteListBtn');
    var panel = document.getElementById('elnNoteListPanel');
    if (!btn || !panel) return;   // 상세 팝업에서만
    var scrim = document.getElementById('elnNoteListScrim');
    var closeBtn = document.getElementById('elnNoteListClose');
    syncProjectNotesFromOpener();   // 패널을 리스트(opener) 프로젝트 노트로 맞춤
    renderNoteList();
    function onKey(e) { if (e.key === 'Escape') closePanel(); }
    function openPanel() { panel.classList.add('on'); if (scrim) scrim.classList.add('on'); document.addEventListener('keydown', onKey); }
    function closePanel() { panel.classList.remove('on'); if (scrim) scrim.classList.remove('on'); document.removeEventListener('keydown', onKey); }
    btn.addEventListener('click', function () { panel.classList.contains('on') ? closePanel() : openPanel(); });
    if (closeBtn) closeBtn.addEventListener('click', closePanel);
    if (scrim) scrim.addEventListener('click', closePanel);
    var proj = document.getElementById('elnNoteListProj');
    if (proj) proj.addEventListener('click', function () {
      ELN.toast('Opening project detail: ' + proj.textContent.trim() + '.', 'info');
    });
    var body = document.getElementById('elnNoteListBody');
    if (body) body.addEventListener('click', function (e) {
      var it = e.target.closest('.elnNlItem'); if (!it) return;
      if (it.classList.contains('current')) { closePanel(); return; }   // 현재 노트면 그냥 닫기
      selectNote(it.getAttribute('data-code'));
    });

    ELN.selectNote = selectNote;   // Clone('Cloned from' 링크)·@노트참조 Open 링크가 사용

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
      if (titIn) { titIn.value = n.title; titIn._auditPrev = n.title; }
      syncClonedRow(n);   // 복제 노트면 Basic Data에 'Cloned from' 링크, 아니면 제거
      setNoteProjects(projectsOf(n));   // 노트별 연결 프로젝트(Primary = 첫 번째) — 로그 없이 교체
      // Experiment Date도 전환 노트의 date로(로깅 없이 기준값 갱신)
      var expDate = document.getElementById('elnExpDate');
      if (expDate && n.date) { expDate.value = n.date; expDate._auditPrev = n.date; }
      // 헤더 상태 알약(노트 상태 어휘 → 색/라벨 직접 매핑)
      var pill = document.getElementById('elnHeadStatus');
      if (pill) { pill.className = 'roundBox ' + (NOTE_STATUS_PILL[n.status] || 'grey');
        pill.setAttribute('data-status', n.status); pill.textContent = NOTE_STATUS_TXT[n.status] || n.status; }
      // 노트 상태 → 결재 상태 매핑. 전체 읽기전용은 완전 승인(ok)만, 결재중은 섹션별 잠금
      var soSt = (n.status === 'ok' || n.status === 'done') ? 'ok' : ((n.status === 'appr' || n.status === 'review') ? 'appr' : 'ing');
      apprView = (soSt === 'ok'); setNoteApproved(apprView);
      ELN.audit.reset(n);   // Audit Trail은 노트별 — 전환한 노트의 이력으로 교체
      // 노트별 모듈 구성 적용(하드코딩 데모 노트만 — opener 노트는 modules 없음 → 콘텐츠 유지)
      if (ELN.signoff && ELN.signoff.clear) ELN.signoff.clear();   // 이전 노트의 제출 상태가 setFmlVisible/applyNoteModules의 refresh로 재계산(ok 재진입)되지 않게 비움
      if (n.modules) applyNoteModules(n.modules);
      else setFmlVisible(!!n.fml);   // opener 노트: 실제 fml 유무로 Formulation 카드만 동기화(리스트 마크와 일치)
      if (soSt === 'ok') { apprView = true; setNoteApproved(true); }   // 모듈 재구성 뒤 새 입력들도 읽기전용
      if (ELN.signoff) ELN.signoff.reset(soSt);   // 공동서명 상태 시드 + 헤더 알약 동기(refresh)
      if (ELN.coedit) ELN.coedit.reset(code);     // 공동편집자·섹션 편집자 라벨·공유 현황 (결재 시드 뒤에 — 결재 잠금 섹션은 라벨 갱신 제외)
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
      ELN.toast('Switched to ' + n.code + ': ' + n.title + '.', 'ok');
    }

    // 노트 모듈 구성 적용 — 실제 모듈 시스템(addNoteModule/removeSection) 재사용.
    //  · basic(Overview)·approval: 고정 → 손대지 않음
    //  · fml(Formulation): 정적 리치카드 → 제거 대신 show/hide(제거 시 세션 내 복구 불가)
    //  · editor/table/chem/related/attach: 동적 → 전부 제거 후 타깃 순서대로 재생성(순서·구성 정확)
    var DYN_MOD_KEYS = ['editor', 'table', 'chem', 'related', 'attach'];
    function applyNoteModules(modules) {
      var article = document.getElementById('tab_ov'); if (!article) return;
      ELN.audit.mute++;   // 모듈 일괄 재구성 중엔 감사 로그 없음
      try {
      // 1) Formulation 정적 카드: 보유 여부에 따라 show/hide (카드+목차)
      setFmlVisible(modules.indexOf('fml') >= 0);
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
      } finally { ELN.audit.mute--; }
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
    ELN.audit.log({ section: sectionNameOf(document.getElementById('card_basic')), action: 'Tag added', detail: text });
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
          ELN.audit.log({ section: sectionNameOf(document.getElementById('card_basic')), action: 'Tag removed', detail: t });
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
    fml: { label: 'Formulation', icon: 'science', sub: 'Composition · Process · Results layout + formulator link' },
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
      title: 'New Note: Select Category', icon: 'note_add', body: wrap,
      actions: [
        { label: 'Start with This Category', type: 'hViva', onClick: function () {
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
    { code: 'NT-2605-00098', title: 'Initial trial: spec not met',                     st: 'ok', ver: 'v1', date: '2026-05-21', nb: 'Flexible OLED',      project: 'SN-26-0018' },
    { code: 'NT-2605-00118', title: 'Viscosity Modifier ratio tuning (v2)',           st: 'appr', ver: 'v2', date: '2026-05-27', parent: 'NT-2605-00098', nb: 'RGBOLED Adhesive',   project: 'SN-26-0031' },
    { code: 'NT-2605-00097', title: 'Cure rate vs UV dose: condition sweep',           st: 'ok',   ver: 'v1', date: '2026-05-24', parent: 'NT-2605-00118', nb: 'RGBOLED Adhesive',   project: 'SN-26-0031' },
    { code: 'NT-2605-00072', title: 'Crosslinker screening for adhesion',             st: 'ing',  ver: '',   date: '2026-05-15', parent: 'NT-2605-00098', nb: 'Crosslinker Studies', project: 'SN-26-0031' },
    { code: 'NT-2605-00142', title: 'UV-Curable PSA Viscosity Improvement (RGBOLED)', st: 'ing',  ver: 'v3', date: '2026-05-28', parent: 'NT-2605-00118', nb: 'RGBOLED Adhesive',   project: 'SN-26-0031' }
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
        body: n.code + ' · ' + (n.ver || '-') + ' · ' + (STATUS_LABEL[n.st] || n.st),
        actions: [
          { label: 'Open This Note', type: 'hBlue', onClick: function () { ELN.toast('Opening ' + n.code + '.', 'info'); } },
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
      ELN.toast('Created ' + code + ' (' + ver + '), opening…', 'ok');
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

  /* ── Audit Trail — 노트 변경 이력(append-only). ELN.audit.log/entries, 하단 #card_audit에 렌더 ── */
  ELN.currentUser = 'Charles Kim';   // 데모: 노트 작성자 = 로그인 사용자
  // 카드의 섹션명 — 제목 input(.elnModTitle) > .cardTit2 텍스트
  function sectionNameOf(card) {
    if (!card) return '';
    var t = card.querySelector('.elnModTitle');
    var v = t ? String(t.value || '').trim() : '';
    if (v) return v;
    if (t) return '(Untitled)';   // 제목을 비운 섹션 — 좌측 목차 표기와 동일
    var h = card.querySelector('.cardTit2');
    if (!h) return '';
    var c = h.cloneNode(true);
    Array.prototype.forEach.call(c.querySelectorAll('i, a, input'), function (n) { n.remove(); });   // 아이콘·삭제버튼 제외
    return c.textContent.trim();
  }
  // 모듈 내부 편집 감사 로그 헬퍼 — 섹션명은 카드 현재 제목. mute 중이면 ELN.audit.log가 무시
  function auditMod(card, action, o) {
    var e = {}; for (var k in (o || {})) e[k] = o[k];
    e.section = sectionNameOf(card); e.action = action;
    ELN.audit.log(e);
  }
  (function () {
    var LOG = [];
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function stamp() {
      var d = new Date();
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }
    function fillSelect(sel, allLabel, vals) {   // 옵션 재구성 — 현재 선택값이 유효하면 유지
      if (!sel) return;
      var cur = sel.value;
      var html = '<option value="">' + esc(allLabel) + '</option>';
      vals.forEach(function (v) { html += '<option value="' + esc(v).replace(/"/g, '&quot;') + '">' + esc(v) + '</option>'; });
      sel.innerHTML = html;
      sel.value = vals.indexOf(cur) >= 0 ? cur : '';
    }
    function uniq(key) {
      var out = [];
      LOG.forEach(function (e) { if (e[key] && out.indexOf(e[key]) < 0) out.push(e[key]); });
      return out.sort();
    }
    function changeHtml(e) {
      var pre = e.field ? '<strong>' + esc(e.field) + '</strong>: ' : '';
      var hasB = e.before != null && e.before !== '', hasA = e.after != null && e.after !== '';
      if (hasB && hasA) return pre + '<span style="color:#9aa0a6;text-decoration:line-through">' + esc(e.before) + '</span> &rarr; ' + esc(e.after)
        + (e.detail ? ' <span style="color:#9aa0a6">(' + esc(e.detail) + ')</span>' : '');   // 자동 변경 사유 등 보조 설명
      if (e.detail) return pre + esc(e.detail);
      if (hasA) return pre + esc(e.after);
      if (hasB) return pre + '<span style="color:#9aa0a6;text-decoration:line-through">' + esc(e.before) + '</span>';
      return pre || '-';
    }
    function render() {
      var body = document.getElementById('elnAuditBody'); if (!body) return;
      var secSel = document.getElementById('elnAuditSec'), userSel = document.getElementById('elnAuditUser');
      fillSelect(secSel, 'All sections', uniq('section'));
      fillSelect(userSel, 'All users', uniq('user'));
      var fs = secSel ? secSel.value : '', fu = userSel ? userSel.value : '';
      var rows = LOG.map(function (e, i) { return { e: e, i: i }; }).filter(function (r) {
        return (!fs || r.e.section === fs) && (!fu || r.e.user === fu);
      }).sort(function (a, b) { return a.e.ts < b.e.ts ? 1 : a.e.ts > b.e.ts ? -1 : b.i - a.i; });   // 최신순
      var html = '';
      rows.forEach(function (r) {
        var e = r.e;
        html += '<tr><td class="ac">' + esc(e.ts) + '</td><td class="ac">' + esc(e.user) + '</td><td>' + esc(e.section || '-')
          + '</td><td class="ac">' + esc(e.action) + '</td><td>' + changeHtml(e) + '</td></tr>';
      });
      body.innerHTML = html || '<tr><td colspan="5" class="ac">No entries.</td></tr>';
    }
    ELN.audit = {
      mute: 0,   // >0 이면 log()가 무시됨 — 노트 전환·복제 등 프로그램적 일괄 작업 중(ELN.audit.mute++/-- 로 감싼다)
      log: function (o) {
        if (ELN.audit.mute > 0) return;
        o = o || {};
        LOG.push({ ts: o.ts || stamp(), user: o.user || ELN.currentUser, section: o.section || '', action: o.action || '',
          field: o.field, before: o.before, after: o.after, detail: o.detail });
        render();
      },
      entries: function () { return LOG.map(function (e) { var c = {}; for (var k in e) c[k] = e[k]; return c; }); },
      // 노트 전환 시 — 이력은 노트별. 비우고 그 노트의 목업 이력으로 다시 채움
      reset: function (note) { LOG.length = 0; seedFor(note); render(); },
      now: stamp   // 'YYYY-MM-DD HH:mm'(로컬)
    };
    function seed(ts, user, section, action, extra) {
      var o = { ts: ts, user: user, section: section, action: action };
      for (var k in extra) o[k] = extra[k];
      LOG.push(o);
    }
    // 노트별 목업 이력 — note 없음 = 처음 열린 노트(NT-2605-00142) 전체 시드, 그 외 노트는 생성 기록만
    function seedFor(note) {
      if (note && note.clonedFrom) {   // 복제된 노트 — 생성 기록 1건(현재 시각)
        seed(stamp(), ELN.currentUser, 'Basic Data', 'Note created', { detail: note.cloneDetail || ('Copied from ' + note.clonedFrom.code) });
        return;
      }
      if (note && note.code !== 'NT-2605-00142') {
        var d = note.date || '2026-10-01';
        seed(d + ' 09:00', 'Charles Kim', 'Basic Data', 'Note created', { detail: note.code + (note.title ? ': ' + note.title : '') });
        return;
      }
      seed('2026-10-06 09:12', 'Charles Kim', 'Basic Data', 'Note created', { detail: 'From template "Formulation"' });
      seed('2026-10-06 09:20', 'Charles Kim', 'Basic Data', 'Field changed', { field: 'Note Title', before: 'PSA Viscosity Improvement', after: 'UV-Curable PSA Viscosity Improvement (RGBOLED)' });
      seed('2026-10-07 14:05', 'Charles Kim', 'Data Visualization', 'Module added', {});
      // 공유 기록 = Share & Access 시드(ceSeedPeople)와 같은 사람·시각·형식(실제 공유 시 기록과 동일)
      var POL = ' · Security policy acknowledged';
      seed('2026-10-08 10:12', 'Charles Kim', 'Basic Data', 'Access granted', { detail: 'David Lee, Min-ji Park · Co-editor · Entire note · Reason: Co-authoring' + POL });
      seed('2026-10-08 10:42', 'David Lee', 'Formulation', 'Field changed', { field: 'Crosslinker (wt%)', before: '1.8', after: '2.2' });
      seed('2026-10-09 16:30', 'Charles Kim', 'Basic Data', 'Access granted', { detail: 'Jim Quan · Viewer · Entire note · Reason: Group leader review' + POL });
      seed('2026-10-10 11:18', 'Min-ji Park', 'Basic Data', 'Tag added', { detail: '#viscosity' });   // 편집은 Co-editor 만(Viewer 는 조회)
      seed('2026-10-10 14:05', 'Charles Kim', 'Formulation, Data Visualization', 'Access granted', { detail: 'Sarah Chen · Viewer · Formulation, Data Visualization · Reason: Analytical data cross-check' + POL });
    }
    // 초기 로드 노트 — ?code 가 없거나 NT-2605-00142면 전체 데모 시드(null), 그 외는 전환 때와 같은 '생성 기록만' 시드
    function initialNote() {
      var code = '';
      try { code = new URLSearchParams(location.search).get('code') || ''; } catch (e) {}
      if (!code || code === 'NT-2605-00142') return null;
      var n = null;
      try {
        var op = window.opener;
        if (op && !op.closed && op.NOTES) n = op.NOTES.filter(function (x) { return x.code === code; })[0] || null;
      } catch (e2) {}
      if (!n && typeof PROJECT_NOTES !== 'undefined') n = PROJECT_NOTES.filter(function (x) { return x.code === code; })[0] || null;
      return n ? { code: code, title: n.title, date: n.date } : { code: code, title: '' };
    }
    function initAudit() {
      seedFor(initialNote());
      var s = document.getElementById('elnAuditSec'), u = document.getElementById('elnAuditUser');
      if (s) s.addEventListener('change', render);
      if (u) u.addEventListener('change', render);
      render();   // 시드 이후 렌더
      // Basic Data 텍스트 입력 변경 — 위임(나중에 추가된 input도 커버). 포커스 시 값 기록 → change 시 before/after
      var basic = document.getElementById('card_basic');
      if (basic) {
        // 추적 대상: 텍스트·날짜 입력 + select(Stage/Task/Platform). 이전값은 요소별(_auditPrev)로 보관
        function isField(el) {
          if (!el) return false;
          if (el.tagName === 'SELECT') return true;
          if (el.tagName !== 'INPUT') return false;
          if (el.classList.contains('select-dropdown')) return false;   // Materialize 표시용 input 제외
          if (el.id === 'elnTagInput' || el.classList.contains('elnModTitle')) return false;
          return el.type === 'text' || el.type === 'date';
        }
        function fieldName(el) {
          if (el.id === 'elnSchedStage') return 'Stage';
          if (el.id === 'elnSchedTask') return 'Task';
          if (el.id === 'elnPlatform') return 'Platform / Pre-NPC type';
          if (el.id === 'elnPlatformName') return 'Platform / Pre-NPC name';
          var row = el.closest('.elnBasicRow'), lab = row && row.querySelector('.elnBasicLabel');
          return lab ? lab.textContent.replace(/\*/g, '').trim() : (el.getAttribute('placeholder') || 'Field');
        }
        // select는 옵션 텍스트로 기록
        function fieldVal(el) {
          if (el.tagName === 'SELECT') { var o = el.options[el.selectedIndex]; return o ? o.text : ''; }
          return el.value;
        }
        // 기준값이 아직 없는 필드만 채움 — 이미 기록된 기준값(로그 후 갱신값)이나 입력 중인 값은 덮지 않음
        function snapshot() {
          basic.querySelectorAll('input, select').forEach(function (el) { if (isField(el) && el._auditPrev == null) el._auditPrev = fieldVal(el); });
        }
        ELN.audit.snapshot = snapshot;
        function logIfChanged(el) {
          var before = el._auditPrev != null ? el._auditPrev : '', after = fieldVal(el);
          if (before === after) return;
          ELN.audit.log({ section: sectionNameOf(basic), action: 'Field changed', field: fieldName(el), before: before, after: after });
          el._auditPrev = after;
        }
        basic.addEventListener('focusin', function (e) { if (isField(e.target) && e.target._auditPrev == null) e.target._auditPrev = fieldVal(e.target); });
        // 날짜 입력은 연·월·일 칸마다 change가 발생 → 칸을 벗어날 때 한 번만 기록
        basic.addEventListener('change', function (e) { if (isField(e.target) && e.target.type !== 'date') logIfChanged(e.target); });
        basic.addEventListener('focusout', function (e) { if (isField(e.target) && e.target.type === 'date') logIfChanged(e.target); });
        // 다른 DOMContentLoaded init(옵션 채움) 직후 + load 시점에 기준값 기록 (Materialize가 select를 숨겨 focusin이 안 올 수 있음)
        setTimeout(snapshot, 0);
        window.addEventListener('load', function () { setTimeout(snapshot, 0); });
      }
    }
    document.addEventListener('DOMContentLoaded', initAudit);
  })();

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
    ELN.toast('Opening ' + code + (n ? ': ' + n.title : '') + '.', 'info');
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
    { key: 'editor',   icon: 'edit_note',   title: 'Editor',             desc: 'Rich text: text, tables, images' },
    { key: 'table',    icon: 'insert_chart', title: 'Data Visualization', desc: 'Editable table + multi-series chart' },
    { key: 'chem',     icon: 'hexagon',     title: 'ChemStudio',         desc: 'Sketch a chemical structure' },
    { key: 'fml',      icon: 'science',     title: 'Formulation',        desc: 'Embed from formulator' },
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
          + '<a href="javascript:;" class="waves-effect waves-light hBtn hSmall elnDataBtn" data-act="addCol"><i class="material-symbols-outlined left">add</i><span class="label">Series</span></a>'          + '<span class="elnDataHint"><i class="material-symbols-outlined">content_paste</i>Click a cell, then Ctrl+V to paste from Excel</span>'
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
        + '<div class="elnRelAdd"><div class="elnRelAddType"><select><option>Material</option><option>Note</option><option>URL</option></select></div>'
        + '<div class="elnRelAddVal"></div>'
        + '<a href="javascript:;" class="waves-effect waves-light hBtn elnRelAddGo"><i class="material-symbols-outlined left">add</i><span class="label">Add</span></a></div>'
        + '<ul class="elnRelList">'
        + '<li class="elnRelItem"><i class="material-symbols-outlined">science</i><span class="elnRelType">Material</span><a href="javascript:;" class="elnRelLink">[RM-0421] UV Photoinitiator</a><i class="material-symbols-outlined elnRelDel" title="Remove">close</i></li>'
        + '</ul></div>';
      case 'chem': return '<div class="elnChemBox">'
        + '<ul class="elnChemList"></ul>'
        + '<div class="elnChemEmptyLine"><i class="material-symbols-outlined">hexagon</i>No structures yet. Add one or more from ChemStudio.</div>'
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
    var sec = document.getElementById(id);
    var secName = sec ? sectionNameOf(sec) : '';   // 제거 전에 섹션명 확보
    if (id === 'card_fml') setFmlVisible(false);   // 정적 Formulation 카드는 숨김(재생성 불가 — Add Module 로 복원)
    else {
      if (sec) sec.remove();
      var li = document.querySelector('.menuUl .menu-item[data-target="' + id + '"]'); if (li) li.remove();
    }
    refreshDividers();
    ELN.audit.log({ section: secName, action: 'Module removed' });
    ELN.toast('Module removed.', 'info');
    if (ELN.signoff) ELN.signoff.refresh();   // 섹션 수 변경 → 전체 상태 재계산
  }

  function injectDeleteBtn(card) {
    var tit = card.querySelector('.cardTit2');
    if (!tit || tit.querySelector('.elnModDel')) return;
    var del = document.createElement('a');
    del.href = 'javascript:;'; del.className = 'elnModDel right'; del.title = 'Remove this section';
    del.innerHTML = '<i class="material-symbols-outlined">close</i>';   // 아이콘은 close 유지, 강조는 테두리 버튼 + hover 시 카드 테두리
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
      var titBefore = input.value;   // 감사 로그용 — 포커스 시점 값
      input.addEventListener('focus', function () { titBefore = input.value; });
      input.addEventListener('blur', function () {
        if (input.value !== titBefore) {
          ELN.audit.log({ section: input.value || titBefore, action: 'Section renamed', before: titBefore, after: input.value });
          titBefore = input.value;
        }
      });
    }
    setupIconPicker(card);   // 2) 헤더 lead 아이콘 클릭 → 아이콘/채움 변경
    if (ELN.coedit) ELN.coedit.ensure(card);   // 3) 'Last edited by' 라벨 자리
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
    if (card.id === 'card_basic' || card.id === 'card_approval' || card.id === 'card_audit') return;   // 고정 시스템 카드(Overview·Approval)는 아이콘 변경 불가
    var tit = card.querySelector('.cardTit2'); if (!tit) return;
    var ic = tit.querySelector('i.left'); if (!ic || ic._iconWired) return;
    ic._iconWired = true;
    ic.classList.add('elnIconPick');
    ic.title = 'Change icon';
    ic.addEventListener('click', function (e) {
      if (document.body.classList.contains('elnApproved') || card.classList.contains('elnLocked')) return;   // 승인(전체 view)·잠긴 섹션은 변경 불가
      e.stopPropagation();
      openIconPicker(ic);
    });
  }
  function openIconPicker(ic) {
    var wrap = document.createElement('div'); wrap.className = 'elnIconPicker';
    var grid = document.createElement('div'); grid.className = 'elnIconGrid hScroll';
    var cur = (ic.textContent || '').trim();
    function logIcon(from, to) { if (from !== to) auditMod(ic.closest('.cardBox'), 'Icon changed', { field: 'Icon', before: from, after: to }); }
    ICON_CANDIDATES.filter(function (n, i, a) { return a.indexOf(n) === i; }).sort().forEach(function (name) {   // 중복 제거 + 알파벳 정렬
      var b = document.createElement('button'); b.type = 'button';
      b.className = 'elnIconOpt' + (name === cur ? ' on' : '');
      b.title = name;
      b.innerHTML = '<i class="material-symbols-outlined' + (ic.classList.contains('fill') ? ' fill' : '') + '">' + name + '</i>';
      b.addEventListener('click', function () {
        logIcon((ic.textContent || '').trim(), name);
        ic.textContent = name;
        syncNavIcon(ic);                                        // 좌측 목차 아이콘도 동기화
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
        if (on !== ic.classList.contains('fill')) auditMod(ic.closest('.cardBox'), 'Icon changed', { field: 'Icon style', before: on ? 'Outline' : 'Fill', after: on ? 'Fill' : 'Outline' });
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
      logIcon((ic.textContent || '').trim(), v);
      ic.textContent = v; syncNavIcon(ic);
      grid.querySelectorAll('.elnIconOpt').forEach(function (x) { x.classList.remove('on'); });
      ELN.toast('Icon set: ' + v, 'ok');
    }
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); applyCustom(); } });
    custom.querySelector('.elnIconPreview').addEventListener('click', applyCustom);
    wrap.appendChild(grid); wrap.appendChild(custom); wrap.appendChild(hint); wrap.appendChild(fillRow);
    ELN.popover({ anchor: ic, content: wrap, width: 282, pad: true });
  }

  var modSeq = 0;
  // after = 이 카드 다음에 삽입할 기준 카드(null이면 맨 끝 — 상시 + 블록 앞)
  function addNoteModule(t, after, silent) {
    var article = document.getElementById('tab_ov');
    if (!article) return;
    // Formulation 은 노트당 하나(정적 card_fml — 배합 연결·비교가 여기에 묶임). 숨겨져 있으면 복원, 보이면 그 카드로 이동(빈 껍데기 카드를 만들지 않음)
    var fmlCard = t.key === 'fml' && document.getElementById('card_fml');
    if (fmlCard) {
      var hidden = fmlCard.style.display === 'none';
      if (hidden) { setFmlVisible(true); auditMod(fmlCard, 'Section added'); }
      if (!silent) {
        fmlCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        ELN.toast(hidden ? 'Formulation section restored.' : 'This note already has a Formulation section.', hidden ? 'ok' : 'info');
      }
      return;
    }
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
    var addCtl = body.querySelector('.elnChemAdd, .elnFmlLink');
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
      else { var apprLi = ul.querySelector('.menu-item[data-target="card_approval"]'); ul.insertBefore(li, apprLi || null); }   // 모듈 목차는 Approval '위'에(Approval 최하단 고정)
      setupNavItem(li);   // 새 목차 항목도 드래그 핸들 적용
    }
    refreshDividers();
    if (typeof initAllHBorderTableOverlays === 'function') { try { initAllHBorderTableOverlays(); } catch (e) {} }
    if (ELN.signoff) ELN.signoff.refresh();   // 새 미제출 섹션 → 전체 상태 재계산
    if (!silent) {
      if (ELN.coedit) ELN.coedit.touch(sec);
      ELN.audit.log({ section: t.title, action: 'Module added' });
      ELN.toast('Module "' + t.title + '" added.', 'ok');
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });    // 추가한 카드로 자동 이동(헤더 아래 안착 — 스크롤 스파이 라인과 일치)
      if (li) {
        if (ul) ul.querySelectorAll('.menu-item').forEach(function (m) { m.classList.remove('active'); });
        li.classList.add('active');     // 좌측 목차도 새 항목 활성
        hintNavItem(li);                // hover 없이 ~5초 드래그 안내 노출
      }
    }
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
    var ref = ev ? ELN.popover({ atPointer: { x: ev.clientX, y: ev.clientY }, content: grid, width: 400, pad: true })
                 : ELN.popover({ anchor: anchor, content: grid, width: 400, pad: true });
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
      if (card.id === 'card_approval' || card.id === 'card_audit') return;
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
    { key: 'formulation', icon: 'science',     name: 'Formulation', sections: [{ type: 'overview', label: 'Overview' }, { type: 'formulation', label: 'Formulation' }] },
    { key: 'experiment',  icon: 'labs',        name: 'Experiment',  sections: [{ type: 'overview', label: 'Overview' }, { type: 'table', label: 'Data Visualization' }] },
    { key: 'analysis',    icon: 'analytics',   name: 'Analysis',    sections: [{ type: 'overview', label: 'Overview' }, { type: 'chem', label: 'ChemStudio' }, { type: 'related', label: 'Related Items' }] },
    { key: 'report',      icon: 'summarize',   name: 'Full Report', sections: [{ type: 'overview', label: 'Overview' }, { type: 'formulation', label: 'Formulation' }, { type: 'table', label: 'Data Visualization' }, { type: 'chem', label: 'ChemStudio' }, { type: 'related', label: 'Related Items' }, { type: 'attach', label: 'Attachments' }] }
  ];
  function templateByKey(key) { return PUBLIC_TEMPLATES.concat(loadMyTemplates()).filter(function (t) { return t.key === key; })[0]; }
  function templateSections(key) { var t = templateByKey(key); return (t && t.sections) || []; }
  // 정적 섹션(Formulation/Conclusion) 표시·숨김(데이터 보존 — 제거 대신 hide) + 좌측 네비 동기화
  // 현재 노트의 섹션 구성을 [{type,label}] 순서대로 캡처(데이터 제외). 제목은 .elnModTitle(아이콘과 분리된 깨끗한 텍스트)
  function captureStructure() {
    var out = [];
    document.querySelectorAll('#tab_ov > .cardBox').forEach(function (card) {
      var type = STATIC_SECTION[card.id] || card.getAttribute('data-modtype');
      if (!type || card.style.display === 'none') return;   // 숨긴 정적 카드(Formulation)는 구조에서 제외
      var titEl = card.querySelector('.elnModTitle');
      var label = titEl ? ((titEl.value != null ? titEl.value : titEl.textContent) || '').trim() : '';
      if (!label) label = type.charAt(0).toUpperCase() + type.slice(1);
      out.push({ type: type, label: label });
    });
    return out;
  }
  function removeSection(id) {                                   // 카드 + 좌측 네비 함께 제거
    if (id === 'card_fml') { setFmlVisible(false); return; }     // 정적 Formulation 카드는 숨김(Add Module·템플릿으로 복원)
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
    ['card_fml', 'card_concl'].forEach(function (id) {           // 정적 카드: 타깃에 없으면 제거(Formulation 은 숨김), 있으면 숨김 해제
      var el = document.getElementById(id), want = targetTypes.indexOf(STATIC_SECTION[id]) >= 0;
      if (!el) return;
      var shown = el.style.display !== 'none';
      if (want) { if (!shown && id === 'card_fml') { setFmlVisible(true); summary.added++; } return; }
      if (shown) { removeSection(id); summary.removed++; }
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
    // 템플릿 진입(?tmpl=)이면 initTemplate(realizeTemplate)이 구성을 정하므로 기본모듈을 깔지 않음
    try { if (new URLSearchParams(location.search).get('tmpl')) return; } catch (e) {}
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
    // 컴포지션 모달과 동일한 aniInput(밑줄 focus-border) 패턴
    var inWrap = document.createElement('div'); inWrap.className = 'aniInput';
    var input = document.createElement('input');
    input.type = 'text'; input.className = 'browser-default'; input.placeholder = 'Template name (e.g. UV-cure workflow)';
    var fb = document.createElement('span'); fb.className = 'focus-border';
    inWrap.appendChild(input); inWrap.appendChild(fb);
    ELN.modal({
      title: 'Save as Template', icon: 'bookmark_add', size: 'sm', body: inWrap,
      actions: [
        { label: 'Save', type: 'hBlue', icon: 'save', onClick: function () {   // npi/컴포지션 모달과 동일 — 파란 Save + 아이콘
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
    var ref = ELN.modal({ title: 'Swap Template', icon: 'swap_horiz', body: wrap, actions: [ { label: 'Cancel', type: '' } ] });
    wrap.querySelectorAll('.elnTmplCard').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-key'), t = templateByKey(key);
        ref.close();
        var s = realizeTemplate(key);
        ELN.toast('Swapped to ' + (t ? t.name : key) + ' (data kept) · +' + s.added + ' / −' + s.removed + ' section(s).', 'ok');
      });
    });
  }
  document.addEventListener('DOMContentLoaded', function () {
    var save = document.getElementById('elnSaveTemplate');
    if (save) save.addEventListener('click', function (e) { e.preventDefault(); saveCurrentAsTemplate(); });
    var swap = document.getElementById('elnChangeTemplate');
    if (swap) swap.addEventListener('click', function (e) { e.preventDefault(); openTemplateSwitcher(); });
  });

  /* ── Approval(공동서명) — 섹션 제출(submit) → 공동서명자 Sign/Reject. 제출된 섹션은 개별 잠금, 정정은 Errata ── */
  var apprView = false;   // false=Edit / true=View(승인 모드)
  var SO_SEC = 'Approval';   // 감사로그 section명 (카드 제목과 동일)
  var SO_ROLES = ['Witness', 'Group Leader', 'Reviewer'];
  var SO_PEOPLE = ['Jim Quan', 'Aishwarya Venkatakrishnan', 'Min-ji Park', 'David Lee', 'Sarah Chen'];
  var SO_DEFAULT_CS = [{ name: 'Jim Quan', role: 'Group Leader' }, { name: 'Aishwarya Venkatakrishnan', role: 'Witness' }];
  var SO = { view: 'author', seq: 0, cosigners: SO_DEFAULT_CS.slice(), subs: [], overall: 'ing' };   // subs[]: {id, ids, names, requested, rejected, rows:[{name, role, status, signed, comment}]}
  // 행 상태: pending / approved / notapproved / skipped (MAPIS 결재 뱃지 색: grey·green·red·purple)
  var SO_ST = { pending: ['grey', 'Pending'], approved: ['green', 'Approved'], notapproved: ['red', 'Not Approved'], skipped: ['purple', 'Skipped'] };

  function soById(id) { return document.getElementById(id); }
  // 제출 대상 기록 섹션(현재 순서, 숨김 카드 제외)
  function soCards() {
    var out = [];
    document.querySelectorAll('#tab_ov > .cardBox').forEach(function (c) {
      if (c.id === 'card_approval' || c.id === 'card_audit' || c.style.display === 'none') return;
      out.push(c);
    });
    return out;
  }
  function soActive() { return SO.subs.filter(function (s) { return !s.rejected; }); }
  function soLockInfo(id) {   // 이 섹션이 속한 유효 제출들의 잠금 표시 정보(없으면 null)
    var subs = soActive().filter(function (s) { return s.ids.indexOf(id) >= 0; });
    if (!subs.length) return null;
    var all = true, names = [];
    subs.forEach(function (s) { s.rows.forEach(function (r) {
      if (r.status !== 'approved') all = false; else if (names.indexOf(r.name) < 0) names.push(r.name);
    }); });
    return { signed: all, text: all ? 'Approved · ' + names.join(', ') : 'Submitted ' + subs[subs.length - 1].requested };
  }
  function soPendingCount() {
    var n = 0;
    soActive().forEach(function (s) { s.rows.forEach(function (r) { if (r.status === 'pending') n++; }); });
    return n;
  }
  function soOverall() {   // ing / appr / ok — 대기행 있으면 appr, 전원 승인+전 섹션 제출이면 ok, 일부만 승인이면 ing
    var act = soActive();
    if (!act.length) return 'ing';
    if (soPendingCount()) return 'appr';
    var all = soCards().every(function (c) { return !!soLockInfo(c.id); });
    return all ? 'ok' : 'ing';
  }
  function soApprovedCount() {   // 전원 승인된 섹션 수 / 전체 섹션 수
    var cards = soCards(), n = 0;
    cards.forEach(function (c) { var i = soLockInfo(c.id); if (i && i.signed) n++; });
    return { n: n, m: cards.length };
  }

  /* 섹션 잠금: 입력 readOnly/disabled, contenteditable=false, Summernote disable. 전역 view(elnApproved)가 건 잠금은 해제 시 건드리지 않음(data-elnlk 표식) */
  function soEach(card, sel, fn) { card.querySelectorAll(sel).forEach(function (el) { if (!el.closest('.elnErrataWrap')) fn(el); }); }
  // Materialize select의 표시용 input(.select-dropdown)은 네이티브 select가 disabled여도 포커스·키보드로 값 변경 가능 → 같이 비활성화.
  //  원래 비활성이던 것은 건드리지 않도록 직접 막은 것만 data-elnsd 표식. 복원은 네이티브 select 상태를 따라감.
  function soSelUiLock(scope) {
    scope.querySelectorAll('.select-wrapper input.select-dropdown').forEach(function (el) {
      if (el.closest('.elnErrataWrap')) return;
      if (!el.disabled) { el.disabled = true; el.tabIndex = -1; el.setAttribute('data-elnsd', '1'); }
    });
  }
  function soSelUiRestore(scope) {
    scope.querySelectorAll('input.select-dropdown[data-elnsd]').forEach(function (el) {
      var w = el.closest('.select-wrapper'), sel = w && w.querySelector('select');
      if (!sel || !sel.disabled) { el.disabled = false; el.removeAttribute('tabindex'); el.removeAttribute('data-elnsd'); }
    });
  }
  function soHasSn(el) { return window.jQuery && jQuery.fn && jQuery.fn.summernote && jQuery(el).next('.note-editor').length; }
  function lockSection(card, info) {
    card.classList.add('elnLocked');
    soEach(card, 'input, textarea', function (el) { if (!el.readOnly) { el.readOnly = true; el.setAttribute('data-elnlk', '1'); } });
    soEach(card, 'select', function (el) { if (!el.disabled) { el.disabled = true; el.setAttribute('data-elnlk', '1'); } });
    soSelUiLock(card);
    soEach(card, '[contenteditable]', function (el) {
      var v = el.getAttribute('contenteditable');
      if (v === 'true' || v === '') { el.setAttribute('contenteditable', 'false'); el.setAttribute('data-elnlk', '1'); }
    });
    card.querySelectorAll('.elnSummernote').forEach(function (el) { if (soHasSn(el)) { try { jQuery(el).summernote('disable'); } catch (e) {} } });
    // 헤더 잠금 배지
    var tit = card.querySelector('.cardTit2');
    if (tit) {
      var b = tit.querySelector('.elnLockBadge');
      if (!b) {
        b = document.createElement('span');
        var w = tit.querySelector('.elnModTitleWrap');
        if (w && w.nextSibling) tit.insertBefore(b, w.nextSibling); else tit.appendChild(b);
      }
      b.className = 'elnLockBadge' + (info && info.signed ? ' signed' : '');
      b.innerHTML = '<i class="material-symbols-outlined">lock</i>' + esc(info ? info.text : 'Submitted');
    }
    // 좌측 목차: 자물쇠 아이콘(+드래그 핸들 CSS로 숨김)
    var li = document.querySelector('.leftAside .menuUl .menu-item[data-target="' + card.id + '"]');
    if (li) {
      li.classList.add('elnLockedNav');
      if (!li.querySelector('.elnNavLock')) { var ni = document.createElement('i'); ni.className = 'material-symbols-outlined elnNavLock'; ni.textContent = 'lock'; li.appendChild(ni); }
    }
    soEnsureErrataBar(card);
  }
  function unlockSection(card) {
    var globalRo = document.body.classList.contains('elnApproved');
    card.classList.remove('elnLocked');
    if (!globalRo) {
      card.querySelectorAll('.elnSummernote').forEach(function (el) { if (soHasSn(el)) { try { jQuery(el).summernote('enable'); } catch (e) {} } });
    }
    card.querySelectorAll('[data-elnlk]').forEach(function (el) {
      if (!globalRo) {
        if (el.tagName === 'SELECT') el.disabled = false;
        else if (el.hasAttribute('contenteditable')) el.setAttribute('contenteditable', 'true');
        else el.readOnly = false;
      }
      el.removeAttribute('data-elnlk');
    });
    if (!globalRo) soSelUiRestore(card);
    var b = card.querySelector('.cardTit2 .elnLockBadge'); if (b) b.remove();
    var li = document.querySelector('.leftAside .menuUl .menu-item[data-target="' + card.id + '"]');
    if (li) { li.classList.remove('elnLockedNav'); var ni = li.querySelector('.elnNavLock'); if (ni) ni.remove(); }
    var wrap = card.querySelector(':scope > .elnErrataWrap');   // Errata 블록은 유지, 버튼/폼만 제거
    if (wrap) { var bar = wrap.querySelector('.elnErrataBar'); if (bar) bar.remove(); if (!wrap.querySelector('.elnErrata')) wrap.remove(); }
  }
  // 현재 제출 상태에 맞춰 모든 섹션 잠금/해제 동기
  function soRefreshLocks() {
    document.querySelectorAll('#tab_ov > .cardBox').forEach(function (c) {
      if (c.id === 'card_approval' || c.id === 'card_audit') return;
      var info = soLockInfo(c.id);
      if (info) lockSection(c, info); else if (c.classList.contains('elnLocked')) unlockSection(c);
    });
  }

  /* Errata — 잠긴 섹션 하단 '+ Errata'. 저장된 블록은 불변(append-only) */
  function soEnsureErrataBar(card) {
    var wrap = card.querySelector(':scope > .elnErrataWrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'elnErrataWrap'; card.appendChild(wrap); }
    if (wrap.querySelector('.elnErrataBar')) return;
    var bar = document.createElement('div'); bar.className = 'elnErrataBar';
    var btn = document.createElement('a');
    btn.href = 'javascript:;'; btn.className = 'waves-effect waves-light hBtn';
    btn.innerHTML = '<i class="material-symbols-outlined left">edit_note</i><span class="label">Errata</span>';
    btn.addEventListener('click', function () { soErrataModal(card); });
    bar.appendChild(btn); wrap.appendChild(bar);
  }
  function soErrataForm(card, bar, btn) {
    // (인라인 폼 → 모달로 대체됨)
  }
  function soWarn(title, text) {
    if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: title, text: text });
    else ELN.toast(text, 'warn');
  }
  // Errata 모달 — MAPIS 코멘트 모달 패턴(aniInput + focus-border). 저장분은 불변 블록으로 append
  function soErrataModal(card) {
    var body = document.createElement('div');
    body.innerHTML = '<div class="elnBasicRow alignTop"><div class="elnBasicLabel"><span class="essential">*</span>Correction</div>'
      + '<div class="aniInput"><textarea class="materialize-textarea" style="min-height:80px;" placeholder="Describe what is corrected"></textarea><span class="focus-border"></span></div></div>'
      + '<div class="elnBasicRow"><div class="elnBasicLabel"><span class="essential">*</span>Reason</div>'
      + '<div class="aniInput"><input type="text" class="browser-default" placeholder="Why is this correction needed?"><span class="focus-border"></span></div></div>';
    var ta = body.querySelector('textarea'), inp = body.querySelector('input');
    ELN.modal({ title: 'Add Errata', icon: 'edit_note', size: 'sm', body: body, actions: [
      { label: 'Save', type: 'hViva', icon: 'save', onClick: function () {
        var text = ta.value.trim(), reason = inp.value.trim();
        if (!text || !reason) { soWarn('Required', 'Please enter the correction and the reason.'); return true; }
        var wrap = card.querySelector(':scope > .elnErrataWrap'); if (!wrap) { soEnsureErrataBar(card); wrap = card.querySelector(':scope > .elnErrataWrap'); }
        var bar = wrap.querySelector('.elnErrataBar');
        var n = wrap.querySelectorAll('.elnErrata').length + 1;
        var blk = document.createElement('div'); blk.className = 'elnErrata';
        blk.innerHTML = '<div class="elnErrataHead"><span class="roundBox mocha25 pl10 pr10 font12">Errata #' + n + '</span>'
          + '<span class="elnErrataMeta">' + esc(ELN.audit.now()) + ' · ' + esc(ELN.currentUser) + '</span></div>'
          + '<div class="elnErrataBody">' + esc(text) + '</div><div class="elnErrataReason">Reason: ' + esc(reason) + '</div>';
        wrap.insertBefore(blk, bar);
        ELN.audit.log({ section: sectionNameOf(card), action: 'Errata added', detail: text });
        ELN.toast('Errata #' + n + ' added.', 'ok');
      } },
      { label: 'Cancel', type: 'hGrey', icon: 'close' }
    ] });
    setTimeout(function () { ta.focus(); }, 60);
  }

  /* 제출 / 서명 / 반려 */
  function soApply(setHead, announce) {
    soRefreshLocks(); renderSignoff(); soBadge();
    if (!setHead) return;
    var st = soOverall();
    setHeadStatus(st);
    // 전체 읽기전용 view는 완전 승인(ok)일 때만. 그 외 상태로 벗어나면 해제
    var ro = document.body.classList.contains('elnApproved');
    if (st === 'ok' && !ro) { apprView = true; setNoteApproved(true); }
    else if (st !== 'ok' && ro) { apprView = false; setNoteApproved(false); }
    if (st === 'ok' && SO.overall !== 'ok') {
      // 서명 제출 경로(announce)·모듈 삭제 등 외부 경로 모두 전이 시 토스트 + 감사로그 1건 (reset 시드는 SO.overall을 먼저 맞춰 두므로 발생 안 함)
      ELN.toast('All sections approved. The note is now approved and locked.', 'ok');
      ELN.audit.log({ user: 'System', section: SO_SEC, action: 'Note approved', detail: 'All sections approved' });   // 시스템 이벤트 — 시드와 같은 귀속
    }
    SO.overall = st;
  }
  function soBadge() {
    var el = document.getElementById('elnApprovalBadge'); if (!el) return;
    var n = soPendingCount(), st = soOverall();
    if (n) { el.className = 'elnApprBadge pending'; el.innerHTML = '<i class="material-symbols-outlined">pending_actions</i>Awaiting ' + n + ' signature' + (n > 1 ? 's' : ''); }
    else if (st === 'ok') { el.className = 'elnApprBadge'; el.innerHTML = ''; }   // 완전 승인은 헤더 알약(Approved)과 중복 → 배지 숨김
    else if (soActive().length) { var c = soApprovedCount(); el.className = 'elnApprBadge approved'; el.innerHTML = '<i class="material-symbols-outlined">verified</i>Approved ' + c.n + ' of ' + c.m + ' sections'; }
    else { el.className = 'elnApprBadge'; el.innerHTML = ''; }
  }
  function soSubmit(ids) {
    var names = ids.map(function (id) { return sectionNameOf(soById(id)); });
    SO.subs.push({ id: ++SO.seq, ids: ids, names: names, requested: ELN.audit.now(), rejected: false,
      rows: SO.cosigners.map(function (c) { return { name: c.name, role: c.role, status: 'pending', signed: '', comment: '' }; }) });
    ELN.audit.log({ section: SO_SEC, action: 'Submitted', detail: names.join(', ') });
    soApply(true, true);
    ELN.toast(ids.length + ' section' + (ids.length > 1 ? 's' : '') + ' submitted for co-signature.', 'ok');
  }
  function soSubById(id) { for (var i = 0; i < SO.subs.length; i++) if (SO.subs[i].id === id) return SO.subs[i]; return null; }
  function soDecide(subId, idx, reject) {
    var sub = soSubById(subId), row = sub && sub.rows[idx];
    if (!row || row.status !== 'pending') return;
    var tr = document.querySelector('#elnSignBody tr[data-sub="' + subId + '"][data-row="' + idx + '"]');
    var ta = tr && tr.querySelector('textarea'), sel = tr && tr.querySelector('select');
    var comment = ta ? ta.value.trim() : '';
    reject = !!sel && sel.value === 'notapproved';
    if (reject && !comment) { soWarn('Comment Required', 'Please enter comments when selecting Not Approved.'); return; }
    var detail = sub.names.join(', ') + (comment ? ': "' + comment + '"' : '');
    row.comment = comment; row.signed = ELN.audit.now();
    if (!reject) {
      row.status = 'approved';
      ELN.audit.log({ user: row.name, section: SO_SEC, action: 'Approved', detail: detail });
    } else {
      row.status = 'notapproved';
      sub.rejected = true;   // 제출 전체 반려 → 섹션 잠금 해제(Errata 유지), 나머지 대기행은 Skipped
      sub.rows.forEach(function (r) { if (r.status === 'pending') r.status = 'skipped'; });
      ELN.audit.log({ user: row.name, section: SO_SEC, action: 'Not approved', detail: detail });
      if (document.body.classList.contains('elnApproved')) { apprView = false; setNoteApproved(false); }   // 전체 읽기전용 해제 → 미잠금 섹션 편집 가능
    }
    var before = SO.overall;
    soApply(true, true);
    if (reject) ELN.toast('Not approved. The sections are unlocked for editing.', 'warn');
    else if (SO.overall !== 'ok' || before === 'ok') ELN.toast('Approved.', 'ok');
  }
  function soHasPerson(name) { return SO.cosigners.some(function (c) { return c.name === name; }); }
  function soCanRemove(name) {
    return !SO.subs.some(function (s) { return !s.rejected && s.rows.some(function (r) { return r.name === name && (r.status === 'pending' || r.status === 'approved'); }); });   // 반려된 제출의 행은 무시
  }

  /* 섹션 선택 목록 — 테두리 컨테이너 + 헤더(Select all · N of M selected) + 헤어라인 행. items: [{id,name,checked,disabled,tag}] */
  function soPickBox(items) {
    var el = document.createElement('div'); el.className = 'elnPickBox';
    var h = '<div class="elnPickHd"><label><input type="checkbox" class="filled-in jsPickAll"><span>Select all</span></label><span class="elnPickCnt"></span></div>'
      + '<div class="elnSignPickList hScroll">';
    items.forEach(function (it) {
      h += '<div class="elnSignPickRow"><label><input type="checkbox" class="filled-in jsPickRow" data-id="' + esc(it.id) + '"' + (it.checked ? ' checked' : '') + (it.disabled ? ' disabled' : '') + '><span>' + esc(it.name) + '</span></label>'
        + (it.tag ? '<span class="roundBox stone25">' + esc(it.tag) + '</span>' : '') + '</div>';
    });
    el.innerHTML = h + '</div>';
    var all = el.querySelector('.jsPickAll'), cnt = el.querySelector('.elnPickCnt');
    function rows() { return [].slice.call(el.querySelectorAll('.jsPickRow:not(:disabled)')); }
    function sync() {
      var r = rows(), n = r.filter(function (i) { return i.checked; }).length;
      cnt.textContent = n + ' of ' + r.length + ' selected';
      all.checked = r.length > 0 && n === r.length; all.disabled = !r.length;
    }
    all.addEventListener('change', function () { rows().forEach(function (i) { i.checked = all.checked; }); sync(); });
    el.addEventListener('change', function (e) { if (e.target !== all) sync(); });
    sync();
    return { el: el, ids: function () { return rows().filter(function (i) { return i.checked; }).map(function (i) { return i.getAttribute('data-id'); }); } };
  }

  /* 모달들 */
  function soOpenSubmit() {
    if (!SO.cosigners.length) { ELN.toast('Add at least one co-signer first.', 'warn'); return; }
    var cards = soCards();
    if (!cards.some(function (c) { return !soLockInfo(c.id); })) { ELN.toast('No unsubmitted sections.', 'info'); return; }
    var pb = soPickBox(cards.map(function (c) {
      var locked = !!soLockInfo(c.id);
      return { id: c.id, name: sectionNameOf(c), disabled: locked, checked: locked, tag: locked ? 'Submitted' : '' };
    }));
    var wrap = pb.el;
    ELN.modal({ title: 'Submit Sections', icon: 'playlist_add_check', size: 'md', body: wrap, actions: [
      { label: 'Cancel', type: '' },
      { label: 'Submit', type: 'hViva', icon: 'send', onClick: function () {
        var ids = pb.ids();
        if (!ids.length) { ELN.toast('Select at least one section.', 'warn'); return true; }
        soSubmit(ids);
      } }
    ] });
  }
  function soSubmitAll() {
    if (!SO.cosigners.length) { ELN.toast('Add at least one co-signer first.', 'warn'); return; }
    var ids = soCards().filter(function (c) { return !soLockInfo(c.id); }).map(function (c) { return c.id; });
    if (!ids.length) { ELN.toast('No unsubmitted sections.', 'info'); return; }
    ELN.modal({ title: 'Submit All', icon: 'send', size: 'sm',
      body: 'Submit ' + ids.length + ' section' + (ids.length > 1 ? 's' : '') + ' for co-signature? Submitted sections can no longer be edited; corrections are added as Errata.',
      actions: [{ label: 'Cancel', type: '' }, { label: 'Submit', type: 'hViva', icon: 'send', onClick: function () { soSubmit(ids); } }] });
  }
  function soOpenAdd() {
    var avail = SO_PEOPLE.filter(function (p) { return p !== ELN.currentUser && !soHasPerson(p); });
    if (!avail.length) { ELN.toast('Everyone available is already a co-signer.', 'info'); return; }
    var wrap = document.createElement('div');
    var pLbl = document.createElement('div'); pLbl.className = 'elnS2Lbl'; pLbl.textContent = 'Co-signer';
    var pSel = S2.make(false);   // 운영 사람 선택과 동일 부품: select2(User ID / Name)
    var roleLbl = document.createElement('div'); roleLbl.className = 'elnS2Lbl'; roleLbl.textContent = 'Role';
    var sel = document.createElement('select');   // 짧은 단일 목록 = select2(검색창 없음)
    SO_ROLES.forEach(function (r) { var o = document.createElement('option'); o.value = r; o.textContent = r; sel.appendChild(o); });
    wrap.appendChild(pLbl); wrap.appendChild(pSel); wrap.appendChild(roleLbl); wrap.appendChild(sel);
    ELN.modal({ title: 'Add Co-Signer', icon: 'person_add', size: 'sm', body: wrap, actions: [
      { label: 'Cancel', type: '' },
      { label: 'Add', type: 'hViva', icon: 'person_add', onClick: function () {
        var picked = pSel.value;
        if (!picked) { ELN.toast('Select a person first.', 'warn'); return true; }
        SO.cosigners.push({ name: picked, role: sel.value });
        ELN.audit.log({ section: SO_SEC, action: 'Co-signer added', detail: picked + ' (' + sel.value + ')' });
        // 진행 중(반려·완전승인 아님) 제출마다 대기행 추가
        var added = 0;
        SO.subs.forEach(function (s) {
          if (s.rejected || !s.rows.some(function (r) { return r.status === 'pending'; })) return;
          s.rows.push({ name: picked, role: sel.value, status: 'pending', signed: '', comment: '' }); added++;
        });
        if (added) ELN.audit.log({ section: SO_SEC, action: 'Signature requested', detail: picked + ' added to ' + added + ' pending submission' + (added > 1 ? 's' : '') });
        if (added) soApply(true, false); else renderSignoff();
        ELN.toast(picked + ' added as co-signer.', 'ok');
      } }
    ] });
    S2.mount(pSel, { data: S2.people(avail), placeholder: 'User ID / Name', minimumResultsForSearch: 0, templateResult: S2.T.person });
    S2.mount(sel);
  }

  /* 카드 렌더 */
  function renderSignoff() {
    var box = soById('elnSignBody'); if (!box) return;
    var au = SO.view === 'author';
    var h = '<div class="elnSignBar"><div class="elnSignSeg"><span class="elnSignSegLbl">View as</span>'
      + '<div class="newAppleTab greenTab wd130pxType elnSignTab"><ul>'
      + '<li class="waves-effect waves-hColor' + (au ? ' on' : '') + '" data-act="view" data-v="author">Author</li>'
      + '<li class="waves-effect waves-hColor' + (au ? '' : ' on') + '" data-act="view" data-v="cosigner">Co-Signer</li>'
      + '<div class="tabBg"></div></ul></div></div>';
    if (au) {
      h += '<div class="elnSignActs">'
        + '<a href="javascript:;" class="waves-effect waves-light hBtn" data-act="add"><i class="material-symbols-outlined left">person_add</i><span class="label">Add Co-Signer</span></a>'
        + '<a href="javascript:;" class="waves-effect waves-light hBtn" data-act="subSel"><i class="material-symbols-outlined left">playlist_add_check</i><span class="label">Submit Sections</span></a>'
        + '<a href="javascript:;" class="waves-effect waves-light hBtn hViva" data-act="subAll"><i class="material-symbols-outlined left">send</i><span class="label">Submit All</span></a></div>';
    }
    h += '</div><div class="elnSignCs"><span class="elnSignCsLbl">Co-Signers</span>';
    if (!SO.cosigners.length) h += '<span class="elnSignNone">None assigned</span>';
    SO.cosigners.forEach(function (c) {
      h += '<span class="roundBox outline stone25 elnSignChip">' + esc(c.name) + ' · ' + esc(c.role)
        + (au && soCanRemove(c.name) ? '<i class="material-symbols-outlined" data-act="rm" data-n="' + esc(c.name) + '" title="Remove">close</i>' : '') + '</span>';
    });
    h += '</div><div class="cardSubTit mt30">Co-Signer Sign-Off Status</div>'
      + '<div class="fixedTable hBorderTable hScroll mg10"><table class="elnSignTable"><thead><tr>'
      + '<th>Sections</th><th>Role</th><th>Co-Signer</th><th>Decision</th><th>Comment</th><th>Date</th><th></th></tr></thead><tbody>';
    var rows = '';
    SO.subs.forEach(function (s) {
      s.rows.forEach(function (r, i) {
        var st = SO_ST[r.status] || SO_ST.pending, dec, cm, act = '';
        if (r.status === 'pending' && !s.rejected && !au) {   // Co-Signer 뷰: 결정 입력
          dec = '<div class="aniInput"><select class="browser-default"><option value="approved">Approved</option><option value="notapproved">Not Approved</option></select></div>';
          cm = '<div class="aniInput"><textarea class="materialize-textarea" maxlength="500" placeholder="(Optional)"></textarea><span class="focus-border"></span></div>';
          act = '<a href="javascript:;" class="waves-effect waves-hColor hBtn hViola hSmall pl5" data-act="submit" data-sub="' + s.id + '" data-row="' + i + '"><i class="material-symbols-outlined mr0">check_small</i>Submit</a>';
        } else {
          dec = '<span class="roundBox ' + st[0] + ' pl10 pr10 font12" style="min-width:94px">' + st[1] + '</span>';
          cm = esc(r.comment || '');
        }
        rows += '<tr data-sub="' + s.id + '" data-row="' + i + '"><td>' + esc(s.names.join(', ')) + '</td><td class="al font12">' + esc(r.role) + '</td>'
          + '<td class="al">' + esc(r.name) + '</td><td class="ac">' + dec + '</td><td>' + cm + '</td>'
          + '<td class="ac">' + ((r.status === 'approved' || r.status === 'notapproved') && r.signed ? esc(r.signed) : '-') + '</td><td class="ac">' + act + '</td></tr>';
      });
    });
    h += rows || '<tr><td colspan="7" class="ac">Nothing submitted yet. Submit sections to request co-signatures.</td></tr>';
    box.innerHTML = h + '</tbody></table></div>';
    soPlaceTabBg(box);
  }
  // View-as 탭 pill 위치: 활성 li 기준(common.css .tabBg 기본 left:-2px)
  function soPlaceTabBg(box) {
    var on = box.querySelector('.elnSignTab li.on'), bg = box.querySelector('.elnSignTab .tabBg');
    if (on && bg) bg.style.left = (on.offsetLeft - 2) + 'px';
  }
  function initSignoff() {
    var box = soById('elnSignBody'); if (!box) return;
    box.addEventListener('click', function (e) {
      var t = e.target.closest('[data-act]'); if (!t || !box.contains(t)) return;
      var act = t.getAttribute('data-act');
      if (act === 'view') {
        var v = t.getAttribute('data-v'); if (v === SO.view) return;
        box.querySelectorAll('.elnSignTab li').forEach(function (l) { l.classList.remove('on'); });
        t.classList.add('on'); soPlaceTabBg(box);   // pill 슬라이드(CSS transition) 후 재렌더
        setTimeout(function () { SO.view = v; renderSignoff(); }, 220);
      }
      else if (act === 'add') soOpenAdd();
      else if (act === 'subSel') soOpenSubmit();
      else if (act === 'subAll') soSubmitAll();
      else if (act === 'rm') {
        var n = t.getAttribute('data-n');
        SO.cosigners = SO.cosigners.filter(function (c) { return c.name !== n; });
        ELN.audit.log({ section: SO_SEC, action: 'Co-signer removed', detail: n });
        renderSignoff(); ELN.toast(n + ' removed.', 'info');
      }
      else if (act === 'submit') soDecide(+t.getAttribute('data-sub'), +t.getAttribute('data-row'));
    });
    renderSignoff(); soBadge();
  }
  document.addEventListener('DOMContentLoaded', initSignoff);

  // 데모 상태 시드(감사로그 없음): 'appr' = Jim 서명·Aishwarya 대기, 'ok' = 모두 서명, 그 외 = 초기화
  ELN.signoff = {
    reset: function (st) {
      SO.view = 'author'; SO.cosigners = SO_DEFAULT_CS.slice(); SO.subs = []; SO.overall = 'ing';
      document.querySelectorAll('#tab_ov > .cardBox > .elnErrataWrap').forEach(function (w) { w.remove(); });
      if (st === 'appr' || st === 'ok') {
        var cards = soCards();
        SO.subs.push({ id: ++SO.seq, ids: cards.map(function (c) { return c.id; }), names: cards.map(sectionNameOf), requested: '2026-10-12 09:30', rejected: false,
          rows: [{ name: 'Jim Quan', role: 'Group Leader', status: 'approved', signed: '2026-10-12 15:10', comment: 'Data verified.' },
            st === 'ok' ? { name: 'Aishwarya Venkatakrishnan', role: 'Witness', status: 'approved', signed: '2026-10-13 10:05', comment: '' }
                        : { name: 'Aishwarya Venkatakrishnan', role: 'Witness', status: 'pending', signed: '', comment: '' }] });
        SO.overall = soOverall();
        // 시드한 제출/서명에 맞는 감사 이력(시드 시각·사용자 사용 — 표는 ts 정렬이라 시간순 유지). 액션명은 실제 제출/서명 경로와 동일
        var sd = SO.subs[0], sdNames = sd.names.join(', ');
        ELN.audit.log({ ts: sd.requested, section: SO_SEC, action: 'Submitted', detail: sdNames });
        sd.rows.forEach(function (r) {
          if (r.status !== 'approved') return;
          ELN.audit.log({ ts: r.signed, user: r.name, section: SO_SEC, action: 'Approved', detail: sdNames + (r.comment ? ': "' + r.comment + '"' : '') });
        });
        if (st === 'ok') ELN.audit.log({ ts: sd.rows[sd.rows.length - 1].signed, user: 'System', section: SO_SEC, action: 'Note approved', detail: 'All sections approved' });
      }
      soApply(true, false);   // 락·카드·배지 + 헤더 알약/전체 읽기전용 동기
    },
    clear: function () { SO.subs = []; SO.overall = 'ing'; },   // 노트 전환 중간 상태용(재계산 없음 — 이어서 reset)
    refresh: function () { soApply(true, false); },   // 모듈 추가/삭제 등 뒤 전체 상태 재계산
    relock: soRefreshLocks
  };

  // 노트 전체 읽기전용 view ⇄ 편집 일괄 전환. 값은 또렷하게 두고 편집 affordance만 CSS(body.elnApproved)가 숨김.
  function setNoteApproved(approved) {
    document.body.classList.toggle('elnApproved', approved);
    var article = document.getElementById('tab_ov'); if (!article) return;
    article.querySelectorAll('.cardBox:not(#card_approval):not(#card_audit)').forEach(function (card) {
      card.querySelectorAll('input, textarea').forEach(function (el) { el.readOnly = approved; });
      card.querySelectorAll('select').forEach(function (el) { el.disabled = approved; });
      if (approved) soSelUiLock(card); else soSelUiRestore(card);   // Materialize 표시용 input도 같이(키보드 변경 차단)
      // 카드 제목·메모, DataTable 셀, Summernote 에디터, 포스트잇 본문 등 모든 contenteditable
      card.querySelectorAll('[contenteditable]').forEach(function (el) { el.setAttribute('contenteditable', approved ? 'false' : 'true'); });
      // Summernote 상태(툴바·options.editing)도 맞춤 — 해제 시엔 개별 잠금 카드는 제외(뒤이은 relock이 다시 잠금)
      if (approved || !card.classList.contains('elnLocked')) {
        card.querySelectorAll('.elnSummernote').forEach(function (el) { if (soHasSn(el)) { try { jQuery(el).summernote(approved ? 'disable' : 'enable'); } catch (e) {} } });
      }
    });
    if (!approved && ELN.signoff && ELN.signoff.relock) ELN.signoff.relock();   // 편집 복귀 시에도 제출된 섹션은 계속 잠금
  }

  // 리스트에서 넘어온 노트 상태(st) 반영 — 헤더 상태 알약 + 작성중(ing) 외에는 View(읽기전용) 진입.
  //  ing=작성중→편집 / appr=결재진행중·ok=완료→뷰. window.load 후 실행(모듈·Summernote init 완료 뒤 readOnly 적용).
  function initNoteStatusMode() {
    var st = '';
    try { st = new URLSearchParams(location.search).get('st') || ''; } catch (e) {}
    if (!st) return;
    var m = (st === 'ok' || st === 'done') ? 'ok' : ((st === 'appr' || st === 'review') ? 'appr' : 'ing');
    setHeadStatus(m);
    apprView = (m === 'ok'); setNoteApproved(apprView);   // 완전 승인만 전체 읽기전용(결재중은 섹션별 잠금)
    initNoteFmlFromOpener();   // 시드 전에 Formulation 표시 여부 확정 — 숨길 카드가 서명·감사 시드에 섞이지 않게(+80ms 호출은 중복 무해)
    if (ELN.signoff) ELN.signoff.reset(m);   // 모듈 생성 후 시드 + 섹션 잠금
  }
  window.addEventListener('load', function () { setTimeout(initNoteStatusMode, 60); });

  /* ── 잠긴 섹션·승인 view에선 이미지 드래그앤드롭 차단 ──
     Summernote dropzone은 document에 dragenter/dragleave/drop을 바인딩하고 dropzone 요소에 drop을 바인딩 →
     summernote('disable')로는 풀리지 않음. window 캡처 단계에서 가로채 어떤 핸들러에도 닿지 않게 하고(브라우저의 파일 열기도 방지) 한다.
     카드 정렬 sortable은 마우스 이벤트 기반(HTML5 DnD 아님)이라 영향 없음. */
  window.addEventListener('dragenter', blockLockedDnd, true);
  window.addEventListener('dragover', blockLockedDnd, true);
  window.addEventListener('drop', blockLockedDnd, true);
  function blockLockedDnd(e) {
    var t = e.target; if (!t || !t.closest) return;
    if (t.closest('#card_audit, #card_approval')) return;
    var locked = t.closest('.cardBox.elnLocked') || (document.body.classList.contains('elnApproved') && t.closest('#tab_ov'));
    if (!locked) return;
    e.preventDefault(); e.stopPropagation();
    if (e.dataTransfer) { try { e.dataTransfer.dropEffect = 'none'; } catch (err) {} }
  }

  /* ── 포스트잇 — 섹션에 우클릭으로 부착(섹션 상대좌표 → reflow에 강함). 드래그 이동·접기·삭제. 저장은 실구현에서(프로토타입 제외) ── */
  /* 스티커는 섹션에 속함 — 그 섹션을 볼 수 있는 사람(Share & Access 범위)이 곧 스티커를 볼 수 있음(별도 공유 없음).
     opts(데모 시드용): { author, time, text, left, top, seed } — 시드는 감사 로그 없이 만들고 노트 전환 시 지움 */
  function addPostit(card, clientX, clientY, opts) {
    opts = opts || {};
    card.classList.add('elnPostitHost');   // 섹션을 positioning context로(상대좌표 기준계)
    var rect = card.getBoundingClientRect(), W = 200;
    var x = opts.left != null ? opts.left : Math.max(4, Math.min(clientX - rect.left, card.clientWidth - W - 4));
    var y = opts.top != null ? opts.top : Math.max(4, Math.min(clientY - rect.top, card.clientHeight - 30 - 4));
    var now = new Date(), author = opts.author || ELN.currentUser;
    var time = opts.time || ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);
    var p = document.createElement('div'); p.className = 'elnPostit';
    if (opts.seed) p.setAttribute('data-seed', '1');
    p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.width = W + 'px';
    p.innerHTML = '<div class="elnPostitBar"><i class="elnPostitGrip material-symbols-outlined">drag_indicator</i>'
      + '<span class="elnPostitWho" title="Visible to everyone with access to this section">' + esc(author) + ' · ' + time + '</span>'
      + '<a href="javascript:;" class="elnPostitCollapse" title="Collapse"><i class="material-symbols-outlined">expand_less</i></a>'
      + '<a href="javascript:;" class="elnPostitClose" title="Remove"><i class="material-symbols-outlined">close</i></a></div>'
      + '<div class="elnPostitBody" contenteditable="true" data-ph="Note…"></div>';
    if (opts.text) p.querySelector('.elnPostitBody').textContent = opts.text;
    card.appendChild(p);
    p.querySelector('.elnPostitCollapse').addEventListener('click', function () {
      var col = p.classList.toggle('collapsed');
      this.querySelector('i').textContent = col ? 'expand_more' : 'expand_less';
    });
    function postitFrozen() { return !!p.closest('.cardBox.elnLocked') || document.body.classList.contains('elnApproved'); }   // 잠긴 섹션·승인 view에선 삭제/이동 불가
    p.querySelector('.elnPostitClose').addEventListener('click', function () {
      if (postitFrozen()) return;
      var txt = (p.querySelector('.elnPostitBody').textContent || '').trim();
      auditMod(card, 'Sticky note removed', { detail: txt ? (txt.length > 30 ? txt.slice(0, 30) + '…' : txt) : '(empty)' });
      p.remove();
    });
    var bar = p.querySelector('.elnPostitBar');
    bar.addEventListener('mousedown', function (e) {
      if (e.target.closest('.elnPostitCollapse, .elnPostitClose')) return;
      if (postitFrozen()) return;
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
    if (opts.seed) return p;
    setTimeout(function () { try { p.querySelector('.elnPostitBody').focus(); } catch (e) {} }, 30);
    auditMod(card, 'Sticky note added');
    return p;
  }
  document.addEventListener('DOMContentLoaded', function () {
    var article = document.getElementById('tab_ov'); if (!article) return;
    // 우클릭 → context menu(액션 배열 → 향후 확장 용이). 메뉴 아이템 클릭으로 액션 실행
    var CTX_ACTIONS = [
      { icon: 'sticky_note_2', label: 'Add Sticky Note', run: function (card, x, y) { addPostit(card, x, y); } }
    ];
    article.addEventListener('contextmenu', function (e) {
      // 편집/인터랙티브 요소·기존 포스트잇 위에선 네이티브 메뉴 유지
      if (e.target.closest('input, textarea, [contenteditable="true"], .note-editable, a, button, .elnPostit, .elnModDel')) return;
      var card = e.target.closest('.cardBox'); if (!card) return;
      if (card.classList.contains('elnLocked')) return;   // 잠긴 섹션엔 스티커 불가(네이티브 메뉴 유지)
      if (card.id === 'card_audit' || card.id === 'card_approval') return;   // 감사·결재 카드엔 스티커 불가
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
      it.className = 'elnNbPopItem' + (nb.key === 'unfiled' ? ' unfiled' : '') + (nb.name === cur ? ' cur' : ''); // 흐림 = 임시 보관소, cur = 현재 선택
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
        title: 'New Notebook', icon: 'create_new_folder', size: 'sm', body: inp,
        actions: [
          { label: 'Cancel' },
          { label: 'Create', type: 'hViva', onClick: function () {
            var name = (inp.value || '').trim() || 'Untitled Notebook';
            NOTEBOOKS.push({ key: 'nb' + NOTEBOOKS.length, name: name, icon: 'folder' });
            setNotebookMeta(name);
            ELN.toast('Notebook "' + name + '" created. Note filed.', 'ok');
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

  /* ── Associated Project # (NPI, NPT, TS) — MAPIS 프로젝트 디렉터리(목업). MAPIS에서 프로젝트 번호 = NPI 번호.
        유형: SN/CN = NPI, PT = NPT, TS = Tech Support. c = 코드, t = 제목 ── */
  var MAPIS_PROJECTS = [
    { c: 'SN-26-0031', t: 'RGBOLED Display Adhesive' }, { c: 'SN-26-0018', t: 'Flexible OLED Encapsulant' },
    { c: 'SN-26-0047', t: 'Low viscosity high vinyl polybutadiene' }, { c: 'SN-26-0007', t: 'Low-Temp Cure PSA' },
    { c: 'SN-26-0112', t: 'Release Liner Coating' }, { c: 'CN-26-0064', t: 'Flexible OLED Lamination' },
    { c: 'CN-26-0090', t: 'Customer A OCR Program' }, { c: 'CN-26-0112', t: 'UV-Curable Conformal Coating' },
    { c: 'CN-26-0071', t: 'Barrier Film' }, { c: 'PT-25-0182', t: 'Optical Clear Resin' },
    { c: 'PT-26-0021', t: 'New preservative for Silsoft' }, { c: 'PT-26-0034', t: 'Low Viscosity Binder Gel T' },
    { c: 'PT-26-0047', t: 'Pilot Adhesive Line' }, { c: 'TS-26-0205', t: 'Electro 242-2 Grey FC' },
    { c: 'TS-26-0218', t: 'High-Temp Silicone Encapsulant' }
  ];

  /* 연결 프로젝트 상태 — NOTE_PROJ[0] = Primary(항상 첫 칩). Primary가 Stage/Task 스케줄과 Note List 라벨을 정함.
     프로젝트 연결은 노트 메타데이터 — 노트 접근 권한과 무관. 칩 클릭 → 동작 메뉴(Open / Set as primary / Unlink) */
  var NOTE_PROJ = [];
  var DEMO_PROJ = ['SN-26-0031', 'PT-26-0021', 'TS-26-0205'];   // NT-2605-00142 데모: Primary NPI + 공정이관(NPT) + Tech Support — 리스트 시드와 동일
  function projType(c) { var p = String(c).slice(0, 2); return p === 'PT' ? 'NPT' : (p === 'TS' ? 'TS' : 'NPI'); }
  function projByCode(c) { return MAPIS_PROJECTS.filter(function (p) { return p.c === c; })[0] || null; }
  function projText(c) { var p = projByCode(c); return p ? c + ' ' + p.t : c; }
  function projBracket(c) { var p = projByCode(c); return p ? '[' + c + '] ' + p.t : '[' + c + ']'; }
  // Basic Data 잠금(결재 잠금·승인 완료) 중이면 변경 불가
  function projFrozen() {
    var b = document.getElementById('card_basic');
    return document.body.classList.contains('elnApproved') || !!(b && b.classList.contains('elnLocked'));
  }
  function projAudit(action, o) {
    o = o || {}; o.section = sectionNameOf(document.getElementById('card_basic')); o.action = action;
    ELN.audit.log(o);   // 프로그램적 일괄 작업은 ELN.audit.mute로 자동 무시
  }
  function projectsOf(n) {
    if (n && n.projects && n.projects.length) return n.projects.slice();
    if (n && n.project) return [n.project];
    return ['SN-26-0031'];
  }
  function initialProjects() {
    var p = null; try { p = new URLSearchParams(location.search); } catch (e) {}
    var code = p ? (p.get('code') || '') : '', pj = p ? (p.get('project') || '') : '';
    if (p && p.get('tmpl')) return ['SN-26-0031'];
    if (!code || code === 'NT-2605-00142') return DEMO_PROJ.slice();
    if (pj) return [pj];
    return projectsOf(PROJECT_NOTES.filter(function (n) { return n.code === code; })[0]);
  }
  function persistProj() {   // 노트 전환 후 돌아와도 유지되도록 현재 노트에 보관
    var cur = PROJECT_NOTES.filter(function (n) { return n.current; })[0];
    if (cur) cur.projects = NOTE_PROJ.slice();
  }
  function renderProjects() {
    var wrap = document.getElementById('elnProjVal'); if (!wrap) return;
    wrap.innerHTML = '';
    if (!NOTE_PROJ.length) { var none = document.createElement('span'); none.className = 'elnPjNone'; none.textContent = 'No project linked'; wrap.appendChild(none); }
    NOTE_PROJ.forEach(function (c, i) {
      var p = projByCode(c), prim = (i === 0);
      var chip = document.createElement('span');
      chip.className = 'elnPjChip' + (prim ? ' primary' : '');
      chip.setAttribute('data-code', c);
      chip.title = prim ? 'Primary: sets Stage / Task and the Note List' : 'Click for actions';
      chip.innerHTML = (prim ? '<i class="material-symbols-outlined fill">star</i>' : '') + '<b>' + esc(c) + '</b>'
        + (p ? '<span class="t">' + esc(p.t) + '</span>' : '') + (prim ? '<span class="pri">PRIMARY</span>' : '');
      wrap.appendChild(chip);
    });
    wrap.setAttribute('data-primary', NOTE_PROJ[0] || '');
    // Note List 헤더 라벨 = Primary
    var np = document.getElementById('elnNoteListProj');
    if (np) np.textContent = NOTE_PROJ.length ? projBracket(NOTE_PROJ[0]) : 'No project linked';
    // Stage/Task = Primary의 스케줄. 프로젝트 없음·Tech Support(스케줄 없음)면 select 대신 안내문
    var msg = !NOTE_PROJ.length ? 'Link a project to pick a stage' : (projType(NOTE_PROJ[0]) === 'TS' ? 'No stage schedule for Tech Support' : '');
    var sel = document.getElementById('elnSchedSel'), hint = document.getElementById('elnSchedNoProj');
    if (sel) sel.style.display = msg ? 'none' : '';
    if (hint) { hint.textContent = msg; hint.style.display = msg ? '' : 'none'; }
    if (NOTE_PROJ.length) syncScheduleType(NOTE_PROJ[0]);   // Stage 체계 = Primary 유형(SN·CN·PT)
  }
  function setNoteProjects(codes) { NOTE_PROJ = (codes || []).slice(); renderProjects(); }   // 노트 전환·초기 로드용(로그 없음)
  // Primary가 바뀌면 Stage/Task는 새 Primary의 스케줄 기준 → "Not assigned"로 초기화하고 기록
  function resetSchedule() {
    var st = document.getElementById('elnSchedStage'), tk = document.getElementById('elnSchedTask'); if (!st || !tk) return;
    var so = st.options[st.selectedIndex], to = tk.options[tk.selectedIndex];
    var bs = so ? so.text : '', bt = to ? to.text : '';
    st.value = ''; fillSchedTasks('', null); schedReinit(st); schedReinit(tk);
    st._auditPrev = 'Not assigned'; tk._auditPrev = 'Not assigned';
    if (bs && bs !== 'Not assigned') projAudit('Field changed', { field: 'Stage / Task', before: bs + ' / ' + bt, after: 'Not assigned', detail: "Stage / Task reset. Pick from the new primary's schedule" });
  }
  function linkProject(c) {
    if (NOTE_PROJ.indexOf(c) >= 0) { ELN.toast('Project already linked.', 'warn'); return; }
    NOTE_PROJ.push(c);
    projAudit('Project linked', { detail: projText(c) + (NOTE_PROJ.length === 1 ? ' (Primary)' : '') });
    persistProj(); renderProjects();
    ELN.toast(c + ' linked' + (NOTE_PROJ.length === 1 ? ' as Primary.' : '.'), 'ok');
  }
  function unlinkProject(c) {
    var idx = NOTE_PROJ.indexOf(c); if (idx < 0) return;
    var before = NOTE_PROJ[0];
    NOTE_PROJ.splice(idx, 1);   // Primary를 떼면 남은 첫 프로젝트가 자동 승격(Primary는 항상 존재)
    projAudit('Project unlinked', { detail: projText(c) });
    var after = NOTE_PROJ[0] || '';
    if (before !== after) {
      if (after) projAudit('Primary project changed', { before: before, after: after, detail: 'Auto-promoted after unlinking the Primary' });
      resetSchedule();
    }
    persistProj(); renderProjects();
    ELN.toast(c + ' unlinked' + (before !== after && after ? '. ' + after + ' is now Primary.' : '.'), 'info');
  }
  function setPrimaryProject(c) {
    var idx = NOTE_PROJ.indexOf(c); if (idx <= 0) return;
    var before = NOTE_PROJ[0];
    NOTE_PROJ.splice(idx, 1); NOTE_PROJ.unshift(c);
    projAudit('Primary project changed', { before: before, after: c });
    resetSchedule();
    persistProj(); renderProjects();
    ELN.toast(c + ' is now Primary. Stage / Task reset.', 'ok');
  }
  // 칩 클릭 메뉴 — 잠금 중엔 Open만
  function openProjMenu(chip, code) {
    var frozen = projFrozen(), prim = (NOTE_PROJ[0] === code);
    var menu = document.createElement('div'); menu.className = 'elnRelMenu';
    function item(icon, label, fn) {
      var b = document.createElement('div'); b.className = 'elnRelMenuItem';
      b.innerHTML = '<i class="material-symbols-outlined">' + icon + '</i>' + label;
      b.addEventListener('click', function () { ref.close(); fn(); });
      menu.appendChild(b);
    }
    item('open_in_new', 'Open Project', function () { openProjectDetail(code); });
    if (!frozen) {
      if (!prim) item('star', 'Set as Primary', function () { setPrimaryProject(code); });
      item('link_off', 'Unlink', function () { unlinkProject(code); });
    }
    var ref = ELN.popover({ anchor: chip, content: menu, width: 220 });
  }
  // + Add project 픽커 — 이미 연결된 항목은 "Linked"로 표시하고 선택 불가
  // 프로젝트 추가 = MAPIS 공통 부품: hBtn 클릭 → 같은 자리에 aniInput, jQuery UI autocomplete(공통 .ui-autocomplete 스킨).
  //  운영 TechLib 'Associated Project #' 퀵서치와 같은 방식·같은 행 표기("CODE — title"). 실구현: source를 getRelProjectListAjax로
  function initProjSearch() {
    var add = document.getElementById('elnProjAdd'), wrap = document.getElementById('elnProjSrchWrap'), inp = document.getElementById('elnProjSrch');
    if (!add || !wrap || !inp || !(window.jQuery && $.fn.autocomplete)) return;
    function closeSrch() { inp.value = ''; wrap.style.display = 'none'; add.style.display = ''; try { $(inp).autocomplete('close'); } catch (e) {} }
    add.addEventListener('click', function (e) {
      e.preventDefault(); if (projFrozen()) return;
      add.style.display = 'none'; wrap.style.display = ''; inp.focus();
    });
    $(inp).autocomplete({
      minLength: 0, appendTo: 'body',
      source: function (req, res) {
        var q = (req.term || '').toLowerCase();
        res(MAPIS_PROJECTS.filter(function (p) { return NOTE_PROJ.indexOf(p.c) < 0 && (p.c + ' ' + p.t).toLowerCase().indexOf(q) >= 0; })
          .map(function (p) { return { label: '[' + p.c + '] ' + p.t, value: p.c }; }));
      },
      focus: function (e) { e.preventDefault(); },
      select: function (e, ui) { e.preventDefault(); linkProject(ui.item.value); closeSrch(); }
    }).on('focus', function () { $(this).autocomplete('search', this.value); });
    $(inp).data('ui-autocomplete')._renderItem = function (ul, item) { return $('<li>').append($('<div>').text(item.label)).appendTo(ul); };   // 제목은 text()로(HTML 연결 금지)
    inp.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSrch(); });
    inp.addEventListener('blur', function () { setTimeout(function () { if (document.activeElement !== inp) closeSrch(); }, 150); });
  }

  /* Platform / Pre-NPC — MAPIS 프로젝트 번호가 없는 일(요구 1번). 운영에 마스터 목록이 없어 유형만 고르고 이름은 입력(사용자 2026-10-16).
     이름 자동완성 = 다른 노트에서 이미 쓴 이름(실구현: 노트 테이블의 유형별 distinct 이름 + 사용 건수) → 같은 이름 재사용 */
  var PLATFORM_USED = {
    platform: [{ n: 'UV-Curable Adhesives', c: 6 }, { n: 'Silicone PSA', c: 4 }, { n: 'Clear Resin Systems', c: 2 }],
    prenpc: [{ n: 'Low-Haze OCR Study', c: 3 }, { n: 'Flexible OLED Encapsulant', c: 1 }]
  };
  function initPlatform() {
    var sel = document.getElementById('elnPlatform'), inp = document.getElementById('elnPlatformName');
    if (!sel || !inp) return;
    function syncName() {   // 유형 미지정이면 이름 칸 숨김(값은 비움)
      var none = !sel.value;
      inp.closest('.elnPlatName').style.display = none ? 'none' : '';
      if (!none) inp.placeholder = 'Name (e.g., ' + PLATFORM_USED[sel.value][0].n + ')';
      if (none && inp.value) {
        inp.value = '';
        setTimeout(function () { inp.dispatchEvent(new Event('change', { bubbles: true })); }, 0);   // 감사 기록 — 유형 변경 기록 다음 순서로
      }
    }
    sel.addEventListener('change', syncName);
    syncName();
    if (!(window.jQuery && $.fn.autocomplete)) return;
    $(inp).autocomplete({
      minLength: 0, appendTo: 'body',
      source: function (req, res) {
        if (inp.readOnly || inp.disabled) { res([]); return; }   // 결재 잠금·승인 view(readOnly)에선 추천 없음 — 값 변경 차단
        var q = (req.term || '').toLowerCase();
        res((PLATFORM_USED[sel.value] || []).filter(function (x) { return x.n.toLowerCase().indexOf(q) >= 0; })
          .map(function (x) { return { label: x.n, value: x.n, c: x.c }; }));
      },
      select: function (e, ui) { e.preventDefault(); if (inp.readOnly) return; inp.value = ui.item.value; inp.dispatchEvent(new Event('change', { bubbles: true })); }
    }).on('focus', function () { if (!this.readOnly) $(this).autocomplete('search', this.value); });
    $(inp).data('ui-autocomplete')._renderItem = function (ul, item) {   // 이름 + 사용 건수(text()로 — HTML 연결 금지)
      return $('<li>').append($('<div>').text(item.label).append($('<span class="elnPlatUsed">').text(' · used in ' + item.c + ' note' + (item.c > 1 ? 's' : '')))).appendTo(ul);
    };
  }
  document.addEventListener('DOMContentLoaded', initPlatform);

  // 프로젝트 상세 열기(조회). code 생략 시 Primary
  function openProjectDetail(code) {
    var val = document.getElementById('elnProjVal');
    var name = code || (val ? (val.getAttribute('data-primary') || '') : '');
    if (!name) { ELN.toast('No project linked to this note.', 'info'); return; }
    code = name;
    ELN.toast('Opening project ' + (code || name) + '…', 'info');
    window.open('apis_npdi_pop.html', 'elnProjectDetail', 'width=1480,height=900,scrollbars=yes,resizable=yes');
  }
  function initProjectMeta() {
    var val = document.getElementById('elnProjVal');
    if (!val) return;
    initProjSearch();
    val.addEventListener('click', function (e) { var ch = e.target.closest ? e.target.closest('.elnPjChip') : null; if (ch) openProjMenu(ch, ch.getAttribute('data-code')); });
    setNoteProjects(initialProjects());
  }
  document.addEventListener('DOMContentLoaded', initProjectMeta);

  /* ── Schedule 위치 — 이 노트가 작성된 과제 Detailed Schedule(apis_npdi_pop) 위치. 스테이지(L1) → 그 아래 태스크 선택 ── */
  // 프로젝트 유형별 스테이지·태스크 — 운영 공통코드 기준(snpi_stage/cnpi_stage/npt_stage, *_gantt_lv2).
  //  운영에 표준 Task가 없는 스테이지는 tasks:[] → Task 칸 "No standard tasks"(지어내지 않음). TS(Tech Support)는 스케줄 없음
  var PROJ_SCHEDULES = {
    SN: [   // Standard NPI
      { stage:'NPC',                tasks:['Basic Data & Concept Overview','DFV Rating','NPC Review'] },
      { stage:'NPI Go',             tasks:['Project Overview','Functional Deliverables','NPI Go Review'] },
      { stage:'Lab Formulation',    tasks:['Update Project Overview Section','Update Functional Deliverables','Lab Formulation Review'] },
      { stage:'Scale-Up',           tasks:['Update Project Overview Section','Update Functional Deliverables','Scale-Up Review'] },
      { stage:'Commercial Go',      tasks:['Update Project Overview Section','Update Functional Deliverables','Commercial Go Review'] },
      { stage:'Post Launch Review', tasks:['Performance Review','Stakeholder Review and Sign Off'] }
    ],
    CN: [   // Custom NPI
      { stage:'NPC',           tasks:[] },
      { stage:'Commercial Go', tasks:[] }
    ],
    PT: [   // NPT
      { stage:'Proposal',  tasks:[] },
      { stage:'NPT Go',    tasks:['Assign Project Leader','Team completes NPT GO documents','Initiate Approval Review','NPT GO Approval'] },
      { stage:'Close Out', tasks:['Process Dev and Scale Up','SAP workflows completed','Manufacturing Production Trials','Internal Qualification','Customer Validation','Team completes Close Out documents','Initiate Approval Review','Close Out Approval'] }
    ]
  };
  var PROJ_SCHEDULE = PROJ_SCHEDULES.SN;   // 노트 목록 스테이지 정렬 등 기존 참조용(SN 기준)
  var SCHED_TYPE = 'SN';                   // 현재 Stage select가 그리고 있는 유형(= Primary 프로젝트 코드 앞 2자리)
  var SCHED_CODE = null;                   // 현재 Task를 불러온 프로젝트(Primary)
  // 세부 Task는 프로젝트마다 다름 — 실구현은 그 프로젝트의 스케줄(간트) 테이블에서 조회(예: TS09_SNPI_SCHEDULE_GANTT의 stage별 lvl2).
  //  프로토타입: 데모 프로젝트별 임의 일정. 없는 프로젝트는 위 유형 템플릿(운영 *_gantt_lv2 기본값 = 새 프로젝트 간트 초기값)
  var PROJECT_GANTT = {
    'SN-26-0031': {   // RGBOLED Display Adhesive
      'Lab Formulation': ['Base polymer screening', 'Crosslinker ratio DOE', 'Lab Formulation Review'],
      'Scale-Up':        ['Update Project Overview Section', 'Pilot coater trial (5 m/min)', 'Viscosity window confirmation', 'Customer sample shipment', 'Scale-Up Review'],
      'Commercial Go':   ['Plant trial batch', 'Customer qualification', 'Commercial Go Review']
    },
    'PT-26-0021': {   // NPT — 공정 이관
      'NPT Go':    ['Assign Project Leader', 'Transfer package to Site B', 'NPT GO Approval'],
      'Close Out': ['Site B scale-up runs', 'SAP workflows completed', 'Internal Qualification', 'Close Out Approval']
    },
    'CN-26-0090': {   // Customer A OCR Program
      'NPC':           ['Customer spec review', 'Concept formulation', 'NPC Review'],
      'Commercial Go': ['Customer line trial', 'Commercial Go Review']
    }
  };
  var TYPE_SAMPLE_TASKS = {   // 운영 코드에 표준 Task가 없는 스테이지 — 새 프로젝트 간트에 흔히 쓰는 예시(프로토타입용)
    'CN|NPC': ['Customer requirement review', 'Concept formulation', 'NPC Review'],
    'CN|Commercial Go': ['Customer qualification support', 'Commercial Go Review'],
    'PT|Proposal': ['Proposal draft', 'Proposal review']
  };
  function schedTasksOf(code, stage) {
    var g = PROJECT_GANTT[code]; if (g && g[stage]) return g[stage];
    var st = (PROJ_SCHEDULES[SCHED_TYPE] || []).filter(function (s) { return s.stage === stage; })[0];
    return (st && st.tasks.length) ? st.tasks : (TYPE_SAMPLE_TASKS[SCHED_TYPE + '|' + stage] || []);
  }
  // 데모·리스트 데이터의 대문자 표기(SCALE-UP 등)를 운영 표기로 — 대소문자 무시 매칭
  function normStage(n) {
    if (!n) return n; var u = String(n).toUpperCase();
    for (var k in PROJ_SCHEDULES) { var hit = PROJ_SCHEDULES[k].filter(function (s) { return s.stage.toUpperCase() === u; })[0]; if (hit) return hit.stage; }
    return n;
  }
  function schedStageByName(n){ var u = String(n || '').toUpperCase(); return (PROJ_SCHEDULES[SCHED_TYPE] || []).filter(function (s){ return s.stage.toUpperCase() === u; })[0] || null; }
  // 선택 스테이지의 태스크로 Task select 채움
  function fillSchedTasks(stageName, selectedTask){
    var sel = document.getElementById('elnSchedTask'); if (!sel) return;
    var st = schedStageByName(stageName), tasks = st ? schedTasksOf(SCHED_CODE, st.stage) : [];   // 그 프로젝트의 간트에서
    sel.disabled = !st || !tasks.length;   // 스테이지 미지정이거나 Task가 없는 스테이지면 비활성
    sel.innerHTML = !st ? '<option value="" selected>Not assigned</option>'
      : (!tasks.length ? '<option value="" selected>No standard tasks</option>'
      : tasks.map(function (t){ return '<option value="' + esc(t) + '"' + (t === selectedTask ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join(''));
  }
  // Primary 프로젝트 유형에 맞춰 Stage 목록을 다시 그림(같은 유형이면 그대로). 유형이 바뀌면 선택은 Not assigned
  function syncScheduleType(code) {
    var t = String(code || '').slice(0, 2); if (!PROJ_SCHEDULES[t] || code === SCHED_CODE) return;
    var first = SCHED_CODE === null; SCHED_CODE = code;
    var stageSel = document.getElementById('elnSchedStage'), taskSel = document.getElementById('elnSchedTask'); if (!stageSel) return;
    if (t === SCHED_TYPE) {   // 같은 유형: Stage 목록 유지, Task만 이 프로젝트 간트로 다시(선택 Task가 있으면 유지)
      var so = stageSel.value, to = taskSel ? taskSel.value : null;
      fillSchedTasks(so, to); schedReinit(taskSel);
      if (first && taskSel) taskSel._auditPrev = (taskSel.options[taskSel.selectedIndex] || {}).text || '';
      return;
    }
    SCHED_TYPE = t;
    stageSel.innerHTML = '<option value="">Not assigned</option>' + PROJ_SCHEDULES[t].map(function (s){ return '<option value="' + esc(s.stage) + '">' + esc(s.stage) + '</option>'; }).join('');
    stageSel.value = ''; fillSchedTasks('', null); schedReinit(stageSel); schedReinit(taskSel);
    stageSel._auditPrev = 'Not assigned'; if (taskSel) taskSel._auditPrev = 'Not assigned';
  }
  // npdi와 동일하게 Materialize FormSelect로 렌더 (중복 wrapper 방지: destroy 먼저)
  function schedReinit(sel){ if (window.M && M.FormSelect && sel){ var i = M.FormSelect.getInstance(sel); if (i) i.destroy(); M.FormSelect.init(sel); } }
  function initScheduleMeta(){
    var stageSel = document.getElementById('elnSchedStage');
    var taskSel  = document.getElementById('elnSchedTask');
    if (!stageSel || !taskSel) return;   // 상세 페이지에서만
    // 기본값(목업): 이 노트는 SCALE-UP 스테이지 / Update Project Overview Section 태스크에 작성
    var defStage = 'Scale-Up', defTask = 'Update Project Overview Section';
    stageSel.innerHTML = '<option value="">Not assigned</option>' + PROJ_SCHEDULE.map(function (s){ return '<option value="' + esc(s.stage) + '"' + (s.stage === defStage ? ' selected' : '') + '>' + esc(s.stage) + '</option>'; }).join('');
    fillSchedTasks(defStage, defTask);
    // 감사 기준값 = 채워진 기본값(initProjectMeta 가 먼저 돌며 'Not assigned' 를 넣어 두므로 여기서 바로잡음)
    var dto = taskSel.options[taskSel.selectedIndex];
    stageSel._auditPrev = defStage; taskSel._auditPrev = dto ? dto.text : '';
    stageSel.addEventListener('change', function (){
      var oldO = taskSel.options[taskSel.selectedIndex], oldTask = oldO ? oldO.text : '';
      fillSchedTasks(this.value, null); schedReinit(taskSel);
      var o = taskSel.options[taskSel.selectedIndex], newTask = o ? o.text : '';
      taskSel._auditPrev = newTask;   // 프로그램적 Task 교체 → 기준값 갱신
      if (oldTask !== newTask) {
        // Stage 자체 기록은 위임 리스너(#card_basic, 버블)가 이 핸들러 뒤에 남김 → Stage → Task 순서가 되도록 한 틱 미룸
        setTimeout(function () {
          ELN.audit.log({ section: sectionNameOf(document.getElementById('card_basic')), action: 'Field changed', field: 'Task', before: oldTask, after: newTask, detail: 'Auto-updated by Stage change' });
        }, 0);
      }
    });
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
    // 표준 부품: 모달 + select2 단일 검색(Search note # or title). '없음(루트)'도 목록의 한 항목
    var wrap = document.createElement('div');
    var lbl = document.createElement('div'); lbl.className = 'elnS2Lbl'; lbl.textContent = 'Derived from';
    var sel = S2.make(false); wrap.appendChild(lbl); wrap.appendChild(sel);
    var data = [{ id: '__none', text: 'None (root note)', root: true, selected: !cur }];
    LINEAGE_NOTES.forEach(function (n) {
      if (blocked[n.code]) return;
      data.push({ id: n.code, text: '[' + n.code + '] ' + n.title, code: n.code, title: n.title, hay: n.title, sub: n.nb + ' · ' + n.date, selected: n.code === cur });
    });
    ELN.modal({ title: 'Derived from', icon: 'account_tree', size: 'sm', body: wrap, actions: [
      { label: 'Cancel', type: '' },
      { label: 'Set', type: 'hViva', icon: 'check', onClick: function () {
        var v = sel.value === '__none' ? '' : sel.value;
        if (v === cur) return;
        setParentMeta(v);
        if (v) ELN.toast('Parent set to ' + v + '.', 'ok'); else ELN.toast('Parent removed. Root note.', 'info');
      } }
    ] });
    S2.mount(sel, { data: data, placeholder: 'Search note # or title', minimumResultsForSearch: 0,
      templateResult: function (d) { return d.root ? d.text : S2.T.bracket(d); } });
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

  /* ── 좌측 목차 드래그 핸들 — 우측에 항상 옅게 보이는 6점 grip(drag_indicator). hover 시 진해지고 grab 커서.
     그 아이콘 = sortable handle. 평소에도 보여서 "드래그로 순서변경 가능"을 설명 없이 알림 ── */
  // grip hover 안내 레이어 — 공유 1개를 body에 fixed로(사이드바 overflow에 안 잘림). 미니 재정렬 애니메이션 + 라벨
  var navTip;
  function ensureNavTip() {
    if (navTip) return navTip;
    navTip = document.createElement('div');
    navTip.className = 'elnNavTip';
    navTip.innerHTML = '<div class="elnNavTipAnim"><b class="row a"></b><b class="row b"></b><b class="row c"></b></div><div class="elnNavTipTxt">Drag to reorder</div>';
    document.body.appendChild(navTip);
    return navTip;
  }
  function showNavTip(handle) {
    var t = ensureNavTip(), r = handle.getBoundingClientRect();
    t.style.left = (r.right + 10) + 'px';
    t.style.top = (r.top + r.height / 2) + 'px';
    t.classList.add('show');
  }
  function hideNavTip() { if (navTip) navTip.classList.remove('show'); }
  // 모듈 추가 직후 — hover 없이도 ~5초간 드래그 안내(grip 강제 노출+펄스 + 우측 레이어). "여기 잡고 순서 바꿀 수 있어요" 교육용
  function hintNavItem(li) {
    var h = li && li.querySelector('.elnNavHandle'); if (!h) return;
    li.classList.add('elnNavHint');   // CSS가 grip display:inline-flex + 펄스 강제(hover 불필요)
    showNavTip(h);                     // 우측 안내 레이어(드래그 애니메이션)
    clearTimeout(li._navHintT);
    li._navHintT = setTimeout(function () { li.classList.remove('elnNavHint'); hideNavTip(); }, 5000);
  }

  function setupNavItem(li) {
    var tgt = li && li.getAttribute('data-target');
    if (!li || tgt === 'card_basic' || tgt === 'card_approval' || tgt === 'card_audit') return; // Overview·Approval·Audit 고정 → 핸들 없음
    if (li.querySelector('.elnNavHandle')) return;                       // 이미 처리됨
    // 좌측 아이콘·레이블은 건드리지 않고, 우측에 별도 드래그 핸들(absolute)을 띄움 → 레이블 레이아웃 영향 없음
    var h = document.createElement('i');
    h.className = 'material-symbols-outlined elnNavHandle';
    h.textContent = 'drag_indicator';
    li.appendChild(h);
    // grip에 직접 hover → 우측 안내 레이어(드래그 애니메이션). 드래그 시작/이탈 시 숨김
    h.addEventListener('mouseenter', function () { showNavTip(h); });
    h.addEventListener('mouseleave', hideNavTip);
    h.addEventListener('mousedown', hideNavTip);
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
    var orderBefore = '';   // 드래그 시작 시 카드 순서(감사 로그: 실제 변경 여부 판단)
    if (!$article.length || !$menu.length) return; // 상세 화면에서만

    function pinBasicFirst(ids) {
      var i = ids.indexOf('card_basic');
      if (i > 0) { ids.splice(i, 1); ids.unshift('card_basic'); }
      var j = ids.indexOf('card_approval');
      if (j >= 0 && j < ids.length - 1) { ids.splice(j, 1); ids.push('card_approval'); }   // Approval 목차 최하단 고정
      var k = ids.indexOf('card_audit');
      if (k >= 0) { ids.splice(k, 1); ids.push('card_audit'); }   // Audit Trail은 Approval 다음 맨 끝
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
        if (id === 'card_approval' || id === 'card_audit') return;   // 결재·Audit 카드는 최하단 고정 — 이동 안 함
        var card = document.getElementById(id);
        if (card) article.insertBefore(card, end);
      });
    }

    // 좌측 목차: Overview 항목 제외. 옮기면 카드가 따라옴.
    $menu.sortable({
      items: '> .menu-item:not([data-target="card_basic"]):not([data-target="card_approval"]):not([data-target="card_audit"])',
      axis: "y",
      handle: '.elnNavHandle',        // 우측 별도 핸들(좌측 아이콘·레이블 불변)
      placeholder: 'elnSortPhMenu',
      revert: 200,
      forcePlaceholderSize: true,
      tolerance: 'pointer',
      distance: 5,
      opacity: 0.9,
      start: function () { orderBefore = $article.children('.cardBox').map(function () { return this.id; }).get().join('|'); },
      update: function (e, ui) {
        // 시스템 항목 재고정 — Basic은 항상 맨 위, Approval은 항상 맨 아래(아래로 드롭돼도 되돌림)
        var $basic = $menu.children('.menu-item[data-target="card_basic"]');
        if ($basic.length) $menu.prepend($basic);
        var $appr = $menu.children('.menu-item[data-target="card_approval"]');
        if ($appr.length) $menu.append($appr);
        var $audit = $menu.children('.menu-item[data-target="card_audit"]');
        if ($audit.length) $menu.append($audit);   // Audit은 Approval 다음 맨 끝
        syncCardsToMenu();
        if (typeof refreshDividers === 'function') refreshDividers();
        ELN.toast('Module order updated.', 'ok');
        // 감사 로그 — 드래그 1회당 1건. 재고정 후 순서가 실제로 바뀐 경우만
        var movedId = ui && ui.item ? ui.item.attr('data-target') : null, movedCard = movedId ? document.getElementById(movedId) : null;
        if (movedCard && orderBefore !== $article.children('.cardBox').map(function () { return this.id; }).get().join('|')) {
          var nm = sectionNameOf(movedCard), sibs = $article.children('.cardBox').filter(function () { return this.style.display !== 'none'; }).get();
          var mi = sibs.indexOf(movedCard), nxt = sibs[mi + 1], prv = sibs[mi - 1];
          var det = (nxt && nxt.id !== 'card_approval' && nxt.id !== 'card_audit') ? nm + ' moved above ' + sectionNameOf(nxt)
            : (prv ? nm + ' moved below ' + sectionNameOf(prv) : '');
          auditMod(movedCard, 'Sections reordered', { detail: det });
        }
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

  /* ── 스크롤 스파이 — 클릭 외에도 스크롤 위치에 따라 좌측 목차 active 자동 갱신 ──
     window 스크롤(헤더·사이드바 고정). 카드는 scroll-margin-top:72px로 헤더 아래 안착 → 트리거 라인을 그 바로 아래에 둠 */
  function initScrollSpy() {
    var menu = document.querySelector('.leftAside .menuUl');
    var article = document.getElementById('tab_ov');
    if (!menu || !article) return;
    var LINE = 90;   // 뷰포트 상단에서 90px(고정 헤더 + scroll-margin 바로 아래) 지점을 지난 마지막 카드 = 현재
    function update() {
      var cards = article.querySelectorAll('.cardBox');
      if (!cards.length) return;
      var curId = cards[0].id;
      for (var i = 0; i < cards.length; i++) {
        if (cards[i].getBoundingClientRect().top - LINE <= 0) curId = cards[i].id;   // 라인 위로 올라간 카드들 중 가장 아래
        else break;                                                                   // DOM 순서 = 위→아래라 라인 아래 첫 카드에서 중단
      }
      var li = menu.querySelector('.menu-item[data-target="' + curId + '"]');
      if (!li || li.classList.contains('active')) return;
      menu.querySelectorAll('.menu-item').forEach(function (m) { m.classList.remove('active'); });
      li.classList.add('active');
    }
    var ticking = false;
    function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(function () { update(); ticking = false; }); }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();   // 초기 1회
  }
  document.addEventListener('DOMContentLoaded', initScrollSpy);

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
    rm.addEventListener('click', function (e) { e.preventDefault(); if (li.closest('.elnLocked')) return; li.remove(); });   // 잠긴 섹션은 no-op
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
      var fcard = list.closest('.cardBox');
      Array.prototype.forEach.call(files, function (f) { addFileItem(list, f.name, f.size); auditMod(fcard, 'File attached', { detail: f.name }); });
      ELN.toast(files.length + ' file' + (files.length > 1 ? 's' : '') + ' attached.', 'ok');
    }
    // 삭제 × — 캡처 단계에서 먼저 기록(항목이 제거되기 전). 잠긴 섹션은 삭제 자체가 no-op이므로 기록하지 않음
    list.addEventListener('click', function (e) {
      var x = e.target.closest && e.target.closest('.x'), li = x && x.closest('li');
      if (!li || li.closest('.elnLocked')) return;
      var nm = li.querySelector('.nm'), isLink = li.classList.contains('elnLinkItem');
      auditMod(li.closest('.cardBox'), isLink ? 'Link removed' : 'File removed', { detail: nm ? nm.textContent : '' });
    }, true);
    if (input) input.addEventListener('change', function () { addFiles(input.files); input.value = ''; });
    drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('drag'); });
    drop.addEventListener('dragleave', function () { drop.classList.remove('drag'); });
    drop.addEventListener('drop', function (e) { e.preventDefault(); drop.classList.remove('drag'); addFiles(e.dataTransfer && e.dataTransfer.files); });
  }

  // Related Items 모듈 — Material/Note/URL 혼합 링크(프로젝트는 Basic Data의 Associated Project). scope = 모듈 본문
  function wireRelatedModule(scope) {
    var list = scope.querySelector('.elnRelList');
    var row = scope.querySelector('.elnRelAdd');
    if (!list || !row) return;
    var TYPE_ICON = { Material: 'science', Note: 'description', URL: 'link' };
    // 타입별 후보 풀(프로토타입 목업) — Note는 기존 데이터 재사용. select2 data 항목: {id, text, code, title, sub}
    function poolFor(label) {
      var mk = function (code, title, sub) { return { id: code, text: '[' + code + '] ' + title, code: code, title: title, sub: sub, hay: title }; };
      if (label === 'Material') return [mk('RM-0421', 'UV Photoinitiator', 'Initiator'), mk('RM-0532', 'Acrylic Monomer', 'Monomer'), mk('RM-0210', 'Silica Filler (12 nm)', 'Filler'),
        mk('RM-0388', 'Silane Coupling Agent', 'Additive'), mk('RM-0145', 'Defoamer', 'Additive')];
      if (label === 'Note') return LINEAGE_NOTES.map(function (n) { return mk(n.code, n.title, n.nb + ' · ' + n.date); });
      return [];
    }
    function addRow(label, text) {
      var li = document.createElement('li'); li.className = 'elnRelItem';
      li.innerHTML = '<i class="material-symbols-outlined">' + TYPE_ICON[label] + '</i><span class="elnRelType">' + label + '</span>'
        + '<a href="javascript:;" class="elnRelLink">' + esc(text) + '</a><i class="material-symbols-outlined elnRelDel" title="Remove">close</i>';
      li.querySelector('.elnRelDel').addEventListener('click', function () { li.remove(); });
      list.appendChild(li);
      auditMod(list.closest('.cardBox'), 'Link added', { detail: label + ': ' + text });
    }
    // 삭제 × (샘플 행·@참조 행 포함) — 캡처 단계에서 항목 제거 전에 기록
    list.addEventListener('click', function (e) {
      var d = e.target.closest && e.target.closest('.elnRelDel'), li = d && d.closest('.elnRelItem');
      if (!li || li.closest('.elnLocked') || document.body.classList.contains('elnApproved')) return;
      var ty = li.querySelector('.elnRelType'), lk = li.querySelector('.elnRelLink');
      auditMod(li.closest('.cardBox'), 'Link removed', { detail: (ty ? ty.textContent + ': ' : '') + (lk ? lk.textContent : '') });
    }, true);
    list.querySelectorAll('.elnRelDel').forEach(function (d) {                 // 샘플 행 삭제 배선
      d.addEventListener('click', function () { d.closest('.elnRelItem').remove(); });
    });
    // 인라인 추가 줄: [Type select2(검색창 없음)] [Material/Note = select2 검색 | URL = aniInput] [Add hBtn]
    var typeSel = row.querySelector('.elnRelAddType select'), valBox = row.querySelector('.elnRelAddVal'), goBtn = row.querySelector('.elnRelAddGo');
    var pickSel = null, urlInp = null;
    function curType() { return typeSel.value || 'Material'; }
    function buildValue() {   // 타입에 맞는 입력부 재구성(이전 select2 정리)
      if (pickSel && window.jQuery && jQuery(pickSel).data('select2')) { try { jQuery(pickSel).select2('destroy'); } catch (e) {} }
      valBox.innerHTML = ''; pickSel = null; urlInp = null;
      var label = curType();
      if (label === 'URL') {
        var ani = document.createElement('div'); ani.className = 'aniInput';
        urlInp = document.createElement('input'); urlInp.type = 'text'; urlInp.className = 'browser-default'; urlInp.placeholder = 'Paste a URL';
        var fb = document.createElement('span'); fb.className = 'focus-border';
        ani.appendChild(urlInp); ani.appendChild(fb); valBox.appendChild(ani);
        urlInp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); goAdd(); } });
      } else {
        pickSel = S2.make(false); valBox.appendChild(pickSel);
        S2.mount(pickSel, { data: poolFor(label), placeholder: 'Search ' + label.toLowerCase() + ' # or ' + (label === 'Note' ? 'title' : 'name'),
          minimumResultsForSearch: 0, templateResult: S2.T.bracket });
      }
    }
    function goAdd() {
      var label = curType();
      if (row.closest('.elnLocked') || document.body.classList.contains('elnApproved')) return;   // 잠금 중엔 무동작(CSS 도 숨김)
      if (label === 'URL') {
        var u = normalizeUrl(urlInp && urlInp.value); if (!u) { ELN.toast('Enter a URL first.', 'warn'); return; }
        addRow('URL', u); urlInp.value = ''; ELN.toast('Link added.', 'ok');
      } else {
        var v = pickSel && pickSel.value; if (!v) { ELN.toast('Select a ' + label.toLowerCase() + ' first.', 'warn'); return; }
        var d = poolFor(label).filter(function (p) { return p.id === v; })[0];
        addRow(label, d ? d.text : v); jQuery(pickSel).val(null).trigger('change'); ELN.toast(label + ' linked.', 'ok');
      }
    }
    goBtn.addEventListener('click', goAdd);
    (function init() {   // 모듈이 아직 DOM 에 안 붙었으면(생성 직후) 붙은 뒤 초기화
      if (!scope.isConnected) { setTimeout(init, 30); return; }
      S2.mount(typeSel, { minimumResultsForSearch: Infinity });
      jQuery(typeSel).on('change', buildValue);
      buildValue();
    })();
    if (ELN.noteRef) ELN.noteRef.fillRelated(list);   // 에디터에 이미 있는 @노트 참조를 새 Related 모듈에 반영
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
    var dtCard = function () { return box.closest('.cardBox'); };
    function dtRowLabel(tr) { var t = ((tr.children[0] && tr.children[0].textContent) || '').trim(); return t || 'Row ' + (Array.prototype.indexOf.call(tr.parentNode.children, tr) + 1); }
    function dtColLabel(th) { var t = (th.textContent || '').trim(); return t || 'Series ' + th.cellIndex; }
    box.querySelectorAll('.elnDataBtn').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-act');
        if (a === 'addRow') { addRow(); auditMod(dtCard(), 'Row added', { detail: 'Row ' + table.querySelectorAll('tbody tr').length }); }
        else if (a === 'addCol') {
          addCol();
          var hs = table.querySelector('thead tr').children;
          auditMod(dtCard(), curViz === 'table' ? 'Column added' : 'Series added', { detail: (hs[hs.length - 1].textContent || '').trim() });
        }
        refresh();
      });
    });
    // 행/열 삭제 — 헤더 셀 안 우측에 hover 시 ×(운영 btn_deleteColumn·action-col 패턴). 시리즈 헤더(th) = 열 삭제, 행 머리(첫 칸) = 행 삭제.
    //  셀 안에 넣으면 셀 텍스트(차트 데이터)에 섞이므로 래퍼 위에 떠 있는 버튼 1개씩을 대상 셀 위치로 옮겨 씀. 최소 1행·1시리즈 유지
    var dtWrap = box.querySelector('.elnDataTableWrap') || table.parentNode;
    dtWrap.classList.add('elnDtDelHost');
    function mkDel(title) {
      var a = document.createElement('a'); a.href = 'javascript:;'; a.className = 'elnDtDel'; a.title = title;
      a.innerHTML = '<i class="material-symbols-outlined">close</i>'; a.style.display = 'none'; dtWrap.appendChild(a); return a;
    }
    var colDel = mkDel('Delete this series'), rowDel = mkDel('Delete this row'), colTgt = null, rowTgt = null;
    function dtFrozen() { return !!box.closest('.elnLocked') || document.body.classList.contains('elnApproved'); }
    function placeDel(btn, cell) {
      var wr = dtWrap.getBoundingClientRect(), r = cell.getBoundingClientRect();
      btn.style.display = '';
      btn.style.top = (r.top - wr.top + dtWrap.scrollTop + (r.height - 20) / 2) + 'px';
      btn.style.left = (r.right - wr.left + dtWrap.scrollLeft - 26) + 'px';
    }
    function hideDel() { colDel.style.display = 'none'; rowDel.style.display = 'none'; }
    table.addEventListener('mouseover', function (e) {
      if (dtFrozen()) { hideDel(); return; }
      var th = e.target.closest('thead th'), tr = e.target.closest('tbody tr');
      var acb = box.querySelector('.elnDataTableTools [data-act="addCol"]');   // 시리즈 개념이 없는 뷰(pie 등)에선 열 삭제도 숨김
      if (th && th.cellIndex >= 1 && colCount() > 2 && !(acb && acb.style.display === 'none')) { colTgt = th; placeDel(colDel, th); } else if (!th) colDel.style.display = 'none';
      if (tr && table.querySelectorAll('tbody tr').length > 1) { rowTgt = tr; placeDel(rowDel, tr.children[0]); } else if (!tr) rowDel.style.display = 'none';
    });
    dtWrap.addEventListener('mouseleave', hideDel);
    colDel.addEventListener('click', function () {
      if (!colTgt || !table.contains(colTgt)) return;
      var ci = colTgt.cellIndex;
      auditMod(dtCard(), curViz === 'table' ? 'Column deleted' : 'Series deleted', { detail: dtColLabel(colTgt) });
      table.querySelectorAll('tr').forEach(function (tr) { if (tr.children[ci]) tr.children[ci].remove(); });
      colTgt = null; hideDel(); refresh();
    });
    rowDel.addEventListener('click', function () {
      if (!rowTgt || !table.contains(rowTgt)) return;
      auditMod(dtCard(), 'Row deleted', { detail: dtRowLabel(rowTgt) });
      rowTgt.remove(); rowTgt = null; hideDel(); refresh();
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
      var ae = document.activeElement; if (ae && table.contains(ae)) ae._auditPrev = ae.textContent;   // 붙여넣기는 'Data pasted' 1건으로 — 포커스 셀이 'Cell edited'로 또 기록되지 않게
      auditMod(dtCard(), 'Data pasted', { detail: grid.length + ' row' + (grid.length > 1 ? 's' : '') + ' from Excel' });
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
      // ± Series/Column — 시리즈형·Table에서만 의미. 추가·삭제 버튼 라벨을 같이 맞춤
      box.querySelectorAll('.elnDataTableTools [data-act="addCol"]').forEach(function (colBtn) {
        colBtn.style.display = (curViz === 'table' || isSeriesType(curViz)) ? '' : 'none';
        var colLbl = colBtn.querySelector('.label');
        if (colLbl) colLbl.textContent = (curViz === 'table') ? 'Column' : 'Series';
      });
      applyHint();
      adaptTable();
      if (chart) renderChart();
    }
    // 차트 높이 — 전용 그립을 위아래로 드래그(min~max 클램프). ResizeObserver가 새 높이에 맞춰 refit
    if (grip) grip.addEventListener('mousedown', function (e) {
      e.preventDefault();
      if (grip.closest('.elnLocked')) return;
      var startY = e.clientY, startH = chartBox.offsetHeight;
      function mv(ev) { chartBox.style.height = Math.max(MINH, Math.min(MAXH, startH + (ev.clientY - startY))) + 'px'; }
      function up() { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); }
      document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up);
    });
    if (window.ResizeObserver) {   // 폭/높이 변화 → Highcharts 리플로우(드래그 높이·패널 리사이즈 모두 대응)
      new ResizeObserver(function () { if (hc && isChart(curViz)) { try { hc.reflow(); } catch (e) {} } }).observe(chartBox);
    }
    pickBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.closest('.elnLocked')) return;
        var nv = b.getAttribute('data-viz'), prevB = box.querySelector('.elnVizOpt.on');
        if (nv !== curViz) {
          var lab = function (x) { var s = x && x.querySelector('span'); return s ? (s.textContent || '').trim() : ''; };
          auditMod(dtCard(), 'View changed', { field: 'Visualize as', before: lab(prevB) || undefined, after: lab(b) });
        }
        setViz(nv);
      });
    });
    // 셀 편집: 포커스 시 값 기록 → 포커스 아웃 때 바뀌었으면 'Cell edited' 1건
    table.addEventListener('focusin', function (e) { var c = e.target.closest && e.target.closest('td, th'); if (c) c._auditPrev = c.textContent; });
    table.addEventListener('focusout', function (e) {
      var c = e.target.closest && e.target.closest('td, th'); if (!c || c._auditPrev == null) return;
      var before = c._auditPrev, after = c.textContent; c._auditPrev = null;
      if (before === after || !table.contains(c)) return;
      var field, tr = c.parentNode, hd = table.querySelector('thead tr').children[c.cellIndex];
      if (c.tagName === 'TH') field = c.cellIndex === 0 ? 'Header' : 'Series name';
      else field = c.cellIndex === 0 ? 'Row label' : dtRowLabel(tr) + ' / ' + (hd ? dtColLabel(hd) : 'Series ' + c.cellIndex);
      auditMod(dtCard(), 'Cell edited', { field: field, before: before, after: after });
    });
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
        placeholder: 'Write rich text: formatting, tables, images…',
        height: 200,
        hint: ELN.noteHint ? ELN.noteHint(el) : [],   // @ 로 다른 노트 참조(자동완성)
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

  /* ── 에디터 감사 로그 — Summernote(.note-editable)·폴백 에디터 공용(Conclusion 포함). 위임 리스너.
     포커스 시 HTML 기록 → 포커스 아웃 때 바뀌었으면 편집 세션당 1건('Content edited', 이미지가 늘었으면 'Image inserted'). ── */
  (function () {
    var SEL = '.note-editable, .elnSummernoteFallback';
    function edEl(e) { return e.target && e.target.closest ? e.target.closest(SEL) : null; }
    function plain(html) { var d = document.createElement('div'); d.innerHTML = html; return (d.textContent || '').replace(/\s+/g, ' ').trim(); }
    function imgs(html) { return (html.match(/<img\b/gi) || []).length; }
    document.addEventListener('focusin', function (e) { var el = edEl(e); if (el && el._auditHtml == null) el._auditHtml = el.innerHTML; });
    document.addEventListener('focusout', function (e) {
      var el = edEl(e); if (!el || el._auditHtml == null) return;
      var before = el._auditHtml, after = el.innerHTML; el._auditHtml = null;
      if (before === after || !document.body.contains(el)) return;
      var card = el.closest('.cardBox'); if (!card) return;
      var bt = plain(before), at = plain(after), p = 0, s = 0, ml = Math.min(bt.length, at.length);
      while (p < ml && bt.charAt(p) === at.charAt(p)) p++;
      while (s < ml - p && bt.charAt(bt.length - 1 - s) === at.charAt(at.length - 1 - s)) s++;
      var rem = bt.length - p - s, add = at.length - p - s;
      var ib = imgs(before), ia = imgs(after);
      if (ia > ib) auditMod(card, 'Image inserted', { detail: (ia - ib) + ' image' + (ia - ib > 1 ? 's' : '') });
      if (add || rem) {
        var snip = at.slice(p, at.length - s).trim();
        auditMod(card, 'Content edited', { detail: 'Text updated (+' + add + ' / −' + rem + ' chars)' + (snip ? ': “' + (snip.length > 40 ? snip.slice(0, 40) + '…' : snip) + '”' : '') });
      } else if (ia === ib) {
        auditMod(card, 'Content edited', { detail: 'Formatting updated' });
      }
    });
  })();

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
    var del = li.querySelector('.elnChemDel'); if (del) del.addEventListener('click', function () {
      auditMod(li.closest('.cardBox'), 'Structure removed', { detail: li._chemData ? li._chemData.name + (li._chemData.formula ? ' (' + li._chemData.formula + ')' : '') : '' });
      li.remove(); if (box) syncChemEmpty(box);
    });
  }
  // 신규 추가(append) 또는 기존 <li> 제자리 교체
  function addOrUpdateChem(list, existingLi, data) {
    var li = existingLi || document.createElement('li');
    var prevName = existingLi && existingLi._chemData ? existingLi._chemData.name : '';
    if (!existingLi) list.appendChild(li);
    setChemItem(li, data);
    var chemDetail = data.name + (data.formula ? ' (' + data.formula + ')' : '');
    if (existingLi) auditMod(list.closest('.cardBox'), 'Structure updated', { before: prevName, after: data.name, detail: data.formula || undefined });
    else auditMod(list.closest('.cardBox'), 'Structure added', { detail: chemDetail });
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
      { k: 'single', glyph: '-', t: 'Single bond' },
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
      + '<div class="elnChemHintBar"><i class="material-symbols-outlined">draw</i>Embedded ChemStudio: pick a tool, then sketch on the canvas.</div>'
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
    // 표준 부품: 모달 + select2 단일 검색(썸네일 + 이름 + 분자식 — 운영 물질 조회 스타일)
    var wrap = document.createElement('div');
    var lbl = document.createElement('div'); lbl.className = 'elnS2Lbl'; lbl.textContent = existingLi ? 'Replace with' : 'Structure';
    var sel = S2.make(false); wrap.appendChild(lbl); wrap.appendChild(sel);
    var thumb = chemMoleculeSvg(false);
    var data = CHEM_LIBRARY.map(function (c) {
      return { id: c.cas, text: c.name + ' (' + c.formula + ')', title: c.name, hay: c.cas + ' ' + c.formula, thumb: thumb, subHtml: chemFormulaHtml(c.formula) + ' · CAS ' + esc(c.cas) };
    });
    ELN.modal({ title: existingLi ? 'Change Structure' : 'Add Existing Structure', icon: 'library_add', size: 'sm', body: wrap, actions: [
      { label: 'Cancel', type: '' },
      { label: existingLi ? 'Change' : 'Add', type: 'hViva', icon: existingLi ? 'swap_horiz' : 'add', onClick: function () {
        var c = CHEM_LIBRARY.filter(function (x) { return x.cas === sel.value; })[0];
        if (!c) { ELN.toast('Select a structure first.', 'warn'); return true; }
        addOrUpdateChem(list, existingLi, { name: c.name, cas: c.cas, formula: c.formula });
        ELN.toast(existingLi ? 'Structure changed.' : 'Structure added from ChemStudio.', 'ok');
      } }
    ] });
    S2.mount(sel, { data: data, placeholder: 'Search structure name or formula', minimumResultsForSearch: 0, templateResult: S2.T.chem });
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

  /* ── 공동편집자(Co-editors) + 공유(Share) — 동시 편집은 다루지 않음(번갈아 편집, 저장은 노트 전체): 섹션별 마지막 편집자 표시 + 감사 기록 ──
     상태는 모두 프로토타입 메모리(CE). 실구현에서는 서버의 노트 참여자/공유 레코드로 대체. */
  var CE_DEMO = 'NT-2605-00142';
  var CE_SEED_EDITORS = ['David Lee', 'Min-ji Park'];   // 공동편집자 ≠ 서명자(Aishwarya=Witness)
  // 사용자 ID — 운영 형식 '이름.성' 소문자(예: Kim, Jinpyeong → jinpyeong.kim). 하이픈은 제거(Min-ji Park → minji.park)
  function userId(name) {
    var p = String(name || '').replace(/-/g, '').trim().toLowerCase().split(/\s+/);
    return p.length > 1 ? p[0] + '.' + p[p.length - 1] : p[0];
  }
  var CE_PEOPLE = SO_PEOPLE.concat(['Tom Reyes', 'Emma Wallace']);   // Co-Signer 후보 + 공정기술 동료(공유 시나리오)
  // people: 작성자 외 접근자 단일 목록 [{name, access(=Function):'Co-editor'|'Viewer', scope:'all'(Co-editor 는 항상 all)|[섹션명](Viewer 만), reason, ts, by}]
  //   Co-editor 의 편집이 'Last edited by' 를 구동. 실구현: 노트 참여자/공유 레코드 통합 테이블
  var CE_ACCESS = ['Co-editor', 'Viewer'];   // UI 라벨 = Function (Commenter 폐지 → Viewer 로 이관)
  var CE = { people: [] };

  function cePad(n) { return (n < 10 ? '0' : '') + n; }
  function ceHhmm() { var d = new Date(); return cePad(d.getHours()) + ':' + cePad(d.getMinutes()); }
  function ceQueryCode() {   // ?tmpl=(New Note)은 새 노트 → 데모 시드(공동편집자·공유) 미적용
    try { var p = new URLSearchParams(location.search); return p.get('code') || (p.get('tmpl') ? 'NEW' : CE_DEMO); } catch (e) { return CE_DEMO; }
  }
  function ceCardOf(id) { return id ? document.getElementById(id) : null; }
  function ceFrozen(card) { return card.classList.contains('elnLocked') || document.body.classList.contains('elnApproved'); }   // 결재 잠금·승인 view가 우선

  /* 헤더 Share 버튼 = 공유 아이콘 + 인원 수 배지(운영 공통 .modalTabBadge, 작성자 제외, 0이면 :empty 로 숨김). 사진·아바타 없음(개인정보). 상세는 Share & Access 모달 */
  function ceRenderShareBtn() {
    var cnt = document.querySelector('#elnShareBtn .elnShareCnt'); if (!cnt) return;
    cnt.textContent = CE.people.length ? String(CE.people.length) : '';
  }
  function ceFrozenNote() { return document.body.classList.contains('elnApproved'); }
  function ceScopeText(p) { return p.scope === 'all' ? 'Entire note' : p.scope.join(', '); }
  function ceScopeSection(p) { return p.scope === 'all' ? 'Basic Data' : p.scope.join(', '); }   // 감사로그 섹션명: 노트 전체 = Basic Data
  function ceSeedPeople(demo) {
    if (!demo) return [];
    var list = CE_SEED_EDITORS.map(function (n) { return { name: n, access: 'Co-editor', scope: 'all', reason: 'Co-authoring', ts: '2026-10-08 10:12', by: ELN.currentUser }; });
    list.push({ name: 'Jim Quan', access: 'Viewer', scope: 'all', reason: 'Group leader review', ts: '2026-10-09 16:30', by: ELN.currentUser });
    list.push({ name: 'Sarah Chen', access: 'Viewer', scope: ['Formulation', 'Data Visualization'], reason: 'Analytical data cross-check', ts: '2026-10-10 14:05', by: ELN.currentUser });   // 섹션 한정 공유 예시(데모 노트의 실제 섹션명)
    list.forEach(function (p) { if (p.access === 'Commenter') p.access = 'Viewer'; if (p.access === 'Co-editor') p.scope = 'all'; });   // 이관: Commenter→Viewer, Co-editor 는 항상 Entire note
    return list;
  }
  function ceFindPerson(name) { return CE.people.filter(function (p) { return p.name === name; })[0] || null; }
  function ceChangeAccess(name, to, suffix) {   // suffix: 감사로그 꼬리(사유·정보보호 확인) — Share & Access 저장에서 전달
    var p = ceFindPerson(name); if (!p || p.access === to) return false;
    if (to === 'Co-editor' && ceFrozenNote()) { soWarn('Not allowed', 'This note is approved and its content is locked, so co-editors cannot be added. Choose Viewer.'); return false; }
    var from = p.access;
    p.access = to;
    if (to === 'Co-editor') p.scope = 'all';
    ELN.audit.log({ section: ceScopeSection(p), action: 'Access changed', detail: name + ': ' + from + ' → ' + to + (suffix || '') });
    ceRenderShareBtn();
    ELN.toast(name + ' is now ' + to + '.', 'info');
    return true;
  }
  function ceRemoveAccess(name) {
    var i = CE.people.map(function (p) { return p.name; }).indexOf(name); if (i < 0) return;
    var p = CE.people[i];
    CE.people.splice(i, 1);
    ELN.audit.log({ section: ceScopeSection(p), action: 'Access removed', detail: name + ' · ' + p.access + ' · ' + ceScopeText(p) });
    ceRenderShareBtn();
    ELN.toast('Access removed for ' + name + '.', 'info');
  }

  /* 섹션 카드 헤더: 'Last edited by NAME · HH:MM' */
  function ceLabelEl(card) {
    var tit = card.querySelector('.cardTit2'); if (!tit) return null;
    var el = tit.querySelector('.elnLastEdit');
    if (!el) {
      el = document.createElement('span'); el.className = 'elnLastEdit empty';
      var w = tit.querySelector('.elnModTitleWrap');
      if (w) tit.insertBefore(el, w.nextSibling); else tit.appendChild(el);
    }
    return el;
  }
  function ceRenderLabel(card) {
    var el = ceLabelEl(card); if (!el) return;
    var u = card.getAttribute('data-ce-user');
    if (u) {
      el.className = 'elnLastEdit';
      el.innerHTML = '<i class="material-symbols-outlined">edit</i><span>Last edited by <b>' + esc(u) + '</b> · ' + esc(card.getAttribute('data-ce-time') || '') + '</span>';
    } else { el.className = 'elnLastEdit empty'; el.innerHTML = ''; }
  }
  function ceSetEdited(card, user, time) {
    if (user) { card.setAttribute('data-ce-user', user); card.setAttribute('data-ce-time', time); }
    else { card.removeAttribute('data-ce-user'); card.removeAttribute('data-ce-time'); }
    ceRenderLabel(card);
  }
  // 현재 사용자가 섹션을 편집/추가/이름 변경 → 라벨 갱신 (시스템 카드·잠긴 카드·Errata 제외)
  function ceTouch(card) {
    if (!card || card.id === 'card_approval' || card.id === 'card_audit') return;
    if (ceFrozen(card)) return;
    ceSetEdited(card, ELN.currentUser, ceHhmm());
  }
  function ceOnEdit(e) {
    var t = e.target; if (!t || !t.closest || t.closest('.elnErrataWrap')) return;
    var card = t.closest('#tab_ov > .cardBox'); if (card) ceTouch(card);
  }
  document.addEventListener('input', ceOnEdit, true);
  document.addEventListener('change', ceOnEdit, true);

  /* Share & Access 모달 — 목록(표 + 우측 상단 Add people) 위에 Add/Edit 중첩 모달.
     모달은 body에 붙으므로 body.elnApproved 읽기전용 규칙(#tab_ov 범위)의 영향을 받지 않음: 승인/잠금 노트에서도 Viewer 추가 가능(Co-editor 는 막음) */
  function ceShareModal() {
    var view = document.createElement('div');
    var m = ELN.modal({ title: 'Share & Access', icon: 'group', size: 'lg', body: view, actions: [{ label: 'Close', type: '' }] });   // lg: Add/Edit 중첩 모달(md)보다 넓게 → 뒤 목록 가장자리가 보여 '위에 뜬' 것이 드러남
    function nameCell(name) { return '<b>' + esc(name) + '</b> <span class="elnAccId">(' + esc(userId(name)) + ')</span>'; }
    function teardown() {   // 화면 전환 전 select2 정리(드롭다운이 body 에 남지 않게)
      view.querySelectorAll('select').forEach(function (s) { if (jQuery(s).data('select2')) { try { jQuery(s).select2('destroy'); } catch (e) {} } });
    }

    /* ── List view ── */
    function showList() {
      teardown();
      view.innerHTML =
        '<div class="elnShBar"><div class="cardSubTit">People with Access</div>'
        + '<a href="javascript:;" class="waves-effect waves-light hBtn elnShAdd"><i class="material-symbols-outlined left">person_add</i><span class="label">Add People</span></a></div>'
        + '<div class="fixedTable hBorderTable hScroll elnAccTbl"><table><thead><tr><th style="width:38%;">Name</th><th style="width:18%;">Function</th><th>Scope</th><th class="ac" style="width:72px;"></th></tr></thead><tbody></tbody></table></div>';
      var tb = view.querySelector('tbody');
      var tr0 = document.createElement('tr');
      tr0.innerHTML = '<td>' + nameCell(ELN.currentUser) + '</td><td>Owner</td><td>Entire note</td><td class="ac"></td>';
      tb.appendChild(tr0);
      CE.people.forEach(function (p) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + nameCell(p.name) + '</td><td>' + esc(p.access) + '</td><td>' + esc(ceScopeText(p)) + '</td>'
          + '<td class="ac"><a href="javascript:;" class="elnAccIco ed" title="Edit"><i class="material-symbols-outlined">edit</i></a>'   // .link(밑줄) 없이 아이콘 버튼
          + '<a href="javascript:;" class="elnAccIco rm" title="Remove"><i class="material-symbols-outlined">close</i></a></td>';
        tr.querySelector('.ed').addEventListener('click', function () { showForm(p); });
        tr.querySelector('.rm').addEventListener('click', function () { ceRemoveAccess(p.name); showList(); });
        tb.appendChild(tr);
      });
      view.querySelector('.elnShAdd').addEventListener('click', function () { showForm(null); });
    }

    /* ── Add / Edit = 목록 위에 뜨는 중첩 모달(nested). 저장하면 이 모달만 닫히고 뒤 목록이 갱신 ── */
    function showForm(p) {
      var edit = !!p;
      var view = document.createElement('div');   // 중첩 모달 본문(바깥 목록의 view 와 별개)
      view.innerHTML =
        '<div class="elnBasicRow alignTop"><div class="elnBasicLabel"><span class="essential">*</span>People</div>'
        + (edit ? '<div class="elnShFixed"><b>' + esc(p.name) + '</b> <span class="elnAccId">(' + esc(userId(p.name)) + ')</span></div>' : '<div class="elnShPick"></div>') + '</div>'
        + '<div class="elnBasicRow"><div class="elnBasicLabel"><span class="essential">*</span>Function</div><div class="elnShAcc"></div></div>'
        + '<div class="elnBasicRow alignTop"><div class="elnBasicLabel"><span class="essential">*</span>Scope</div><div class="elnShareScope">'
        + '<label><input type="radio" name="elnShScope" value="all" class="with-gap" checked><span>Entire note</span></label>'
        + '<label><input type="radio" name="elnShScope" value="sel" class="with-gap"><span>Selected sections</span></label>'
        + '<div class="elnShHint" style="display:none;">Co-editors work on the whole note.</div>'
        + '<div class="elnShareSecs" style="display:none;"></div></div></div>'
        + '<div class="elnBasicRow"><div class="elnBasicLabel"><span class="essential">*</span>Reason</div>'
        + '<div class="aniInput"><input type="text" class="browser-default elnShReason" placeholder="e.g. Review scale-up conditions"><span class="focus-border"></span></div></div>'
        + '<div class="elnBasicRow"><div class="elnBasicLabel"></div><label class="elnShareOkRow"><input type="checkbox" class="filled-in elnShOk"><span>I have checked this complies with the company information security policy.</span></label></div>';
      var curNames = edit && p.scope !== 'all' ? p.scope : [];
      var child = ELN.modal({ title: edit ? 'Edit Access · ' + p.name : 'Add People', icon: edit ? 'manage_accounts' : 'person_add', size: 'md', body: view,
        actions: [{ label: 'Cancel', type: '' },
          { label: edit ? 'Save' : 'Share', type: 'hViva', icon: edit ? 'check' : 'share', onClick: function () { return goBtn.classList.contains('disabled') || !save(); } }] });   // 비활성 클릭 무시 / save 실패(검증) → true 반환 = 모달 유지
      // 정보보호 확인 전에는 Share/Save 비활성(운영 .hBtn.disabled — pointer-events 가 살아 있어 위 onClick 에서도 막음)
      var okBox = view.querySelector('.elnShOk'), goBtn = child.el.querySelector('.btnArea .hBtn:last-child');
      function syncGo() { goBtn.classList.toggle('disabled', !okBox.checked); }
      okBox.addEventListener('change', syncGo); syncGo();
      var secsBox = view.querySelector('.elnShareSecs'), hint = view.querySelector('.elnShHint');
      var secPick = soPickBox(soCards().map(function (c) { var nm = sectionNameOf(c); return { id: c.id, name: nm, checked: curNames.indexOf(nm) >= 0 }; }));
      secsBox.appendChild(secPick.el);
      var rAll = view.querySelector('input[name="elnShScope"][value="all"]'), rSel = view.querySelector('input[name="elnShScope"][value="sel"]');
      var fnSel = S2.make(false);   // 짧은 단일 목록 = select2(검색창 없음)
      fnSel.innerHTML = '';         // 값이 항상 있는 선택 — make 가 넣는 placeholder 용 빈 옵션 제거
      function syncScope() {
        var co = fnSel.value === 'Co-editor';
        if (co) rAll.checked = true;
        rSel.disabled = co; hint.style.display = co ? '' : 'none';
        secsBox.style.display = !co && rSel.checked ? '' : 'none';
      }
      view.querySelectorAll('input[name="elnShScope"]').forEach(function (r) { r.addEventListener('change', syncScope); });
      CE_ACCESS.forEach(function (a) { var o = document.createElement('option'); o.value = a; o.textContent = a; fnSel.appendChild(o); });
      fnSel.value = edit ? p.access : 'Viewer';
      view.querySelector('.elnShAcc').appendChild(fnSel);
      S2.mount(fnSel);
      jQuery(fnSel).on('change', syncScope);
      if (edit && p.scope !== 'all') rSel.checked = true;
      var pickSel = null;
      if (!edit) {
        pickSel = S2.make(true); pickSel.setAttribute('data-placeholder', 'User ID / Name');   // 운영과 동일: User ID / Name 다중
        view.querySelector('.elnShPick').appendChild(pickSel);
        var avail = CE_PEOPLE.filter(function (n) { return n !== ELN.currentUser && !ceFindPerson(n); });   // 이미 접근 권한이 있는 사람 제외
        S2.mount(pickSel, { data: S2.people(avail), placeholder: 'User ID / Name', templateResult: S2.T.person });
      } else view.querySelector('.elnShReason').value = p.reason || '';
      syncScope();

      function save() {   // 성공 true / 검증 실패 false
        var acc = fnSel.value, co = acc === 'Co-editor';
        var all = co || rAll.checked;
        var names = secPick.ids().map(function (id) { return sectionNameOf(ceCardOf(id)); });
        var reason = view.querySelector('.elnShReason').value.trim(), picked = edit ? [p.name] : (jQuery(pickSel).val() || []);
        var miss = !picked.length ? 'Choose at least one person to share with.'
          : !acc ? 'Select a function.'
          : !all && !names.length ? 'Select at least one section.'
          : !reason ? 'Please enter the reason for sharing.' : '';   // 정보보호 확인은 버튼 비활성으로 처리
        if (miss) { soWarn('Required', miss); return false; }
        if (co && ceFrozenNote() && (!edit || p.access !== 'Co-editor')) { soWarn('Not allowed', 'This note is approved and its content is locked, so co-editors cannot be added. Choose Viewer.'); return false; }
        var scope = all ? 'all' : names;
        var ack = ' · Reason: ' + reason + ' · Security policy acknowledged';   // 확인 체크를 감사 근거로 남김(요구 6 "under compliance")
        if (edit) {
          var oldScope = ceScopeText(p), newScope = ceScopeText({ scope: scope });
          var fnChg = p.access !== acc, scChg = newScope !== oldScope;
          // 사유·정보보호 확인은 이번 저장의 마지막 기록 한 줄에만 붙임(중복 방지)
          if (fnChg && !ceChangeAccess(p.name, acc, scChg ? '' : ack)) return false;   // 승인 노트 Co-editor 차단·잠금 해제·감사로그는 ceChangeAccess 가 처리
          if (scChg) {
            ELN.audit.log({ section: ceScopeSection(p), action: 'Access changed', detail: p.name + ': Scope ' + oldScope + ' → ' + newScope + ack });
            p.scope = scope;
          }
          if (!fnChg && !scChg && reason !== p.reason)
            ELN.audit.log({ section: ceScopeSection(p), action: 'Access changed', detail: p.name + ': Reason updated' + ack });
          p.reason = reason; p.ts = ELN.audit.now(); p.by = ELN.currentUser;
          ELN.toast('Access updated for ' + p.name + '.', 'ok');
        } else {
          var rec = { access: acc, scope: scope, reason: reason, ts: ELN.audit.now(), by: ELN.currentUser };
          picked.forEach(function (n) { CE.people.push({ name: n, access: acc, scope: scope, reason: reason, ts: rec.ts, by: rec.by }); });
          ELN.audit.log({ section: ceScopeSection(rec), action: 'Access granted',
            detail: picked.join(', ') + ' · ' + acc + ' · ' + ceScopeText(rec) + ack });
          ELN.toast(picked.length + (picked.length > 1 ? ' people' : ' person') + ' added as ' + acc + '.', 'ok');
        }
        ceRenderShareBtn();
        setTimeout(showList, 0);   // 중첩 모달이 닫힌 뒤 바깥 목록 갱신
        return true;
      }
    }
    showList();
  }

  /* 노트별 초기화/시드 */
  var CE_SEED_EDIT = { card_basic: ['Charles Kim', '09:20'], card_fml: ['David Lee', '10:42'],
    editor: ['Charles Kim', '11:05'], table: ['Min-ji Park', '13:26'], chem: ['Charles Kim', '13:48'],
    related: ['David Lee', '14:10'], attach: ['Charles Kim', '15:32'] };
  function ceReset(code) {
    var demo = !code || code === CE_DEMO;
    CE.people = ceSeedPeople(demo);
    document.querySelectorAll('#tab_ov > .cardBox').forEach(function (c) {
      if (c.id === 'card_approval' || c.id === 'card_audit') return;
      var s = demo ? (CE_SEED_EDIT[c.id] || CE_SEED_EDIT[c.getAttribute('data-modtype')] || [ELN.currentUser, '09:12']) : null;
      ceSetEdited(c, s && s[0], s && s[1]);
    });
    ceRenderShareBtn();
    // 스티커는 노트에 속함 — 이전 노트 것은 지우고, 데모 노트에만 시드 1개(Data Visualization, Min-ji Park)
    document.querySelectorAll('#tab_ov .elnPostit').forEach(function (p) { p.remove(); });
    if (demo) {
      var dv = document.querySelector('#tab_ov > .cardBox[data-modtype="table"]');
      // 위치: 보기 버튼 줄 오른쪽(840px), 좁은 창에선 카드 안쪽으로 당김(메모 폭 200 + 여백)
      if (dv) addPostit(dv, 0, 0, { author: 'Min-ji Park', time: '13:30', text: 'Add batch 2 viscosity results before review', left: Math.max(8, Math.min(840, dv.clientWidth - 210)), top: 50, seed: true });
    }
  }

  ELN.coedit = {
    reset: ceReset,
    ensure: function (card) { if (card.id !== 'card_approval' && card.id !== 'card_audit') ceLabelEl(card); },
    touch: ceTouch
  };
  document.addEventListener('DOMContentLoaded', function () {
    var demo = ceQueryCode() === CE_DEMO;
    CE.people = ceSeedPeople(demo);
    ceRenderShareBtn();
    var sb = document.getElementById('elnShareBtn'); if (sb) sb.addEventListener('click', ceShareModal);
  });
  // 섹션 편집자 시드는 모듈/결재 시드(load+60~80ms) 뒤에
  window.addEventListener('load', function () { setTimeout(function () { ceReset(ceQueryCode()); }, 140); });

  /* ══ Clone note — 현재 노트를 복사해 새 노트로(프로토타입: 같은 팝업을 새 노트로 변환) ══
     서명·Errata·Audit 이력은 복사하지 않음. 실제 구현 시: 서버가 노트 행+선택 섹션 행을 복제하고 parent_note_id(clonedFrom)를 기록. */
  var CLONE_TODAY = '2026-10-14';
  var CLONE_SEQ = 0;
  function cloneNextCode() {
    var code;
    do { CLONE_SEQ++; code = 'NT-2610-' + ('00000' + (187 + CLONE_SEQ)).slice(-5); }
    while (PROJECT_NOTES.some(function (n) { return n.code === code; }));
    return code;
  }
  function cloneSource() {
    var cur = PROJECT_NOTES.filter(function (n) { return n.current; })[0];
    var titIn = document.querySelector('.elnBasicTitle input');
    return { code: cur ? cur.code : CURRENT_CODE, title: (titIn && titIn.value.trim()) || (cur && cur.title) || '', stage: cur ? cur.stage : undefined };
  }
  // 코드로 노트 열기 — 팝업의 노트 목록에 있으면 전환, 아니면 새 창 안내
  function openNoteByCode(code) {
    var n = PROJECT_NOTES.filter(function (x) { return x.code === code; })[0];
    if (n && n.current) { ELN.toast('This is the note you are viewing.', 'info'); return; }
    if (n && ELN.selectNote) ELN.selectNote(code);
    else ELN.toast('Opening ' + code + ' in a new window.', 'info');
  }
  // 본문 @참조 칩 → 참조 노트를 새 팝업 창으로(작성 중인 노트는 유지 — MAPIS 상세=팝업 관례). 팝업은 ?code= 로 해당 노트를 연다
  function openRefWindow(code) {
    var n = PROJECT_NOTES.filter(function (x) { return x.code === code; })[0];
    if (n && n.current) { ELN.toast('This is the note you are viewing.', 'info'); return; }
    if (!n) { ELN.toast('Opening ' + code + ' in a new window.', 'info'); return; }   // 데모 데이터 밖의 노트(타 과제)는 안내만
    window.open('apis_eln_pop_simple.html?code=' + encodeURIComponent(code), 'elnNoteRef', 'width=1480,height=900,scrollbars=yes,resizable=yes');
  }
  ELN.openRefWindow = openRefWindow;
  // 도움말 아이콘(운영 표준 .tooltipped.helpTooltip + data-tooltip) — Materialize 툴팁 초기화
  document.addEventListener('DOMContentLoaded', function () {
    if (window.M && M.Tooltip) M.Tooltip.init(document.querySelectorAll('.tooltipped'));
  });
  // 직접 링크(?code=, opener 없이) — 데모 노트 목록에 있는 노트면 그 노트로 전환해서 연다
  window.addEventListener('load', function () {
    setTimeout(function () {
      var code = ''; try { code = new URLSearchParams(location.search).get('code') || ''; } catch (e) {}
      if (!code || window.opener && window.opener.NOTES) return;   // 리스트(opener) 경로는 기존 동기화가 처리
      var n = PROJECT_NOTES.filter(function (x) { return x.code === code; })[0];
      if (n && !n.current && ELN.selectNote) ELN.selectNote(code);
    }, 220);
  });
  // 원본 노트 링크(Copied from)는 화면에 표시하지 않음 — 현업 요청 아님, 복사본이 원본과 연결될 필요 없음(사용자 2026-10-16).
  // 출처는 Audit Trail 첫 기록 'Note created · Copied from …'(생성 이력)으로만 남김. 이전 버전이 만든 행이 있으면 정리
  function syncClonedRow() {
    var old = document.getElementById('elnClonedRow'); if (old) old.remove();
  }
  // 입력 내용 비우기(Include entered data 해제 시) — 모듈별 '빈 상태'
  function cloneClearData(cards) {
    var expDate = document.getElementById('elnExpDate');
    if (expDate) { expDate.value = CLONE_TODAY; expDate._auditPrev = CLONE_TODAY; }
    var pr = document.getElementById('elnPaperRef');
    if (pr) { pr.value = ''; pr._auditPrev = ''; }
    cards.forEach(function (card) {
      if (card.id === 'card_basic') return;
      card.querySelectorAll('.elnSummernote').forEach(function (el) {
        if (soHasSn(el)) { try { jQuery(el).summernote('code', ''); } catch (e) {} } else el.innerHTML = '';
      });
      var t = card.getAttribute('data-modtype');
      var body = card.querySelector(':scope > .elnBasic');
      if (t === 'table' && body) {   // 표·차트 → 모듈 기본 구조로 재생성 후 값 칸만 비움
        body.innerHTML = moduleSampleBody('table'); wireModuleBody('table', body);
        body.querySelectorAll('.elnDataTable tbody tr').forEach(function (tr) {
          Array.prototype.forEach.call(tr.children, function (td, i) { if (i > 0) td.textContent = ''; });
        });
        if (typeof initAllHBorderTableOverlays === 'function') { try { initAllHBorderTableOverlays(); } catch (e2) {} }
      } else if (t === 'attach') {
        card.querySelectorAll('.elnAttachList').forEach(function (ul) { ul.innerHTML = ''; });
      } else if (t === 'chem') {
        card.querySelectorAll('.elnChemList').forEach(function (ul) { ul.innerHTML = ''; });
        var cb = card.querySelector('.elnChemBox'); if (cb) syncChemEmpty(cb);
      } else if (t === 'related') {   // 직접 추가한 링크 제거(@참조 항목은 에디터가 원본이라 유지·자동 재구성). 프로젝트는 Basic Data 메타라 영향 없음
        card.querySelectorAll('.elnRelItem').forEach(function (li) {
          if (!li.hasAttribute('data-ref')) li.remove();
        });
      }
    });
  }
  function doClone(selIds, include) {
    var src = cloneSource();
    var code = cloneNextCode();
    var title = src.title + ' (copy)';
    ELN.audit.mute++;   // 1~4단계(구성 변경·값 비우기)는 감사 로그 없음 — 이후 audit.reset(nn)이 새 이력을 시드
    var all, kept, DYN = ['editor', 'table', 'chem', 'related', 'attach'], modules = [];
    try {
    // 1) 승인/잠금/편집잠금 상태를 먼저 초기화 — 새 노트는 항상 완전 편집 가능
    apprView = false; setNoteApproved(false);
    if (ELN.signoff) { ELN.signoff.clear(); ELN.signoff.reset('ing'); }
    // 2) 선택 안 된 섹션 조용히 제거(Formulation 정적 카드는 숨김 — 노트 전환 시 복구 가능)
    all = soCards();
    kept = all.filter(function (c) { return c.id === 'card_basic' || selIds.indexOf(c.id) >= 0; });
    all.forEach(function (c) {
      if (kept.indexOf(c) >= 0) return;
      if (c.id === 'card_fml') setFmlVisible(false); else removeSection(c.id);
    });
    if (typeof refreshDividers === 'function') { try { refreshDividers(); } catch (e) {} }
    // 3) 복제본의 모듈 구성(노트 목록에서 다시 열 때 재구성용)
    soCards().forEach(function (c) {
      var t = c.getAttribute('data-modtype');
      if (c.id === 'card_fml') modules.unshift('fml'); else if (DYN.indexOf(t) >= 0) modules.push(t);
    });
    // 4) 값 비우기
    if (!include) cloneClearData(soCards());
    } finally { ELN.audit.mute--; }
    // 5) 헤더·제목·상태
    var tit = document.querySelector('.popup header .statusTit .tit');
    if (tit) tit.textContent = '[' + code + '] ' + title;
    var titIn = document.querySelector('.elnBasicTitle input');
    if (titIn) { titIn.value = title; titIn._auditPrev = title; }
    var pill = document.getElementById('elnHeadStatus');
    if (pill) { pill.className = 'roundBox ' + NOTE_STATUS_PILL.ing; pill.setAttribute('data-status', 'ing'); pill.textContent = NOTE_STATUS_TXT.ing; }
    // 6) 노트 목록(맨 위) + 현재 노트 이동
    var nSec = kept.length;
    var nn = { code: code, title: title, stage: src.stage, date: CLONE_TODAY, status: 'ing', current: true, modules: modules, projects: NOTE_PROJ.slice(),   // 연결 프로젝트는 노트 메타 — 선택 섹션과 무관하게 복제
      clonedFrom: { code: src.code, title: src.title },
      cloneDetail: 'Copied from ' + src.code + ': ' + nSec + ' section' + (nSec === 1 ? '' : 's') + ', data ' + (include ? 'included' : 'not included') };
    PROJECT_NOTES.forEach(function (x) { x.current = false; });
    PROJECT_NOTES.unshift(nn);
    CURRENT_CODE = code;
    renderNoteList();
    syncClonedRow(nn);
    // 7) 이력·공동편집 초기화 (결재 시드 뒤에 — selectNote와 동일 순서)
    ELN.audit.reset(nn);
    if (ELN.coedit) ELN.coedit.reset(code);
    var ul = document.querySelector('.leftAside .menuUl');
    if (ul) { ul.querySelectorAll('.menu-item').forEach(function (m) { m.classList.remove('active'); });
      var f = ul.querySelector('.menu-item[data-target="card_basic"]'); if (f) f.classList.add('active'); }
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e3) { window.scrollTo(0, 0); }
    var cont = document.querySelector('.contArea');
    if (cont) { cont.classList.remove('elnSwapping'); void cont.offsetWidth; cont.classList.add('elnSwapping');
      cont.addEventListener('animationend', function h() { cont.classList.remove('elnSwapping'); cont.removeEventListener('animationend', h); }); }
    ELN.toast('Copied from ' + src.code + ' (not saved yet).', 'ok');
  }
  /* Copy To (운영 FMEA 패턴) — 좌측 버튼 → 옵션 모달 → 새 팝업창(?copyFrom=)에서 복사본을 '저장 전' 상태로 연다. 현재 창은 변환하지 않음.
     섹션 키: 정적 카드는 카드 id(card_basic·card_fml…), 동적 모듈은 '<modtype>#<n>'(새 창에서 카드 id 가 달라지므로 종류+순번으로 식별) */
  function copyKeys(cards) {
    var cnt = {};
    return cards.map(function (c) {
      var t = c.getAttribute('data-modtype');
      if (!t || c.id === 'card_fml') return { key: c.id, card: c };
      cnt[t] = (cnt[t] || 0) + 1;
      return { key: t + '#' + cnt[t], card: c };
    });
  }
  function openCopyModal() {
    var src = cloneSource(), ks = copyKeys(soCards());
    var body = document.createElement('div'); body.className = 'elnCloneBody';
    var h = '<div class="elnCloneSrc"><i class="material-symbols-outlined">file_copy</i><span><b>' + esc(src.code) + '</b> · ' + esc(src.title) + '</span></div>'
      + '<div class="elnReqLbl">Sections to Copy</div><div class="elnCloneSecs hScroll">';
    ks.forEach(function (k) {   // Basic Data = 필수 섹션(삭제 불가) → 체크 고정. 섹션 체크는 구조, 값은 아래 Include entered data
      var basic = k.card.id === 'card_basic';
      h += '<label><input type="checkbox" class="filled-in' + (basic ? '' : ' jsCloneSec') + '" data-key="' + esc(k.key) + '" checked' + (basic ? ' disabled' : '') + '><span>' + esc(sectionNameOf(k.card)) + '</span></label>';
    });
    h += '</div><div class="elnCloneData"><label><input type="checkbox" class="filled-in" id="elnCloneData"><span>Include entered data (values, tables, text)</span></label></div>'
      + '<div class="elnCloneInfo"><i class="material-symbols-outlined">info</i><span>A new note will be created in a new window. Unsaved changes on this page will not be copied. Signatures, Errata and Audit history are not copied.</span></div>';
    body.innerHTML = h;
    ELN.modal({ title: 'Copy To', icon: 'file_copy', size: 'md', body: body, actions: [
      { label: 'Cancel', type: '' },
      { label: 'Copy', icon: 'file_copy', type: 'hViva', onClick: function () {
        var keys = ['card_basic'].concat([].slice.call(body.querySelectorAll('.jsCloneSec')).filter(function (c) { return c.checked; }).map(function (c) { return c.getAttribute('data-key'); }));
        var url = 'apis_eln_pop_simple.html?copyFrom=' + encodeURIComponent(src.code) + '&secs=' + encodeURIComponent(keys.join(',')) + '&data=' + (body.querySelector('#elnCloneData').checked ? 1 : 0);
        window.open(url, 'elnNoteCopy_' + Date.now(), 'width=1480,height=900,scrollbars=yes,resizable=yes');
      } }
    ] });
  }
  document.addEventListener('DOMContentLoaded', function () {
    var cb = document.getElementById('elnCopyTo'); if (cb) cb.addEventListener('click', openCopyModal);
  });
  // 새 창 진입(?copyFrom=코드&secs=키목록&data=0|1) — 시드(결재·공동편집, load+60~220ms)가 끝난 뒤 원본 노트를 맞추고 복사 변환을 한 번만 실행
  window.addEventListener('load', function () {
    var q; try { q = new URLSearchParams(location.search); } catch (e) { return; }
    var from = q.get('copyFrom'); if (!from) return;
    function run() {
      var raw = q.get('secs') || 'all', all = raw === 'all', keys = raw.split(',');   // 리스트에서 열면 secs=all(전체 섹션)
      var ids = copyKeys(soCards()).filter(function (k) { return k.card.id !== 'card_basic' && (all || keys.indexOf(k.key) >= 0); }).map(function (k) { return k.card.id; });
      doClone(ids, q.get('data') === '1');
      var t = q.get('title');   // 리스트가 넘긴 원본 제목(데모 노트 밖의 노트) → 복사본 제목 보정
      if (t) {
        var nt = t + ' (copy)', ht = document.querySelector('.popup header .statusTit .tit'), ti = document.querySelector('.elnBasicTitle input');
        if (ht) ht.textContent = ht.textContent.replace(/\]\s.*$/, '] ' + nt);
        if (ti) { ti.value = nt; ti._auditPrev = nt; }
      }
    }
    setTimeout(function () {
      var cur = PROJECT_NOTES.filter(function (n) { return n.current; })[0];
      if (cur && cur.code !== from && PROJECT_NOTES.some(function (n) { return n.code === from; }) && ELN.selectNote) {
        ELN.selectNote(from); setTimeout(run, 400);   // 다른 노트에서 복사 — 먼저 그 노트로 전환
      } else run();
    }, 450);
  });

  /* ══ Note cross-reference — 에디터에서 @ 로 다른 노트 링크(Summernote hint) ══
     · 입력 시 번호/제목 자동완성(내 노트 + 타 연구원 노트, 권한 없는 노트는 잠금 표시)
     · 삽입된 링크에 마우스를 올리면 요약 카드(권한 없으면 번호·제목만) · Related Items 자동 반영
     실제 구현 시: search = 노트 검색 API(권한 필터 포함), 카드 = 노트 요약 API, 링크 저장 = 본문 HTML의 data-code + note_link 테이블. */
  var NOTE_EXTRA = [
    { code: 'NT-2606-00203', title: 'Coating Trial #2',                         author: 'Tom Reyes',   date: '2026-06-26', status: 'ing' },
    { code: 'NT-2606-00219', title: 'Peel Strength Round Robin',                author: 'Min-ji Park', date: '2026-06-30', status: 'done' },
    { code: 'NT-2607-00311', title: 'Silicone Release Coating',                 author: 'H.S. Choi',   date: '2026-07-14', status: 'ok', restricted: true, team: 'Coating Team' },
    { code: 'NT-2608-00045', title: 'Silicone adhesive peel strength study',    author: 'D.H. Jung',   date: '2026-08-03', status: 'ok', restricted: true, team: 'Adhesives Pilot Team' }
  ];
  var NOTE_AUTHOR = { 'NT-2605-00131': 'S.Y. Park', 'NT-2604-00115': 'Min-ji Park' };   // 프로젝트 노트 중 타인 작성분
  function refDir() {
    var out = [], seen = {};
    PROJECT_NOTES.forEach(function (n) {
      seen[n.code] = 1;
      out.push({ code: n.code, title: n.title, author: NOTE_AUTHOR[n.code] || ELN.currentUser, date: n.date, status: n.status, current: !!n.current, restricted: false });
    });
    NOTE_EXTRA.forEach(function (n) { if (!seen[n.code]) out.push({ code: n.code, title: n.title, author: n.author, date: n.date, status: n.status, current: false, restricted: !!n.restricted, team: n.team }); });
    return out;
  }
  function refFind(code) { return refDir().filter(function (n) { return n.code === code; })[0] || null; }
  function refFrozen(card) {
    return document.body.classList.contains('elnApproved') || !!(card && card.classList.contains('elnLocked'));
  }
  function refStatusPill(st) { return '<span class="roundBox outline ' + (NOTE_STATUS_PILL[st] || 'grey') + '">' + esc(NOTE_STATUS_TXT[st] || st) + '</span>'; }

  // Related Items 반영 — 기존 .elnRelItem 마크업 재사용
  function refRelHas(list, code) { return !!list.querySelector('[data-ref="' + code + '"]') || Array.prototype.some.call(list.querySelectorAll('.elnRelLink'), function (a) { return a.textContent.indexOf('[' + code + ']') === 0; }); }
  function refRelAdd(list, n) {
    var li = document.createElement('li'); li.className = 'elnRelItem'; li.setAttribute('data-ref', n.code);
    // 유형 아이콘은 직접 추가한 Note와 동일(description). 권한 없음은 유형이 아니라 상태 → 우측 배지로.
    // 에디터 @참조에서 온 항목은 에디터가 원본 → 여기선 삭제(×) 없음, 에디터에서 지우면 자동 해제(refSyncRelated)
    li.innerHTML = '<i class="material-symbols-outlined">description</i><span class="elnRelType">Note</span>'
      + '<a href="javascript:;" class="elnRelLink" data-code="' + esc(n.code) + '">' + esc('[' + n.code + '] ' + n.title) + '</a>'
      + (n.restricted ? '<span class="elnRelNoAccess"><i class="material-symbols-outlined">lock</i>No access</span>' : '')
      + '<span class="elnRelVia" title="Linked by an @mention in the Editor. Delete the mention there to unlink">Referenced in Editor</span>';
    list.appendChild(li);
  }
  // 에디터에서 @참조 칩이 지워지면 Related의 해당 항목도 제거(다른 에디터에 같은 참조가 남아 있으면 유지)
  function refSyncRelated() {
    var live = {};
    document.querySelectorAll('#tab_ov .elnNoteRef').forEach(function (a) { live[a.getAttribute('data-code')] = 1; });
    refRelLists().forEach(function (list) {
      list.querySelectorAll('li[data-ref]').forEach(function (li) {
        var code = li.getAttribute('data-ref'); if (live[code]) return;
        li.remove();
        ELN.audit.log({ section: sectionNameOf(list.closest('.cardBox')), action: 'Link removed', detail: 'Note: [' + code + '] (mention deleted in Editor)' });
      });
    });
  }
  var refSyncT = null;
  document.addEventListener('input', function (e) {
    if (!e.target.closest || !e.target.closest('.note-editable')) return;
    clearTimeout(refSyncT); refSyncT = setTimeout(refSyncRelated, 200);
  }, true);
  function refRelLists() {
    return Array.prototype.filter.call(document.querySelectorAll('#tab_ov .elnRelList'), function (l) {
      var c = l.closest('.cardBox'); return !(c && c.classList.contains('elnLocked'));
    });
  }
  // 에디터 본문에 이미 있는 참조를 (새로 만든) Related 모듈에 채움 — 조용히
  function refFillRelated(list) {
    var seen = {};
    document.querySelectorAll('#tab_ov .elnNoteRef').forEach(function (a) {
      var code = a.getAttribute('data-code'); if (!code || seen[code]) return; seen[code] = 1;
      var n = refFind(code); if (n && !refRelHas(list, code)) refRelAdd(list, n);
    });
  }
  // 참조 삽입 직후: 뒤에 공백 + 커서, Related 반영, 감사 로그, 토스트
  function refAfterInsert(a, n, card) {
    var nx = a.nextSibling;
    if (a.parentNode && !(nx && nx.nodeType === 3 && /^[\s ]/.test(nx.nodeValue))) {
      var sp = document.createTextNode(' '); a.parentNode.insertBefore(sp, a.nextSibling);
      try { var r = document.createRange(); r.setStart(sp, 1); r.collapse(true); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {}
    }
    var added = false;
    refRelLists().forEach(function (l) { if (!refRelHas(l, n.code)) { refRelAdd(l, n); added = true; if (ELN.coedit) ELN.coedit.touch(l.closest('.cardBox')); } });
    ELN.audit.log({ section: sectionNameOf(card), action: 'Note referenced', detail: n.code });
    if (added) ELN.toast('Linked ' + n.code + ' (added to Related Items).', 'ok');
  }
  ELN.noteRef = { fillRelated: refFillRelated };

  // Summernote hint 설정 — 에디터(el)마다 호출(Conclusion·Editor 모듈·나중에 추가된 Editor 모듈 모두)
  ELN.noteHint = function (el) {
    return [{
      match: /\B@([\w-]*)$/,
      search: function (kw, cb) {
        var q = String(kw || '').toLowerCase();
        var list = refDir().filter(function (n) {
          return !n.current && (!q || n.code.toLowerCase().indexOf(q) >= 0 || n.title.toLowerCase().indexOf(q) >= 0);
        });
        list.sort(function (a, b) {
          var pa = a.code.toLowerCase().indexOf(q) === 0 ? 0 : 1, pb = b.code.toLowerCase().indexOf(q) === 0 ? 0 : 1;
          return pa - pb || String(b.date).localeCompare(String(a.date));
        });
        cb(list.slice(0, 8));
      },
      template: function (n) {
        return '<span class="elnHintCode">' + esc(n.code) + '</span><span class="elnHintTit">' + esc(n.title) + '</span>'
          + '<span class="elnHintAuth">' + esc(n.author) + '</span>'
          + (n.restricted ? '<span class="elnHintLock"><i class="material-symbols-outlined">lock</i>No access</span>' : '');
      },
      content: function (n) {
        var card = el.closest ? el.closest('.cardBox') : null;
        if (refFrozen(card)) return document.createTextNode('');   // 잠긴 에디터에선 삽입 안 함
        var a = document.createElement('a');
        a.className = 'elnNoteRef' + (n.restricted ? ' restricted' : '');
        a.setAttribute('data-code', n.code); a.setAttribute('contenteditable', 'false'); a.setAttribute('href', 'javascript:;');
        a.textContent = '@' + n.code;
        setTimeout(function () { refAfterInsert(a, n, card); }, 0);
        return a;
      }
    }];
  };

  // 호버 요약 카드 — .elnNoteRef · Related의 노트 링크. 읽기전용(승인/잠금)에서도 동작
  (function () {
    var showT, hideT, cardEl = null, anchor = null;
    function target(t) { return t && t.closest ? t.closest('.elnNoteRef, .elnRelLink[data-code]') : null; }
    function hide() { clearTimeout(showT); clearTimeout(hideT); if (cardEl) { cardEl.remove(); cardEl = null; } anchor = null; }
    function show(a) {
      hide();
      var code = a.getAttribute('data-code'), n = refFind(code);
      var c = document.createElement('div'); c.className = 'elnRefCard';
      var h;
      if (!n) {
        h = '<div class="elnRefHd"><b>' + esc(code) + '</b></div><div class="elnRefMeta">No summary available.</div>';
      } else if (n.restricted) {
        h = '<div class="elnRefHd"><b>' + esc(n.code) + '</b></div><div class="elnRefTit">' + esc(n.title) + '</div>'
          + '<div class="elnRefLock"><i class="material-symbols-outlined">lock</i>You don\'t have access to this note.</div>'
          + '<div class="elnRefFoot"><a href="javascript:;" class="waves-effect waves-light hBtn elnRefReq"><i class="material-symbols-outlined left">key</i><span class="label">Request Access</span></a></div>';
      } else {
        h = '<div class="elnRefHd"><b>' + esc(n.code) + '</b>' + refStatusPill(n.status) + '</div><div class="elnRefTit">' + esc(n.title) + '</div>'
          + '<div class="elnRefMeta"><span><i class="material-symbols-outlined">person</i>' + esc(n.author) + '</span>'
          + '<span><i class="material-symbols-outlined">calendar_today</i>' + esc(n.date) + '</span></div>'
          + '<div class="elnRefFoot"><a href="javascript:;" class="waves-effect waves-light hBtn elnRefOpen"><i class="material-symbols-outlined left">open_in_new</i><span class="label">Open</span></a></div>';
      }
      c.innerHTML = h;
      document.body.appendChild(c);
      var r = a.getBoundingClientRect(), w = c.offsetWidth, ht = c.offsetHeight;
      var x = Math.min(Math.max(8, r.left), window.innerWidth - w - 8), y = r.bottom + 6;
      if (y + ht > window.innerHeight - 8) y = Math.max(8, r.top - ht - 6);
      c.style.left = x + 'px'; c.style.top = y + 'px';
      var op = c.querySelector('.elnRefOpen'), rq = c.querySelector('.elnRefReq');
      if (op) op.addEventListener('click', function () { hide(); openRefWindow(code); });
      if (rq) rq.addEventListener('click', function () { hide(); ELN.toast('Access request sent to ' + n.author + '.', 'ok'); });
      cardEl = c; anchor = a;
    }
    document.addEventListener('mouseover', function (e) {
      var a = target(e.target);
      if (a) { clearTimeout(hideT); if (a === anchor) return; clearTimeout(showT); showT = setTimeout(function () { show(a); }, 220); return; }
      if (cardEl && cardEl.contains(e.target)) clearTimeout(hideT);
    });
    document.addEventListener('mouseout', function (e) {
      if (target(e.target) || (cardEl && cardEl.contains(e.target))) { clearTimeout(showT); clearTimeout(hideT); hideT = setTimeout(hide, 260); }
    });
    document.addEventListener('scroll', hide, true);
    document.addEventListener('mousedown', function (e) { if (cardEl && !cardEl.contains(e.target)) hide(); }, true);
    // 칩 클릭 = 참조 노트 열기(새 팝업). 권한 없는 노트는 접근 요청 카드를 바로 띄움
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('.elnNoteRef'); if (!a) return;
      e.preventDefault();
      var code = a.getAttribute('data-code'), n = refFind(code);
      if (n && n.restricted) { show(a); return; }
      openRefWindow(code);
    });
  })();
})();
