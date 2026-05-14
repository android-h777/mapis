# Glass Design System — 적용 가이드

mapis 프로토타입(`apis_*.html`)에 적용된 **글래스 색 유리 + 색수차(rainbow conic) 디자인 시스템**을 실제 개발 프로젝트로 이식할 때의 가이드.

작업일: 2026-05-13

---

## 1. 변경 파일 한눈 요약

| 파일 | 변경 종류 |
|---|---|
| `css/mpm_common.css` | 색 유리 / 입체 두께감 / 색수차 / 글래스 행 오버레이 정의 추가·변경 |
| `js/glass_engine.js` | 마우스 트래킹 헬퍼 + 핸들러 그룹화 + 글래스 행 오버레이 함수 |
| `apis_npdi_pop.html` | `pjtMapGroupTit` 2곳 추가 |
| `apis_custom_pop.html` | `pjtMapGroupTit` 2곳 추가 |
| `apis_npt_pop.html` | `pjtMapGroupTit` 2곳 추가 |

---

## 2. 디자인 토큰

### 2-1. 색 유리 (status colored glass)
보더 대신 **배경 컬러 반투명 + 어두운 톤 텍스트**로 상태 표현. 보더 1px 통일.

| 의미 | RGB | 배경 alpha | 보더 alpha | 텍스트 |
|---|---|---|---|---|
| fin (완료, 녹) | 137, 159, 106 | 0.30 | 0.45~0.55 | `#4d5d3b` |
| ing (진행, 파) | 115, 145, 201 | 0.30 | 0.45~0.55 | `#3e5377` |
| type1 (오렌지) | 232, 126, 5 | 0.10 | 0.30 | `#b5621c` |
| type2 / coc (녹) | 137, 159, 106 | 0.10 | 0.30 | `#4d5d3b` |
| 활성 모카 | 164, 119, 100 | 0.35~0.55 | 0.6~0.7 | `#5a3e30` 또는 흰 |
| menuUl 분홍 (hover/active) | 187, 38, 73 | 0.01~0.05 | 0.4~0.55 | (i 색만 변경) |
| 컨테이너 투명 유리 | 255, 255, 255 | 0.18 | 0.35 | inherit |

**배경 alpha 위계**: 기본 0.10~0.20 → 진하게 0.28~0.30 → 활성 0.35~0.55

### 2-2. 입체 두께감 box-shadow (공통)
```css
box-shadow:
  0 2px 4px rgba(0,0,0,0.08),           /* 외곽 */
  0 1px 2px rgba(0,0,0,0.04),
  inset 0 1px 0 rgba(255,255,255,0.55), /* 윗빛 */
  inset 1px 0 0 rgba(255,255,255,0.20), /* 좌측 빛 */
  inset -1px 0 0 rgba(255,255,255,0.15),/* 우측 빛 */
  inset 0 -1px 0 rgba(0,0,0,0.04);      /* 광원 위 시그널 */
```
활성/강조 시: 윗빛 0.55→0.7~0.85, 외곽 그림자 0.08→0.14, 미들 그림자에 컬러 톤(예: `rgba(80,50,35,0.10)`) 추가

### 2-3. backdrop-filter (유리 굴절)
| 영역 | 값 |
|---|---|
| 일반 카드 | `blur(8~10px) saturate(1.3~1.4)` |
| hBtn 알약 | `blur(12px) saturate(1.4)` |
| 강조 indicator | `blur(16px) saturate(1.4)` |
| 컨테이너 (전체 배경) | `blur(20px) saturate(1.4)` |

항상 `-webkit-backdrop-filter` 같이 작성.

### 2-4. 흰 emboss text-shadow
어두운 글자 위 표준 emboss: `text-shadow: 0 1px 0 rgba(255,255,255,0.6);`
가독성 보강 시 alpha 0.6 → 0.85 (단, 부모 배경이 충분히 흐릿할 때만).

### 2-5. 스크롤바
2단계 톤 — **기본 스크롤바는 원래대로 유지, `.hScroll` 계열은 그레이 5px 얇게**.

| 영역 | 두께 | 톤 |
|---|---|---|
| `body` / `.mainCardBox .collapsible-body` / `.mainListDetailArea` / `.tabs` | 10px | 검정 (기존 — 손 안 댐) |
| `.hScroll` / `.hScrollW` / `#npdi-gantt-rows` / `.npdi-gantt-right-pane` | **5px** | thumb `rgba(0,0,0,0.30)` / hover 0.55 / track transparent |

갠트 차트(`Detailed Schedule`) 는 `.npdi-gantt-*` 별도 클래스. `.hScroll` 같은 그룹에 묶어서 통일.

> 모카 톤 시도해봤지만 베이지 배경에 묻혀서 그레이 무채색으로 결정.

---

## 3. 색수차 효과 4가지 패턴

mapis 의 시그니처 효과. `glass_engine.js` 상단 카탈로그 헤더 참고.

### [1] glassTrack — `--olx / --oly / --ol-angle`
큰 conic gradient 회전 + 광원 추적.
- 적용: `.mainList li`, `.menuAside .menuList li`, `.menuUl .menu-item`, `.hBtn`, `.newAppleTab li.on`
- JS 헬퍼: `glassTrack(e)` (this 가 element)

### [2] cardSpotlight — `--card-gx / --card-gy`
spotlight (radial) + 미니 conic. 좁은 카드용.
- 적용: `.pjtMapBox.waves-effect`, `.pjtMapSubBox`, `.popup header .statusArea .bdBox`
- JS 헬퍼: `cardSpotlight(e)` ({x, y} 반환)
- **transform 금지**: 좁은 카드에 perspective rotate 시 jitter 발생 (8번 참조)

### [3] 정적 색수차 (트래킹 없음)
CSS `::after` 슬롯에 고정 conic. JS 핸들러 없음.
- 적용: `.statusBox` (type1/type2/coc), `.popup header .npdiTabMenu .tabs .indicator`

### [4] Glass Row Overlay — 동적 행 오버레이
`.glassRowOverlay > .glassCaustic` div 동적 삽입. tr hover 시 overlay 가 tr 영역에 매칭.
- 적용: `.fixedTable.hBorderTable`, `.hFixedTable.hBorderTable`
- JS: `initGlassOverlay(container, tbody)`, `initAllHBorderTableOverlays()`
- 페이지 ready 시 자동 init

---

## 4. CSS 변경 영역 매핑 (`mpm_common.css`)

| 라인 부근 | 영역 | 무엇 |
|---|---|---|
| 1538~ | `.menuUl .menu-item` | leftAside 분홍 색 유리 (hover/active + 입체 두께감) |
| 2520~ | `.glassRowOverlay` / `.glassCaustic` | hBorderTable 행 오버레이 정의 |
| 2520~ | `.fixedTable.hBorderTable { position: relative }` | overlay absolute 기준 |
| 2651~ | 스크롤바 (기본 / `.hScroll` / 갠트 / `.hScrollW`) | 기본은 원래대로, 나머지는 그레이 5px |
| 2660~ | `.hBtn` | backdrop-filter 강화 + `::after` 색수차 (기본 opacity **0.5**) |
| 3008~ | `.statusBox` | 색 유리(약함 0.10) + 입체감 + `::after` 정적 색수차 |
| 3241~ | `.bdBox` (stageBtn) | 색 유리 + backdrop-filter + `::after` 색수차 (기본 opacity **0.8**) |
| 3355~ | `.bdBox.ing` / `.fin` / `.on` / `.ing.on` / `.fin.on` | 상태별 색 톤 |
| 3398~ | `.npdiTabMenu .tabs .indicator` | 흰 유리 캡슐 + `::after` 정적 색수차 |
| 3719~ | ProcessMap 모달 색 유리 시스템 | `.pjtMapBox` / `.pjtMapSubBox` / `.pjtMapGroupTit` / fin / ing / text-shadow 통합 |

---

## 5. JS 구조 (`glass_engine.js`)

파일 상단에 효과 카탈로그 헤더 주석. 섹션 순서:

1. **헬퍼**: `glassTrack`, `cardSpotlight`
2. **[1] glassTrack 계열**: mainList / menuList / menuUl / hBtn (+ animationend) / appleTab
3. **[2] cardSpotlight 계열**: pjtMapBox.waves-effect / pjtMapSubBox+bdBox
4. **컨테이너 트래킹** (`--lw-gx/lw-gy`)
5. **Glass Row Overlay 함수**: `initGlassOverlay`, `initAllHBorderTableOverlays`
6. **ready 시 init**: `$(function() { initAllHBorderTableOverlays(); })`

---

## 6. HTML 변경 — pjtMapGroupTit

ProcessMap 모달의 SubBox 그룹 컨테이너에 타이틀 추가. flex 첫 줄 차지(`width: 100%`).

### 대상 페이지 (3개)
- `apis_npdi_pop.html`
- `apis_custom_pop.html`
- `apis_npt_pop.html`

### 추가 위치 (각 페이지 2곳)
```html
<!-- 행 1: .col.fin > .pjtMapBox -->
<div class="col s10 fin">
  <div class="pjtMapBox">
    <div class="pjtMapGroupTit">Project Overview</div>  <!-- ★ 추가 -->
    <div class="waves-effect waves-hBlue pjtMapSubBox fin" ...>
    ...
  </div>
</div>

<!-- 행 3: .col.ing > .pjtMapBox -->
<div class="col s10 ing">
  <div class="pjtMapBox">
    <div class="pjtMapGroupTit">Project Assessment</div>  <!-- ★ 추가 -->
    <div class="waves-effect waves-hBlue pjtMapSubBox ...">
    ...
  </div>
</div>
```

타이틀 색은 부모 `.col.fin`/`.col.ing` 에 따라 CSS 가 자동 매칭 (녹/파).

---

## 7. 적용 체크리스트

### A. 파일 옮기기
- [ ] `mpm_common.css` 의 변경 라인 영역들을 개발 프로젝트의 동일 파일에 반영 (4번 표 참조)
- [ ] `glass_engine.js` 통째 교체 또는 헬퍼·핸들러 추가 병합
- [ ] HTML 3개 페이지의 `pjtMapGroupTit` 2곳씩 추가 (6번 참조)

### B. 시각 검증
- [ ] **ProcessMap 모달**: fin=녹 / ing=파 색 유리, SubBox 컨테이너는 투명 유리, 그룹 타이틀 색 자동 매칭
- [ ] **사이드바 menuList**: 호버 시 무지개 색수차, **떠오름 없음** (tilt 만)
- [ ] **leftAside menuUl**: hover/active 시 분홍 유리 + 떠오름(translateY -1px)
- [ ] **stageBtn (.bdBox)**: 색수차 기본 표시 (opacity 0.8), 호버 시 1
- [ ] **hBtn**: 색수차 기본 표시 (opacity 0.5), 호버 시 1
- [ ] **statusBox** (type1/type2/coc): 정적 색수차 + 입체 유리
- [ ] **npdiTab indicator**: 흰 유리 캡슐 + 정적 색수차
- [ ] **hBorderTable**: tr 호버 시 무지개 행 오버레이, **스크롤 안 트리거**
- [ ] **스크롤바**: 기본은 원래대로(검정 10px), `.hScroll`/갠트/`.hScrollW` 는 그레이 5px

---

## 8. 주의사항 (Gotcha)

### 8-1. 좁은 카드 + perspective rotate 금지
`.pjtMapSubBox` 같은 좁은 카드에 `perspective(N) rotateX/Y` 인라인 transform + mousemove 갱신 = **jitter(번쩍거림) 발생**.
- 원인: `transition: transform .25s ease` + mousemove 보간 충돌 + outline animation 누적
- 해결: 좁은 카드는 `cardSpotlight` (변수 갱신) 만, transform 금지
- 큰 박스(≥200px)는 perspective tilt 안전

### 8-2. Materialize indicator 클릭 처리
`.tabs .indicator` 위에 글자 올리려면:
```css
.indicator { z-index: 0; pointer-events: none; }
.tab a { position: relative; z-index: 1; }
```
**`.tab` 자체엔 `z-index` 주지 말 것** — Materialize `tabs.js` 의 `offsetLeft`/`offsetWidth` 계산 깨져서 indicator 이동 작동 안 함.

### 8-3. Glass Row Overlay scroll 트리거 방지
`.fixedTable` 의 `overflow: auto` + overlay 가 컨테이너 boundary 침범 시 위아래/가로 스크롤 트리거.
**해결책 4가지 모두 적용 필요**:
1. overlay `top: -1px`, `height: -1px` (tr 안쪽 1px 마진)
2. caustic `bottom: 0` (overlay 안쪽)
3. outer box-shadow 제거 (inset 만 유지)
4. 컨테이너에 `position: relative` 만 추가 — **`overflow: hidden` 강제 금지** (가로 스크롤 필요 케이스 있음)
5. mouseleave 후 width/height 0 reset (안전망)

### 8-4. Spacing 5의 배수 룰
모든 `padding`/`margin`/`gap`/`top/left/right/bottom`(positioning) 값은 **5의 배수** (5, 10, 15, 20, 25, 30, ...).
- 허용 예외: `border-width` (1px, 1.5px, 2px 등), `font-size` (13px, 15px 등), `letter-spacing` 미세값, `box-shadow` offset 1~2px

---

## 9. 핵심 셀렉터 cheat-sheet

```css
/* 색 유리 컨테이너 */
.modal.hooModal .pjtMapBox                              /* 모달 안 fallback */
.modal.hooModal .pjtMapArea .fin .pjtMapBox             /* 단독 fin (녹) */
.modal.hooModal .pjtMapArea .ing .pjtMapBox             /* 단독 ing (파) */
.modal.hooModal .pjtMapArea .fin/.ing .pjtMapBox:not(.waves-effect)  /* SubBox 컨테이너 = 투명 유리 */
.modal.hooModal .pjtMapSubBox.fin/.ing                  /* SubBox 본체 색 유리 */
.modal.hooModal .pjtMapArea .pjtMapGroupTit             /* 그룹 타이틀 */

/* stageBtn */
.popup header .statusArea .bdBox                        /* 본체 + ::after 색수차 */
.popup header .bdBox.ing/.fin/.on/.ing.on/.fin.on       /* 상태 */

/* 사이드바 / 메뉴 */
.menuAside .menuList li                                 /* slide-out 사이드바 */
.popup aside.leftAside .menuUl .menu-item               /* leftAside 메뉴 */

/* 탭 */
.popup header .npdiTabMenu .tabs .indicator             /* 흰 유리 캡슐 + ::after 정적 색수차 */

/* 카드 / 버튼 */
.typeList .mainList li .statusBox.type1/.type2/.coc     /* 색 유리 + ::after 정적 색수차 */
.hBtn                                                   /* 알약 버튼 + ::after 색수차 (기본 0.5) */

/* 글래스 행 오버레이 */
.fixedTable.hBorderTable, .hFixedTable.hBorderTable     /* 컨테이너 */
.glassRowOverlay                                        /* JS 가 동적 삽입 */
.glassCaustic                                           /* overlay 안 광점 */
```

---

## 10. 글래스 엔진 API

```js
glassTrack(e)            // this 에 --olx/--oly/--ol-angle 설정
cardSpotlight(e)         // this 에 --card-gx/--card-gy 설정, {x, y} 반환
initGlassOverlay(container, tbodyEl)         // hBorderTable 행 오버레이 활성
initAllHBorderTableOverlays(root)            // 페이지 안 모두 일괄 init (root 기본 document)
```

동적으로 hBorderTable 이 추가되는 경우 `initAllHBorderTableOverlays(newRoot)` 호출.

---

## End

문제 발생 시 8번 Gotcha 먼저 확인. CSS 변경 영역은 4번 표 기준 라인 부근에서 찾기.
