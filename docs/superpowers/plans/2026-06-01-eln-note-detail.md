# [3] 노트 상세/작성 화면 — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** MAPIS ELN 프로토타입의 주인공 화면 [3] 노트 상세/작성을, 1차 아카이브(`eln_archive_2026-05-29/apis_eln_pop.html`)를 새 설계로 진화시켜 구현한다.

**Architecture:** mapis_lib(운영 자산 복사본)는 **읽기 전용** — 절대 수정하지 않는다. ELN 전용 변경은 신규 파일 3개(`apis_eln_pop.html` · `css/eln_proto.css` · `js/eln_proto.js`)에만 모은다. 정적 HTML/CSS/jQuery, 빌드 없음. 검증은 단위 테스트가 아니라 **브라우저 육안 확인**.

**Tech Stack:** 정적 HTML5, mapis_lib(SUIT 폰트·Materialize·material-symbols·glass_engine·Highcharts 12.3.0), jQuery 3.7.1. 빌드 도구 없음.

**디자인 방침(중요):** 이번 계획은 **구조·기능 우선**. 색·여백·모션 등 "취향 레이어"는 의도적으로 최소만 잡고, 시각 세련화는 구현 후 화면 보며 조율한다. mapis와 똑같이 갈 필요 없음 — ELN 고유 결을 더 허용. 단 모든 시각 추가는 `eln_proto.css`에만(mapis_lib 불가침).

**1차 아카이브와의 격차(=이 계획이 하는 일):**
1. status를 헤더 단순 표시 → **세그먼트 탭 토글**(진행중·성공·실패·보류)로
2. **결재선 카드 제거**(이번 MVP 결재 없음)
3. 우측 **접이식 연계패널(rightAside)** 신설 + **status 연동 자동 접힘/펼침**
4. **카테고리 선택** UI(배합실험/일반) + 골격 전환
5. **자유태그** 칩 입력(수동, 정규화 가정) + 최근태그 영역
6. **계보 미니맵**(목업, status 색상)

---

## 파일 구조

| 파일 | 책임 | 상태 |
|---|---|---|
| `apis_eln_pop.html` | [3] 노트 상세 마크업 셸 + 초기화 스크립트 호출 | **신규**(아카이브 복사 후 진화) |
| `css/eln_proto.css` | ELN 전용 스타일(세그먼트·rightAside·태그칩·계보미니맵). mapis_lib 위에 *얹기*만 | **신규** |
| `js/eln_proto.js` | ELN 전용 동작(status 토글→패널 연동, 카테고리 전환, 태그칩, 계보 목업) | **신규** |
| `mapis_lib/**` | 운영 자산 복사본 | **읽기 전용 — 수정 금지** |

> 합치기 용이성: "ELN이 추가한 것 = 위 신규 3개"가 자명하도록 모든 변경을 여기에 가둔다.

---

## Task 1: 베이스 셸 복사 + ELN 전용 파일 골격

**Files:**
- Create: `apis_eln_pop.html` (루트, 아카이브에서 복사 후 수정)
- Create: `css/eln_proto.css`
- Create: `js/eln_proto.js`

- [ ] **Step 1: 아카이브 출발 파일을 루트로 복사**

```bash
cp "eln_archive_2026-05-29/apis_eln_pop.html" apis_eln_pop.html
```

- [ ] **Step 2: ELN 전용 빈 파일 2개 생성**

`css/eln_proto.css`:
```css
/* MAPIS ELN 프로토타입 전용 스타일 — mapis_lib 위에 얹기만(운영 자산 불가침).
   합칠 때 이 파일 = ELN이 추가한 CSS 전부. */
```

`js/eln_proto.js`:
```javascript
/* MAPIS ELN 프로토타입 전용 동작 — 합칠 때 이 파일 = ELN이 추가한 JS 전부. */
(function () {
  'use strict';
  window.ELN = window.ELN || {};
})();
```

- [ ] **Step 3: HTML <head>에 ELN 전용 파일 링크 추가**

`apis_eln_pop.html`의 `</head>` 직전(기존 glass_engine.js 다음 줄)에 추가:
```html
    <link rel="stylesheet" type="text/css" href="css/eln_proto.css">
    <script defer src="js/eln_proto.js"></script>
```

- [ ] **Step 4: 브라우저에서 회귀 확인**

`apis_eln_pop.html`을 브라우저로 연다.
Expected: 아카이브와 **동일하게** 보임(좌측 메뉴·카드 스택·점도 차트). 콘솔 에러 없음. (아직 ELN 전용 파일은 비어 있으므로 변화 없어야 정상)

- [ ] **Step 5: Commit**

```bash
git add apis_eln_pop.html css/eln_proto.css js/eln_proto.js
git commit -m "ELN [3] 노트상세: 베이스 셸 복사 + 전용 파일 골격"
```

---

## Task 2: 결재선 카드 제거 + 좌측 메뉴 정리

**Files:**
- Modify: `apis_eln_pop.html` (결재선 section 삭제, 좌측 메뉴 항목 삭제)

- [ ] **Step 1: 결재선 카드 섹션 삭제**

`apis_eln_pop.html`에서 `<!-- 결재선 (최하단, 저강조) -->` 주석부터 그 `</section>`까지(아카이브 기준 212~233행) 통째로 삭제.

- [ ] **Step 2: 좌측 메뉴에서 '결재선' 항목 삭제**

좌측 `menuUl`에서 `data-target="card_appr"` 인 `<li>` 한 줄 삭제(아카이브 기준 58~60행).

- [ ] **Step 3: 브라우저 확인**

새로고침.
Expected: 결재선 카드와 좌측 '결재선' 메뉴가 사라짐. 나머지 6개 카드/메뉴는 정상. 남은 메뉴 클릭 시 해당 카드로 스크롤 동작 유지.

- [ ] **Step 4: Commit**

```bash
git add apis_eln_pop.html
git commit -m "ELN [3]: 결재선 제거(MVP 결재 없음)"
```

---

## Task 3: status 세그먼트 탭 토글

기존 헤더의 `<div class="roundBox bdOrange">In Progress</div>` 정적 배지를 4상태 세그먼트 토글로 교체. 색: 진행중=파랑 / 성공=초록 / 실패=빨강 / 보류=노랑.

**Files:**
- Modify: `apis_eln_pop.html` (헤더 status 영역)
- Modify: `css/eln_proto.css` (세그먼트 스타일)
- Modify: `js/eln_proto.js` (토글 동작)

- [ ] **Step 1: 헤더 마크업 교체**

`apis_eln_pop.html`의 `statusTit` 안 `<div class="roundBox bdOrange">In Progress</div>`를 아래로 교체:
```html
<div class="elnStatusSeg" id="elnStatus" data-status="ing">
  <button type="button" class="seg active" data-status="ing">진행중</button>
  <button type="button" class="seg" data-status="ok">성공</button>
  <button type="button" class="seg" data-status="fail">실패</button>
  <button type="button" class="seg" data-status="hold">보류</button>
</div>
```

- [ ] **Step 2: 세그먼트 CSS 추가**

`css/eln_proto.css`에 추가:
```css
.elnStatusSeg{display:inline-flex;gap:2px;padding:3px;border-radius:10px;background:rgba(0,0,0,.05);}
.elnStatusSeg .seg{border:0;cursor:pointer;padding:5px 12px;border-radius:8px;font-size:13px;
  background:transparent;color:#777;transition:all .15s;}
.elnStatusSeg .seg.active{color:#fff;font-weight:600;}
.elnStatusSeg[data-status="ing"]  .seg.active{background:#2f80ed;}
.elnStatusSeg[data-status="ok"]   .seg.active{background:#3aaa6f;}
.elnStatusSeg[data-status="fail"] .seg.active{background:#d65a5a;}
.elnStatusSeg[data-status="hold"] .seg.active{background:#e0a83e;}
```

- [ ] **Step 3: 토글 동작 추가**

`js/eln_proto.js`의 IIFE 안에 추가:
```javascript
function initStatusSeg() {
  var seg = document.getElementById('elnStatus');
  if (!seg) return;
  seg.addEventListener('click', function (e) {
    var btn = e.target.closest('.seg');
    if (!btn) return;
    seg.querySelectorAll('.seg').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    var st = btn.getAttribute('data-status');
    seg.setAttribute('data-status', st);
    window.ELN.onStatusChange && window.ELN.onStatusChange(st); // Task 4에서 패널 연동
  });
}
document.addEventListener('DOMContentLoaded', initStatusSeg);
```

- [ ] **Step 4: 브라우저 확인**

새로고침 → 헤더의 4버튼 클릭.
Expected: 클릭한 버튼만 활성, 활성 색이 status별로 바뀜(진행중 파랑 → 성공 초록 → 실패 빨강 → 보류 노랑). 콘솔 에러 없음.

- [ ] **Step 5: Commit**

```bash
git add apis_eln_pop.html css/eln_proto.css js/eln_proto.js
git commit -m "ELN [3]: status 세그먼트 토글(진행중·성공·실패·보류)"
```

---

## Task 4: 우측 접이식 연계패널(rightAside) + status 연동

중앙 본문 오른쪽에 접이식 연계패널을 신설하고, status에 따라 자동 접힘/펼침(진행중=접힘, 결말=펼침). 기존 본문의 'card_link' 내용을 이 패널로 옮긴다.

**Files:**
- Modify: `apis_eln_pop.html` (rightAside 추가, 연계 내용 이동)
- Modify: `css/eln_proto.css` (패널 레이아웃·접힘 상태)
- Modify: `js/eln_proto.js` (토글 버튼 + onStatusChange 연동)

- [ ] **Step 1: rightAside 마크업 추가**

`apis_eln_pop.html`에서 `<div class="contArea">`를 감싸는 형태로, contArea 닫힘 `</div>` 직후(아카이브 기준 236행 뒤)에 패널 추가:
```html
<aside class="elnRightAside" id="elnRight">
  <button type="button" class="elnRightToggle" id="elnRightToggle" title="연계 패널">
    <i class="material-symbols-outlined">dock_to_left</i>
  </button>
  <div class="elnRightBody">
    <div class="elnRightTit"><i class="material-symbols-outlined left">device_hub</i>연계 Links</div>
    <ul class="elnRefList">
      <li><i class="material-symbols-outlined">blender</i><span>FML-EM-2208 v3</span><em>배합</em></li>
      <li><i class="material-symbols-outlined">communities</i><span>Rawmathub 원료 5건</span><em>원료</em></li>
      <li><i class="material-symbols-outlined">rocket_launch</i><span>NPDI-2026-031</span><em>프로젝트</em></li>
      <li><i class="material-symbols-outlined">link</i><span>EXP-26-0118 (v2)</span><em>노트</em></li>
    </ul>
    <div class="elnRightTit mt10"><i class="material-symbols-outlined left">account_tree</i>계보</div>
    <div id="elnLineage" class="elnLineage"><!-- Task 6 --></div>
  </div>
</aside>
```

- [ ] **Step 2: 기존 'card_link' 카드 삭제**

본문에서 `<!-- 연계 Links -->` section(아카이브 기준 198~210행)과 좌측 메뉴의 `data-target="card_link"` li를 삭제(연계는 이제 rightAside가 담당).

- [ ] **Step 3: 패널 CSS 추가**

`css/eln_proto.css`에 추가:
```css
.elnRightAside{position:fixed;top:64px;right:0;width:300px;height:calc(100vh - 64px);
  background:rgba(255,255,255,.92);backdrop-filter:blur(8px);border-left:1px solid #e6ddd0;
  box-shadow:-4px 0 16px rgba(0,0,0,.06);transition:transform .25s ease;z-index:60;padding:16px;
  overflow-y:auto;}
.elnRightAside.collapsed{transform:translateX(300px);}
.elnRightToggle{position:absolute;left:-40px;top:12px;width:40px;height:40px;border:0;cursor:pointer;
  background:rgba(255,255,255,.92);border-radius:10px 0 0 10px;box-shadow:-2px 0 8px rgba(0,0,0,.06);}
.elnRightTit{font-weight:600;font-size:14px;display:flex;align-items:center;gap:4px;margin-bottom:8px;}
.elnRefList{list-style:none;margin:0;padding:0;}
.elnRefList li{display:flex;align-items:center;gap:8px;padding:8px;border-radius:8px;
  background:rgba(0,0,0,.03);margin-bottom:6px;font-size:13px;}
.elnRefList li em{margin-left:auto;font-style:normal;font-size:11px;color:#999;}
.elnRefList li i{font-size:18px;color:#A47864;}
```

- [ ] **Step 4: 토글 + status 연동 동작 추가**

`js/eln_proto.js`에 추가:
```javascript
function initRightAside() {
  var aside = document.getElementById('elnRight');
  var toggle = document.getElementById('elnRightToggle');
  if (!aside || !toggle) return;
  toggle.addEventListener('click', function () { aside.classList.toggle('collapsed'); });
  // status 연동: 진행중=접힘, 결말(성공/실패/보류)=펼침
  window.ELN.onStatusChange = function (st) {
    if (st === 'ing') aside.classList.add('collapsed');
    else aside.classList.remove('collapsed');
  };
  // 초기 상태(진행중) 반영
  window.ELN.onStatusChange('ing');
}
document.addEventListener('DOMContentLoaded', initRightAside);
```

- [ ] **Step 5: 브라우저 확인**

새로고침.
Expected: (a) 초기엔 status=진행중이라 우측 패널 **접힘**(화면 밖). (b) status를 '성공/실패/보류'로 바꾸면 패널이 **슬라이드 펼침**. (c) '진행중'으로 되돌리면 다시 접힘. (d) 좌측 토글 버튼으로 수동 접기/펴기도 동작. 콘솔 에러 없음.

- [ ] **Step 6: Commit**

```bash
git add apis_eln_pop.html css/eln_proto.css js/eln_proto.js
git commit -m "ELN [3]: 우측 접이식 연계패널 + status 연동(진행중=접힘/결말=펼침)"
```

---

## Task 5: 카테고리 선택 + 자유태그 칩

헤더에 카테고리 선택(배합실험/일반)을 추가하고, 하단에 자유태그 칩 입력 + 최근태그 영역을 만든다. 카테고리=일반 선택 시 배합실험 전용 카드(배합·공정·결과)를 숨겨 골격 전환을 시연.

**Files:**
- Modify: `apis_eln_pop.html` (헤더 카테고리, 하단 태그 영역)
- Modify: `css/eln_proto.css` (태그칩)
- Modify: `js/eln_proto.js` (카테고리 전환, 태그칩 추가/삭제)

- [ ] **Step 1: 헤더에 카테고리 셀렉트 추가**

`statusTit` 안, status 세그먼트 다음에 추가:
```html
<select id="elnCategory" class="elnCat browser-default">
  <option value="fml" selected>배합실험</option>
  <option value="gen">일반/메모</option>
</select>
```

- [ ] **Step 2: 하단 태그 영역 추가**

본문 `</article>` 직전에 카드 추가:
```html
<section class="cardBox mt10" id="card_tags">
  <div class="cardTit2"><i class="material-symbols-outlined left">sell</i>태그</div>
  <div class="elnTagBox">
    <div class="elnTags" id="elnTags">
      <span class="elnTag" data-tag="#점도이슈">#점도이슈<i class="material-symbols-outlined">close</i></span>
      <span class="elnTag" data-tag="#RGBOLED">#RGBOLED<i class="material-symbols-outlined">close</i></span>
    </div>
    <input type="text" id="elnTagInput" class="browser-default" placeholder="태그 입력 후 Enter">
    <div class="elnRecentTags">최근: 
      <a href="javascript:;" data-tag="#고객A">#고객A</a>
      <a href="javascript:;" data-tag="#점착제">#점착제</a>
      <a href="javascript:;" data-tag="#UV경화">#UV경화</a>
    </div>
  </div>
</section>
```

- [ ] **Step 3: 태그 CSS 추가**

`css/eln_proto.css`에 추가:
```css
.elnCat{display:inline-block;margin-left:10px;height:32px;border:1px solid #d9cfc2;border-radius:8px;
  padding:0 8px;background:#fff;font-size:13px;}
.elnTagBox{padding:8px;}
.elnTags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;}
.elnTag{display:inline-flex;align-items:center;gap:2px;padding:4px 4px 4px 10px;border-radius:14px;
  background:rgba(164,120,100,.12);color:#7a5240;font-size:13px;}
.elnTag i{font-size:15px;cursor:pointer;opacity:.6;}
.elnTag i:hover{opacity:1;}
#elnTagInput{height:34px;border:1px solid #d9cfc2;border-radius:8px;padding:0 10px;width:240px;}
.elnRecentTags{margin-top:8px;font-size:12px;color:#999;}
.elnRecentTags a{color:#A47864;margin:0 4px;}
```

- [ ] **Step 4: 동작 추가(카테고리 전환 + 태그칩)**

`js/eln_proto.js`에 추가:
```javascript
// 보안: 태그 텍스트는 사용자 입력이므로 innerHTML 조립 금지.
// 텍스트는 textContent, 닫기 아이콘은 createElement로 안전하게 생성.
function addTag(text) {
  text = text.trim();
  if (!text) return;
  if (text[0] !== '#') text = '#' + text;
  var wrap = document.getElementById('elnTags');
  if (!wrap) return;
  var existing = Array.prototype.some.call(wrap.children, function (c) {
    return c.dataset && c.dataset.tag === text;
  });
  if (existing) return;
  var chip = document.createElement('span');
  chip.className = 'elnTag';
  chip.dataset.tag = text;
  var label = document.createTextNode(text);
  var icon = document.createElement('i');
  icon.className = 'material-symbols-outlined';
  icon.textContent = 'close';
  chip.appendChild(label);
  chip.appendChild(icon);
  wrap.appendChild(chip);
}
function initTags() {
  var input = document.getElementById('elnTagInput');
  var tags = document.getElementById('elnTags');
  if (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); addTag(input.value); input.value = ''; }
    });
  }
  if (tags) {
    tags.addEventListener('click', function (e) {
      if (e.target.tagName === 'I') e.target.parentNode.remove();
    });
  }
  document.querySelectorAll('.elnRecentTags a').forEach(function (a) {
    a.addEventListener('click', function () { addTag(a.getAttribute('data-tag')); });
  });
}
function initCategory() {
  var sel = document.getElementById('elnCategory');
  if (!sel) return;
  var fmlCards = ['card_fml', 'card_cond', 'card_result'];
  sel.addEventListener('change', function () {
    var hide = sel.value === 'gen';
    fmlCards.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = hide ? 'none' : '';
      // 좌측 메뉴 항목도 같이 토글
      var menu = document.querySelector('.menu-item[data-target="' + id + '"]');
      if (menu) menu.style.display = hide ? 'none' : '';
    });
  });
}
document.addEventListener('DOMContentLoaded', function () { initTags(); initCategory(); });
```

- [ ] **Step 5: 브라우저 확인**

새로고침.
Expected: (a) 태그 입력창에 텍스트+Enter → 칩 추가(# 자동), 중복 무시. (b) 칩의 x 클릭 → 삭제. (c) '최근' 태그 클릭 → 칩 추가. (d) 카테고리를 '일반/메모'로 바꾸면 배합·공정·결과 카드와 해당 좌측 메뉴가 숨김, '배합실험'으로 되돌리면 복원. 콘솔 에러 없음.

- [ ] **Step 6: Commit**

```bash
git add apis_eln_pop.html css/eln_proto.css js/eln_proto.js
git commit -m "ELN [3]: 카테고리 전환 + 자유태그 칩(수동·최근태그)"
```

---

## Task 6: 계보 미니맵(목업)

우측 패널의 계보 영역에, 노트 파생 트리를 status 색상으로 보여주는 목업을 채운다. (프로토타입이므로 정적 목업 — 실제 계보 엔진 아님)

**Files:**
- Modify: `apis_eln_pop.html` (계보 컨테이너는 Task 4에서 이미 추가됨 — 내용은 JS로 렌더)
- Modify: `css/eln_proto.css` (계보 노드 스타일)
- Modify: `js/eln_proto.js` (목업 데이터 렌더)

- [ ] **Step 1: 계보 CSS 추가**

`css/eln_proto.css`에 추가:
```css
.elnLineage{display:flex;flex-direction:column;gap:4px;padding-left:4px;}
.elnLineNode{display:flex;align-items:center;gap:8px;font-size:13px;position:relative;padding:6px 0 6px 18px;}
.elnLineNode::before{content:'';position:absolute;left:5px;top:0;bottom:0;width:2px;background:#e6ddd0;}
.elnLineNode:first-child::before{top:50%;}
.elnLineNode:last-child::before{bottom:50%;}
.elnLineDot{width:10px;height:10px;border-radius:50%;flex:0 0 auto;position:absolute;left:1px;
  border:2px solid #fff;box-shadow:0 0 0 1px #d9cfc2;}
.elnLineDot.ok{background:#3aaa6f;} .elnLineDot.fail{background:#d65a5a;}
.elnLineDot.hold{background:#e0a83e;} .elnLineDot.ing{background:#2f80ed;}
.elnLineNode.current{font-weight:700;}
.elnLineNode .ver{color:#999;font-size:11px;margin-left:auto;}
```

- [ ] **Step 2: 목업 렌더 동작 추가**

`js/eln_proto.js`에 추가:
```javascript
function initLineage() {
  var box = document.getElementById('elnLineage');
  if (!box) return;
  var nodes = [
    { name: 'EXP-26-0098 초기 시험', st: 'fail', ver: 'v1' },
    { name: 'EXP-26-0118 점도 보정', st: 'hold', ver: 'v2' },
    { name: 'EXP-26-0142 (현재)',   st: 'ing',  ver: 'v3', current: true }
  ];
  box.innerHTML = nodes.map(function (n) {
    return '<div class="elnLineNode' + (n.current ? ' current' : '') + '">' +
      '<span class="elnLineDot ' + n.st + '"></span>' +
      '<span>' + n.name + '</span><span class="ver">' + n.ver + '</span></div>';
  }).join('');
}
document.addEventListener('DOMContentLoaded', initLineage);
```

- [ ] **Step 3: 브라우저 확인**

새로고침 → status를 결말로 바꿔 우측 패널을 펼친다.
Expected: 계보 영역에 3노드 세로 트리(v1 빨강=실패 / v2 노랑=보류 / v3 파랑=진행중, 현재 노드 굵게), 노드를 잇는 세로선이 보임. 콘솔 에러 없음.

- [ ] **Step 4: Commit**

```bash
git add apis_eln_pop.html css/eln_proto.css js/eln_proto.js
git commit -m "ELN [3]: 계보 미니맵 목업(status 색상 파생 트리)"
```

---

## Task 7: 최종 회귀 점검 + 데모 시나리오 확인

**Files:** (확인만, 수정 없음 — 발견 시 해당 Task로 돌아가 수정)

- [ ] **Step 1: 전체 데모 시나리오 1회 통과**

브라우저에서 `apis_eln_pop.html`을 열고 순서대로 확인:
1. 초기: status=진행중, 우측 패널 접힘, 배합실험 골격(6→5카드), 점도 차트 정상
2. 좌측 메뉴 클릭 → 각 카드로 스크롤
3. status 토글 4색 전환 + 결말 시 우측 패널 자동 펼침
4. 우측 패널: 참조 4건 + 계보 3노드 트리
5. 태그 추가/삭제/최근태그
6. 카테고리 '일반/메모' ↔ '배합실험' 전환 시 카드 숨김/복원
7. 콘솔 에러 0

- [ ] **Step 2: mapis_lib 불가침 확인**

```bash
git status --short mapis_lib/
```
Expected: 출력 없음(= mapis_lib 변경 0). 변경이 있으면 되돌린다.

- [ ] **Step 3: ELN 산출물 격리 확인**

```bash
git log --oneline -7 -- apis_eln_pop.html css/eln_proto.css js/eln_proto.js
```
Expected: Task 1~6 커밋이 이 3개 파일에만 모여 있음(합치기 용이성 검증).

- [ ] **Step 4: 최종 Commit(있으면)**

```bash
git add -A apis_eln_pop.html css/eln_proto.css js/eln_proto.js
git commit -m "ELN [3]: 최종 회귀 점검 반영" || echo "수정 없음"
```

---

## Self-Review (작성자 점검 결과)

- **Spec 커버리지:** [3] 노트상세 요소(7.1 레이아웃·7.2 status연동패널) → Task 3·4. status(4.1) → Task 3. 카테고리(4.2)·자유태그(4.3) → Task 5. 참조(4.4)·계보 → Task 4·6. 무첨부(7.3)는 기존 골격이 이미 구조화 데이터라 충족. **[1][2][4] 화면은 이 계획 범위 밖(별도 플랜)** — 의도된 분리.
- **플레이스홀더:** 모든 코드 단계에 실제 코드 포함. 검증은 브라우저 육안(프로토타입 특성). TBD 없음.
- **타입/이름 일관성:** `window.ELN.onStatusChange`(Task 3 정의 → Task 4 구현), status 코드값 `ing/ok/fail/hold`가 Task 3·4·6에서 동일, 카드 id `card_fml/card_cond/card_result`가 아카이브 마크업과 일치.
