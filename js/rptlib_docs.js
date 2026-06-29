	/* ════════════════════════════════════════════════════════════
	   Technical Report Hub — 목업(시각 우선, 규칙 비enforce).
	   검색 = 상단 히어로(#rlSearchInput) + 가로 필터 칩(팝오버). 헤더 srchArea(#mainSrchInput) = global.
	   상호작용 = staged(쌓기) → Search 버튼이 일괄 적용(deferred). Home = 첫 화면 복귀+리셋.
	   ════════════════════════════════════════════════════════════ */

	// ════════════════════════════════════════════════════════════
	// ▼ 백엔드 주입 데이터 (BACKEND DATA SEAM) — 아래 var 들 = "서버가 내려줄 데이터"의 목업.
	//   실구현 시: 이 선언을 list.html 의 <script th:inline="javascript"> 로 옮기고
	//   var REPORTS = /*[[${reports}]]*/ []; 형태로 서버가 JSON 주입(주석이 치환됨),
	//   또는 동적 검색은 au.ajaxGet2('/rptlib/search', params, renderResults) 로 교체.
	//   지금은 정적 목업 리터럴. (관례: reference-mapis-frontend-conventions)
	// ════════════════════════════════════════════════════════════
	var INDEXES = [
		{id:'CN', nm:'CN — Shanghai'}, {id:'DE', nm:'DE — Leverkusen'}, {id:'IN', nm:'IN — Bangalore'},
		{id:'IT', nm:'IT — Termoli'}, {id:'JP', nm:'JP — Ohta'}, {id:'KR', nm:'KR — All Regions'},
		{id:'TH', nm:'Thailand'}, {id:'UK', nm:'UK — Abingdon'}, {id:'US', nm:'US — All Regions'}
	];
	var CLASSES = [
		{c:1, nm:'Class 1 · Public',            sc:'green',  dot:'rlc1', lock:false},
		{c:2, nm:'Class 2 · Internal',          sc:'blue',   dot:'rlc2', lock:false},
		{c:3, nm:'Class 3 · Confidential',      sc:'orange', dot:'rlc3', lock:true},
		{c:4, nm:'Class 4 · Highly Restricted', sc:'red',    dot:'rlc4', lock:true}
	];
	var TYPES = [
		{t:'TIS', nm:'TIS Report', ic:'article'}, {t:'TMR', nm:'Tech / Market Review', ic:'summarize'},
		{t:'PTM', nm:'Process Transfer Memo', ic:'swap_horiz'}, {t:'Trip', nm:'Trip Report', ic:'flight'},
		{t:'IP', nm:'Improvement Project', ic:'trending_up'}
	];
	function typeInfo(t){ return TYPES.filter(function(x){return x.t===t;})[0] || {t:t,nm:t,ic:'description'}; }
	function classInfo(c){ return CLASSES.filter(function(x){return x.c===c;})[0] || CLASSES[1]; }
	function idxName(id){ if(id) {var x=INDEXES.filter(function(i){return i.id===id;})[0]; return x?x.nm:id;} else {return "Not Selected";} }

	// ▼ 문서 레코드(핵심 "DB") — 백엔드: GET /rptlib/reports → th:inline ${reports}, 또는 검색 시 au.ajaxGet2 응답
	var REPORTS = [
		{code:'LEV-24-002',  title:'Bio-based Silicone Feasibility Study (JDA)',         type:'TIS', site:'LEV', idx:'DE', author:'Dr. Stephan Boß',           bu:'Industrial',           date:'2026-06-14', cls:4, hits:162},
		{code:'KR-23-011',   title:'Low-Temperature Cure Silicone for Flexible Display', type:'TIS', site:'KR',  idx:'KR', author:'S.Y. Park',                bu:'Electronic Materials', date:'2026-06-12', cls:3, hits:274},
		{code:'ITC-22-031',  title:'Antifoam Improvement Project — Phase 2',             type:'IP',  site:'ITC', idx:'IN', author:'Indumathi M.',             bu:'Industrial',           date:'2026-06-10', cls:2, hits:176},
		{code:'LEV-23-007',  title:'Development of a Baking Paper Release Coating',      type:'TIS', site:'LEV', idx:'DE', author:'Markus Bley',              bu:'Coatings',             date:'2026-06-05', cls:2, hits:352},
		{code:'TML-22-002',  title:'Resin Intermediate Process Transfer Memorandum',    type:'PTM', site:'TML', idx:'IT', author:'G. Rossi',                 bu:'Industrial',           date:'2026-05-28', cls:2, hits:205},
		{code:'KR-22-003',   title:'OLED Encapsulation Adhesive — Scale-up Request',     type:'PTM', site:'KR',  idx:'KR', author:'J.P. Kim',                 bu:'Electronic Materials', date:'2026-05-20', cls:2, hits:298},
		{code:'BKK-21-019',  title:'Sealant Field Trial Report — SE Asia',              type:'Trip',site:'BKK', idx:'TH', author:'S. Phong',                 bu:'Coatings',             date:'2026-05-12', cls:2, hits:188},
		{code:'SH-21-008',   title:'Defoamer Performance in Architectural Coatings',    type:'TIS', site:'SH',  idx:'CN', author:'Wei Zhang',                bu:'Coatings',             date:'2026-04-30', cls:2, hits:241},
		{code:'ABD-20-015',  title:'Specialty Fluids for Personal Care Formulations',   type:'TMR', site:'ABD', idx:'UK', author:'J. Whitfield',             bu:'Personal Care',        date:'2026-04-18', cls:1, hits:233},
		{code:'TT-18-012',   title:'Water Phase Sensory Elastomer',                     type:'TIS', site:'TT',  idx:'US', author:'Mukesh Kumar',             bu:'Personal Care',        date:'2026-03-22', cls:2, hits:359},
		{code:'SV-19-006',   title:'Urethane Additives Applications Guide',             type:'TMR', site:'SV',  idx:'US', author:'L. Heisler',               bu:'Urethane Additives',   date:'2026-02-15', cls:2, hits:432},
		{code:'SV-19-010',   title:'Urethane Additives Technology Review',              type:'TMR', site:'SV',  idx:'US', author:'L. Heisler',               bu:'Urethane Additives',   date:'2026-02-10', cls:2, hits:388},
		{code:'WTC-11-029',  title:'In-situ Functionalized Nano Ceria Dispersions',     type:'TIS', site:'WTC', idx:'IN', author:'Asha Jhonsi, Karthikeyan M.',bu:'Electronic Materials',date:'2026-01-20', cls:2, hits:554},
		{code:'JPN-15-004',  title:'Patent Survey for UV Curable Frontsheet',           type:'TIS', site:'JPN', idx:'JP', author:'Kazuhisa Ono',             bu:'Electronic Materials', date:'2025-12-08', cls:3, hits:518},
		{code:'TT-12-016',   title:'Silicone Fluids Technology Highlights — Annual',    type:'TMR', site:'TT',  idx:'US', author:'Global Silicone Fluids Tech',bu:'Specialty Additives', date:'2025-11-30', cls:3, hits:374},
		{code:'2008-MPM-016',title:'SF1632 Part 1: Root Cause Analysis',                type:'TIS', site:'WF',  idx:'US', author:'Global Silicone Fluids Tech',bu:'Specialty Additives', date:'2025-11-12', cls:4, hits:379},
		{code:'JPN-10-007',  title:'Effect of Crosslinkage and Reinforcement',          type:'TIS', site:'JPN', idx:'JP', author:'H. Sato',                  bu:'Industrial',           date:'2025-10-05', cls:2, hits:572},
		{code:'JPN-09-024',  title:'HCR New Portfolio; The Development Roadmap',         type:'TIS', site:'JPN', idx:'JP', author:'T. Nakamura',              bu:'Industrial',           date:'2025-09-18', cls:3, hits:575},
		{code:'ITC-12-013',  title:'Patentability Search: Acrylate Functional Silicones',type:'TIS',site:'ITC',idx:'IN', author:'Madhuri Raju, A. Dhanabalan',bu:'Specialty Additives',date:'2025-08-22', cls:1, hits:632},
		{code:'WTC-11-045',  title:'Surface Modification of Ceria Using Silanes',       type:'TIS', site:'WTC', idx:'IN', author:'Karthikeyan Murugesan',    bu:'Tire & Silanes',       date:'2025-07-30', cls:2, hits:636},
		{code:'TT-11-016',   title:'Hydrosilylation with Iron-Pyridine Catalysts',      type:'TIS', site:'TT',  idx:'US', author:'Kenrick M. Lewis',         bu:'Specialty Additives',  date:'2025-06-25', cls:2, hits:798},
		{code:'LEV-20-027',  title:'Liquid Silicone Rubber — Handbook of Processing',   type:'TIS', site:'LEV', idx:'DE', author:'Enise Michalski',          bu:'Healthcare',           date:'2025-05-15', cls:2, hits:1441}
	];
	var MY_REGION = 'US';   // 데모상 접근 권역(잠금 시각 표현용 — enforce 아님)
	/* 접근권한 없음(잠금) = Class 3·4 이면서 내 권역이 아닌 문서. 그리드 locked 표시·검색 본문제외·스니펫 차단 공통 기준. */
	function isLocked(r){ return r.cls>=3 && r.idx!==MY_REGION; }
	var MAXHITS = Math.max.apply(null, REPORTS.map(function(r){return r.hits;}));
	var DATE_LABELS = {all:'Any time','2024':'2023 – now','2018':'2018 – 2022','0':'Before 2018'};

	/* 본문 요약(목업) — 풀텍스트 검색 스니펫·하이라이트 재료(실제론 OCR·역색인 본문) */
	// ▼ 백엔드 주입: 본문 풀텍스트(ES 인덱스) — 검색 응답에 포함되거나 th:inline ${summaries}
	var SUMMARIES = {
		'LEV-24-002':'Joint development assessment of bio-based silicone backbones from renewable feedstock; evaluates cure behavior, mechanical properties and cost parity versus petroleum-based grades.',
		'KR-23-011':'A low-temperature platinum-cure silicone for flexible OLED displays, characterizing cure kinetics below 100 °C and adhesion to polyimide substrates.',
		'ITC-22-031':'Phase-2 antifoam improvement project optimizing siloxane polyether dispersions to reduce foam in pulp and paper processing; includes plant trial data.',
		'LEV-23-007':'Development of a solvent-free silicone release coating for baking paper, balancing release force and anchorage on supercalendered kraft.',
		'TML-22-002':'Process transfer memorandum for a resin intermediate, detailing reactor parameters, distillation cuts and quality limits for scale-up at Termoli.',
		'KR-22-003':'Scale-up request for an OLED encapsulation adhesive, summarizing rheology, moisture-barrier performance and pot-life under production conditions.',
		'BKK-21-019':'Field trial of a one-part construction sealant across Southeast Asian climates, reporting weathering, adhesion and gunnability after twelve months.',
		'SH-21-008':'Comparative study of silicone defoamer performance in architectural water-based coatings, ranking persistence and recoatability.',
		'ABD-20-015':'Technology and market review of specialty fluids for personal-care formulations, covering sensory profiles and regulatory status in the EU and US.',
		'TT-18-012':'Water-phase sensory elastomer study evaluating thickening efficiency and skin-feel in cosmetic emulsions.',
		'SV-19-006':'Applications guide for urethane additive surfactants in flexible and rigid foam, with cell-structure and stability recommendations.',
		'SV-19-010':'Technology review of urethane additive chemistries, mapping silicone surfactant structures to foam performance windows.',
		'WTC-11-029':'In-situ functionalized nano ceria dispersions for chemical-mechanical planarization, describing particle-size control and abrasive selectivity.',
		'JPN-15-004':'Patent landscape survey for UV-curable frontsheet materials in photovoltaic modules, identifying white-space and freedom-to-operate risks.',
		'TT-12-016':'Annual technology highlights for the silicone fluids portfolio, summarizing new hydrosilylation catalysts and emulsion advances.',
		'2008-MPM-016':'Root-cause analysis of SF1632 fluid discoloration, tracing the issue to trace iron contamination in the hydrosilylation step.',
		'JPN-10-007':'Effect of crosslink density and silica reinforcement on the tensile and tear strength of high-consistency silicone rubber.',
		'JPN-09-024':'Development roadmap for the high-consistency rubber portfolio, outlining new grades for automotive and electronics sealing.',
		'ITC-12-013':'Patentability search for acrylate-functional silicones, reviewing prior art on photo-curable backbone modifications.',
		'WTC-11-045':'Surface modification of ceria nanoparticles using organofunctional silanes to improve dispersion stability in polishing slurries.',
		'TT-11-016':'Hydrosilylation catalyzed by iron–pyridine diimine complexes as a platinum-free alternative; reports kinetics and selectivity at 80 °C.',
		'LEV-20-027':'Handbook of liquid silicone rubber processing, covering injection molding, cure rheology and demolding for LSR parts.'
	};
	function summaryOf(code){ return SUMMARIES[code] || ''; }
	/* 결과 내 재검색(within) 대상 = 현재 보이는 컬럼만(Document 항상 포함). 메인 검색(q)은 본문까지 풀텍스트라 구분됨. */
	function colText(r,k){
		if(k==='code') return r.code;
		if(k==='type') return r.type;
		if(k==='region') return idxName(r.idx);
		if(k==='site') return r.site;
		if(k==='cls') return 'Class '+r.cls+' C'+r.cls;
		if(k==='bu') return r.bu;
		if(k==='seg') return segOf(r.bu);
		if(k==='author') return r.author;
		if(k==='date') return fmtDate(r.date);
		if(k==='pages') return ''+pagesOf(r);
		if(k==='views') return r.hits+' views';
		return '';
	}
	function withinText(r){ return (r.title+' '+visCols().map(function(c){return colText(r,c.key);}).join(' ')).toLowerCase(); }

	/* esc · toast · notify → js/rptlib_common.js (공통) */

	/* ── staged 상태(좌 패널 대신 칩/검색창이 편집) ── */
	var activeIdx={}; INDEXES.forEach(function(i){ activeIdx[i.id]=true; });
	var activeCls={1:true,2:true,3:true,4:true};
	var stType='all', stDate='all', stBu='all';
	var applied=null;      // 적용 스냅샷(우측 렌더 기준). null = Discovery
	var searchMode=false;  // 현재 뷰가 Results 인가
	var hasSearched=false; // 1회라도 실제 검색/필터를 적용했나 — 히어로 대형(home)↔얇게(검색후) 전환용
	var dirty=false;       // staged 미적용 → Search 버튼 활성
	var openPop=null;      // 현재 열린 칩 팝오버 key
	var selected={};       // 결과 다중선택(코드 → true)
	var basket={};         // Document Basket(코드 → true) — 검색을 넘어 유지되는 수집함
	var pageSize=10;       // 페이지당 결과 수(22건이라도 페이지네이션이 실제로 동작)
	var pageNum=1;         // 현재 페이지(1-base)
	var withinQuery='';    // 결과 내 재검색(live — applied 스냅샷과 별개)
	var basketOpen=false;  // Basket 드로어 열림
	var colsOpen=false;    // 컬럼 선택 팝오버 열림
	var colFilter={};      // 컬럼별 즉시 필터(key → 값/contains 문자열) — 결과를 그 자리에서 좁힘(탐색기식)
	var showColFilter=false; // 컬럼 필터 행 표시
	var focusCF=null;      // 필터 행 텍스트 입력 재포커스 key
	var _filterDeb=null;   // within·컬럼 텍스트필터 debounce 타이머
	var dragColKey=null;   // 드래그 중 컬럼 key
	var focusWithin=false; // 재검색 입력 재포커스 플래그(키 입력 중 re-render)
	var _keepScroll=false; // true면 renderResults가 그리드 내부 scrollTop 유지(in-place 토글: expand·basket·전체선택·그룹접기 — 스크롤 맨위 점프 방지)
	var sorts=[];   // N단계 정렬(index0=1차). dir:1 오름/-1 내림. 빈 배열=정렬없음(기본순). Sort 패널·헤더가 함께 편집.
	var sortOpen=false;               // Sort 패널(Excel식) 열림
	var srtDrag=null;                 // Sort 레벨 드래그 인덱스
	var groupBy='none';        // 결과 그룹핑: 'none' | 'region' | 'type' | 'cls'
	var collapsedGroups={};    // 접힌 그룹(groupBy:key → true)
	var expanded={};           // 행 인라인 확장(코드 → true)

	/* ── 메타 파생(목업) — 컬럼 팔레트 풍부화용 ── */
	var SEGMAP={Elastomers:'Performance Additives',Fluids:'Silicone Fluids',Coatings:'Coatings & Release',Resins:'Resins',Sealants:'Sealants & Adhesives',Specialty:'Specialty Fluids',Additives:'Urethane Additives','Personal Care':'Consumer Solutions'};
	function segOf(bu){ return SEGMAP[bu]||bu; }
	function pagesOf(r){ return (r.hits % 38) + 9; }

	/* ── 결과 컬럼 모델. cell(r,q): q 있으면 셀 값에도 키워드 하이라이트(제목·스니펫에 더해 컬럼까지) ── */
	var COLS=[
		{key:'code',  label:'Doc #',         w:'112px',               sort:'code',   on:true,  cc:'mono', cell:function(r,q){return hlt(r.code,q);}},
		{key:'type',  label:'Type',          w:'80px',                sort:'type',   on:true,  cell:function(r,q){return hlt(r.type,q);}},
		{key:'region',label:'Region',        w:'minmax(116px,160px)', sort:'region', on:true,  cc:'rgn', cell:function(r,q){return '<i class="material-symbols-outlined">public</i><span class="rgnTxt">'+hlt(idxName(r.idx),q)+'</span>';}},
		{key:'site',  label:'Site',          w:'68px',                sort:'site',   on:false, cell:function(r,q){return hlt(r.site,q);}},
		{key:'cls',   label:'Class',         w:'74px',                sort:'cls',    on:true,  cell:function(r){return classBadge(r.cls);}},
		{key:'bu',    label:'Business Unit', w:'118px',               sort:'bu',     on:false, cc:'auth', cell:function(r,q){return hlt(r.bu,q);}},
		{key:'seg',   label:'Segment',       w:'138px',               sort:'seg',    on:false, cc:'auth', cell:function(r,q){return hlt(segOf(r.bu),q);}},
		{key:'author',label:'Author',        w:'minmax(120px,160px)', sort:'author', on:true,  cc:'auth', cell:function(r,q){return hlt(r.author,q);}},
		{key:'date',  label:'Date',          w:'98px',                sort:'date',   on:true,  cc:'dt', cell:function(r,q){return hlt(fmtDate(r.date),q);}},
		{key:'pages', label:'Pages',         w:'64px',                sort:'pages',  on:false, cc:'num', num:true, cell:function(r){return pagesOf(r);}},
		{key:'views', label:'Views',         w:'80px',                sort:'hits',   on:true,  cc:'num', num:true, cell:function(r){return r.hits+'<span class="u">views</span>';}},
		{key:'score',   label:'Score',    w:'76px',  sort:'score',   on:true,  cc:'num rel', num:true, cell:function(r){ var q=(applied&&applied.q)||''; return q? '<b>'+qScore(r,q)+'</b><span class="u">%</span>' : '<span class="cDim">—</span>'; }},
		{key:'khits',   label:'Hits',     w:'60px',  sort:'khits',   on:false, cc:'num rel', num:true, cell:function(r){ var q=(applied&&applied.q)||''; return q? qHits(r,q) : '<span class="cDim">—</span>'; }},
		{key:'hitrate', label:'Hit rate', w:'82px',  sort:'hitrate', on:false, cc:'num rel', num:true, cell:function(r){ var q=(applied&&applied.q)||''; return q? qRate(r,q).toFixed(2)+'<span class="u">/pg</span>' : '<span class="cDim">—</span>'; }}
	];
	function visCols(){ return COLS.filter(function(c){return c.on;}); }
	function colByKey(k){ return COLS.filter(function(c){return c.key===k;})[0]; }
	function colIndex(k){ for(var i=0;i<COLS.length;i++){ if(COLS[i].key===k) return i; } return -1; }
	function moveCol(fromKey,toKey,after){
		if(fromKey===toKey) return;
		var fi=colIndex(fromKey); if(fi<0) return; var item=COLS.splice(fi,1)[0];
		var ti=colIndex(toKey); if(ti<0){ COLS.push(item); return; } COLS.splice(after?ti+1:ti,0,item);
	}
	/* 기본 레이아웃 스냅샷(Reset용) — 컬럼 순서·표시 */
	var DEFAULT_COL_ORDER=COLS.map(function(c){return c.key;});
	var DEFAULT_COL_ON={}; COLS.forEach(function(c){ DEFAULT_COL_ON[c.key]=c.on; });
	function resetLayout(){
		COLS.sort(function(a,b){ return DEFAULT_COL_ORDER.indexOf(a.key)-DEFAULT_COL_ORDER.indexOf(b.key); });
		COLS.forEach(function(c){ c.on=DEFAULT_COL_ON[c.key]; });
		sorts=[];
		colFilter={}; showColFilter=false; groupBy='none'; pageSize=10; pageNum=1; colsOpen=false;
		try{ localStorage.removeItem('rlLayout'); }catch(e){}
		renderResults();
	}
	function basketCount(){ return Object.keys(basket).length; }
	/* 관련도 점수(목업) — 제목 > 본문 > 메타 매치, hits로 tie-break */
	function relScore(r,q){
		if(!q) return r.hits;
		var ql=q.toLowerCase(), sc=0;
		if(String(r.title).toLowerCase().indexOf(ql)>=0) sc=300;
		else if(!isLocked(r) && summaryOf(r.code).toLowerCase().indexOf(ql)>=0) sc=180;   // 본문 매치 점수는 접근권한 있을 때만
		else if((r.author+' '+r.code+' '+r.bu+' '+r.type).toLowerCase().indexOf(ql)>=0) sc=90;
		return sc*1000 + r.hits;
	}
	/* ── 검색 결과 메트릭(목업) — 쿼리 있을 때만 의미. within/컬럼필터 제외(colText·colFiltType 케이스 미추가로 자동) ── */
	function qHits(r,q){ q=String(q||'').toLowerCase(); if(!q) return 0;
		var hay=(r.title+' '+(isLocked(r)?'':summaryOf(r.code))+' '+r.author+' '+r.code+' '+r.bu+' '+r.type).toLowerCase();
		var n=0,i=hay.indexOf(q); while(i>=0){ n++; i=hay.indexOf(q,i+q.length); } return n; }
	function qScore(r,q){ q=String(q||'').toLowerCase(); if(!q) return 0; var base=0;
		if(r.title.toLowerCase().indexOf(q)>=0) base=85;
		else if(!isLocked(r) && summaryOf(r.code).toLowerCase().indexOf(q)>=0) base=60;
		else if((r.author+' '+r.code+' '+r.bu+' '+r.type).toLowerCase().indexOf(q)>=0) base=35;
		else return 0;
		return Math.min(100, base + Math.min(15,(qHits(r,q)-1)*4)); }
	function qRate(r,q){ return q? qHits(r,q)/pagesOf(r) : 0; }
	/* 실제 파일 다운로드(목업 아님 — Blob) */
	function downloadBlob(content, mime, fname){
		var blob=new Blob([content],{type:mime});
		var url=URL.createObjectURL(blob); var a=document.createElement('a');
		a.href=url; a.download=fname; document.body.appendChild(a); a.click(); a.remove();
		setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
	}
	function exportCsv(codes, fname){
		var rows=[['Document #','Title','Type','Region','Class','Date','Author','Business Unit','Views']];
		codes.forEach(function(code){ var r=REPORTS.filter(function(x){return x.code===code;})[0]; if(!r) return;
			rows.push([r.code,r.title,r.type,idxName(r.idx),'Class '+r.cls,fmtDate(r.date),r.author,r.bu,r.hits]); });
		var csv=rows.map(function(row){ return row.map(function(v){ var s=String(v).replace(/"/g,'""'); return /[",\n]/.test(s)?'"'+s+'"':s; }).join(','); }).join('\n');
		downloadBlob('﻿'+csv, 'text/csv;charset=utf-8;', fname||'reports.csv');
	}
	/* 인용/Cite 기능 제거(사용자 요청) — 사내 기술보고서 도구엔 학술 인용(.ris/copy citation) 패턴 불필요 */
	/* 분리·무마찰 저장: 컬럼/정렬/페이지크기/그룹 = 개인 레이아웃으로 자동 기억(localStorage). 필터는 Saved filters(별도). */
	function saveLayout(){
		try{ localStorage.setItem('rlLayout', JSON.stringify({
			cols: COLS.filter(function(c){return c.on;}).map(function(c){return c.key;}),
			colOrder: COLS.map(function(c){return c.key;}),
			pageSize:pageSize, sorts:sorts, groupBy:groupBy
		})); }catch(e){}
	}
	function loadLayout(){
		try{ var s=localStorage.getItem('rlLayout'); if(!s) return; var L=JSON.parse(s);
			if(L.colOrder && L.colOrder.length){ COLS.sort(function(a,b){ var ia=L.colOrder.indexOf(a.key), ib=L.colOrder.indexOf(b.key); if(ia<0)ia=99; if(ib<0)ib=99; return ia-ib; }); }
			if(L.cols && L.cols.length){ COLS.forEach(function(c){ c.on = L.cols.indexOf(c.key)>=0; }); }
			if(L.pageSize) pageSize=L.pageSize;
			if(Array.isArray(L.sorts)){ sorts=L.sorts.filter(function(s){return s&&s.key;}).map(function(s){return {key:s.key,dir:s.dir<0?-1:1};}); }   // 빈 배열(정렬없음)도 그대로 복원
			else if(L.sortKey){ sorts=[{key:L.sortKey,dir:L.sortDir<0?-1:1}]; if(L.sort2Key) sorts.push({key:L.sort2Key,dir:L.sort2Dir<0?-1:1}); }   // 구 레이아웃 호환
			if(typeof L.groupBy==='string') groupBy=L.groupBy;
		}catch(e){}
	}

	function stagedQuery(){ return (document.getElementById('rlSearchInput').value||'').trim(); }
	function snapshotApplied(){
		applied={ q:stagedQuery(), idx:Object.assign({},activeIdx), cls:Object.assign({},activeCls), type:stType, date:stDate, bu:stBu };
		saveFilters();   // 최근 지정 필터 영속(다음 진입 초기 세팅) — 키워드(q)는 제외
	}
	/* 최근 지정 필터(패싯만) localStorage 저장/복원 — 키워드는 RECENT(rlRecent), 레이아웃은 rlLayout이 별도 담당 */
	function saveFilters(){ try{ localStorage.setItem('rlFilters', JSON.stringify({ idx:activeIdx, cls:activeCls, type:stType, date:stDate, bu:stBu })); }catch(e){} }
	function loadFilters(){
		try{ var s=localStorage.getItem('rlFilters'); if(!s) return; var F=JSON.parse(s); if(!F||typeof F!=='object') return;
			if(F.idx){ INDEXES.forEach(function(i){ activeIdx[i.id] = (F.idx[i.id]!==false); }); }   // 알려진 권역만 반영(누락=기본 on)
			if(F.cls){ [1,2,3,4].forEach(function(c){ activeCls[c] = (F.cls[c]!==false); }); }
			if(typeof F.type==='string') stType=F.type;
			if(typeof F.date==='string') stDate=F.date;
			if(typeof F.bu==='string') stBu=F.bu;
		}catch(e){}
	}
	function setDirty(v){ dirty=!!v; var b=document.getElementById('rlSearchBtn'); if(b) b.classList.toggle('off', !dirty); }

	var rlPops={};   // 열린 문서 팝업 레지스트리(코드별 window) — 중복창 방지/재포커스
	function openReport(code){
		var r=REPORTS.filter(function(x){return x.code===code;})[0]; if(!r) return;
		// restricted(cls≥3)도 일단 연다 — pop이 잠금 화면 + 열람요청 CTA를 띄움(세부 게이트는 추후)
		var q=(applied&&applied.q)?('&q='+encodeURIComponent(applied.q)):'';
		var url='apis_rptlib_pop.html?code='+encodeURIComponent(code)+q;
		var name=('rptpop_'+code).replace(/[^A-Za-z0-9_]/g,'_');   // window name=코드 기반 → 같은 문서는 한 창
		var w=rlPops[name];
		if(w && !w.closed){ w.focus(); return; }                   // 이미 열림 → reload 없이 앞으로(입력상태 보존)
		var W=1520, H=880;
		var L=Math.max(0,((screen.availWidth-W)/2)|0), T=Math.max(0,((screen.availHeight-H)/2)|0);
		w=window.open(url, name, 'width='+W+',height='+H+',left='+L+',top='+T+',scrollbars=yes,resizable=yes');
		if(w){ rlPops[name]=w; w.focus(); } else { location.href=url; }   // 팝업 차단 시 폴백(네비게이션)
	}

	/* ── 인라인 등급 배지(카드·순위·결과행 공통) ── */
	function classBadge(c){ return '<span class="rlClassBadge c'+c+'">'+(classInfo(c).lock?'<i class="material-symbols-outlined">lock</i>':'')+'C'+c+'</span>'; }

	/* ════════════ 필터 칩 + 팝오버 ════════════ */
	function busList(){ var bus=[]; REPORTS.forEach(function(r){ if(bus.indexOf(r.bu)<0) bus.push(r.bu); }); bus.sort(); return bus; }
	function idxOnCount(){ return INDEXES.filter(function(i){return activeIdx[i.id];}).length; }
	function clsOnList(){ return [1,2,3,4].filter(function(c){return activeCls[c];}); }
	var CHIPS=[
		{key:'type',   ic:'description', name:'Doc. Type'},
		{key:'region', ic:'public',      name:'Region'},
		{key:'class',  ic:'shield',      name:'Class'},
		{key:'date',   ic:'event',       name:'Date'},
		{key:'bu',     ic:'apartment',   name:'BU'}
	];
	function chipState(key){
		if(key==='type')   return {active:stType!=='all', text:stType==='all'?'Doc. Type':'Doc. Type · '+typeInfo(stType).t};
		if(key==='region'){ var sel=INDEXES.filter(function(i){return activeIdx[i.id];}); return {active:sel.length!==INDEXES.length, text:sel.length===INDEXES.length?'Region':'Region · '+sel.map(function(i){return i.id;}).join(', ')}; }
		if(key==='class'){ var on=clsOnList(); return {active:on.length!==4, text:on.length===4?'Class':'Class · '+on.map(function(c){return 'C'+c;}).join(',')}; }
		if(key==='date')   return {active:stDate!=='all', text:stDate==='all'?'Date':'Date · '+DATE_LABELS[stDate]};
		if(key==='bu')     return {active:stBu!=='all', text:stBu==='all'?'BU':'BU · '+stBu};
		return {active:false, text:key};
	}
	function renderChips(){
		document.getElementById('rlChips').innerHTML=CHIPS.map(function(c){
			var s=chipState(c.key);
			return '<a href="javascript:;" class="rlChip'+(s.active?' on':'')+(openPop===c.key?' open':'')+'" data-chip="'+c.key+'">'+
				'<i class="material-symbols-outlined ci">'+c.ic+'</i><span class="lab">'+esc(s.text)+'</span>'+
				(s.active?'<i class="material-symbols-outlined cx" data-clear="'+c.key+'">close</i>':'<i class="material-symbols-outlined ar">expand_more</i>')+
			'</a>';
		}).join('');
	}
	function popContent(key){
		if(key==='region'){
			var on=idxOnCount();
			var rows=INDEXES.map(function(i){
				var cnt=REPORTS.filter(function(r){return r.idx===i.id;}).length;
				return '<label class="rlChk"><input type="checkbox" class="filled-in" data-idx="'+i.id+'"'+(activeIdx[i.id]?' checked':'')+'/>'+
					'<span class="nm">'+esc(i.nm)+'</span><span class="rc">'+cnt+'</span></label>';
			}).join('');
			return '<div class="popHead">Region Indexes<span class="lnk" data-idxtoggle>'+(on===INDEXES.length?'Deselect all':'Select all')+'</span></div><div class="popList">'+rows+'</div>';
		}
		if(key==='class'){
			var rows=CLASSES.map(function(c){
				var cnt=REPORTS.filter(function(r){return r.cls===c.c;}).length;
				return '<label class="rlChk"><input type="checkbox" class="filled-in" data-cls="'+c.c+'"'+(activeCls[c.c]?' checked':'')+'/>'+
					'<span class="nm"><span class="cdot '+c.dot+'"></span>'+esc(c.nm)+'</span>'+
					(c.lock?'<i class="material-symbols-outlined">lock</i>':'')+'<span class="rc">'+cnt+'</span></label>';
			}).join('');
			return '<div class="popHead">Classification</div><div class="popList">'+rows+'</div>';
		}
		if(key==='type'){
			var opts=[{v:'all',t:'All types'}].concat(TYPES.map(function(t){return {v:t.t,t:t.nm+' ('+REPORTS.filter(function(r){return r.type===t.t;}).length+')'};}));
			return '<div class="popList opt">'+opts.map(function(o){return '<a href="javascript:;" class="popOpt'+(stType===o.v?' sel':'')+'" data-type="'+esc(o.v)+'">'+esc(o.t)+(stType===o.v?'<i class="material-symbols-outlined">check</i>':'')+'</a>';}).join('')+'</div>';
		}
		if(key==='date'){
			var ds=[['all','Any time'],['2024','2023 – now'],['2018','2018 – 2022'],['0','Before 2018']];
			return '<div class="popList opt">'+ds.map(function(d){return '<a href="javascript:;" class="popOpt'+(stDate===d[0]?' sel':'')+'" data-date="'+d[0]+'">'+esc(d[1])+(stDate===d[0]?'<i class="material-symbols-outlined">check</i>':'')+'</a>';}).join('')+'</div>';
		}
		if(key==='bu'){
			var opts=[{v:'all',t:'All BUs'}].concat(busList().map(function(b){return {v:b,t:b};}));
			return '<div class="popList opt">'+opts.map(function(o){return '<a href="javascript:;" class="popOpt'+(stBu===o.v?' sel':'')+'" data-bu="'+esc(o.v)+'">'+esc(o.t)+(stBu===o.v?'<i class="material-symbols-outlined">check</i>':'')+'</a>';}).join('')+'</div>';
		}
		return '';
	}
	function openPopover(key){
		if(openPop===key){ closePopover(); return; }
		closeAuto();
		openPop=key;
		var pop=document.getElementById('rlPop');
		pop.innerHTML=popContent(key);
		var chip=document.querySelector('.rlChip[data-chip="'+key+'"]');
		if(chip){ var left=chip.offsetLeft; var bar=document.getElementById('rlFilterBar');
			pop.style.left=Math.min(left, bar.clientWidth-Math.min(300,pop.offsetWidth||280)-2)+'px'; }
		pop.classList.add('show');
		renderChips();
	}
	function closePopover(){ if(openPop===null) return; openPop=null; var pop=document.getElementById('rlPop'); pop.classList.remove('show'); pop.innerHTML=''; renderChips(); }
	function clearChip(key){
		if(key==='type') stType='all';
		else if(key==='region') INDEXES.forEach(function(i){ activeIdx[i.id]=true; });
		else if(key==='class') activeCls={1:true,2:true,3:true,4:true};
		else if(key==='date') stDate='all';
		else if(key==='bu') stBu='all';
		onStageChange();
	}
	/* 패싯 변경 = 스테이징만(검색에 종속). 칩 표시 + Search 버튼만 갱신하고, 그리드 반영은 Search 클릭 때 일괄.
	   region/class 다중선택 팝오버는 열린 채 staged 갱신, 단일선택(type/date/bu)은 각 핸들러가 직후 닫음.
	   자유텍스트(검색어)도 동일하게 input=setDirty → Enter/Search로 함께 적용. */
	function onStageChange(){ setDirty(true); renderChips(); }

	/* ════════════ 검색창 드롭다운: Recent(키워드만, 칩 형태, 포커스 시) ════════════ */
	var RECENT=[];
	function loadRecent(){ try{ var s=localStorage.getItem('rlRecent'); if(s) RECENT=JSON.parse(s)||[]; }catch(e){} }
	/* 최근 본 문서(이어보기) — pop.html이 'rlRecentDocs'에 기록한 코드 목록. Summary 카드로 표시. ('rlRecent'=검색기록과 별개) */
	function rlRecentDocs(){ try{ return JSON.parse(localStorage.getItem('rlRecentDocs'))||[]; }catch(e){ return []; } }
	function pushRecent(q){ q=(q||'').trim(); if(!q) return; RECENT=RECENT.filter(function(x){return x!==q;}); RECENT.unshift(q); RECENT=RECENT.slice(0,8); try{ localStorage.setItem('rlRecent', JSON.stringify(RECENT)); }catch(e){} }
	function deleteRecent(q){ RECENT=RECENT.filter(function(x){return x!==q;}); try{ localStorage.setItem('rlRecent', JSON.stringify(RECENT)); }catch(e){} renderSearchAuto(); }   // pill의 X — 단건 삭제 후 드롭다운 유지
	function openAuto(){ renderSearchAuto(); var a=document.getElementById('rlSearchAuto'); if(a) a.classList.add('show'); }
	function closeAuto(){ var a=document.getElementById('rlSearchAuto'); if(a) a.classList.remove('show'); }
	function renderSearchAuto(){
		var qv=(document.getElementById('rlSearchInput').value||'').trim().toLowerCase();
		var rec=RECENT.filter(function(r){ return !qv || r.toLowerCase().indexOf(qv)>=0; });
		var h='<div class="saSec"><div class="saHead">Recent</div>';
		h+= rec.length? '<div class="saChips">'+rec.map(function(r){ return '<a href="javascript:;" class="saRecent" data-rec="'+esc(r)+'"><i class="material-symbols-outlined">history</i>'+esc(r)+'<i class="material-symbols-outlined saRecentDel" data-recdel="'+esc(r)+'" title="Remove from recent">close</i></a>'; }).join('')+'</div>' : '<div class="saNone">No recent searches</div>';
		h+='</div>';
		var el=document.getElementById('rlSearchAuto'); if(el) el.innerHTML=h;
	}

	/* ════════════ Discovery(빈 상태) ════════════ */
	function repCard(r){
		return '<div class="rlRepCard glassHover" data-code="'+esc(r.code)+'">'+
			'<div class="rcTop"><span class="rcType">'+esc(r.type)+'</span>'+classBadge(r.cls)+'</div>'+
			'<div class="rcTitle">'+esc(r.title)+'</div>'+
			'<div class="rcMeta"><span class="code">'+esc(r.code)+'</span><span class="dot">·</span>'+esc(r.author)+'</div>'+
			'<div class="rcFoot"><span class="rcSite"><i class="material-symbols-outlined">public</i>'+esc(idxName(r.idx))+'</span>'+
			'<span style="margin-left:auto;font-size:11px;color:#bcae9d;">'+esc(fmtDate(r.date))+'</span></div>'+
		'</div>';
	}
	function rankRow(r,i){
		var pct=Math.max(6, Math.round(r.hits/MAXHITS*100));
		return '<div class="rlRankRow" data-code="'+esc(r.code)+'"><span class="rlRankNo">'+(i+1)+'</span>'+
			'<div class="rlRankMain"><div class="rlRankTit">'+esc(r.title)+'</div>'+
			'<div class="rlRankSub"><span class="code">'+esc(r.code)+'</span>'+classBadge(r.cls)+
			'<span>'+esc(idxName(r.idx))+'</span></div></div>'+
			'<div class="rlRankBar"><span style="width:'+pct+'%"></span></div>'+
			'<span class="rlRankHits"><i class="material-symbols-outlined">visibility</i>'+r.hits+'</span></div>';
	}
	function renderDiscovery(){
		searchMode=false;
		var recent=REPORTS.slice().sort(function(a,b){return a.date<b.date?1:-1;}).slice(0,12);
		var ranked=REPORTS.slice().sort(function(a,b){return b.hits-a.hits;}).slice(0,8);
		var html='<div class="rlDiscover hScroll">';
		html+='<div class="rlIntro"><div class="rlIntroTxt">'+
			'<h1><i class="material-symbols-outlined">database</i>Technical Report Hub</h1>'+
			'<p>Momentive Global Technology — find, read, and contribute technical reports across all sites and regions.</p>'+
			'</div><div class="rlIntroStats">'+
			'<div class="rlStat"><b>12,480</b><span>Reports</span></div>'+
			'<div class="rlStat"><b>9</b><span>Region indexes</span></div>'+
			'<div class="rlStat"><b>37</b><span>Added this week</span></div></div></div>';
		// 최근 본 문서(이어보기) — pop에서 연 문서를 localStorage에서 읽어 카드 줄로(기록 있을 때만 노출)
		var rv=rlRecentDocs().map(function(c){ return REPORTS.filter(function(r){return r.code===c;})[0]; }).filter(Boolean).slice(0,10);
		if(rv.length){ html+='<div class="rlSec"><div class="rlSecHead"><span class="st"><i class="material-symbols-outlined">history</i>Recently viewed</span>'+
			'<span class="more" id="rlRvClear">Clear<i class="material-symbols-outlined">close</i></span></div>'+
			'<div class="rlCardRow hScroll">'+rv.map(repCard).join('')+'</div></div>'; }
		html+='<div class="rlSec"><div class="rlSecHead"><span class="st"><i class="material-symbols-outlined">schedule</i>Recently Added</span>'+
			'<span class="more" data-browse="recent">View all<i class="material-symbols-outlined">chevron_right</i></span></div>'+
			'<div class="rlCardRow hScroll">'+recent.map(repCard).join('')+'</div></div>';
		html+='<div class="rlSec"><div class="rlSecHead"><span class="st"><i class="material-symbols-outlined">local_fire_department</i>Most Viewed</span>'+
			'<span class="more" data-browse="top">View all<i class="material-symbols-outlined">chevron_right</i></span></div>'+
			'<div class="rlRankList">'+ranked.map(function(r,i){return rankRow(r,i);}).join('')+'</div></div>';
		html+='<div class="rlSec"><div class="rlSecHead"><span class="st"><i class="material-symbols-outlined">category</i>Browse by Document Type</span></div>'+
			'<div class="rlTypeTiles">'+TYPES.map(function(t){
				return '<div class="rlTypeTile" data-type="'+t.t+'"><i class="material-symbols-outlined">'+t.ic+'</i>'+
					'<div><div class="tt">'+esc(t.nm)+'</div><div class="tc">'+REPORTS.filter(function(r){return r.type===t.t;}).length+' reports</div></div></div>';
			}).join('')+'</div></div>';
		html+='<div class="rlSec"><div class="rlSecHead"><span class="st"><i class="material-symbols-outlined">travel_explore</i>Browse by Region</span></div>'+
			'<div class="rlTypeTiles">'+INDEXES.map(function(i){
				return '<div class="rlTypeTile" data-idx="'+i.id+'"><i class="material-symbols-outlined">public</i>'+
					'<div><div class="tt">'+esc(i.nm)+'</div><div class="tc">'+REPORTS.filter(function(r){return r.idx===i.id;}).length+' reports</div></div></div>';
			}).join('')+'</div></div>';
		html+='</div>';
		document.getElementById('rlMain').innerHTML=html;
	}

	/* ════════════ 검색 결과 ════════════ */
	// ▼ 액션 seam(검색): 지금은 로컬 REPORTS 필터(목업). 실구현: au.ajaxGet2('/rptlib/search', {q,filters,page,sort}, renderResults)
	function currentMatches(){
		var a=applied||{idx:activeIdx,cls:activeCls,type:'all',date:'all',bu:'all',q:''};
		var idx=a.idx, cls=a.cls, ft=a.type, fd=a.date, fb=a.bu, q=(a.q||'').toLowerCase();
		var w=(withinQuery||'').toLowerCase();
		return REPORTS.filter(function(r){
			if(!idx[r.idx]) return false;
			if(!cls[r.cls]) return false;
			if(ft!=='all' && r.type!==ft) return false;
			if(fb!=='all' && r.bu!==fb) return false;
			if(fd!=='all'){ var y=parseInt(r.date.slice(0,4),10);
				if(fd==='2024' && y<2023) return false;
				if(fd==='2018' && (y<2018||y>2022)) return false;
				if(fd==='0' && y>=2018) return false; }
			if(q.length>=2){ var hay=(r.title+' '+r.code+' '+r.author+' '+r.bu+' '+r.type+(isLocked(r)?'':' '+summaryOf(r.code))).toLowerCase(); if(hay.indexOf(q)<0) return false; }   // 2글자부터(하이라이트 termsOf와 동일). 잠금 문서는 본문(summary) 제외 → 제목/메타로만 매칭
			if(w.length>=2 && withinText(r).indexOf(w)<0) return false;
			if(!passColFilter(r)) return false;
			return true;
		}).sort(function(a,b){return b.hits-a.hits;});
	}
	/* ── 검색어 토큰화: 연산자(field:, "구문", -제외, AND/OR) 제거 후 단어만 추출 ── */
	function termsOf(s){
		s=String(s||''); var out=[];
		s=s.replace(/"([^"]+)"/g, function(_,m){ out.push(m); return ' '; });   // "구문" → 통째로 하이라이트
		s.split(/\s+/).forEach(function(tok){
			if(!tok || tok.charAt(0)==='-') return;        // -제외 토큰 스킵
			tok=tok.replace(/^[A-Za-z_]+:/,'');            // field: 프리픽스 제거 → 값만
			if(/^(AND|OR)$/i.test(tok)) return;
			if(tok.length>=2) out.push(tok);
		});
		return out;
	}
	/* ── 통합 하이라이트 ── 원문(태그 없는 상태)을 1-pass로 훑어 메인=<b>, within=<mark> 부여.
	   bold를 먼저 끼워넣고 그 위에 mark를 거는 방식이면 끼워진 태그문자 때문에 매칭이 깨지므로,
	   원문에서 한 번에 분기해 둘 다 처리 → 태그 충돌 없음. 겹치면 가장 앞 매치 우선, 동률이면 within(mark) 우선. */
	function hlMix(text, mainTerms, withinTerms){
		var groups=[];
		(withinTerms||[]).forEach(function(t){ t=t&&String(t).trim(); if(t) groups.push({t:t.toLowerCase(), o:'<mark>', c:'</mark>', pr:2}); });
		(mainTerms||[]).forEach(function(t){ t=t&&String(t).trim(); if(t) groups.push({t:t.toLowerCase(), o:'<b class="hlw">', c:'</b>', pr:1}); });
		if(!groups.length) return esc(text);
		var lo=String(text).toLowerCase(), out='', i=0, n=text.length;
		while(i<n){
			var best=-1, bestLen=0, bestG=null;
			for(var g=0; g<groups.length; g++){
				var p=lo.indexOf(groups[g].t, i); if(p<0) continue;
				if(best<0 || p<best || (p===best && (groups[g].pr>bestG.pr || (groups[g].pr===bestG.pr && groups[g].t.length>bestLen)))){
					best=p; bestLen=groups[g].t.length; bestG=groups[g];
				}
			}
			if(best<0){ out+=esc(text.slice(i)); break; }
			out+=esc(text.slice(i,best))+bestG.o+esc(text.slice(best,best+bestLen))+bestG.c; i=best+bestLen;
		}
		return out;
	}
	/* 그리드 셀·제목 공통: 메인 검색=bold, within 검색=mark (둘 다 활성 시 한 패스로 동시 처리) */
	function hlt(text){ return hlMix(text, termsOf((applied&&applied.q)||''), termsOf(withinQuery)); }
	function snippetOf(r, q){
		if(isLocked(r)) return { html:'<span class="snipLocked"><i class="material-symbols-outlined">lock</i>Restricted — request access to view contents</span>' };   // 잠금: 본문 발췌 비노출(유출 차단)
		var sum=summaryOf(r.code);
		if(!q) return { html:esc(sum.slice(0,150))+(sum.length>150?'…':'') };
		var ql=q.toLowerCase(), sp=sum.toLowerCase().indexOf(ql);
		if(sp>=0){
			var s=Math.max(0,sp-58), e=Math.min(sum.length, sp+ql.length+92);
			var ex=(s>0?'…':'')+sum.slice(s,e)+(e<sum.length?'…':'');
			return { html:hlMix(ex, termsOf(q), termsOf(withinQuery)) };
		}
		return { html:esc(sum.slice(0,150))+(sum.length>150?'…':'') };   // 제목/메타 매칭 — 출처 배지 없이 초록 미리보기만
	}
	/* ── 선택/일괄 ── */
	function selCount(){ return Object.keys(selected).length; }
	function pagedList(){ var s=(pageNum-1)*pageSize; return sortedList().slice(s, s+pageSize); }
	function sortVal(r,k,q){
		if(k==='rel') return relScore(r,q);
		if(k==='title') return r.title.toLowerCase();
		if(k==='type') return r.type.toLowerCase();
		if(k==='region') return idxName(r.idx).toLowerCase();
		if(k==='site') return r.site.toLowerCase();
		if(k==='cls') return r.cls;
		if(k==='bu') return r.bu.toLowerCase();
		if(k==='seg') return segOf(r.bu).toLowerCase();
		if(k==='author') return r.author.toLowerCase();
		if(k==='date') return r.date;
		if(k==='code') return r.code.toLowerCase();
		if(k==='pages') return pagesOf(r);
		if(k==='score') return qScore(r,q);
		if(k==='khits') return qHits(r,q);
		if(k==='hitrate') return qRate(r,q);
		return r.hits;
	}
	function cmpBy(a,b,k,d,q){ var va=sortVal(a,k,q), vb=sortVal(b,k,q); return (va<vb?-1:va>vb?1:0)*d; }
	/* ── N단계 정렬 모델 ── */
	function sortFields(){ var seen={}, out=[{key:'rel',label:'Relevance'},{key:'title',label:'Document title'}];
		out.forEach(function(o){seen[o.key]=1;}); COLS.forEach(function(c){ if(c.sort && !seen[c.sort]){ seen[c.sort]=1; out.push({key:c.sort,label:c.label}); } }); return out; }
	function sortIndex(key){ for(var i=0;i<sorts.length;i++) if(sorts[i].key===key) return i; return -1; }
	/* 헤더 클릭 = 단일정렬 순환(오름→내림→기본 relevance) */
	function setSingleSort(key){ if(sorts.length===1 && sorts[0].key===key){ if(sorts[0].dir===1) sorts[0].dir=-1; else sorts=[]; } else sorts=[{key:key,dir:1}]; }   /* 오름→내림→정렬없음(빈) 순환 */
	/* 헤더 Shift+클릭 = 레벨 추가/순환(추가→내림→제거) */
	function toggleSortLevel(key){ var i=sortIndex(key); if(i<0) sorts.push({key:key,dir:1}); else if(sorts[i].dir===1) sorts[i].dir=-1; else sorts.splice(i,1); }   /* 추가→내림→제거(레벨0이면 빈=정렬없음). 빈 상태에서 첫 추가=1차 */
	function sortedList(){
		var list=currentMatches(), q=(applied&&applied.q)||'';
		return list.sort(function(a,b){
			for(var i=0;i<sorts.length;i++){ var c=cmpBy(a,b,sorts[i].key,sorts[i].dir,q); if(c) return c; }
			return 0;
		});
	}
	function ghCell(key,label,extra,colkey){
		var si=sortIndex(key), on=(si>=0);
		var ind = on
			? '<i class="material-symbols-outlined ar">'+(sorts[si].dir<0?'arrow_downward':'arrow_upward')+'</i>'+(sorts.length>1?'<span class="so">'+(si+1)+'</span>':'')
			: '<i class="material-symbols-outlined hint">swap_vert</i>';   // 미정렬 → hover 시 sortable 힌트
		var canDrag=!!colkey;
		var drag=canDrag?' draggable="true" data-colkey="'+colkey+'"':'';
		var ttl=canDrag?'Click to sort · Shift+click = add sort level · Drag to reorder column':'Click to sort · Shift+click adds a sort level';
		return '<div class="gh sortable'+(on?' on':'')+(extra||'')+'" data-sort="'+key+'"'+drag+' title="'+ttl+'">'+label+ind+'</div>';
	}
	function updateBulkBar(){
		var bar=document.getElementById('rlBulkBar'); if(!bar) return;
		var n=selCount(); bar.classList.toggle('show', n>0);
		var c=document.getElementById('rlSelCnt'); if(c) c.textContent=n;
		var all=document.getElementById('rlSelAll');
		if(all){ var list=(groupBy==='none'? pagedList() : sortedList()); var allSel=list.length>0 && list.every(function(r){return selected[r.code];}); all.checked=allSel; all.indeterminate=(n>0 && !allSel); }
	}
	function resultRow(r){
		var locked=isLocked(r);
		var q=applied&&applied.q;
		var sel=!!selected[r.code];
		var inB=!!basket[r.code];
		var exp=!!expanded[r.code];
		var sn=q?snippetOf(r,q):null;
		var snip=(sn&&sn.html)?'<div class="gc snip"><span class="snipTxt">'+sn.html+'</span></div>':'';
		var cells=visCols().map(function(c){ return '<div class="gc'+(c.cc?' '+c.cc:'')+'">'+c.cell(r)+'</div>'; }).join('');
		return '<div class="rlGridRow glassHover'+(sel?' sel':'')+(exp?' exp':'')+'" data-code="'+esc(r.code)+'">'+
			'<div class="gc sel"><label class="rlRowSel" title="Select"><input type="checkbox" class="filled-in rlRowCheck" data-code="'+esc(r.code)+'"'+(sel?' checked':'')+'/><span></span></label></div>'+
			'<div class="gc title">'+
				'<div class="t1">'+
					'<span class="rlRowAct rlExpand'+(exp?' on':'')+'" data-code="'+esc(r.code)+'" title="Quick look"><i class="material-symbols-outlined">expand_more</i></span>'+
					'<span class="tt">'+hlt(r.title)+'</span>'+
					'<span class="rlRowActs">'+
						'<span class="rlRowAct rlDl" data-code="'+esc(r.code)+'" title="'+(locked?'Restricted':'Download')+'"><i class="material-symbols-outlined">'+(locked?'':'download')+'</i></span>'+
						'<span class="rlRowAct rlBasket'+(inB?' on':'')+'" data-code="'+esc(r.code)+'" title="'+(inB?'In basket — click to remove':'Add to basket')+'"><i class="material-symbols-outlined">'+(inB?'shopping_cart':'add_shopping_cart')+'</i></span>'+
						'<span class="rlRowAct rlBmk" data-bmk="'+esc(r.code)+'" title="Save to a bookmark folder"><i class="material-symbols-outlined">bookmark_add</i></span>'+
					'</span>'+
				'</div>'+
			'</div>'+
			cells+
			snip+
		'</div>'+
		(exp? expandPanel(r) : '');
	}
	function metaPair(k,v){ return '<div class="exPair"><span class="k">'+esc(k)+'</span><span class="v">'+esc(v)+'</span></div>'; }
	/* 행 인라인 확장 — abstract 미리보기 + 메타 + 빠른 액션(상세 화면 안 들어가고 훑기) */
	function expandPanel(r){
		var locked=isLocked(r);
		return '<div class="rlExpandPanel">'+
			'<div class="exAbstract"><i class="material-symbols-outlined">'+(locked?'lock':'subject')+'</i><span>'+(locked?'Restricted — request access to view contents':esc(summaryOf(r.code)||'No abstract available.'))+'</span></div>'+
			'<div class="exMeta">'+
				metaPair('Author', r.author)+metaPair('Site / Region', idxName(r.idx))+metaPair('Business Unit', r.bu)+
				metaPair('Type', typeInfo(r.type).nm)+metaPair('Date', fmtDate(r.date))+metaPair('Classification','Class '+r.cls+(locked?' · region-restricted':''))+
			'</div>'+
			'<div class="exActs">'+
				'<a class="exBtn primary" data-open="'+esc(r.code)+'" title="Open report"><i class="material-symbols-outlined">open_in_new</i></a>'+
				'<a class="exBtn" data-basket="'+esc(r.code)+'" title="Add to basket"><i class="material-symbols-outlined">add_shopping_cart</i></a>'+
				'<a class="exBtn" data-dl="'+esc(r.code)+'" title="'+(locked?'Restricted':'Download')+'"><i class="material-symbols-outlined">'+(locked?'lock':'download')+'</i></a>'+
			'</div>'+
		'</div>';
	}
	/* ── 페이지 계산 ── */
	function pageInfo(list){
		var n=list.length, pages=Math.max(1, Math.ceil(n/pageSize));
		if(pageNum>pages) pageNum=pages; if(pageNum<1) pageNum=1;
		var s=(pageNum-1)*pageSize;
		return { n:n, pages:pages, s:s, e:Math.min(n, s+pageSize) };
	}
	function pagerHtml(pi){
		// 1페이지여도 다페이지와 동일 UI(페이지 '1'만 + 좌우 캐럿 비활성). "All N on one page" 문구 폐기.
		var P=pageNum, N=pi.pages, atFirst=(P<=1), atLast=(P>=N);
		var pg='<div class="rlPager">';
		pg+='<a class="nav fl'+(atFirst?' dis':'')+'" data-pg="first" title="First page">«</a>';
		pg+='<a class="nav'+(atFirst?' dis':'')+'" data-pg="prev" title="Previous page">‹</a>';
		var lo=Math.max(1,P-2), hi=Math.min(N,lo+4); lo=Math.max(1,hi-4);
		if(lo>1){ pg+='<a data-pg="1">1</a>'; if(lo>2) pg+='<span class="gap">…</span>'; }
		for(var i=lo;i<=hi;i++) pg+='<a class="'+(i===P?'on':'')+'" data-pg="'+i+'">'+i+'</a>';
		if(hi<N){ if(hi<N-1) pg+='<span class="gap">…</span>'; pg+='<a data-pg="'+N+'">'+N+'</a>'; }
		pg+='<a class="nav'+(atLast?' dis':'')+'" data-pg="next" title="Next page">›</a>';
		pg+='<a class="nav fl'+(atLast?' dis':'')+'" data-pg="last" title="Last page">»</a>';
		pg+='<span class="jump">Go to <input type="text" inputmode="numeric" id="rlPageJump" value="'+P+'"'+(N<=1?' disabled':'')+' aria-label="Go to page" title="Type a page number and press Enter"><span class="of">/ '+N+'</span></span>';
		pg+='</div>';
		return pg;
	}
	/* 직접 페이지 이동(타이핑/select 공용) — 범위 클램프 후 렌더 */
	function gotoPage(v){ var n=parseInt(v,10); if(isNaN(n)) return; var pgs=pageInfo(sortedList()).pages; pageNum=Math.min(pgs,Math.max(1,n)); renderResults(); }
	/* ── 활성 필터 칩(적용된 검색 조건을 제거가능 칩으로) ── */
	function critChip(key,ic,txt){ return '<span class="rlCritChip" data-crit="'+esc(key)+'"><i class="material-symbols-outlined k">'+ic+'</i><b>'+esc(txt)+'</b><i class="material-symbols-outlined x" data-crit="'+esc(key)+'">close</i></span>'; }
	function filterChipsHtml(){
		if(!applied) return '';
		var ch=[];
		if(applied.q) ch.push(critChip('q','search','“'+applied.q+'”'));
		if(applied.type!=='all') ch.push(critChip('type','description','Type · '+typeInfo(applied.type).t));
		var onIdx=INDEXES.filter(function(i){return applied.idx[i.id];});
		if(onIdx.length!==INDEXES.length) ch.push(critChip('region','public','Region · '+onIdx.map(function(i){return i.id;}).join(', ')));
		var onCls=[1,2,3,4].filter(function(c){return applied.cls[c];});
		if(onCls.length!==4) ch.push(critChip('class','shield','Class · '+onCls.map(function(c){return 'C'+c;}).join(',')));
		if(applied.date!=='all') ch.push(critChip('date','event',DATE_LABELS[applied.date]));
		if(applied.bu!=='all') ch.push(critChip('bu','apartment',applied.bu));
		if(withinQuery.length>=2) ch.push(critChip('within','filter_alt','within · “'+withinQuery+'”'));   // within은 2글자부터 실제 필터 → 칩도 2글자부터(1글자엔 미생성)
		Object.keys(colFilter).forEach(function(k){ var v=colFilter[k]; if(v==null||v==='') return;
			ch.push(critChip('cf:'+k,'filter_list',colName(k)+' · '+(colFiltType(k)==='text'?('“'+v+'”'):cfLabel(k,v)))); });
		if(!ch.length) return '';
		return '<div class="rlCritRow"><span class="lead"><i class="material-symbols-outlined">filter_alt</i>Filtered by</span>'+ch.join('')+
			'<a id="rlCritClr" class="rlCritClr" style=""><i class="material-symbols-outlined">filter_alt_off</i>Clear filters</a></div>';
	}
	/* ── 컬럼 선택기 팝오버 ── */
	function colsPopHtml(){
		return '<div class="rlColsPop'+(colsOpen?' show':'')+'" id="rlColsPop"><div class="popHead">Columns</div>'+
			COLS.map(function(c){ return '<label class="rlChk"><input type="checkbox" class="filled-in" data-col="'+c.key+'"'+(c.on?' checked':'')+'/><span class="nm">'+esc(c.label)+'</span></label>'; }).join('')+
			'<a href="javascript:;" class="savedItem add" id="rlColsReset"><i class="material-symbols-outlined">restart_alt</i><span>Reset to default</span></a></div>';
	}
	/* ── Sort 패널(Excel식) — N단계 정렬: 레벨 추가/컬럼변경/방향/제거 + 드래그 재정렬 ── */
	function sortPopHtml(){
		var fields=sortFields();
		var rows=sorts.map(function(s,i){
			var opts=fields.map(function(f){
				var usedElsewhere=sorts.some(function(ss,j){ return j!==i && ss.key===f.key; });
				return '<option value="'+f.key+'"'+(s.key===f.key?' selected':'')+(usedElsewhere?' disabled':'')+'>'+esc(f.label)+'</option>';
			}).join('');
			return '<div class="srtRow" draggable="true" data-srt="'+i+'">'+
				'<i class="srtGrip material-symbols-outlined" title="Drag to reorder">drag_indicator</i>'+
				'<span class="srtN">'+(i===0?'Sort by':'then by')+'</span>'+
				'<select class="rlSortSel browser-default srtField" data-srtfield="'+i+'">'+opts+'</select>'+
				'<a href="javascript:;" class="srtDir'+(s.dir<0?' desc':'')+'" data-srtdir="'+i+'" title="Toggle direction"><i class="material-symbols-outlined">'+(s.dir<0?'arrow_downward':'arrow_upward')+'</i><span>'+(s.dir<0?'Desc':'Asc')+'</span></a>'+
				(sorts.length>1?'<a href="javascript:;" class="srtRm" data-srtrm="'+i+'" title="Remove level"><i class="material-symbols-outlined">close</i></a>':'<span class="srtRm ph"></span>')+
			'</div>';
		}).join('');
		if(!sorts.length) rows='<div class="srtEmpty" style="padding:7px 4px;font-size:12px;color:var(--main-hint-color);">No sorting applied — results in default order.</div>';
		var canAdd=(sorts.length < fields.length);
		return '<div class="rlSortPop'+(sortOpen?' show':'')+'" id="rlSortPop">'+
			'<div class="popHead">Sort<span class="srtHint">drag ⠿ to reorder levels</span></div>'+
			'<div class="srtList" id="srtList">'+rows+'</div>'+
			'<div class="srtFoot">'+
				(canAdd?'<a href="javascript:;" class="srtAdd" id="srtAdd"><i class="material-symbols-outlined">add</i>Add level</a>'
					   :'<span class="srtAdd disabled"><i class="material-symbols-outlined">add</i>Add level</span>')+
				'<a href="javascript:;" class="srtReset" id="srtReset"><i class="material-symbols-outlined">restart_alt</i>Reset</a>'+
			'</div></div>';
	}
	/* ── Document Basket 드로어 ── */
	function basketDrawerHtml(){
		var codes=Object.keys(basket);
		var items=codes.length ? codes.map(function(code){
			var r=REPORTS.filter(function(x){return x.code===code;})[0]; if(!r) return '';
			return '<div class="bkItem" data-code="'+esc(code)+'"><div class="bkMain"><div class="bkTit">'+esc(r.title)+'</div>'+
				'<div class="bkSub"><span class="code">'+esc(r.code)+'</span> · '+esc(r.type)+' · '+esc(idxName(r.idx))+'</div></div>'+
				'<i class="material-symbols-outlined bkRm" data-rm="'+esc(code)+'" title="Remove">close</i></div>';
		}).join('') : '<div class="bkEmpty"><i class="material-symbols-outlined">shopping_cart</i><div>Your basket is empty.</div><div class="s">Add documents with the cart icon on any row.</div></div>';
		return '<div class="rlBasketDrawer'+(basketOpen?' open':'')+'" id="rlBasketDrawer">'+
			'<div class="bkHead"><span><i class="material-symbols-outlined">shopping_cart</i>Document Basket <b>'+codes.length+'</b></span>'+
				'<i class="material-symbols-outlined bkClose" id="rlBasketClose">close</i></div>'+
			'<div class="bkList">'+items+'</div>'+
			'<div class="bkFoot">'+
				'<a class="ba" id="rlBkDownload"><i class="material-symbols-outlined">download</i>Download</a>'+
				'<a class="ba clr" id="rlBkClear"><i class="material-symbols-outlined">delete_sweep</i>Clear</a></div>'+
		'</div>';
	}
	/* ── Group by(Region/Type/Class) ── */
	function groupKey(r){ return groupBy==='region'?r.idx : groupBy==='type'?r.type : groupBy==='cls'?r.cls : ''; }
	function groupName(k){ return groupBy==='region'?idxName(k) : groupBy==='type'?typeInfo(k).nm : groupBy==='cls'?classInfo(k).nm : String(k); }
	function groupLabel(){ return groupBy==='region'?'Region' : groupBy==='type'?'Type' : groupBy==='cls'?'Classification' : ''; }
	/* ── 컬럼 필터(탐색기식 헤더 필터 행 — 즉시 결과 좁힘) ── */
	function colFiltType(k){
		if(['title','code','author'].indexOf(k)>=0) return 'text';
		if(['type','region','cls','bu','seg','site'].indexOf(k)>=0) return 'cat';
		return null;
	}
	function uniqVals(fn){ var s=[],seen={}; REPORTS.forEach(function(r){ var v=fn(r); if(!(v in seen)){ seen[v]=1; s.push(v); } }); return s; }
	function colFiltValues(k){
		if(k==='type') return TYPES.map(function(t){return t.t;});
		if(k==='region') return INDEXES.map(function(i){return i.id;});
		if(k==='cls') return [1,2,3,4];
		if(k==='bu') return busList();
		if(k==='seg') return uniqVals(function(r){return segOf(r.bu);}).sort();
		if(k==='site') return uniqVals(function(r){return r.site;}).sort();
		return [];
	}
	function cfLabel(k,v){ return k==='region'?idxName(v) : k==='cls'?('Class '+v) : String(v); }
	function colName(k){ if(k==='title') return 'Document'; var c=colByKey(k); return c?c.label:k; }
	function passColFilter(r){
		for(var k in colFilter){ var v=colFilter[k]; if(v==null||v==='') continue;
			var t=colFiltType(k);
			if(t==='text'){ var fld=k==='title'?r.title:k==='code'?r.code:k==='author'?r.author:''; if(String(fld).toLowerCase().indexOf(String(v).toLowerCase())<0) return false; }
			else if(t==='cat'){ var val=k==='type'?r.type:k==='region'?r.idx:k==='cls'?r.cls:k==='bu'?r.bu:k==='seg'?segOf(r.bu):k==='site'?r.site:null; if(String(val)!==String(v)) return false; }
		}
		return true;
	}
	function cfCell(key){
		var t=colFiltType(key), cur=colFilter[key]||'';
		if(t==='text') return '<div class="gc"><div class="aniInput"><input type="text" class="browser-default" data-cf="'+key+'" value="'+esc(cur)+'" placeholder="Filter" autocomplete="off"><span class="focus-border"></span></div></div>';
		if(t==='cat'){ var opts='<option value="">All</option>'+colFiltValues(key).map(function(v){ return '<option value="'+esc(String(v))+'"'+(String(cur)===String(v)?' selected':'')+'>'+esc(cfLabel(key,v))+'</option>'; }).join('');
			return '<div class="gc"><select class="rlSortSel browser-default" data-cf="'+key+'">'+opts+'</select></div>'; }
		return '<div class="gc"></div>';
	}
	function cfRowHtml(){ return '<div class="rlFilterRow"><div class="gc cfLab"><i class="material-symbols-outlined">filter_list</i></div>'+cfCell('title')+visCols().map(function(c){ return cfCell(c.key); }).join('')+'</div>'; }
	function groupedRowsHtml(list){
		var order=[], groups={};
		list.forEach(function(r){ var k=groupKey(r), kk=String(k); if(!(kk in groups)){ groups[kk]=[]; order.push(k); } groups[kk].push(r); });
		order.sort(function(a,b){ return groups[String(b)].length-groups[String(a)].length; });
		return order.map(function(k){
			var rows=groups[String(k)], coll=!!collapsedGroups[groupBy+':'+k];
			return '<div class="rlGroupHead'+(coll?' collapsed':'')+'" data-group="'+esc(String(k))+'">'+
				'<i class="material-symbols-outlined gca">expand_more</i><span class="gname">'+esc(groupName(k))+'</span><span class="gcount">'+rows.length+'</span></div>'+
				(coll? '' : rows.map(resultRow).join(''));
		}).join('');
	}
	function renderResults(){
		searchMode=true;
		var _vb=document.getElementById('rlViewBrowse'); if(_vb) _vb.classList.toggle('searched', hasSearched);   // 검색 후 = 히어로 얇게(좌상단)
		var list=sortedList();
		var aq=applied&&applied.q;
		var grouped=(groupBy!=='none');
		var pi=pageInfo(list);
		var tmpl='42px minmax(240px,1fr) '+visCols().map(function(c){return c.w;}).join(' ');
		var html='<div class="rlResults">';
		html+='<div class="rlResultsHead">'+
			'<div class="rlResultsCount">'+(grouped
				? 'Documents <b>'+pi.n+'</b> · grouped by '+groupLabel()
				: 'Documents <b>'+(pi.n?pi.s+1:0)+'–'+pi.e+'</b> of <b>'+pi.n+'</b>')+
			(aq?' for <span class="q">“'+esc(aq)+'”</span>':'')+'</div>'+
			'<div class="rlResultsTools">'+
				'<div class="aniInput rlWithin"><input type="text" class="browser-default" id="rlWithin" placeholder="Search within results" value="'+esc(withinQuery)+'" autocomplete="off"><span class="focus-border"></span></div>'+
				'<div class="rlSortWrap"><a class="rlTool'+(sorts.length>1?' on':'')+'" id="rlSortBtn" title="Sort"><i class="material-symbols-outlined">swap_vert</i>'+(sorts.length>1?'<span class="bdg">'+sorts.length+'</span>':'')+'</a>'+sortPopHtml()+'</div>'+
				'<a class="rlTool'+(showColFilter?' on':'')+'" id="rlColFilterBtn" title="Filter columns"><i class="material-symbols-outlined">filter_list</i></a>'+
				'<div class="rlColsWrap"><a class="rlTool" id="rlColsBtn" title="Choose columns"><i class="material-symbols-outlined">view_column</i></a>'+colsPopHtml()+'</div>'+
				'<select class="rlSortSel browser-default" id="rlGroupBy"><option value="none">No grouping</option><option value="region">Group: Region</option><option value="type">Group: Type</option><option value="cls">Group: Class</option></select>'+
				'<select class="rlSortSel browser-default" id="rlPageSize"><option value="10">10 / page</option><option value="25">25 / page</option><option value="50">50 / page</option></select>'+
				'<a class="rlTool basket'+(basketCount()?' has':'')+' ml20" id="rlBasketBtn" title="Document basket"><i class="material-symbols-outlined">shopping_cart</i><span class="bdg"'+(basketCount()?'':' style="display:none"')+'>'+basketCount()+'</span></a>'+
			'</div></div>';
		html+=filterChipsHtml();
		html+='<div class="rlBulkBar" id="rlBulkBar"><span class="cnt"><b id="rlSelCnt">0</b> selected</span><div class="acts">'+
			''+
			'<a class="ba" data-bulk="download"><i class="material-symbols-outlined">download</i>Download</a>'+
			'<a class="ba" data-bulk="basket"><i class="material-symbols-outlined">add_shopping_cart</i>Add to Basket</a>'+
			'<a class="ba clr" data-bulk="clear"><i class="material-symbols-outlined">close</i>Clear</a></div></div>';
		if(!pi.n){
			html+='<div class="rlGrid hScroll compact" style="--rlcols:'+tmpl+'"><div class="rlGridHead">'+
				'<div class="gh sel"><label class="rlSelAll"><input type="checkbox" class="filled-in" disabled/><span></span></label></div>'+
				ghCell('title','Document','','title')+visCols().map(function(c){ return ghCell(c.sort,c.label,(c.num?' num':'')+(c.cc&&c.cc.indexOf('rel')>=0?' rel':''),c.key); }).join('')+
				'</div><div class="rlEmpty"><i class="material-symbols-outlined">search_off</i>'+
				'<div class="et">No reports match your search.</div>'+
				'<div class="es">Try removing a filter or broadening your keywords.</div></div></div>';
		} else {
			html+='<div class="rlGrid hScroll compact'+(grouped?' grouped':'')+'" style="--rlcols:'+tmpl+'"><div class="rlGridHead">'+
				'<div class="gh sel"><label class="rlSelAll" title="Select all"><input type="checkbox" class="filled-in" id="rlSelAll"/><span></span></label></div>'+
				ghCell('title','Document','','title')+visCols().map(function(c){ return ghCell(c.sort,c.label,(c.num?' num':'')+(c.cc&&c.cc.indexOf('rel')>=0?' rel':''),c.key); }).join('')+
				'</div>'+(showColFilter?cfRowHtml():'')+(grouped? groupedRowsHtml(list) : list.slice(pi.s,pi.e).map(resultRow).join(''))+'</div>';
			html+=(grouped? '<div class="rlPager"><span class="only">Grouped by '+groupLabel()+' · '+pi.n+' documents</span></div>' : pagerHtml(pi));
		}
		html+=basketDrawerHtml();
		html+='</div>';
		var _pg=document.querySelector('.rlGrid'); var _kt=(_keepScroll&&_pg)?_pg.scrollTop:0;   // in-place 토글 시 그리드 스크롤 유지(expand 등이 맨 위로 점프하던 버그 방지)
		document.getElementById('rlMain').innerHTML=html;
		if(_keepScroll){ var _ng=document.querySelector('.rlGrid'); if(_ng) _ng.scrollTop=_kt; }
		_keepScroll=false;
		var ps=document.getElementById('rlPageSize'); if(ps) ps.value=String(pageSize);
		var gb=document.getElementById('rlGroupBy'); if(gb) gb.value=groupBy;
		updateBulkBar();
		if(focusWithin){ var w=document.getElementById('rlWithin'); if(w){ w.focus(); var v=w.value; w.value=''; w.value=v; } focusWithin=false; }
		if(focusCF){ var ci=document.querySelector('input[data-cf="'+focusCF+'"]'); if(ci){ ci.focus(); var cv=ci.value; ci.value=''; ci.value=cv; } focusCF=null; }
	}

	/* ════════════ 적용 / 홈 ════════════ */
	function setQueryInput(v){ var s=document.getElementById('rlSearchInput'); if(!s) return; s.value=v; var f=s.closest('.rlSearchField'); if(f) f.classList.toggle('has', !!v); }
	function applySearch(){ hasSearched=true; snapshotApplied(); selected={}; withinQuery=''; pageNum=1; setDirty(false); closePopover(); renderResults(); }   // 실제 검색/필터 = 히어로 축소
	/* 키워드 검색 진입 — q 있으면 relevance, 없으면 views 기본정렬(디스커버리 browse는 자체 정렬 보존) */
	function runSearch(){ var qq=stagedQuery(); if(qq) pushRecent(qq); sorts=[{key:(qq?'rel':'hits'),dir:-1}]; closeAuto(); applySearch(); }
	/* 첫화면/Home = 전체 리포트 파워그리드(페이징, newest first). 필터는 색인 조회라 부하 X. */
	function setSearchVisible(v){ var ct=document.getElementById('rlViewBrowse'); if(ct) ct.classList.toggle('hideSearch', !v); }
	/* SPA 뷰 전환(인페이지): browse(검색)/upload/review 의 .rlContent display 토글.
	   실구현 시 이 자리가 Thymeleaf 프래그먼트(th:replace) + 서버 라우팅으로 이관됨. */
	function showView(v){ var ids={browse:'rlViewBrowse',review:'rlViewReview',mine:'rlViewMine'};
		for(var k in ids){ var el=document.getElementById(ids[k]); if(el) el.style.display=(k===v)?'':'none'; }
		// 전환 시 공유 저장소(RL_SUBS) 최신 상태로 재렌더 — 결재 결정 ↔ 내 Submissions 반영(기존엔 display만 토글해 1회 렌더에 고정됐음).
		if(v==='review' && typeof renderQueue==='function') renderQueue();
		if(v==='mine' && typeof renderMine==='function') renderMine(); }   // My Report(Reports/Bookmarks) — rptlib_mine.js
	function goHome(keepFilters){
		hasSearched=false;   // Home 복귀 = 히어로 대형 복원
		setSearchVisible(true);   // 검색바·필터바 = Documents 전용
		if(!keepFilters){ INDEXES.forEach(function(i){ activeIdx[i.id]=true; }); activeCls={1:true,2:true,3:true,4:true}; stType='all'; stDate='all'; stBu='all'; }   // keepFilters=첫 진입: 복원된 최근 필터 유지
		setQueryInput(''); withinQuery=''; colFilter={};
		pageNum=1; selected={};   // 정렬은 건드리지 않음 — loadLayout이 복원한 "최근 정렬"(없으면 rel=정렬없음) 유지. Home/첫진입이 date로 덮어쓰지 않게.
		snapshotApplied(); setDirty(false); closePopover(); renderChips(); renderResults();
	}
	/* Summary = 큐레이션 Discovery(Recently Added·Most Viewed·Browse) — 검색바 숨김 */
	function goSummary(){ setSearchVisible(false); applied=null; closePopover(); renderChips(); renderDiscovery(); }
	/* 활성 필터 칩 제거 — 적용된 조건을 즉시 해제(Search 재클릭 불필요) */
	function removeApplied(key){
		if(key.indexOf('cf:')===0){ delete colFilter[key.slice(3)]; pageNum=1; renderResults(); return; }
		if(key==='within'){ withinQuery=''; pageNum=1; renderResults(); return; }
		if(key==='q') setQueryInput('');
		else if(key==='type') stType='all';
		else if(key==='region') INDEXES.forEach(function(i){ activeIdx[i.id]=true; });
		else if(key==='class') activeCls={1:true,2:true,3:true,4:true};
		else if(key==='date') stDate='all';
		else if(key==='bu') stBu='all';
		snapshotApplied(); pageNum=1; setDirty(false); renderChips(); renderResults();
	}
	function clearAllApplied(){
		INDEXES.forEach(function(i){ activeIdx[i.id]=true; }); activeCls={1:true,2:true,3:true,4:true};
		stType='all'; stDate='all'; stBu='all'; setQueryInput(''); withinQuery='';
		snapshotApplied(); pageNum=1; setDirty(false); renderChips(); renderResults();
	}

	/* ════════════ Bookmark — "폴더에 담기" 모달(Documents 행의 rlBmk 버튼) ════════════
	   브라우저 북마크 별표 멘탈모델: 문서 1건을 여러 폴더에 체크로 담는다(참조·즉시 저장).
	   폴더 데이터/변형은 rptlib_collections.js 전역(bmState·bmAddItem·bmRemoveItem·bmNewFolder…) 재사용.
	   docs.js가 collections.js보다 먼저 로드되지만, 클릭은 런타임이라 호출 시점엔 전부 정의됨. */
	var bmkCode=null;       // 담기 모달 대상 문서코드(null=닫힘)
	var bmkNewOpen=false;   // 인라인 '새 폴더' 입력 노출
	function bmkReady(){ if(typeof bmState==='undefined' || typeof bmLoad!=='function') return false; if(!bmState) bmLoad(); return !!bmState; }
	function bmkFolderRows(pid, depth){
		return bmChildren(pid).map(function(f){
			var on=bmHasItem(f.id, bmkCode);
			return '<div class="bmkFRow'+(on?' on':'')+'" data-bmkfid="'+esc(f.id)+'" style="padding-left:'+(12+depth*18)+'px">'+
				'<i class="material-symbols-outlined bmkFChk">'+(on?'check_box':'check_box_outline_blank')+'</i>'+
				'<i class="material-symbols-outlined bmkFIco">folder</i>'+
				'<span class="bmkFName">'+esc(f.name)+'</span>'+
				'<span class="bmkFCount">'+bmCount(f.id)+'</span>'+
			'</div>' + bmkFolderRows(f.id, depth+1);
		}).join('');
	}
	function bmkModalHtml(){
		if(!bmkCode || !bmkReady()) return '';
		var r=REPORTS.filter(function(x){return x.code===bmkCode;})[0];
		var inN=bmInCount(bmkCode);
		var rows=bmkFolderRows(null,0) || '<div class="bmkEmpty"><i class="material-symbols-outlined">folder_off</i>No folders yet — create one below.</div>';
		var doc = r ? '<div class="bmkDoc"><div class="bmkDocTop"><span class="rcType">'+esc(r.type)+'</span>'+classBadge(r.cls)+'</div>'+
			'<div class="bmkDocTit">'+esc(r.title)+'</div>'+
			'<div class="bmkDocMeta"><span class="code">'+esc(r.code)+'</span> · '+esc(r.author)+'</div></div>' : '';
		var newRow = bmkNewOpen
			? '<div class="bmkNewRow"><i class="material-symbols-outlined">folder_open</i><input type="text" id="bmkNewIn" class="browser-default" placeholder="Folder name…" autocomplete="off"/><a href="javascript:;" class="bmkNewGo" data-bmknewgo="1">Create</a></div>'
			: '<a href="javascript:;" class="bmkAddFolder" data-bmknew="1"><i class="material-symbols-outlined">create_new_folder</i>New folder</a>';
		return '<article class="modal bmkModal show">'+
			'<div class="modal-header"><h5 class="fLine vCenter"><i class="material-icons left">bookmark_add</i>Save to bookmarks</h5>'+
				'<div class="closeBtns modal-close" id="bmkClose"><i class="material-icons">close</i></div></div>'+
			'<div class="modal-content bmkBody">'+doc+
				'<div class="bmkPickHead">Choose folders<span class="bmkInCnt">'+(inN?('In '+inN+' folder'+(inN>1?'s':'')):'Not saved yet')+'</span></div>'+
				'<div class="bmkFolders hScroll">'+rows+'</div>'+newRow+
			'</div>'+
			'<div class="bmkFoot">'+
				'<a href="javascript:;" class="waves-effect waves-light hBtn hViva bmkDone" id="bmkDone">Done</a></div>'+
		'</article>';
	}
	function renderBmkModal(){ var w=document.getElementById('rlBmkModal'); if(!w) return; w.innerHTML=bmkModalHtml();
		if(bmkNewOpen){ var ni=document.getElementById('bmkNewIn'); if(ni) ni.select(); } }
	function openBmkModal(code){
		if(!bmkReady()){ toast('Bookmarks are not available right now.','info'); return; }
		bmkCode=code; bmkNewOpen=false;
		var w=document.getElementById('rlBmkModal'); if(!w) return;
		renderBmkModal(); void w.offsetWidth; w.classList.add('show');
	}
	function closeBmkModal(){ var w=document.getElementById('rlBmkModal'); if(w) w.classList.remove('show'); bmkCode=null; bmkNewOpen=false; }
	function bmkToggleFolder(fid){
		if(!bmkCode) return; var fn=(bmFolder(fid)||{}).name;
		if(bmHasItem(fid,bmkCode)){ bmRemoveItem(fid,bmkCode); toast('Removed from “'+fn+'”.','info'); }
		else { bmAddItem(fid,bmkCode); toast('Saved to “'+fn+'”.','ok'); }
		renderBmkModal();
	}
	function bmkCreateFolder(){
		var ni=document.getElementById('bmkNewIn'); var nm=ni?ni.value.trim():'';
		if(!nm){ if(ni) ni.focus(); return; }
		var id=bmNewFolder(nm,null); bmAddItem(id,bmkCode); bmkNewOpen=false; renderBmkModal();
		toast('Created “'+nm+'” and saved here.','ok');
	}

	$(document).ready(function(){
		// sidenav 초기화 → js/rptlib_common.js (공통)
		loadLayout();   // 개인 레이아웃(컬럼/정렬/페이지크기/그룹) 복원
		loadRecent();
		loadFilters();   // 최근 지정 필터(패싯) 복원 — 첫 진입 초기 세팅
		// SPA 초기 뷰 = ?view= 파라미터(deep-link). 없으면 Documents(browse).
		function activateNav(k){ document.querySelectorAll('.rlNavItem').forEach(function(a){ a.classList.toggle('on', a.getAttribute('data-nav')===k); }); }
		/* Documents 탭 활성화 = 검색 히어로 포커스 + Recent 드롭다운(animapis fadeIn). 첫 진입·네비 클릭 공통(페이지 로드가 아니라 '탭 활성화'에 묶음). */
		function focusSearchHero(){ var si=document.getElementById('rlSearchInput'); if(!si) return; si.focus();
			// openAuto는 다음 프레임에 — 네비 클릭이 document까지 버블링되며 전역 핸들러의 closeAuto가 방금 연 드롭다운을 닫는 것 회피(첫 로드엔 클릭이 없어 무해).
			requestAnimationFrame(function(){ openAuto(); if(window.animapis) animapis.play('#rlSearchAuto','fadeIn',{duration:220}); }); }
		var mView=(location.search.match(/[?&]view=(\w+)/)||[])[1];
		if(mView==='summary'){ activateNav('summary'); showView('browse'); goSummary(); }
		else if(mView==='upload'){ activateNav('mine'); showView('mine'); }   // 구 Submit 페이지(submit.html ?view=upload) → My Submissions로 흡수
		else if(mView==='review'){ activateNav('admin'); goHome(); showView('review'); }
		else if(mView==='mine'){ activateNav('mine'); showView('mine'); }   // My Report 딥링크(?view=mine)
		else { activateNav('docs'); showView('browse'); goHome(true); focusSearchHero(); }   // 첫화면 = 복원된 최근 필터 그리드(대형 히어로) + Documents 활성 → 검색 포커스

		// Bookmark 담기 모달(Documents 행 rlBmk → 폴더 체크로 즉시 저장) — 이벤트 위임
		var bmkModal=document.getElementById('rlBmkModal');
		if(bmkModal){
			bmkModal.addEventListener('click', function(e){
				if(e.target.id==='rlBmkModal'){ closeBmkModal(); return; }                     // 백드롭(오버레이) 클릭
				if(e.target.closest('#bmkClose') || e.target.closest('#bmkDone')){ closeBmkModal(); return; }
				var go=e.target.closest('[data-bmknewgo]'); if(go){ bmkCreateFolder(); return; }
				var nw=e.target.closest('[data-bmknew]'); if(nw){ bmkNewOpen=true; renderBmkModal(); return; }
				var fr=e.target.closest('.bmkFRow[data-bmkfid]'); if(fr){ bmkToggleFolder(fr.getAttribute('data-bmkfid')); return; }
			});
			bmkModal.addEventListener('keydown', function(e){
				if(!e.target.closest('#bmkNewIn')) return;
				if(e.key==='Enter'){ e.preventDefault(); bmkCreateFolder(); }
				else if(e.key==='Escape'){ bmkNewOpen=false; renderBmkModal(); }
			});
		}

		// 좌측 네비 — Documents(검색 그리드=home) / Summary(Discovery) / Upload / Admin + 접기
		document.getElementById('rlNav').addEventListener('click', function(e){
			if(e.target.closest('#rlNavToggle')){ var nv=document.getElementById('rlNav'); nv.classList.toggle('collapsed');
				var ic=nv.querySelector('#rlNavToggle i'); if(ic) ic.textContent=nv.classList.contains('collapsed')?'chevron_right':'chevron_left'; return; }
			var it=e.target.closest('.rlNavItem'); if(!it) return;   // TRH Approval(rlInboxBtn)은 .rlNavItem 아님 → 여기 안 걸림(access.js가 #rlInboxBtn 처리)
			document.querySelectorAll('.rlNavItem').forEach(function(a){ a.classList.remove('on'); }); it.classList.add('on');
			var nav=it.getAttribute('data-nav');
			if(nav==='docs'){ showView('browse'); goHome(); focusSearchHero(); }   // Documents 탭 활성화 → 검색 히어로 포커스
			else if(nav==='summary'){ showView('browse'); goSummary(); }
			else if(nav==='admin') showView('review');
			else if(nav==='mine'){ if(typeof mineSeg!=='undefined') mineSeg='reports'; showView('mine'); }   // My Reports
			else if(nav==='bookmarks'){ if(typeof mineSeg!=='undefined') mineSeg='bookmarks'; showView('mine'); }   // Bookmarks
		});

		// 검색 히어로 — Enter / Search 버튼 = 일괄 적용. 입력은 staged만.
		var sq=document.getElementById('rlSearchInput');
		sq.addEventListener('focus', openAuto);   // 포커스 → Recent+Saved 드롭다운
		sq.addEventListener('input', function(){ var f=sq.closest('.rlSearchField'); if(f) f.classList.toggle('has', !!sq.value); setDirty(true); renderSearchAuto(); });
		sq.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); runSearch(); } else if(e.key==='Escape'){ closeAuto(); } });
		document.getElementById('rlSearchBtn').addEventListener('click', function(){ if(dirty) runSearch(); });
		document.getElementById('rlSearchClear').addEventListener('click', function(){ setQueryInput(''); setDirty(true); sq.focus(); openAuto(); });
		// 검색 드롭다운: Recent 클릭=재실행 / Saved 클릭=적용 / 삭제 / Save current
		document.getElementById('rlSearchAuto').addEventListener('click', function(e){
			var rd=e.target.closest('.saRecentDel'); if(rd){ e.stopPropagation(); e.preventDefault(); deleteRecent(rd.getAttribute('data-recdel')); return; }
			var rc=e.target.closest('.saRecent'); if(rc){ setQueryInput(rc.getAttribute('data-rec')); runSearch(); return; }
		});

		// 헤더 srchArea = global — 모듈 검색은 상단 검색바로 안내
		var gq=document.getElementById('mainSrchInput');
		if(gq) gq.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); toast('Global search spans all MAPIS modules. Use the search bar above the results to find reports.','info'); } });

		// 필터 칩 바: 칩 클릭=팝오버 토글, X=클리어
		document.getElementById('rlChips').addEventListener('click', function(e){
			var cx=e.target.closest('[data-clear]');
			if(cx){ e.stopPropagation(); clearChip(cx.getAttribute('data-clear')); return; }
			var chip=e.target.closest('.rlChip');
			if(chip){ e.stopPropagation(); openPopover(chip.getAttribute('data-chip')); }
		});
		// 팝오버 내부: 멀티(체크) = change, 단일(옵션)/전체토글 = click
		document.getElementById('rlPop').addEventListener('click', function(e){
			var tg=e.target.closest('[data-idxtoggle],[data-type],[data-date],[data-bu]'); if(!tg) return;
			e.stopPropagation();
			if(tg.hasAttribute('data-idxtoggle')){
				var next=(idxOnCount()!==INDEXES.length); INDEXES.forEach(function(i){ activeIdx[i.id]=next; });
				document.getElementById('rlPop').innerHTML=popContent('region'); onStageChange(); return;
			}
			if(tg.hasAttribute('data-type')){ stType=tg.getAttribute('data-type'); onStageChange(); closePopover(); return; }
			if(tg.hasAttribute('data-date')){ stDate=tg.getAttribute('data-date'); onStageChange(); closePopover(); return; }
			if(tg.hasAttribute('data-bu')){ stBu=tg.getAttribute('data-bu'); onStageChange(); closePopover(); return; }
		});
		document.getElementById('rlPop').addEventListener('change', function(e){
			var ci=e.target.closest('input[data-idx]'); if(ci){ activeIdx[ci.getAttribute('data-idx')]=ci.checked; onStageChange(); return; }
			var cc=e.target.closest('input[data-cls]'); if(cc){ activeCls[+cc.getAttribute('data-cls')]=cc.checked; onStageChange(); return; }
		});

		// Reset — 필터 기본값으로(키워드 유지) + 즉시 반영(패싯 즉시적용과 일관).
		document.getElementById('rlFacetClear').addEventListener('click', function(){
			let isChanged = false;
			if(!activeCls['1'] || !activeCls['2'] || !activeCls['3'] || !activeCls['4']) isChanged = true;
			if(stType != 'all' || stDate != 'all' || stBu != 'all') isChanged = true;
			INDEXES.forEach(function(i){ 
				if(!activeIdx[i.id]) isChanged = true;
				activeIdx[i.id]=true; 
			}); 
			activeCls={1:true,2:true,3:true,4:true};
			stType='all'; stDate='all'; stBu='all';
			closePopover(); 
			if(isChanged) onStageChange(); 
			toast('Filters reset.','info');
		});

		// 바깥 클릭 / Esc → 팝오버·검색드롭다운·컬럼선택기 닫기
		document.addEventListener('click', function(e){
			if(openPop!==null && !e.target.closest('#rlPop') && !e.target.closest('.rlChip')) closePopover();
			if(!e.target.closest('#rlSearchAuto') && !e.target.closest('#rlSearchInput')) closeAuto();
			if(colsOpen && !e.target.closest('.rlColsWrap')){ colsOpen=false; var cp=document.getElementById('rlColsPop'); if(cp) cp.classList.remove('show'); }
			if(sortOpen && !e.target.closest('.rlSortWrap')){ sortOpen=false; var sp=document.getElementById('rlSortPop'); if(sp) sp.classList.remove('show'); }
		});
		document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ closePopover(); closeAuto();
			if(colsOpen){ colsOpen=false; var cp=document.getElementById('rlColsPop'); if(cp) cp.classList.remove('show'); }
			if(sortOpen){ sortOpen=false; var sp=document.getElementById('rlSortPop'); if(sp) sp.classList.remove('show'); }
			if(basketOpen){ basketOpen=false; if(searchMode) renderResults(); } } });

		// 본문 위임: 페이저·툴바·필터칩·일괄바·정렬·basket·다운로드·타일·카드
		document.getElementById('rlMain').addEventListener('click', function(e){
			if(e.target.closest('.rlRowSel')) return;   // 체크박스 라벨 클릭은 행 열기 아님

			// 최근 본 문서 비우기
			if(e.target.closest('#rlRvClear')){ try{ localStorage.removeItem('rlRecentDocs'); }catch(_){} renderDiscovery(); return; }

			// ── 페이지네이션
			var pg=e.target.closest('.rlPager a[data-pg]');
			if(pg){ e.stopPropagation(); var d=pg.getAttribute('data-pg'), pi=pageInfo(sortedList());
				if(d==='prev') pageNum=Math.max(1,pageNum-1);
				else if(d==='next') pageNum=Math.min(pi.pages,pageNum+1);
				else if(d==='first') pageNum=1;
				else if(d==='last') pageNum=pi.pages;
				else pageNum=+d;
				renderResults(); return; }


			// ── 컬럼 선택기 / 컬럼 필터 토글 / 레이아웃 리셋
			if(e.target.closest('#rlColFilterBtn')){ showColFilter=!showColFilter; renderResults(); return; }
			if(e.target.closest('#rlColsReset')){ resetLayout(); return; }
			if(e.target.closest('#rlColsBtn')){ e.stopPropagation(); colsOpen=!colsOpen;
				var cp=document.getElementById('rlColsPop'); if(cp) cp.classList.toggle('show',colsOpen); return; }

			// ── Sort 패널(Excel식): 토글 / 레벨 추가·방향·제거·리셋 (선택=change, 재정렬=drag)
			if(e.target.closest('#rlSortBtn')){ e.stopPropagation(); sortOpen=!sortOpen;
				var sp=document.getElementById('rlSortPop'); if(sp) sp.classList.toggle('show',sortOpen); return; }
			if(e.target.closest('#srtAdd') && !e.target.closest('.disabled')){ e.stopPropagation();
				var used={}; sorts.forEach(function(s){ used[s.key]=1; }); var nf=sortFields().filter(function(f){ return !used[f.key]; })[0];
				if(nf){ sorts.push({key:nf.key,dir:1}); pageNum=1; sortOpen=true; saveLayout(); renderResults(); } return; }
			if(e.target.closest('#srtReset')){ e.stopPropagation(); sorts=[]; pageNum=1; sortOpen=true; saveLayout(); renderResults(); return; }   /* Reset = 정렬 완전 비움(기본순) */
			var sdir=e.target.closest('[data-srtdir]'); if(sdir){ e.stopPropagation(); var di=+sdir.getAttribute('data-srtdir'); if(sorts[di]){ sorts[di].dir=-sorts[di].dir; pageNum=1; sortOpen=true; saveLayout(); renderResults(); } return; }
			var srm=e.target.closest('[data-srtrm]'); if(srm){ e.stopPropagation(); var ri=+srm.getAttribute('data-srtrm'); sorts.splice(ri,1); pageNum=1; sortOpen=true; saveLayout(); renderResults(); return; }
			if(e.target.closest('#rlSortPop')){ e.stopPropagation(); return; }   // 패널 내부 기타 클릭은 닫힘 방지

			// ── Document Basket 드로어
			if(e.target.closest('#rlBasketBtn')){ basketOpen=!basketOpen; renderResults(); return; }
			if(e.target.closest('#rlBasketClose')){ basketOpen=false; renderResults(); return; }
			var rm=e.target.closest('.bkRm[data-rm]');
			if(rm){ e.stopPropagation(); delete basket[rm.getAttribute('data-rm')]; renderResults(); return; }
			if(e.target.closest('#rlBkExport')){ var bce=Object.keys(basket); if(!bce.length){ toast('Basket is empty.','info'); return; }
				exportCsv(bce,'basket.csv'); toast('Exported '+bce.length+' document'+(bce.length>1?'s':'')+' to CSV.','mocha'); return; }
			if(e.target.closest('#rlBkDownload')){ var bcd=Object.keys(basket); if(!bcd.length){ toast('Basket is empty.','info'); return; }
				toast('Downloading '+bcd.length+' document'+(bcd.length>1?'s':'')+'… (mock)','mocha'); return; }
			if(e.target.closest('#rlBkClear')){ basket={}; toast('Basket cleared.','info'); renderResults(); return; }

			// ── 행 확장 패널 액션(Open / Cite / Download)
			var exo=e.target.closest('.exBtn[data-open]'); if(exo){ e.stopPropagation(); openReport(exo.getAttribute('data-open')); return; }
			var exd=e.target.closest('.exBtn[data-dl]'); if(exd){ e.stopPropagation(); var edc=exd.getAttribute('data-dl'), edr=REPORTS.filter(function(x){return x.code===edc;})[0];
				if(edr && edr.cls>=3) openReport(edc);   // restricted → 잠금 pop(열람요청 흐름)
				else toast('Downloading '+edc+'… (mock)','mocha'); return; }

			// ── 그룹 헤더 접기/펴기
			var grp=e.target.closest('.rlGroupHead');
			if(grp){ e.stopPropagation(); var gk=groupBy+':'+grp.getAttribute('data-group');
				if(collapsedGroups[gk]) delete collapsedGroups[gk]; else collapsedGroups[gk]=true; _keepScroll=true; renderResults(); return; }

			// ── 활성 필터 칩 제거 / 전체 해제
			var cx=e.target.closest('.rlCritChip .x');
			if(cx){ e.stopPropagation(); removeApplied(cx.getAttribute('data-crit')); return; }
			if(e.target.closest('#rlCritClr')){ clearAllApplied(); return; }

			// ── 일괄바(선택 행)
			var ba=e.target.closest('.ba[data-bulk]');
			if(ba){ e.stopPropagation(); var act=ba.getAttribute('data-bulk'), n=selCount();
				if(act==='clear'){ selected={}; renderResults(); return; }
				if(!n){ toast('Select documents first.','info'); return; }
				if(act==='export'){ exportCsv(Object.keys(selected),'reports-selected.csv'); toast('Exported '+n+' document'+(n>1?'s':'')+' to CSV.','mocha'); return; }
				if(act==='download'){ toast('Downloading '+n+' document'+(n>1?'s':'')+'… (mock)','mocha'); return; }
				if(act==='basket'){ Object.keys(selected).forEach(function(c){ basket[c]=true; }); toast('Added '+n+' document'+(n>1?'s':'')+' to basket.','ok'); renderResults(); return; }
				return; }

			// ── 헤더 정렬
			var gh=e.target.closest('.gh.sortable[data-sort]');
			if(gh){ e.stopPropagation(); var sk=gh.getAttribute('data-sort');
				if(e.shiftKey) toggleSortLevel(sk); else setSingleSort(sk);   // Shift=레벨 추가/순환, 일반=단일정렬 순환
				pageNum=1; saveLayout(); renderResults(); return; }

			// ── 행 Basket 토글
			var bk=e.target.closest('.rlBasket');
			if(bk){ e.stopPropagation(); var bcode=bk.getAttribute('data-code');
				if(basket[bcode]) delete basket[bcode]; else basket[bcode]=true;
				toast(basket[bcode]?('Added '+bcode+' to basket.'):('Removed '+bcode+' from basket.'), basket[bcode]?'ok':'info');
				_keepScroll=true; renderResults(); return; }

			// ── 행 다운로드(잠금 시 차단)
			var dl=e.target.closest('.rlDl');
			if(dl){ e.stopPropagation(); var dcode=dl.getAttribute('data-code'); var dr=REPORTS.filter(function(x){return x.code===dcode;})[0];
				if(dr && dr.cls>=3) openReport(dcode);   // restricted → 잠금 pop(열람요청 흐름)
				else toast('Downloading '+dcode+'… (mock)','mocha'); return; }

			// ── 행 북마크: 폴더 담기 모달(rlBmk) — gridRow 선택 토글보다 먼저 가로채야 함
			var bmk=e.target.closest('.rlBmk[data-bmk]');
			if(bmk){ e.stopPropagation(); openBmkModal(bmk.getAttribute('data-bmk')); return; }

			// ── 인라인 확장 토글
			var rexp=e.target.closest('.rlExpand');
			if(rexp){ e.stopPropagation(); var xc=rexp.getAttribute('data-code'); if(expanded[xc]) delete expanded[xc]; else expanded[xc]=true; _keepScroll=true; renderResults(); return; }

			// ── 디스커버리 타일/원클릭 검색
			var tile=e.target.closest('.rlTypeTile');
			if(tile){ setQueryInput('');
				if(tile.hasAttribute('data-idx')){ var rid=tile.getAttribute('data-idx'); INDEXES.forEach(function(i){ activeIdx[i.id]=(i.id===rid); }); }
				else { stType=tile.getAttribute('data-type'); }
				renderChips(); applySearch(); return; }
			var more=e.target.closest('.more[data-browse]');
			if(more){ var b=more.getAttribute('data-browse'); setQueryInput(''); sorts=[{key:(b==='recent'?'date':'hits'),dir:-1}]; applySearch(); return; }

			// ── 결과 그리드 행: Title 텍스트=열기, 그 외 어디든=선택 토글
			var gridRow=e.target.closest('.rlGridRow');
			if(gridRow){
				var grc=gridRow.getAttribute('data-code');
				if(e.target.closest('.gc.title .tt')){ openReport(grc); return; }
				if(selected[grc]) delete selected[grc]; else selected[grc]=true;
				var grsel=!!selected[grc];
				gridRow.classList.toggle('sel', grsel);
				var grchk=gridRow.querySelector('.rlRowCheck'); if(grchk) grchk.checked=grsel;
				updateBulkBar(); return;
			}

			// ── 디스커버리 카드/순위행 열기(결과 그리드 제외)
			var card=e.target.closest('[data-code]');
			if(card){ openReport(card.getAttribute('data-code')); return; }
		});

		// 결과 그리드 change 위임: page-size · 컬럼 토글 · 행선택 · 전체선택
		document.getElementById('rlMain').addEventListener('change', function(e){
			var psz=e.target.closest('#rlPageSize'); if(psz){ pageSize=+psz.value; pageNum=1; saveLayout(); renderResults(); return; }
			var pjp=e.target.closest('#rlPageJump'); if(pjp){ gotoPage(pjp.value); return; }
			var gbs=e.target.closest('#rlGroupBy'); if(gbs){ groupBy=gbs.value; pageNum=1; collapsedGroups={}; saveLayout(); renderResults(); return; }
			var cfs=e.target.closest('select[data-cf]'); if(cfs){ var cfk=cfs.getAttribute('data-cf'); if(cfs.value) colFilter[cfk]=cfs.value; else delete colFilter[cfk]; pageNum=1; renderResults(); return; }
			var sfl=e.target.closest('[data-srtfield]'); if(sfl){ var fi=+sfl.getAttribute('data-srtfield'); if(sorts[fi]){ sorts[fi].key=sfl.value; pageNum=1; sortOpen=true; saveLayout(); renderResults(); } return; }
			var col=e.target.closest('input[data-col]');
			if(col){ var ck=COLS.filter(function(c){return c.key===col.getAttribute('data-col');})[0]; if(ck) ck.on=col.checked; colsOpen=true; saveLayout(); renderResults(); return; }
			var cb=e.target.closest('.rlRowCheck');
			if(cb){ var code=cb.getAttribute('data-code'); if(cb.checked) selected[code]=true; else delete selected[code];
				var row=cb.closest('.rlGridRow'); if(row) row.classList.toggle('sel', cb.checked); updateBulkBar(); return; }
			if(e.target.closest('#rlSelAll')){ var on=e.target.checked;
				(groupBy==='none'? pagedList() : sortedList()).forEach(function(r){ if(on) selected[r.code]=true; else delete selected[r.code]; });
				_keepScroll=true; renderResults(); return; }
		});

		// 결과 내 재검색 / 컬럼 텍스트필터 — debounce(300ms): 타이핑 멈춘 뒤 1번만 반영
		// (프로토타입은 client라 공짜지만, 실구현의 "키 입력마다 1쿼리" 부하를 막는 동작을 모델링)
		document.getElementById('rlMain').addEventListener('input', function(e){
			if(e.target.id==='rlWithin'){
				var wv=e.target.value;
				clearTimeout(_filterDeb); _filterDeb=setTimeout(function(){ withinQuery=wv; pageNum=1; focusWithin=true; renderResults(); }, 300);
				return;
			}
			var cfi=e.target.closest('input[data-cf]');
			if(cfi){ var cfk=cfi.getAttribute('data-cf'), cv=cfi.value;
				clearTimeout(_filterDeb); _filterDeb=setTimeout(function(){ if(cv) colFilter[cfk]=cv; else delete colFilter[cfk]; pageNum=1; focusCF=cfk; renderResults(); }, 300);
			}
		});

		// 페이지 점프 입력: Enter 즉시 이동(change=blur 대비 키 응답성)
		document.getElementById('rlMain').addEventListener('keydown', function(e){
			if(e.key==='Enter' && e.target && e.target.id==='rlPageJump'){ e.preventDefault(); gotoPage(e.target.value); }
		});

		// 컬럼 헤더 드래그 재정렬(헤더만 draggable, click=정렬과 공존)
		var rlMainEl=document.getElementById('rlMain');
		rlMainEl.addEventListener('dragstart', function(e){ var h=e.target.closest('.gh[data-colkey]'); if(!h) return; dragColKey=h.getAttribute('data-colkey'); if(e.dataTransfer){ e.dataTransfer.effectAllowed='move'; try{ e.dataTransfer.setData('text/plain', dragColKey); }catch(_){} } h.classList.add('dragging'); });
		rlMainEl.addEventListener('dragover', function(e){ if(!dragColKey) return; var h=e.target.closest('.gh[data-colkey]'); if(h) e.preventDefault(); });   // 드롭 허용만 — 위치 미리보기 표시 없음
		rlMainEl.addEventListener('dragleave', function(){});
		rlMainEl.addEventListener('drop', function(e){ if(!dragColKey) return; var h=e.target.closest('.gh[data-colkey]'); if(h){ e.preventDefault(); var r=h.getBoundingClientRect(), after=e.clientX>(r.left+r.width/2); moveCol(dragColKey, h.getAttribute('data-colkey'), after); } dragColKey=null; saveLayout(); renderResults(); });
		rlMainEl.addEventListener('dragend', function(){ dragColKey=null; var d=rlMainEl.querySelector('.gh.dragging'); if(d) d.classList.remove('dragging'); });

		// Sort 레벨 드래그 재정렬(Sort 패널) — 컬럼 드래그와 별개(셀렉터로 분리)
		rlMainEl.addEventListener('dragstart', function(e){ var row=e.target.closest('.srtRow'); if(!row) return; srtDrag=+row.getAttribute('data-srt'); row.classList.add('dragging'); if(e.dataTransfer){ e.dataTransfer.effectAllowed='move'; try{ e.dataTransfer.setData('text/plain', String(srtDrag)); }catch(_){} } e.stopPropagation(); });
		rlMainEl.addEventListener('dragover', function(e){ if(srtDrag===null) return; var row=e.target.closest('.srtRow'); if(!row) return; e.preventDefault();
			var box=row.parentNode; if(box) box.querySelectorAll('.srtRow.srtOver').forEach(function(x){ x.classList.remove('srtOver'); }); row.classList.add('srtOver'); });
		rlMainEl.addEventListener('drop', function(e){ if(srtDrag===null) return; var row=e.target.closest('.srtRow'); if(row){ e.preventDefault();
			var from=srtDrag, to=+row.getAttribute('data-srt');
			if(from!==to && sorts[from]){ var m=sorts.splice(from,1)[0]; var at=(to>from)?to-1:to; sorts.splice(at,0,m); pageNum=1; sortOpen=true; saveLayout(); renderResults(); } }
			srtDrag=null; });
		rlMainEl.addEventListener('dragend', function(){ if(srtDrag!==null) srtDrag=null; var d=rlMainEl.querySelector('.srtRow.dragging'); if(d) d.classList.remove('dragging'); rlMainEl.querySelectorAll('.srtRow.srtOver').forEach(function(x){ x.classList.remove('srtOver'); }); });
	});
