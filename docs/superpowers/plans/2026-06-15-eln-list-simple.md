# ELN List Simple — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `apis_eln_list_simple.html`을 Notebook 계층·계보가 없는 단순 구조로 재구성한다 — 좌 MAPIS Project 목록 / 우 노트 목록의 npdi 2분할, note는 project에만 종속.

**Architecture:** 단일 HTML 파일 in-place 수정. 데이터는 `NB` 중첩 트리 → 평탄 `NOTES` 배열 + `PROJECTS` 배열로 평탄화. 레이아웃 골격은 공용 `mapis_lib/css/common.css`의 `typeList type2`/`statusBox`/`pjTit` 재사용, ELN 전용 스타일만 신규 `css/eln_proto_simple.css`로 분리(원본 `apis_eln_list.html` 보호).

**Tech Stack:** 정적 HTML + 바닐라 JS(인라인 `<script>`) + Materialize. 테스트 프레임워크 없음 → 검증은 **grep(잔여 참조 0)** + **인라인 JS 문법 체크** + **Playwright 브라우저 육안**.

**검증 규약(이 프로젝트 전용, TDD 대체):** 각 Task는 "변경 → 검증" 사이클. 검증은 다음 중 해당하는 것:
- 잔여/신규 식별자: `grep -n` 으로 0건 또는 존재 확인
- JS 문법: `sed -n '/<script>/,/<\/script>/p' 파일 | sed '1d;$d' > /tmp/eln.js && node --check /tmp/eln.js` (마지막 `<script>` 블록 기준; 블록이 여럿이면 해당 범위 라인 추출)
- 렌더: Playwright `browser_navigate` → `browser_console_messages`(에러 0) → `browser_snapshot`

---

## File Structure

- **Modify:** `apis_eln_list_simple.html` — head CSS link, 본문 레이아웃, 인라인 `<script>` 데이터·렌더·이벤트
- **Create/populate:** `css/eln_proto_simple.css` — simple 전용 스타일 (사용자가 빈 파일 제공 예정; 없으면 생성)
- **Reference (수정 안 함):** `apis_eln_pop.html`(노트 상세 팝업), `mapis_lib/css/common.css`(공용 레이아웃), `apis_npdi_list.html`(레이아웃 참조)

각 Task는 데이터→레이아웃→렌더→이벤트→스타일 순. 상호의존이 강해 **중간 상태는 브라우저에서 불완전할 수 있음**; 전체 동작 검증은 Task 7에서 수행하고, 중간 Task는 grep/문법으로 부분 검증한다.

---

## Task 1: CSS link 전환 + 전용 스타일시트 스캐폴드

**Files:** Modify `apis_eln_list_simple.html` (head, L23) · Create `css/eln_proto_simple.css`

- [ ] **Step 1: 전용 CSS 파일 확보**

`css/eln_proto_simple.css`가 없으면 생성하고 헤더 주석만 둔다:

```css
/* eln_proto_simple.css — apis_eln_list_simple 전용. 원본 eln_proto.css와 분리(원본 화면 보호).
   레이아웃 골격은 공용 mapis_lib/css/common.css(typeList type2/statusBox/pjTit) 재사용,
   여기에는 ELN 전용 커스텀만(Project 행·status 3색·노트 메타). */
```

- [ ] **Step 2: head의 CSS link 교체**

`apis_eln_list_simple.html` L23:
```html
    <link rel="stylesheet" type="text/css" href="css/eln_proto.css">
```
→
```html
    <link rel="stylesheet" type="text/css" href="css/eln_proto_simple.css">
```

- [ ] **Step 3: 검증**

```bash
grep -n "eln_proto" apis_eln_list_simple.html
```
Expected: `eln_proto_simple.css` 1건만, 기존 `eln_proto.css` 0건.

---

## Task 2: 데이터 레이어 — PROJECTS / 평탄 NOTES / ST 3종

**Files:** Modify `apis_eln_list_simple.html` `<script>` — `ST`(L151-156), `NB`(L252-281), `NB_PROJECT`(L446-451), `getNotes`(L286-)

- [ ] **Step 1: ST를 3종으로 교체**

L151-156 의 `var ST = [...]` 를:
```js
	var ST = [
		{k:'ing',  cls:'blue',   t:'In Progress'},
		{k:'appr', cls:'orange', t:'In Approval'},
		{k:'ok',   cls:'green',  t:'Approved'}
	];
```
(`fail`/`hold` 키 제거, `ok` 라벨 Success→Approved, `appr` 신규)

- [ ] **Step 2: PROJECTS 배열 신설 + NB_PROJECT 제거**

L446-451 의 `var NB_PROJECT = {...}` 를 다음으로 교체:
```js
	// MAPIS 프로젝트(읽기전용 목록). status는 ST 키(ing/appr/ok).
	var PROJECTS = [
		{ code:'SN-26-0031', name:'RGBOLED Display Adhesive', status:'ing' },
		{ code:'CN-26-0064', name:'Flexible OLED Lamination', status:'ing' },
		{ code:'PT-25-0182', name:'Optical Clear Resin',      status:'ok'  },
		{ code:'SN-26-0090', name:'Customer A OCR Program',   status:'ing' }
	];
	function projByCode(c){ return PROJECTS.filter(function(p){ return p.code === c; })[0] || null; }
```
그리고 `noteProject(n)`(L452)을 단순화:
```js
	function noteProject(n){ return n.project || ''; }
```

- [ ] **Step 3: NB 중첩 → 평탄 NOTES 배열로 교체**

L252-281 의 `var NB = {...}` 를 `var NOTES = [...]` 평탄 배열로 교체한다. **변환 규칙:**
- 각 노트에 `project:'<코드>'` 추가 (노트북→프로젝트 매핑: rgboled→`SN-26-0031`, foled→`CN-26-0064`, optical→`PT-25-0182`, customerA→`SN-26-0090`)
- 기존 `unfiled` 2개(NT-2606-00007, NT-2606-00004) → `SN-26-0031`(RGBOLED)로 배정 (미지정 폐기, 모든 노트 Project 소속)
- `st` 재매핑: `ok`→`ok`, `fail`→`ok`, `hold`→`appr`, `ing`→`ing`
- `parent` 키 **삭제** (계보 제거)
- 나머지 필드(code,title,ver,cat,fml,tags,author,date) 유지

예시 2건(나머지 15건 동일 규칙 적용):
```js
	var NOTES = [
		{code:'NT-2605-00142', title:'UV-Curable PSA Viscosity Improvement — RGBOLED', st:'ing', ver:'v3', cat:'Formulation', fml:'FML-EM-2208', tags:['#viscosity','#RGBOLED'], author:'J.P. Kim', date:'2026-05-28', project:'SN-26-0031'},
		{code:'NT-2605-00118', title:'Viscosity Modifier ratio tuning (v2)', st:'appr', ver:'v2', cat:'Formulation', fml:'FML-EM-2207', tags:['#viscosity'], author:'J.P. Kim', date:'2026-05-27', project:'SN-26-0031'},
		// … rgboled 나머지 4건(00097 ok, 00098 fail→ok, 00085 ok, 00072 ing) + unfiled 2건 → project:'SN-26-0031'
		// … foled 3건 → project:'CN-26-0064' (00210 ing, 00198 ok, 00150 ok)
		// … optical 2건 → project:'PT-25-0182' (00120 ok, 00088 ing)
		// … customerA 4건 → project:'SN-26-0090' (00301 ing, 00288 ok, 00270 hold→appr, 00255 ok)
	];
```
(hold였던 노트: rgboled 00118, customerA 00270 → `appr`. fail이던 rgboled 00098 → `ok`.)

- [ ] **Step 4: getNotes를 project 기준으로 재작성**

L286-298 의 `getNotes(key)` (NB 순회 + `_nb` 부착)를 교체:
```js
	// key: 'all'=전체, 그 외=project 코드. 최근 수정순(date desc) 정렬.
	function getNotes(key){
		var arr = (key === 'all') ? NOTES.slice() : NOTES.filter(function(n){ return n.project === key; });
		return arr.sort(function(a, b){ return a.date < b.date ? 1 : (a.date > b.date ? -1 : 0); });
	}
```
(`_nb`/`_nbName`/`_nbIcon` 부착 전부 삭제)

- [ ] **Step 5: 검증**

```bash
grep -nc "var NB \|var NB=\|NB_PROJECT\|_nbName\|_nbIcon\|\.parent" apis_eln_list_simple.html   # 0 기대
grep -nc "var NOTES\|var PROJECTS\|st:'appr'" apis_eln_list_simple.html                          # >0 기대
grep -oE "st:'[a-z]+'" apis_eln_list_simple.html | sort | uniq -c                                # fail/hold 0건 확인
```
Expected: `fail`/`hold` 0건, `ing`/`appr`/`ok`만. `parent` 0건.

---

## Task 3: HTML 레이아웃 — npdi 2분할(Project 패널 + Notes 패널)

**Files:** Modify `apis_eln_list_simple.html` 본문 (L76-153 영역: `contArea`~닫는 `</article>`)

- [ ] **Step 1: 본문 레이아웃 교체**

L76 `<article class="contArea elnWsArea">` ~ L153 `</article>` 전체를 npdi 2분할 구조로 교체. 좌 leftSection=Project 목록(JS 렌더), 우 rightSection=Notes 목록(JS 렌더):

```html
	<article class="contArea typeList type2 elnSimpleArea">
		<div class="leftSection">
			<section class="mainTitArea">
				<div class="mainTit">Projects</div>
			</section>
			<section class="mainList cardBox">
				<ul class="hScroll" id="projListUl"><!-- JS 렌더 --></ul>
			</section>
		</div>
		<div class="rightSection elnNoteSection">
			<section class="mainTitArea">
				<div class="mainTit" id="noteSecTit">Notes</div>
				<div class="btnArea">
					<div><a href="javascript:;" id="elnSearchBtn" class="waves-effect waves-light hBtn"><i class="material-symbols-outlined left">search</i><span class="label">Search</span></a></div>
					<div><a href="javascript:;" id="elnNewNote" class="waves-effect waves-light hBtn hViva"><i class="material-symbols-outlined left">note_add</i><span class="label">New Note</span></a></div>
				</div>
			</section>
			<section class="mainList cardBox">
				<ul class="hScroll" id="noteListUl"><!-- JS 렌더 --></ul>
			</section>
		</div>
	</article>
```
(기존 좌 `elnNbPanel`·중 `elnNotePanel`(뷰토글/렌즈뷰 포함)·우 `elnSummary` 마크업 전부 대체. 검색결과 crit/clear 표시는 noteSecTit 영역에서 후속 처리 — Task 5 검색에서 다룸.)

- [ ] **Step 2: 검증**

```bash
grep -nc "elnNbPanel\|elnSummary\|elnNotePanel\|elnViewToggle\|elnChemView\|elnFmlView" apis_eln_list_simple.html  # 0 기대
grep -nc "projListUl\|noteListUl\|rightSection" apis_eln_list_simple.html                                          # >0 기대
```

---

## Task 4: 렌더 로직 — Project 목록 신설 / Notes 목록 수정 / 계보·요약·렌즈·뷰 제거

**Files:** Modify `apis_eln_list_simple.html` `<script>`

- [ ] **Step 1: renderProjectList 신설**

`renderNotes`(L390 부근) 앞에 추가:
```js
	// 좌측 Project 목록 — statusBox(프로젝트 상태) + [코드] 이름 + 노트 수
	function renderProjectList(){
		var ul = document.getElementById('projListUl');
		ul.innerHTML = '';
		PROJECTS.forEach(function(p){
			var s = stByKey(p.status);
			var cnt = NOTES.filter(function(n){ return n.project === p.code; }).length;
			var li = document.createElement('li');
			li.className = 'waves-effect waves-hColor' + (p.code === curProj ? ' on' : '');
			li.setAttribute('data-proj', p.code);
			li.innerHTML = '<section class="statusBox ' + s.cls + '">' + s.t + '</section>' +
				'<section class="wd100p"><div class="pjTit">[' + p.code + '] ' + esc(p.name) + '</div>' +
				'<div class="subInfo"><div><div class="roundBox">' + cnt + ' notes</div></div></div></section>';
			ul.appendChild(li);
		});
	}
```

- [ ] **Step 2: 상태변수 정리 (curNbKey → curProj)**

L283 `var curNbKey = 'all', curFilter='all', curNotes=[], curView='list', curSummaryNote=null, curSearch=null;` 를:
```js
	var curProj = null, curFilter = 'all', curNotes = [], curSearch = null;
```
(`curView`/`curSummaryNote` 제거; 첫 Project 자동선택은 init에서.)

- [ ] **Step 3: renderNoteList에서 노트북 배지(showNb) 제거 + 메타 보강**

L339-389 `renderNoteList(notes, showNb)`:
- 시그니처를 `renderNoteList(notes)`로 (showNb 인자 삭제)
- L360-366 `if(showNb){ … elnNoteNb … }` 블록 **삭제**
- 제목 아래 메타에 날짜·작성자·fml 추가(pjTit 다음, 태그 위). 예:
```js
		var info = document.createElement('div'); info.className = 'subInfo';
		info.innerHTML = '<div>' +
			'<div class="roundBox">' + esc(n.date) + '</div>' +
			'<div class="roundBox">' + esc(n.author) + '</div>' +
			(n.fml ? '<div class="roundBox blue">' + esc(n.fml) + '</div>' : '') +
			(n.cat ? '<div class="roundBox">' + esc(n.cat) + '</div>' : '') +
		'</div>';
		main.appendChild(info);
```
- 기존 태그 라인(elnNoteTags) 로직은 유지.
- L390-393 `renderNotes(key)`: `renderNoteList(curNotes, key==='all')` → `renderNoteList(curNotes)`; 인자 key는 project 코드.

- [ ] **Step 4: 계보·요약·렌즈·뷰 함수 일괄 제거**

다음 함수/블록을 통째로 삭제(존재 라인은 실행 시 grep으로 확정):
- 계보: `lineageIndex` `lineageRoot` `lineageChildren` + 인라인 계보 HTML 생성부 + `openLineageModal`(L527 부근, `ELN.historyGraph` 호출 포함)
- 요약: `renderSummary`(L459) `clearSummary`(L545 부근) `selectFirst`/`selectFirstLens` 중 요약 선택 의존부
- 뷰/렌즈: `applyView` `VIEW_HOST` `SHOW_SUMMARY` `renderChemView` `renderFmlView` (있다면)
- `nbColor` `nbGroupOf` `NB_GROUP_COLOR` `paintNbColor`

- [ ] **Step 5: 검증**

```bash
grep -nc "lineage\|historyGraph\|openLineageModal\|renderSummary\|applyView\|renderChemView\|renderFmlView\|nbColor\|showNb" apis_eln_list_simple.html  # 0 기대
grep -nc "function renderProjectList\|curProj" apis_eln_list_simple.html  # >0 기대
sed -n '/<script>/,/<\/script>/p' apis_eln_list_simple.html | sed '1d;$d' > /tmp/eln.js && node --check /tmp/eln.js && echo "SYNTAX OK"
```
Expected: 제거 식별자 0, 문법 OK.

---

## Task 5: 이벤트 재배선 + 검색 project 필터

**Files:** Modify `apis_eln_list_simple.html` `<script>` (이벤트 바인딩부 L1057-1120 영역, 검색 L656-742 영역, init)

- [ ] **Step 1: Project 행 클릭 → 노트목록 교체**

기존 노트북 패널 클릭 핸들러(`elnNbPanel` 대상, L1057 부근)를 Project 클릭으로 교체:
```js
	document.getElementById('projListUl').addEventListener('click', function(e){
		var li = e.target.closest('li[data-proj]'); if(!li) return;
		curProj = li.getAttribute('data-proj'); curSearch = null; curFilter = 'all';
		document.querySelectorAll('#projListUl li').forEach(function(x){ x.classList.remove('on'); });
		li.classList.add('on');
		var p = projByCode(curProj);
		document.getElementById('noteSecTit').textContent = p ? ('Notes · [' + p.code + ']') : 'Notes';
		curNotes = getNotes(curProj);
		renderNoteList(curNotes);
	});
```

- [ ] **Step 2: 노트 행 클릭 → 상세 팝업**

기존 noteListUl 클릭 핸들러(요약 선택/openNote 혼재, L1040 부근)를 단순화 — 행 클릭 = 상세 팝업, 태그 클릭 = 태그검색:
```js
	document.getElementById('noteListUl').addEventListener('click', function(e){
		var tagA = e.target.closest('.elnTagLink');
		if(tagA){ e.preventDefault(); runSearch({ keyword:'', tags:tagA.getAttribute('data-tag'), status:'all', project:'all' }); return; }
		var li = e.target.closest('li[data-idx]'); if(!li) return;
		var n = curNotes[+li.getAttribute('data-idx')];
		if(n) openNote(n);   // 상세 팝업(apis_eln_pop). 기존 openNote 시그니처 확인 후 인자 맞춤.
	});
```
(`renderSummary` 호출 제거. `openNote`의 기존 인자가 `n._nb`였다면 `n` 또는 `n.code`로 조정 — 실행 시 `openNote` 정의 확인.)

- [ ] **Step 3: 노트북 CRUD 핸들러·New Notebook 제거**

`renameNotebook`/`deleteNotebook`(L770 부근)과 `elnNewNotebook` 핸들러, 드래그정렬(sortable) 노트북 관련 삭제.

- [ ] **Step 4: 검색 notebook → project 필터**

검색 모달 폼(L716-742): `srchNotebook` 라벨/옵션을 project로. 옵션 채우기를 PROJECTS 기준으로:
```js
	var pjSel = form.querySelector('#srchProject');
	opt(pjSel, 'all', 'All projects');
	PROJECTS.forEach(function(p){ opt(pjSel, p.code, '[' + p.code + '] ' + p.name); });
```
`noteMatches`(L656 부근)의 `c.notebook`/`n._nb` 비교를 `c.project`/`n.project`로 교체. `runSearch`가 채우는 `curNotes = NOTES.filter(...)`로 조정(getNotes('all') 대신 NOTES 직접). crit 칩(L675)도 'Notebook'→'Project'.

- [ ] **Step 5: init 정리 — 첫 Project 자동 선택**

DOMContentLoaded/초기화부에서: `renderProjectList()` 호출 후 첫 Project 선택해 노트 렌더:
```js
	renderProjectList();
	curProj = PROJECTS[0].code;
	document.querySelector('#projListUl li[data-proj="' + curProj + '"]').classList.add('on');
	document.getElementById('noteSecTit').textContent = 'Notes · [' + curProj + ']';
	curNotes = getNotes(curProj);
	renderNoteList(curNotes);
```
(기존 `renderNotes('all')`/`applyView()` 초기 호출 대체.)

- [ ] **Step 6: 검증**

```bash
grep -nc "elnNbPanel\|renameNotebook\|deleteNotebook\|elnNewNotebook\|_nb\b\|c.notebook" apis_eln_list_simple.html  # 0 기대
grep -nc "data-proj\|curProj = PROJECTS\|srchProject" apis_eln_list_simple.html  # >0 기대
sed -n '/<script>/,/<\/script>/p' apis_eln_list_simple.html | sed '1d;$d' > /tmp/eln.js && node --check /tmp/eln.js && echo "SYNTAX OK"
```

---

## Task 6: 전용 스타일 — `eln_proto_simple.css`

**Files:** Modify `css/eln_proto_simple.css`

- [ ] **Step 1: status 3색 + 2분할 미세조정 작성**

```css
/* 2분할 비중·간격 (공용 typeList type2 위에 ELN 조정) */
.elnSimpleArea .leftSection{ flex: 0 0 46%; }
.elnSimpleArea .rightSection{ flex: 1; }
.elnSimpleArea .mainList li{ cursor: pointer; }

/* status 3색 — statusBox 배경/테두리 (ST cls: blue/orange/green) */
#projListUl .statusBox.blue,  #noteListUl .statusBox.blue  { color:#2f80ed; border-color:#2f80ed; }
#projListUl .statusBox.orange,#noteListUl .statusBox.orange{ color:#e0a83e; border-color:#e0a83e; }
#projListUl .statusBox.green, #noteListUl .statusBox.green { color:#3aaa6f; border-color:#3aaa6f; }

/* 선택 행 강조 */
#projListUl li.on, #noteListUl li.on{ background: rgba(164,120,100,.10); }

/* 노트 메타·태그 (기존 eln_proto.css에서 simple로 이관한 최소분) */
.elnNoteTags{ margin-top:6px; display:flex; flex-wrap:wrap; gap:8px; }
.elnTagLink{ font-size:12px; color:#7a6757; }
.elnTagLink:hover{ color:#A47864; text-decoration:underline; }
.elnListEmpty{ display:flex; align-items:center; gap:8px; color:#b3a596; padding:14px; }
```
(공용 `statusBox` 기본 스타일이 색을 이미 입히면 위 override 조정. 실제 색은 브라우저 확인 후 미세조정.)

- [ ] **Step 2: 검증**

```bash
grep -nc "elnSimpleArea\|statusBox.orange\|projListUl" css/eln_proto_simple.css  # >0 기대
```

---

## Task 7: 통합 검증 (브라우저 육안 + 잔여 참조 0)

**Files:** 없음(검증만)

- [ ] **Step 1: 전역 잔여 참조 0 확인**

```bash
grep -nEc "NB_PROJECT|_nbName|_nbIcon|elnNbPanel|elnSummary|lineage|historyGraph|renderSummary|notebook|st:'(fail|hold)'|elnViewToggle|elnChemView" apis_eln_list_simple.html
```
Expected: 0 (notebook은 검색 라벨 텍스트 잔존 가능 — 수동 확인).

- [ ] **Step 2: JS 문법 최종**

```bash
sed -n '/<script>/,/<\/script>/p' apis_eln_list_simple.html | sed '1d;$d' > /tmp/eln.js && node --check /tmp/eln.js && echo "SYNTAX OK"
```

- [ ] **Step 3: 브라우저 육안 (Playwright)**

- `browser_navigate` → `file:///mnt/f/mpm_project/apis_eln_list_simple.html`
- `browser_console_messages` → 에러 0 확인
- `browser_snapshot` → 좌 Project 4행(상태칩+코드+이름+노트수), 우 첫 Project 노트 목록 렌더 확인
- Project 행 클릭 → 우측 노트목록 교체 확인
- 노트 행 클릭 → 상세 팝업(`apis_eln_pop`) 열림 확인
- 좌/우에 In Progress·In Approval·Approved 3색 statusBox 노출, 계보/요약/뷰토글 부재 확인

- [ ] **Step 4: 사용자 육안 보고**

스크린샷과 함께 사용자에게 확인 요청. status 색/2분할 비중 등 미세조정 피드백 수렴.

---

## Self-Review 체크 (작성자 수행 완료)

- **Spec 커버리지:** 레이아웃(T3)·데이터모델(T2)·status3종(T2)·제거범위(T4)·상단/검색(T3·T5)·가정 a/b/c(T2 unfiled배정·T5 노트클릭·T5 검색) 모두 Task 매핑됨.
- **Placeholder:** NOTES 17건은 "변환 규칙 + 대표 예시 + 분포 주석"으로 명세(전량 나열 대신 규칙) — 실행 시 기존 데이터 Read 후 규칙 적용.
- **타입 일관성:** `curProj`(코드 문자열), `getNotes(projCode|'all')`, `projByCode`, `st∈{ing,appr,ok}`, `openNote(n)` 인자 실행 시 확정 — Task 간 명칭 일치.
