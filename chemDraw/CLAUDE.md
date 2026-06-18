# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

APIS MPM ChemDraw — a static HTML/CSS/JavaScript web application for chemical molecule drawing and new product development (NPDI) management. Part of the KCC World APIS enterprise system. The UI is primarily in Korean.

## Tech Stack

- **No build system** — plain HTML files served directly (no npm, webpack, or bundler)
- **jQuery 3.3.1** for DOM manipulation and AJAX
- **Materialize CSS v1.0.0** for Material Design components
- **RealGrid / TUI-Grid** for enterprise data grids
- **Highcharts / D3.js v7** for charts and visualizations
- **Backend**: Java REST API at `https://apis.kccworld.co.kr`

## Development

No build, lint, or test commands. Open HTML files directly in a browser or serve them via a local HTTP server. Changes are deployed by copying static files to the web server.

## Architecture

**Page-per-feature model**: each HTML file is a self-contained single-page app with inline `<script>` blocks.

Key pages:
- `apis_chemDraw_list.html` — molecule list with 2D/3D chemical editor
- `apis_npdi_list.html` — NPDI list view
- `apis_npdi_pop.html` — NPDI detail form/popup (~5700 lines, largest file)

**Shared utilities** (`js/apis_util.js`):
- `window.au` namespace with helpers: `au.ajaxPost()`, `au.ajaxPost2()`, `au.ajaxPostNonAsync()`
- Loading spinner management via `window.globalCnt`
- Alert/notification wrappers, file upload helpers

**Modal system**: custom open/close via `openModal(modal)` / `closeModal(modal)` with `.modal-trigger` class and `.modal-overlay` backdrop.

**Tab system**: `.newAppleTab` with animated `.tabBg` sliding indicator.

## CSS Conventions

- Base layer: `materialize.css`
- Module-specific: `chem_common.css`, `mpm_common.css`, `mfmea_common.css`, etc.
- Utility classes: `.bdT1` (border-top), `.bdL1` (border-left), `.al/.ac/.ar` (text align), `.vaT` (vertical-align top), `.bdRad10` (border-radius)
- State classes: `.on`, `.blur`

## Key Directories

- `css/` — stylesheets including Materialize and module-specific themes
- `js/` — jQuery, Materialize, grid libraries, utilities
- `js/realgrid/` — RealGrid component with license (`realgrid-lic.js`)
- `fonts/` — Roboto, Noto Sans Korean
- `img/` — logos, backgrounds, module images
