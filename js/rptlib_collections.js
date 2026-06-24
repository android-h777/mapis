	/* ════════════════════════════════════════════════════════════
	   Technical Report Hub — "Bookmarks" (My Report 세그먼트 B): 개인 폴더 트리 + 문서 참조(하이브리드).
	   브라우저 북마크 멘탈모델 — 폴더로 정리, 한 문서는 여러 폴더에 참조(복사 아님). "탐색기처럼 빨리 찾기".
	   저장 = localStorage('rlBookmarks')(프로토타입). 실구현: 서버 개인 컬렉션 + au.ajaxGet2/ajaxPost.
	   문서 카드 = docs.js repCard 양식(.rlRepCard) 재사용 · 열기 = 공통 rlOpenPop(Documents와 동일 창 재사용).
	   공개 진입점 = renderBookmarks()(전역) — rptlib_mine.js 세그먼트 토글이 호출.
	   ════════════════════════════════════════════════════════════ */
	var BM_KEY='rlBookmarks';
	function bmDefault(){   // 첫 로드 시드 — 하이브리드 시연(KR-22-03이 두 폴더에 참조됨)
		return { folders:[
			{id:'f1', name:'Active Projects',         parent:null},
			{id:'f2', name:'OLED Encapsulation',      parent:'f1'},
			{id:'f3', name:'Competitor & Reference',  parent:null},
			{id:'f4', name:'Read later',              parent:null}
		], items:[
			{fid:'f2',code:'KR-23-11'},{fid:'f2',code:'KR-22-03'},{fid:'f2',code:'JPN-15-04'},
			{fid:'f1',code:'KR-22-03'},{fid:'f1',code:'LEV-24-02'},
			{fid:'f3',code:'ITC-12-13'},{fid:'f3',code:'SV-19-10'},
			{fid:'f4',code:'TT-12-16'},{fid:'f4',code:'WTC-11-29'}
		] };
	}
	var bmState=null, bmCur='__all', bmOpen={}, bmRenaming=null, bmAdding=false;
	var bmDragCode=null, bmDragFolder=null;
	var bmPickOpen=false, bmPickQ='', bmPickSel={};

	/* ── 영속 레이어(localStorage 미러) ── */
	function bmLoad(){ try{ var s=localStorage.getItem(BM_KEY); bmState=s?JSON.parse(s):bmDefault(); }catch(e){ bmState=bmDefault(); }
		if(!bmState||!bmState.folders||!bmState.items) bmState=bmDefault(); }
	function bmSave(){ try{ localStorage.setItem(BM_KEY, JSON.stringify(bmState)); }catch(e){} }
	function bmUid(){ return 'f'+(bmState.folders.reduce(function(m,f){ var n=+String(f.id).replace(/\D/g,''); return n>m?n:m; },0)+1); }

	/* ── 질의 헬퍼 ── */
	function repByCode(c){ return (typeof REPORTS!=='undefined') ? (REPORTS.filter(function(r){return r.code===c;})[0]||null) : null; }
	function bmFolder(id){ return bmState.folders.filter(function(f){return f.id===id;})[0]; }
	function bmChildren(pid){ return bmState.folders.filter(function(f){return f.parent===pid;}); }
	function bmItems(fid){ return bmState.items.filter(function(it){return it.fid===fid;}).map(function(it){return it.code;}); }
	function bmAllCodes(){ var seen={},out=[]; bmState.items.forEach(function(it){ if(!seen[it.code]){ seen[it.code]=1; out.push(it.code); } }); return out; }
	function bmCount(fid){ var n=bmItems(fid).length; bmChildren(fid).forEach(function(c){ n+=bmCount(c.id); }); return n; }   // 하위 폴더 포함
	function bmHasItem(fid,code){ return bmState.items.some(function(it){return it.fid===fid&&it.code===code;}); }
	function bmInCount(code){ return bmState.folders.filter(function(f){return bmHasItem(f.id,code);}).length; }

	/* ── 변형(mutation) — 전부 즉시 저장 ── */
	function bmAddItem(fid,code){ if(!fid||fid==='__all'||!code||bmHasItem(fid,code)) return false; bmState.items.push({fid:fid,code:code}); bmSave(); return true; }
	function bmRemoveItem(fid,code){ bmState.items=bmState.items.filter(function(it){return !(it.fid===fid&&it.code===code);}); bmSave(); }
	function bmRemoveAll(code){ bmState.items=bmState.items.filter(function(it){return it.code!==code;}); bmSave(); }
	function bmNewFolder(name,parent){ var id=bmUid(); bmState.folders.push({id:id,name:(name||'New folder'),parent:parent||null}); bmSave(); return id; }
	function bmRenameFolder(id,name){ var f=bmFolder(id); if(f && (name||'').trim()){ f.name=name.trim(); bmSave(); } }
	function bmIsAncestor(anc,id){ var f=bmFolder(id); while(f){ if(f.id===anc) return true; f=f.parent?bmFolder(f.parent):null; } return false; }
	function bmDeleteFolder(id){ var f=bmFolder(id); if(!f) return; var par=f.parent;
		bmChildren(id).forEach(function(c){ c.parent=par; });                  // 자식은 조부모로 승격(고아 방지)
		bmState.folders=bmState.folders.filter(function(x){return x.id!==id;});
		bmState.items=bmState.items.filter(function(it){return it.fid!==id;}); // 이 폴더의 참조만 제거(다른 폴더의 같은 문서는 유지)
		bmSave(); }
	function bmMoveFolder(id,np){ if(id===np) return; if(np && bmIsAncestor(id,np)) return; var f=bmFolder(id); if(!f) return; f.parent=np||null;
		var arr=bmState.folders; arr.splice(arr.indexOf(f),1); arr.push(f); bmSave(); }   // nest = 대상의 마지막 자식으로
	/* 형제 재정렬(사이에 끼우기) — 대상과 같은 부모로 옮기고 배열에서 before/after 위치에 삽입 */
	function bmReorderFolder(dragId, targetId, after){
		if(dragId===targetId) return; var d=bmFolder(dragId), t=bmFolder(targetId); if(!d||!t) return;
		if(bmIsAncestor(dragId, targetId)) return;   // 자기 하위로는 못 감
		d.parent = t.parent;                          // 대상과 동일 레벨
		var arr=bmState.folders; arr.splice(arr.indexOf(d),1);
		var ti=arr.indexOf(t); arr.splice(after?ti+1:ti, 0, d); bmSave();
	}

	/* ── 트리 렌더(재귀) ── */
	function bmTreeRow(f,depth){
		var kids=bmChildren(f.id), open=bmOpen[f.id]!==false, sel=(bmCur===f.id);
		var caret = kids.length ? '<i class="bmCaret material-symbols-outlined" data-caret="'+f.id+'">'+(open?'expand_more':'chevron_right')+'</i>' : '<i class="bmCaret empty"></i>';
		var nameHtml = (bmRenaming===f.id)
			? '<input class="bmRenameIn" data-renamein="'+f.id+'" value="'+esc(f.name)+'" autocomplete="off"/>'
			: '<span class="bmFName">'+esc(f.name)+'</span>';
		var row='<div class="bmFolder'+(sel?' on':'')+'" data-fid="'+f.id+'" draggable="true" style="padding-left:'+(8+depth*15)+'px">'+
			caret+'<i class="bmFIcon material-symbols-outlined">'+(sel?'folder_open':'folder')+'</i>'+nameHtml+
			'<span class="bmFCount">'+bmCount(f.id)+'</span>'+
			'<span class="bmFActs">'+
				'<a class="bmAct" data-newsub="'+f.id+'" title="New subfolder"><i class="material-symbols-outlined">create_new_folder</i></a>'+
				'<a class="bmAct" data-rename="'+f.id+'" title="Rename"><i class="material-symbols-outlined">edit</i></a>'+
				'<a class="bmAct" data-del="'+f.id+'" title="Delete"><i class="material-symbols-outlined">delete</i></a>'+
			'</span></div>';
		if(kids.length && open) row+=kids.map(function(k){return bmTreeRow(k,depth+1);}).join('');
		return row;
	}
	function bmTreeHtml(){
		var all='<div class="bmFolder bmAll'+(bmCur==='__all'?' on':'')+'" data-fid="__all"><i class="bmCaret empty"></i>'+
			'<i class="bmFIcon material-symbols-outlined">bookmarks</i><span class="bmFName">All bookmarks</span>'+
			'<span class="bmFCount">'+bmAllCodes().length+'</span></div>';
		var tree=bmChildren(null).map(function(f){return bmTreeRow(f,0);}).join('');
		var adding=bmAdding ? '<div class="bmFolder bmNewRow" style="padding-left:8px"><i class="bmCaret empty"></i><i class="bmFIcon material-symbols-outlined">create_new_folder</i><input class="bmRenameIn" id="bmNewIn" placeholder="Folder name…" autocomplete="off"/></div>' : '';
		return all+tree+adding;
	}

	/* ── 문서 카드(참조) — repCard 양식 재사용 + 제거 버튼 + 다중소속 표시 ── */
	function bmCardHtml(code, fid){
		var r=repByCode(code);
		if(!r) return '<div class="rlRepCard bmCard missing"><div class="rcTitle">'+esc(code)+'</div><div class="rcMeta">Not available in this index</div></div>';
		var rm = (fid&&fid!=='__all')
			? '<a class="bmRm" data-rm="'+esc(code)+'" data-rmfid="'+esc(fid)+'" title="Remove from this folder"><i class="material-symbols-outlined">close</i></a>'
			: '<a class="bmRm" data-rmall="'+esc(code)+'" title="Remove from all bookmarks"><i class="material-symbols-outlined">close</i></a>';
		var n=bmInCount(code), multi = n>1 ? '<span class="bmMulti" title="Filed in '+n+' folders"><i class="material-symbols-outlined">collections_bookmark</i>'+n+'</span>' : '';
		return '<div class="rlRepCard glassHover bmCard" data-open="'+esc(code)+'" data-code="'+esc(code)+'" draggable="true">'+rm+
			'<div class="rcTop"><span class="rcType">'+esc(r.type)+'</span>'+(typeof classBadge==='function'?classBadge(r.cls):'')+'</div>'+
			'<div class="rcTitle">'+esc(r.title)+'</div>'+
			'<div class="rcMeta"><span class="code">'+esc(r.code)+'</span><span class="dot">·</span>'+esc(r.author)+'</div>'+
			'<div class="rcFoot"><span class="rcSite"><i class="material-symbols-outlined">public</i>'+esc(idxName(r.idx))+'</span>'+multi+
				'<span style="margin-left:auto;font-size:11px;color:#bcae9d;">'+esc(r.date)+'</span></div>'+
		'</div>';
	}

	/* ── 문서 추가 피커(모달 오버레이) — 라이브러리 검색 + 멀티선택 ── */
	function bmPickerHtml(){
		if(!bmPickOpen) return '';
		var f=bmFolder(bmCur), q=bmPickQ.toLowerCase();
		var src=(typeof REPORTS!=='undefined')?REPORTS:[];
		var list=src.filter(function(r){ return !q || (r.title+' '+r.code+' '+r.author+' '+r.bu).toLowerCase().indexOf(q)>=0; }).slice(0,40);
		var rows=list.map(function(r){
			var already=bmHasItem(bmCur,r.code), checked=already||!!bmPickSel[r.code];
			return '<label class="bmPickRow'+(already?' already':'')+'"><input type="checkbox" class="filled-in" data-pick="'+esc(r.code)+'"'+(checked?' checked':'')+(already?' disabled':'')+'/><span></span>'+
				'<div class="bmPickMain"><div class="bmPickT">'+esc(r.title)+'</div><div class="bmPickS"><span class="code">'+esc(r.code)+'</span> · '+esc(r.author)+' · '+esc(r.bu)+'</div></div>'+
				(typeof classBadge==='function'?classBadge(r.cls):'')+(already?'<span class="bmPickIn">in folder</span>':'')+'</label>';
		}).join('');
		var nsel=Object.keys(bmPickSel).filter(function(c){return bmPickSel[c]&&!bmHasItem(bmCur,c);}).length;
		return '<div class="bmPickerWrap" data-pickwrap="1"><div class="bmPicker">'+
			'<div class="bmPickHead"><div><div class="bmPickTit">Add documents to “'+esc(f?f.name:'')+'”</div>'+
				'<div class="bmPickSub">Search the library and pick reports to file here — references, not copies.</div></div>'+
				'<a class="bmPickX" data-pickclose="1"><i class="material-symbols-outlined">close</i></a></div>'+
			'<div class="bmPickSearch"><i class="material-symbols-outlined">search</i><input type="text" id="bmPickInput" placeholder="Search title, code, author, BU…" value="'+esc(bmPickQ)+'" autocomplete="off"></div>'+
			'<div class="bmPickList hScroll">'+(rows||'<div class="rvEmpty"><i class="material-symbols-outlined">search_off</i>No matches.</div>')+'</div>'+
			'<div class="bmPickFoot"><span class="bmPickCnt"><b>'+nsel+'</b> selected</span>'+
				'<a href="javascript:;" class="waves-effect waves-light hBtn hViva bmPickAdd'+(nsel?'':' disabled')+'" data-pickadd="1"><span class="material-symbols-outlined left">add</span><span class="label">Add '+nsel+' to folder</span></a></div>'+
		'</div></div>';
	}

	/* ── 메인 렌더(2-pane) ── */
	function renderBookmarks(){
		if(!bmState) bmLoad();
		var el=document.getElementById('mineBookmarks'); if(!el) return;
		var isAll=(bmCur==='__all'), f=isAll?null:bmFolder(bmCur);
		if(!isAll && !f){ bmCur='__all'; isAll=true; }
		var codes=isAll?bmAllCodes():bmItems(bmCur);
		var headName=isAll?'All bookmarks':esc(f.name);
		var acts=isAll ? '' :
			'<a href="javascript:;" class="waves-effect waves-light hBtn hViva bmAddBtn" data-add="1"><span class="material-symbols-outlined left">add</span><span class="label">Add documents</span></a>';
		var cards=codes.length ? codes.map(function(c){return bmCardHtml(c,bmCur);}).join('')
			: '<div class="rvEmpty"><i class="material-symbols-outlined">'+(isAll?'bookmark_border':'folder_open')+'</i>'+
				(isAll?'No bookmarks yet — open a report and bookmark it, or create a folder and add documents.':'This folder is empty — use “Add documents”, or drag a report here.')+'</div>';
		el.innerHTML='<div class="bmWrap">'+
			'<aside class="bmTree">'+
				'<div class="bmTreeHead"><span>Folders</span><a href="javascript:;" class="bmTextBtn" data-newroot="1"><i class="material-symbols-outlined">add</i>Folder</a></div>'+
				'<div class="bmTreeList">'+bmTreeHtml()+'</div>'+
				'<div class="bmTreeHint"><i class="material-symbols-outlined">drag_indicator</i>Drag a report onto a folder to file it — one report can live in several folders.</div>'+
			'</aside>'+
			'<section class="bmContent">'+
				'<div class="bmContHead"><div class="bmContTit"><i class="material-symbols-outlined">'+(isAll?'bookmarks':'folder_open')+'</i>'+headName+'<span class="bmContN">'+codes.length+'</span></div>'+
					'<div class="bmContActs">'+acts+'</div></div>'+
				'<div class="bmCards hScroll">'+cards+'</div>'+
			'</section>'+
		'</div>'+bmPickerHtml();
		if(bmAdding){ var ni=document.getElementById('bmNewIn'); if(ni){ ni.focus(); } }
		if(bmRenaming){ var ri=el.querySelector('[data-renamein="'+bmRenaming+'"]'); if(ri){ ri.focus(); ri.select(); } }
		if(bmPickOpen){ var pi=document.getElementById('bmPickInput'); if(pi){ var v=pi.value; pi.focus(); pi.value=''; pi.value=v; } }
	}

	$(document).ready(function(){
		bmLoad();
		if(bmState.folders && bmState.folders.length) bmCur=bmState.folders[0].id;   // 첫 진입=첫 폴더(Add documents 바로 노출, All은 트리에서 선택)
		var root=document.getElementById('mineBookmarks'); if(!root) return;

		root.addEventListener('click', function(e){
			// 제거 버튼(카드 열기보다 먼저)
			var rm=e.target.closest('[data-rm]'); if(rm){ e.stopPropagation(); bmRemoveItem(rm.getAttribute('data-rm'), rm.getAttribute('data-rmfid')); renderBookmarks(); return; }
			var rmall=e.target.closest('[data-rmall]'); if(rmall){ e.stopPropagation(); if(window.confirm('Remove this report from all your bookmark folders?')){ bmRemoveAll(rmall.getAttribute('data-rmall')); renderBookmarks(); } return; }
			// 피커
			if(e.target.closest('[data-pickclose]')){ bmPickOpen=false; bmPickSel={}; renderBookmarks(); return; }
			if(e.target.closest('[data-pickadd]') && !e.target.closest('.disabled')){
				var added=0; Object.keys(bmPickSel).forEach(function(c){ if(bmPickSel[c] && bmAddItem(bmCur,c)) added++; });
				bmPickOpen=false; bmPickSel={}; renderBookmarks();
				if(added) toast('Added '+added+' report'+(added!==1?'s':'')+' to “'+(bmFolder(bmCur)||{}).name+'”.','ok'); return; }
			if(e.target.closest('.bmPicker')) return;                                   // 피커 내부 클릭은 통과(닫지 않음)
			if(e.target.closest('[data-pickwrap]')){ bmPickOpen=false; bmPickSel={}; renderBookmarks(); return; }   // 바깥(오버레이) 클릭 → 닫기
			if(e.target.closest('[data-add]')){ bmPickOpen=true; bmPickQ=''; bmPickSel={}; renderBookmarks(); return; }
			// 폴더 액션
			var nr=e.target.closest('[data-newroot]'); if(nr){ bmAdding=true; renderBookmarks(); return; }
			var ns=e.target.closest('[data-newsub]'); if(ns){ var pid=ns.getAttribute('data-newsub'); var nid=bmNewFolder('New folder',pid); bmOpen[pid]=true; bmCur=nid; bmRenaming=nid; renderBookmarks(); return; }
			var rn=e.target.closest('[data-rename]'); if(rn){ e.stopPropagation(); bmRenaming=rn.getAttribute('data-rename'); renderBookmarks(); return; }
			var dl=e.target.closest('[data-del]'); if(dl){ e.stopPropagation(); var did=dl.getAttribute('data-del'); var df=bmFolder(did);
				if(window.confirm('Delete folder “'+(df?df.name:'')+'”? Documents stay bookmarked in any other folders.')){ bmDeleteFolder(did); if(bmCur===did) bmCur='__all'; renderBookmarks(); } return; }
			var ca=e.target.closest('[data-caret]'); if(ca){ e.stopPropagation(); var cid=ca.getAttribute('data-caret'); bmOpen[cid]=(bmOpen[cid]===false); renderBookmarks(); return; }
			// 문서 카드 열기 = pop.html(Documents와 동일 창)
			var card=e.target.closest('.bmCard[data-open]'); if(card){ rlOpenPop(card.getAttribute('data-open')); return; }
			// 폴더 선택
			var fol=e.target.closest('.bmFolder[data-fid]'); if(fol){ if(e.target.closest('.bmRenameIn')) return; bmCur=fol.getAttribute('data-fid'); bmRenaming=null; bmAdding=false; renderBookmarks(); return; }
		});

		root.addEventListener('dblclick', function(e){ var nm=e.target.closest('.bmFName'); if(!nm) return; var fol=nm.closest('.bmFolder'); var fid=fol&&fol.getAttribute('data-fid'); if(fid&&fid!=='__all'){ bmRenaming=fid; renderBookmarks(); } });

		// 인라인 폴더명 입력: Enter 확정 / Esc 취소
		root.addEventListener('keydown', function(e){
			var ni=e.target.closest('#bmNewIn');
			if(ni){ if(e.key==='Enter'){ var nm=ni.value.trim(); if(nm){ var id=bmNewFolder(nm,null); bmCur=id; } bmAdding=false; renderBookmarks(); } else if(e.key==='Escape'){ bmAdding=false; renderBookmarks(); } return; }
			var ri=e.target.closest('[data-renamein]');
			if(ri){ if(e.key==='Enter'){ bmRenameFolder(ri.getAttribute('data-renamein'), ri.value); bmRenaming=null; renderBookmarks(); } else if(e.key==='Escape'){ bmRenaming=null; renderBookmarks(); } return; }
		});
		// 포커스 이탈 시 자동 확정(클릭으로 빠져나가도 저장)
		root.addEventListener('focusout', function(e){
			var ni=e.target.closest('#bmNewIn'); if(ni && bmAdding){ var nm=ni.value.trim(); if(nm){ var id=bmNewFolder(nm,null); bmCur=id; } bmAdding=false; setTimeout(renderBookmarks,0); return; }
			var ri=e.target.closest('[data-renamein]'); if(ri && bmRenaming){ bmRenameFolder(ri.getAttribute('data-renamein'), ri.value); bmRenaming=null; setTimeout(renderBookmarks,0); }
		});

		// 피커 검색
		root.addEventListener('input', function(e){ var pi=e.target.closest('#bmPickInput'); if(pi){ bmPickQ=pi.value; renderBookmarks(); } });
		// 피커 체크박스
		root.addEventListener('change', function(e){ var cb=e.target.closest('[data-pick]'); if(!cb) return; var code=cb.getAttribute('data-pick'); if(cb.checked) bmPickSel[code]=true; else delete bmPickSel[code]; renderBookmarks(); });

		// ── 드래그: 문서→폴더(파일링, 하이브리드) · 폴더→폴더(이동) ──
		root.addEventListener('dragstart', function(e){
			var card=e.target.closest('.bmCard[data-code]'); if(card){ bmDragCode=card.getAttribute('data-code'); bmDragFolder=null; card.classList.add('dragging'); try{e.dataTransfer.setData('text/plain',bmDragCode);}catch(_){ } return; }
			var fol=e.target.closest('.bmFolder[data-fid]'); if(fol){ var fid=fol.getAttribute('data-fid'); if(fid==='__all'){ e.preventDefault(); return; } bmDragFolder=fid; bmDragCode=null; fol.classList.add('dragging'); try{e.dataTransfer.setData('text/plain',fid);}catch(_){ } }
		});
		function bmClearDrop(){ root.querySelectorAll('.dropInside,.dropBefore,.dropAfter').forEach(function(el){ el.classList.remove('dropInside','dropBefore','dropAfter'); }); }
		/* 폴더 드래그 시 행 안에서의 위치로 영역 판정: 위 28%=before, 아래 28%=after, 가운데=inside(중첩) */
		function bmZone(fol, e){
			if(bmDragCode!==null) return 'inside';            // 문서는 항상 폴더 안에
			if(fol.getAttribute('data-fid')==='__all') return 'inside';  // All 노드 = 루트로 이동
			var r=fol.getBoundingClientRect(), y=e.clientY-r.top;
			if(y < r.height*0.28) return 'before';
			if(y > r.height*0.72) return 'after';
			return 'inside';
		}
		root.addEventListener('dragover', function(e){ var fol=e.target.closest('.bmFolder[data-fid]'); if(!fol) return;
			if(bmDragCode===null && bmDragFolder===null) return;
			e.preventDefault(); bmClearDrop();
			var z=bmZone(fol,e); fol.classList.add(z==='before'?'dropBefore':z==='after'?'dropAfter':'dropInside'); });
		root.addEventListener('dragleave', function(e){ var fol=e.target.closest('.bmFolder[data-fid]'); if(fol) fol.classList.remove('dropInside','dropBefore','dropAfter'); });
		root.addEventListener('drop', function(e){ var fol=e.target.closest('.bmFolder[data-fid]'); if(!fol) return; e.preventDefault();
			var fid=fol.getAttribute('data-fid'), z=bmZone(fol,e); bmClearDrop();
			if(bmDragCode!==null){ var ok=bmAddItem(fid, bmDragCode); var fn=(bmFolder(fid)||{}).name; bmDragCode=null; renderBookmarks(); if(ok) toast('Filed in “'+fn+'”.','ok'); else if(fid!=='__all') toast('Already in “'+fn+'”.','info'); return; }
			if(bmDragFolder!==null){
				if(z==='inside'){ bmMoveFolder(bmDragFolder, (fid==='__all')?null:fid); }   // 중첩(또는 루트로)
				else { bmReorderFolder(bmDragFolder, fid, z==='after'); }                     // 사이에 끼우기(형제 재정렬)
				bmDragFolder=null; renderBookmarks(); return;
			}
		});
		root.addEventListener('dragend', function(){ bmDragCode=null; bmDragFolder=null; root.querySelectorAll('.dragging').forEach(function(el){ el.classList.remove('dragging'); }); bmClearDrop(); });
	});
