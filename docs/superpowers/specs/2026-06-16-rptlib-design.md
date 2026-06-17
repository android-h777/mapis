# Technical Report Library — ZyLab 대체 프로토타입 설계 (spec)

작업일: 2026-06-16
모듈명: **Technical Report Library** (Momentive ZyLab® 기술보고서 지식 저장소 대체)

---

## 1. 목적과 철학

- **Technical Report Library**는 Momentive가 쓰는 **ZyLab®**(Global Technology 기술보고서 호스팅·공유·검색 시스템)을 대체하기 위한 프로토타입이다.
- **산출물 성격:** 연구원 피드백 수집용 *동작 프로토타입*(완제품 X). 모든 버튼에 실제(스크립트된) 액션. **시각 설득력 1순위, 엔진은 목업.**
- **북극성:** "검색하러 가는 콜드 DB" → **"들어가면 지식이 살아있는 허브"**. ELN의 "강제 숙제툴 X, 쓰고 싶은 도구 O" 철학의 연장.

## 2. 충실도(fidelity)와 정직한 범위 경계

- **시각 우선.** 접근통제 규칙은 *enforce하지 않는다* — 등급 배지·잠금 표시는 **"시각 정체성"으로만** 깔고 간다(색으로 구분되는 Class 1~4).
- **"기능적으로 더 진보"의 정의:** 더 잘 설계된 인터랙션을 *클릭 가능한 동작 데모*로 시연한다. 데이터·인증·검색엔진·AD그룹은 목업/큐레이션. 진짜 백엔드나 권한 enforcement는 만들지 않는다.
- **안티-퇴보 가드레일 = 기능 패리티 플로어(Feature-Parity Floor):** ZyLab이 하던 일은 **하나도 빠뜨리지 않는다.** 개선은 그 위에 얹는다. 예쁘게 만들려고 기능을 빼는 것은 금지(§4).

## 3. MAPIS 통합

- **MAPIS 모듈로 편입.** `apis_*` 네이밍·셸·내비 재사용.
- **파일 구성:**
  | 파일 | 역할 |
  |---|---|
  | `apis_rptlib_list.html` | Search Home (히어로) — 검색+발견 |
  | `apis_rptlib_pop.html` | Report Detail / Reading View — 상세·열람 |
  | `apis_rptlib_submit.html` | Guided Submit — 제출 |
  | `apis_rptlib_admin.html` | Admin Console — 인덱스·접근통제 매트릭스·감사로그 |
  | `css/rptlib_proto.css` | 모듈 전용 스타일 (eln_proto 패턴) |
  | `js/rptlib_proto.js` | 모듈 전용 동작 (목업 엔진) |
- **재사용 자산:** `css/common.css`·`css/mpm_common.css`, `js/glass_engine.js`(색수차·글래스 행 오버레이), Glass 디자인 토큰(색 유리, 입체 box-shadow, backdrop-filter, 5의 배수 spacing — `GLASS_DESIGN_GUIDE.md` 기준).

## 4. 기능 패리티 플로어 (ZyLab → Technical Report Library, 절대 빠뜨리지 않을 것)

- **지역 인덱스:** CN-Shanghai, DE-Leverkusen, IN-Bangalore, IT-Termoli, JP-Ohta, KR All Regions, Thailand, UK-Abingdon, US All Regions
- **메타 필터:** Date_Created, Country_Site_of_Origin, Document_Classification(Class 1~4), NPI, Keywords, Author, Business_Unit, Business_Segment
- **검색 결과 컬럼:** 등급 표시, document_title, document_num, document_type(TIS/TMR 등), country_site_of_origin, author_s
- **Search within results**(이전 결과 내 재검색)
- **Document Basket**(수집/내보내기) — 최소 시각적으로 유지
- **View / Download / Print**
- **제출(Upload)**

## 5. 화면 구성 (3 코어)

### 5-1. `apis_rptlib_list` — Search Home (히어로)
ZyLab의 익숙한 **2-pane 골격**(좌 필터 / 우 결과)을 유지하되 한 화면이 **두 상태**를 갖는다:
- **빈 상태(쿼리 입력 전) = Discovery Hub:** 결과 영역에 큐레이션 — *MPM 전체 최신 등록, 많이 참조된 리포트, 사이트/지역별 신규, 유형별 둘러보기*. (개인화는 "Your submissions" 작은 카드 하나 정도로 절제 — §8). → "살아있는 느낌".
- **검색 상태 = 결과 뷰:** 결과 카드/행(등급 배지, doc#, type, site, author), 정렬, 페이지네이션, basket 담기. → "우리 ZyLab인데 예뻐졌다".
- **좌측 패널:** 통합 검색바 + 지역 인덱스 **칩** + 메타 필터(접이식 facet). ZyLab의 산만한 체크박스+스크롤 폼을 정돈된 facet으로 재구성.
- **헤더:** MAPIS 셸 내비 + `Welcome [user]` + Help.

### 5-2. `apis_rptlib_pop` — Report Detail / Reading View
- **헤더:** 제목 · Report# · 등급 배지 · document_type.
- **메타 패널:** author, site, date, BU/segment, NPI, keywords, abstract.
- **본문:** PDF 프리뷰 목업(인라인) — ZyLab은 다운로드 강제, Technical Report Library는 **인라인 열람**.
- **액션:** 보기 / 다운로드 / 인쇄 / 공유 / basket 담기 / cite. 접근 상태는 **배지**로 표현(잠김=메타만).
- **관련 리포트** 섹션.

### 5-3. `apis_rptlib_submit` — Guided Submit
- **분류 의사결정 트리를 친근한 가이드**로 재해석(질문 몇 개 → 등급 *제안*, 강제 아님).
- **메타 입력 폼**(스마트 기본값) + **파일 업로드** + **Report# 미리보기**.
- **승인 상태 타임라인**(제출 → 검토 → 승인 → 게시). 이메일·IT티켓·72시간 대기를 인앱으로 가시화. → Technical Report Library의 가장 큰 개선 스토리.

### 5-4. `apis_rptlib_admin` — Admin Console
ZyIMAGE_Administrators 권한 화면(Image 9 기준). 규칙을 *enforce*하진 않지만 **관리 구조를 시각화**한다.
- **인덱스 관리:** 지역 인덱스 목록 CRUD(생성/수정/삭제), 인덱스별 문서 수.
- **접근통제 매트릭스:** AD그룹 × 등급 × 지역(예: `GG-Any-ZyimageUsers-KRClass3`)을 **색 유리 매트릭스**로. Class 4는 개인 단위 승인 목록.
- **Audit Trail:** 누가 언제 무엇을 view/download/print 했는지 로그(목업).
- **문서 관리:** 업로드 큐 / 메타데이터 편집 / 분류 변경.
→ 규칙을 못 보여주는 게 아쉬웠는데, **여기서 "접근통제가 이렇게 관리된다"를 매트릭스로 우아하게 시연** 가능.

## 6. ZyLab 대비 진보 기능 (시각적으로 시연)

| ZyLab (Before) | Technical Report Library (After) |
|---|---|
| textarea + 체크박스 + 스크롤 메타폼 | 통합 스마트 검색 한 줄 + facet 칩 |
| (발견 경험 없음, 검색만) | 빈 상태 Discovery Hub |
| 다운로드 강제 | 인라인 프리뷰 |
| 암호 같은 빨강/파랑 아이콘 | 명확한 색 배지 + 잠금 표시 |
| 검색 히스토리 빈약 | 저장된 검색 / 최근 검색 |
| 이메일·IT티켓·수동 발번 | 인앱 가이드 제출 + 상태 타임라인 |
| 관계 없음 | 관련 리포트 / 인용 연결 |

## 7. 시각 방향

- **MAPIS Glass 테마 준수:** 색 유리 상태표현, 색수차(conic) 시그니처, 입체 box-shadow, backdrop-filter, **5의 배수 spacing**.
- **등급 색 체계(초안, 디자인 단계에서 glass 팔레트에 맞춰 확정):** Class 1 = 공개 / Class 2 = 내부(중립) / Class 3 = 지역제한(앰버+잠금) / Class 4 = 고제한(레드+잠금).
- **UI 라벨은 영문 유지**(ZyLab·Momentive 글로벌 환경). 단 작업 대화는 한국어.

## 8. 데모 대상 · 목업 데이터

- **데모 대상 = 영어권 PM 다수**(특정 1인이 아님). → UI 라벨 영문, 그리고 **과한 개인화 지양**: "Welcome [name]" 배너나 "내 분야/내 제출" 중심 구성은 *한 사람*에게만 의미 있어 여러 PM 앞 데모엔 역효과.
- **로그인 정체성은 은은하게:** 상단 우측에 **아바타/이니셜 칩**만(요즘 패턴). "Welcome, ○○○" 배너는 포털 시대(=ZyLab 시대) 잔재라 **제거**.
- **Discovery는 조직 단위 콘텐츠 중심:** 누가 봐도 인상적인 *MPM 전체 최신·많이 참조됨·사이트별 신규·유형별 둘러보기*. 개인화는 "Your submissions" 작은 카드 하나로 절제.
- 스크린샷 기반 실제 느낌의 리포트 약 20건(예: `LEV-20-27` Liquid Silicone Rubber, `TT-11-16` Hydrosilylation… 등 실제 예시 활용), 8개 지역, 4등급, TIS/TMR 등 type, 저자·사이트 포함.

## 9. 범위 외 (이번 프로토타입 제외)

- **Redaction**(문서 내 민감 영역 마스킹) — 니치·고비용, PM 피드백 가치 낮아 제외.
- **Visualization**(검색결과/코퍼스 차트 분석) — 코어 제외. 단 PM 청중이 대시보드를 선호하므로 결과/Discovery에 *작은 분석 패널*로 옵션 추가 여지만 남김.
- 실제 인증 / AD그룹 / 백엔드 / 규칙 enforcement
- (관리자 콘솔은 §5-4로 **범위 포함**으로 변경됨)

## 10. 빌드 순서

1. `apis_rptlib_list` (히어로) — 빈 상태 → 검색 상태
2. `apis_rptlib_pop` (상세)
3. `apis_rptlib_submit` (제출)
4. `apis_rptlib_admin` (관리자 콘솔)

각 단계 시각 검증 후 다음으로.

---

## End
