/* MAPIS ELN 공용 UI 부품 — 토스트 · 모달 · 팝오버. 리스트(apis_eln_list)와 상세(apis_eln_pop)가 같이 씀.
   리스트는 토스트·모달을 MAPIS 공통 컴포넌트로 바꿔 쓰는 브리지(initMapisBridge)가 덮어씀. 2026-10-26 js/eln.js 에서 분리 */
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
    var WIDTH = { sm: 460, md: 580, lg: 680, xl: 1000 };   // size: 'sm' | 'md' | 'lg' | 'xl'(첨부 미리보기) — 생략 시 560px
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

    // 버튼 순서 = 운영 표준(common.html approvalModal 등): 실행 버튼 먼저, Cancel 은 마지막 + hGrey·close 아이콘
    var acts = (opts.actions || [{ label: 'Close', type: '' }]).slice();
    function isCancel(a) { return a && a.label === 'Cancel'; }
    acts.sort(function (a, b) { return (isCancel(a) ? 1 : 0) - (isCancel(b) ? 1 : 0); });   // 안정 정렬 — 나머지 순서는 유지
    acts.forEach(function (a) { if (isCancel(a)) { if (!a.type) a.type = 'hGrey'; if (!a.icon) a.icon = 'close'; } });
    acts.forEach(function (a) {
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

  // 팝오버: ELN.popover({anchor, content(HTMLElement), width, above?, alignRight?, atPointer?, pad?}) — 누른 자리에 뜨는 경량 선택 UI(모달 대체).
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
      x = Math.min(Math.max(8, opts.alignRight ? r.right - w : r.left), window.innerWidth - w - 8);   // alignRight = 팝오버 오른쪽 끝을 앵커 오른쪽 끝에(오른쪽 끝 버튼의 메뉴)
      if (opts.above && r.top - h - 6 >= 8) { y = r.top - h - 6; pop.classList.add('above'); }   // 위로 펼치기 요청(공간 있을 때만)
      else {
        y = r.bottom + 6;
        if (y + h > window.innerHeight - 8) { y = Math.max(8, r.top - h - 6); pop.classList.add('above'); }
      }
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
})();
