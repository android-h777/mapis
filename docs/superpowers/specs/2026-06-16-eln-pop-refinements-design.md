# ELN Pop — 2026-06-16 리파인 묶음 설계 문서

작성일: 2026-06-16 / 대상: `js/eln_proto.js` · `js/eln_proto_simple.js` (해당 구간 동일) · `css/eln_proto.css`
관련 화면: `apis_eln_pop.html` · `apis_eln_pop_simple.html`

이 라운드의 ELN 노트 상세 팝업 리파인 3건을 하나로 정리한다. 모두 **프로토타입**(연구원 피드백
수집용, 시각 설득력 우선, 엔진은 목업이되 모든 버튼은 실제 동작) 맥락이다.

- **Part A** — `Data Table` 모듈을 `Data Visualization`으로 재정의(fixedTable + 차트 기본노출 +
  타입선택 + 다중시리즈 + 버튼 표준화)
- **Part B** — 섹션 우클릭을 *즉시 포스트잇 추가* → *context menu 표시 후 클릭*으로 변경(확장성)
- **Part C** — 우클릭 포스트잇 기능에 대한 ambient hint(아주 가벼운 정적 라벨)

두 JS 파일의 해당 구간은 **동일**하므로 같은 변경을 양쪽에 적용한다.

---

# Part A — Data Visualization 모듈

## A0. 목표

`Data Table` 모듈을 `Data Visualization`으로 재정의한다. 표는 MAPIS 표준 `fixedTable`을 쓰고,
차트는 **기본 노출**하며 Highcharts 여러 스타일(Column/Bar/Line/Area/Pie/Donut)을 **선택**할 수
있게 한다. 데이터가 차트와 어긋나지 않도록 **"차트 타입이 표 형태를 이끄는" 하이브리드** 모델을
채택한다. 다중 시리즈를 지원하되 **사용자가 어렵지 않게** 쓸 수 있어야 한다(마법사·다이얼로그 없음).

## A1. 설계 원칙 — 차트-우선 하이브리드

- **차트 타입이 표의 형태를 결정**한다. 현재의 추측 휴리스틱("1열=라벨, 첫 숫자열=값")을 제거하고
  데이터-차트 대응을 설계상 보장한다.
- 그러나 표 잠금(순수 마법사)은 피한다. 셀은 계속 **자유 편집·Excel 붙여넣기** 가능. 타입 전환 시
  입력 데이터는 **파괴하지 않고 재해석**만 한다.
- 차트 종류는 두 표 형태로 수렴:
  - **Shape A — category × series**: `column` · `bar` · `line` · `area`
    (1열=카테고리, 나머지 숫자열 각각=시리즈)
  - **Shape B — label × value**: `pie` · `donut` (1열=라벨, **첫 값열만** 사용)

## A2. 모듈 레이아웃 (차트가 hero)

```
Data Visualization
[View as: Column ▼]   (Table · Column · Bar · Line · Area · Pie · Donut)
┌─────────────── 차트 (기본 Column 표시) ───────────┐
│              (선택한 타입대로 렌더)              │
└─────────────────────────────────────────────────┘
[+ Row] [+ Series]        Click a cell, then Ctrl+V to paste from Excel
┌──── fixedTable hBorderTable hScroll (편집 가능) ────┐
│ Category │ Series 1 │ Series 2 │   ← 헤더 = 시리즈명 │
│ A        │ 10       │ 5        │                     │
└─────────────────────────────────────────────────────┘
```

- **상단 툴바**: `View as` `<select>` 하나로 통합. 옵션 = `Table` + 6종 차트(Column/Bar/Line/Area/
  Pie/Donut), 기본 `Column`(selected). **별도 'Show chart' 체크박스는 제거** — `Table` 선택이
  곧 "차트 없이 순수 표 입력". (모드 컨트롤을 하나로 합쳐 상태 모호성 제거)
- **차트 영역**: 기본(Column) 표시. `View as = Table`일 때만 숨김.
- **표 툴바**: `+ Row` · `+ Series`(좌) + Excel 안내문(우).
- **표**: `fixedTable hBorderTable hScroll`, 셀 `contenteditable`.

## A3. 데이터 → 차트 매핑 (`renderChart`)

표 해석:

```
헤더(thead th):  [0] = 카테고리 라벨(시리즈 아님) · [1..n] = 시리즈 이름
본문(tbody tr):  [0] = 카테고리 값          · [1..n] = 시리즈별 수치
```

타입별 렌더:

- **Shape A (`column`/`bar`/`line`/`area`)**
  - `chart.type` = 선택값, `xAxis.categories` = 각 행의 첫 셀
  - `series[j]` = `{ name: 헤더[j], data: 행별 j열 수치, color: palette[(j-1)%len] }` (j=1..n)
  - `legend.enabled` = (시리즈 ≥ 2)
- **Shape B (`pie`/`donut`)**
  - `chart.type='pie'`, donut이면 `plotOptions.pie.innerSize='60%'`
  - `series[0].data` = 각 행 `{ name: 첫 셀, y: 첫 값열 수치 }`
  - `legend.enabled=true`, `dataLabels` 표시. 값열이 둘 이상이어도 **첫 값열만** 사용

공통: `backgroundColor:'transparent'`, `title:null`, `credits:false`, height ~220px. 수치 파싱은
기존대로 `parseFloat(...replace(/,/g,''))`, 비수치는 0.

**비올라 톤 팔레트**: `['#A47864','#7391c9','#899f6a','#bb6b80','#c9a14e','#6f9b9b']`.

## A4. 다중 시리즈를 "쉽게"

- **열 추가 = 시리즈 추가**, **헤더 셀 = 시리즈 이름**(이미 `contenteditable`). 별도 UI 없음.
- Excel에서 "1행=계열명, 1열=카테고리" 블록을 그대로 붙여넣으면 다중 시리즈 차트 즉시 완성
  (기존 paste 파싱 유지 — 헤더행 붙여넣기 포함).
- `+ Series`: 숫자열 1개 추가(헤더 기본값 `Series N`). 기존 `addCol` 재사용, 라벨만 변경.
- **타입 전환 동작**: A↔A는 재렌더만. A→B(pie/donut)는 표 구조 유지하되 첫 값열만 사용 + 표 툴바에
  "Pie/Donut uses the first value column" 안내. B→A는 모든 숫자열을 다시 시리즈로 해석.
  어느 전환에서도 입력 데이터 삭제 없음.

## A5. MAPIS 표준화

- **테이블**: `<div class="elnDataTableWrap"><table class="elnDataTable">` →
  `<div class="fixedTable hBorderTable hScroll elnDataTableWrap"><table class="elnDataTable">`.
  시각 프레임은 `fixedTable`이 담당. `elnDataTable*` 클래스는 JS 훅 + 편집 focus 스타일 용도로만
  잔존, 중복 테두리/헤더배경 CSS는 정리.
- **버튼**: `+ Row`/`+ Series` →
  `<a href="javascript:;" class="waves-effect waves-light hBtn hSmall" data-act="addRow"><i class="material-symbols-outlined left">add</i><span class="label">Row</span></a>`.
  기존 `.elnDataBtn` 폐기.
- **안내문 영어화**: `셀 클릭 후 Ctrl+V로 Excel 붙여넣기` → `Click a cell, then Ctrl+V to paste from Excel`.
  toast `Excel 데이터 붙여넣기 완료 (N행).` → `Pasted N rows from Excel.`
- **모듈 메타** (`MODULE_TYPES`): `title` `Data Table`→`Data Visualization`, `icon`
  `table_chart`→`insert_chart`, `desc`→`Editable table with a live chart — multi-series, paste from Excel, chart shown by default`.

## A6. 영향/비영향

- `MODULE_KEYS`의 `'table'` 키는 **유지**(템플릿/직렬화 호환), 표시 이름만 변경.
- **비영향**: Formulation의 `chartFmlAnalysis`, 기존 fixedTable 표(Composition/Results)는 손대지 않음.

---

# Part B — 섹션 우클릭 Context Menu

## B0. 목표 / 현재 동작

현재 `#tab_ov`의 `contextmenu` 핸들러는 `.cardBox` 위 우클릭 시 **즉시 `addPostit()`**을 호출한다
(`js/eln_proto.js` ~1470). 이를 **context menu를 띄우고, 메뉴 아이템 클릭으로 추가**하는 방식으로
바꿔 향후 우클릭 액션 확장성을 확보한다.

## B1. 설계 — `ELN.popover(atPointer)` 재사용

새 메뉴 컴포넌트를 만들지 않는다. 기존 `ELN.popover({ atPointer:{x,y}, content })`가 커서 위치
추종 + 바깥클릭/ESC/스크롤 자동 닫힘 + "한 번에 하나만"을 제공한다(모듈 픽커와 동일 패턴).

- 우클릭 → `e.preventDefault()` → 우클릭 좌표(`clientX/clientY`)와 대상 `card`를 캡처 → 메뉴
  엘리먼트 생성 → `ELN.popover({ atPointer:{x:e.clientX, y:e.clientY}, content: menu })`.
- 메뉴는 **액션 배열**로 정의(확장성):
  ```js
  var CTX_ACTIONS = [
    { icon: 'sticky_note_2', label: 'Add sticky note',
      run: function (card, x, y) { addPostit(card, x, y); } }
    // 향후: 'Add module here', 'Paste', … 한 줄씩 추가
  ];
  ```
- 메뉴 아이템 = `.elnStatusMenuItem` 류 패턴(아이콘 + 라벨 + 클릭). 클릭 시 `ref.close()` 후
  `action.run(card, savedX, savedY)` 호출.
- 기존 가드(편집/인터랙티브 요소·`.elnPostit`·`.elnModDel` 위에선 네이티브 메뉴 유지)는 그대로.
- CSS: `.elnCtxMenu` / `.elnCtxMenuItem`를 `eln_proto.css`에 추가(기존 메뉴 아이템 톤과 일치).

---

# Part C — 우클릭 포스트잇 Ambient Hint

## C0. 목표

우클릭 포스트잇은 **비필수(nice-to-have)** 기능이다. 안내는 **무시 비용 0**이어야 한다 —
주기적 토스트(nagging)·1회 토스트(놓치면 끝)·닫아야 하는 바(치우는 부담) 모두 부적합.

## C1. 설계 — 정적 ambient micro-라벨 (닫기 없음)

- Overview 탭(`#tab_ov`) 상단 한 귀퉁이에 **흐릿한 micro-라벨** 한 줄을 상시 표시.
- 내용: 작은 아이콘 + `Right-click a section to add a sticky note`.
- 스타일: ~11px, 아주 옅은 색(약 `#b8ada0`), `.elnRclickHint`. **닫기 버튼 없음**, 주목을 요구하지
  않는 ambient 캡션. 토스트·반복노출 없음.
- 적용: 두 JS 파일 DOMContentLoaded에서 `#tab_ov`에 1회 주입(또는 HTML에 직접 1줄). 양쪽 동일.

---

# 수용 기준 (동작 프로토타입)

**Part A**
1. 모듈 추가 picker에 `Data Visualization`(insert_chart 아이콘)으로 표시.
2. 모듈 표가 MAPIS `fixedTable` 룩(다른 표와 동일).
3. 차트가 **기본(Column) 표시**, `View as = Table` 선택 시에만 숨김(순수 표 입력).
4. `View as` `<select>`에서 Table/Column/Bar/Line/Area/Pie/Donut 선택 → Table=표만, 그 외=즉시 재렌더.
5. 숫자열 2개↑ → column/bar/line/area에서 **다중 시리즈**(범례). pie/donut은 첫 값열만 슬라이스.
6. `+ Row`/`+ Series`가 MAPIS `hBtn hSmall` 룩이고 실제 동작.
7. Excel 표 붙여넣기 → 표 채워지고 차트 갱신 + 영어 toast.
8. 안내문 영어.

**Part B**
9. `.cardBox` 우클릭 → **즉시 추가가 아니라 context menu** 표시.
10. 메뉴의 `Add sticky note` 클릭 → 우클릭한 그 자리에 포스트잇 부착(기존 드래그/접기/삭제 동작 유지).
11. 편집/인터랙티브 요소·기존 포스트잇 위 우클릭은 네이티브 메뉴 유지.

**Part C**
12. Overview 탭에 흐릿한 micro-라벨이 상시 보이고, 닫기 버튼이 없으며, 주목을 끌지 않는다.
