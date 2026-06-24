	/* ════════════════════════════════════════════════════════════
	   Technical Report Hub — "My Report" 셸 + 세그먼트 A "Reports"(작성자 관점).
	   내 전용 공간: Reports(내가 만든 보고서·track) / Bookmarks(내가 모은 것·curate → rptlib_collections.js).
	   Reports = 공유 저장소 RL_SUBS의 mine 투영(발행/결재중/반려). 상세는 pop.html(rlOpenPop) — Documents와 동일 통일감.
	   카드·스텝퍼·반려박스 = rptlib_upload.js 컴포넌트 재사용(subStepper/subBadge/rejBox/resubmit),
	   등급 배지 = rptlib_review.js 재사용(deriveClass/gateClassBadge). 공개 진입점 = renderMine()(전역, docs.js showView가 호출).
	   ════════════════════════════════════════════════════════════ */
	var mineSeg='reports';   // 현재 세그먼트(reports|bookmarks)
	var mineStat='all';      // Reports 상태 탭(all|pending|approved|rejected)

	/* 2-옵션: All(내 업로드 전부, 기본) / In Approval(아직 승인 안 된 것 = pending). .admTabs 재사용 */
	function mineStatTabs(mine){
		var defs=[{k:'all',nm:'All uploads'},{k:'pending',nm:'In Approval'}];
		var cnt={ all:mine.length, pending:mine.filter(function(s){return s.status==='pending';}).length };
		return '<div class="admTabs">'+defs.map(function(d){
			return '<a href="javascript:;" class="admTab'+(mineStat===d.k?' on':'')+'" data-mtab="'+d.k+'">'+esc(d.nm)+'<span class="tabN">'+cnt[d.k]+'</span></a>';
		}).join('')+'</div>';
	}

	/* 내 보고서 카드 — upload.js .rvCard 양식 재사용 + 등급 배지 + 클릭→pop.html */
	function mineRvCard(s){
		var c=(typeof deriveClass==='function')?deriveClass(s.gates):2;
		var clsB=(typeof gateClassBadge==='function')?gateClassBadge(c):'';
		var stepper=(typeof subStepper==='function')?subStepper(s):'';
		var rej=(typeof rejBox==='function')?rejBox(s):'';
		var openLine=(s.status==='approved')
			? '<div class="rvOpenHint pub"><i class="material-symbols-outlined">verified</i>Published · Report No. '+esc(s.code)+' — open to view</div>'
			: '<div class="rvOpenHint"><i class="material-symbols-outlined">open_in_new</i>Open report detail</div>';
		return '<div class="rvCard mineRv" data-open="'+esc(s.code)+'">'+
			'<div class="rvCardTop"><div class="rvCardMain"><div class="rvT">'+esc(s.title)+'</div>'+
				'<div class="rvS"><span class="code">'+esc(s.code)+'</span> · '+esc(s.bu||'—')+' · '+esc(s.when)+'</div></div>'+
				'<span class="rvBadges">'+clsB+(typeof subBadge==='function'?subBadge(s.status):'')+'</span></div>'+
			stepper+rej+openLine+
		'</div>';
	}

	/* Reports 세그먼트 렌더 */
	function renderMineReports(){
		var el=document.getElementById('mineReports'); if(!el) return;
		var mine=(typeof rlSubsMine==='function')?rlSubsMine():[];
		var list=mine.filter(function(s){ return mineStat==='all'||s.status===mineStat; });
		el.innerHTML='<div class="mineBar">'+mineStatTabs(mine)+
			'<a href="javascript:;" class="waves-effect waves-light hBtn hViva mineNew" data-newsub="1"><span class="material-symbols-outlined left">add</span><span class="label">New submission</span></a></div>'+
			'<div class="rvBody hScroll">'+(list.length? list.map(mineRvCard).join('')
				: '<div class="rvEmpty"><i class="material-symbols-outlined">drafts</i>No reports in this status yet.</div>')+'</div>';
	}

	/* 세그먼트 전환(Reports ↔ Bookmarks) */
	function setMineSeg(seg){
		mineSeg=seg;
		var segEl=document.getElementById('mineSeg');
		if(segEl) segEl.querySelectorAll('a').forEach(function(a){ a.classList.toggle('on', a.getAttribute('data-seg')===seg); });
		var r=document.getElementById('mineReports'), b=document.getElementById('mineBookmarks');
		if(seg==='bookmarks'){ if(r)r.style.display='none'; if(b)b.style.display=''; if(typeof renderBookmarks==='function') renderBookmarks(); }
		else { if(b)b.style.display='none'; if(r)r.style.display=''; renderMineReports(); }
	}

	/* 공개 진입점 — docs.js showView('mine')가 호출 */
	function renderMine(){ setMineSeg(mineSeg); }

	$(document).ready(function(){
		// 세그먼트 토글
		var seg=document.getElementById('mineSeg');
		if(seg) seg.addEventListener('click', function(e){ var a=e.target.closest('[data-seg]'); if(a) setMineSeg(a.getAttribute('data-seg')); });

		// Reports 위임: 상태 탭 / 새 제출 / 재제출 / 카드 열기
		var mr=document.getElementById('mineReports');
		if(mr) mr.addEventListener('click', function(e){
			var tab=e.target.closest('[data-mtab]'); if(tab){ mineStat=tab.getAttribute('data-mtab'); renderMineReports(); return; }
			if(e.target.closest('[data-newsub]')){ showView('upload'); if(typeof showForm==='function') showForm(); return; }
			var rs=e.target.closest('[data-resub]'); if(rs){ e.stopPropagation(); if(typeof resubmit==='function') resubmit(rs.getAttribute('data-resub')); renderMineReports(); return; }
			var card=e.target.closest('[data-open]'); if(card){ rlOpenPop(card.getAttribute('data-open'), {from:'mine'}); return; }
		});
	});
