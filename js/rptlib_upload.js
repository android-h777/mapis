	/* ════════════════════════════════════════════════════════════
	   Technical Report Hub — "My Submissions" (작성자): 파이프라인 보드(내 제출물 진행 스테퍼) + 새 제출 폼.
	   내 제출물 = 공유 저장소 RL_SUBS(js/rptlib_common.js)의 mine 투영. 결재 상태 변경이 여기 자동 반영.
	   분류는 여기서 안 받음 — 담당자가 My Approval 게이트로 판정(rptlib_review.js). 반려 사유 표시 + 재제출 여기서.
	   esc · toast · notify → js/rptlib_common.js (공통).
	   ════════════════════════════════════════════════════════════ */
	var RL_STEPS=['Submitted','In review','Classified','Published'];
	function stepLabel(s){ return s.status==='approved'?'Published · live' : s.status==='rejected'?'Rejected' : 'In review — Tech CoE'; }
	function subStepper(s){
		var cc=(s.status==='approved')?4:1, rej=(s.status==='rejected'), h='<div class="rvStepper'+(rej?' rej':'')+'">';
		for(var i=0;i<RL_STEPS.length;i++){
			if(i>0) h+='<span class="rvLine'+(i<=cc?' done':'')+'"></span>';
			var cls=i<cc?'done':(i===cc?(rej?'x':'cur'):'');
			h+='<span class="rvStep '+cls+'"><i class="rvDot"></i><em>'+RL_STEPS[i]+'</em></span>';
		}
		return h+'</div><div class="rvStat'+(rej?' rej':(s.status==='approved'?' ok':''))+'">'+esc(stepLabel(s))+'</div>';
	}
	/* 작성자 관점 상태 라벨(pending|approved|rejected). docs.js classBadge·review statusBadge와 동명 회피 위해 subBadge 유지. */
	function subBadge(s){ var m={pending:['rev','In review'],approved:['pub','Published'],rejected:['rej','Rejected']}, b=m[s]||['rev',s]; return '<span class="mineBadge '+b[0]+'">'+esc(b[1])+'</span>'; }
	function rejBox(s){ return s.status==='rejected'?'<div class="rvRejBox"><i class="material-symbols-outlined">info</i><div><b>Reason:</b> '+esc(s.reviewNote||'—')+' <a class="rvResub" data-resub="'+esc(s.code)+'">Revise &amp; resubmit</a></div></div>':''; }
	function mineCard(s){ return '<div class="rvCard">'+
		'<div class="rvCardTop"><div class="rvCardMain"><div class="rvT">'+esc(s.title)+'</div>'+
			'<div class="rvS"><span class="code">'+esc(s.code)+'</span> · '+esc(s.when)+'</div></div>'+subBadge(s.status)+'</div>'+
		subStepper(s)+rejBox(s)+'</div>'; }

	function renderMySubs(){
		var el=document.getElementById('subBoard'); if(!el) return;
		var mine=rlSubsMine();
		el.innerHTML='<div class="upHead upHeadRow"><div>'+
			'<div class="upTit">My Submissions</div>'+
			'<div class="upSub">Reports you’ve submitted — track their progress. Reviewers act on them under <b>My Approval</b>.</div></div>'+
			'<a href="javascript:;" class="waves-effect waves-light hBtn hViva" data-newsub="1"><span class="material-symbols-outlined left">add</span><span class="label">New submission</span></a></div>'+
			'<div class="rvBody hScroll">'+(mine.length? mine.map(mineCard).join('') : '<div class="rvEmpty"><i class="material-symbols-outlined">drafts</i>No submissions yet — start one with “New submission”.</div>')+'</div>';
	}
	function showBoard(){ var b=document.getElementById('subBoard'),f=document.getElementById('subForm'); if(b)b.style.display=''; if(f)f.style.display='none'; }
	function showForm(){ var b=document.getElementById('subBoard'),f=document.getElementById('subForm'); if(b)b.style.display='none'; if(f)f.style.display=''; }
	/* 반려된 내 제출물 재제출 — rejected → pending(My Approval 큐 재등장). 사유 클리어. */
	function resubmit(code){ var s=rlSubByCode(code); if(!s)return; s.status='pending'; s.reviewNote=''; rlSyncNoti();
		notify([{msg:'Resubmitted “'+code+'” for review.', kind:'mocha'},{msg:'Back in the approver’s queue.', kind:'todo'}]); renderMySubs(); }

	$(document).ready(function(){
		showBoard(); renderMySubs();   // 기본 = 내 제출물 보드

		// 보드 위임: New=폼 / 반려항목 재제출
		document.getElementById('subBoard').addEventListener('click', function(e){
			if(e.target.closest('[data-newsub]')){ showForm(); return; }
			var rs=e.target.closest('[data-resub]'); if(rs){ resubmit(rs.getAttribute('data-resub')); return; }
		});
		document.getElementById('upBackBtn').addEventListener('click', function(){ showBoard(); renderMySubs(); });

		// 파일 드롭(목업)
		var drop=document.getElementById('upDrop'), files=document.getElementById('upFiles');
		function addFile(name){ files.innerHTML='<div class="fileRow"><i class="material-symbols-outlined">description</i><div class="fileMain"><div class="fileT">'+esc(name)+'</div><div class="fileS">2.4 MB · ready</div></div><i class="material-symbols-outlined fileRm">close</i></div>'; }
		drop.addEventListener('dragover', function(e){ e.preventDefault(); drop.classList.add('over'); });
		drop.addEventListener('dragleave', function(){ drop.classList.remove('over'); });
		drop.addEventListener('drop', function(e){ e.preventDefault(); drop.classList.remove('over'); addFile((e.dataTransfer.files[0]&&e.dataTransfer.files[0].name)||'report.pdf'); toast('File attached (mock).','ok'); });
		document.getElementById('upBrowse').addEventListener('click', function(){ addFile('Low-Temp-Cure-Silicone.pdf'); toast('File attached (mock).','ok'); });
		files.addEventListener('click', function(e){ if(e.target.closest('.fileRm')){ files.innerHTML=''; } });

		// 제출 → 공유 저장소 추가 + 결재 알림. 분류 없이 status='pending'(담당자가 게이트로 판정).
		document.getElementById('upSubmit').addEventListener('click', function(){
			if(this.classList.contains('disabled')) return;
			// ▼ 액션 seam(제출): 실구현 au.ajaxPost('/rptlib/submit', payload, function(res){ ... res.reportNo ... })
			var fv=function(id){ return ((document.getElementById(id)||{}).value||'').trim(); };
			var site=(fv('mRegion')||'KR').split('—')[0].trim() || 'KR';
			var assignedNo=site+'-26-01';   // 목업: 서버 채번 응답 흉내(site·year·seq)
			RL_SUBS.unshift({ code:assignedNo, title:fv('mTitle')||'Untitled report',
				author:fv('mAuthor')||RL_ME, bu:fv('mBu')||'—', idx:site, type:fv('mType')||'TIS Report',
				kw:fv('mKw'), abstract:fv('mAbs'), hint:fv('mHint'),
				gates:{itar:0,jda:0,named:0,external:0}, status:'pending', when:'just now', mine:true });
			rlSyncNoti();                  // 헤더 결재 배지(미결) 갱신
			showBoard(); renderMySubs();   // 내 제출물 보드로 복귀 — 새 제출이 In review로 표시
			notify([
				{msg:'Submitted — report '+assignedNo+' assigned. Now in the approver’s queue.', kind:'mocha'},
				{msg:'Email sent to approver — J. Lee (manager).', kind:'mail'},
				{msg:'To-Do created in approver’s MAPIS queue.', kind:'todo'}
			]);
		});

		// (SPA) 헤더 글로벌 검색 = 셸(rptlib_docs.js)이 담당
	});
