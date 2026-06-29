	/* ════════════════════════════════════════════════════════════
	   Technical Report Hub — "My Approval" (담당자): 결재 큐 + 분류 게이트 패널 + Approve / Reject(사유 필수).
	   검토할 내용 = pending 탭. 분류는 업로더가 아닌 여기 담당자가 게이트로 판정 → class 자동 도출.
	   Changes 상태 폐지 → Reject 일원화(사유 필수, 작성자는 My Submissions에서 재제출).
	   공유 저장소 RL_SUBS(js/rptlib_common.js) 투영 — 결정이 작성자 제출물에 자동 반영.
	   ════════════════════════════════════════════════════════════ */
	function deriveClass(g){
		if(g.itar) return 0;                 // Manager: ITAR/수출제한 → 저장 불가(OOS)
		if(g.jda)  return g.region ? 3 : 4;   // Tech CoE: JDA → region(국가/지역)이면 C3, 아니면 case-by-case C4
		return g.external ? 1 : 2;           // GT&C: 외부회람 승인 → C1, 아니면 C2
	}
	var CLS_NM={0:'Out of scope',1:'Class 1 · Public',2:'Class 2 · Internal',3:'Class 3 · Confidential',4:'Class 4 · Highly Restricted'};
	function gateClassBadge(c){
		if(c===0) return '<span class="rlClassBadge oos"><i class="material-symbols-outlined">block</i>OOS</span>';
		return '<span class="rlClassBadge c'+c+'">'+(c>=3?'<i class="material-symbols-outlined">lock</i>':'')+'C'+c+'</span>';
	}
	var GATES=[
		{k:'itar',     owner:'Manager',  q:'ITAR Restricted or Export Restricted (not EAR 99)?',          show:function(g){return true;}},
		{k:'jda',      owner:'Tech CoE', q:'Is it subject to special confidentiality agreements (JDA, etc.)?',        show:function(g){return !g.itar;}},
		{k:'region',   owner:'Tech CoE', q:'Can access be granted on a region / nationality basis (vs. case-by-case)?',   show:function(g){return !g.itar && !!g.jda;}},
		{k:'external', owner:'GT&C',     q:'Has it been approved for external circulation?',                 show:function(g){return !g.itar && !g.jda;}}
	];
	function ownerCls(o){ return o.replace(/[^A-Za-z]/g,''); }
	function gatePanel(q,i){
		var g=q.gates, c=deriveClass(g);
		var rows=GATES.filter(function(gt){return gt.show(g);}).map(function(gt){
			var v=g[gt.k];
			return '<div class="gateRow"><span class="gateOwner o'+ownerCls(gt.owner)+'">'+esc(gt.owner)+'</span>'+
				'<span class="gateQ">'+esc(gt.q)+'</span>'+
				'<span class="upToggle gateTog"><a href="javascript:;" class="'+(v?'on':'')+'" data-gate="'+gt.k+'" data-i="'+i+'" data-v="1">Yes</a>'+
					'<a href="javascript:;" class="'+(v?'':'on')+'" data-gate="'+gt.k+'" data-i="'+i+'" data-v="0">No</a></span></div>';
		}).join('');
		return '<div class="gatePanel"><div class="gateHead">Classification <span class="admMuted">each gate answered by its owner → class derived</span></div>'+rows+
			'<div class="gateDerived">→ Derived: '+gateClassBadge(c)+'<span class="gateClsNm">'+esc(CLS_NM[c])+'</span>'+
			(c===0?'<span class="gateOos">Not stored — route to the controlled repository</span>':'')+'</div></div>';
	}

	/* status: pending | approved | rejected (Changes 폐지). 반려=사유 필수, 작성자 재제출 가능. */
	var STATUSES=[{k:'requested',nm:'Requested',f:function(q){return q.mine&&(q.status==='pending'||q.status==='rejected');}},{k:'pending',nm:'Pending',f:function(q){return !q.mine&&q.status==='pending';}},{k:'approved',nm:'Approved',f:function(q){return q.status==='approved';}}];
	var curTab='pending';
	var qSel={};            // 일괄승인 선택(code→true)
	var rejectingIdx=-1;    // 반려 사유 입력 중인 항목 인덱스
	function statusBadge(s){ var m={pending:['rev','Pending'],approved:['pub','Approved'],rejected:['rej','Rejected']},b=m[s]||['rev',s]; return '<span class="mineBadge '+b[0]+'">'+esc(b[1])+'</span>'; }

	function qActs(i,c){ return '<div class="qActs"><a href="javascript:;" class="waves-effect waves-light hBtn qBtn ok'+(c===0?' disabled':'')+'" data-act="approve" data-i="'+i+'"><i class="material-symbols-outlined left">check</i><span class="label">Approve &amp; publish</span></a>'+
		'<a href="javascript:;" class="waves-effect hBtn qBtn" data-act="reject" data-i="'+i+'"><i class="material-symbols-outlined left">close</i><span class="label">Reject</span></a></div>'; }
	function rejectForm(i){ return '<div class="qReject"><div class="rjLab"><i class="material-symbols-outlined">error</i>Reason for rejection <b>(required)</b> — the submitter sees this and can revise &amp; resubmit.</div>'+
		'<textarea class="rjNote" placeholder="e.g., Out of scope — ITAR-adjacent; route to the controlled repository."></textarea>'+
		'<div class="rjActs"><a href="javascript:;" class="waves-effect hBtn qBtn warn" data-confirmreject="'+i+'"><i class="material-symbols-outlined left">close</i><span class="label">Confirm reject</span></a>'+
			'<a href="javascript:;" class="waves-effect hBtn qBtn" data-cancelreject="1"><span class="label">Cancel</span></a></div></div>'; }

	function renderQueue(){
		var Q=rlSubsQueue();   // 공유 저장소(라이브) — My Submissions 제출분 포함
		var counts={}; STATUSES.forEach(function(s){ counts[s.k]=Q.filter(s.f).length; });
		var tabs=STATUSES.map(function(s){ return '<a href="javascript:;" class="admTab'+(curTab===s.k?' on':'')+'" data-tab="'+s.k+'">'+esc(s.nm)+'<span class="tabN">'+counts[s.k]+'</span></a>'; }).join('');
		var _cf=(STATUSES.filter(function(s){return s.k===curTab;})[0]||STATUSES[1]).f; var list=Q.map(function(q,i){return {q:q,i:i};}).filter(function(x){return _cf(x.q);});
		var body=list.length? list.map(function(x){ var q=x.q,i=x.i,c=deriveClass(q.gates),pend=(q.status==='pending');
			return '<div class="qItem'+(pend?'':' done')+'" data-i="'+i+'">'+
				'<div class="qTop">'+(pend?'<label class="qSelBox" title="Select for bulk approve"><input type="checkbox" class="filled-in" data-qsel="'+esc(q.code)+'"'+(qSel[q.code]?' checked':'')+'/><span></span></label>':'')+'<div class="qMain"><div class="qT">'+esc(q.title)+'</div>'+
					'<div class="qS"><span class="code">'+esc(q.code)+'</span> · '+esc(q.author)+' · '+esc(q.bu)+' · '+esc(q.when)+'</div></div>'+statusBadge(q.status)+'</div>'+
				(q.hint?'<div class="qHint"><i class="material-symbols-outlined">tips_and_updates</i><span><b>Submitter heads-up:</b> '+esc(q.hint)+'</span></div>':'')+
				(q.status==='rejected'&&q.reviewNote?'<div class="qHint rej"><i class="material-symbols-outlined">info</i><span><b>Rejected:</b> '+esc(q.reviewNote)+'</span></div>':'')+
				gatePanel(q,i)+
				(pend? (rejectingIdx===i? rejectForm(i) : qActs(i,c)) : '')+
			'</div>';
		}).join('') : '<div class="cardBox admCard"><div class="qEmpty"><i class="material-symbols-outlined">inbox</i>No submissions in “'+esc(curTab)+'”.</div></div>';
		var selN=Object.keys(qSel).filter(function(code){ var s=rlSubByCode(code); return s&&s.status==='pending'; }).length;
		var bulk=selN?('<div class="qBulk"><span class="cnt"><b>'+selN+'</b> selected</span><div class="acts">'+
			'<a class="qbAct" data-qbulk="approve"><i class="material-symbols-outlined">check</i>Approve &amp; publish</a>'+
			'<a class="qbAct clr" data-qbulk="clear">Clear</a></div></div>'):'';
		document.getElementById('admBody').innerHTML='<div class="admTabs admTabsQ">'+tabs+'</div>'+bulk+body;
	}
	/* 일괄 승인만(반려는 사유 필수라 개별). OOS(class 0)는 건너뜀. */
	function bulkDecide(act){
		if(act==='clear'){ qSel={}; renderQueue(); return; }
		var codes=Object.keys(qSel), done=0, blocked=0;
		codes.forEach(function(code){ var q=rlSubByCode(code); if(!q||q.status!=='pending') return;
			if(deriveClass(q.gates)===0){ blocked++; return; } q.status='approved'; done++; });
		qSel={}; rlSyncNoti();
		var seq=[{msg:'Approved & published '+done+' submission'+(done!==1?'s':'')+'.', kind:'ok'}];
		if(blocked) seq.push({msg:blocked+' skipped — Out of scope (set classification first).', kind:'warn'});
		notify(seq); renderQueue();
	}
	function decPending(){ rlSyncNoti(); }   // 헤더 결재 배지 동기화

	$(document).ready(function(){
		renderQueue();
		document.getElementById('admBody').addEventListener('click', function(e){
			// 일괄 승인 바
			var qb=e.target.closest('[data-qbulk]'); if(qb){ bulkDecide(qb.getAttribute('data-qbulk')); return; }
			// 상태 탭
			var tab=e.target.closest('.admTab[data-tab]'); if(tab){ curTab=tab.getAttribute('data-tab'); rejectingIdx=-1; renderQueue(); return; }
			// 게이트 토글
			var gt=e.target.closest('[data-gate]'); if(gt){ rlSubsQueue()[+gt.getAttribute('data-i')].gates[gt.getAttribute('data-gate')]=+gt.getAttribute('data-v'); renderQueue(); return; }
			// 반려 사유 확정/취소
			var cr=e.target.closest('[data-confirmreject]'); if(cr){ var ci=+cr.getAttribute('data-confirmreject'), ta=document.querySelector('.rjNote'), note=(ta&&ta.value||'').trim();
				if(!note){ toast('Rejection reason is required.','warn'); if(ta) ta.focus(); return; }
				var rq=rlSubsQueue()[ci]; rq.status='rejected'; rq.reviewNote=note; rejectingIdx=-1; rlSyncNoti();
				notify([{msg:'Rejected “'+rq.code+'” — sent back with reason.', kind:'warn'},{msg:'Email sent to '+rq.author+' — reason attached.', kind:'mail'},{msg:'Submitter can revise & resubmit.', kind:'todo'}]); renderQueue(); return; }
			var cc=e.target.closest('[data-cancelreject]'); if(cc){ rejectingIdx=-1; renderQueue(); return; }
			// 결정(승인=즉시 / 반려=사유 폼 펼침)
			var b=e.target.closest('[data-act]'); if(!b || b.classList.contains('disabled')) return;
			var act=b.getAttribute('data-act'), i=+b.getAttribute('data-i');
			if(act==='reject'){ rejectingIdx=i; renderQueue(); return; }
			var q=rlSubsQueue()[i], c=deriveClass(q.gates);
			q.status='approved'; decPending();
			notify([{msg:'Approved “'+q.code+'” as '+CLS_NM[c]+'.', kind:'ok'},{msg:'Email sent to '+q.author+' — approved.', kind:'mail'},{msg:'System: report no. assigned & published.', kind:'todo'}]);
			renderQueue();
		});
		document.getElementById('admBody').addEventListener('change', function(e){
			var cb=e.target.closest('[data-qsel]'); if(!cb) return;
			var code=cb.getAttribute('data-qsel'); if(cb.checked) qSel[code]=true; else delete qSel[code]; renderQueue();
		});
	});
