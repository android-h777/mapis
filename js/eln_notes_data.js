/* ── Lab Note 목업 데이터 — 리스트(apis_note_user_list)와 상세 팝업(apis_eln_pop_simple)이 같이 쓰는 원본 하나 ──
   리스트는 ELN_MOCK.NB 를 그대로(같은 객체) 쓰고, 팝업은 ELN_MOCK.notes() 로 노트를 찾아 연다(?code=). 2026-10-26 리스트에서 분리 */
window.ELN_MOCK = (function(){
	// 노트북별 노트셋 (요약·계보 데이터 포함, 데모 목업)
	var NB = {
		unfiled: { name:'Unfiled', icon:'folder_off', notes:[
			{code:'LN-2606-00007', title:'Quick idea: low-VOC solvent swap to try', st:'ing', ver:'', cat:'General', fml:'', tags:[], author:'Charles Kim', date:'2026-06-02'},
			{code:'LN-2606-00004', title:'Lab meeting memo: June experiment planning', st:'ok', ver:'', cat:'General', fml:'', tags:[], author:'Charles Kim', date:'2026-05-31'}
		]},
		// history = parent 링크로 계산(저장 X). rgboled는 분기 트리: 098 ├118(├142 └097) └072
		// sharedWith = 내가 이 노트북을 공유한 동료(ELN_USERS id). 있으면 아이콘 folder_shared
		rgboled: { name:'RGBOLED Adhesive', icon:'folder_shared', sharedWith:['jwseo','hwcho'], sharedAt:{ jwseo:'2026-06-02', hwcho:'2026-06-10' }, sharedFn:{ jwseo:'Co-editor', hwcho:'Viewer' }, notes:[
			{code:'LN-2605-00142', title:'UV-Curable PSA Viscosity Improvement (RGBOLED)', st:'ing', ver:'v3', cat:'Formulation', fml:'FML-EM-2208', tags:['viscosity','RGBOLED'], author:'Charles Kim', created:'2026-05-23', date:'2026-05-28', parent:'LN-2605-00118'},   // 데모 노트 — 팝업 Audit(05-23 생성 ~ 05-28 Editor 수정)과 같음
			{code:'LN-2605-00118', title:'Viscosity Modifier ratio tuning (v2)', st:'appr', ver:'v2', cat:'Formulation', fml:'FML-EM-2207', tags:['viscosity'], author:'Charles Kim', date:'2026-05-27', parent:'LN-2605-00098'},
			{code:'LN-2605-00097', title:'Cure rate vs UV dose: condition sweep', st:'ok', ver:'v1', cat:'Formulation', fml:'', tags:['UVcure'], author:'Charles Kim', date:'2026-05-24', parent:'LN-2605-00118'},
			{code:'LN-2605-00098', title:'Initial trial: spec not met', st:'ok', ver:'v1', cat:'Formulation', fml:'FML-EM-2206', tags:['viscosity'], author:'Charles Kim', date:'2026-05-21'},
			{code:'LN-2605-00085', title:'Supplier sample evaluation: Silicone PSA base', st:'ok', ver:'', cat:'General', fml:'', tags:['supplier'], author:'Charles Kim', date:'2026-05-18'},
			{code:'LN-2605-00072', title:'Crosslinker screening for adhesion', st:'ing', ver:'', cat:'Formulation', fml:'', tags:['adhesion'], author:'Charles Kim', date:'2026-05-15', parent:'LN-2605-00098'}
		]},
		foled: { name:'Flexible OLED', icon:'folder', notes:[
			{code:'LN-2604-00210', title:'Bendable adhesive: fatigue test', st:'ing', ver:'v2', cat:'Formulation', fml:'FML-FX-1120', tags:['bending'], author:'S.Y. Park', date:'2026-04-30', parent:'LN-2604-00198'},
			{code:'LN-2604-00198', title:'Low-temperature cure exploration', st:'ok', ver:'v1', cat:'Formulation', fml:'FML-FX-1118', tags:['lowtemp'], author:'S.Y. Park', date:'2026-04-22'},
			{code:'LN-2604-00150', title:'Substrate compatibility memo', st:'ok', ver:'', cat:'General', fml:'', tags:['substrate'], author:'S.Y. Park', date:'2026-04-10'}
		]},
		optical: { name:'Optical Clear Resin', icon:'folder', notes:[
			{code:'LN-2603-00120', title:'Haze reduction: final formulation', st:'ok', ver:'v3', cat:'Formulation', fml:'FML-OC-3310', tags:['haze'], author:'M.J. Lee', date:'2026-03-28'},
			{code:'LN-2603-00088', title:'Yellowing aging test (85°C/85%RH)', st:'ing', ver:'v1', cat:'Formulation', fml:'FML-OC-3308', tags:['aging'], author:'M.J. Lee', date:'2026-03-12'}
		]},
		// 노트 하나만 공유받은 노트북(사용자 2026-10-21) — 공유받은 노트만 보이고, 나머지 노트는 잠금 행(검색의 권한 없는 노트와 같은 행, Ask to Share).
		// 잠긴 노트는 아래 RESTRICTED(Coating Team) 를 이 노트북에 붙인다. All Notes·개수에는 볼 수 있는 노트만
		coatingT: { name:'Silicone Coating Studies', icon:'folder_eye', owner:'hschoi', sharedOn:'2026-07-20', access:'Viewer', notes:[
			{code:'LN-2607-00298', title:'Release force vs cure temperature', st:'ok', ver:'v1', cat:'Formulation', fml:'', tags:['silicone','release'], author:'H.S. Choi', date:'2026-07-18', biz:'COAT', site:'LV01'}
		]},
		// owner = 나에게 공유한 사람(Shared with Me 그룹), sharedOn = 공유받은 날, access = 내 권한(Viewer / Co-editor).
		// 아이콘: Viewer = folder_eye(눈 배지), Co-editor = folder_edit(폴더 + 연필 배지, nbIcoHtml) — 같은 자리 배지로 짝, 내가 공유한 folder_shared(폴더 안 사람)와 구분(사용자 10-21)
		customerA: { name:'Customer A Project', icon:'folder_edit', owner:'ehan', sharedOn:'2026-05-10', access:'Co-editor', notes:[
			// 작성자 = 노트북 주인 E. Han(공유받은 노트북이라 내 노트가 아님)
			{code:'LN-2605-00301', title:'Customer A: OCR spec review', st:'ing', ver:'', cat:'General', fml:'', tags:['customerA'], author:'E. Han', date:'2026-05-30'},
			{code:'LN-2605-00288', title:'Adhesion to PET film', st:'ok', ver:'v2', cat:'Formulation', fml:'FML-CA-4410', tags:['adhesion'], author:'E. Han', date:'2026-05-26'},
			{code:'LN-2605-00270', title:'Cost-down reformulation', st:'appr', ver:'v1', cat:'Formulation', fml:'FML-CA-4408', tags:['costdown'], author:'E. Han', date:'2026-05-20'},
			{code:'LN-2605-00255', title:'Kickoff meeting notes', st:'ok', ver:'', cat:'General', fml:'', tags:['kickoff'], author:'E. Han', date:'2026-05-12'}
		]}
	};

	/* ── 검색 확장용 부가 데이터(NPI 번호·첨부 본문 스니펫) — 실제론 노트별 링크/첨부 텍스트 인덱스. project 는 NB_PROJECT(노트북 기본)를 그대로 사용 ── */
	// MAPIS 에선 NPI 번호가 곧 프로젝트 코드(SN=표준 NPI, CN=고객 NPI, PT=NPT). 코드 → 제목
	var PROJ_TITLE = {
		'SN-26-0031': 'RGBOLED Display Adhesive',
		'SN-26-0047': 'Low viscosity high vinyl polybutadiene',
		'CN-26-0064': 'Flexible OLED Lamination',
		'CN-26-0090': 'Customer A OCR Program',
		'CN-26-0112': 'UV-Curable Conformal Coating',
		'PT-25-0182': 'Optical Clear Resin',
		'PT-26-0021': 'New preservative for Silsoft',
		'PT-26-0034': 'Low Viscosity Binder Gel T',
		'TS-26-0205': 'Electro 242-2 Grey FC',          // Tech Support — 프로젝트 모듈 전범위(NPI·NPT·TS) 연결
		'TS-26-0218': 'High-Temp Silicone Encapsulant'
	};
	// 노트북의 프로젝트 = 새 노트의 '기본값'일 뿐. 시드 시점에 각 노트의 project 로 복사하고, 이후 노트 이동은 project 를 바꾸지 않음
	var NB_PROJECT = { rgboled:'SN-26-0031', foled:'CN-26-0064', optical:'PT-25-0182', customerA:'CN-26-0090' };
	/* Basic Data(팝업과 같은 항목, 2026-10-21) — Primary Business · Other Business(es) · Site. 노트북 기본값 + 노트별 덮어쓰기(n.biz/others/site).
	   이름표 = 팝업과 같은 운영 DEXIF BIZ 코드 · lib_site(Plant) 코드 */
	var BIZ_NAME = { COAT:'Coatings', EM:'Electronic Materials', HCARE:'Healthcare', INDL:'Industrial', PCARE:'Personal Care', UADD:'Urethane Additives', SADD:'Specialty Additives', TRSL:'Tire & Silanes' };
	var SITE_NAME = { IT01:'Itatiba', MS01:'Shanghai - China', LV01:'Leverkusen - DE', AB01:'Abingdon', IN02:'Bangalore R&D (Tech) Center', TE01:'Termoli', OT01:'Ohta - Japan',
		KP01:'Hwaseong - Korea', CHNC:'Charlotte', GART:'Garrett', PEAR:'Pearl River - US', SVLL:'Sistersville', WTFD:'Waterford' };
	var NB_BASIC = { unfiled:{ biz:'COAT', others:[], site:'KP01' }, rgboled:{ biz:'COAT', others:['EM'], site:'KP01' }, foled:{ biz:'EM', others:[], site:'KP01' },
		optical:{ biz:'EM', others:['COAT'], site:'KP01' }, customerA:{ biz:'COAT', others:[], site:'KP01' } };
	// projects = 노트에 연결된 프로젝트 코드(Primary 개념 없음 — 단순 연관 항목)
	var NOTE_EXTRA = {
		// materials = Related Items 의 Material(자재+Plant, 팝업 Basic Data 와 같은 데모 칩)
		// 첨부 = 팝업 데모 노트의 Attachments 와 같은 파일·같은 숫자(목표 4,200~4,800 cP, v3 4,520 cP)
		'LN-2605-00142': { projects:['PT-26-0021','TS-26-0205'], materials:[{ mat:'30565', desc:'1,6-HEXANEDIOL DIACRYLATE, 067230', plant:'KP01' }], attach:[
			{ name:'Test_Report_RGBOLED.pdf', text:'…viscosity 4,520 cP at 25°C, cure 96%, haze 0.8%, all specs met…' },
			{ name:'Viscosity_Results.xlsx',  text:'…viscosity modifier sweep 2.5 to 4.5 wt%, 4.0 wt% average 4,520 cP, spec 4,200 to 4,800 cP…' } ] },
		'LN-2605-00118': { attach:[ { name:'modifier_ratio.xlsx', text:'…2.5 wt% modifier gave viscosity 4,780 cP, at the upper edge of the 4,200 to 4,800 cP window…' } ] },
		'LN-2605-00097': { attach:[ { name:'uv_dose_sweep.xlsx', text:'…cure rate 91% at 800 mJ/cm², 96% at 1,200 mJ/cm²…' } ] },
		'LN-2605-00085': { attach:[ { name:'supplier_COA.pdf', text:'…silicone PSA base lot 24-118, solids 58%, viscosity 3,200 cP…' } ] },
		'LN-2605-00288': { projects:['SN-26-0031'], attach:[ { name:'peel_test_report.docx', text:'…180° peel strength 12.4 N/25mm on PET film, adhesive failure…' } ] },
		'LN-2604-00210': { projects:['SN-26-0031'], attach:[ { name:'fatigue_cycles.pdf', text:'…200,000 bending cycles at R=3mm, no delamination observed…' } ] },
		'LN-2603-00120': { projects:['PT-26-0034'], attach:[ { name:'haze_report.pdf', text:'…haze 0.4% after 500 h, transmittance 92%…' } ] }
	};
	// 프로젝트 코드 목록 병합(중복·빈 값 제거) — 첫 인자는 단일 코드 또는 빈 값
	function mergeProjects(first, list){
		var out = [];
		[first].concat(list || []).forEach(function(c){ if(c && out.indexOf(c) < 0) out.push(c); });
		return out;
	}
	Object.keys(NB).forEach(function(k){
		NB[k].notes.forEach(function(n){
			var x = NOTE_EXTRA[n.code]; if(x) Object.keys(x).forEach(function(f){ n[f] = x[f]; });
			n.projects = mergeProjects(NB_PROJECT[k], n.projects);   // 노트북 기본 프로젝트 + 추가 연결을 하나의 목록으로
		});
	});
	// 권한 없는 타팀 노트(검색 결과에만 노출, 노트북/All Notes 에는 절대 포함 X). 행에는 번호·제목·작성자·날짜만 — 태그/첨부는 매칭에만 쓰고 노출 금지
	var RESTRICTED = [
		{ code:'LN-2607-00311', title:'Silicone Release Coating', st:'ok', author:'H.S. Choi', team:'Coating Team', date:'2026-07-14', tags:['silicone','release'], project:'SN-26-0047', biz:'COAT', site:'LV01', attach:[{name:'release_force.pdf', text:'…release force 12 g/in…'}] },
		{ code:'LN-2606-00276', title:'Viscosity control of hard coat resin', st:'ing', author:'H.S. Choi', team:'Coating Team', date:'2026-06-20', tags:['viscosity','hardcoat'], project:'SN-26-0031', projects:['PT-26-0021'], biz:'COAT', site:'LV01' },
		{ code:'LN-2608-00045', title:'Silicone adhesive peel strength study', st:'ok', author:'D.H. Jung', team:'Adhesives Pilot Team', date:'2026-08-03', tags:['silicone','peel'], project:'PT-26-0034', biz:'SADD', site:'WTFD' },
		{ code:'LN-2609-00019', title:'Barrier coating pinhole analysis', st:'appr', author:'Y.R. Kwon', team:'Barrier Film Team', date:'2026-09-02', tags:['barrier','coating'], project:'CN-26-0112', projects:['SN-26-0047'], biz:'EM', site:'MS01' }
	].map(function(n){ n.restricted = true; n.projects = mergeProjects(n.project, n.projects); delete n.project; return n; });
	// 노트 하나만 공유받은 노트북(coatingT)의 나머지 노트 = 같은 팀(Coating Team)의 권한 없는 노트 → 그 노트북 안에 잠금 행으로
	NB.coatingT.notes = NB.coatingT.notes.concat(RESTRICTED.filter(function(n){ return n.team === 'Coating Team'; }));

	// 노트의 Basic Data — 노트별 값(n.biz/others/site) > 노트북 기본값(NB_BASIC)
	function basicOf(n, nbKey){ var d = (!n.restricted && NB_BASIC[nbKey]) || {}; return { biz: n.biz || d.biz || '', others: n.others || d.others || [], site: n.site || d.site || '' }; }
	// 볼 수 있는 노트 전체(잠긴 노트 제외)의 복사본 + _nb(들어 있는 노트북). 팝업은 자기 창에서 이 파일을 따로 읽으므로
	// 리스트에서 바꾼 값(상태·노트북)은 여기 반영되지 않음 → 리스트가 ?st=·?nb= 로 넘긴다
	function notes(){
		var out = [];
		Object.keys(NB).forEach(function(k){
			NB[k].notes.forEach(function(n){ if(!n.restricted) out.push(Object.assign({ _nb:k }, n)); });
		});
		return out;
	}
	function find(code){ return notes().filter(function(n){ return n.code === code; })[0] || null; }
	// 노트의 섹션 구성(Basic Data·Approval 은 고정이라 제외) — 팝업이 이 순서로 카드를 깔고, 리스트 요약 Modules 도 같은 값
	var DEMO_CODE = 'LN-2605-00142';
	var MODULE_NAME = { fml:'Formulation', editor:'Editor', table:'Data Visualization', chem:'ChemStudio', reaction:'Reaction', attach:'Attachments' };
	function modulesOf(n){
		if(n.code === DEMO_CODE) return ['fml','editor','table','chem','reaction','attach'];
		return n.fml ? ['fml','editor','table','attach'] : ['editor','attach'];
	}

	return { NB:NB, PROJ_TITLE:PROJ_TITLE, NB_PROJECT:NB_PROJECT, BIZ_NAME:BIZ_NAME, SITE_NAME:SITE_NAME, NB_BASIC:NB_BASIC,
		NOTE_EXTRA:NOTE_EXTRA, RESTRICTED:RESTRICTED, mergeProjects:mergeProjects, basicOf:basicOf, notes:notes, find:find,
		DEMO_CODE:DEMO_CODE, MODULE_NAME:MODULE_NAME, modulesOf:modulesOf };
})();
