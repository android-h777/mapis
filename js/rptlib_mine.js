	/* ════════════════════════════════════════════════════════════
	   Technical Report Hub — "My Report" 셸 + 세그먼트 A "Reports"(작성자 관점).
	   내 전용 공간: Reports(내가 만든 보고서·track) / Bookmarks(내가 모은 것·curate → rptlib_collections.js).
	   Reports = 공유 저장소 RL_SUBS의 mine 투영(발행/결재중/반려). 상세는 pop.html(rlOpenPop) — Documents와 동일 통일감.
	   카드·스텝퍼·반려박스 = rptlib_upload.js 컴포넌트 재사용(subStepper/subBadge/rejBox/resubmit),
	   등급 배지 = rptlib_review.js 재사용(deriveClass/gateClassBadge). 공개 진입점 = renderMine()(전역, docs.js showView가 호출).
	   ════════════════════════════════════════════════════════════ */
	var mineSeg='reports';   // 현재 세그먼트(reports|bookmarks)

	/* 미니 진행 — subStepper(큰 노드)를 점+라벨 한 줄로 축약(목록 스캔용, 상세는 pop.html) */
	function mineMiniProg(s){
		if(typeof RL_STEPS==='undefined') return '';
		var rej=(s.status==='rejected'), cc=(s.status==='approved')?RL_STEPS.length:1, d='';
		for(var i=0;i<RL_STEPS.length;i++){
			if(i>0) d+='<span class="mpLine'+(i<=cc?' done':'')+'"></span>';
			d+='<span class="mpDot '+(i<cc?'done':(i===cc?(rej?'x':'cur'):''))+'"></span>';
		}
		var lbl=(typeof stepLabel==='function')?stepLabel(s):s.status;
		return '<div class="mineMini'+(rej?' rej':(s.status==='approved'?' ok':''))+'">'+d+'<span class="mpLbl">'+esc(lbl)+'</span></div>';
	}
	/* 내 보고서 카드 — 정보 영역(제목/메타/등급 → 문서 보기) | 결재 영역(상태/진행 → mode=approve) */
	function mineRvCard(s){
		var c=(typeof deriveClass==='function')?deriveClass(s.gates):2;
		var approved=(s.status==='approved');   // 미승인 = 분류 전 → 등급은 '제안값'이라 확정 배지와 시각 구분
		var clsB = (typeof gateClassBadge!=='function') ? ''
			: approved ? gateClassBadge(c)
			: '<span class="clsProposed" title="Proposed class — the reviewer (Tech CoE) sets the final classification">'+gateClassBadge(c)+'<span class="clsProposedTag">proposed</span></span>';
		var rej=(typeof rejBox==='function')?rejBox(s):'';
		var region=(typeof idxName==='function')?idxName(s.idx):(s.idx||'—');
		var apprBody=(s.status==='approved')
			? '<div class="rvPubMark"><i class="material-symbols-outlined">verified</i><div class="pmTx"><b>Published</b><span>live · open to view</span></div></div>'
			: '<span class="rvBadges">'+(typeof subBadge==='function'?subBadge(s.status):'')+'</span>'+mineMiniProg(s);
		// 정보 영역 = Documents/Bookmarks의 rlRepCard와 동일 시각언어(rc* 구조) 재사용 → 모듈 일관성
		return '<div class="rvCard mineRv">'+
			'<div class="rvInfo" data-open="'+esc(s.code)+'">'+
				'<div class="rcTop"><span class="rcType">'+esc(s.type||'TIS')+'</span>'+clsB+'</div>'+
				'<div class="rcTitle">'+esc(s.title)+'</div>'+
				'<div class="rcMeta"><span class="code">'+esc(s.code)+'</span><span class="dot">·</span>'+esc(s.bu||'—')+'</div>'+
				'<div class="rcFoot"><span class="rcSite"><i class="material-symbols-outlined">public</i>'+esc(region)+'</span>'+
					'<span class="rcWhen">'+esc(s.when||'')+'</span></div>'+
				rej+
			'</div>'+
			'<div class="rvApprSide" data-appr="'+esc(s.code)+'">'+
				apprBody+
				'<span class="rvApprGo">Approval<i class="material-symbols-outlined">chevron_right</i></span>'+
			'</div>'+
		'</div>';
	}

	/* when 상대시간 → 분(작을수록 최신). 정렬용 */
	function mineWhenMin(w){
		w=(w||'').toLowerCase();
		if(/just now/.test(w)) return 0;
		if(/last week/.test(w)) return 10080;
		if(/last year/.test(w)) return 525600;
		var m=w.match(/(\d+)\s*(h|hour|d|day|w|week|mo|month|y|year)/);
		if(!m) return 1e9;
		var n=+m[1], u=m[2];
		var mult=(u.slice(0,2)==='mo')?43200:u[0]==='h'?60:u[0]==='d'?1440:u[0]==='w'?10080:u[0]==='y'?525600:1;
		return n*mult;
	}
	/* Reports 세그먼트 렌더 */
	function renderMineReports(){
		var el=document.getElementById('mineReports'); if(!el) return;
		var mine=(typeof rlSubsMine==='function')?rlSubsMine():[];
		mine=mine.slice().sort(function(a,b){ return mineWhenMin(a.when)-mineWhenMin(b.when); });
		el.innerHTML='<div class="btnArea">'+
			'<a href="javascript:;" class="waves-effect waves-light hBtn hViva mineNew" data-newsub="1"><i class="material-symbols-outlined left">add</i><span class="label">Submit a Document</span></a></div>'+
			'<div class="rvBody hScroll">'+(mine.length? mine.map(mineRvCard).join('')
				: '<div class="rvEmpty"><i class="material-symbols-outlined">drafts</i>No reports yet.</div>')+'</div>';
	}

	/* 세그먼트 전환(Reports ↔ Bookmarks) */
	function setMineSeg(seg){
		mineSeg=seg;
		var _tt=document.getElementById('mineTit'), _sb=document.getElementById('mineSub');
		if(_tt) _tt.textContent=(seg==='bookmarks')?'My Bookmarks':'My Reports';
		if(_sb) _sb.textContent=(seg==='bookmarks')?'Documents you bookmarked — organized in folders.':'Documents you submitted — track status and submit new ones.';
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

		// Reports 위임: 새 제출 / 재제출 / 카드 열기
		var mr=document.getElementById('mineReports');
		if(mr) mr.addEventListener('click', function(e){
			if(e.target.closest('[data-newsub]')){ window.open('apis_rptlib_newsub.html','rlnewsub','width=1520,height=880,scrollbars=yes,resizable=yes'); return; }
			var rs=e.target.closest('[data-resub]'); if(rs){ e.stopPropagation(); if(typeof resubmit==='function') resubmit(rs.getAttribute('data-resub')); renderMineReports(); return; }
			var appr=e.target.closest('[data-appr]'); if(appr){ rlOpenPop(appr.getAttribute('data-appr'), {from:'mine',mode:'approve'}); return; }
			var card=e.target.closest('[data-open]'); if(card){ rlOpenPop(card.getAttribute('data-open'), {from:'mine'}); return; }
		});
	});
