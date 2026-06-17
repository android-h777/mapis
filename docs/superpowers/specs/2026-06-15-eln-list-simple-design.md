# ELN List Simple — 설계 문서

작성일: 2026-06-15 / 대상 파일: `apis_eln_list_simple.html` (기존 `apis_eln_list.html` 복사본)

## 목표

ELN 노트 목록 화면을 **Notebook 계층이 없는 단순 구조**로 재구성한다. 노트는 오직
**MAPIS Project 하나에만 종속**되며, notebook·부모 노트(계보)·다중 종속 개념을 모두 제거한다.
"simple" = 트리(tree) 구조 → 2단계 평탄(flat) 구조.

## 1. 레이아웃 — `apis_npdi_list` 2분할 차용

`<article class="contArea typeList type2">` 의 좌우 5:5 리스트-디테일 패턴.

```
┌─ leftSection (Project 목록) ─┬─ rightSection (Notes 목록) ─┐
│ ● [SN-26-0031] RGBOLED  (6) │ ◦ In Progress  UV-Cure PSA  │
│   [CN-26-0064] FOLED    (3) │ ◦ In Approval  Viscosity    │
│   [PT-25-0182] Optical  (2) │ ◦ Approved     Cure rate    │
│   [SN-26-0090] Cust A   (4) │ ◦ Approved     Initial      │
└──────────────────────────────┴─────────────────────────────┘
```

- **좌 (Project 목록)**: `statusBox` 프로젝트 상태 + `[코드] 프로젝트명` + 노트 수. MAPIS에서
  온 **읽기전용 목록**(ELN에서 생성·삭제·이름변경 없음). 행 클릭 → 우측 노트 목록 교체.
- **우 (Notes 목록)**: 선택된 Project의 노트들. `statusBox`(상태) + 제목 + `subInfo`(날짜·작성자·
  태그·fml). 행 클릭 → 노트 상세 팝업(`apis_eln_pop`).

## 2. 데이터 모델

```js
// 신설: MAPIS 프로젝트 (기존 NB_PROJECT 값을 정식 엔티티로 승격)
var PROJECTS = [
  { code:'SN-26-0031', name:'RGBOLED Display Adhesive', status:'ing' },
  { code:'CN-26-0064', name:'Flexible OLED Lamination', status:'ing' },
  { code:'PT-25-0182', name:'Optical Clear Resin',      status:'ok'  },
  { code:'SN-26-0090', name:'Customer A OCR Program',   status:'ing' }
];

// 노트: project 코드로 직접 종속 (기존 NB 중첩 → 평탄 배열)
// { code, title, st, ver, cat, fml, tags, author, date, project }
```

- 제거: `NB`(노트북 중첩 구조), `_nb`/`_nbName`/`_nbIcon`, `NB_PROJECT`, `parent`(계보 링크).
- 노트는 단일 평탄 배열로 보관하고 `project` 코드로 필터링한다.

## 3. Status (4종 → 3종)

워크플로우 순서: **In Progress → In Approval → Approved**. 결과에 "실패" 개념 없음.

```js
var ST = [
  { k:'ing',  cls:'blue',   t:'In Progress' },
  { k:'appr', cls:'viola',  t:'In Approval' },   // 신규 — 보라(brand Viola, --viola25 #a893bd)
  { k:'ok',   cls:'green',  t:'Approved' }        // 기존 success/failed 통합
];
```

기존 데모 데이터 재매핑:
- `ing`(6) → `ing` (In Progress)
- `ok`(8) + `fail`(1) → `ok` (Approved) — 총 9
- `hold`(2) → `appr` (In Approval) — 보류였던 2개를 결재중으로 돌려 신규 상태 시연

제거: `fail`(red), `hold`(orange) status 키. `red` 상태색 사용처 정리.

## 4. 제거 범위 (기존 `apis_eln_list` 대비)

- **좌 노트북 패널** → Project 패널로 교체. 노트북 CRUD(rename/delete)·드래그정렬·`nbColor`·
  `NB_GROUP_COLOR`·My/Shared 그룹 일체 삭제.
- **우 요약+계보 패널**(`elnSummary`) → 노트 목록으로 교체. `renderSummary`·`elnSumPlaceholder`·
  `elnSumMetaRow` 등 삭제.
- **계보 전부**: `lineageIndex`/`lineageRoot`/`lineageChildren`·`historyGraph`·`openLineageModal`·
  `elnFullView`·`parent` 링크.
- **뷰 토글**(List/Chem/Formulation) + Chem/Formulation 렌즈 뷰(`renderChemView`/`renderFmlView`).
- 이미 제거됨: Dashboard 뷰, 좌우 패널 접기 토글.

## 5. 상단바·검색

- 상단: `ELN List` 타이틀 + `New Note` + `Search` 버튼 유지.
- 검색 모달의 `notebook` 필터 → `project` 필터로 치환(드롭다운에 PROJECTS 채움).

## 6. 가정 (브레인스토밍에서 사용자 확정)

- (a) 미지정 노트: 기존 "No Notebook" 저마찰 노트 2개를 기존 4개 Project 중 적당한 곳에 배정.
  별도 `Unassigned` 그룹은 두지 않음 — **모든 노트는 실제 Project에 소속.**
- (b) 노트 행 클릭 = 바로 상세 팝업(`apis_eln_pop`).
- (c) 검색 project 필터 + 상단 New Note/Search 유지.

## 7. 행 표기 (2026-06-16 추가)

- **우측 Note 행**: pill(roundBox: 날짜·작성자·배합) 제거 → 그 줄에 태그 표시(없으면 `No tag` 회색), 날짜·작성자는 우하단 텍스트. 태그가 한 줄을 넘치면 뒤쪽을 숨기고 `+N` 배지(픽셀 폭 측정, `fitTags`), `+N` 클릭 시 그 행 전체 펼침(`.expanded`).
- **좌측 Project 행**: npdi식 pill(세그먼트·소재·계정 blue) + 노트 개수는 pill 아닌 우하단 텍스트(`.elnProjCount`).

## 8. 통합 검색 결과 화면 — A안: 전체폭 노트 리스트 (2026-06-16 확정)

> 이력: 처음 B안(좌측=검색요약/패싯)을 구현했으나 렌더 결과 2-pane 구성이 어색('허접')해 폐기 → 심플한 A안(전체폭 노트 리스트)으로 선회. B 인프라(`#srchSummary`/`renderSrchSummary`/`narrowByProject`/패싯)는 전부 제거.

- **검색 범위**: 전 프로젝트 통합(태그/검색 모달 모두). 결과는 여러 프로젝트가 섞임.
- **모드 토글**(`setSearchMode`): 검색 시 `.elnListWrap`에 `.searching` 부여 → 좌측 Project 패널(`> .leftSection`) `display:none`, 우측 노트 패널이 전체폭. 좌측 헤더에 있던 기준칩(`#elnSrchCrit`)·Clear(`#elnSrchClear`)는 **우측 노트 헤더(`.elnNoteHead`)로 DOM 이동**해 검색 맥락과 탈출구(Clear)를 유지(해제 시 좌측 헤더로 복귀).
- **결과 = 전체폭 노트 리스트**: 행마다 제목 앞 프로젝트 칩(`.elnNoteProj`, 검색 모드에서만 — 통합 결과라 출처 표기 필요). 작성자 select는 결과셋 작성자로 채움(`fillAuthorSelect`), 결과 내 작성자 필터로 동작.
- **종료**: 좌측 패널(타이틀·Search·New 포함)은 검색 중 숨겨지므로 출구는 노트 헤더의 Clear(`clearSearch`) 하나 → 일반 2-pane 복귀. (Search/New는 Clear 후 다시 노출)
- **전환 애니메이션**: 모핑(좌측 폭 축소+우측 확장)은 레이아웃 애니라 버벅여 폐기. 레이아웃은 즉시 전환하고 결과 패널만 `transform(translateY)+opacity` 키프레임(`elnResultsIn`, GPU)으로 등장 → 단일 모션·무버벅임. `display:none`은 DOM·`.on`·`curProj`를 보존하므로 Clear 시 직전 프로젝트가 자동 복귀(별도 `preSearchProj` 불필요).

## 범위 밖 (이번 작업 아님)

- 노트 상세 팝업(`apis_eln_pop`) 내부 구조 변경.
- MAPIS 실제 프로젝트 목록 API 연동(프로토타입이므로 목업 데이터).
- 신규 노트 생성 시 Project 선택 UX의 상세 동작(목업 수준 유지).
- 검색 결과의 좌측 패싯/요약 패널, By Project 좁히기(B안에서 폐기 — A안은 전체폭 단일 리스트).
