# Technical Report Hub (rptlib/TRH) 견고화 마무리 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** rptlib(TRH) 프로토타입의 프로세스·디자인을 견고화 — 결재 모델 단일화, 색 토큰을 MAPIS 전사 변수로 수렴, 컴포넌트/상태/접근성 일관화, glass wow 절제 적용.

**Architecture:** 기존 정적 프로토타입(빌드 시스템 없음). `css/rptlib_proto.css` + `js/rptlib_*.js` + `apis_rptlib_*.html`만 수정하고 `mapis_lib/*` 운영 자산은 불가침. 추가 기능 없이 *수렴/정리*만.

**Tech Stack:** Vanilla HTML/CSS/JS, jQuery 3.7.1(스택 B), Materialize, `mapis_lib/css/common.css` 토큰, `mapis_lib/js/glass_engine.js`(구판).

**근거 spec:** [`docs/superpowers/specs/2026-06-24-rptlib-trh-hardening-design.md`](../specs/2026-06-24-rptlib-trh-hardening-design.md) (커밋 `5fcfcde`)

## 검증 방식 (이 프로젝트 특성)

자동 테스트 인프라 **없음**(정적 프로토타입). 각 task의 검증은:
1. **정적 체크** — `grep`으로 하드코딩 잔존·패턴 위반을 정량 확인(숫자가 기대치와 일치).
2. **시각·동작 확인** — 브라우저에서 해당 화면을 열어 깨짐/효과/흐름 확인. (`/run` 스킬 또는 사용자 직접)

각 task는 변경 → 정적 체크 → 시각 확인 → 커밋 순서.

## Global Constraints (spec에서 verbatim — 모든 task에 적용)

- **새 hex/rgb 0개.** `common.css` 기존 변수 alias 우선, 안 맞으면 `color-mix(기존변수)` 파생.
- **spacing 5의 배수** (5,10,15,20…). 예외: border-width·font-size·box-shadow offset(1~2px).
- **폰트 13px 최소.** 명백한 본문/항목 텍스트의 13px 미만만 교정(배지/마이크로 라벨은 신중).
- **인라인 `style=` 금지** — `css/rptlib_proto.css` 클래스로.
- **새 컴포넌트 발명 금지** — 버튼 `.hBtn`, 알약 라벨 `.roundBox` 재사용.
- **운영 자산 불가침** — `mapis_lib/*`·`common.css`·`glass_engine.js` 수정 금지. rptlib 쪽에서만 작업.
- **에셋 스택 B** — 색 토큰 단일 출처 = `mapis_lib/css/common.css`.
- **glass_engine 구판 유지** — 신판에서 `cardSpotlight`만 동일 이름으로 `js/rptlib_common.js`에 발췌. 두 판 동시 로드 금지.
- **결재 정본** — Manager(ITAR, Step1 순차) → GT&C(외부회람)·Tech CoE(JDA/기밀) Step2 병렬. 매핑: `ITAR→Manager`, `외부회람→GT&C`, `JDA→Tech CoE`.
- **채번** — 메모리 시퀀스 3자리 (`KR-26-001`).
- **반응형** — 데스크탑 전용, 모바일 레이아웃 안 만듦.

---

## 변경 파일 구조

| 파일 | 책임 | 변경 task |
|---|---|---|
| `css/rptlib_proto.css` | 색 수렴·spacing·컴포넌트 베이스·상태·focus | 1,2,3,4,5,6,7 |
| `js/rptlib_common.js` | 공통 유틸·`esc`·팝업 레지스트리·`cardSpotlight` 발췌 | 7,9 |
| `js/rptlib_review.js` | 결재 게이트 매핑·큐 입구화 | 8 |
| `apis_rptlib_pop.html` | 결재 모달 wow·ARIA·`esc` 제거 | 7,9 |
| `js/rptlib_docs.js` | `rlPops` 제거·카드 `.glassHover`(이미 있음 검증) | 9 |
| `js/rptlib_upload.js` | 채번 3자리·필수값 검증 | 10 |
| `apis_rptlib_help.html` | `esc` 제거·매핑 서술 정합 | 9 |
| `rptlib_workflow.html` | 설계안 서술을 다단계 결재로 갱신 | 11 |
| `apis_rptlib_list.html` | 상태/ARIA 마크업 보강(필요 시) | 5,6 |

---

# Phase 1 — 디자인 토대 (색 수렴 · spacing)

## Task 1: alias 토큰 정의 + 모카 액센트 계열 수렴

**Files:**
- Modify: `css/rptlib_proto.css` (`:root` 블록 6-11행 확장, 본문 전역 치환)

**Interfaces:**
- Produces: `:root`의 rptlib alias 토큰 — `--rl-accent`, `--rl-accent-06/07/08/10/12/14/16`, `--rl-accent-strong`, `--rl-accent-soft`. 이후 모든 task가 모카 표현에 이 토큰 사용.

- [ ] **Step 1: `:root`에 모카 alias 블록 추가**

`css/rptlib_proto.css`의 기존 `:root{ --rl-c1..c4 }` 블록(6-11행) **안에** 아래를 추가(기존 Class 색은 유지):

```css
:root{
	--rl-c1:#3aaa6f; --rl-c2:#2f80ed; --rl-c3:#e0a83e; --rl-c4:#d65a5a;

	/* 액센트 = MAPIS 메인 모카(전사 단일 출처). 새 색값 없음 — 전부 var/color-mix */
	--rl-accent: var(--mocha25);                                          /* #A47864 */
	--rl-accent-strong: color-mix(in srgb, var(--mocha25) 78%, black);    /* 진한 호버 #7a5240 대체 */
	--rl-accent-soft:   color-mix(in srgb, var(--mocha25) 65%, white);    /* 라이트 #cda892 대체 */
	--rl-accent-06: color-mix(in srgb, var(--mocha25) 6%,  transparent);
	--rl-accent-07: color-mix(in srgb, var(--mocha25) 7%,  transparent);
	--rl-accent-08: color-mix(in srgb, var(--mocha25) 8%,  transparent);
	--rl-accent-10: color-mix(in srgb, var(--mocha25) 10%, transparent);
	--rl-accent-12: color-mix(in srgb, var(--mocha25) 12%, transparent);
	--rl-accent-14: color-mix(in srgb, var(--mocha25) 14%, transparent);
	--rl-accent-16: color-mix(in srgb, var(--mocha25) 16%, transparent);
}
```

- [ ] **Step 2: 모카 솔리드 색 전역 치환**

`css/rptlib_proto.css` 본문에서 아래 치환(대소문자 무관):
- `#a47864` 및 `#a47764` → `var(--rl-accent)`
- `#7a5240` 및 `#5a3e30` → `var(--rl-accent-strong)`
- `#cda892` 및 `#cdbfae` → `var(--rl-accent-soft)`

- [ ] **Step 3: 모카 알파(rgba) 전역 치환**

`rgba(164,120,100,.06)`→`var(--rl-accent-06)`, `.07`→`-07`, `.08`→`-08`, `.10`→`-10`, `.12`→`-12`, `.14`→`-14`, `.16`→`-16` (각 알파값별로).

- [ ] **Step 4: 정적 체크 — 모카 하드코딩 잔존 0**

Run:
```bash
grep -niE '#a47864|#a47764|164,\s*120,\s*100|164,\s*119,\s*100' css/rptlib_proto.css | grep -v -- '--rl-accent' | wc -l
```
Expected: `0` (모든 모카 하드코딩이 토큰으로 치환됨)

- [ ] **Step 5: 시각 확인**

`apis_rptlib_list.html`을 브라우저로 열어 좌측 네비 hover/active, 검색바, 카드의 모카 톤이 변경 전과 동일하게 보이는지 확인(색이 깨지지 않음).

- [ ] **Step 6: Commit**

```bash
git add css/rptlib_proto.css
git commit -m "refactor(rptlib): 모카 색 하드코딩을 --mocha25 토큰으로 수렴"
```

---

## Task 2: 배경·테두리·텍스트·상태색 수렴

**Files:**
- Modify: `css/rptlib_proto.css`

**Interfaces:**
- Consumes: Task 1의 alias 토큰.
- Produces: 본문에 모카 외 하드코딩 색이 남지 않음(흰색·Class색 제외).

- [ ] **Step 1: 따뜻한 배경·테두리 치환**

본문에서:
- `#f1e9dd`·`#efe7db`·`#fbf8f3`·`#faf4ec` (따뜻한 배경) → `var(--gardenia25)`
- `#ece3d5`·`#e7ddce`·`#e2d8c9`·`#e2d7c6` (따뜻한 테두리) → `color-mix(in srgb, var(--gardenia25) 85%, var(--gray30))`

- [ ] **Step 2: 텍스트 회색 통일 (A안 — 순회색)**

본문에서:
- `#3a2c24`·`#3a2c20` (진한 텍스트) → `var(--gray90)`
- `#5a4a3e`·`#5a4636`·`#5f4f40` (본문) → `var(--gray70)`
- `#6f5d4e`·`#7a6757`·`#7a5d..`(보조) → `var(--gray60)`
- `#9b8c7e`·`#8a7a69`·`#8a6f5d`·`#b3a596`·`#b3a595`·`#bcae9d` (muted) → `var(--main-hint-color)`
- `#c4b8a8`·`#cdbfae`(이미 Task1)·`#bdb0a0`·`#cdbfae` (hint/disabled) → `var(--gray40)`

> 정확한 hex별 용도는 변경 직전 해당 라인 문맥으로 확인(텍스트/배경 구분). 텍스트 속성(`color:`)만 회색 매핑, 같은 hex가 배경이면 배경 매핑 적용.

- [ ] **Step 3: 상태색(빨강/초록) 치환**

- `#c0504e`·`#b03e3e` (reject 빨강) → `var(--viva)`
- `#2c7a50` 및 `rgba(58,170,111,.NN)` (approve 초록) → `var(--leafgreen)` (알파 필요 시 `color-mix(in srgb, var(--leafgreen) NN%, transparent)`)
- `#a8782a`(amber 텍스트) → `color-mix(in srgb, var(--rl-c3) 80%, black)`

- [ ] **Step 4: 정적 체크 — 허용목록 외 하드코딩 색 0**

Run:
```bash
grep -noiE '#[0-9a-f]{6}|rgba?\([0-9., ]+\)' css/rptlib_proto.css \
 | grep -viE '#fff|255,\s*255,\s*255|var\(' \
 | grep -viE '#3aaa6f|#2f80ed|#e0a83e|#d65a5a' \
 | sort | uniq -c | sort -rn
```
Expected: 빈 출력 또는 box-shadow의 `rgba(0,0,0,..)`/`rgba(255,255,255,..)` 같은 그림자·흰빛 잔여만 (색이 아닌 음영). 색상값 잔여는 0.

- [ ] **Step 5: 시각 확인**

`apis_rptlib_list.html`·`apis_rptlib_pop.html`을 열어 텍스트 가독성(회색 통일됨), 배경 따뜻함 유지, 배지(reject/approve) 색 확인.

- [ ] **Step 6: Commit**

```bash
git add css/rptlib_proto.css
git commit -m "refactor(rptlib): 배경/테두리/텍스트/상태색을 common.css 변수로 수렴"
```

---

## Task 3: spacing 5의 배수 정렬

**Files:**
- Modify: `css/rptlib_proto.css`

- [ ] **Step 1: 비표준 spacing 식별**

Run:
```bash
grep -noE '(padding|margin|gap|top|left|right|bottom)[^;:]*:[^;]*[0-9]+px' css/rptlib_proto.css \
 | grep -oE '[0-9]+px' | sort -n | uniq -c
```
5의 배수가 아닌 값(예: 3,6,8,9,11,13,14,18 px)을 목록화.

- [ ] **Step 2: 5의 배수로 정렬**

각 비표준 값을 가장 가까운 5의 배수로 조정(시각 영향 최소): 3→5, 6→5, 8→10, 9→10, 11→10, 13→15(단 font-size 제외), 14→15, 18→20. **font-size·border-width·box-shadow offset은 제외**(Global Constraints).

> 주의: `font-size:13.5px` 같은 폰트값은 건드리지 않음(spacing 아님). `gap`/`padding`/`margin`/positioning만.

- [ ] **Step 3: 정적 체크 — 비표준 spacing 감소 확인**

Run:
```bash
grep -noE '(padding|margin|gap)[^;:]*:[^;]*[0-9]+px' css/rptlib_proto.css \
 | grep -oE '[0-9]+px' | grep -vE '^(5|10|15|20|25|30|35|40|45|50)px$' | wc -l
```
Expected: 0 (남은 spacing 전부 5의 배수) — 단, 복합 단축(`padding:10px 12px`)의 일부는 수동 확인.

- [ ] **Step 4: 시각 확인**

전체 화면 레이아웃이 변경 전과 동일하게 정렬되는지(요소 간격 미세 변화 허용, 깨짐 없음) 확인.

- [ ] **Step 5: Commit**

```bash
git add css/rptlib_proto.css
git commit -m "refactor(rptlib): spacing을 5의 배수로 정렬 (MAPIS 가이드 준수)"
```

---

# Phase 2 — 컴포넌트 베이스 · 상태 · 접근성 · wow

## Task 4: 버튼 `.hBtn` 베이스 + 배지/칩 통합

**Files:**
- Modify: `css/rptlib_proto.css`

**Interfaces:**
- Produces: 단일 배지 베이스 `.rlClassBadge`(등급/상태 색은 `color-mix(var(--rl-cN))` 파생), 단일 `.rlChip` 정의.

- [ ] **Step 1: 버튼 베이스 정리**

rptlib 버튼 클래스(`.rlHome`·`.rlSavedBtn`·`.rlTool`·`.qBtn`)의 높이·radius·패딩을 일관값으로 정렬(높이 30px 또는 35px, radius 10px, 패딩 5의 배수). 마크업이 `.hBtn`을 함께 달 수 있는 액션 버튼은 `.hBtn` 변형으로 정의(공통 글래스/색수차 자동 획득).

- [ ] **Step 2: 배지 단일 베이스**

`.rlClassBadge`를 배지 베이스로 두고, `.mineBadge`의 중복 색 정의(`.rev`/`.pub` 등)를 `color-mix` 파생으로 흡수. 상태 배지(pending/approved/rejected)도 같은 베이스에 상태 클래스만.

- [ ] **Step 3: 칩 2중 정의 통합**

`.rlChip` 두 정의(`rptlib_proto.css` 내 `.rlChip .lab` 단편 + 완전 정의)를 하나로 병합.

- [ ] **Step 4: 정적 체크 — 칩 중복 정의 제거 확인**

Run:
```bash
grep -nE '^\s*\.rlChip\s*\{|^\s*\.rlChip\s+\.lab\s*\{' css/rptlib_proto.css
```
Expected: `.rlChip` 본체 정의가 1개로 정리됨(파편 중복 없음).

- [ ] **Step 5: 시각 확인**

list의 필터 칩, 카드 등급 배지, My Submissions 상태 배지, 액션 버튼이 일관된 높이/모서리/색으로 보이는지 확인.

- [ ] **Step 6: Commit**

```bash
git add css/rptlib_proto.css
git commit -m "refactor(rptlib): 버튼은 .hBtn 베이스, 배지/칩 단일 베이스로 통합"
```

---

## Task 5: 상태 디자인 (empty · disabled · error · loading)

**Files:**
- Modify: `css/rptlib_proto.css`, (필요 시) `apis_rptlib_list.html`

- [ ] **Step 1: empty 상태 통일**

`.rlEmpty`·`.subEmpty`·`.bkEmpty`·`.rlRelEmpty`를 공통 패턴으로: 아이콘(material-symbols) + 설명 텍스트 + (해당 시) CTA. 공통 클래스 `.rlEmptyState` 정의하고 각 빈 상태가 이를 사용.

```css
.rlEmptyState{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:40px 20px;color:var(--main-hint-color);text-align:center;}
.rlEmptyState i{font-size:40px;opacity:.5;}
.rlEmptyState .msg{font-size:13px;}
.rlEmptyState .cta{margin-top:5px;}
```

- [ ] **Step 2: disabled 통일**

흩어진 disabled 표현(`opacity` vs `background` 혼재)을 통일:
```css
.rlSearchBtn.off, .qBtn.disabled, .bmPickAdd.disabled, .srtAdd.disabled{opacity:.45;cursor:not-allowed;}
```

- [ ] **Step 3: error 상태 추가**

입력 필드 에러 표시:
```css
.rlField.error, .rlField.error input, .rlField.error textarea{border-color:var(--viva);background:color-mix(in srgb, var(--viva) 5%, transparent);}
.rlFieldErr{font-size:11px;color:var(--viva);margin-top:5px;}
```

- [ ] **Step 4: 정적 체크**

Run:
```bash
grep -cE '\.rlEmptyState|\.rlFieldErr|\.error' css/rptlib_proto.css
```
Expected: ≥3 (새 상태 클래스 존재).

- [ ] **Step 5: 시각 확인**

검색 결과 0건(빈 상태), 비활성 버튼, (Task 10 후) 빈 제목 제출 시 에러 표시를 확인.

- [ ] **Step 6: Commit**

```bash
git add css/rptlib_proto.css apis_rptlib_list.html
git commit -m "feat(rptlib): empty/disabled/error 상태 디자인 일관화"
```

---

## Task 6: 접근성 (focus ring · ARIA)

**Files:**
- Modify: `css/rptlib_proto.css`, `apis_rptlib_list.html`, `apis_rptlib_pop.html`

- [ ] **Step 1: focus ring 일관 부여**

```css
.rlNavItem:focus-visible, .hBtn:focus-visible, .rlChip:focus-visible,
.rlSearchField:focus-within, .rlFacet select:focus-visible{
	outline:2px solid var(--mocha25); outline-offset:2px;
}
```

- [ ] **Step 2: 인터랙티브 `<a>`에 role 부여**

`<a href="javascript:;">`로 된 버튼들(액션·탭·토글)에 `role="button"` 추가. 모달 컨테이너에 `role="dialog" aria-modal="true"`, 토스트 컨테이너에 `role="status" aria-live="polite"`.

- [ ] **Step 3: 정적 체크 — role 부여 확인**

Run:
```bash
grep -cE 'role="button"|role="dialog"|role="status"' apis_rptlib_list.html apis_rptlib_pop.html
```
Expected: ≥1 per file (보강 적용됨).

- [ ] **Step 4: 시각/동작 확인**

Tab 키로 포커스 이동 시 focus ring이 명확히 보이는지, 키보드로 버튼 활성화 가능한지 확인.

- [ ] **Step 5: Commit**

```bash
git add css/rptlib_proto.css apis_rptlib_list.html apis_rptlib_pop.html
git commit -m "feat(rptlib): focus ring 명확화 + ARIA role 보강 (접근성)"
```

---

## Task 7: wow — `cardSpotlight` 발췌 + 카드/결재 적용

**Files:**
- Modify: `js/rptlib_common.js` (함수 발췌 추가), `apis_rptlib_pop.html` (결재 노드 바인딩), `css/rptlib_proto.css` (spotlight 슬롯)

**Interfaces:**
- Consumes: 구판 `glass_engine.js`의 `glassTrack`·`glassClear`(이미 로드됨), `.glassHover`(카드에 이미 적용 — `docs.js:392,577`, `collections.js:100`).
- Produces: `js/rptlib_common.js`에 `cardSpotlight(e)` 함수 + 결재 Step 노드 mousemove 바인딩.

- [ ] **Step 1: `cardSpotlight` 동일 이름 발췌**

`js/rptlib_common.js` 끝에 신판(`js/glass_engine.js:39-46`)에서 동일 이름으로 발췌:

```javascript
/* 좁은 카드 spotlight 좌표 (--card-gx/--card-gy, %) — js/glass_engine.js 신판에서 발췌(동일 이름).
   구판엔 cardSpotlight가 없어 충돌 없음. transform 금지(jitter 회피, GLASS_DESIGN_GUIDE §8-1). */
function cardSpotlight(e){
	var r=this.getBoundingClientRect();
	var x=((e.clientX-r.left)/r.width)*100;
	var y=((e.clientY-r.top)/r.height)*100;
	this.style.setProperty('--card-gx', x+'%');
	this.style.setProperty('--card-gy', y+'%');
	return {x:x, y:y};
}
```

- [ ] **Step 2: 결재 Step 노드 spotlight 슬롯(CSS)**

`css/rptlib_proto.css`에 결재 노드용 spotlight `::after` 슬롯 추가(`--card-gx/gy` 사용, conic 아닌 radial spotlight, opacity 0→hover 1):

```css
.rlApprNode{position:relative;}
.rlApprNode::after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .2s ease;z-index:1;
	background:radial-gradient(140px circle at var(--card-gx,50%) var(--card-gy,50%), var(--rl-accent-16), transparent 60%);}
.rlApprNode:hover::after{opacity:1;}
.rlApprNode > *{position:relative;z-index:2;}
```

> 실제 결재 노드 클래스명은 `pop.html`의 마크업 확인 후 매칭(`node(...)` 생성 부분). 클래스가 다르면 그 클래스에 적용.

- [ ] **Step 3: 결재 노드에 바인딩**

`apis_rptlib_pop.html` 스크립트에 결재 노드 mousemove 위임 추가(글래스 엔진 로드 이후):

```javascript
$(document).on('mousemove', '.rlApprNode', cardSpotlight);
$(document).on('mouseleave', '.rlApprNode', function(){ glassClear(this); });
```

- [ ] **Step 4: 카드 `.glassHover` 동작 확인(이미 적용)**

Run:
```bash
grep -cE 'glassHover' js/rptlib_docs.js js/rptlib_collections.js
```
Expected: ≥3 (카드/그리드/북마크에 이미 적용 — 구판이 효과 제공, 추가 작업 불필요).

- [ ] **Step 5: 시각 확인**

문서 카드 hover 시 무지개 색수차(구판 `.glassHover`), 결재 모달 Step 노드 hover 시 spotlight가 마우스를 부드럽게 따라오는지(jitter 없음) 확인.

- [ ] **Step 6: Commit**

```bash
git add js/rptlib_common.js apis_rptlib_pop.html css/rptlib_proto.css
git commit -m "feat(rptlib): 결재 노드 cardSpotlight wow (신판 발췌, 구판 유지)"
```

---

# Phase 3 — 프로세스 정합

## Task 8: 결재 모델 통일 — 게이트 매핑 교정 + 큐 입구화

**Files:**
- Modify: `js/rptlib_review.js`

**Interfaces:**
- Consumes: `rlSubsQueue()`·`rlSubByCode()`·`rlSyncNoti()`·`notify()`(common.js), `rlOpenPop(code, params)`(common.js — pop 위임).
- Produces: 게이트 owner 매핑 정본화, 큐 항목이 진행 상태 + `[결재 열기]`만 렌더(게이트 토글 제거).

- [ ] **Step 1: 게이트-담당자 매핑 교정**

`js/rptlib_review.js`의 `GATES` 배열(17-22행)에서 owner를 정본으로:
```javascript
var GATES=[
	{k:'itar',     owner:'Manager',  q:'Export- or ITAR-restricted (not EAR 99)?',        show:function(g){return true;}},
	{k:'jda',      owner:'Tech CoE', q:'Subject to a JDA / special confidentiality?',      show:function(g){return !g.itar;}},
	{k:'named',    owner:'Tech CoE', q:'Access limited to named individuals (vs region)?', show:function(g){return !g.itar && !!g.jda;}},
	{k:'external', owner:'GT&C',     q:'Approved for external circulation?',               show:function(g){return !g.itar && !g.jda;}}
];
```
(변경: `itar` owner `GT&C`→`Manager`, `external` owner `Approver`→`GT&C`.) `deriveClass()`는 그대로 유지.

- [ ] **Step 2: 큐 항목을 "입구"로 재구성**

`renderQueue()`에서 각 pending 항목의 인라인 게이트 토글(`gatePanel`)·`qActs`(Approve/Reject 직접 액션) 대신, **다단계 진행 상태 요약 + `[결재 열기]` 버튼**을 렌더. 결재 열기는 `rlOpenPop(q.code, 'mode=approve')` 호출로 pop 모달에 위임. Approved/Rejected 탭과 일괄 처리·반려 사유는 유지하되, 반려도 pop 모달 흐름과 일관되게(또는 큐의 기존 반려 폼 유지 — pop이 반려를 지원하면 위임).

> 진행 상태 요약은 정본 흐름 기준: `①Manager → ②GT&C·Tech CoE`. `deriveClass`로 파생 등급 배지는 유지 표시.

- [ ] **Step 3: 게이트 토글 핸들러 제거**

`$(document).ready` 내 `[data-gate]` 토글 클릭 핸들러(94행) 제거(큐에서 직접 분류하지 않음 — 결재는 pop에서). `[data-act]` 직접 승인/반려 핸들러도 pop 위임으로 대체하거나 제거.

- [ ] **Step 4: 정적 체크 — 매핑·토글 제거 확인**

Run:
```bash
grep -nE "owner:'Manager'|owner:'GT&C'" js/rptlib_review.js   # 정본 매핑 존재
grep -cnE "data-gate|gatePanel\(" js/rptlib_review.js          # 토글 잔존 0 기대
```
Expected: 1행에 Manager·GT&C owner 확인 / 2행 결과 `0`(게이트 토글 제거됨).

- [ ] **Step 5: 동작 확인**

list `?view=review`에서 큐 항목이 진행 상태 + 결재 열기로 보이고, 클릭 시 pop 결재 모달이 다단계(Step1 Manager → Step2 GT&C·Tech CoE)로 열리는지 확인. Approve 후 큐 상태가 갱신되는지 확인.

- [ ] **Step 6: Commit**

```bash
git add js/rptlib_review.js
git commit -m "refactor(rptlib): 결재 게이트 매핑 정본화 + My Approval 큐를 입구로(팝업 위임)"
```

---

## Task 9: 중복 제거 — `esc()` 단일화 + 팝업 레지스트리 통일

**Files:**
- Modify: `js/rptlib_common.js`, `apis_rptlib_pop.html`, `apis_rptlib_help.html`, `js/rptlib_docs.js`

**Interfaces:**
- Consumes: `rptlib_common.js`의 `esc()`·`_rlPops`·`rlOpenPop`.
- Produces: 단일 `esc()`/단일 팝업 레지스트리.

- [ ] **Step 1: `esc()` 로컬 중복 제거**

`apis_rptlib_pop.html`·`apis_rptlib_help.html`의 로컬 `function esc(...)` 정의 제거하고, 두 HTML이 `js/rptlib_common.js`를 로드하도록 `<script src>` 추가(없으면). help/pop가 common을 로드하면 공통 `esc` 사용.

> pop.html이 다른 inline 함수(`classBadge` 등)와 충돌 없는지 확인 후 제거.

- [ ] **Step 2: 팝업 레지스트리 통일**

`js/rptlib_docs.js`의 `rlPops` 객체와 `openReport()`(228-243행)를 제거하고, common의 `_rlPops`/`rlOpenPop(code, params)`로 일원화. docs에서 팝업 여는 호출을 `rlOpenPop`로 교체.

- [ ] **Step 3: 정적 체크 — 중복 0**

Run:
```bash
grep -rncE 'function esc\(' apis_rptlib_pop.html apis_rptlib_help.html   # 로컬 esc 제거 → 0
grep -ncE 'var rlPops|rlPops\[' js/rptlib_docs.js                         # rlPops 제거 → 0
```
Expected: 두 명령 모두 `0`.

- [ ] **Step 4: 동작 확인**

list에서 카드 클릭 → pop 1회만 열림(중복 창 없음), help 페이지 정상 렌더, pop 내 텍스트 이스케이프 정상 확인.

- [ ] **Step 5: Commit**

```bash
git add js/rptlib_common.js apis_rptlib_pop.html apis_rptlib_help.html js/rptlib_docs.js
git commit -m "refactor(rptlib): esc() 단일화 + 팝업 레지스트리 _rlPops로 통일"
```

---

## Task 10: 채번 3자리 시퀀스 + 입력 검증

**Files:**
- Modify: `js/rptlib_upload.js`

**Interfaces:**
- Consumes: `RL_SUBS`(common), `toast()`·`notify()`.
- Produces: 사이트별 3자리 증분 채번 `assignNo(site)`, 제출 필수값 검증.

- [ ] **Step 1: 사이트별 시퀀스 채번 함수**

`js/rptlib_upload.js`에 추가(하드코딩 `site+'-26-01'` 대체):
```javascript
/* 사이트별 메모리 시퀀스 — 3자리 zero-pad. 한 데모 세션 내 중복 방지(영속성 아님). */
var _rlSeq={};
function assignNo(site){
	site=(site||'KR').toString().trim()||'KR';
	var existing=RL_SUBS.filter(function(s){return s.code&&s.code.indexOf(site+'-26-')===0;})
		.map(function(s){return parseInt((s.code.split('-')[2]||'0'),10)||0;});
	var base=Math.max.apply(null,[ _rlSeq[site]||0 ].concat(existing));
	var n=base+1; _rlSeq[site]=n;
	return site+'-26-'+String(n).padStart(3,'0');
}
```

- [ ] **Step 2: 제출 핸들러에서 채번·검증 적용**

`upSubmit` 클릭 핸들러(61-78행)에서:
```javascript
var title=fv('mTitle');
if(!title){ toast('Title is required.','warn'); var el=document.getElementById('mTitle'); if(el){ el.closest('.rlField')&&el.closest('.rlField').classList.add('error'); el.focus(); } return; }
var site=(fv('mRegion')||'KR').split('—')[0].trim()||'KR';
var assignedNo=assignNo(site);
```
(제목 공백 시 에러 표시 후 중단. 채번은 `assignNo(site)` 사용.)

- [ ] **Step 3: 정적 체크 — 하드코딩 채번 제거**

Run:
```bash
grep -nE "'-26-01'|\"-26-01\"" js/rptlib_upload.js   # 하드코딩 제거 → 0
grep -cE 'assignNo\(|padStart\(3' js/rptlib_upload.js  # 시퀀스 채번 존재 → ≥2
```
Expected: 1행 `0`, 2행 `≥2`.

- [ ] **Step 4: 동작 확인**

같은 사이트로 연속 2회 제출 → `KR-26-001`, `KR-26-002`로 증분되는지(중복 없음), 빈 제목 제출 시 에러 표시 + 차단되는지 확인.

- [ ] **Step 5: Commit**

```bash
git add js/rptlib_upload.js
git commit -m "feat(rptlib): 채번 3자리 사이트별 시퀀스 + 제출 필수값 검증"
```

---

## Task 11: `workflow.html` 설계안 서술 갱신

**Files:**
- Modify: `rptlib_workflow.html`

- [ ] **Step 1: 역할·플로우 서술을 다단계 결재로 수정**

`rptlib_workflow.html`의 "사람 2명(Author+Reviewer)" 서술(78·92·149-155행 등)을 **정본 다단계 결재**로 갱신:
- 역할: Author + **Manager(ITAR)** + **GT&C(외부회람)** + **Tech CoE(JDA/기밀)** + System.
- 플로우 Step3을 단일 Reviewer가 아닌 Manager(Step1 순차) → GT&C·Tech CoE(Step2 병렬, 둘 다 필수)로.
- ZyLab 대비 비교 표(149-155)의 "2개 역할" 문구를 정본과 일치하게 수정.

> 이 파일은 인라인 `<style>`을 쓰는 독립 설계 문서이므로 색 토큰 수렴(§Phase1) 대상이 아님. **서술만** 수정.

- [ ] **Step 2: 정적 체크 — 다단계 서술 반영**

Run:
```bash
grep -cE 'Manager|GT&C|Tech CoE|병렬' rptlib_workflow.html
```
Expected: ≥3 (다단계 결재 서술 존재).

- [ ] **Step 3: 시각 확인**

`rptlib_workflow.html`을 열어 플로우/역할/비교표가 pop·help의 다단계 결재와 일치하는지 확인.

- [ ] **Step 4: Commit**

```bash
git add rptlib_workflow.html
git commit -m "docs(rptlib): workflow 설계안 서술을 다단계 결재 정본으로 갱신"
```

---

## Self-Review 결과 (작성자 점검)

- **Spec 커버리지:** ①토대(Task1-3) ②컴포넌트/상태/접근성/wow(Task4-7) ③프로세스(Task8-11) — spec §4·§5·§6 전부 task에 매핑됨. §3.5 제약은 Global Constraints로 흡수.
- **Placeholder:** 색 대량 치환은 매핑+grep 정량 검증으로 구체화(86곳을 일일이 못 적는 대신 치환 규칙+체크). 신규 코드(alias·cardSpotlight·assignNo·GATES)는 실제 코드 제공.
- **타입 일관성:** `assignNo(site)`·`cardSpotlight(e)`·`GATES[].owner`·`rlOpenPop(code,params)` 명칭이 task 간 일치.
- **검증 적응:** 자동 테스트 부재 → grep 정적 체크 + 브라우저 시각 확인으로 일관 구성(프로젝트 특성 반영).

---

## End
