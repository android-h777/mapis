/* ── Glass Engine: 마우스 트래킹 (공용) ── */
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

/* mouseleave 시 잔류 인라인 변수 정리
   leftover inline CSS variables cleanup on mouseleave */
function glassClear(el) {
  el.style.removeProperty('--olx');
  el.style.removeProperty('--oly');
  el.style.removeProperty('--ol-angle');
}

// /* li.on 트래킹 + 틸트 */
$(document).on('mousemove', '.mainList li.on', function(e) {
  glassTrack.call(this, e);
  // var rect = this.getBoundingClientRect();
  // var x = (e.clientX - rect.left) / rect.width;
  // var y = (e.clientY - rect.top) / rect.height;
  // var tiltX = (0.5 - y) * 4;
  // var tiltY = (x - 0.5) * 3;
  //this.style.transform = 'translateY(-2px) perspective(800px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
});
$(document).on('mouseleave', '.mainList li.on', function() {
  //this.style.transform = 'translateY(-2px)';
  glassClear(this);
});

/* hBtn 트래킹 */
$(document).on('mousemove', '.hBtn', glassTrack);
$(document).on('mouseleave', '.hBtn', function() {
  glassClear(this);
});

/* modal 트래킹 */
$(document).on('mousemove', '.modal', function(e) {
  if (e.target.closest('.hBorderTable')) return;
  glassTrack.call(this, e);
});
$(document).on('mouseleave', '.modal', function() {
  glassClear(this);
});

/* appleTab 트래킹 — li 위치를 tabBg에 전달 */
$(document).on('mousemove', '.newAppleTab li.on', function(e) {
  var tabBg = $(this).parents('.newAppleTab').find('.tabBg')[0];
  if (!tabBg) return;
  var rect = tabBg.getBoundingClientRect();
  var x = ((e.clientX - rect.left) / rect.width * 100);
  var yPx = e.clientY - rect.top;
  var angle = Math.atan2(
    e.clientY - (rect.top + rect.height / 2),
    e.clientX - (rect.left + rect.width / 2)
  ) * 180 / Math.PI;
  tabBg.style.setProperty('--olx', x + '%');
  tabBg.style.setProperty('--oly', yPx + 'px');
  tabBg.style.setProperty('--ol-angle', angle + 'deg');
});
$(document).on('mouseleave', '.newAppleTab li.on', function() {
  var tabBg = $(this).parents('.newAppleTab').find('.tabBg')[0];
  if (tabBg) glassClear(tabBg);
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
  // var caustic = document.createElement('div');
  // caustic.className = 'glassCaustic';
  // overlay.appendChild(caustic);
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
    // caustic.style.left = (e.clientX - olRect.left - 40) + 'px';
    // caustic.style.bottom = '0';
  };
  container.addEventListener('mousemove', moveHandler);
  container._glassMoveHandler = moveHandler;

  tbodyEl.addEventListener('mouseleave', function() {
    currentRow = null;
    overlay.classList.remove('active');
    /* transition 끝난 후 사이즈 0 reset + 인라인 변수 정리
       size reset + inline variable cleanup after transition */
    setTimeout(function() {
      if (!currentRow) {
        overlay.style.width = '0';
        overlay.style.height = '0';
        glassClear(overlay);
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