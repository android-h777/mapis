/* ════════════════════════════════════════════════════════════
   Technical Report Hub — 공통 셸 유틸 (전 뷰 공유: docs / upload / review)
   esc · toast · notify(3채널 알림) · sidenav 초기화.
   뷰별 로직 = js/rptlib_docs.js · js/rptlib_upload.js · js/rptlib_review.js.
   실제 MAPIS 운영구조(껍데기 + 탭별 JS) 미러링 — 서버측 조립(Thymeleaf)만 뺀 형태.
   ════════════════════════════════════════════════════════════ */
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
/* 날짜 표시 포맷: 데이터는 ISO(YYYY-MM-DD, 정렬·필터용)로 두고, 화면 표시만 MM-DD-YYYY. 비-ISO/빈값은 그대로. */
function fmtDate(d){ d=String(d||''); var m=d.match(/^(\d{4})-(\d{2})-(\d{2})/); return m? m[2]+'-'+m[3]+'-'+m[1] : d; }
function toast(msg, kind){
	var ic={ok:'check_circle',info:'info',warn:'lock',mocha:'bolt',mail:'mail',todo:'add_task'}[kind||'info']||'info';
	var el=document.createElement('div'); el.className='rlToast '+(kind||'info');
	el.innerHTML='<i class="material-symbols-outlined">'+ic+'</i><span>'+esc(msg)+'</span>';
	var wrap=document.getElementById('rlToastWrap'); if(!wrap) return;
	wrap.appendChild(el);
	setTimeout(function(){ el.classList.add('fade'); setTimeout(function(){ el.remove(); },260); }, 2600);
}
/* 알림 발송 목업: 인앱 토스트 + 이메일 + To-Do (핸드오프마다 3채널 — kind: mail/todo) */
function notify(seq){ seq.forEach(function(n,i){ setTimeout(function(){ toast(n.msg, n.kind); }, i*340); }); }

/* ════════════════════════════════════════════════════════════
   공유 문서 뷰어 오픈 — code로 pop.html(상세/결재 모달)을 띄움. 전 뷰 공통 통일감의 핵심.
   docs.js openReport()는 REPORTS 코퍼스 한정 + 등급/지역 게이팅(발행본 열람규칙)이라,
   My Report(내 제출물=REPORTS 밖, 작성자는 항상 열람) · Bookmarks 에서는 이 게이트 없는 오프너를 씀.
   window name='rptpop_<code>' = docs.js와 동일 → 같은 문서는 어디서 열어도 한 창 재사용.
   params 예: {from:'mine'} → pop이 작성자/제출 관점으로 분기할 힌트(다른 세션이 pop에서 처리).
   ════════════════════════════════════════════════════════════ */
var _rlPops={};
function rlOpenPop(code, params){
	var q=''; if(params){ for(var k in params){ q+='&'+encodeURIComponent(k)+'='+encodeURIComponent(params[k]); } }
	var url='apis_rptlib_pop.html?code='+encodeURIComponent(code)+q;
	var name=('rptpop_'+code).replace(/[^A-Za-z0-9_]/g,'_');
	var w=_rlPops[name];
	if(w && !w.closed){ w.focus(); return; }
	var W=1520, H=880;
	var L=Math.max(0,((screen.availWidth-W)/2)|0), T=Math.max(0,((screen.availHeight-H)/2)|0);
	w=window.open(url, name, 'width='+W+',height='+H+',left='+L+',top='+T+',scrollbars=yes,resizable=yes');
	if(w){ _rlPops[name]=w; w.focus(); } else { location.href=url; }   // 팝업 차단 시 폴백
}

/* ════════════════════════════════════════════════════════════
   공유 데이터 레이어 — 제출물 단일 출처(Upload·Approval가 같은 배열을 역할별로 투영).
   실 MAPIS: 서버 컬렉션 1개를 역할 필터(내 outbox / 결재 큐)로 조회 → 프로토타입은 클라 배열로 미러.
   레코드 {code,title,author,bu,idx,type,status,when,hint,gates,kw,abstract,mine}
     status : pending | approved | rejected   (반려=사유 필수+재제출 가능, Changes 폐지). 분류 gates는 담당자가 채움(Option A)
     gates  : {itar,jda,region,external} → rptlib_review.js deriveClass로 class 도출(저장 안 함). region=1(국가/지역 기반)→C3, region=0(case-by-case)→C4
     mine:true = 로그인 사용자가 제출(→ Upload '내 Submissions'). 결재 큐는 전체(매니저 콘솔).
   ▼ 백엔드 주입: 실구현 au.ajaxGet2('/rptlib/submissions',{},...) 또는 th:inline ${submissions}
   ════════════════════════════════════════════════════════════ */
var RL_ME='Jongho Lee';   // 로그인 사용자(헤더와 일치) — '내 제출물(mine)' 판별 기준
var RL_SUBS=[
	// ── 결재 큐 시드(타인 제출 · mine:false) ──
	{code:'KR-26-001', title:'Low-Temperature Cure Silicone for Flexible Display', author:'S.Y. Park',     bu:'Electronic Materials', when:'2h ago', status:'pending',  hint:'Tied to an active JDA — please confirm scope.', gates:{itar:0,jda:1,region:1,external:0}, mine:false},
	{code:'LEV-26-003',title:'Bio-based Silicone Feasibility Study (JDA)',          author:'Dr. Stephan Boß', bu:'Industrial',           when:'5h ago', status:'pending',  hint:'Access limited to named individuals.',          gates:{itar:0,jda:1,region:0,external:0}, mine:false},
	{code:'SH-26-002', title:'Defoamer Performance in Architectural Coatings',      author:'Wei Zhang',       bu:'Coatings',             when:'1d ago', status:'pending',  hint:'',                                              gates:{itar:0,jda:0,region:0,external:0}, mine:false},
	{code:'ABD-26-004',title:'Specialty Fluids for Personal Care Formulations',     author:'J. Whitfield',    bu:'Personal Care',        when:'3d ago', status:'approved', hint:'',                                              gates:{itar:0,jda:0,region:0,external:1}, mine:false},
	{code:'ITC-26-002',title:'Antifoam Improvement Project — Phase 2',              author:'Indumathi M.',    bu:'Industrial',           when:'1w ago', status:'rejected', hint:'', reviewNote:'Plant-trial data incomplete — add Phase-2 results and resubmit.', gates:{itar:0,jda:0,region:0,external:0}, mine:false},
	// ── 내 제출물 시드(mine:true) ──
	{code:'KR-26-000', title:'OLED Encapsulation Adhesive — Scale-up',              author:RL_ME, bu:'Electronic Materials', site: 'KR', idx: 'KR', when:'2 days ago', status:'pending',  hint:'', gates:{itar:0,jda:0,region:0,external:0}, mine:true},
	{code:'SH-25-044', title:'Defoamer Screening for Decorative Coatings',          author:RL_ME, bu:'Coatings',             site: '', idx: '', when:'last week',  status:'approved', hint:'', gates:{itar:0,jda:0,region:0,external:0}, mine:true},
	{code:'TT-26-002', title:'Silane Coupling Agent Optimization',                  author:RL_ME, bu:'Tire & Silanes',       site: '', idx: '', when:'3 days ago', status:'rejected', hint:'', reviewNote:'Out of scope — ITAR-adjacent; route to the controlled repository.', gates:{itar:1,jda:0,region:0,external:0}, mine:true},
	{code:'KR-25-031', title:'UV-Curable Frontsheet Adhesion Study',                author:RL_ME, bu:'Electronic Materials', site: '', idx: '', when:'2 months ago', status:'approved', hint:'', gates:{itar:0,jda:0,region:0,external:0}, mine:true},
	{code:'KR-24-007', title:'Thermal Interface Material — Field Reliability',      author:RL_ME, bu:'Electronic Materials', site: '', idx: '', when:'last year',   status:'approved', hint:'', gates:{itar:0,jda:1,region:1,external:0}, mine:true}
];
function rlSubsMine(){ return RL_SUBS.filter(function(s){ return s.mine; }); }        // Upload outbox 투영
function rlSubsQueue(){ return RL_SUBS; }                                              // 결재 콘솔=전체(실구현은 approver==me 필터)
function rlSubByCode(c){ return RL_SUBS.filter(function(s){ return s.code===c; })[0]; }
function rlPendingCount(){ return RL_SUBS.filter(function(s){ return s.status==='pending'; }).length; }
/* 헤더 결재 배지(To-Do)를 미결 건수와 동기화 — 제출·결재 결정 시 호출 */
function rlSyncNoti(){ var e=document.getElementById('rlApprNoti'); if(!e) return; var p=rlPendingCount(); e.textContent=p; if(e.parentNode) e.parentNode.style.display=p?'':'none'; }

/* 사이드내브(전사 MAPIS 모듈 메뉴) 초기화 — 전 뷰 공통 */
$(document).ready(function(){
	$('.sidenav').sidenav();
	$(document).on('click', '.sidenav-overlay, .closeBtns', function(){ $('.sidenav').sidenav('close'); });
	rlSyncNoti();   // 로드 시 헤더 결재 배지 = 실제 미결 건수
});
