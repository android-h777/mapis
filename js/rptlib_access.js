/* ════════════════════════════════════════════════════════════
   TRH 결재함 (Access / Approval inbox)
   ────────────────────────────────────────────────────────────
   내가 기안한 TRH 결재 — 발행 제출(RL_SUBS, mine) + Class 4 열람요청(RL_ACCESS_REQS, mine)
   중 '진행중(pending) + 반려(rejected)'만 모으는 액션 인박스.
   완료(approved)·반려후승인 건은 status==='approved'라 자동 제외 → mine && status!=='approved'.
   전체 현황·완료 탭·타모듈은 글로벌 MAPIS 공통 결재 모듈 몫(여기 미포함).
   행 클릭 → 해당 문서 pop의 결재 레이어로 딥링크(rlOpenPop, rptlib_common.js).
   ════════════════════════════════════════════════════════════ */

/* 열람요청 시드 — Class 4 문서 대상. status: pending | rejected | approved(=granted).
   mine:true = 로그인 사용자(RL_ME) 기안 → 내 결재함에 노출. mine:false = 타인(결재자 시연용·결재함 미노출). */
var RL_ACCESS_REQS = [
	{kind:'access', code:'LEV-24-002',  title:'Bio-based Silicone Feasibility Study (JDA)', cls:4, requester:RL_ME, bu:'Industrial',          when:'1d ago', reason:'On the JDA project — need the original report to compare formulations.',   status:'pending',  mine:true},
	{kind:'access', code:'2008-MPM-016', title:'SF1632 Part 1: Root Cause Analysis',          cls:4, requester:RL_ME, bu:'Specialty Additives', when:'4d ago', reason:'Reference for a similar failure analysis — checking the root-cause data.', status:'rejected', mine:true, note:'Reason not clearly tied to your current scope — confirm with your team lead and request again.'},
	{kind:'access', code:'LEV-24-002',  title:'Bio-based Silicone Feasibility Study (JDA)', cls:4, requester:'Wei Zhang', bu:'Coatings',       when:'6h ago', reason:'Customer support — need to compare formulation stability.',                status:'pending',  mine:false}
];

/* 내 기안 미완료 건 수집(발행 + 열람요청). status는 pending|rejected로 정규화. */
function rlInboxItems(){
	var out=[];
	if(typeof RL_SUBS!=='undefined'){
		RL_SUBS.forEach(function(s){
			if(!s.mine || s.status==='approved') return;
			out.push({kind:'publish', code:s.code, title:s.title, status:s.status, who:s.author, when:s.when, reason:s.reviewNote||s.hint||'', note:s.reviewNote||''});
		});
	}
	RL_ACCESS_REQS.forEach(function(a){
		if(!a.mine || a.status==='approved') return;
		out.push({kind:'access', code:a.code, title:a.title, status:a.status, who:a.requester, when:a.when, reason:a.reason, note:a.note||''});
	});
	return out;
}
function rlInboxCount(){ return rlInboxItems().length; }

var inboxTab='pending';
function inboxTypeLabel(k){ return k==='access' ? 'Class 4 Access' : 'Submission'; }
function inboxTypeTag(k){ return '<span class="roundBox font12 ib-'+(k==='access'?'acc':'pub')+'">'+inboxTypeLabel(k)+'</span>'; }
function inboxStatusChip(s){ return s==='pending'
	? '<span class="roundBox blue font12">In Progress</span>'
	: '<span class="roundBox red font12">Rejected</span>'; }

function inboxRows(list){
	return list.length ? list.map(function(it,i){
		return '<tr class="ibRow" data-code="'+esc(it.code)+'" data-kind="'+(it.kind||'publish')+'" data-status="'+it.status+'">'+
			'<td class="ac">'+(i+1)+'</td>'+
			'<td class="ac"><span class="apTypeTag">TRH</span></td>'+
			'<td class="ac">'+inboxTypeTag(it.kind||'publish')+'</td>'+
			'<td class="ibStatusCell ac">'+inboxStatusChip(it.status)+'</td>'+
			'<td class="al ibTitle"><span class="ibCode">['+esc(it.code)+']</span> '+esc(it.title)+
				(it.status==='rejected' && it.note ? '<div class="ibNote"><i class="material-symbols-outlined">subdirectory_arrow_right</i>'+esc(it.note)+'</div>' : '')+'</td>'+
			'<td class="al">'+esc(it.who||'—')+'</td></tr>';
	}).join('') : '<tr><td colspan="6" class="ac grey-text" style="padding:30px 0;">No items.</td></tr>';
}
function inboxPane(id, active, list){
	return '<div id="'+id+'"'+(active?'':' style="display:none;"')+'>'+
		'<div class="fixedTable hBorderTable vMiddle white mg0" style="height: 405px;">'+
			'<table><colgroup><col style="width:40px;"><col style="width:82px;"><col style="width:140px;"><col style="width:116px;"><col style="width:auto;"><col style="width:150px;"></colgroup>'+
			'<thead><tr><th>No.</th><th>Module</th><th>Type</th><th>Status</th><th class="al">Title</th><th class="al">Requester</th></tr></thead>'+
			'<tbody>'+inboxRows(list)+'</tbody></table>'+
		'</div></div>';
}
function inboxModalHtml(){
	var mineItems=rlInboxItems();   // 내 기안 진행중+반려 = Requested
	var pendQ=(typeof rlSubsQueue==='function')?rlSubsQueue().filter(function(q){return !q.mine && q.status==='pending';}).map(function(q){return {code:q.code,title:q.title,status:q.status,who:q.author,kind:'publish'};}):[];
	var apprQ=(typeof RL_SUBS!=='undefined')?RL_SUBS.filter(function(s){return s.status==='approved';}).map(function(s){return {code:s.code,title:s.title,status:'approved',who:s.author,kind:'publish'};}):[];
	var TABS=[
		{k:'pending',    nm:'Pending',   list:pendQ},
		{k:'requested',  nm:'Requested', list:mineItems},
		{k:'approved',   nm:'Approved',  list:apprQ}
	];
	if(!TABS.some(function(t){return t.k===inboxTab;})) inboxTab='pending';
	var tabs=TABS.map(function(t){ return '<li class="tab"><a href="#apprTab_'+t.k+'" class="'+(inboxTab===t.k?'active':'')+'" data-ibtab="'+t.k+'">'+t.nm+'<span class="modalTabBadge">'+t.list.length+'</span></a></li>'; }).join('');
	var panes=TABS.map(function(t){ return inboxPane('apprTab_'+t.k, inboxTab===t.k, t.list); }).join('');
	return '<article id="rlInboxCard" class="modal wd1000px show">'+
		'<div class="modal-header"><h5 class="fLine vCenter"><i class="material-icons left">assignment_turned_in</i>TRH Approval</h5>'+
			'<div class="closeBtns modal-close" id="ibClose"><i class="material-icons">close</i></div></div>'+
		'<div class="modal-content" style="padding: 0;">'+
			'<div class="modalTabMenu"><ul class="tabs" id="apprModalTab">'+tabs+'</ul></div>'+
			'<div class="apprModalSearchArea"><div class="aniInput"><input type="text" id="inp_apprModalSearch" class="browser-default" placeholder="Search by title, code, or requester"><span class="focus-border"></span></div></div>'+
			'<div class="modalTabBody"><div class="modalTabBody-content">'+panes+'</div></div>'+
		'</div></article>';
}
function renderInbox(){ var w=document.getElementById('rlInboxModal'); if(w) w.innerHTML=inboxModalHtml(); }
function openInbox(){ var w=document.getElementById('rlInboxModal'); if(!w) return; renderInbox(); void w.offsetWidth; w.classList.add('show'); }
function closeInbox(){ var w=document.getElementById('rlInboxModal'); if(w) w.classList.remove('show'); }
function syncInboxBadge(){
	var b=document.getElementById('rlInboxCnt'); if(!b) return;
	var n=rlInboxCount(); b.textContent=n;
	var wrap=b.parentNode; if(wrap) wrap.style.display = n ? '' : 'none';
}

$(document).ready(function(){
	var btn=document.getElementById('rlInboxBtn');
	if(btn) btn.addEventListener('click', openInbox);
	syncInboxBadge();

	var modal=document.getElementById('rlInboxModal');
	if(modal) modal.addEventListener('click', function(e){
		if(e.target.id==='rlInboxModal'){ closeInbox(); return; }     // 백드롭
		if(e.target.closest('#ibClose')){ closeInbox(); return; }
		var t=e.target.closest('[data-ibtab]'); if(t){ e.preventDefault(); inboxTab=t.getAttribute('data-ibtab'); renderInbox(); return; }
		var r=e.target.closest('.ibRow'); if(r){
			var code=r.getAttribute('data-code'), kind=r.getAttribute('data-kind'), st=r.getAttribute('data-status');
			if(kind==='access'){
				// 열람요청 = pop 결재 레이어를 해당 상태로 조회(요청자 관점)
				rlOpenPop(code, {accStatus: st==='pending' ? 'requested' : 'denied'});
			} else {
				// 발행 제출 = 작성자 관점으로 pop 결재 레이어
				rlOpenPop(code, {mode:'owner'});
			}
			closeInbox();
			return;
		}
	});
});
