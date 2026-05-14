/* ============================================================================
   Glass Engine — mapis 색수차(conic-gradient) + 마우스 트래킹 + 틸트 통합

   효과 카탈로그
   ────────────────────────────────────────────────────────────────────────────
   [1] --olx / --oly / --ol-angle  (glassTrack 헬퍼)
       → 큰 conic gradient 회전 + 광원 추적
       사용: mainList li, menuAside menuList li, menuUl .menu-item, hBtn, appleTab
   [2] --card-gx / --card-gy  (cardSpotlight 헬퍼)
       → spotlight + 미니 conic (좁은 카드용)
       사용: pjtMapBox.waves-effect, pjtMapSubBox, statusArea .bdBox
   [3] 정적 색수차 (마우스 트래킹 없음)
       → CSS ::after 슬롯에 고정 conic. JS 핸들러 불필요.
       사용: .typeList .mainList li .statusBox (type1/type2/coc),
             .popup header .npdiTabMenu .tabs .indicator
   [4] 동적 행 오버레이 (initGlassOverlay)
       → 호버된 tr 위에 .glassRowOverlay 가 absolute 매칭, conic + caustic 광점
       사용: .fixedTable.hBorderTable / .hFixedTable.hBorderTable
   ============================================================================ */


/* ── 헬퍼 ─────────────────────────────────────────────────────────────────── */

/* 큰 conic 회전용 광원 좌표 갱신 — radial(--olx, --oly) + conic(--ol-angle) */
function glassTrack(e) {
  var rect = this.getBoundingClientRect();
  var x = ((e.clientX - rect.left) / rect.width * 100);
  var yPx = e.clientY - rect.top;
  var angle = Math.atan2(
    e.clientY - (rect.top + rect.height / 2),
    e.clientX - (rect.left + rect.width / 2)
  ) * 180 / Math.PI;
  this.style.setProperty('--olx', x + '%');
  this.style.setProperty('--oly', yPx + 'px');
  this.style.setProperty('--ol-angle', angle + 'deg');
}

/* 좁은 카드 spotlight 좌표 갱신 (--card-gx/--card-gy, %) — masterdata step-card 패턴 */
function cardSpotlight(e) {
  var r = this.getBoundingClientRect();
  var x = ((e.clientX - r.left) / r.width) * 100;
  var y = ((e.clientY - r.top) / r.height) * 100;
  this.style.setProperty('--card-gx', x + '%');
  this.style.setProperty('--card-gy', y + '%');
  return { x: x, y: y };
}


/* ── [1] glassTrack 계열 ──────────────────────────────────────────────────── */

/* mainList li (메인 카드 리스트) — glassTrack + 강한 틸트(4/3) + translateY(-2px) */
$(document).on('mousemove', '.mainList li', function(e) {
  glassTrack.call(this, e);
  var rect = this.getBoundingClientRect();
  var x = (e.clientX - rect.left) / rect.width;
  var y = (e.clientY - rect.top) / rect.height;
  var tiltX = (0.5 - y) * 4;
  var tiltY = (x - 0.5) * 3;
  this.style.transform = 'translateY(-2px) perspective(800px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
});
$(document).on('mouseleave', '.mainList li', function() {
  this.style.transform = this.classList.contains('on') ? 'translateY(-2px)' : '';
});

/* 좌측 사이드바 menuList li (slide-out 안) — glassTrack + 약한 틸트(2/1.5), 떠오름 없음 */
$(document).on('mousemove', '.menuAside .menuList li', function(e) {
  glassTrack.call(this, e);
  var rect = this.getBoundingClientRect();
  var x = (e.clientX - rect.left) / rect.width;
  var y = (e.clientY - rect.top) / rect.height;
  var tiltX = (0.5 - y) * 2;
  var tiltY = (x - 0.5) * 1.5;
  this.style.transform = 'perspective(800px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
});

/* leftAside menuUl .menu-item — glassTrack + 약한 틸트(2/1.5) + translateY(-1px) */
$(document).on('mousemove', '.menuUl .menu-item', function(e) {
  glassTrack.call(this, e);
  var rect = this.getBoundingClientRect();
  var x = (e.clientX - rect.left) / rect.width;
  var y = (e.clientY - rect.top) / rect.height;
  var tiltX = (0.5 - y) * 2;
  var tiltY = (x - 0.5) * 1.5;
  this.style.transform = 'translateY(-1px) perspective(800px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
});

$(document).on('mouseleave', '.menuAside .menuList li, .menuUl .menu-item', function() {
  this.style.transform = '';
});

/* hBtn 알약 버튼 — glassTrack + 강한 틸트(20/20) + scale(1.03) */
$(document).on('mousemove', '.hBtn', function(e) {
  glassTrack.call(this, e);
  var r = this.getBoundingClientRect();
  var x = (e.clientX - r.left) / r.width;
  var y = (e.clientY - r.top) / r.height;
  var rotY = (x - 0.5) * 20;
  var rotX = (0.5 - y) * 20;
  this.style.transform = 'perspective(400px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale(1.03)';
});
$(document).on('mouseleave', '.hBtn', function() {
  this.style.transition = 'transform .3s ease';
  this.style.transform = '';
  var self = this;
  setTimeout(function() { self.style.transition = ''; }, 300);
});

/* animate.css 종료 후 클래스 자동 제거 — animation-fill-mode: both 가 인라인 transform 을 덮는 문제 해결 */
$(document).on('animationend', '.hBtn.animate__animated', function() {
  var keep = [];
  this.className.split(/\s+/).forEach(function(c) {
    if (c && c.indexOf('animate__') !== 0) keep.push(c);
  });
  this.className = keep.join(' ');
});

/* appleTab — li 위치를 부모 .tabBg 에 전달 (li.on 클릭 영역만 트래킹) */
$(document).on('mousemove', '.newAppleTab li.on', function(e) {
  var tabBg = $(this).parents('.newAppleTab').find('.tabBg')[0];
  if (tabBg) glassTrack.call(tabBg, e);
});

/* mainSrchArea 검색박스 알약 — glassTrack 만 (tilt 없음, input 기울어지면 어색) */
$(document).on('mousemove', '.mainSrchArea .srchArea', glassTrack);

/* myMenuArea menuIconBox — cardSpotlight 만 (transform 없음, narrow card jitter 회피) */
$(document).on('mousemove', '.myMenuArea .myMenuList li .menuIconBox', cardSpotlight);

/* notiList collapsible li — cardSpotlight 만 (transform 없음, collapsible 동작 영향 회피) */
$(document).on('mousemove', '.notiList ul li', cardSpotlight);


/* ── [2] cardSpotlight 계열 ───────────────────────────────────────────────── */

/* ProcessMap 큰 박스 (.waves-effect 단독) — spotlight + 5deg 틸트 + scale(1.02) */
$(document).on('mousemove', '.pjtMapBox.waves-effect', function(e) {
  var p = cardSpotlight.call(this, e);
  var rotY = ((p.x - 50) / 50) * 5;
  var rotX = ((50 - p.y) / 50) * 5;
  this.style.transform = 'perspective(600px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale(1.02)';
});
$(document).on('mouseleave', '.pjtMapBox.waves-effect', function() {
  this.style.transform = '';
});

/* ProcessMap SubBox + stageBtn (.bdBox) — spotlight 만, transform 금지
   (좁은 폭 + outline animation 충돌로 jitter 발생 — feedback_narrow_card_jitter) */
$(document).on('mousemove', '.pjtMapSubBox, .popup header .statusArea .bdBox', cardSpotlight);


/* ── 컨테이너 트래킹 (--lw-gx / --lw-gy, masterdata mr-list-wrap 패턴) ─────── *
 * slide-out 글래스 + 모든 .cardBox 가 이 채널 사용. cardBox 안엔 다른 추적 핸들러를
 * 가진 자식(mainList li, hBtn, pjtMapBox 등)이 bubble 로 같이 발화하므로 rAF throttle 로
 * frame 당 1회로 묶음. paint 큰 ::before radial 의 과도한 repaint 회피. */
var _lwRafPending = false;
var _lwLastEv = null;
$(document).on('mousemove', '#slide-out.glassBox, .mainCont .cardBox', function(e) {
  _lwLastEv = { el: this, x: e.clientX, y: e.clientY };
  if (_lwRafPending) return;
  _lwRafPending = true;
  requestAnimationFrame(function() {
    _lwRafPending = false;
    var d = _lwLastEv;
    if (!d || !d.el.isConnected) return;
    var r = d.el.getBoundingClientRect();
    d.el.style.setProperty('--lw-gx', ((d.x - r.left) / r.width) * 100 + '%');
    d.el.style.setProperty('--lw-gy', ((d.y - r.top) / r.height) * 100 + '%');
  });
});


/* ── npdiTabMenu indicator 마우스 추적 (--ind-gx/--ind-gy/--ind-angle) ─────── *
 * indicator 는 pointer-events:none 이라 직접 mousemove 받을 수 없음.
 * 부모 .tabs 에서 받아서 indicator 박스 기준 좌표로 변환. rAF throttle. */
var _indRafPending = false;
var _indLastEv = null;
$(document).on('mousemove', '.popup header .npdiTabMenu .tabs', function(e) {
  _indLastEv = { tabs: this, x: e.clientX, y: e.clientY };
  if (_indRafPending) return;
  _indRafPending = true;
  requestAnimationFrame(function() {
    _indRafPending = false;
    var d = _indLastEv;
    if (!d) return;
    var indicator = d.tabs.querySelector(':scope > .indicator');
    if (!indicator) return;
    var r = indicator.getBoundingClientRect();
    if (r.width === 0) return;
    var x = ((d.x - r.left) / r.width) * 100;
    var y = ((d.y - r.top) / r.height) * 100;
    var angle = Math.atan2(
      d.y - (r.top + r.height / 2),
      d.x - (r.left + r.width / 2)
    ) * 180 / Math.PI;
    indicator.style.setProperty('--ind-gx', x + '%');
    indicator.style.setProperty('--ind-gy', y + '%');
    indicator.style.setProperty('--ind-angle', angle + 'deg');
  });
});


/* ── [4] Glass Row Overlay — hBorderTable 행 호버 무지개 효과 ─────────────── *
 * masterdata 의 hoo-spec-table 패턴 이식 (siliconeFormula 원형).
 * 컨테이너에 .glassRowOverlay > .glassCaustic 동적 삽입.
 * tr mouseover 시 overlay 가 tr 영역 매칭 (top: -1, height: -1 — boundary 침범 회피 / .fixedTable overflow:auto scroll 트리거 방지).
 * mousemove 시 --olx/--oly/--ol-angle 갱신.
 * idempotent — 같은 container 에 재호출 가능. */
function initGlassOverlay(container, tbodyEl) {
  if (!container || !tbodyEl) return;

  /* 이전 호출 정리 */
  var existing = container.querySelector(':scope > .glassRowOverlay');
  if (existing) existing.remove();
  if (container._glassMoveHandler) {
    container.removeEventListener('mousemove', container._glassMoveHandler);
  }

  var overlay = document.createElement('div');
  overlay.className = 'glassRowOverlay';
  var caustic = document.createElement('div');
  caustic.className = 'glassCaustic';
  overlay.appendChild(caustic);
  container.appendChild(overlay);
  var currentRow = null;

  tbodyEl.addEventListener('mouseover', function(e) {
    var tr = e.target.closest('tbody tr');
    if (!tr || tr === currentRow) return;
    currentRow = tr;
    var containerRect = container.getBoundingClientRect();
    var trRect = tr.getBoundingClientRect();
    /* top: -1, height: -1 — tr 안쪽 1px 마진. tr.bottom 이 컨테이너 boundary 와
       닿아서 위아래 스크롤 트리거 → 가로까지 연쇄되는 걸 회피 */
    overlay.style.top = (trRect.top - containerRect.top + container.scrollTop - 1) + 'px';
    overlay.style.left = (trRect.left - containerRect.left + container.scrollLeft) + 'px';
    overlay.style.width = trRect.width + 'px';
    overlay.style.height = (trRect.height - 1) + 'px';
    overlay.classList.add('active');
  });

  var moveHandler = function(e) {
    if (!currentRow) return;
    var olRect = overlay.getBoundingClientRect();
    var x = ((e.clientX - olRect.left) / olRect.width) * 100;
    var yPx = e.clientY - olRect.top;
    var angle = Math.atan2(
      e.clientY - (olRect.top + olRect.height / 2),
      e.clientX - (olRect.left + olRect.width / 2)
    ) * 180 / Math.PI;
    overlay.style.setProperty('--olx', x + '%');
    overlay.style.setProperty('--oly', yPx + 'px');
    overlay.style.setProperty('--ol-angle', angle + 'deg');
    caustic.style.left = (e.clientX - olRect.left - 40) + 'px';
    caustic.style.bottom = '0';
  };
  container.addEventListener('mousemove', moveHandler);
  container._glassMoveHandler = moveHandler;

  tbodyEl.addEventListener('mouseleave', function() {
    currentRow = null;
    overlay.classList.remove('active');
    /* transition 끝난 후 사이즈 0 reset — 다음 호버까지 layout 영향 차단 안전망 */
    setTimeout(function() {
      if (!currentRow) {
        overlay.style.width = '0';
        overlay.style.height = '0';
      }
    }, 200);
  });
}

/* 페이지 안 모든 .hBorderTable 컨테이너에 일괄 적용 (idempotent) */
function initAllHBorderTableOverlays(root) {
  var scope = root || document;
  scope.querySelectorAll('.hBorderTable').forEach(function(container) {
    var tbody = container.querySelector('table tbody');
    if (tbody) initGlassOverlay(container, tbody);
  });
}


/* ── 페이지 진입 시 init ──────────────────────────────────────────────────── */
$(function() {
  initAllHBorderTableOverlays();
});
