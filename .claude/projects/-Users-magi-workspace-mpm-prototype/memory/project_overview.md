---
name: MPM Prototype Project Overview
description: MAPIS/MPM/SFA 시스템의 프론트엔드 UI 프로토타입 - 화학/실리콘 제조업 도메인
type: project
---

## 프로젝트 개요

MPM (Manufacturing Process Management) 시스템의 프론트엔드 UI 프로토타입 프로젝트.
백엔드 없이 HTML/CSS/JS만으로 구성된 정적 프로토타입이며, 실제 데이터 연동 없이 하드코딩된 샘플 데이터 사용.

## 주요 시스템 모듈

1. **APIS (Advanced Process Information System)** - 메인 시스템
   - `apis_main.html` - 메인 대시보드
   - `apis_dash.html` - 대시보드 (매출 차트 등)
   - `apis_fmea_list/pop.html` - FMEA (Failure Mode and Effects Analysis) 관리
   - `apis_npdi_list/pop.html` - NPDI (New Product Development & Introduction)
   - `apis_npt_list/pop.html` - NPT (New Product Technology)
   - `apis_item_list/pop.html` - 아이템/자재 관리
   - `apis_custom_list/pop.html` - 고객 관리
   - `apis_tech_list/pop.html` - 기술 관리
   - `apis_proposal_list/pop.html` - 제안서 관리
   - `apis_coc.html` - CoC (Certificate of Compliance)
   - `apis_psa.html` - PSA (Product Safety Assessment) 관리
   - `apis_intro.html` - 소개 페이지

2. **SFA (Sales Force Automation)** - 영업 관리
   - `mpm_sfa.html` - SFA 상세 화면
   - `mpm_sfa_main.html` - SFA 메인 (매출 Funnel 차트, 실적 현황)
   - `mpm_sfa_list.html` - SFA 목록
   - `mpm_sfa_insight.html` - SFA 인사이트

3. **MFMEA** - 제조 FMEA
   - `mfmea_intro.html`, `mfmea_list.html`, `mfmea_pop.html`

4. **기타**
   - `hr.html` - 인사 관련
   - `projectPopup.html` - 프로젝트 팝업
   - `fml_view.html` - 포뮬러 뷰

## 기술 스택

- **CSS 프레임워크**: Materialize CSS
- **JS 라이브러리**: jQuery 3.3.1, Highcharts (차트), RealGrid (데이터 그리드), TUI Grid, D3.js v7
- **애니메이션**: animate.css
- **기타**: jquery.inputmask, jquery.animateNumber, simple-scrollbar, Hoo-gantt (간트차트)
- **폰트**: Material Icons, Google Material Symbols, 커스텀 폰트 (SF-Light 등)

## ERD (데이터베이스 설계)

`.erd.json` 파일들로 DB 스키마 설계가 포함됨:
- `mapis2_cnpi.erd.json` - CNPI 모듈
- `mapis2_common.erd.json` - 공통 모듈
- `mapis2_snpi.erd.json` - SNPI 모듈
- `mapis3_approval.erd.json` - 결재 모듈
- `mapis3_fmea.erd.json` - FMEA 모듈
- `mapis3_notice.erd.json` - 공지 모듈
- `mapis3_npt.erd.json` - NPT 모듈
- `mapis3_ts.erd.json` - TS 모듈
- `mapis_mst.erd.json` - 마스터 데이터
- `mapis_rmhub.erd.json` - RM Hub
- `mapis_sys.erd.json` - 시스템
- `mapis_etc.erd.json` - 기타

## 도메인

화학/실리콘 제조업 (실리콘, 실란, 특수화학 소재). 자재 데이터에 Silicone, Silane, Oil, Resin 등의 화학 소재 코드가 포함되어 있음.

**Why:** 이 프로젝트는 제조업 프로세스 관리 시스템의 화면 설계 프로토타입으로, 실제 구현 전 UI/UX를 검증하기 위한 목적.
**How to apply:** UI 수정 시 Materialize CSS 프레임워크 규칙을 따르고, 기존 CSS 클래스 네이밍 컨벤션을 유지할 것. 차트는 Highcharts, 그리드는 RealGrid 기반으로 작업.
