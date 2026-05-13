/* =========================================================
   NPDI Gantt - Script (jQuery + Materialize + jQuery UI sortable)
   - 초기 데이터는 JSON 배열로 npdiLoadRows(list) 한 번에 생성
   - "Add Task" 버튼은 npdiAddRow()로 단건 추가 (내부는 동일 템플릿 사용)
   - Datepicker container: modal.open 우선 → 없으면 document.body (shell에 붙지 않음)
========================================================= */

(function(){
  'use strict';

  /* =======================
     Core Config/State
  ======================= */
  const NPDI = {
    cellW: 42,                // CSS :root --npdi-cell-w 와 동기화 (init에서 읽음)
    resExpanded: false,        // Resource 컬럼 확장 상태
    range: {
      startIdx: npdiMonthIndex(2025, 6),
      endIdx:   npdiMonthIndex(2026, 12),
      cols: 0
    },
    seq: 1,                    // row id sequence
    foldState: new Map()       // rowId -> boolean
  };

  /* =======================
     Utils
  ======================= */
  function npdiReadCssPxVar(varName, fallback){
    const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  }

  function npdiMonthIndex(y, m){ return y * 12 + (m - 1); }

  function npdiParseYMD(s){
    if(!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    const [y,m,d] = s.split('-').map(Number);
    const dt = new Date(y, m-1, d);
    if(dt.getFullYear()!==y || dt.getMonth()+1!==m || dt.getDate()!==d) return null;
    return dt;
  }

  function npdiFmtYMD(dt){
    const y = dt.getFullYear();
    const m = String(dt.getMonth()+1).padStart(2,'0');
    const d = String(dt.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  }

  function npdiClamp(n,min,max){ return Math.max(min, Math.min(max,n)); }
  function npdiEndEffective(ed){ return new Date(ed); }

  function npdiDiffMonthsInclusive(sd, edEff){
    return (npdiMonthIndex(edEff.getFullYear(), edEff.getMonth()+1)
          - npdiMonthIndex(sd.getFullYear(), sd.getMonth()+1)) + 1;
  }

  function npdiEscapeHtml(str){
    return String(str)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'","&#039;");
  }

  /* =======================
     Resource Expand/Collapse
  ======================= */
  function npdiSetResourceExpanded(expanded){
    NPDI.resExpanded = !!expanded;
    $('.npdi-gantt-shell').toggleClass('npdi-res-expanded', NPDI.resExpanded);
    setTimeout(npdiSyncHeaderToScroll, 240);
  }

  function npdiToggleResourceExpanded(force){
    if(typeof force === 'boolean') npdiSetResourceExpanded(force);
    else npdiSetResourceExpanded(!NPDI.resExpanded);
  }

  /* =======================
     Header Range / Render
  ======================= */
  function npdiRecalcRangeFromRows(){
    let minIdx=null, maxIdx=null;

    $('.npdi-gantt-row').each(function(){
      const s = $(this).find('.npdi-inp-start').val().trim();
      const e = $(this).find('.npdi-inp-end').val().trim();
      const sd = npdiParseYMD(s);
      const ed = npdiParseYMD(e);
      if(!(sd && ed && ed >= sd)) return;

      const edEff = npdiEndEffective(ed);
      const sIdx = npdiMonthIndex(sd.getFullYear(), sd.getMonth()+1);
      const eIdx = npdiMonthIndex(edEff.getFullYear(), edEff.getMonth()+1);

      minIdx = (minIdx===null) ? sIdx : Math.min(minIdx, sIdx);
      maxIdx = (maxIdx===null) ? eIdx : Math.max(maxIdx, eIdx);
    });

    if(minIdx===null || maxIdx===null){
      minIdx = NPDI.range.startIdx;
      maxIdx = NPDI.range.endIdx;
    }

    NPDI.range.startIdx = minIdx;
    NPDI.range.endIdx   = maxIdx;
    NPDI.range.cols     = Math.max(1, (maxIdx - minIdx) + 1);
  }

  function npdiSyncHeaderToScroll(){
    const x = $('#npdi-gantt-right').scrollLeft();
    $('#npdi-gantt-year-inner').css('transform', `translateX(${-x}px)`);
    $('#npdi-gantt-month-inner').css('transform', `translateX(${-x}px)`);
  }

  function npdiRenderHeader(){
    npdiRecalcRangeFromRows();
    const { startIdx, cols } = NPDI.range;

    const px = cols * NPDI.cellW;

    $('#npdi-gantt-year').html('<div id="npdi-gantt-year-inner"></div>');
    $('#npdi-gantt-month').html('<div id="npdi-gantt-month-inner"></div>');

    const baseGridCss = {
      display:'grid',
      gridTemplateColumns:`repeat(${cols}, ${NPDI.cellW}px)`,
      width:px+'px',
      height:'22px',
      willChange:'transform'
    };

    const $yearInner  = $('#npdi-gantt-year-inner').css(baseGridCss);
    const $monthInner = $('#npdi-gantt-month-inner').css(baseGridCss);

    const yearMap = {};
    for(let i=0;i<cols;i++){
      const idx = startIdx + i;
      const y = Math.floor(idx/12);
      yearMap[y] = (yearMap[y] || 0) + 1;
    }

    Object.entries(yearMap).forEach(([y, span])=>{
      $yearInner.append(
        `<div style="grid-column:span ${span};font-size:12px;font-weight:600;color:#000;padding-left:8px;line-height:22px;border-left:1px solid #eee;">${y}</div>`
      );
    });

    for(let i=0;i<cols;i++){
      const idx = startIdx + i;
      $monthInner.append(
        `<div style="font-size:12px;color:#000;text-align:center;line-height:22px;border-left:1px solid #eee;">${(idx%12)+1}</div>`
      );
    }

    $('#npdi-gantt-bars').css('width', px+'px');
    $('.npdi-gantt-bar-row').css('background-size', `${NPDI.cellW}px 100%`);
  }

  /* =======================
     Datepicker (Materialize)
     - modal.open 우선, 없으면 body
  ======================= */
  function npdiGetDpContainer(){
    const openModal = document.querySelector('.modal.open');
    return openModal || document.body;
  }

  function npdiDpOff(inputEl){
    const inst = M.Datepicker.getInstance(inputEl);
    if(inst) inst.destroy();
    inputEl.classList.remove('datepicker');
  }

  function npdiDpOn(inputEl){
    inputEl.classList.add('datepicker');
    if (M.Datepicker.getInstance(inputEl)) return;

    M.Datepicker.init(inputEl, {
      format: 'yyyy-mm-dd',
      autoClose: true,
      container: npdiGetDpContainer(),
      onClose: function(){
        $(this.el).trigger('change');
      }
    });
  }

  /* =======================
     Level 적용
     - L1/L2: 자동 날짜(읽기전용)
     - L3/L4: 수동 날짜 + datepicker
  ======================= */
  function npdiApplyLevel($row){
    const lvl = Math.max(1, Math.min(4, parseInt($row.find('.npdi-inp-lvl').val(),10) || 1));
    const id  = $row.data('id');

    $row.attr('data-lvl', lvl);
    $row.removeClass('npdi-lvl-1 npdi-lvl-2 npdi-lvl-3 npdi-lvl-4').addClass(`npdi-lvl-${lvl}`);

    $(`#npdi-gantt-bars .npdi-gantt-bar-row[data-id="${id}"]`)
      .removeClass('npdi-lvl-1 npdi-lvl-2 npdi-lvl-3 npdi-lvl-4')
      .addClass(`npdi-lvl-${lvl}`);

    const indent = (lvl-1) * 14;
    $row.find('.npdi-task-wrap').css('padding-left', indent+'px');

    const startEl = $row.find('.npdi-inp-start')[0];
    const endEl   = $row.find('.npdi-inp-end')[0];

    if(lvl <= 2){
      $(startEl).addClass('npdi-auto-date').prop('readonly', true);
      $(endEl).addClass('npdi-auto-date').prop('readonly', true);
      npdiDpOff(startEl);
      npdiDpOff(endEl);
    }else{
      $(startEl).removeClass('npdi-auto-date').prop('readonly', false);
      $(endEl).removeClass('npdi-auto-date').prop('readonly', false);
      npdiDpOn(startEl);
      npdiDpOn(endEl);
    }
  }

  /* =======================
     Fold/Tree
  ======================= */
  function npdiIsFolded(rowId){ return NPDI.foldState.get(rowId) === true; }
  function npdiSetFold(rowId, folded){ NPDI.foldState.set(rowId, !!folded); }

  function npdiRowsInOrder(){
    return $('#npdi-gantt-rows .npdi-gantt-row').toArray().map(el => $(el));
  }

  function npdiHasChildrenAtIndex(rows, i){
    const lvl = parseInt(rows[i].attr('data-lvl'),10) || 1;
    if(i+1 >= rows.length) return false;
    const nextLvl = parseInt(rows[i+1].attr('data-lvl'),10) || 1;
    return nextLvl > lvl;
  }

  function npdiApplyFoldVisibility(){
    const rows = npdiRowsInOrder();

    rows.forEach($r => $r.removeClass('npdi-hidden'));
    $('#npdi-gantt-bars .npdi-gantt-bar-row').removeClass('npdi-hidden');

    for(let i=0;i<rows.length;i++){
      const $parent = rows[i];
      const parentId = $parent.data('id');
      const parentLvl = parseInt($parent.attr('data-lvl'),10) || 1;

      const hasKids = npdiHasChildrenAtIndex(rows, i);
      const $fold = $parent.find('.npdi-fold');

      if(hasKids){
        $fold.removeClass('npdi-fold-disabled').text(npdiIsFolded(parentId) ? '▶' : '▼');
      }else{
        $fold.addClass('npdi-fold-disabled').text('');
        npdiSetFold(parentId, false);
      }

      if(!hasKids) continue;
      if(!npdiIsFolded(parentId)) continue;

      for(let j=i+1; j<rows.length; j++){
        const $child = rows[j];
        const childLvl = parseInt($child.attr('data-lvl'),10) || 1;
        if(childLvl <= parentLvl) break;

        $child.addClass('npdi-hidden');
        $(`#npdi-gantt-bars .npdi-gantt-bar-row[data-id="${$child.data('id')}"]`).addClass('npdi-hidden');
      }
    }
  }

  function npdiGetChildIds(parentId){
    const rows = npdiRowsInOrder();
    const pIdx = rows.findIndex($r => $r.data('id') === parentId);
    if(pIdx < 0) return [];

    const parentLvl = parseInt(rows[pIdx].attr('data-lvl'), 10) || 1;
    const ids = [];

    for(let i=pIdx+1; i<rows.length; i++){
      const lvl = parseInt(rows[i].attr('data-lvl'), 10) || 1;
      if(lvl <= parentLvl) break;
      ids.push(rows[i].data('id'));
    }
    return ids;
  }

  function npdiAnimateFold(parentId, fold){
    const childIds = npdiGetChildIds(parentId);
    const dur = 160;
    if(childIds.length === 0) return;

    if(fold){
      childIds.forEach(id=>{
        const $l = $(`.npdi-gantt-row[data-id="${id}"]`);
        const $r = $(`.npdi-gantt-bar-row[data-id="${id}"]`);

        if($l.is(':visible')) $l.stop(true,true).slideUp(dur, function(){ $l.addClass('npdi-hidden'); });
        else $l.addClass('npdi-hidden');

        if($r.is(':visible')) $r.stop(true,true).slideUp(dur, function(){ $r.addClass('npdi-hidden'); });
        else $r.addClass('npdi-hidden');
      });
    }else{
      childIds.forEach(id=>{
        const $l = $(`.npdi-gantt-row[data-id="${id}"]`);
        const $r = $(`.npdi-gantt-bar-row[data-id="${id}"]`);
        $l.removeClass('npdi-hidden').stop(true,true).slideDown(dur);
        $r.removeClass('npdi-hidden').stop(true,true).slideDown(dur);
      });
      setTimeout(()=>npdiApplyFoldVisibility(), dur + 10);
    }
  }

  /* =======================
     Bars
  ======================= */
  function npdiRefreshRow(id){
    const $row = $(`.npdi-gantt-row[data-id="${id}"]`);
    const $barRow = $(`.npdi-gantt-bar-row[data-id="${id}"]`);
    $barRow.find('.npdi-gantt-bar').remove();

    const lvl = parseInt($row.attr('data-lvl'),10) || 1;

    const s = $row.find('.npdi-inp-start').val().trim();
    const e = $row.find('.npdi-inp-end').val().trim();
    const sd = npdiParseYMD(s);
    const ed = npdiParseYMD(e);
    if(!(sd && ed && ed>=sd)) return;

    const edEff = npdiEndEffective(ed);
    if(edEff < sd) return;

    const months = npdiDiffMonthsInclusive(sd, edEff);

    const sIdx = npdiMonthIndex(sd.getFullYear(), sd.getMonth()+1);
    const eIdx = npdiMonthIndex(edEff.getFullYear(), edEff.getMonth()+1);

    const { startIdx, endIdx } = NPDI.range;
    const cS = npdiClamp(sIdx, startIdx, endIdx);
    const cE = npdiClamp(eIdx, startIdx, endIdx);
    if(cE < startIdx || cS > endIdx) return;

    const leftPx  = (cS - startIdx) * NPDI.cellW;
    const widthPx = ((cE - cS) + 1) * NPDI.cellW;

    const $bar = $('<div class="npdi-gantt-bar"></div>')
      .addClass(`npdi-lvl-${lvl}`)
      .addClass('npdi-bar-anim')
      .css({ left:leftPx+'px', width:widthPx+'px' });

    if(lvl >= 3) $bar.attr('data-label', months+'m');

    $barRow.append($bar);
    requestAnimationFrame(() => { $bar.addClass('npdi-bar-on'); });
  }

  /* =======================
     Auto parent date (L1/L2)
  ======================= */
  function npdiUpdateParentDates(){
    const rows = npdiRowsInOrder();
    const agg = {};
    const stack12 = [];
    let activeL3 = null;

    function addToParents(sd, ed){
      for(const p of stack12){
        if(!agg[p.id]) agg[p.id] = { minS:null, maxE:null };
        const a = agg[p.id];
        if(!a.minS || sd < a.minS) a.minS = sd;
        if(!a.maxE || ed > a.maxE) a.maxE = ed;
      }
    }

    for(let i=0; i<rows.length; i++){
      const $r = rows[i];
      const id  = $r.data('id');
      const lvl = parseInt($r.attr('data-lvl'),10) || 1;

      while(stack12.length && stack12[stack12.length-1].lvl >= lvl){
        stack12.pop();
      }

      if(lvl <= 2){
        activeL3 = null;
        stack12.push({ id, lvl });
        if(!agg[id]) agg[id] = { minS:null, maxE:null };
        continue;
      }

      const s = $r.find('.npdi-inp-start').val().trim();
      const e = $r.find('.npdi-inp-end').val().trim();
      const sd = npdiParseYMD(s);
      const ed = npdiParseYMD(e);
      if(!(sd && ed && ed >= sd)){
        if(lvl === 3) activeL3 = null;
        continue;
      }

      if(lvl === 3){
        activeL3 = { row:$r, sd, ed };
        addToParents(sd, ed);
        continue;
      }

      if(lvl === 4){
        addToParents(sd, ed);

        if(activeL3){
          if(ed > activeL3.ed){
            activeL3.ed = ed;
            activeL3.row.find('.npdi-inp-end').val(npdiFmtYMD(ed));
          }
          addToParents(activeL3.sd, activeL3.ed);
        }
      }
    }

    rows.forEach($r=>{
      const lvl = parseInt($r.attr('data-lvl'),10) || 1;
      if(lvl > 2) return;
      const id = $r.data('id');
      const a = agg[id];
      if(!a || !a.minS || !a.maxE) return;

      $r.find('.npdi-inp-start').val(npdiFmtYMD(a.minS));
      $r.find('.npdi-inp-end').val(npdiFmtYMD(a.maxE));
    });
  }

  /* =======================
     Refresh All
  ======================= */
  function npdiRefreshAll(){
    $('.npdi-gantt-row').each(function(){ npdiApplyLevel($(this)); });

    npdiUpdateParentDates();
    npdiRenderHeader();

    $('.npdi-gantt-row').each(function(){
      npdiRefreshRow($(this).data('id'));
    });

    npdiApplyFoldVisibility();
    npdiSyncHeaderToScroll();
    npdiInitFormSelectOnly();
  }

  /* =======================
     Resource badge/counter
  ======================= */
  function npdiCountResources(val){
    if(!val) return 0;
    return val
      .split(/[,\n;]+/g)
      .map(s=>s.trim())
      .filter(Boolean).length;
  }

  function npdiUpdateResourceBadge($row){
    const val = $row.find('.npdi-inp-rsp').val() || '';
    const cnt = npdiCountResources(val);

    $row.find('.npdi-rsp-cnt').text(cnt);
    $row.find('.npdi-rsp-badge').toggleClass('has-resource', cnt > 0);
  }

  /* =======================
     Row HTML Template
  ======================= */
  function npdiCreateRowHtml(id, data){
    const lvl = data.lvl || 3;

    return `
      <div class="npdi-gantt-row" data-id="${id}" data-lvl="${lvl}">
        <div class="npdi-gantt-cell dg">
          <span class="npdi-dnd-handle" title="Drag">⋮⋮</span>
        </div>

        <div class="npdi-gantt-cell lvl">
          <select class="npdi-inp-lvl">
            <option value="1">L1</option>
            <option value="2">L2</option>
            <option value="3">L3</option>
            <option value="4">L4</option>
          </select>
        </div>

        <div class="npdi-gantt-cell task">
          <div class="npdi-task-wrap">
            <span class="npdi-fold"></span>
            <div class="npdi-task-indent aniInput">
              <input class="browser-default npdi-inp-task" value="${data.task||''}" placeholder="Task name">
              <span class="focus-border"></span>
            </div>
          </div>
        </div>

        <div class="npdi-gantt-cell start aniInput">
          <input class="browser-default npdi-inp-start" value="${data.start||''}" placeholder="YYYY-MM-DD">
          <span class="focus-border"></span>
        </div>

        <div class="npdi-gantt-cell end aniInput">
          <input class="browser-default npdi-inp-end" value="${data.end||''}" placeholder="YYYY-MM-DD">
          <span class="focus-border"></span>
        </div>

        <div class="npdi-gantt-cell rsp">
          <span class="npdi-rsp-badge" title="Edit resources">
            <span class="npdi-rsp-ico"><i class="material-symbols-outlined">people</i></span>
            <span class="npdi-rsp-cnt">0</span>
          </span>

          <div class="npdi-rsp-edit aniInput">
            <input class="browser-default npdi-inp-rsp" value="${data.rsp||''}" placeholder="e.g., Alice, Bob, Charlie" tabindex="0">
            <span class="focus-border"></span>
          </div>
        </div>

        <div class="npdi-gantt-cell act">
          <span class="npdi-gantt-del" title="Delete"><i class="material-symbols-outlined">close</i></span>
        </div>
      </div>
    `;
  }

  /* =======================
     Data Load (JSON -> UI)
     - 초기 로딩/전체 교체용
  ======================= */
  function npdiLoadRows(list = []){
    const rowsHtml = [];
    const barsHtml = [];

    list.forEach(data=>{
      const id = 'npdi-' + (NPDI.seq++);
      rowsHtml.push(npdiCreateRowHtml(id, data));
      barsHtml.push(`<div class="npdi-gantt-bar-row" data-id="${id}"></div>`);
    });

    $('#npdi-gantt-rows').empty().append(rowsHtml.join(''));
    $('#npdi-gantt-bars').empty().append(barsHtml.join(''));

    // select value + badge 업데이트
    $('#npdi-gantt-rows .npdi-gantt-row').each(function(i){
      const lvl = String(list[i]?.lvl || 3);
      $(this).find('.npdi-inp-lvl').val(lvl);
      npdiUpdateResourceBadge($(this));
    });

    npdiRefreshAll();
  }

  /* =======================
     Single Add (UI)
     - Add Task 버튼용 (단건 추가)
  ======================= */
  function npdiAddRow(data = {}){
    const id = 'npdi-' + (NPDI.seq++);
    const html = npdiCreateRowHtml(id, data);

    $('#npdi-gantt-rows').append(html);
    $('#npdi-gantt-bars').append(`<div class="npdi-gantt-bar-row" data-id="${id}"></div>`);

    const $row = $(`.npdi-gantt-row[data-id="${id}"]`);
    $row.find('.npdi-inp-lvl').val(String(data.lvl || 3));
    npdiUpdateResourceBadge($row);

    // row add flash
    $row.addClass('npdi-row-new');
    setTimeout(()=> $row.removeClass('npdi-row-new'), 800);

    npdiRefreshAll();
    npdiScrollRowsToBottom();
  }

  function npdiScrollRowsToBottom(){
    const $rows = $('#npdi-gantt-rows');
    $rows.stop().animate({ scrollTop: $rows[0].scrollHeight }, 200);
  }

  function npdiRemoveRow(id){
    $(`.npdi-gantt-row[data-id="${id}"]`).remove();
    $(`.npdi-gantt-bar-row[data-id="${id}"]`).remove();
    NPDI.foldState.delete(id);
    npdiRefreshAll();
  }

  /* =======================
     Scroll Sync
  ======================= */
  function npdiBindScroll(){
    const $l = $('#npdi-gantt-rows');
    const $r = $('#npdi-gantt-right');
    let lock=false;

    $r.on('scroll.npdiScroll', ()=>{
      if(lock) return;
      lock=true;
      $l.scrollTop($r.scrollTop());
      npdiSyncHeaderToScroll();
      lock=false;
    });

    $l.on('scroll.npdiScroll', ()=>{
      if(lock) return;
      lock=true;
      $r.scrollTop($l.scrollTop());
      lock=false;
    });
  }

  /* =======================
     Drag reorder (sortable)
  ======================= */
  function npdiInitRowDnD(){
    $('#npdi-gantt-rows').sortable({
      axis:'y',
      tolerance:'pointer',
      handle:'.npdi-dnd-handle',
      helper:function(e, item){
        const $h = item.clone();
        $h.width(item.width());
        return $h;
      },
      stop:function(){
        const order = $('#npdi-gantt-rows .npdi-gantt-row').map(function(){
          return $(this).data('id');
        }).get();

        const $bars = $('#npdi-gantt-bars');
        order.forEach(id => $bars.append($bars.find(`.npdi-gantt-bar-row[data-id="${id}"]`)));

        npdiRefreshAll();
      }
    });

    $('#npdi-gantt-rows').on('mousedown.npdiDnD', 'input,select,textarea', function(e){
      e.stopPropagation();
    });
  }

  /* =======================
     Materialize: FormSelect only
  ======================= */
  function npdiInitFormSelectOnly(){
    document.querySelectorAll('.npdi-inp-lvl').forEach(el=>{
      if (M.FormSelect.getInstance(el)) return;
      M.FormSelect.init(el);
    });
  }

  /* =======================
     Resource UX
  ======================= */
  function npdiBindResourceUX(){
    $('#npdi-rsp-toggle').off('click.npdiRsp').on('click.npdiRsp', ()=> npdiToggleResourceExpanded());

    $('#npdi-gantt-rows')
      .off('click.npdiRsp', '.npdi-rsp-badge')
      .on('click.npdiRsp', '.npdi-rsp-badge', function(){
        npdiSetResourceExpanded(true);
        const $row = $(this).closest('.npdi-gantt-row');
        setTimeout(()=> $row.find('.npdi-inp-rsp').focus(), 0);
      });

    $('#npdi-gantt-rows')
      .off('input.npdiRspCnt change.npdiRspCnt', '.npdi-inp-rsp')
      .on('input.npdiRspCnt change.npdiRspCnt', '.npdi-inp-rsp', function(){
        npdiUpdateResourceBadge($(this).closest('.npdi-gantt-row'));
      });

    document.addEventListener('pointerdown', (e)=>{
      if(!NPDI.resExpanded) return;

      const isResourceInput = !!e.target.closest('.npdi-inp-rsp');
      const isBadge = !!e.target.closest('.npdi-rsp-badge');
      const isToggle = (e.target.id === 'npdi-rsp-toggle') || !!e.target.closest('#npdi-rsp-toggle');

      if(isResourceInput || isBadge || isToggle) return;
      npdiSetResourceExpanded(false);
    }, true);

    $('#npdi-gantt-rows')
      .off('focusout.npdiRspKb', '.npdi-inp-rsp')
      .on('focusout.npdiRspKb', '.npdi-inp-rsp', function(){
        if(!NPDI.resExpanded) return;

        setTimeout(()=>{
          if(!NPDI.resExpanded) return;
          const ae = document.activeElement;
          const stillOnResourceInput = ae && ae.classList && ae.classList.contains('npdi-inp-rsp');
          if(!stillOnResourceInput) npdiSetResourceExpanded(false);
        }, 0);
      });

    $('#npdi-gantt-rows')
      .off('keydown.npdiRspEsc', '.npdi-inp-rsp')
      .on('keydown.npdiRspEsc', '.npdi-inp-rsp', function(e){
        if(e.key === 'Escape'){
          npdiSetResourceExpanded(false);
          this.blur();
        }
      });
  }

  /* =======================
     Tooltip
  ======================= */
  function npdiFormatResourceTooltip(val){
    const items = (val || '')
      .split(/[,\n;]+/g)
      .map(s => s.trim())
      .filter(Boolean);

    if(items.length === 0){
      return `<div class="ttl">Resources Names</div><div class="list">No resources</div>`;
    }

    const max = 14;
    const sliced = items.slice(0, max);
    const more = items.length > max ? `<div style="margin-top:6px;opacity:.8">+${items.length-max} more…</div>` : '';

    return `
      <div class="ttl">Resources Names (${items.length})</div>
      <div class="list">${sliced.map(n => `• ${npdiEscapeHtml(n)}`).join('<br>')}</div>
      ${more}
    `;
  }

  function npdiBindResourceHoverTooltip(){
    let tip = document.getElementById('npdi-rsp-tooltip');
    if(!tip){
      tip = document.createElement('div');
      tip.id = 'npdi-rsp-tooltip';
      document.body.appendChild(tip);
    }

    let hoverEl = null;
    let hideTimer = null;

    function hide(immediate){
      if(immediate){
        clearTimeout(hideTimer);
        hideTimer = null;
        hoverEl = null;
        tip.classList.remove('is-on');
        return;
      }
      hideTimer = setTimeout(function(){
        hoverEl = null;
        tip.classList.remove('is-on');
        hideTimer = null;
      }, 80);
    }

    function place(target){
      if(!target) return;

      const rect = target.getBoundingClientRect();
      const pad = 8;

      tip.classList.add('is-on');

      const tw = tip.offsetWidth;
      const th = tip.offsetHeight;

      let left = rect.left + rect.width/2 - tw/2;
      let top  = rect.bottom + pad;

      left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
      if(top + th > window.innerHeight - 8){
        top = rect.top - th - pad;
      }
      top = Math.max(8, top);

      tip.style.left = `${left}px`;
      tip.style.top  = `${top}px`;
    }

    $('#npdi-gantt-rows')
      .off('mouseenter.npdiRspTip', '.npdi-rsp-badge')
      .on('mouseenter.npdiRspTip', '.npdi-rsp-badge', function(){
        if(NPDI.resExpanded) return;
        clearTimeout(hideTimer);
        hideTimer = null;
        hoverEl = this;

        const $row = $(this).closest('.npdi-gantt-row');
        const val = $row.find('.npdi-inp-rsp').val() || '';
        tip.innerHTML = npdiFormatResourceTooltip(val);

        place(this);
      })
      .off('mousemove.npdiRspTip', '.npdi-rsp-badge')
      .on('mousemove.npdiRspTip', '.npdi-rsp-badge', function(){
        if(hoverEl !== this) return;
        place(this);
      })
      .off('mouseleave.npdiRspTip', '.npdi-rsp-badge')
      .on('mouseleave.npdiRspTip', '.npdi-rsp-badge', function(){
        hide();
      });

    window.addEventListener('resize', function(){ hide(true); });
    document.addEventListener('scroll', function(){ hide(true); }, true);
    document.addEventListener('pointerdown', function(){ hide(true); }, true);
  }

  /* =======================
     Init
  ======================= */
  $(function(){
    // JS/CSS 셀 폭 동기화 (CSS가 source of truth)
    NPDI.cellW = npdiReadCssPxVar('--npdi-cell-w', NPDI.cellW);

    npdiBindScroll();
    npdiInitRowDnD();
    npdiBindResourceUX();
    npdiBindResourceHoverTooltip();

    // ✅ 초기 데이터는 JSON 배열로 한 번에 로딩
    // (여기는 실제 프로그램에서는 서버 응답으로 교체하면 됨)
    const initialData = [
      { task:'NPC', start:'2025-11-21', end:'2025-12-19', lvl:1, rsp:'' },
      { task:'Basic Data & Concept Overview', start:'2025-11-21', end:'2025-12-04', lvl:2, rsp:'' },
      { task:'DFV Rating', start:'2025-12-05', end:'2025-12-11', lvl:2, rsp:'Jongho Lee' },
      { task:'NPC Review', start:'2025-12-12', end:'2025-12-19', lvl:2, rsp:'' },

      { task:'NPI GO', start:'2025-12-22', end:'2026-07-10', lvl:1, rsp:'' },
      { task:'Project Overview', start:'2025-12-22', end:'2026-02-20', lvl:2, rsp:'' },
      { task:'Update Basic Data', start:'2025-12-22', end:'2025-12-26', lvl:3, rsp:'Jongho Lee, JP' },
      { task:'Initial Project Schedule', start:'2025-12-29', end:'2026-01-09', lvl:3, rsp:'JP' },
      { task:'Select Project Team & Stakeholders', start:'2026-01-12', end:'2026-01-23', lvl:4, rsp:'Jongho Lee' },
      { task:'Initial Project Financials', start:'2026-01-26', end:'2026-02-20', lvl:4, rsp:'Jongho Lee' },
      { task:'Functional Deliverables', start:'2026-02-23', end:'2026-07-10', lvl:2, rsp:'' },
      { task:'NPI GO Review', start:'2025-12-22', end:'2025-12-29', lvl:3, rsp:'' },

      { task:'LAB FORMULATION', start:'2026-07-13', end:'2026-12-24', lvl:1, rsp:'' },
      { task:'Update Project Overview Section', start:'2026-07-13', end:'2026-07-24', lvl:2, rsp:'' },
      { task:'Update Functional Deliverables', start:'2026-07-27', end:'2026-12-24', lvl:2, rsp:'' },
      { task:'LAB FORM. Review', start:'2026-07-13', end:'2026-07-17', lvl:2, rsp:'' },

      { task:'SCALE-UP', start:'2026-12-07', end:'2027-06-11', lvl:1, rsp:'' },
      { task:'Update Project Overview Section', start:'2026-12-07', end:'2026-12-18', lvl:2, rsp:'Jongho Lee, JP' },
      { task:'Update Functional Deliverables', start:'2026-12-07', end:'2027-04-02', lvl:2, rsp:'' },
      { task:'SCALE-UP Review', start:'2027-06-07', end:'2027-06-11', lvl:2, rsp:'' },

      { task:'COMMERCIAL GO', start:'2027-06-14', end:'2027-12-24', lvl:1, rsp:'' },
      { task:'Update Project Overview Section', start:'2027-06-14', end:'2027-06-25', lvl:2, rsp:'' },
      { task:'Update Functional Deliverables', start:'2027-06-28', end:'2027-12-24', lvl:2, rsp:'' },
      { task:'COMM GO Review', start:'2027-06-14', end:'2027-06-18', lvl:2, rsp:'' },

      { task:'POST LAUNCH REVIEW', start:'2027-12-27', end:'2028-12-08', lvl:1, rsp:'' },
      { task:'Performance Review', start:'2027-12-27', end:'2028-01-24', lvl:2, rsp:'' },
      { task:'Quality & Capability Review', start:'2027-12-27', end:'2028-01-07', lvl:3, rsp:'Jongho Lee, JP' },
      { task:'Financials Review (Plan vs Actual)', start:'2028-01-10', end:'2028-01-21', lvl:3, rsp:'Jongho Lee' },
      { task:'Project Learnings Capture', start:'2028-01-24', end:'2028-02-04', lvl:3, rsp:'Jongho Lee' },
      { task:'Stake Holder Review and Sign Off', start:'2028-11-13', end:'2028-12-08', lvl:2, rsp:'' }
    ];

    npdiLoadRows(initialData);

    // Add Task 버튼은 단건 추가
    $('#npdi-gantt-add').on('click.npdiAdd', ()=> npdiAddRow({ lvl:3 }));

    // 입력/삭제/폴드 이벤트
    $('#npdi-gantt-rows')
      .on('change.npdiInp', '.npdi-inp-task, .npdi-inp-start, .npdi-inp-end', function(){
        npdiRefreshAll();
      })
      .on('change.npdiLvl', '.npdi-inp-lvl', function(){
        npdiRefreshAll();
      })
      .on('click.npdiDel', '.npdi-gantt-del', function(){
        npdiRemoveRow($(this).closest('.npdi-gantt-row').data('id'));
      })
      .on('click.npdiFold', '.npdi-fold', function(){
        const $row = $(this).closest('.npdi-gantt-row');
        const id = $row.data('id');
        if($(this).hasClass('npdi-fold-disabled')) return;

        const nextFold = !npdiIsFolded(id);
        npdiSetFold(id, nextFold);
        $(this).text(nextFold ? '▶' : '▼');
        npdiAnimateFold(id, nextFold);
      })
      .off('mousedown.npdiAutoDate', '.npdi-auto-date')
      .on('mousedown.npdiAutoDate', '.npdi-auto-date', function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        this.blur();
        M.toast({
          html: "Dates are automatically calculated based on Level 3 and Level 4 task dates.",
          displayLength : 1500
        });
        return false;
      });
  });

})();
