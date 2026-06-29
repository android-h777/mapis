/* ════════════════════════════════════════════════════════════
   Technical Report Hub — 제출물 공유 컴포넌트(작성자 관점).
   New submission 폼은 별도 팝업(apis_rptlib_newsub.html)으로 분리됐고,
   My Submissions 보드는 My Report 뷰(rptlib_mine.js)로 흡수됨 — 이 파일의 인페이지 보드/폼은 폐지.
   여기 남은 것 = mine.js 가 재사용하는 순수 컴포넌트: 스텝퍼·상태배지·반려박스·재제출.
   esc · toast · notify → js/rptlib_common.js (공통).
   ════════════════════════════════════════════════════════════ */
var RL_STEPS=['Submitted','In review','Classified','Published'];
function stepLabel(s){ return s.status==='approved'?'Published · live' : s.status==='rejected'?'Rejected(Tech. CoE)' : 'In Progress(Tech. CoE)'; }
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
function subBadge(s){ var m={pending:['rev','In Progress'],approved:['pub','Published'],rejected:['rej','Rejected']}, b=m[s]||['rev',s]; return '<span class="mineBadge '+b[0]+'">'+esc(b[1])+'</span>'; }
function rejBox(s){ return s.status==='rejected'?'<div class="rvRejBox"><i class="material-symbols-outlined">info</i><div><b>Reason:</b> '+esc(s.reviewNote||'—')+' <a class="rvResub" data-resub="'+esc(s.code)+'">Revise &amp; resubmit</a></div></div>':''; }
/* 반려된 내 제출물 재제출 — rejected → pending(My Approval 큐 재등장). 사유 클리어. 호출처(mine.js)가 직후 재렌더. */
function resubmit(code){ var s=rlSubByCode(code); if(!s)return; s.status='pending'; s.reviewNote=''; rlSyncNoti();
	notify([{msg:'Resubmitted “'+code+'” for review.', kind:'mocha'},{msg:'Back in the approver’s queue.', kind:'todo'}]); }
