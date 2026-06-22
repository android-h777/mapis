# MAPIS 디자인 가이드 (통합)

MAPIS/MPM 프론트엔드 프로토타입(`apis_*.html`)의 **단일 권위 디자인·구조 가이드**.
다른 작업자가 이어받을 때 이 문서 하나로 "어디서·무엇을·어떻게" 따라가도록 작성했다.

- 최종 갱신: 2026-06-22
- 검증 기준: 현재 워킹트리(git HEAD) 코드를 직접 읽어 추출. 추측이 아니라 실제 값·라인 근거.
- 비주얼 토큰 상세는 부록 [`GLASS_DESIGN_GUIDE.md`](GLASS_DESIGN_GUIDE.md) (2026-05-14, 라인 매핑·gotcha 원본) 병행 참조.

> **이 프로토타입의 1순위는 "시각 설득력"이다.** 백엔드 없는 정적 데모이며, 통일감과 가독성을 유저가 직접 관리한다. 새 양식을 만들지 말고 **기존 패턴을 그대로 복사·재사용**하는 것이 최우선 규칙이다.

---

## 0. TL;DR — 신규 모듈 만들 때 5분 요약

1. **기준 패턴은 SNPI** (`apis_npdi_list.html` / `apis_npdi_pop.html`). 구조·클래스·CSS/JS 스택을 여기서 복사한다.
2. **비주얼은 Glass 시스템** (색 유리 + 색수차 + 입체 box-shadow + backdrop-filter). 2026-06-22 결정: SNPI 골격 위에 글래스 요소를 얹는다.
3. **에셋 스택을 먼저 고른다 (§2):** 일반 Materialize 화면 → **스택 A**(`css/mpm_common.css` + `js/jquery-3.3.1`). ELN/리포트류 신규 화면 → **스택 B**(`mapis_lib/...`).
4. **파일 생성:** `apis_<mod>_list.html`(+ 필요시 `apis_<mod>_pop.html`). head/script 블록은 같은 스택 기존 파일을 통째 복제.
5. **메뉴 등록:** `apis_main.html`의 `.menuList ul`에 li 한 줄 추가 — **그리고 다른 list 페이지 전부에 같은 li를 복제**(공통 인클루드 없음, §6).

규칙 위반 금지선: 폰트 13px 미만 금지 · 인라인 `style=` 금지 · spacing 5의 배수 · 새 클래스로 기존 컴포넌트 재발명 금지.

---

## 1. 핵심 규칙 (위반 금지)

| 규칙 | 내용 |
|---|---|
| **폰트 최소 13px** | base `body{font-size:13px}`. 유저 지시 없이 폰트 사이즈 변경/축소 금지. (현 CSS에 12px 잔재가 있으나 §7 cleanup 대상이지 따라할 기준 아님) |
| **인라인 CSS 금지** | `style=` 직접 작성 금지. 스택 A는 `css/mpm_common.css`, 모듈 전용은 `css/<mod>_proto.css`에 클래스로. |
| **5의 배수 spacing** | padding/margin/gap/positioning(top/left/...)은 5의 배수(5,10,15,20...). 예외: border-width, font-size, box-shadow offset(1~2px). |
| **기존 양식 = 원본과 동일하게** | 기존 컴포넌트를 활용하는 화면은 원본의 클래스·값을 **그대로 복사**. 임의의 새 패딩/새 클래스 금지. |
| **새 화면 = 기존 구조 차용** | 리스트=SNPI 2분할, pop=`npdiLayout`, 검색=`#mainSrchInput`. 새 레이아웃을 발명하지 않는다. |

---

## 2. 에셋 스택 (가장 중요 — 먼저 결정)

저장소에는 **자산 루트가 2개** 있고, `apis_util.js`·`glass_engine.js`·`common.css`·`animate.min.css`는 **두 루트에 내용이 다른 복사본**이 존재한다. 어느 스택을 쓰는지에 따라 참조 경로가 갈린다.

| | **스택 A — mpm 레거시** | **스택 B — mapis_lib 신규** |
|---|---|---|
| 쓰는 모듈 | npdi/custom/npt/tech/item/fmea/proposal/coc/main/dash/search/psa | ELN(`apis_eln_*`), rptlib(Report Library) |
| CSS 루트 | `css/` | `mapis_lib/css/` + `css/` |
| 전역 CSS | `css/mpm_common.css` | `mapis_lib/css/common.css` + `mapis_lib/css/lib/mpm_materialize.css` |
| 모듈 전용 | (없음, 전역 공유) | `css/<mod>_proto.css` (eln_proto_simple, rptlib_proto) |
| jQuery | `js/jquery-3.3.1.min.js` | `mapis_lib/js/lib/jquery-3.7.1.js` (+jquery-ui-1.14.1) |
| materialize | `js/materialize.js` | `mapis_lib/js/lib/mpm_materialize.js` |
| util | `js/apis_util.js` (pop만) | `mapis_lib/js/apis_util.js` (≠ A판, 173KB) |
| glass 엔진 | `js/glass_engine.js` (**신규판**) | `mapis_lib/js/glass_engine.js` (**구판**) |
| 아이콘 폰트 | 원격 Google Fonts CDN | 로컬 woff2 preload + `material-symbols-local.css` |

> ⚠️ **glass_engine.js 두 판은 API가 다르다 (§5).** 신규판(`js/`)엔 `cardSpotlight`가 있고 `glassClear`가 **없다**. 구판(`mapis_lib/js/`)엔 `glassClear`가 있고 `cardSpotlight`가 **없다**. 한쪽 패턴을 다른 스택에 복붙하면 `ReferenceError`. 작업 전 그 페이지가 어느 파일을 로드하는지 확인할 것.

### SNPI 기준(스택 A) `<head>` 블록 — 신규 모듈 복제용
```html
<!-- CSS (list/pop 공통) -->
<link rel="stylesheet" type="text/css" href="css/materialize.css">
<link rel="stylesheet" type="text/css" href="css/mpm_common.css">
<link type="text/css" rel="stylesheet" href="css/animate.min.css">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">

<!-- JS base (list) -->
<script src="js/jquery-3.3.1.min.js"></script>
<script src="js/materialize.js"></script>
<script src="js/highcharts/highcharts.js"></script>     <!-- 차트 쓸 때 -->
<script src="js/glass_engine.js"></script>
<!-- pop 추가: jquery-ui(CDN), js/apis_util.js, highcharts-more.js, jquery.inputmask.js, Hoo-gantt.js -->
```

---

## 3. 구조 패턴 (SNPI 기준)

### 3-1. 리스트 화면 — `article.contArea.typeList.type2` (좌우 분할)
```
header.navbar-fixed > nav > article.navTop
  section.centerSection > div.srchArea > input#mainSrchInput   ← 전역 검색
aside.menuAside > div#slide-out.sidenav.glassBox > div.menuList > ul > li  ← 사이드메뉴(§6)
article.contArea.typeList.type2
 ├─ div.leftSection
 │   section.mainTitArea > div.mainTit + div.btnArea(탭 + Create + Filter)
 │   section.mainList.cardBox > ul.hScroll > li.waves-effect.waves-hColor   ← 리스트 행
 │       section.statusBox.type2 "Completed"      ← 상태 배지
 │       div.pjTit "[코드] 이름"                   ← 클릭 시 pop 오픈
 │       div.subInfo > div.roundBox.contVal1...    ← 부가정보 칩
 └─ div.rightSection > div.cardBox
     div.cardTit > #dtTit + div.row.subPjInfo(col s6 라벨/col s6 값) + Highcharts 컨테이너
```
- **리스트 탭은 `newAppleTab` (커스텀 슬라이딩 탭)이지 Materialize tabs가 아니다.** `div.newAppleTab > ul > li[cd] + div.tabBg`. 클릭 시 `.on` 토글 + `.tabBg` left 애니메이션.
- 행 클릭 → `.on` + 우측 상세 갱신. `.pjTit`/우측 `.cardTit` 클릭 → `window.open('apis_<mod>_pop.html', ...)`.

### 3-2. 팝업 — `body.popup.npdiLayout`
```
header.z-depth-1
 ├─ section.titArea.npi > 로고 + div.statusTit(tit + roundBox 상태)
 ├─ section.statusBox > div.statusArea                ← 가로 게이트 진행 바
 │     div#btn_stage_N.bdBox.stageBtn[.fin|.ing]  data-type/data-gate
 │         i.material-symbols-outlined(check_circle|play_circle|circle) + span
 │     div.arw(화살표) / div.onArwArea > svg(현재 위치)
 │   a#processMapBtn.hBtn.hViva.modal-trigger[href="#processMapModal"]
 └─ section.npdiTabMenu(display:none) > ul.tabs#npdiTab > li.tab[data-val]   ← Materialize tabs
aside.leftAside.z-depth-1.blurArea
   div.menuTit + section > ul#menu_stage_*.menuUl > li.menu-item[data-target="pjContCard_X-Y"]
   section.btnArea > a.hBtn.hBlue(Save)
div.contArea
   article#cont_stage_N.contArticle(display:none)
     section.cardBox > div.cardTit2(i + 제목) + div.inputArea + div.fixedTable.hBorderTable
#processMapModal.modal.hooModal > div.modal-content.pjtMapArea > ...pjtMapBox/pjtMapSubBox
```
- **팝업 탭은 Materialize tabs** (`$('#npdiTab').tabs()`) — 리스트와 다르다.
- 카드 id 규칙: `pjContCard_{stage}-{tab}-{section}`. 좌측 메뉴 `data-target` ↔ 카드 id 1:1, 탭 `data-val` ↔ `cont_stage_*` 매핑.

---

## 4. 재사용 컴포넌트 인벤토리

| 컴포넌트 | 클래스 | 용도 / 변형 |
|---|---|---|
| **statusBox (배지)** | `section.statusBox.type1` / `.type2` | 리스트 행 상태. type1=On Going(주황), type2=Completed(녹). *(`coc` 변형은 GLASS 가이드 표기뿐, npdi엔 없음 — 쓰기 전 CSS 확인)* |
| **stageBtn** | `div.bdBox.stageBtn[.fin\|.ing]` + `data-type`/`data-gate` | 팝업 헤더 게이트. `.fin`=완료, `.ing`=진행, 무클래스=미시작 |
| **roundBox (알약 라벨)** | `div.roundBox` + `.blue`/`.green`/`.bdOrange`/`.contVal1~4` | 부가정보·상태 태그 칩 |
| **hBtn (알약 버튼)** | `a.waves-effect.waves-light.hBtn` + 색 `.hBlue`/`.hViva`/`.hGreen`/`.hGrey` + 폭 `.wd100px`/`.wd160px`; 내부 `i.material-icons.left + span` | **모든 액션 버튼**. 글래스+색수차 CSS·핸들러 기본 탑재 |
| **FormSelect** | `<select>` + `$('select').formSelect()` | Materialize 드롭다운 |
| **테이블** | `div.fixedTable.hBorderTable.hScroll > table`; 가로고정 `div.hFixedTable...` | 카드 내 데이터/입력 테이블. `.hBorderTable`이면 행 글래스 오버레이 자동 |
| **cardBox / cardTit2** | `section.cardBox > div.cardTit2(i + 제목)` (+ `div.cardSubTit`) | 본문 콘텐츠 단위 카드 |
| **aniInput** | `div.aniInput > input.browser-default + span.focus-border` | 포커스 밑줄 애니 입력칸 |
| **inputArea 폼 그리드** | `div.inputArea > div.row > div.col sN(.ar.pl0 라벨 / .val 값)` | 라벨/값 2열 폼 |
| **모달 헤더** | `div.modal-header.mochaBg > h5 + div.closeBtns.modal-close` | 전 모달 공통 |
| **newAppleTab** | `div.newAppleTab > ul > li[cd] + div.tabBg` | 리스트 커스텀 탭 (≠ Materialize) |
| **waves** | `.waves-effect` + `.waves-hColor`/`.waves-hBlue`/`.waves-green`/... | 클릭 리플 |

---

## 5. 비주얼 토큰 (Glass 시스템)

### 5-1. 컬러 (실측 — `css/mpm_common.css`)
| 토큰 | hex / rgb | 의미 | 알파 변형 |
|---|---|---|---|
| **모카(활성/기본)** | `#a47764` (164,119,100) | 기본 hBtn·테두리·강조 텍스트 (브랜드 메인) | `0.07` 호버 채움 |
| **파랑(ing/진행)** | `#7391c9` (115,145,201) | hBlue·진행 상태·탭 active | `0.7` 보더 / `0.5` |
| **녹(fin/완료)** | `#899f6a` (137,159,106) | hGreen·완료·greenTab | `0.7` / `0.02` 탭배경 |
| **분홍(viva/강조)** | `#bb2649` (187,38,73) | hViva·경고·활성 탭 테두리·검색 하이라이트 | `0.7` |
| 주황 | `#e87e05` | statusBox type1 | — |
| 그레이모카 | `#a89a8f` | hGrey | `0.7` |
| 베이지배경 | `#f0e9e0` / `#FBF8F6` | 테이블 행·따뜻한 배경 | — |
| 링크호버 | `#004098` | 링크 hover | — |

### 5-2. 입체 box-shadow (글래스 두께감)
핵심 공식: **`inset 0 1px 0 rgba(255,255,255,X)` (윗빛) + 외부 드롭섀도우 다단 + (강조 시) inset 아랫그림자.**
```css
/* hBtn 기본 */
box-shadow: inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 4px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
/* 카드 부상 (typeList li.on) */
box-shadow: 0 4px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9),
            inset 0 -1px 0 rgba(0,0,0,0.05), 0 0 8px rgba(0,0,0,0.06);  /* + transform: translateY(-2px) */
/* modal */
box-shadow: 0 8px 32px 0 rgba(31,38,135,0.37), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.05);
```
윗빛 알파 위계: 버튼 0.7 → 카드 0.8~0.9 → 강조 시 상향.

### 5-3. backdrop-filter (깊이 3단)
| 요소 | 값 |
|---|---|
| 작은 인터랙티브 (hBtn, tabBg, li:hover) | `blur(6px)` |
| 부상 카드 (li.on) | `blur(8px)` |
| 모달·대형 패널 | `blur(10px)` (+ `-webkit-` 동반) |

### 5-4. 색수차 (chromatic aberration)
5곳에서 동일 무지개 `conic-gradient`. CSS 변수 `--ol-angle / --olx / --oly`로 회전·중심 제어, JS `glassTrack`이 마우스 추적으로 런타임 주입.
적용: `.glassRowOverlay`(α0.05 강) · `.hBtn::after` · `.typeList li.on::before` · `.modal::before`(α0.01~0.04 약) · `.newAppleTab .tabBg::after`.

### 5-5. 스크롤바
| 영역 | 두께 | 톤 |
|---|---|---|
| 기본 (`body`,`.hScroll`,`.tabs`...) | 10px | track `rgba(0,0,0,0.2)` / thumb `rgba(0,0,0,0.4)` |
| `.hScrollW` (어두운 배경용) | 10px | track `rgba(255,255,255,0.2)` |

---

## 6. 사이드 메뉴 등록 (신규 메뉴 추가 절차)

위치: `apis_main.html`의 `<div class="menuList"><ul>`. li 한 줄 패턴:
```html
<li class="waves-effect waves-hColor"><a href="apis_<mod>_list.html"><i class="material-icons left">ICON</i>Label</a></li>
```
- 현재 페이지 li만 `class="... on"`.
- 현재 등록 순서(11): Home → Insight → Proposal → Standard NPI → Custom NPI → NPT → Tech Support → Lab Note → Raw Material Hub → FMEA → CoC.

> ⚠️ **`.menuList` 마크업은 공통 인클루드가 아니라 16개 list/단일 페이지에 정적 복제**돼 있다. 신규 li는 **모든 페이지에서 동기화**해야 한다.
> ⚠️ 일부 라벨 꼬리에 zero-width space(U+200B)가 박혀 있다(Insight·Raw Material Hub·FMEA·CoC). 복붙 시 주의.

### 모듈 이름 3종 매핑 (1:1 아님 — 신규 시 셋 다 정할 것)
| 메뉴 라벨 | list/pop 파일 | ERD 약어 | 아이콘 |
|---|---|---|---|
| Standard NPI | `apis_npdi_*` | SNPI | lightbulb |
| Custom NPI | `apis_custom_*` | CNPI | integration_instructions |
| NPT | `apis_npt_*` | NPT | snippet_folder |
| Tech Support | `apis_tech_*` | TS | build |
| Lab Note | `apis_eln_*_simple` | ELN | science |
| Raw Material Hub | `apis_item_*` | rmhub | colorize |
| FMEA | `apis_fmea_*` | fmea | playlist_add_check_circle |
| Proposal | `apis_proposal_*` | proposal | assistant |
| CoC | `apis_coc` | approval | assignment_late |

---

## 7. 알려진 불일치 / Cleanup 대상 (따라하지 말 것)

현 코드에 남은 위반/버그. 신규 작업의 기준이 **아니며**, 손대게 되면 정리한다.
- **12px 폰트 산재** (특히 `mpm_common.css` 5300~5800 블록), 11/10/8px 소수 — 13px 규칙 위반.
- **padding 예외값** `8px`(버튼 세로), `3px`, `13px` 산발 — 5의 배수 위반.
- **스크롤바 셀렉터 버그** `mpm_common.css:2472` — `body::-webkit-scrollbar-track .mainCardBox...` 콤마 누락으로 결합자가 됨.
- **glass_engine.js 이원화** (§2/§5) — 통합 미완. 스택별로 다른 API.
- **레거시 CSS** `css/common.css`·`common_jinp.css`·`common_neo.css`·`mpm_common_org.css` 등은 미사용 추정 — 신규에서 링크 금지.

---

## 8. Glass 적용 gotcha (요약 — 상세는 GLASS_DESIGN_GUIDE.md §8)
- **좁은 카드 transform 금지**: `.pjtMapSubBox`/`.bdBox`/`menuIconBox`는 jitter 발생 → `cardSpotlight`(변수만), 틸트 없음.
- **input 틸트 금지**: 검색창은 `glassTrack`만.
- **동적 테이블 재init**: ready 후 새로 그린 `.hBorderTable`은 `initAllHBorderTableOverlays(container)` 재호출(idempotent).
- **Materialize `.tab`에 z-index 금지**: indicator 위치 계산(offsetLeft/Width)이 깨짐.
- **glassRowOverlay 스크롤 트리거 방지**: overlay `top:-1/height:-1` + 컨테이너 `position:relative`(overflow:hidden 강제 금지).
- **animate.css가 인라인 transform 덮음**: `.hBtn`은 `animationend`에 `animate__*` 자동 제거.

### glass_engine API (신규판 `js/glass_engine.js`)
```js
glassTrack(e)        // this에 --olx/--oly/--ol-angle 주입 (마우스 추적 색수차)
cardSpotlight(e)     // this에 --card-gx/--card-gy 주입, {x,y} 반환 (좁은 카드용)
initGlassOverlay(container, tbodyEl)      // hBorderTable 행 오버레이
initAllHBorderTableOverlays(root=document) // 일괄 init (ready 시 자동 1회)
// 구판(mapis_lib/js/)에만: glassClear(el) — 인라인 --ol* 변수 제거
```
신규 요소에 적용: ① 가장 쉬운 길은 `.hBtn` 등 **기존 클래스 부여**(CSS+위임 핸들러 이미 준비됨) ② 새 셀렉터면 `::before/::after`에 conic 슬롯 만들고 `$(document).on('mousemove','.myEl',glassTrack)` 한 줄. 위임 바인딩이라 동적 요소도 자동 발화.

---

## 9. 참고 위치
- 비주얼 토큰 원본·라인 매핑: `GLASS_DESIGN_GUIDE.md`
- 모듈별 설계 스펙: `docs/superpowers/specs/` (eln, rptlib 등)
- 동료 메모리(검색/폰트 규칙): `.claude/projects/-Users-magi-workspace-mpm-prototype/memory/feedback_*.md`
- ERD: 루트 `mapis*.erd.json`
</content>
</invoke>
