# Technical Report Hub (rptlib/TRH) — 견고화 마무리 설계 (spec)

작업일: 2026-06-24
모듈명: **Technical Report Hub** (TRH, 구 Technical Report Library — Momentive ZyLab® 대체 프로토타입)
선행 설계: [`2026-06-16-rptlib-design.md`](./2026-06-16-rptlib-design.md)
**준수 가이드 (1순위 — 반드시 참조):**
- [`MAPIS_DESIGN_GUIDE.md`](../../../MAPIS_DESIGN_GUIDE.md) — 단일 권위 디자인·구조 가이드 (위반 금지선·에셋 스택·재사용 컴포넌트)
- [`GLASS_DESIGN_GUIDE.md`](../../../GLASS_DESIGN_GUIDE.md) — 비주얼 토큰 원본 (색 유리·색수차·box-shadow·라인 매핑·gotcha)

작업 브랜치: `rptlib-trh-hardening`

---

## 1. 목적

추가 기능 개발은 종료. 이번 작업은 **프로세스 견고화 + 디자인 견고화 마무리**다.
선행 설계의 철학("시각 설득력 1순위, 엔진은 목업, ZyLab 기능 패리티 플로어")을 그대로 유지하면서, 그동안 누적된 **모델 분열·하드코딩·일관성 결함**을 *수렴*한다. 새 기능을 더하지 않고, 이미 있는 좋은 구현을 정본으로 승격하고 나머지를 거기에 맞춘다.

## 2. 범위 경계 (정직하게)

**In scope**
- 정적 프로토타입 한 세션 안에서 신뢰감 있게 동작하는 수준의 견고화
- 클라이언트 측 일관성(결재 모델 통일, 디자인 토큰 수렴, 컴포넌트/상태 일관화, 접근성)

**Out of scope** (선행 설계 §9 계승)
- 실제 백엔드 / 인증 / AD그룹 / 규칙 enforcement
- 네트워크 에러 처리 프레임워크, 재시도, 타임아웃 — `au.ajaxPost(...)` seam은 주석으로 유지
- 단위/E2E 테스트 커버리지
- 반응형 모바일/태블릿 레이아웃 — **데스크탑 전용**(최소폭 이하 극단적 깨짐만 방어)

## 3. 합의된 핵심 결정 (사용자 확정)

| # | 결정 | 값 |
|---|---|---|
| D1 | 작업 범위 | 프로토타입 완성도 높이기 (프로덕션 전환 아님) |
| D2 | 반응형 | 데스크탑 전용 |
| D3 | 결재 모델 | **다단계 결재 체인** (Manager → GT&C·Tech CoE) |
| D4 | My Approval 큐 | **큐는 입구, 결재는 팝업 위임** (`pop.html` 모달 재사용) |
| D5 | 색 토큰 | **새 hex/rgb 0개.** `common.css` 변수 alias 우선, 안 맞으면 `color-mix(기존변수)` 파생 |
| D6 | 텍스트색 | 따뜻한 갈색 → **순회색 `--gray` 스케일로 통일** (진한 텍스트 포함, A안) |
| D7 | 컴포넌트 베이스 | 전사 `.hBtn`을 버튼 베이스로 채택 (wow가 공짜로 따라옴) |
| D8 | wow 포인트 | `glass_engine` 기존 효과를 **카드 호버 + 결재 모달**에만 절제 적용 |
| D9 | spacing | 신규 8px 아님 — 기존 **5의 배수** 관습 준수 (`GLASS_DESIGN_GUIDE.md`) |
| D10 | 채번 | 메모리 시퀀스, **3자리** (`KR-26-001`, `KR-26-002` …) |

---

## 3.5 준수 가이드에서 끌어온 제약 (구현 전 필독)

`MAPIS_DESIGN_GUIDE.md` / `GLASS_DESIGN_GUIDE.md` 를 읽고 추출한, 이번 작업에 직접 걸리는 제약들. **함정 포함.**

- **에셋 스택 = B (mapis_lib).** rptlib은 `mapis_lib/css/common.css` + `mapis_lib/js/glass_engine.js`를 로드한다. 색 토큰의 단일 출처는 `mapis_lib/css/common.css`(`css/mpm_common.css` 아님).
- **`glass_engine.js` 구판/신판 비교 → 구판 유지 + 함수 발췌.** rptlib 3개 HTML은 구판(`mapis_lib/js/`)을 로드하고, 실제 의존하는 건 `.glassHover`(문서 카드/그리드 — `docs.js:392,577`, `collections.js:100`)뿐. `.modal`·`glassClear`·`cardSpotlight`는 직접 호출하지 않는다.
  - **신판 통째 교체는 손해**: ① 신판엔 `.glassHover` 핸들러가 없어 카드 호버 wow가 죽고, ② 신판 `.hBtn`은 강한 틸트(20°)+scale(1.03)라, `.hBtn` 베이스(§5-1)를 채택한 rptlib 버튼 전체가 과하게 출렁여 '절제된 wow' 톤과 어긋난다.
  - **결정: 구판 유지.** 좁은 카드용 `cardSpotlight` **한 함수만** 신판에서 `js/rptlib_common.js`로 발췌 — **원본과 동일 이름 `cardSpotlight`로**(구판엔 `cardSpotlight`가 없어 충돌 없음, 향후 코드 통합 시 일관성 유지). 두 판 동시 로드·원본 파일 수정은 하지 않는다. 큰 카드는 구판 `.glassHover` 그대로.
- **⚠️ 모카색 두 값 혼재.** rptlib 안에 `#a47864`(86회)·`#a47764`(10회)가 섞여 있다(손으로 베끼며 1씩 어긋남). 둘 다 **`var(--mocha25)`로 통일**하면 미세 불일치까지 정리됨.
- **spacing 5의 배수** (가이드 위반 금지선): padding/margin/gap/positioning은 5,10,15,20… 예외는 border-width·font-size·box-shadow offset(1~2px). → D9.
- **폰트 13px 최소** (가이드 위반 금지선): rptlib의 11px·12.5px·13.5px 등 비표준 폰트는 검토 대상. 단, 배지/마이크로 라벨은 신중히(키우면 레이아웃 변형) — 명백한 본문/항목 텍스트의 13px 미만만 교정.
- **인라인 `style=` 금지**: 발견 시 `css/rptlib_proto.css` 클래스로 이관.
- **새 컴포넌트 발명 금지**: 버튼은 전사 `.hBtn`(+`.hBlue/.hViva/.hGreen/.hGrey`), 알약 라벨은 `.roundBox` 재사용(가이드 §4). → §5-1의 `.hBtn` 베이스 채택은 이 규칙과 정합.
- **운영 자산 불가침**: `mapis_lib/*`·`common.css`·`glass_engine.js`는 수정하지 않는다. rptlib 쪽(`css/rptlib_proto.css`, `js/rptlib_*.js`, `apis_rptlib_*.html`)에서만 작업.

---

## 4. 설계 ① — 디자인 토대: 기존 변수로 전면 수렴

### 4-1. 원칙
- `rptlib_proto.css`에 **새 색값(hex/rgb)을 만들지 않는다.**
- 1순위: `common.css`의 기존 변수를 그대로 사용 (`var(--mocha25)` 등).
- 2순위: 정확히 맞는 변수가 없으면 기존 변수에 `color-mix`를 씌워 파생.
- alias 변수(`--rl-accent: var(--mocha25)`)는 허용하되, **값은 항상 기존 변수 또는 그 color-mix**여야 한다.

### 4-2. 색 매핑 (rptlib 하드코딩 → 기존 변수)

근거: `rptlib_proto.css`의 색 빈도 전수 조사. 대부분이 이미 MAPIS PANTONE 팔레트의 손베낀 변형이라 원래 토큰으로 *원위치 복원*된다.

| rptlib 하드코딩 (빈도) | 용도 | → 매핑 |
|---|---|---|
| `#a47864` (86) · `#a47764` (10) | 액센트 (두 모카값 혼재) | `var(--mocha25)` — 통일 |
| `rgba(164,120,100,.06~.16)` (50+) | 액센트 배경 | `color-mix(in srgb, var(--mocha25) N%, transparent)` |
| `#7a5240`·`#5a3e30` (34+) | 진한 모카(호버) | `color-mix(in srgb, var(--mocha25) 78%, black)` |
| `#cda892`·`#cdbfae` | 모카 라이트 | `color-mix(in srgb, var(--mocha25) 65%, white)` |
| `#f1e9dd`·`#efe7db` (20+) | 따뜻한 배경 | `var(--gardenia25)` (#F1E9DF, 사실상 동일) |
| `#ece3d5`·`#e7ddce`·`#e2d8c9` (48+) | 따뜻한 테두리 | `color-mix(in srgb, var(--gardenia25) 85%, var(--gray30))` |
| `#3a2c24` (22) | 진한 텍스트 | `var(--gray90)` (#262626) — A안 순회색 |
| `#5a4a3e`·`#5a4636` (17+) | 본문 텍스트 | `var(--gray70)` (#525252) |
| `#6f5d4e`·`#7a6757` (26+) | 보조 텍스트 | `var(--gray60)` (#6F6F6F) |
| `#9b8c7e`·`#8a7a69` (64+) | muted | `var(--main-hint-color)` (#909090) |
| `#c4b8a8`·`#bcae9d` | hint/disabled | `var(--gray40)` (#A8A8A8) |
| `#c0504e`·`#b03e3e` (22) | reject 빨강 | `var(--viva)` (#bb2649) |
| `#2c7a50`·`rgba(58,170,111,..)` | approve 초록 | `var(--leafgreen)` 또는 `--rl-c1` |

**유지**: 흰색 `#fff`(보편값), Class 색 `--rl-c1~4`(이미 단일 출처).

### 4-3. spacing / 타이포
- 신규 토큰 강제 도입보다, 흩어진 px 값을 **기존 5의 배수 관습**에 맞춰 정렬(예: 11px·13px·18px 등 비표준 값을 5/10/15/20으로 수렴, 시각 영향 없는 선에서).
- 타이포는 컴포넌트 통일(§5-1) 과정에서 제목/본문/라벨 크기를 정렬.

---

## 5. 설계 ② — 컴포넌트 베이스 · 상태 · 접근성 · wow

### 5-1. 컴포넌트 베이스 통일
- **버튼**: 새 베이스 만들지 않고 전사 `.hBtn`을 베이스로 채택. rptlib는 크기/색 변형만 얹음. 현재 제각각인 `.rlHome`·`.rlSavedBtn`·`.rlTool`·`.qBtn`의 높이·radius·패딩을 일관화.
- **배지**: `.rlClassBadge`를 단일 배지 베이스로. 등급/상태 색은 `color-mix(var(--rl-cN) …)`로 파생. `.mineBadge`의 중복 색 정의 흡수.
- **칩**: `.rlChip` 2중 정의(`rptlib_proto.css:76`, `:397`) 통합.

### 5-2. 상태 디자인 (일관화)
- **empty**: `.rlEmpty`·`.subEmpty`·`.bkEmpty`를 아이콘 + 설명 + CTA 한 패턴으로 통일.
- **disabled**: `opacity:.45 + cursor:not-allowed`로 통일(현재 opacity/background 혼재).
- **focus**: §5-3과 연결 — focus ring 명확화.
- **error**: 입력 필드 에러 표시(빨간 테두리 + 메시지, `var(--viva)`) 추가.
- **loading**: 무거운 skeleton 대신 가벼운 갱신 표시 정도(프로토타입 수준).

### 5-3. 접근성 (데스크탑 한정, 핵심만)
- **색 대비**: muted 텍스트를 `--main-hint-color`/`--gray`로 통일하며 WCAG AA 충족(§4에서 대부분 해결).
- **focus ring**: 키보드 포커스에 `outline:2px solid var(--mocha25); outline-offset:2px` 일관 부여.
- **시맨틱/ARIA**: `<a href="javascript:;">` 버튼에 `role="button"`, 모달 `role="dialog"`, 토스트 `role="status"` 보강.

### 5-4. wow 포인트 (glass_engine 기존 효과, 절제)
새 효과 제작 없음. 이미 `.hBtn`·`.glassHover`·`.modal`에 도는 마우스 추적 무지개(conic-gradient)를 **핵심 인터랙션 2곳에만**:
1. **문서 카드 호버**(`.rlRepCard`)에 `.glassHover` — 탐색의 시각 보상.
2. **결재 모달 Step 노드/Approve 버튼**(`pop.html`) — 제품의 결정적 순간. Approve는 이미 `.hBtn`이라 자동.
- 등급 배지 등 그 외는 적용하지 않음(희소성이 wow의 핵심).
- `.hBtn` 베이스 채택(§5-1)으로 버튼 wow는 자동 획득.
- **구현 메모(§3.5):** 큰 카드(`.rlRepCard`)는 구판이 지원하는 `.glassHover`(glassTrack) 그대로. 좁은 결재 Step 노드는 신판에서 **동일 이름**으로 발췌한 `cardSpotlight`로 spotlight 적용 — transform 금지로 jitter 회피(`GLASS_DESIGN_GUIDE.md §8-1`). 마우스 이탈 시 구판 `glassClear`로 변수 정리.

---

## 6. 설계 ③ — 프로세스 정합

### 6-1. 결재 모델 단일화 (정본 = `pop.html` 다단계 체인)
- **정본 흐름**: Author 제출 → **Manager**(ITAR, Step1 순차) → **GT&C**(외부회람)·**Tech CoE**(JDA/기밀) Step2 병렬(둘 다 필수) → System 채번·발행 → Live.
- **게이트-담당자 매핑 교정**: `rptlib_review.js`의 어긋난 매핑(ITAR→GT&C, 외부회람→Approver)을 정본(`ITAR→Manager`, `외부회람→GT&C`, `JDA→Tech CoE`)으로 통일.
- **클래스 도출 보존**: `deriveClass()`(ITAR→OOS, JDA+named→C4/C3, external→C1/C2)는 정본과 정합 → 유지.

### 6-2. My Approval 큐 재구성 (큐=입구, 결재=팝업)
- `rptlib_review.js`의 **게이트 토글 로직 폐기**. 큐 항목은 다단계 진행 상태(①Manager✓ → ②GT&C·TechCoE 대기)와 `[결재 열기]` 버튼만 표시.
- 실제 결재는 `pop.html` 모달(`mode=approve`)로 위임 → 결재 UI가 한 곳으로 수렴.
- 큐의 탭(Pending/Approved/Rejected/All)·일괄 처리·반려 사유(필수)는 유지.

### 6-3. 중복·불일치 제거
- **`esc()` 중복**: `pop.html`·`help.html`의 로컬 `esc()` 제거, 공통 `rptlib_common.js`의 것 사용(팝업도 common 로드).
- **팝업 레지스트리 이중화**: `_rlPops`(common)/`rlPops`(docs)를 `_rlPops` 하나로 통일.
- **`rptlib_workflow.html` 갱신**: "사람 2명(Author+Reviewer)" 서술을 다단계 결재(Manager·GT&C·Tech CoE) 모델로 수정 — 설계 문서가 구현과 일치하게.

### 6-4. 채번·검증 (프로토타입 수준)
- **채번**: 하드코딩 `site+'-26-01'` → 메모리 시퀀스로 사이트별 증분, **3자리**(`KR-26-001`, `KR-26-002` …). 한 데모 세션 내 중복 방지가 목표(영속성 아님).
- **검증**: 제출 폼 필수값(제목 공백 불가)·반려 사유 빈 문자열 거부 정도의 가벼운 클라이언트 검증.

---

## 7. 영향받는 파일

| 파일 | 변경 |
|---|---|
| `css/rptlib_proto.css` | §4 색 수렴, §5 컴포넌트 베이스·상태, spacing 정렬 (가장 큰 변경) |
| `js/rptlib_review.js` | §6-1 매핑 교정, §6-2 큐를 입구로 재구성, 게이트 토글 폐기 |
| `apis_rptlib_pop.html` | §6-3 `esc()` 제거·common 사용, §5-4 결재 모달 wow, §5-3 ARIA |
| `js/rptlib_common.js` | §6-3 팝업 레지스트리 통일, 공통 `esc()` 단일화 |
| `js/rptlib_docs.js` | §6-3 `rlPops` 제거, §5-4 카드 `.glassHover`, §5-1 버튼 `.hBtn` |
| `js/rptlib_upload.js` | §6-4 채번 시퀀스·필수값 검증 |
| `apis_rptlib_help.html` | §6-3 `esc()` 제거, 매핑 서술 정합 확인 |
| `rptlib_workflow.html` | §6-3 설계안 서술을 다단계 결재로 갱신 |
| `apis_rptlib_list.html` | §5 컴포넌트/상태 마크업 보강 (필요 시) |

---

## 8. 작업 전략

전략 A(토대 우선): ① 디자인 토대 → ② 컴포넌트/상태/접근성/wow → ③ 프로세스 정합.
디자인 토큰은 전역 자산이라 먼저 수렴하면 이후 작업이 그 위에서 일관되게 얹힌다. ③ 프로세스 정합은 토대와 독립적이라 병행 가능.

## 9. 비목표 / 가드레일

- ZyLab 기능 패리티 플로어(선행 설계 §4)는 **하나도 빼지 않는다** — 이번 작업은 수렴/정리이지 기능 제거가 아니다.
- 운영 자산(`mapis_lib/*`, `common.css`, `glass_engine.js`)은 **불가침** — rptlib 쪽에서만 수정.
- "예쁘게 만들려고 기능을 빼는 것" 금지.

---

## End
