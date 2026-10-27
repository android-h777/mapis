/* ── 검색조건 저장(공용 부품) — 이름 붙여 이력 누적(localStorage), 칩 클릭=폼 불러오기, x=삭제.
   opts: { key(저장 키), area(컨테이너 셀렉터), collect(현재 폼→객체), apply(객체→폼) }
   UI 클래스(dashSave*)는 mpm_common.css 공용 스타일 사용. 의존: jQuery, glassToast(glass_engine.js, 없으면 토스트 생략)
   운영: origin/dev js/common/_savedSearch.js(SavedSearch.init, 서버 저장 TS09_SAVED_SEARCH) — 운영 표준은 apis_util 로 옮길 예정 */
window.initSavedSearch = function(opts){
  var $area = $(opts.area);
  if(!$area.length) return;
  $area.html('<div class="dashSaveTit"><i class="material-icons">bookmark</i>Saved Searches</div>'
    + '<div class="dashSaveList"></div>'
    + '<div class="dashSaveNew"><input type="text" class="browser-default jsSaveName" placeholder="Name this search&hellip;" maxlength="30">'
    + '<a href="javascript:;" class="waves-effect hBtn jsSaveAdd"><i class="material-icons left">add</i><span class="label">Save</span></a></div>');
  function all(){ try{ return JSON.parse(localStorage.getItem(opts.key)||'[]'); }catch(e){ return []; } }
  // 저장 공간이 꽉 찼거나 막힌 브라우저(사생활 보호 창 등)에서도 화면이 멈추지 않게
  function store(l){ try{ localStorage.setItem(opts.key, JSON.stringify(l)); return true; }catch(e){ if(window.glassToast) glassToast('Could not save searches in this browser.', 'info'); return false; } }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  var activeName = null;   // 불러온(선택된) 저장 건 — 무명 Save 시 이 건을 갱신
  function render(){
    var list = all();
    $area.find('.dashSaveList').html(list.length ? list.map(function(x){
      var d = /^\d{4}-\d{2}-\d{2}$/.test(x.date||'') ? x.date.slice(5)+'-'+x.date.slice(0,4) : (x.date||'');   // 저장은 ISO, 표시는 MM-DD-YYYY
      return '<span class="dashSaveChip'+(x.name===activeName?' on':'')+'" data-name="'+esc(x.name)+'" data-tip="Saved '+esc(d)+'"><i class="material-icons">history</i>'+esc(x.name)
           + '<i class="material-icons jsSaveDel" data-name="'+esc(x.name)+'">close</i></span>';
    }).join('') : '<span class="dashSaveEmpty">No saved searches yet. Set options and save with a name.</span>');
  }
  $area.on('click', '.jsSaveAdd', function(){
    var name = $.trim($area.find('.jsSaveName').val()).replace(/[<>"']/g, '');
    if(!name){ if(window.glassToast) glassToast('Enter a name for this search.', 'info'); $area.find('.jsSaveName').focus(); return; }
    var existed = all().some(function(x){ return x.name === name; });
    var list = all().filter(function(x){ return x.name !== name; });   // 동명 = 갱신(덮어쓰기)
    list.push({ name:name, crit:opts.collect(), date:new Date().toISOString().slice(0,10) });
    if(!store(list)) return;
    activeName = name;   // 저장 건 선택 상태 + 이름 유지 — 계속 수정하면 갱신, 이름 바꾸면 신규
    render();
    if(window.glassToast) glassToast((existed ? 'Updated "' : 'Search saved: "')+name+'"', 'ok');
  });
  $area.on('click', '.dashSaveChip', function(e){
    if($(e.target).hasClass('jsSaveDel')) return;
    var name = $(this).attr('data-name');
    var it = all().filter(function(x){ return x.name===name; })[0];
    if(it){
      opts.apply(it.crit);
      activeName = name;
      $area.find('.jsSaveName').val(name);   // 저장 타이틀 자동 입력 — 그대로 Save=갱신, 수정 후 Save=신규
      render();
      if(window.glassToast) glassToast('Loaded "'+name+'". Press Search to apply.', 'info');
    }
  });
  $area.on('click', '.jsSaveDel', function(e){
    e.stopPropagation();
    var name = $(this).attr('data-name');
    store(all().filter(function(x){ return x.name !== name; }));
    if(name === activeName){ activeName = null; if($.trim($area.find('.jsSaveName').val()) === name) $area.find('.jsSaveName').val(''); }
    render();
    if(window.glassToast) glassToast('Deleted "'+name+'"', 'info');
  });
  render();
};
