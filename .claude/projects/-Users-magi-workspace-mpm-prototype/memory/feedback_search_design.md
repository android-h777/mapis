---
name: Search page design conventions
description: 통합검색 페이지 디자인 규칙 - 레이아웃/탭/리스트/우측Summary 구조
type: feedback
---

통합검색 페이지(apis_search.html)는 다른 리스트 페이지와 동일한 구조를 따른다.

**Why:** 프로토타입 전체의 통일감 유지가 중요. 별도 커스텀 스타일보다 기존 패턴 재사용 선호.

**How to apply:**
- **헤더**: 다른 리스트 페이지(npdi_list 등)와 동일 구조. `#mainSrchInput`, notiArea 포함
- **탭**: `npdiTabMenu` 클래스 + Materialize `tabs`. 탭 순서: All → SNPI → CNPI → NPT → Tech Support → Raw Material Hub → FMEA
- **탭 색상**: active 텍스트/indicator `#7391c9`, cntBadge 텍스트만(배경 없음), active cntBadge `#7391c9`, 비활성 `#bbb`, 숫자 괄호 형태 `(N)`
- **레이아웃**: `contArea typeList type2 typeSearch` — 좌/우 분할
- **좌측 리스트**: 검색엔진 스타일. 카테고리 제목(srchCateTitle) + 항목(pjTit + srchMeta + srchDesc). All탭 5건 제한 + "N건 더보기"
- **검색어 하이라이트**: `#bb2649` viva색 볼드 (srchHit 클래스)
- **우측 Summary**: 카테고리별 다른 양식
  - SNPI: 기본정보(Segment/MGPP/Status/Leader 등) + TimeLine차트 + Revenue차트
  - CNPI: 기본정보(Customer/Segment/MGPP 등) + TimeLine차트 + Revenue차트
  - NPT: 기본정보(Segment/Status/Leader) + TimeLine차트 + Production Forecast차트
  - Tech: 기본정보(Department/Status/Leader) + TimeLine차트
  - RM: 기본정보(Site/Status/Creator) + Composition테이블 + Properties테이블
  - FMEA: 기본정보(Type/Site/Owner) + FMEA트리맵
- **CSS**: 인라인 style 쓰지 말고 mpm_common.css에 클래스로 정의
