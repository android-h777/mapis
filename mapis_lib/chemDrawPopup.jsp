<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<link rel="stylesheet" type="text/css" href="/css/chem/materialize.css">
<link rel="stylesheet" type="text/css" href="/css/chem/chem_common.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
<link href="/css/google/google_material_icons.css" rel="stylesheet">
<link href="/css/google/google_material_symbols_outlined.css" rel="stylesheet">
<script type="text/javascript" src="/js/jquery-1.12.0.min.js"></script> 
<script type="text/javascript" src="/js/apis++/materialize.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script> 
<style>
/* autocomplete dropdown */
.cd-ac-dropdown { position: absolute; top: 100%; left: 0; width: 420px; max-height: 460px; overflow-y: auto; background: #fff; border: 1px solid #ccc; border-radius: 6px; box-shadow: 0 4px 16px rgba(0,0,0,0.18); z-index: 10000; display: none; margin-top: 4px; }
.cd-ac-item { display: flex; align-items: center; gap: 10px; padding: 6px 10px; cursor: pointer; border-bottom: 1px solid #f0f0f0; transition: background 0.15s; }
.cd-ac-item:last-child { border-bottom: none; }
.cd-ac-item:hover { background: #e3f2fd; }
.cd-ac-thumb { width: 160px; height: 160px; border: 1px solid #e0e0e0; border-radius: 4px; background: #fafafa; flex-shrink: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.cd-ac-thumb svg { width: 100%; height: 100%; }
.cd-ac-info { flex: 1; min-width: 0; }
.cd-ac-info .cd-ac-formula { font-size: 12px; font-weight: 600; color: #1a237e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cd-ac-info .cd-ac-meta { font-size: 10px; color: #999; margin-top: 2px; }
.cd-ac-item.cd-ac-selected { background: #bbdefb; outline: 2px solid #1565c0; }
.cd-ac-empty { padding: 16px; text-align: center; color: #999; font-size: 12px; }
/* CAS-NO search result list */
.cd-cas-result-list { position: absolute; top: 100%; left: 0; width: 420px; max-height: 400px; overflow-y: auto; background: #fff; border: 1px solid #ccc; border-radius: 6px; box-shadow: 0 4px 16px rgba(0,0,0,0.18); z-index: 10000; display: none; margin-top: 4px; }
.cd-cas-item { display: flex; align-items: center; gap: 10px; padding: 6px 10px; cursor: pointer; border-bottom: 1px solid #f0f0f0; font-size: 12px; color: #333; transition: background 0.15s; }
.cd-cas-thumb { width: 120px; height: 120px; border: 1px solid #e0e0e0; border-radius: 4px; background: #fafafa; flex-shrink: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.cd-cas-thumb svg { width: 100%; height: 100%; }
.cd-cas-info { flex: 1; min-width: 0; }
.cd-cas-info .cd-cas-casno { font-size: 12px; font-weight: 600; color: #1a237e; }
.cd-cas-info .cd-cas-engname { color: #888; font-size: 11px; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cd-cas-info .cd-cas-meta { font-size: 10px; color: #999; margin-top: 2px; }
.cd-cas-item:last-child { border-bottom: none; }
.cd-cas-item:hover { background: #e3f2fd; }
.cd-cas-item.cd-cas-selected { background: #bbdefb; outline: 2px solid #1565c0; }
.cd-cas-empty { padding: 16px; text-align: center; color: #999; font-size: 12px; }
/* Context Menu */
.cd-context-menu { position: absolute; background: #fff; border: 1px solid #ccc; border-radius: 6px; box-shadow: 0 4px 16px rgba(0,0,0,0.18); z-index: 10000; min-width: 140px; padding: 4px 0; }
.cd-ctx-item { padding: 8px 16px; cursor: pointer; font-size: 13px; color: #333; display: flex; align-items: center; transition: background 0.15s; }
.cd-ctx-item:hover { background: #e3f2fd; }
.cd-ctx-sub-wrapper { position: relative; }
.cd-ctx-submenu { display: none; position: absolute; left: 100%; top: -4px; background: #fff; border: 1px solid #ccc; border-radius: 6px; box-shadow: 0 4px 16px rgba(0,0,0,0.18); min-width: 120px; padding: 4px 0; z-index: 10001; }
.cd-ctx-sub-wrapper:hover > .cd-ctx-submenu { display: block; }
.cd-ctx-submenu .cd-ctx-item { padding: 7px 14px; font-size: 12px; }
.cd-ctx-submenu .cd-ctx-item.cd-ctx-active { background: #e3f2fd; font-weight: 600; color: #1565c0; }
.cd-ctx-separator { height: 1px; background: #e0e0e0; margin: 4px 8px; }
/* Custom Element Overlay — bracket overlay 동일 스타일 */
</style>

<input type="hidden" id="SEQ_CHEMDRAW" value="" />


<header class="navbar-fixed">
	<nav>
		<div class="headerTit">
			<svg width="28" height="28" viewBox="0 0 34 34">
				<defs>
					<linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stop-color="#fff" stop-opacity="0.75"/>
						<stop offset="45%" stop-color="#fff" stop-opacity="0.15"/>
						<stop offset="100%" stop-color="#fff" stop-opacity="0.5"/>
					</linearGradient>
					<linearGradient id="hexShine" x1="20%" y1="0%" x2="60%" y2="60%">
						<stop offset="0%" stop-color="#fff" stop-opacity="0.9"/>
						<stop offset="100%" stop-color="#fff" stop-opacity="0"/>
					</linearGradient>
				</defs>
				<polygon points="17,2 30,9.5 30,24.5 17,32 4,24.5 4,9.5" fill="url(#hexGrad)" stroke="rgba(255,255,255,0.9)" stroke-width="1.5" stroke-linejoin="round"/>
				<polygon points="17,2 30,9.5 30,15 10,7" fill="url(#hexShine)" opacity="0.5"/>
				<circle cx="17" cy="17" r="7" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.3"/>
			</svg>
			<span class="headerTitText"><span style="font-family:'SUIT-Light';opacity:0.85;">Chem</span> <span style="font-family:'SUIT-Bold';">Studio</span></span>
		</div>
	</nav>
</header>
<article class="contArea">
	<section class="contList">
		<div class="headArea">
			<div class="srchArea" id="cdSearchWrap">
				<input type="text" id="searchChemDraw" class="browser-default" placeholder="Molecular Formula 검색" oninput="fnSearchChemDraw();">
				<i class="material-icons" onclick="fnSearchChemDraw()">search</i>
			</div>
			<i class="material-icons" id="btnBookmarkFilter" title="즐겨찾기 조회" style="cursor:pointer; font-size:28px; color:#aaa; transition:color 0.25s ease, text-shadow 0.25s ease, filter 0.25s ease; margin-left:15px;">star</i>
			<div style="margin-left:auto;">
				<a id="chemDrawBtn" class="waves-effect waves-light hBtn modal-trigger" href="javascript:fnOpenNewChemDraw();">
					<i class="material-icons left">add</i>New Editor
				</a>
			</div>
		</div>
		<div class="h_grid_list hScroll" id="chemDrawGridList" style="max-height: calc(100vh - 160px); overflow-x: hidden; overflow-y: auto;">
			<div style="padding:40px; text-align:center; color:#999; grid-column: 1/-1;">Loading...</div>
		</div>
	</section>
</article>

<!-- ChemDraw Modal (glassBox) -->
<article id="fmlChemDrawWin" class="glassBox modal" data-view="" data-btn="chemDrawBtn" style="width: 95%;height: 100vh;display: none;opacity: 0;top: 30px;max-height: calc(100vh - 60px);">
	<div class="modal-content">
		<div class="infoModeArea">
			<div class="chemInfoArea">
				<div class="chemNmWrap">
					<input type="text" id="chemDrawMolNm" class="chemNmInput" placeholder="Molecular Name" autocomplete="off" />
					<span class="focus-border"></span>
				</div>
				<div class="chemNmWrap ml10">
					<input type="text" id="chemDrawCasNo" class="chemNmInput" placeholder="CAS-NO" autocomplete="off" />
					<span class="focus-border"></span>
					<div id="cdCasNoDropdown" class="cd-cas-result-list"></div>
				</div>
			</div>
			<div style="display:flex; align-items:center; gap:20px;"> 
				<div class="chemStats" id="chemDrawStats">
					<span class="chemFormula">-</span>
				</div>
				<div class="chemMwArea" id="chemDrawMW">
					<span class="chemMwValue">0</span>
					<span class="chemMwLabel">g/mol</span>
				</div>
				<div class="newAppleTab" id="cdMainTabs"> 
					<ul>
						<li class="waves-effect waves-hColor on" data-tab="editor">2D Editor</li>
						<li class="waves-effect waves-hColor" data-tab="2dview">2D View</li>
						<li class="waves-effect waves-hColor" data-tab="3dview">3D View</li>
						<div class="tabBg" style="left: 0px;"></div>
					</ul>
				</div>
			</div>
		</div>
		<div class="editorModeArea">
			<!-- 도구 바 (가로 상단) -->
			<div class="toolsArea" id="chemDrawToolsArea">
				<!-- 2D Editor 도구 -->
				<div id="cd2DToolsContent" style="display:flex; width:100%; justify-content:space-between; align-items:center;">
					<div class="toolsCont" id="cdSelectOptions">
						<div class="btnArea">
							<div class="boxTit">Elements</div>
							<div id="cdElementSlots"></div>
							<div class="btnBox waves-effect waves-hColor" id="cdAddElementBtn" title="주기율표에서 원소 추가">+</div>
							<div class="boxTit">H</div>
							<div class="btnBox waves-effect waves-hColor on" data-hcount="auto">Auto</div>
							<div class="btnBox waves-effect waves-hColor" data-hcount="0">0</div>
							<div class="btnBox waves-effect waves-hColor" data-hcount="1">1</div>
							<div class="btnBox waves-effect waves-hColor" data-hcount="2">2</div>
							<div class="btnBox waves-effect waves-hColor" data-hcount="3">3</div>
						</div>
						<div class="btnArea">
							<div class="boxTit">Bond</div>
							<div class="btnBox waves-effect waves-hColor" data-bondtype="single"><svg width="18" height="18" viewBox="0 0 18 18"><line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" stroke-width="2"/></svg></div>
							<div class="btnBox waves-effect waves-hColor" data-bondtype="double"><svg width="18" height="18" viewBox="0 0 18 18"><line x1="3" y1="7" x2="15" y2="7" stroke="currentColor" stroke-width="2"/><line x1="3" y1="11" x2="15" y2="11" stroke="currentColor" stroke-width="2"/></svg></div>
							<div class="btnBox waves-effect waves-hColor" data-bondtype="triple"><svg width="18" height="18" viewBox="0 0 18 18"><line x1="3" y1="5" x2="15" y2="5" stroke="currentColor" stroke-width="1.5"/><line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" stroke-width="1.5"/><line x1="3" y1="13" x2="15" y2="13" stroke="currentColor" stroke-width="1.5"/></svg></div>
						</div>
						<div class="btnArea">
							<div class="boxTit">Font</div>
							<div class="btnBox waves-effect waves-hColor on" data-font="Arial">Arial</div>
							<div class="btnBox waves-effect waves-hColor" data-font="Tahoma">Tahoma</div>
						</div>
						<div class="btnArea">
							<div class="boxTit">Radical</div>
							<div class="btnBox waves-effect waves-hColor ringBtn" data-ring="5s" title="Pentagon (single)"><svg viewBox="0 0 24 24" width="18" height="18"><polygon points="12,3 22,10 19,21 5,21 2,10" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></div>
							<div class="btnBox waves-effect waves-hColor ringBtn" data-ring="5d" title="Pentagon (double)"><svg viewBox="0 0 24 24" width="18" height="18"><polygon points="12,3 22,10 19,21 5,21 2,10" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="13" r="4.5" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2"/></svg></div>
							<div class="btnBox waves-effect waves-hColor ringBtn" data-ring="6s" title="Hexagon (single)"><svg viewBox="0 0 24 24" width="18" height="18"><polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></div>
							<div class="btnBox waves-effect waves-hColor ringBtn" data-ring="6d" title="Hexagon (double/benzene)"><svg viewBox="0 0 24 24" width="18" height="18"><polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2"/></svg></div>
						</div>
					</div>
					<div class="btnArea">
						<div class="btnBox waves-effect waves-hColor disabled" id="cdUndoBtn" onclick="cdUndo()" title="Undo (Ctrl+Z)"><i class="material-icons">undo</i></div>
						<div class="btnBox waves-effect waves-hColor disabled mr10" id="cdRedoBtn" onclick="cdRedo()" title="Redo (Ctrl+Y)"><i class="material-icons">redo</i></div>
						<div class="btnBox waves-effect waves-hColor on mr0" id="cdGridToggle" onclick="cdToggleGrid()" title="Grid"><i class="material-icons">grid_on</i></div>
					</div>
				</div>
				<!-- 3D Editor 도구 (removed) -->
			</div>
			<!-- 2D Editor 캔버스 -->
			<div class="editorArea" id="chemDrawEditorArea">
				<div class="aiChatPanel collapsed" id="aiChatPanel">
					<div class="aiResize aiResize-n"></div>
					<div class="aiResize aiResize-s"></div>
					<div class="aiResize aiResize-w"></div>
					<div class="aiResize aiResize-e"></div>
					<div class="aiResize aiResize-nw"></div>
					<div class="aiResize aiResize-ne"></div>
					<div class="aiResize aiResize-sw"></div>
					<div class="aiResize aiResize-se"></div>
					<div class="aiChatHeader" id="aiChatDragHandle">
						<div class="aiChatLogo">
							<i class="material-icons">auto_awesome</i>
							<span>AI Assistant</span>
						</div>
						<button class="aiChatToggle" onclick="this.closest('.aiChatPanel').classList.toggle('collapsed')">
							<i class="material-icons">close</i>
						</button>
					</div>
					<div class="aiChatMessages" id="aiChatMessages">
						<div class="aiMsg bot">
							<div class="aiMsgAvatar"><i class="material-icons">auto_awesome</i></div>
							<div class="aiMsgBubble">안녕하세요! 분자 구조를 그려드릴게요. 원하는 분자를 말씀해주세요.<br><span class="aiMsgHint">예: "벤젠 그려줘", "OH기 추가해줘"</span></div>
						</div>
					</div>
					<div class="aiChatInput">
						<input type="text" id="aiChatInputField" placeholder="분자 구조를 설명해주세요..." onkeydown="if(event.key==='Enter')sendAiChat()">
						<button onclick="sendAiChat()"><i class="material-icons">send</i></button>
					</div>
				</div>
				<div class="srchArea">
					<input type="text" id="cdSearchInput" placeholder="Formula / 명칭 / CAS-NO 통합검색" autocomplete="off">
					<div class="cd-ac-dropdown" id="cdSearchDropdown"></div>
				</div>
				<button class="aiChatOpenBtn" onclick="ensureAiWs();this.closest('.editorArea').querySelector('.aiChatPanel').classList.remove('collapsed')">
					<i class="material-icons">auto_awesome</i>
				</button>
				<div class="aiDrawingLoader" id="aiDrawingLoader">
					<div class="auroraLayer"></div>
					<div class="auroraLayer2"></div>
					<div class="glassCard">
						<div class="molAnim">
							<svg viewBox="0 0 120 120">
								<defs>
									<linearGradient id="aiAuroraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
										<stop offset="0%" stop-color="#8364ff"/>
										<stop offset="35%" stop-color="#50c8ff"/>
										<stop offset="65%" stop-color="#64ffda"/>
										<stop offset="100%" stop-color="#ff80c8"/>
									</linearGradient>
									<radialGradient id="aiAtomGrad">
										<stop offset="0%" stop-color="#a78bfa"/>
										<stop offset="50%" stop-color="#60a5fa"/>
										<stop offset="100%" stop-color="#34d399"/>
									</radialGradient>
								</defs>
								<line class="bond" x1="60" y1="20" x2="93" y2="39"/>
								<line class="bond" x1="93" y1="39" x2="93" y2="77"/>
								<line class="bond" x1="93" y1="77" x2="60" y2="96"/>
								<line class="bond" x1="60" y1="96" x2="27" y2="77"/>
								<line class="bond" x1="27" y1="77" x2="27" y2="39"/>
								<line class="bond" x1="27" y1="39" x2="60" y2="20"/>
								<circle class="atom" cx="60" cy="20" r="5"/>
								<circle class="atom" cx="93" cy="39" r="5"/>
								<circle class="atom" cx="93" cy="77" r="5"/>
								<circle class="atom" cx="60" cy="96" r="5"/>
								<circle class="atom" cx="27" cy="77" r="5"/>
								<circle class="atom" cx="27" cy="39" r="5"/>
							</svg>
						</div>
						<div class="loaderText" id="aiLoaderText">AI가 분자 구조를 그리고 있습니다...</div>
						<div class="loaderSub" id="aiLoaderSub">잠시만 기다려주세요</div>
						<div class="loaderBar"><div class="loaderBarFill"></div></div>
					</div>
				</div>
				<div class="editor" id="chemDrawContainer">
					<svg id="chemDrawSvg"></svg>
					<div id="cdContextMenu" class="cd-context-menu" style="display:none;">
						<div class="cd-ctx-item" id="cdCtxAlign" style="display:none;"><i class="material-icons" style="font-size:16px; vertical-align:middle; margin-right:6px;">auto_fix_high</i>Snap to Grid</div>
						<div class="cd-ctx-item" id="cdCtxRotate" style="display:none;"><i class="material-icons" style="font-size:16px; vertical-align:middle; margin-right:6px;">rotate_right</i>회전</div>
						<div class="cd-ctx-item" id="cdCtxFlipH" style="display:none;"><i class="material-icons" style="font-size:16px; vertical-align:middle; margin-right:6px;">flip</i>좌우 반전</div>
						<div class="cd-ctx-item" id="cdCtxFlipV" style="display:none;"><i class="material-icons" style="font-size:16px; vertical-align:middle; margin-right:6px;">swap_vert</i>상하 반전</div>
						<div class="cd-ctx-item" id="cdCtxBracket" style="display:none;"><i class="material-icons" style="font-size:16px; vertical-align:middle; margin-right:6px;">code</i>Bracket 추가</div>
						<div class="cd-ctx-item" id="cdCtxBracketAlign" style="display:none;"><i class="material-icons" style="font-size:16px; vertical-align:middle; margin-right:6px;">align_vertical_center</i>Bracket 정렬</div>
						<div class="cd-ctx-item cd-ctx-sub-wrapper" id="cdCtxCharge" style="display:none;"><i class="material-icons" style="font-size:16px; vertical-align:middle; margin-right:6px;">flash_on</i>전하 상태<span style="margin-left:auto;opacity:0.45;font-size:11px">&#9656;</span>
							<div class="cd-ctx-submenu">
								<div class="cd-ctx-item" data-charge="1"><span style="color:#e53935;font-weight:700;margin-right:6px;">⊕</span>양전하 (⊕)</div>
								<div class="cd-ctx-item" data-charge="-1"><span style="color:#1565c0;font-weight:700;margin-right:6px;">⊖</span>음전하 (⊖)</div>
								<div class="cd-ctx-item" data-charge="2"><span style="color:#e53935;font-weight:700;margin-right:6px;">+</span>양전하 (+)</div>
								<div class="cd-ctx-item" data-charge="-2"><span style="color:#1565c0;font-weight:700;margin-right:6px;">&minus;</span>음전하 (&minus;)</div>
								<div class="cd-ctx-separator"></div>
								<div class="cd-ctx-item" data-charge="0"><span style="color:#999;margin-right:6px;">&#9675;</span>없음</div>
							</div>
						</div>
						<div class="cd-ctx-separator" style="display:none;" id="cdCtxSep1"></div>
						<div class="cd-ctx-item" id="cdCtxCopy" style="display:none;"><i class="material-icons" style="font-size:16px; vertical-align:middle; margin-right:6px;">content_copy</i>복사<span style="float:right;opacity:0.45;font-size:11px">Ctrl+C</span></div>
						<div class="cd-ctx-item" id="cdCtxCut" style="display:none;"><i class="material-icons" style="font-size:16px; vertical-align:middle; margin-right:6px;">content_cut</i>잘라내기<span style="float:right;opacity:0.45;font-size:11px">Ctrl+X</span></div>
						<div class="cd-ctx-item" id="cdCtxPaste" style="display:none;"><i class="material-icons" style="font-size:16px; vertical-align:middle; margin-right:6px;">content_paste</i>붙여넣기<span style="float:right;opacity:0.45;font-size:11px">Ctrl+V</span></div>
						<div class="cd-ctx-item" id="cdCtxResetSize" style="display:none;"><i class="material-icons" style="font-size:16px; vertical-align:middle; margin-right:6px;">format_size</i>크기 초기화</div>
						<div class="cd-ctx-separator"></div>
						<div class="cd-ctx-item" id="cdCtxDelete"><i class="material-icons" style="font-size:16px; vertical-align:middle; margin-right:6px;">delete</i>삭제</div>
					</div>
					<div id="chemDrawStatus" class="cd-status-bar" style="display:none;"></div>
					<div id="chemDrawEmpty" class="cd-empty-state">
						<div class="ac" style="color:#bbb;">
							<i class="material-icons font50" style="color:#ddd;">science</i>
							<p class="font16 mt10">Draw molecular structure here</p>
							<p class="font12 mt5">Use Atom tool to place atoms, Bond tool to connect</p>
						</div>
					</div>
				</div>
			</div>
			<!-- 2D View -->
			<div class="editorArea" id="chemDraw2DViewArea" style="display:none;">
				<div class="editor" id="chemDraw2DViewContainer">
					<svg id="chemDraw2DViewSvg"></svg>
				</div>
				<div id="chemDraw2DViewEmpty" class="cd-empty-state">
					<div class="ac" style="color:#bbb;">
						<i class="material-icons font50" style="color:#ddd;">visibility</i>
						<p class="font16 mt10">2D Molecular View</p>
						<p class="font12 mt5">Draw a molecule in 2D Editor first</p>
					</div>
				</div>
			</div>
			<!-- 3D Editor (removed) -->
			<!-- 3D View -->
			<div class="editorArea" id="chemDraw3DViewArea" style="display:none;">
				<div class="editor" id="chemDraw3DViewMount" style="background:#f0f2f5;"></div>
				<div id="chemDraw3DViewEmpty" class="cd-empty-state">
					<div class="ac" style="color:#bbb;">
						<i class="material-icons font50" style="color:#ddd;">3d_rotation</i>
						<p class="font16 mt10">3D Molecular View</p>
						<p class="font12 mt5">Draw a molecule first, then view here with auto-rotation</p>
					</div>
				</div>
				<div id="chemDraw3DViewControls" class="cd-3d-controls" style="display:none;">Drag: rotate / Scroll: zoom</div>
			</div>
			<div class="editorStatusBar">
				<span class="sbKey">드래그</span> 이동 <span class="sbDiv">|</span> <span class="sbKey">더블클릭</span> 속성변경 <span class="sbDiv">|</span> <span class="sbKey">Del</span> 삭제 <span class="sbDiv">|</span> <span class="sbKey">Ctrl+클릭</span> 개별선택 <span class="sbDiv">|</span> <span class="sbKey">Shift+클릭</span> 그룹선택 <span class="sbDiv">|</span> <span class="sbKey">Shift+드래그</span> 수평이동(그룹)/각도스냅(단일) <span class="sbDiv">|</span> <span class="sbKey">Ctrl+A</span> 전체선택 <span class="sbDiv">|</span> <span class="sbKey">Ctrl+C/V</span> 복사/붙여넣기 <span class="sbDiv">|</span> <span class="sbKey">Ctrl+Z/Y</span> 실행취소/재실행 <span class="sbDiv">|</span> <span class="sbKey">Ctrl+휠</span> 확대축소 <span class="sbDiv">|</span> <span class="sbKey">우클릭</span> 메뉴
			</div>
		</div>
		<div class="modalBtnArea">
			<div class="dpFlex">
				<div id="cdClearBtn"><a class="waves-effect waves-light hBtn hViva color" onclick="cdClearAll();"><i class="material-icons left">border_clear</i>Clear</a></div>
				<div id="cdCopyBtn" style="display:none;"><a class="waves-effect waves-light hBtn hBlue ml10" onclick="cdCopyImage();"><i class="material-icons left">content_copy</i>Copy</a></div>
				<div id="cdDownloadBtn" style="display:none;"><a class="waves-effect waves-light hBtn hGreen ml10" onclick="cdDownloadImage();"><i class="material-icons left">file_download</i>Download</a></div>
				<div id="cdCopyToNewBtn" style="display:none;"><a class="waves-effect waves-light hBtn hViva ml10" onclick="cdCopyToNew();"><i class="material-icons left">file_copy</i>Copy to New</a></div>
			</div>
			<div class="dpFlex">
				<div id="cdSaveBtn"><a class="waves-effect waves-light hBtn mr10" onclick="fnSaveChemDraw();"><i class="material-icons left">save</i>Save</a></div>
				<div><a class="waves-effect waves-light hBtn hGrey close"><i class="material-icons left">close</i>Close</a></div>
			</div>
		</div>
	</div>
	<!-- Periodic Table Overlay -->
	<div id="cdPeriodicTableOverlay">
		<div id="cdPeriodicTableModal">
			<div class="pt-header">
				<span class="pt-title">Periodic Table of Elements</span>
				<span class="pt-info" id="cdPTInfo">원소를 클릭하면 도구 모음에 추가됩니다</span>
				<span class="pt-close" id="cdPTClose"><i class="material-icons">close</i></span>
			</div>
			<div class="pt-grid" id="cdPTGrid"></div>
			<div class="pt-legend" id="cdPTLegend"></div>
		</div>
	</div>
	<!-- Add Element Option Popup (주기율표 / 직접추가) -->
	<div id="cdAddElementPopup" style="display:none; position:absolute; z-index:10001; background:#fff; border:1px solid #ccc; border-radius:8px; box-shadow:0 4px 16px rgba(0,0,0,0.18); padding:4px 0; min-width:140px;">
		<div class="cd-ctx-item" id="cdAddElPT"><i class="material-icons" style="font-size:16px; vertical-align:middle; margin-right:6px;">grid_view</i>주기율표 추가</div>
		<div class="cd-ctx-item" id="cdAddElCustom"><i class="material-icons" style="font-size:16px; vertical-align:middle; margin-right:6px;">edit</i>직접 추가</div>
	</div>
	<!-- Custom Element Input Modal -->
	<div id="cdCustomElOverlay">
		<div id="cdCustomElModal">
			<div class="bk-header">
				<span class="bk-title">직접 추가</span>
				<span class="bk-close" id="cdCustomElClose"><i class="material-icons">close</i></span>
			</div>
			<div class="bk-body">
				<input type="text" id="cdCustomElInput" class="bk-input" placeholder="직접 입력 (R, Me, Et, X ...)" autocomplete="off" maxlength="10">
			</div>
			<div class="bk-footer">
				<button class="bk-btn bk-ok" id="cdCustomElOk">OK</button>
				<button class="bk-btn bk-cancel" id="cdCustomElCancel">Close</button>
			</div>
		</div>
	</div>
	<!-- Bracket subscript modal -->
	<div id="cdBracketOverlay">
		<div id="cdBracketModal">
			<div class="bk-header">
				<span class="bk-title">Bracket Subscript</span>
				<span class="bk-close" id="cdBKClose"><i class="material-icons">close</i></span>
			</div>
			<div class="bk-body">
				<div class="bk-presets">
					<div class="bk-preset-btn" data-val="n">n</div>
					<div class="bk-preset-btn" data-val="m">m</div>
					<div class="bk-preset-btn" data-val="x">x</div>
					<div class="bk-preset-btn" data-val="y">y</div>
				</div>
				<input type="text" id="cdBKInput" class="bk-input" placeholder="직접 입력 (숫자, 문자)" autocomplete="off" maxlength="10">
			</div>
			<div class="bk-footer">
				<button class="bk-btn bk-ok" id="cdBKOk">OK</button>
				<button class="bk-btn bk-cancel" id="cdBKCancel">Close</button>
			</div>
		</div>
	</div>
</article>

<script>
(function() {
	'use strict';
	console.log('[ChemDraw] IIFE started');

	/* ═══════════════════════════════════════
	   Element Data
	   ═══════════════════════════════════════ */
	var ELEMENTS = {
		C:  { color: '#333333', color3d: 0x333333, radius: 20, r3d: 0.45, label: 'C', name: 'Carbon' },
		H:  { color: '#FFFFFF', color3d: 0xffffff, radius: 12, r3d: 0.25, label: 'H', name: 'Hydrogen' },
		O:  { color: '#FF0D0D', color3d: 0xff0d0d, radius: 18, r3d: 0.4, label: 'O', name: 'Oxygen' },
		N:  { color: '#3050F8', color3d: 0x3050f8, radius: 17, r3d: 0.38, label: 'N', name: 'Nitrogen' },
		S:  { color: '#FFFF30', color3d: 0xffff30, radius: 22, r3d: 0.5, label: 'S', name: 'Sulfur' },
		P:  { color: '#FF8000', color3d: 0xff8000, radius: 21, r3d: 0.48, label: 'P', name: 'Phosphorus' },
		F:  { color: '#90E050', color3d: 0x90e050, radius: 14, r3d: 0.3, label: 'F', name: 'Fluorine' },
		Cl: { color: '#1FF01F', color3d: 0x1ff01f, radius: 19, r3d: 0.42, label: 'Cl', name: 'Chlorine' },
		Br: { color: '#A62929', color3d: 0xa62929, radius: 21, r3d: 0.48, label: 'Br', name: 'Bromine' },
		I:  { color: '#940094', color3d: 0x940094, radius: 23, r3d: 0.52, label: 'I', name: 'Iodine' },
		Si: { color: '#F0C8A0', color3d: 0xf0c8a0, radius: 21, r3d: 0.46, label: 'Si', name: 'Silicon' }
	};
	var LIGHT_COLORS = ['#FFFFFF','#FFFF30','#90E050','#1FF01F','#F0C8A0'];
	var BOND_TYPES = ['single', 'double', 'triple'];
	var TEMPLATES = {};

	/* ═══════════════════════════════════════
	   Element Slots (10개 고정 + sessionStorage)
	   ═══════════════════════════════════════ */
	var CD_DEFAULT_ELEMENTS = ['C','H','O','N','S','P','F','Cl','Br','I'];
	var CD_MAX_SLOTS = 10;

	function cdGetElementSlots() {
		try {
			var saved = sessionStorage.getItem('cdElementSlots');
			if (saved) return JSON.parse(saved);
		} catch(e) {}
		return CD_DEFAULT_ELEMENTS.slice();
	}
	function cdSaveElementSlots(slots) {
		try { sessionStorage.setItem('cdElementSlots', JSON.stringify(slots)); } catch(e) {}
	}
	function cdRenderElementSlots() {
		var slots = cdGetElementSlots();
		var $container = $('#cdElementSlots');
		$container.empty();
		slots.forEach(function(sym) {
			$container.append('<div class="btnBox waves-effect waves-hColor" data-element="' + sym + '">' + sym + '</div>');
		});
		/* ELEMENTS / VALENCES에 없는 원소면 PT_DATA 또는 커스텀으로 등록 */
		slots.forEach(function(sym) {
			if (!ELEMENTS[sym]) {
				cdRegisterElement(sym);
				/* PT_DATA에 없는 커스텀 원소(R, Me 등)면 기본값으로 등록 */
				if (!ELEMENTS[sym]) {
					ELEMENTS[sym] = { color: '#8E24AA', color3d: 0x8e24aa, radius: 20, r3d: 0.45, label: sym, name: sym };
					VALENCES[sym] = 0;
				}
			}
		});
	}

	/* Element Slot 드래그 순서 변경 (마우스 이벤트 기반, 실시간 gap) */
	var cdElDrag = { el: null, ghost: null, active: false, startX: 0, startY: 0, origIdx: -1, targetIdx: -1 };

	$(document).on('mousedown', '#cdElementSlots .btnBox', function(e) {
		if (e.button !== 0) return;
		var el = this;
		var rect = el.getBoundingClientRect();
		cdElDrag.el = el;
		cdElDrag.startX = e.clientX;
		cdElDrag.startY = e.clientY;
		cdElDrag.active = false;
		cdElDrag.offsetX = e.clientX - rect.left;
		cdElDrag.offsetY = e.clientY - rect.top;
		cdElDrag.origIdx = $(el).index();
	});

	$(document).on('mousemove', function(e) {
		if (!cdElDrag.el) return;
		var dx = e.clientX - cdElDrag.startX;
		var dy = e.clientY - cdElDrag.startY;

		/* 드래그 시작 판정 (5px 이상 이동) */
		if (!cdElDrag.active) {
			if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
			cdElDrag.active = true;
			/* 고스트 생성 */
			var ghost = cdElDrag.el.cloneNode(true);
			ghost.className = 'btnBox cd-el-ghost';
			ghost.style.cssText = 'position:fixed;z-index:10000;pointer-events:none;opacity:0.85;box-shadow:0 4px 16px rgba(0,0,0,0.3);transform:scale(1.15);';
			ghost.style.width = cdElDrag.el.offsetWidth + 'px';
			ghost.style.height = cdElDrag.el.offsetHeight + 'px';
			document.body.appendChild(ghost);
			cdElDrag.ghost = ghost;
			/* 원본 숨기기 */
			cdElDrag.el.style.opacity = '0';
			cdElDrag.el.style.width = '0';
			cdElDrag.el.style.minWidth = '0';
			cdElDrag.el.style.padding = '0';
			cdElDrag.el.style.margin = '0';
			cdElDrag.el.style.border = 'none';
			cdElDrag.el.style.overflow = 'hidden';
			cdElDrag.el.style.transition = 'width 0.2s ease, min-width 0.2s ease, padding 0.2s ease, margin 0.2s ease';
			/* 다른 버튼들에 transition 추가 */
			$('#cdElementSlots .btnBox').not(cdElDrag.el).css('transition', 'margin 0.2s ease');
			$('body').css('cursor', 'grabbing');
		}

		/* 고스트 위치 */
		cdElDrag.ghost.style.left = (e.clientX - cdElDrag.offsetX) + 'px';
		cdElDrag.ghost.style.top = (e.clientY - cdElDrag.offsetY) + 'px';

		/* 드롭 위치 계산 → gap 표시 */
		var $children = $('#cdElementSlots .btnBox').not(cdElDrag.el);
		var newTarget = -1;
		$children.each(function(i) {
			var r = this.getBoundingClientRect();
			var cx = r.left + r.width / 2;
			if (e.clientX < cx) {
				newTarget = i;
				return false;
			}
		});
		if (newTarget === -1) newTarget = $children.length;

		if (newTarget !== cdElDrag.targetIdx) {
			cdElDrag.targetIdx = newTarget;
			/* gap 리셋 후 대상 위치에 margin으로 gap 생성 */
			$children.css({ 'margin-left': '', 'margin-right': '' });
			if (newTarget < $children.length) {
				$children.eq(newTarget).css('margin-left', '34px');
			} else if ($children.length > 0) {
				$children.eq($children.length - 1).css('margin-right', '34px');
			}
		}
	});

	$(document).on('mouseup', function() {
		if (!cdElDrag.el) return;
		if (cdElDrag.active && cdElDrag.ghost) {
			/* gap 리셋 */
			$('#cdElementSlots .btnBox').css({ 'margin-left': '', 'margin-right': '', 'transition': '' });
			/* DOM 이동 */
			var $container = $('#cdElementSlots');
			var $children = $container.children('.btnBox').not(cdElDrag.el);
			var $dragged = $(cdElDrag.el);
			/* 원본 스타일 복원 */
			$dragged.removeAttr('style');

			if (cdElDrag.targetIdx >= $children.length) {
				$container.append($dragged);
			} else {
				$children.eq(cdElDrag.targetIdx).before($dragged);
			}
			/* 고스트 제거 */
			cdElDrag.ghost.remove();
			/* sessionStorage 저장 */
			var newSlots = [];
			$container.children('[data-element]').each(function() {
				newSlots.push($(this).attr('data-element'));
			});
			cdSaveElementSlots(newSlots);
			$('body').css('cursor', '');
		}
		cdElDrag.el = null;
		cdElDrag.ghost = null;
		cdElDrag.active = false;
		cdElDrag.targetIdx = -1;
	});
	function cdRegisterElement(sym) {
		var elData = null;
		for (var i = 0; i < PT_DATA.length; i++) {
			if (PT_DATA[i][0] === sym) { elData = PT_DATA[i]; break; }
		}
		if (!elData) return;
		var z = elData[1], row = elData[2], val = elData[5], cpk = elData[6], name = elData[7];
		var period = row <= 7 ? row : (row === 9 ? 6 : 7);
		var cpk3d = parseInt(cpk.replace('#',''), 16);
		var radius = sym === 'H' ? 12 : Math.round(14 + period * 1.5);
		var r3d = sym === 'H' ? 0.25 : +(0.20 + period * 0.05).toFixed(2);
		ELEMENTS[sym] = { color: cpk, color3d: cpk3d, radius: radius, r3d: r3d, label: sym, name: name };
		VALENCES[sym] = val;
		var cc = cpk.replace('#','');
		if (cc.length === 3) cc = cc[0]+cc[0]+cc[1]+cc[1]+cc[2]+cc[2];
		var rr = parseInt(cc.substr(0,2),16), gg = parseInt(cc.substr(2,2),16), bb = parseInt(cc.substr(4,2),16);
		if ((rr*299 + gg*587 + bb*114) / 1000 > 150) LIGHT_COLORS.push(cpk);
	}

	/* ═══════════════════════════════════════
	   Periodic Table Data
	   ═══════════════════════════════════════ */
	/* 폴링 전기음성도 (Pauling Electronegativity) */
	var PT_EN = {
		H:2.20,Li:0.98,Be:1.57,B:2.04,C:2.55,N:3.04,O:3.44,F:3.98,
		Na:0.93,Mg:1.31,Al:1.61,Si:1.90,P:2.19,S:2.58,Cl:3.16,
		K:0.82,Ca:1.00,Sc:1.36,Ti:1.54,V:1.63,Cr:1.66,Mn:1.55,Fe:1.83,Co:1.88,Ni:1.91,Cu:1.90,Zn:1.65,
		Ga:1.81,Ge:2.01,As:2.18,Se:2.55,Br:2.96,
		Rb:0.82,Sr:0.95,Y:1.22,Zr:1.33,Nb:1.60,Mo:2.16,Tc:1.90,Ru:2.20,Rh:2.28,Pd:2.20,Ag:1.93,Cd:1.69,
		In:1.78,Sn:1.96,Sb:2.05,Te:2.10,I:2.66,
		Cs:0.79,Ba:0.89,Hf:1.30,Ta:1.50,W:2.36,Re:1.90,Os:2.20,Ir:2.20,Pt:2.28,Au:2.54,
		Hg:2.00,Tl:1.62,Pb:2.33,Bi:2.02,Po:2.00,At:2.20,
		Fr:0.70,Ra:0.90,Rf:1.30,
		La:1.10,Ce:1.12,Pr:1.13,Nd:1.14,Pm:1.13,Sm:1.17,Eu:1.20,Gd:1.20,Tb:1.10,Dy:1.22,
		Ho:1.23,Er:1.24,Tm:1.25,Yb:1.10,Lu:1.27,
		Ac:1.10,Th:1.30,Pa:1.50,U:1.38,Np:1.36,Pu:1.28,Am:1.30,Cm:1.30,Bk:1.30,Cf:1.30,
		Es:1.30,Fm:1.30,Md:1.30,No:1.30,Lr:1.30
	};
	var PT_MASS = {
		H:1.008,He:4.003,Li:6.941,Be:9.012,B:10.81,C:12.011,N:14.007,O:15.999,F:18.998,Ne:20.180,
		Na:22.990,Mg:24.305,Al:26.982,Si:28.086,P:30.974,S:32.065,Cl:35.453,Ar:39.948,
		K:39.098,Ca:40.078,Sc:44.956,Ti:47.867,V:50.942,Cr:51.996,Mn:54.938,Fe:55.845,Co:58.933,Ni:58.693,Cu:63.546,Zn:65.38,
		Ga:69.723,Ge:72.64,As:74.922,Se:78.96,Br:79.904,Kr:83.798,
		Rb:85.468,Sr:87.62,Y:88.906,Zr:91.224,Nb:92.906,Mo:95.95,Tc:'(98)',Ru:101.07,Rh:102.906,Pd:106.42,Ag:107.868,Cd:112.411,
		In:114.818,Sn:118.71,Sb:121.76,Te:127.6,I:126.904,Xe:131.293,
		Cs:132.905,Ba:137.327,Hf:178.49,Ta:180.948,W:183.84,Re:186.207,Os:190.23,Ir:192.217,Pt:195.084,Au:196.967,
		Hg:200.59,Tl:204.383,Pb:207.2,Bi:208.980,Po:'(209)',At:'(210)',Rn:'(222)',
		Fr:'(223)',Ra:'(226)',Rf:'(267)',Db:'(268)',Sg:'(269)',Bh:'(270)',Hs:'(269)',Mt:'(277)',Ds:'(281)',Rg:'(282)',
		Cn:'(285)',Nh:'(286)',Fl:'(290)',Mc:'(290)',Lv:'(293)',Ts:'(294)',Og:'(294)',
		La:138.905,Ce:140.116,Pr:140.908,Nd:144.242,Pm:'(145)',Sm:150.36,Eu:151.964,Gd:157.25,Tb:158.925,Dy:162.5,
		Ho:164.930,Er:167.259,Tm:168.934,Yb:173.04,Lu:174.967,
		Ac:'(227)',Th:232.038,Pa:231.036,U:238.029,Np:237.048,Pu:'(244)',Am:'(243)',Cm:'(247)',Bk:'(247)',Cf:'(251)',
		Es:'(252)',Fm:'(257)',Md:'(258)',No:'(259)',Lr:'(262)'
	};
	// [symbol, Z, gridRow, gridCol, category, valence, cpkColor, name]
	var PT_DATA = [
		['H',1,1,1,'nm',1,'#FFFFFF','Hydrogen'],['He',2,1,18,'ng',0,'#D9FFFF','Helium'],
		['Li',3,2,1,'am',1,'#CC80FF','Lithium'],['Be',4,2,2,'ae',2,'#C2FF00','Beryllium'],
		['B',5,2,13,'md',3,'#FFB5B5','Boron'],['C',6,2,14,'nm',4,'#333333','Carbon'],
		['N',7,2,15,'nm',3,'#3050F8','Nitrogen'],['O',8,2,16,'nm',2,'#FF0D0D','Oxygen'],
		['F',9,2,17,'ha',1,'#90E050','Fluorine'],['Ne',10,2,18,'ng',0,'#B3E3F5','Neon'],
		['Na',11,3,1,'am',1,'#AB5CF2','Sodium'],['Mg',12,3,2,'ae',2,'#8AFF00','Magnesium'],
		['Al',13,3,13,'pt',3,'#BFA6A6','Aluminium'],['Si',14,3,14,'md',4,'#F0C8A0','Silicon'],
		['P',15,3,15,'nm',3,'#FF8000','Phosphorus'],['S',16,3,16,'nm',2,'#FFFF30','Sulfur'],
		['Cl',17,3,17,'ha',1,'#1FF01F','Chlorine'],['Ar',18,3,18,'ng',0,'#80D1E3','Argon'],
		['K',19,4,1,'am',1,'#8F40D4','Potassium'],['Ca',20,4,2,'ae',2,'#3DFF00','Calcium'],
		['Sc',21,4,3,'tm',3,'#E6E6E6','Scandium'],['Ti',22,4,4,'tm',4,'#BFC2C7','Titanium'],
		['V',23,4,5,'tm',5,'#A6A6AB','Vanadium'],['Cr',24,4,6,'tm',3,'#8A99C7','Chromium'],
		['Mn',25,4,7,'tm',2,'#9C7AC7','Manganese'],['Fe',26,4,8,'tm',3,'#E06633','Iron'],
		['Co',27,4,9,'tm',2,'#F090A0','Cobalt'],['Ni',28,4,10,'tm',2,'#50D050','Nickel'],
		['Cu',29,4,11,'tm',2,'#C88033','Copper'],['Zn',30,4,12,'tm',2,'#7D80B0','Zinc'],
		['Ga',31,4,13,'pt',3,'#C28F8F','Gallium'],['Ge',32,4,14,'md',4,'#668F8F','Germanium'],
		['As',33,4,15,'md',3,'#BD80E3','Arsenic'],['Se',34,4,16,'nm',2,'#FFA100','Selenium'],
		['Br',35,4,17,'ha',1,'#A62929','Bromine'],['Kr',36,4,18,'ng',0,'#5CB8D1','Krypton'],
		['Rb',37,5,1,'am',1,'#702EB0','Rubidium'],['Sr',38,5,2,'ae',2,'#00FF00','Strontium'],
		['Y',39,5,3,'tm',3,'#94FFFF','Yttrium'],['Zr',40,5,4,'tm',4,'#94E0E0','Zirconium'],
		['Nb',41,5,5,'tm',5,'#73C2C9','Niobium'],['Mo',42,5,6,'tm',6,'#54B5B5','Molybdenum'],
		['Tc',43,5,7,'tm',7,'#3B9E9E','Technetium'],['Ru',44,5,8,'tm',4,'#248F8F','Ruthenium'],
		['Rh',45,5,9,'tm',3,'#0A7D8C','Rhodium'],['Pd',46,5,10,'tm',2,'#006985','Palladium'],
		['Ag',47,5,11,'tm',1,'#C0C0C0','Silver'],['Cd',48,5,12,'tm',2,'#FFD98F','Cadmium'],
		['In',49,5,13,'pt',3,'#A67573','Indium'],['Sn',50,5,14,'pt',4,'#668080','Tin'],
		['Sb',51,5,15,'md',3,'#9E63B5','Antimony'],['Te',52,5,16,'md',2,'#D47A00','Tellurium'],
		['I',53,5,17,'ha',1,'#940094','Iodine'],['Xe',54,5,18,'ng',0,'#429EB0','Xenon'],
		['Cs',55,6,1,'am',1,'#57178F','Caesium'],['Ba',56,6,2,'ae',2,'#00C900','Barium'],
		['Hf',72,6,4,'tm',4,'#4DC2FF','Hafnium'],['Ta',73,6,5,'tm',5,'#4DA6FF','Tantalum'],
		['W',74,6,6,'tm',6,'#2194D6','Tungsten'],['Re',75,6,7,'tm',7,'#267DAB','Rhenium'],
		['Os',76,6,8,'tm',4,'#266696','Osmium'],['Ir',77,6,9,'tm',4,'#175487','Iridium'],
		['Pt',78,6,10,'tm',4,'#D0D0E0','Platinum'],['Au',79,6,11,'tm',3,'#FFD123','Gold'],
		['Hg',80,6,12,'tm',2,'#B8B8D0','Mercury'],['Tl',81,6,13,'pt',1,'#A6544D','Thallium'],
		['Pb',82,6,14,'pt',2,'#575961','Lead'],['Bi',83,6,15,'pt',3,'#9E4FB5','Bismuth'],
		['Po',84,6,16,'pt',2,'#AB5C00','Polonium'],['At',85,6,17,'ha',1,'#754F45','Astatine'],
		['Rn',86,6,18,'ng',0,'#428296','Radon'],
		['Fr',87,7,1,'am',1,'#420066','Francium'],['Ra',88,7,2,'ae',2,'#007D00','Radium'],
		['Rf',104,7,4,'tm',4,'#CC0059','Rutherfordium'],['Db',105,7,5,'tm',5,'#D1004F','Dubnium'],
		['Sg',106,7,6,'tm',6,'#D90045','Seaborgium'],['Bh',107,7,7,'tm',7,'#E0003B','Bohrium'],
		['Hs',108,7,8,'tm',4,'#E60032','Hassium'],['Mt',109,7,9,'uk',4,'#EB0026','Meitnerium'],
		['Ds',110,7,10,'uk',4,'#EB0026','Darmstadtium'],['Rg',111,7,11,'uk',3,'#EB0026','Roentgenium'],
		['Cn',112,7,12,'tm',2,'#EB0026','Copernicium'],['Nh',113,7,13,'uk',1,'#EB0026','Nihonium'],
		['Fl',114,7,14,'uk',2,'#EB0026','Flerovium'],['Mc',115,7,15,'uk',1,'#EB0026','Moscovium'],
		['Lv',116,7,16,'uk',2,'#EB0026','Livermorium'],['Ts',117,7,17,'uk',1,'#EB0026','Tennessine'],
		['Og',118,7,18,'uk',0,'#EB0026','Oganesson'],
		['La',57,9,3,'la',3,'#70D4FF','Lanthanum'],['Ce',58,9,4,'la',3,'#FFFFC7','Cerium'],
		['Pr',59,9,5,'la',3,'#D9FFC7','Praseodymium'],['Nd',60,9,6,'la',3,'#C7FFC7','Neodymium'],
		['Pm',61,9,7,'la',3,'#A3FFC7','Promethium'],['Sm',62,9,8,'la',3,'#8FFFC7','Samarium'],
		['Eu',63,9,9,'la',3,'#61FFC7','Europium'],['Gd',64,9,10,'la',3,'#45FFC7','Gadolinium'],
		['Tb',65,9,11,'la',3,'#30FFC7','Terbium'],['Dy',66,9,12,'la',3,'#1FFFC7','Dysprosium'],
		['Ho',67,9,13,'la',3,'#00FF9C','Holmium'],['Er',68,9,14,'la',3,'#00E675','Erbium'],
		['Tm',69,9,15,'la',3,'#00D452','Thulium'],['Yb',70,9,16,'la',3,'#00BF38','Ytterbium'],
		['Lu',71,9,17,'la',3,'#00AB24','Lutetium'],
		['Ac',89,10,3,'ac',3,'#70ABFA','Actinium'],['Th',90,10,4,'ac',4,'#00BAFF','Thorium'],
		['Pa',91,10,5,'ac',4,'#00A1FF','Protactinium'],['U',92,10,6,'ac',4,'#008FFF','Uranium'],
		['Np',93,10,7,'ac',4,'#0080FF','Neptunium'],['Pu',94,10,8,'ac',3,'#006BFF','Plutonium'],
		['Am',95,10,9,'ac',3,'#545CF2','Americium'],['Cm',96,10,10,'ac',3,'#785CE3','Curium'],
		['Bk',97,10,11,'ac',3,'#8A4FE3','Berkelium'],['Cf',98,10,12,'ac',3,'#A136D4','Californium'],
		['Es',99,10,13,'ac',3,'#B31FD4','Einsteinium'],['Fm',100,10,14,'ac',3,'#B31FBA','Fermium'],
		['Md',101,10,15,'ac',3,'#B30DA6','Mendelevium'],['No',102,10,16,'ac',2,'#BD0D87','Nobelium'],
		['Lr',103,10,17,'ac',3,'#C70066','Lawrencium']
	];
	var PT_CAT_COLORS = {
		'am':'rgba(239,83,80,0.12)','ae':'rgba(255,202,40,0.10)','tm':'rgba(186,104,200,0.10)','pt':'rgba(144,164,174,0.10)',
		'md':'rgba(102,187,106,0.10)','nm':'rgba(77,208,225,0.10)','ha':'rgba(255,238,88,0.10)','ng':'rgba(79,195,247,0.10)',
		'la':'rgba(240,98,146,0.12)','ac':'rgba(255,138,101,0.12)','uk':'rgba(189,189,189,0.08)'
	};
	var PT_CAT_GLOW = {
		'am':'239,83,80','ae':'255,202,40','tm':'186,104,200','pt':'144,164,174',
		'md':'102,187,106','nm':'77,208,225','ha':'255,238,88','ng':'79,195,247',
		'la':'240,98,146','ac':'255,138,101','uk':'189,189,189'
	};
	var PT_CAT_NAMES = {
		'am':'Alkali Metal','ae':'Alkaline Earth','tm':'Transition Metal','pt':'Post-transition',
		'md':'Metalloid','nm':'Nonmetal','ha':'Halogen','ng':'Noble Gas',
		'la':'Lanthanide','ac':'Actinide','uk':'Unknown'
	};

	/* ═══════════════════════════════════════
	   Shared State
	   ═══════════════════════════════════════ */
	var atoms = [], bonds = [], brackets = [];
	var nextId = 1;
	var selectedElement = null;
	var bondType = 'single';
	var chemFont = 'Arial';
	var history = [], historyIdx = -1;
	var clipboard = null; /* { atoms:[], bonds:[], brackets:[] } */
	/* ── Performance: O(1) atom lookup map + bond adjacency ── */
	var atomMap = {};
	var bondAdj = {}; /* { atomId: [ { to: otherId, order: 1|2|3 }, ... ] } */
	function rebuildAtomMap() {
		atomMap = {}; bondAdj = {};
		for (var i = 0; i < atoms.length; i++) { atomMap[atoms[i].id] = atoms[i]; bondAdj[atoms[i].id] = []; }
		for (var j = 0; j < bonds.length; j++) {
			var b = bonds[j], ord = b.type === 'triple' ? 3 : b.type === 'double' ? 2 : 1;
			if (bondAdj[b.from]) bondAdj[b.from].push({ to: b.to, order: ord });
			if (bondAdj[b.to]) bondAdj[b.to].push({ to: b.from, order: ord });
		}
	}
	/* ── Performance: throttle & cache helpers ── */
	var _wheelSaveTimer = 0;
	var _gridCache = { w: 0, h: 0, html: '' };
	/* Scheduled render: coalesce multiple render requests into one rAF */
	var _renderRAF = 0;
	function scheduleRender() {
		if (!_renderRAF) { _renderRAF = requestAnimationFrame(function() { _renderRAF = 0; ed2d.render(); }); }
	}
	var currentTab = 'editor';
	var cdIsOwner = true; /* 본인 작성 여부 (LIST 클릭 시 설정) */

	function genId() { return nextId++; }

	/* ═══════════════════════════════════════
	   Find helpers
	   ═══════════════════════════════════════ */
	function findAtomAt(x, y) {
		for (var i = atoms.length - 1; i >= 0; i--) {
			var a = atoms[i], dx = a.x - x, dy = a.y - y;
			var r = (ELEMENTS[a.element] || ELEMENTS.C).radius * (a.scale || 1);
			if (dx * dx + dy * dy < (r + 8) * (r + 8)) return a;
		}
		return null;
	}
	function distToSeg(px, py, x1, y1, x2, y2) {
		var dx = x2 - x1, dy = y2 - y1, len2 = dx * dx + dy * dy;
		if (len2 === 0) return Math.hypot(px - x1, py - y1);
		var t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
		return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
	}
	function findBondAt(x, y) {
		for (var i = bonds.length - 1; i >= 0; i--) {
			var b = bonds[i];
			var a1 = atomMap[b.from];
			var a2 = atomMap[b.to];
			if (!a1 || !a2) continue;
			if (distToSeg(x, y, a1.x, a1.y, a2.x, a2.y) < 10) return b;
		}
		return null;
	}

	/* ═══════════════════════════════════════
	   Valence & Implicit Hydrogen
	   ═══════════════════════════════════════ */
	var VALENCES = { H:1, C:4, N:3, O:2, F:1, S:2, P:3, Cl:1, Br:1, I:1, Si:4 };
	var ATOMIC_WEIGHTS = {
		H:1.008, He:4.003, Li:6.941, Be:9.012, B:10.81, C:12.011, N:14.007, O:15.999,
		F:18.998, Ne:20.180, Na:22.990, Mg:24.305, Al:26.982, Si:28.086, P:30.974, S:32.065,
		Cl:35.453, Ar:39.948, K:39.098, Ca:40.078, Sc:44.956, Ti:47.867, V:50.942, Cr:51.996,
		Mn:54.938, Fe:55.845, Co:58.933, Ni:58.693, Cu:63.546, Zn:65.38, Ga:69.723, Ge:72.63,
		As:74.922, Se:78.96, Br:79.904, Kr:83.798, Rb:85.468, Sr:87.62, Y:88.906, Zr:91.224,
		Nb:92.906, Mo:95.96, Tc:98, Ru:101.07, Rh:102.906, Pd:106.42, Ag:107.868, Cd:112.411,
		In:114.818, Sn:118.710, Sb:121.760, Te:127.60, I:126.904, Xe:131.293, Cs:132.905, Ba:137.327,
		La:138.905, Ce:140.116, Pr:140.908, Nd:144.242, Pm:145, Sm:150.36, Eu:151.964, Gd:157.25,
		Tb:158.925, Dy:162.500, Ho:164.930, Er:167.259, Tm:168.934, Yb:173.054, Lu:174.967,
		Hf:178.49, Ta:180.948, W:183.84, Re:186.207, Os:190.23, Ir:192.217, Pt:195.084, Au:196.967,
		Hg:200.59, Tl:204.383, Pb:207.2, Bi:208.980, Po:209, At:210, Rn:222,
		Fr:223, Ra:226, Ac:227, Th:232.038, Pa:231.036, U:238.029, Np:237, Pu:244,
		Am:243, Cm:247, Bk:247, Cf:251, Es:252, Fm:257, Md:258, No:259, Lr:266,
		Rf:267, Db:268, Sg:269, Bh:270, Hs:277, Mt:278, Ds:281, Rg:282, Cn:285,
		Nh:286, Fl:289, Mc:290, Lv:293, Ts:294, Og:294
	};
	var showImplicitH = true;
	var selectedFixedH = null;

	function getBondOrderSum(atomId) {
		var adj = bondAdj[atomId]; if (!adj) return 0;
		var sum = 0; for (var i = 0; i < adj.length; i++) sum += adj[i].order;
		return sum;
	}
	function getBondCount(atomId) {
		var adj = bondAdj[atomId]; return adj ? adj.length : 0;
	}
	function getImplicitHCount(atom) {
		if (atom.fixedH !== undefined && atom.fixedH !== null) {
			return Math.max(0, atom.fixedH - getBondOrderSum(atom.id));
		}
		var v = VALENCES[atom.element];
		if (v === undefined) return 0;
		return Math.max(0, v - getBondOrderSum(atom.id));
	}
	function getAtomLabel(atom) {
		if (atom.hideLabel) return { text:'', hide:true };
		var hCount = getImplicitHCount(atom);
		var el = atom.element;
		var bc = getBondCount(atom.id);
		if (el === 'C' && hCount === 0 && bc >= 2) return { text:'', hide:true };
		if (hCount === 0) return { text:el, hide:false, anchor:'middle' };
		var hStr = 'H' + (hCount > 1 ? hCount : '');
		if (bc === 0) return { text:el+hStr, hide:false, anchor:'middle' };
		var avgX = 0, cnt = 0;
		var adj = bondAdj[atom.id];
		if (adj) { for (var _i = 0; _i < adj.length; _i++) { var o = atomMap[adj[_i].to]; if(o){avgX+=o.x;cnt++;} } }
		avgX = cnt > 0 ? avgX / cnt : atom.x;
		if (avgX > atom.x + 5) return { text:hStr+el, hide:false, anchor:'end' };
		if (avgX < atom.x - 5) return { text:el+hStr, hide:false, anchor:'start' };
		return { text:el+hStr, hide:false, anchor:'middle' };
	}

	/* ═══════════════════════════════════════
	   State management (undo/redo)
	   ═══════════════════════════════════════ */
	function updateUndoRedoState() {
		var canUndo = historyIdx > 0, canRedo = historyIdx < history.length - 1;
		$('#cdUndoBtn, #cd3DUndoBtn').toggleClass('disabled', !canUndo);
		$('#cdRedoBtn, #cd3DRedoBtn').toggleClass('disabled', !canRedo);
	}
	function saveState() {
		var state = { atoms: JSON.parse(JSON.stringify(atoms)), bonds: JSON.parse(JSON.stringify(bonds)), brackets: JSON.parse(JSON.stringify(brackets)) };
		history = history.slice(0, historyIdx + 1);
		history.push(state);
		historyIdx++;
		updateUndoRedoState();
	}
	function undo() {
		if (historyIdx > 0) { historyIdx--; var s = history[historyIdx]; atoms = JSON.parse(JSON.stringify(s.atoms)); bonds = JSON.parse(JSON.stringify(s.bonds)); brackets = s.brackets ? JSON.parse(JSON.stringify(s.brackets)) : []; updateUndoRedoState(); refreshCurrentTab(); }
	}
	function redo() {
		if (historyIdx < history.length - 1) { historyIdx++; var s = history[historyIdx]; atoms = JSON.parse(JSON.stringify(s.atoms)); bonds = JSON.parse(JSON.stringify(s.bonds)); brackets = s.brackets ? JSON.parse(JSON.stringify(s.brackets)) : []; updateUndoRedoState(); refreshCurrentTab(); }
	}
	function clearAll() {
		atoms = []; bonds = []; brackets = [];
		ed2d.selectedAtom = null; ed2d.selectedBond = null; ed2d.selectedBracket = null;
		ed2d.bondStart = null; ed2d.dragging = null;
		ed2d.selectedAtoms = []; ed2d.selectedBonds = []; ed2d.selectedBrackets = []; ed2d.bracketDragOffsets = [];
		ed2d.hoveredAtom = -1; ed2d.hoveredBond = -1; ed2d.hoveredBracket = -1;
		ed2d.rubberBand = null; ed2d.isDragging = false;
		saveState(); refreshCurrentTab();
	}
	function refreshCurrentTab() {
		updateInfo();
		if (currentTab === 'editor') ed2d.render();
		else if (currentTab === '2dview') view2d.render();
		else if (currentTab === '3dview') view3d.rebuild();
	}

	/* ═══════════════════════════════════════
	   Formula & Info
	   ═══════════════════════════════════════ */
	function getFormula() {
		var c = {};
		atoms.forEach(function(a) {
			c[a.element] = (c[a.element] || 0) + 1;
			var ih = getImplicitHCount(a);
			if (ih > 0) c['H'] = (c['H'] || 0) + ih;
		});
		var order = ['C','H','N','O','S','P','F','Cl','Br','I','Si'];
		var f = '';
		order.forEach(function(el) { if (c[el]) { f += el + (c[el] > 1 ? c[el] : ''); delete c[el]; } });
		Object.keys(c).sort().forEach(function(el) { f += el + (c[el] > 1 ? c[el] : ''); });
		return f || '-';
	}
	function getMolecularWeight() {
		if (atoms.length === 0) return 0;
		var mw = 0;
		atoms.forEach(function(a) {
			mw += (ATOMIC_WEIGHTS[a.element] || 0);
			var ih = getImplicitHCount(a);
			if (ih > 0) mw += ih * ATOMIC_WEIGHTS['H'];
		});
		return mw;
	}
	function updateInfo() {
		var statsEl = document.getElementById('chemDrawStats');
		var mwEl = document.getElementById('chemDrawMW');
		var formula = getFormula();
		var mw = getMolecularWeight();
		var mwStr = mw > 0 ? mw.toFixed(3) : '0';
		if (statsEl) {
			statsEl.innerHTML = '<span class="chemFormula">' + formula + '</span>';
		}
		if (mwEl) {
			mwEl.innerHTML = '<span class="chemMwValue">' + mwStr + '</span><span class="chemMwLabel">g/mol</span>';
		}
	}

	/* ═══════════════════════════════════════
	   Shared SVG render helpers
	   ═══════════════════════════════════════ */
	/* 원자 라벨 바운딩 박스로부터 bond를 줄일 거리 계산 */
	function getAtomLabelPad(a, ux, uy) {
		if (!showImplicitH) {
			if (a.hideLabel) return 0;
			var info = ELEMENTS[a.element] || ELEMENTS.C;
			return info.radius * (a.scale || 1);
		}
		var label = getAtomLabel(a);
		if (label.hide) return 0;
		var S = a.scale || 1;
		var CW = 8.4*S, SUB_CW = 6*S, FS = 14*S, PX = 2*S, PY = 2*S;
		var parts = parseLabelParts(label.text);
		var textW = 0;
		parts.forEach(function(p) { textW += p.sub ? SUB_CW * p.ch.length : CW * p.ch.length; });
		var hw = (textW + PX * 2) / 2;
		var hh = (FS + PY * 2) / 2;
		var absUx = Math.abs(ux), absUy = Math.abs(uy);
		if (absUx < 0.001) return hh;
		if (absUy < 0.001) return hw;
		return Math.min(hw / absUx, hh / absUy);
	}
	/* ── 드래그 시 정렬 가이드 + 스냅 (PPT 스타일) ── */
	var ALIGN_SNAP_TOL = 6; /* px 허용 오차 */
	function detectAlignGuides() {
		if (!ed2d.isDragging || ed2d.selectedAtoms.length === 0) { ed2d._alignGuides = []; return; }
		var selSet = {};
		ed2d.selectedAtoms.forEach(function(id) { selSet[id] = true; });
		var guides = [];
		var w = ed2d.containerEl ? ed2d.containerEl.clientWidth : 2000;
		var h = ed2d.containerEl ? ed2d.containerEl.clientHeight : 1500;
		/* 선택된 원자들의 좌표 수집 */
		var selCoords = [];
		ed2d.selectedAtoms.forEach(function(id) {
			var a = atomMap[id];
			if (a) selCoords.push({ id: id, x: a.x, y: a.y });
		});
		/* 비선택 원자들과 비교 — 가장 가까운 스냅 대상 찾기 */
		var bestSnapX = null, bestSnapDX = ALIGN_SNAP_TOL + 1;
		var bestSnapY = null, bestSnapDY = ALIGN_SNAP_TOL + 1;
		var usedH = {}, usedV = {};
		atoms.forEach(function(ref) {
			if (selSet[ref.id]) return;
			for (var si = 0; si < selCoords.length; si++) {
				var sc = selCoords[si];
				var adx = Math.abs(sc.x - ref.x), ady = Math.abs(sc.y - ref.y);
				/* 수직 정렬 (같은 X) */
				if (adx < ALIGN_SNAP_TOL) {
					var xk = Math.round(ref.x);
					if (!usedV[xk]) { usedV[xk] = true; guides.push({ type: 'v', pos: ref.x, from: 0, to: h }); }
					if (adx < bestSnapDX) { bestSnapDX = adx; bestSnapX = { selId: sc.id, refX: ref.x }; }
				}
				/* 수평 정렬 (같은 Y) */
				if (ady < ALIGN_SNAP_TOL) {
					var yk = Math.round(ref.y);
					if (!usedH[yk]) { usedH[yk] = true; guides.push({ type: 'h', pos: ref.y, from: 0, to: w }); }
					if (ady < bestSnapDY) { bestSnapDY = ady; bestSnapY = { selId: sc.id, refY: ref.y }; }
				}
			}
		});
		ed2d._alignGuides = guides;
		/* 스냅: 가장 가까운 정렬 대상에 원자들을 미세 보정 */
		if (bestSnapX) {
			var sa = atomMap[bestSnapX.selId];
			if (sa) {
				var dx = bestSnapX.refX - sa.x;
				ed2d.selectedAtoms.forEach(function(id) { var a = atomMap[id]; if (a) a.x += dx; });
			}
		}
		if (bestSnapY) {
			var sa = atomMap[bestSnapY.selId];
			if (sa) {
				var dy = bestSnapY.refY - sa.y;
				ed2d.selectedAtoms.forEach(function(id) { var a = atomMap[id]; if (a) a.y += dy; });
			}
		}
	}
	/* ── 이중결합 내부선 방향 결정 (링이면 링 안쪽, 아니면 이웃 기반) ── */
	function _dblBondInnerSide(b, a1, a2, nx, ny) {
		/* 1) 링 소속이면 → 링 중심 쪽이 inner */
		var adj1 = bondAdj[a1.id] || [], adj2 = bondAdj[a2.id] || [];
		/* a1,a2 공통 이웃이 있으면 작은 링(3~8)의 일부 */
		var common = [];
		var a2Neighbors = {};
		for (var j = 0; j < adj2.length; j++) a2Neighbors[adj2[j].to] = true;
		for (var i = 0; i < adj1.length; i++) {
			var nid = adj1[i].to;
			if (nid !== a2.id && a2Neighbors[nid]) common.push(nid);
		}
		if (common.length > 0) {
			/* 공통 이웃의 평균 위치 → 그쪽이 inner */
			var cx = 0, cy = 0;
			common.forEach(function(id) { var a = atomMap[id]; if (a) { cx += a.x; cy += a.y; } });
			cx /= common.length; cy /= common.length;
			var mx = (a1.x + a2.x) / 2, my = (a1.y + a2.y) / 2;
			var dot = (cx - mx) * nx + (cy - my) * ny;
			return dot > 0 ? 1 : -1;
		}
		/* 2) 비-링: a1,a2 각각의 이웃(서로 제외)의 무게중심 → 반대쪽을 inner */
		var sx = 0, sy = 0, cnt = 0;
		for (var i = 0; i < adj1.length; i++) { var nid = adj1[i].to; if (nid !== a2.id) { var a = atomMap[nid]; if (a) { sx += a.x; sy += a.y; cnt++; } } }
		for (var j = 0; j < adj2.length; j++) { var nid = adj2[j].to; if (nid !== a1.id) { var a = atomMap[nid]; if (a) { sx += a.x; sy += a.y; cnt++; } } }
		if (cnt > 0) {
			sx /= cnt; sy /= cnt;
			var mx = (a1.x + a2.x) / 2, my = (a1.y + a2.y) / 2;
			var dot = (sx - mx) * nx + (sy - my) * ny;
			return dot > 0 ? 1 : -1;
		}
		return 1; /* fallback */
	}
	function renderBondsSVG(selBondId, dragGroup) {
		var html = '';
		var hasGroup = dragGroup && Object.keys(dragGroup).length > 0;
		/* ── 링 결합 사전 계산 (cdFindRings 활용) ── */
		var _adjSimple = {};
		atoms.forEach(function(a) { _adjSimple[a.id] = []; });
		bonds.forEach(function(b) {
			if (_adjSimple[b.from]) _adjSimple[b.from].push(b.to);
			if (_adjSimple[b.to]) _adjSimple[b.to].push(b.from);
		});
		var _rings = cdFindRings(atoms, bonds, _adjSimple);
		var _ringBondSet = {};
		var _ringNeighbors = {}; /* atomId → [ring neighbor ids] */
		_rings.forEach(function(ring) {
			for (var i = 0; i < ring.length; i++) {
				var cur = ring[i];
				var prev = ring[(i - 1 + ring.length) % ring.length];
				var next = ring[(i + 1) % ring.length];
				var k1 = cur < next ? cur+','+next : next+','+cur;
				_ringBondSet[k1] = true;
				if (!_ringNeighbors[cur]) _ringNeighbors[cur] = [];
				if (_ringNeighbors[cur].indexOf(prev) < 0) _ringNeighbors[cur].push(prev);
				if (_ringNeighbors[cur].indexOf(next) < 0) _ringNeighbors[cur].push(next);
			}
		});
		/* bond lookup by atom pair */
		var _bondLookup = {};
		bonds.forEach(function(b) {
			_bondLookup[b.from + ',' + b.to] = b;
			_bondLookup[b.to + ',' + b.from] = b;
		});
		/* 인접 결합의 offset 벡터 계산 헬퍼 */
		function _adjOffset(vtx, nbr, o) {
			var adx = nbr.x - vtx.x, ady = nbr.y - vtx.y, alen = Math.hypot(adx, ady);
			if (alen === 0) return null;
			var anx = -ady / alen, any = adx / alen;
			var aside = _dblBondInnerSide(null, vtx, nbr, anx, any);
			return { ux: adx/alen, uy: ady/alen, ox: anx * o * aside, oy: any * o * aside };
		}
		bonds.forEach(function(b) {
			var a1 = atomMap[b.from];
			var a2 = atomMap[b.to];
			if (!a1 || !a2) return;
			var dx = a2.x - a1.x, dy = a2.y - a1.y, len = Math.hypot(dx, dy);
			if (len === 0) return;
			var ux = dx / len, uy = dy / len;
			var nx = -dy / len, ny = dx / len;
			var pad1 = getAtomLabelPad(a1, ux, uy);
			var pad2 = getAtomLabelPad(a2, -ux, -uy);
			if (pad1 + pad2 >= len) { pad1 = 0; pad2 = 0; }
			var x1 = a1.x + ux * pad1, y1 = a1.y + uy * pad1;
			var x2 = a2.x - ux * pad2, y2 = a2.y - uy * pad2;
			var isSel = (ed2d.selectedBonds.indexOf(b.id) >= 0) || b.id === selBondId;
			var isHov = (b.id === ed2d.hoveredBond);
			var isDrag = hasGroup && dragGroup[b.from] && dragGroup[b.to];
			var col = isSel ? '#1565c0' : isHov ? '#42a5f5' : isDrag ? '#1565c0' : '#444';
			var sw = isSel ? 3 : isHov ? 2.5 : isDrag ? 2.5 : 2;
			/* 링 소속 여부: cdFindRings 결과 기반 */
			var _bk = b.from < b.to ? b.from+','+b.to : b.to+','+b.from;
			var _isRing = !!_ringBondSet[_bk];
			if (b.type === 'single') {
				html += '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="round"/>';
			} else if (b.type === 'double') {
				var side = _dblBondInnerSide(b, a1, a2, nx, ny);
				if (_isRing) {
					/* 링 결합: 외곽선(꼭짓점 연결) + 안쪽선(인접 결합과 교차점 계산) */
					var o = 4;
					html += '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="round"/>';
					var offNx = nx * o * side, offNy = ny * o * side;
					var ix1 = a1.x + offNx, iy1 = a1.y + offNy;
					var ix2 = a2.x + offNx, iy2 = a2.y + offNy;
					/* ── a1 쪽 내부선 끝점 ── */
					var rn1 = _ringNeighbors[a1.id] || [];
					var a0 = null;
					for (var _ri = 0; _ri < rn1.length; _ri++) { if (rn1[_ri] !== a2.id) { a0 = atomMap[rn1[_ri]]; break; } }
					if (a0) {
						var dx0 = a0.x - a1.x, dy0 = a0.y - a1.y;
						var adjB0 = _bondLookup[a1.id + ',' + a0.id];
						var adjIsDouble = adjB0 && adjB0.type === 'double' && _ringBondSet[a1.id < a0.id ? a1.id+','+a0.id : a0.id+','+a1.id];
						if (adjIsDouble) {
							/* 인접 결합도 이중결합 → 두 offset line의 교차점 */
							var ao = _adjOffset(a1, a0, o);
							if (ao) {
								var Dx = ao.ox - offNx, Dy = ao.oy - offNy;
								var det1 = -ux * ao.uy + uy * ao.ux;
								if (Math.abs(det1) > 0.001) {
									var t1 = (-Dx * ao.uy + Dy * ao.ux) / det1;
									ix1 = a1.x + offNx + t1 * ux;
									iy1 = a1.y + offNy + t1 * uy;
								}
							}
						} else {
							/* 인접 결합이 단일결합 → 외곽선과 교차 */
							var det1 = ux * dy0 - uy * dx0;
							if (Math.abs(det1) > 0.001) {
								var t1 = (offNx * dy0 - offNy * dx0) / det1;
								ix1 = a1.x + offNx + t1 * ux;
								iy1 = a1.y + offNy + t1 * uy;
							}
						}
					}
					/* ── a2 쪽 내부선 끝점 ── */
					var rn2 = _ringNeighbors[a2.id] || [];
					var a3 = null;
					for (var _ri = 0; _ri < rn2.length; _ri++) { if (rn2[_ri] !== a1.id) { a3 = atomMap[rn2[_ri]]; break; } }
					if (a3) {
						var dx3 = a3.x - a2.x, dy3 = a3.y - a2.y;
						var adjB3 = _bondLookup[a2.id + ',' + a3.id];
						var adjIsDouble3 = adjB3 && adjB3.type === 'double' && _ringBondSet[a2.id < a3.id ? a2.id+','+a3.id : a3.id+','+a2.id];
						if (adjIsDouble3) {
							/* 인접 결합도 이중결합 → 두 offset line의 교차점 */
							var ao3 = _adjOffset(a2, a3, o);
							if (ao3) {
								var Dx3 = ao3.ox - offNx, Dy3 = ao3.oy - offNy;
								var det2 = ux * ao3.uy - uy * ao3.ux;
								if (Math.abs(det2) > 0.001) {
									var t2 = (-Dx3 * ao3.uy + Dy3 * ao3.ux) / det2;
									ix2 = a2.x + offNx + t2 * (-ux);
									iy2 = a2.y + offNy + t2 * (-uy);
								}
							}
						} else {
							/* 인접 결합이 단일결합 → 외곽선과 교차 */
							var det2 = (-ux) * dy3 - (-uy) * dx3;
							if (Math.abs(det2) > 0.001) {
								var t2 = (offNx * dy3 - offNy * dx3) / det2;
								ix2 = a2.x + offNx + t2 * (-ux);
								iy2 = a2.y + offNy + t2 * (-uy);
							}
						}
					}
					html += '<line x1="'+ix1+'" y1="'+iy1+'" x2="'+ix2+'" y2="'+iy2+'" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="round"/>';
				} else {
					/* 체인 결합(C=O 등): 두 선 동일 길이, 중심 대칭 */
					var half = 2.5;
					html += '<line x1="'+(x1-nx*half*side)+'" y1="'+(y1-ny*half*side)+'" x2="'+(x2-nx*half*side)+'" y2="'+(y2-ny*half*side)+'" stroke="'+col+'" stroke-width="'+sw+'"/>';
					html += '<line x1="'+(x1+nx*half*side)+'" y1="'+(y1+ny*half*side)+'" x2="'+(x2+nx*half*side)+'" y2="'+(y2+ny*half*side)+'" stroke="'+col+'" stroke-width="'+sw+'"/>';
				}
			} else if (b.type === 'triple') {
				var o2=4.5;
				html += '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+col+'" stroke-width="'+sw+'"/>';
				html += '<line x1="'+(x1+nx*o2)+'" y1="'+(y1+ny*o2)+'" x2="'+(x2+nx*o2)+'" y2="'+(y2+ny*o2)+'" stroke="'+col+'" stroke-width="'+sw+'"/>';
				html += '<line x1="'+(x1-nx*o2)+'" y1="'+(y1-ny*o2)+'" x2="'+(x2-nx*o2)+'" y2="'+(y2-ny*o2)+'" stroke="'+col+'" stroke-width="'+sw+'"/>';
			}
		});
		return html;
	}
	function renderChargeSVG(cx, cy, charge, S) {
		if (!charge) return '';
		/* charge: 1=⊕, -1=⊖, 2=+, -2=- */
		var isPlain = Math.abs(charge) === 2;
		var isPositive = charge > 0;
		var sym = isPositive ? '+' : '\u2212';
		var col = isPositive ? '#e53935' : '#1565c0';
		if (isPlain) {
			/* 동그라미 없는 +/- */
			return '<text x="'+cx+'" y="'+(cy+0.5)+'" text-anchor="middle" dominant-baseline="middle" font-size="'+(12*S)+'" font-weight="700" fill="'+col+'" style="pointer-events:none">'+sym+'</text>';
		}
		var r = 6 * S;
		return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#fff" stroke="'+col+'" stroke-width="1.2"/>' +
			'<text x="'+cx+'" y="'+(cy+0.5)+'" text-anchor="middle" dominant-baseline="middle" font-size="'+(10*S)+'" font-weight="700" fill="'+col+'" style="pointer-events:none">'+sym+'</text>';
	}
	function renderAtomsSVG(selAtomId, bondStartId, dragGroup) {
		var html = '';
		var BASE_CW = 8.4, BASE_FS = 14, BASE_SUB_FS = 10, BASE_SUB_CW = 6, BASE_PX = 3, BASE_PY = 3;
		var hasGroup = dragGroup && Object.keys(dragGroup).length > 0;
		atoms.forEach(function(a) {
			var info = ELEMENTS[a.element] || ELEMENTS.C;
			var S = a.scale || 1;
			var CW = BASE_CW*S, FS = BASE_FS*S, SUB_FS = BASE_SUB_FS*S, SUB_CW = BASE_SUB_CW*S, PX = BASE_PX*S, PY = BASE_PY*S;
			var sr = info.radius * S;
			var isSel = (ed2d.selectedAtoms.indexOf(a.id) >= 0) || a.id === selAtomId;
			var isBs = a.id === bondStartId;
			var isHov = (a.id === ed2d.hoveredAtom);
			var isDrag = hasGroup && dragGroup[a.id];
			var isBeingDragged = ed2d.isDragging && isSel;
			/* Glow colors */
			var glowCol = isSel ? '#1565c0' : isHov ? '#42a5f5' : null;
			var glowOp = isSel ? 0.18 : isHov ? 0.12 : 0;
			var scaleAttr = isBeingDragged ? ' transform="translate('+a.x+','+a.y+') scale(1.1) translate('+-a.x+','+-a.y+')"' : (isHov && !isSel ? ' transform="translate('+a.x+','+a.y+') scale(1.05) translate('+-a.x+','+-a.y+')"' : '');

			if (showImplicitH) {
				var label = getAtomLabel(a);
				if (label.hide) {
					/* Glow ring for hidden-label atoms */
					var hr = 14*S;
					if (glowCol) html += '<circle cx="'+a.x+'" cy="'+a.y+'" r="'+hr+'" fill="rgba('+( isSel ? '21,101,192' : '66,165,245')+','+glowOp+')" stroke="'+glowCol+'" stroke-width="1.5"'+scaleAttr+'/>';
					if (isDrag) html += '<circle cx="'+a.x+'" cy="'+a.y+'" r="'+hr+'" fill="rgba(21,101,192,0.12)" stroke="#1565c0" stroke-width="1.5" stroke-dasharray="3 2"/>';
					if (isBs) html += '<circle cx="'+a.x+'" cy="'+a.y+'" r="'+(12*S)+'" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="4 2"/>';
					html += '<circle cx="'+a.x+'" cy="'+a.y+'" r="'+(8*S)+'" fill="transparent" style="cursor:pointer"'+scaleAttr+'/>';
					/* Charge badge */
					if (a.charge) html += renderChargeSVG(a.x + 10*S, a.y - 10*S, a.charge, S);
					/* Resize handle for selected hidden-label atom */
					if (isSel && ed2d.selectedAtoms.length === 1) {
						var hx = a.x + hr + 2, hy = a.y + hr + 2;
						html += '<rect x="'+(hx-3.5)+'" y="'+(hy-3.5)+'" width="7" height="7" fill="#1565c0" stroke="#fff" stroke-width="1" rx="1" style="cursor:nwse-resize" data-resize-atom="'+a.id+'"/>';
					}
					return;
				}
				var text = label.text, anchor = label.anchor;
				var parts = parseLabelParts(text);
				var textW = 0;
				parts.forEach(function(p){ textW += p.sub ? SUB_CW*p.ch.length : CW*p.ch.length; });
				var rx, startX;
				if (anchor==='start') { rx=a.x-PX; startX=a.x; }
				else if (anchor==='end') { rx=a.x-textW-PX; startX=a.x-textW; }
				else { rx=a.x-textW/2-PX; startX=a.x-textW/2; }
				var rw=textW+PX*2, ry=a.y-FS/2-PY, rh=FS+PY*2;
				/* Glow rect */
				if (glowCol) html += '<rect x="'+(rx-4)+'" y="'+(ry-4)+'" width="'+(rw+8)+'" height="'+(rh+8)+'" fill="rgba('+( isSel ? '21,101,192' : '66,165,245')+','+glowOp+')" stroke="'+glowCol+'" stroke-width="1.5" rx="5"'+scaleAttr+'/>';
				if (isDrag) html += '<rect x="'+(rx-5)+'" y="'+(ry-5)+'" width="'+(rw+10)+'" height="'+(rh+10)+'" fill="rgba(21,101,192,0.12)" stroke="#1565c0" stroke-width="1.5" rx="5" stroke-dasharray="3 2"/>';
				if (isBs) html += '<rect x="'+(rx-3)+'" y="'+(ry-3)+'" width="'+(rw+6)+'" height="'+(rh+6)+'" fill="none" stroke="#10b981" stroke-width="2" rx="3" stroke-dasharray="4 2"/>';
				html += '<rect x="'+rx+'" y="'+ry+'" width="'+rw+'" height="'+rh+'" fill="transparent" style="cursor:pointer"'+scaleAttr+'/>';
				var textCol = (info.color==='#FFFFFF'||info.color==='#FFFF30'||info.color==='#F0C8A0') ? '#333' : info.color;
				var cx = startX;
				parts.forEach(function(p){
					var fs = p.sub ? SUB_FS : FS;
					var w = p.sub ? SUB_CW*p.ch.length : CW*p.ch.length;
					var py = p.sub ? a.y+5*S : a.y+1;
					html += '<text x="'+(cx+w/2)+'" y="'+py+'" text-anchor="middle" dominant-baseline="middle" font-size="'+fs+'" font-weight="bold" font-family="'+(a.font||chemFont)+',sans-serif" fill="'+textCol+'" style="pointer-events:none"'+scaleAttr+'>'+p.ch+'</text>';
					cx += w;
				});
				/* Charge badge */
				if (a.charge) html += renderChargeSVG(rx + rw + 4*S, ry - 2*S, a.charge, S);
				/* Resize handle for selected text-label atom */
				if (isSel && ed2d.selectedAtoms.length === 1) {
					var hx = rx + rw + 2, hy = ry + rh + 2;
					html += '<rect x="'+(hx-3.5)+'" y="'+(hy-3.5)+'" width="7" height="7" fill="#1565c0" stroke="#fff" stroke-width="1" rx="1" style="cursor:nwse-resize" data-resize-atom="'+a.id+'"/>';
				}
			} else {
				if (a.hideLabel) {
					if (glowCol) html += '<circle cx="'+a.x+'" cy="'+a.y+'" r="'+(14*S)+'" fill="rgba('+( isSel ? '21,101,192' : '66,165,245')+','+glowOp+')" stroke="'+glowCol+'" stroke-width="1.5"'+scaleAttr+'/>';
					html += '<circle cx="'+a.x+'" cy="'+a.y+'" r="'+(8*S)+'" fill="transparent" style="cursor:pointer"'+scaleAttr+'/>';
				} else {
				/* Glow circle */
				if (glowCol) html += '<circle cx="'+a.x+'" cy="'+a.y+'" r="'+(sr+6)+'" fill="rgba('+( isSel ? '21,101,192' : '66,165,245')+','+glowOp+')" stroke="'+glowCol+'" stroke-width="1.5"'+scaleAttr+'/>';
				if (isDrag) html += '<circle cx="'+a.x+'" cy="'+a.y+'" r="'+(sr+8)+'" fill="rgba(21,101,192,0.12)" stroke="#1565c0" stroke-width="1.5" stroke-dasharray="3 2"/>';
				if (isBs) html += '<circle cx="'+a.x+'" cy="'+a.y+'" r="'+(sr+6)+'" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="4 2"/>';
				var stroke = info.color==='#FFFFFF' ? '#999' : '#00000033';
				html += '<circle cx="'+a.x+'" cy="'+a.y+'" r="'+sr+'" fill="'+info.color+'" stroke="'+stroke+'" stroke-width="1.5" style="cursor:pointer"'+scaleAttr+'/>';
				var tc = LIGHT_COLORS.indexOf(info.color)>=0 ? '#333' : '#fff';
				var fs2 = sr<15 ? 9*S : 11*S;
				html += '<text x="'+a.x+'" y="'+(a.y+1)+'" text-anchor="middle" dominant-baseline="middle" font-size="'+fs2+'" font-weight="bold" font-family="'+(a.font||chemFont)+',sans-serif" fill="'+tc+'" style="pointer-events:none"'+scaleAttr+'>'+a.element+'</text>';
				/* Charge badge */
				if (a.charge) html += renderChargeSVG(a.x + sr*0.7, a.y - sr*0.7, a.charge, S);
				/* Resize handle for selected circle atom */
				if (isSel && ed2d.selectedAtoms.length === 1) {
					var ang = Math.PI / 4;
					var hx = a.x + (sr + 4) * Math.cos(ang), hy = a.y + (sr + 4) * Math.sin(ang);
					html += '<rect x="'+(hx-3.5)+'" y="'+(hy-3.5)+'" width="7" height="7" fill="#1565c0" stroke="#fff" stroke-width="1" rx="1" style="cursor:nwse-resize" data-resize-atom="'+a.id+'"/>';
				}
				}
			}
		});
		return html;
	}
	function parseLabelParts(text) {
		var parts = [];
		for (var i=0; i<text.length; i++) {
			var ch = text[i];
			if (ch>='0' && ch<='9') { parts.push({ch:ch, sub:true}); }
			else if (i+1<text.length && text[i+1]>='a' && text[i+1]<='z') { parts.push({ch:ch+text[i+1], sub:false}); i++; }
			else { parts.push({ch:ch, sub:false}); }
		}
		return parts;
	}

	/* ═══════════════════════════════════════════════════════
	   Bracket helpers
	   ═══════════════════════════════════════════════════════ */
	function findBracketAt(x, y) {
		var arm = 8, tol = 10;
		for (var i = brackets.length - 1; i >= 0; i--) {
			var br = brackets[i];
			// left bracket [
			if (Math.abs(x - br.x1) < tol && y >= br.y1 - tol && y <= br.y2 + tol) return br;
			if (Math.abs(y - br.y1) < tol && x >= br.x1 - tol && x <= br.x1 + arm + tol) return br;
			if (Math.abs(y - br.y2) < tol && x >= br.x1 - tol && x <= br.x1 + arm + tol) return br;
			// right bracket ]
			if (Math.abs(x - br.x2) < tol && y >= br.y1 - tol && y <= br.y2 + tol) return br;
			if (Math.abs(y - br.y1) < tol && x >= br.x2 - arm - tol && x <= br.x2 + tol) return br;
			if (Math.abs(y - br.y2) < tol && x >= br.x2 - arm - tol && x <= br.x2 + tol) return br;
		}
		return null;
	}
	/* 선택된 bracket의 리사이즈 핸들 감지: 코너/엣지 반환 */
	function findBracketHandle(x, y) {
		var ht = 7; /* handle tolerance */
		var ids = ed2d.selectedBrackets.length ? ed2d.selectedBrackets : (ed2d.selectedBracket ? [ed2d.selectedBracket] : []);
		for (var i = 0; i < ids.length; i++) {
			var br = brackets.find(function(b) { return b.id === ids[i]; });
			if (!br) continue;
			/* 코너 우선 검사 */
			if (Math.abs(x - br.x1) < ht && Math.abs(y - br.y1) < ht) return { br: br, edge: 'tl' };
			if (Math.abs(x - br.x2) < ht && Math.abs(y - br.y1) < ht) return { br: br, edge: 'tr' };
			if (Math.abs(x - br.x1) < ht && Math.abs(y - br.y2) < ht) return { br: br, edge: 'bl' };
			if (Math.abs(x - br.x2) < ht && Math.abs(y - br.y2) < ht) return { br: br, edge: 'br' };
			/* 엣지 검사 */
			if (Math.abs(x - br.x1) < ht && y > br.y1 + ht && y < br.y2 - ht) return { br: br, edge: 'l' };
			if (Math.abs(x - br.x2) < ht && y > br.y1 + ht && y < br.y2 - ht) return { br: br, edge: 'r' };
			if (Math.abs(y - br.y1) < ht && x > br.x1 + ht && x < br.x2 - ht) return { br: br, edge: 't' };
			if (Math.abs(y - br.y2) < ht && x > br.x1 + ht && x < br.x2 - ht) return { br: br, edge: 'b' };
		}
		return null;
	}
	var BRACKET_HANDLE_CURSORS = { tl:'nwse-resize', tr:'nesw-resize', bl:'nesw-resize', br:'nwse-resize', l:'ew-resize', r:'ew-resize', t:'ns-resize', b:'ns-resize' };
	/* 선택된 atom의 리사이즈 핸들 감지 */
	function findAtomResizeHandle(x, y) {
		if (ed2d.selectedAtoms.length !== 1) return null;
		var a = atomMap[ed2d.selectedAtoms[0]];
		if (!a) return null;
		var info = ELEMENTS[a.element] || ELEMENTS.C;
		var S = a.scale || 1;
		var ht = 8;
		if (showImplicitH) {
			var label = getAtomLabel(a);
			if (label.hide) {
				var hr = 14*S;
				var hx = a.x + hr + 2, hy = a.y + hr + 2;
				if (Math.abs(x - hx) < ht && Math.abs(y - hy) < ht) return a;
			} else {
				var CW = 8.4*S, FS = 14*S, SUB_CW = 6*S, PX = 3*S, PY = 3*S;
				var parts = parseLabelParts(label.text);
				var textW = 0;
				parts.forEach(function(p){ textW += p.sub ? SUB_CW*p.ch.length : CW*p.ch.length; });
				var anchor = label.anchor, rx;
				if (anchor==='start') rx = a.x - PX;
				else if (anchor==='end') rx = a.x - textW - PX;
				else rx = a.x - textW/2 - PX;
				var rw = textW + PX*2, ry = a.y - FS/2 - PY, rh = FS + PY*2;
				var hx = rx + rw + 2, hy = ry + rh + 2;
				if (Math.abs(x - hx) < ht && Math.abs(y - hy) < ht) return a;
			}
		} else {
			if (!a.hideLabel) {
				var sr = info.radius * S;
				var ang = Math.PI / 4;
				var hx = a.x + (sr + 4) * Math.cos(ang), hy = a.y + (sr + 4) * Math.sin(ang);
				if (Math.abs(x - hx) < ht && Math.abs(y - hy) < ht) return a;
			}
		}
		return null;
	}
	/* 선택 바운딩 박스 리사이즈 핸들 감지 */
	function findSelBoxHandle(x, y) {
		var box = ed2d._selBox;
		if (!box || ed2d.selectedAtoms.length < 2) return null;
		var ht = 8;
		var bx = box.x, by = box.y, bw = box.w, bh = box.h;
		var mx = bx + bw/2, my = by + bh/2;
		/* 코너 */
		if (Math.abs(x - bx) < ht && Math.abs(y - by) < ht) return 'tl';
		if (Math.abs(x - (bx+bw)) < ht && Math.abs(y - by) < ht) return 'tr';
		if (Math.abs(x - bx) < ht && Math.abs(y - (by+bh)) < ht) return 'bl';
		if (Math.abs(x - (bx+bw)) < ht && Math.abs(y - (by+bh)) < ht) return 'br';
		/* 엣지 중앙 */
		if (Math.abs(x - bx) < ht && Math.abs(y - my) < ht) return 'l';
		if (Math.abs(x - (bx+bw)) < ht && Math.abs(y - my) < ht) return 'r';
		if (Math.abs(x - mx) < ht && Math.abs(y - by) < ht) return 't';
		if (Math.abs(x - mx) < ht && Math.abs(y - (by+bh)) < ht) return 'b';
		return null;
	}
	function renderBracketsSVG(selectedBracketId) {
		var html = '';
		var arm = 8, hs = 5; /* handle size */
		brackets.forEach(function(br) {
			var isSel = br.id === selectedBracketId || ed2d.selectedBrackets.indexOf(br.id) >= 0;
			var isHov = (br.id === ed2d.hoveredBracket);
			var col = isSel ? '#1565c0' : isHov ? '#42a5f5' : '#333';
			var sw = isSel ? 3 : isHov ? 3 : 2.5;
			// Left bracket [
			html += '<polyline points="'+(br.x1+arm)+','+br.y1+' '+br.x1+','+br.y1+' '+br.x1+','+br.y2+' '+(br.x1+arm)+','+br.y2+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round"/>';
			// Right bracket ]
			html += '<polyline points="'+(br.x2-arm)+','+br.y1+' '+br.x2+','+br.y1+' '+br.x2+','+br.y2+' '+(br.x2-arm)+','+br.y2+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round"/>';
			// Subscript
			if (br.subscript) {
				html += '<text x="'+(br.x2+4)+'" y="'+(br.y2+4)+'" font-size="14" font-weight="bold" font-family="'+(br.font||chemFont)+',sans-serif" fill="'+col+'" dominant-baseline="hanging">'+br.subscript+'</text>';
			}
			// Resize handles (선택 시)
			if (isSel) {
				var hc = '#1565c0';
				[[br.x1,br.y1],[br.x2,br.y1],[br.x1,br.y2],[br.x2,br.y2]].forEach(function(p) {
					html += '<rect x="'+(p[0]-hs)+'" y="'+(p[1]-hs)+'" width="'+(hs*2)+'" height="'+(hs*2)+'" fill="white" stroke="'+hc+'" stroke-width="1.5" rx="1.5"/>';
				});
				/* 엣지 중앙 핸들 */
				var mx = (br.x1+br.x2)/2, my = (br.y1+br.y2)/2;
				[[br.x1,my],[br.x2,my],[mx,br.y1],[mx,br.y2]].forEach(function(p) {
					html += '<rect x="'+(p[0]-hs+1)+'" y="'+(p[1]-hs+1)+'" width="'+(hs*2-2)+'" height="'+(hs*2-2)+'" fill="white" stroke="'+hc+'" stroke-width="1" rx="1"/>';
				});
			}
		});
		return html;
	}

	/* ═══════════════════════════════════════════════════════
	   Connected group finder
	   ═══════════════════════════════════════════════════════ */
	function findConnectedGroup(startAtomId) {
		var visited = {};
		var queue = [startAtomId];
		visited[startAtomId] = true;
		while (queue.length > 0) {
			var cur = queue.shift();
			var adj = bondAdj[cur];
			if (adj) { for (var i = 0; i < adj.length; i++) { var nid = adj[i].to; if (!visited[nid]) { visited[nid] = true; queue.push(nid); } } }
		}
		return visited;
	}

	/* ═══════════════════════════════════════════════════════
	   [TAB 1] 2D Editor
	   ═══════════════════════════════════════════════════════ */
	var ed2d = {
		svgEl: null, containerEl: null,
		tool: 'select', selectedAtom: null, selectedBond: null, selectedBracket: null,
		dragging: null, bondStart: null,
		mousePos: { x: 0, y: 0 }, showGrid: true, _resizeObs: null,
		_dragGroup: null, _alignGuides: [], _shiftLockAxis: null, _shiftOnMouseDown: false,
		/* PowerPoint-style unified Select state */
		hoveredAtom: -1, hoveredBond: -1, hoveredBracket: -1,
		selectedAtoms: [], selectedBonds: [], selectedBrackets: [],
		rubberBand: null,
		isDragging: false, mouseDownPos: null, mouseDownTarget: null,
		dragOffsets: [], bracketDragOffsets: [],
		_rotating: null, _rotateHandlePos: null, _bracketResize: null, _atomResize: null, _ringDrag: null, _selResize: null, _selBox: null,
		lastClickTime: 0, lastClickAtomId: -1, lastClickBondId: -1,
		DRAG_THRESHOLD: 5, DBLCLICK_MS: 400,
		ELEMENT_CYCLE: ['C','N','O','S','P','F','Cl','Br','I','Si','H']
	};
	ed2d.getPos = function(e) {
		var rect = ed2d.svgEl.getBoundingClientRect();
		var cx = e.touches ? e.touches[0].clientX : e.clientX;
		var cy = e.touches ? e.touches[0].clientY : e.clientY;
		return { x: cx - rect.left, y: cy - rect.top };
	};
	ed2d.onMouseDown = function(e) {
		e.preventDefault();
		if (e.button !== 0) return; /* 좌클릭만 처리 (우클릭은 contextmenu로) */
		var pos = ed2d.getPos(e);

		/* ── Atom (element placement) tool: mouseDown에서 준비만, mouseUp에서 배치 ── */
		if (ed2d.tool === 'atom' && selectedElement) {
			var clickedAtom = findAtomAt(pos.x, pos.y);
			ed2d._atomPending = { pos: pos, clickedAtom: clickedAtom };
			/* select 모드 드래그/러버밴드 대비 상태 세팅 */
			ed2d.mouseDownPos = { x: pos.x, y: pos.y };
			ed2d.isDragging = false;
			if (clickedAtom) {
				ed2d.mouseDownTarget = { type: 'atom', id: clickedAtom.id };
				if (ed2d.selectedAtoms.indexOf(clickedAtom.id) < 0) {
					ed2d.selectedAtoms = [clickedAtom.id];
					ed2d.selectedBonds = [];
					ed2d.selectedBrackets = [];
				}
				ed2d.dragOffsets = ed2d.selectedAtoms.map(function(id) {
					var a = atomMap[id];
					return a ? { id: id, ox: a.x - pos.x, oy: a.y - pos.y } : null;
				}).filter(Boolean);
				ed2d.bracketDragOffsets = ed2d.selectedBrackets.map(function(id) {
					var br = brackets.find(function(b) { return b.id === id; });
					return br ? { id: id, ox1: br.x1 - pos.x, oy1: br.y1 - pos.y, ox2: br.x2 - pos.x, oy2: br.y2 - pos.y } : null;
				}).filter(Boolean);
			} else {
				ed2d.mouseDownTarget = null;
			}
			return;
		}

		/* ── Ring tool (드래그로 크기 결정) ── */
		if (ed2d.tool === 'ring' && selectedRing) {
			ed2d._ringDrag = { sx: pos.x, sy: pos.y, type: selectedRing };
			return;
		}

		/* ── Bond tool (드래그 방식: mouseDown에서 시작, mouseUp에서 연결) ── */
		if (ed2d.tool === 'bond') {
			var atom = findAtomAt(pos.x, pos.y);
			if (atom) {
				ed2d.bondStart = atom.id;
				ed2d.bondDragging = true;
			} else {
				/* 빈 공간 클릭 → bond 모드 해제, select 모드 복귀 */
				ed2d.bondStart = null;
				ed2d.bondDragging = false;
				setBondTypeUI(null);
				setTool('select');
			}
			ed2d.render();
			return;
		}

		/* ── Free rotation commit (click to finish) ── */
		if (ed2d._rotating && ed2d._rotating.mode === 'free') {
			cdCommitRotation(); return;
		}
		/* ── Rotation handle drag start ── */
		if (ed2d.tool === 'select' && ed2d._rotateHandlePos && ed2d.selectedAtoms.length >= 2) {
			var _rh = ed2d._rotateHandlePos;
			if (Math.sqrt(Math.pow(pos.x - _rh.x, 2) + Math.pow(pos.y - _rh.y, 2)) < 14) {
				cdStartRotation(pos, 'drag'); return;
			}
		}
		/* ── Selection bounding box resize handle ── */
		if (ed2d.tool === 'select' && ed2d._selBox && ed2d.selectedAtoms.length >= 2) {
			var _srEdge = findSelBoxHandle(pos.x, pos.y);
			if (_srEdge) {
				var box = ed2d._selBox;
				var cx = box.x + box.w / 2, cy = box.y + box.h / 2;
				ed2d._selResize = {
					edge: _srEdge, cx: cx, cy: cy,
					origBox: { x: box.x, y: box.y, w: box.w, h: box.h },
					startPos: { x: pos.x, y: pos.y },
					origAtoms: ed2d.selectedAtoms.map(function(id) {
						var a = atomMap[id];
						return a ? { id: id, x: a.x, y: a.y } : null;
					}).filter(Boolean),
					origBrackets: ed2d.selectedBrackets.map(function(id) {
						var br = brackets.find(function(b) { return b.id === id; });
						return br ? { id: id, x1: br.x1, y1: br.y1, x2: br.x2, y2: br.y2 } : null;
					}).filter(Boolean)
				};
				ed2d.svgEl.style.cursor = BRACKET_HANDLE_CURSORS[_srEdge];
				return;
			}
		}
		/* ── Atom resize handle (선택된 원자 1개의 리사이즈 핸들) ── */
		if (ed2d.tool === 'select' && ed2d.selectedAtoms.length === 1) {
			var arAtom = findAtomResizeHandle(pos.x, pos.y);
			if (arAtom) {
				var _arInfo = ELEMENTS[arAtom.element] || ELEMENTS.C;
				ed2d._atomResize = { id: arAtom.id, origScale: arAtom.scale || 1, baseRadius: _arInfo.radius };
				ed2d.svgEl.style.cursor = 'nwse-resize';
				return;
			}
		}
		/* ── Select tool (PowerPoint style) ── */
		ed2d.mouseDownPos = { x: pos.x, y: pos.y };
		ed2d.isDragging = false;
		ed2d._shiftOnMouseDown = e.shiftKey; /* shift+click 그룹선택 vs 드래그 중 축잠금 구분 */

		var clickedAtom = findAtomAt(pos.x, pos.y);
		if (clickedAtom) {
			ed2d.mouseDownTarget = { type: 'atom', id: clickedAtom.id };
			/* Ctrl+click: toggle single atom */
			if (e.ctrlKey || e.metaKey) {
				var ci = ed2d.selectedAtoms.indexOf(clickedAtom.id);
				if (ci >= 0) ed2d.selectedAtoms.splice(ci, 1); else ed2d.selectedAtoms.push(clickedAtom.id);
			}
			/* Shift+click: select entire connected group (이미 선택된 경우 드래그 준비) */
			else if (e.shiftKey) {
				var grp = findConnectedGroup(clickedAtom.id);
				var grpIds = Object.keys(grp).map(Number);
				var alreadySelected = ed2d.selectedAtoms.indexOf(clickedAtom.id) >= 0;
				if (!alreadySelected) {
					/* 미선택 원자 → 연결된 그룹 전체 선택 */
					grpIds.forEach(function(id) { if (ed2d.selectedAtoms.indexOf(id) < 0) ed2d.selectedAtoms.push(id); });
					/* 그룹에 속한 본드도 선택 */
					bonds.forEach(function(b) { if (grp[b.from] && grp[b.to] && ed2d.selectedBonds.indexOf(b.id) < 0) ed2d.selectedBonds.push(b.id); });
				}
				/* 이미 선택된 원자 shift+click → 해제 안 함, 드래그 준비만 */
			}
			/* Normal click */
			else {
				if (ed2d.selectedAtoms.indexOf(clickedAtom.id) < 0) {
					ed2d.selectedAtoms = [clickedAtom.id];
					ed2d.selectedBonds = [];
					ed2d.selectedBrackets = [];
				}
			}
			/* Prepare drag offsets for atoms + selected brackets */
			ed2d.dragOffsets = ed2d.selectedAtoms.map(function(id) {
				var a = atomMap[id];
				return a ? { id: id, ox: a.x - pos.x, oy: a.y - pos.y } : null;
			}).filter(Boolean);
			ed2d.bracketDragOffsets = ed2d.selectedBrackets.map(function(id) {
				var br = brackets.find(function(b) { return b.id === id; });
				return br ? { id: id, ox1: br.x1 - pos.x, oy1: br.y1 - pos.y, ox2: br.x2 - pos.x, oy2: br.y2 - pos.y } : null;
			}).filter(Boolean);
			ed2d.selectedBracket = null;
			ed2d.render();
			return;
		}

		var clickedBond = findBondAt(pos.x, pos.y);
		if (clickedBond) {
			ed2d.mouseDownTarget = { type: 'bond', id: clickedBond.id };
			/* Ctrl+click: toggle single bond */
			if (e.ctrlKey || e.metaKey) {
				var bi = ed2d.selectedBonds.indexOf(clickedBond.id);
				if (bi >= 0) ed2d.selectedBonds.splice(bi, 1); else ed2d.selectedBonds.push(clickedBond.id);
			}
			/* Shift+click: toggle (기존) */
			else if (e.shiftKey) {
				var bi = ed2d.selectedBonds.indexOf(clickedBond.id);
				if (bi >= 0) ed2d.selectedBonds.splice(bi, 1); else ed2d.selectedBonds.push(clickedBond.id);
			} else {
				if (ed2d.selectedBonds.indexOf(clickedBond.id) < 0) {
					ed2d.selectedBonds = [clickedBond.id];
					ed2d.selectedAtoms = [];
					ed2d.selectedBrackets = [];
				}
			}
			ed2d.selectedBracket = null;
			ed2d.render();
			return;
		}

		/* Bracket resize handle 감지 (선택된 bracket의 코너/엣지) */
		var brHandle = findBracketHandle(pos.x, pos.y);
		if (brHandle) {
			ed2d._bracketResize = { id: brHandle.br.id, edge: brHandle.edge, origX1: brHandle.br.x1, origY1: brHandle.br.y1, origX2: brHandle.br.x2, origY2: brHandle.br.y2 };
			ed2d.svgEl.style.cursor = BRACKET_HANDLE_CURSORS[brHandle.edge];
			return;
		}

		var clickedBr = findBracketAt(pos.x, pos.y);
		if (clickedBr) {
			ed2d.mouseDownTarget = { type: 'bracket', id: clickedBr.id };
			/* Ctrl+click: toggle single bracket */
			if (e.ctrlKey || e.metaKey) {
				var bi = ed2d.selectedBrackets.indexOf(clickedBr.id);
				if (bi >= 0) ed2d.selectedBrackets.splice(bi, 1); else ed2d.selectedBrackets.push(clickedBr.id);
			}
			/* Shift+click: toggle (기존) */
			else if (e.shiftKey) {
				var bi = ed2d.selectedBrackets.indexOf(clickedBr.id);
				if (bi >= 0) ed2d.selectedBrackets.splice(bi, 1); else ed2d.selectedBrackets.push(clickedBr.id);
			} else {
				if (ed2d.selectedBrackets.indexOf(clickedBr.id) < 0) {
					ed2d.selectedBrackets = [clickedBr.id];
					ed2d.selectedAtoms = [];
					ed2d.selectedBonds = [];
				}
			}
			ed2d.selectedBracket = clickedBr.id;
			/* Prepare drag offsets for brackets + selected atoms */
			ed2d.bracketDragOffsets = ed2d.selectedBrackets.map(function(id) {
				var br = brackets.find(function(b) { return b.id === id; });
				return br ? { id: id, ox1: br.x1 - pos.x, oy1: br.y1 - pos.y, ox2: br.x2 - pos.x, oy2: br.y2 - pos.y } : null;
			}).filter(Boolean);
			ed2d.dragOffsets = ed2d.selectedAtoms.map(function(id) {
				var a = atomMap[id];
				return a ? { id: id, ox: a.x - pos.x, oy: a.y - pos.y } : null;
			}).filter(Boolean);
			ed2d.render();
			return;
		}

		/* Empty space mousedown → prepare rubber band */
		ed2d.mouseDownTarget = null;
		if (!e.shiftKey) { ed2d.selectedAtoms = []; ed2d.selectedBonds = []; ed2d.selectedBrackets = []; ed2d.selectedBracket = null; }
		ed2d.render();
	};
	ed2d.onMouseMove = function(e) {
		var pos = ed2d.getPos(e);
		ed2d.mousePos = pos;

		/* ── Active rotation ── */
		if (ed2d._rotating) { cdDoRotation(pos); return; }

		/* ── Atom resize drag ── */
		if (ed2d._atomResize) {
			var ar = ed2d._atomResize;
			var a = atomMap[ar.id];
			if (a) {
				var dist = Math.hypot(pos.x - a.x, pos.y - a.y);
				var info = ELEMENTS[a.element] || ELEMENTS.C;
				var newScale = Math.max(0.3, Math.min(4.0, dist / info.radius));
				a.scale = Math.round(newScale * 20) / 20; /* 0.05 단위 snap */
				scheduleRender();
			}
			return;
		}

		/* ── Bracket resize drag ── */
		if (ed2d._bracketResize) {
			var rs = ed2d._bracketResize;
			var br = brackets.find(function(b) { return b.id === rs.id; });
			if (br) {
				var minSize = 20;
				if (rs.edge === 'l' || rs.edge === 'tl' || rs.edge === 'bl') br.x1 = Math.min(pos.x, br.x2 - minSize);
				if (rs.edge === 'r' || rs.edge === 'tr' || rs.edge === 'br') br.x2 = Math.max(pos.x, br.x1 + minSize);
				if (rs.edge === 't' || rs.edge === 'tl' || rs.edge === 'tr') br.y1 = Math.min(pos.y, br.y2 - minSize);
				if (rs.edge === 'b' || rs.edge === 'bl' || rs.edge === 'br') br.y2 = Math.max(pos.y, br.y1 + minSize);
				scheduleRender();
			}
			return;
		}

		/* ── Selection resize drag ── */
		if (ed2d._selResize) {
			var sr = ed2d._selResize;
			var ob = sr.origBox;
			var edge = sr.edge;
			/* 드래그 거리로 scale factor 계산 */
			var sx = 1, sy = 1;
			if (edge === 'r' || edge === 'tr' || edge === 'br') sx = Math.max(0.1, 1 + (pos.x - sr.startPos.x) / (ob.w / 2));
			if (edge === 'l' || edge === 'tl' || edge === 'bl') sx = Math.max(0.1, 1 - (pos.x - sr.startPos.x) / (ob.w / 2));
			if (edge === 'b' || edge === 'bl' || edge === 'br') sy = Math.max(0.1, 1 + (pos.y - sr.startPos.y) / (ob.h / 2));
			if (edge === 't' || edge === 'tl' || edge === 'tr') sy = Math.max(0.1, 1 - (pos.y - sr.startPos.y) / (ob.h / 2));
			/* 코너: 비율 유지 */
			if (edge === 'tl' || edge === 'tr' || edge === 'bl' || edge === 'br') { var us = (sx + sy) / 2; sx = us; sy = us; }
			/* 엣지: 해당 축만 */
			if (edge === 'l' || edge === 'r') sy = 1;
			if (edge === 't' || edge === 'b') sx = 1;
			sr.origAtoms.forEach(function(orig) {
				var a = atomMap[orig.id];
				if (a) { a.x = sr.cx + (orig.x - sr.cx) * sx; a.y = sr.cy + (orig.y - sr.cy) * sy; }
			});
			sr.origBrackets.forEach(function(orig) {
				var br = brackets.find(function(b) { return b.id === orig.id; });
				if (br) {
					br.x1 = sr.cx + (orig.x1 - sr.cx) * sx; br.y1 = sr.cy + (orig.y1 - sr.cy) * sy;
					br.x2 = sr.cx + (orig.x2 - sr.cx) * sx; br.y2 = sr.cy + (orig.y2 - sr.cy) * sy;
				}
			});
			scheduleRender();
			return;
		}

		/* ── Ring drag preview ── */
		if (ed2d._ringDrag) {
			ed2d._ringDrag.cx = pos.x;
			ed2d._ringDrag.cy = pos.y;
			scheduleRender();
			return;
		}

		/* ── Bond preview ── */
		if (ed2d.tool === 'bond' && ed2d.bondStart) { scheduleRender(); return; }

		/* ── Atom tool: 드래그 감지 시 select 모드 동작으로 전환 ── */
		if (ed2d._atomPending) {
			var ap = ed2d._atomPending;
			var adx = pos.x - ap.pos.x, ady = pos.y - ap.pos.y;
			if (Math.sqrt(adx * adx + ady * ady) > ed2d.DRAG_THRESHOLD) {
				ed2d._atomPending = null; /* pending 해제 → 아래 select 코드 실행 */
				clearElementSelection();
			} else {
				return; /* threshold 미만 → 대기 */
			}
		}

		/* ── Select tool (atom 모드 드래그 시에도 동일 동작) ── */
		if (ed2d.tool === 'select' || (ed2d.tool === 'atom' && !ed2d._atomPending && ed2d.mouseDownPos)) {
			/* Hover detection (only when not dragging/rubber-banding) */
			if (!ed2d.mouseDownPos) {
				/* Rotation handle hover */
				if (ed2d._rotateHandlePos && ed2d.selectedAtoms.length >= 2) {
					var _rh = ed2d._rotateHandlePos;
					if (Math.sqrt(Math.pow(pos.x - _rh.x, 2) + Math.pow(pos.y - _rh.y, 2)) < 14) {
						ed2d.svgEl.style.cursor = "url(\"data:image/svg+xml," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z' fill='%23555'/></svg>") + "\") 12 12, grab";
						return;
					}
				}
				/* Selection box resize handle hover */
				var _srH = findSelBoxHandle(pos.x, pos.y);
				if (_srH) { ed2d.svgEl.style.cursor = BRACKET_HANDLE_CURSORS[_srH]; return; }
				/* Atom resize handle hover */
				var arH = findAtomResizeHandle(pos.x, pos.y);
				if (arH) { ed2d.svgEl.style.cursor = 'nwse-resize'; return; }
				/* Bracket resize handle hover */
				var brH = findBracketHandle(pos.x, pos.y);
				if (brH) { ed2d.svgEl.style.cursor = BRACKET_HANDLE_CURSORS[brH.edge]; return; }

				var ha = findAtomAt(pos.x, pos.y);
				var hb = !ha ? findBondAt(pos.x, pos.y) : null;
				var hbr = (!ha && !hb) ? findBracketAt(pos.x, pos.y) : null;
				var newHA = ha ? ha.id : -1, newHB = hb ? hb.id : -1, newHBR = hbr ? hbr.id : -1;
				if (newHA !== ed2d.hoveredAtom || newHB !== ed2d.hoveredBond || newHBR !== ed2d.hoveredBracket) {
					ed2d.hoveredAtom = newHA; ed2d.hoveredBond = newHB; ed2d.hoveredBracket = newHBR;
					ed2d.svgEl.style.cursor = (ha || hb || hbr) ? 'pointer' : 'crosshair';
					scheduleRender();
				}
				return;
			}

			var dx = pos.x - ed2d.mouseDownPos.x, dy = pos.y - ed2d.mouseDownPos.y;
			var dist = Math.sqrt(dx * dx + dy * dy);

			/* Drag atoms (+ selected brackets) */
			if (ed2d.mouseDownTarget && ed2d.mouseDownTarget.type === 'atom' && ed2d.selectedAtoms.length > 0) {
				if (dist > ed2d.DRAG_THRESHOLD) {
					ed2d.isDragging = true;
					ed2d.svgEl.style.cursor = 'grabbing';
					if (e.shiftKey) {
						/* Shift 누른 상태 → 축 잠금 */
						if (!ed2d._shiftLockAxis) {
							ed2d._shiftLockOrigin = { x: pos.x, y: pos.y };
							ed2d._shiftLockAxis = 'pending';
						}
						if (ed2d._shiftLockAxis === 'pending') {
							var _sdx = Math.abs(pos.x - ed2d._shiftLockOrigin.x);
							var _sdy = Math.abs(pos.y - ed2d._shiftLockOrigin.y);
							if (_sdx > 4 || _sdy > 4) {
								ed2d._shiftLockAxis = (_sdx >= _sdy) ? 'h' : 'v';
							}
						}
						if (ed2d._shiftLockAxis === 'h') {
							var lockY = ed2d._shiftLockOrigin.y;
							ed2d.dragOffsets.forEach(function(off) {
								var a = atomMap[off.id];
								if (a) { a.x = pos.x + off.ox; a.y = lockY + off.oy; }
							});
						} else if (ed2d._shiftLockAxis === 'v') {
							var lockX = ed2d._shiftLockOrigin.x;
							ed2d.dragOffsets.forEach(function(off) {
								var a = atomMap[off.id];
								if (a) { a.x = lockX + off.ox; a.y = pos.y + off.oy; }
							});
						} else {
							var ox = ed2d._shiftLockOrigin.x, oy = ed2d._shiftLockOrigin.y;
							ed2d.dragOffsets.forEach(function(off) {
								var a = atomMap[off.id];
								if (a) { a.x = ox + off.ox; a.y = oy + off.oy; }
							});
						}
					} else {
						/* 자유 이동: shift+click 그룹선택 드래그 또는 일반 드래그 */
						if (!e.shiftKey) { ed2d._shiftLockAxis = null; ed2d._shiftLockOrigin = null; }
						ed2d.dragOffsets.forEach(function(off) {
							var a = atomMap[off.id];
							if (a) { a.x = pos.x + off.ox; a.y = pos.y + off.oy; }
						});
					}
					/* Bracket 이동 */
					var _bkPosX = pos.x, _bkPosY = pos.y;
					if (e.shiftKey && ed2d._shiftLockOrigin) {
						if (ed2d._shiftLockAxis === 'h') { _bkPosY = ed2d._shiftLockOrigin.y; }
						else if (ed2d._shiftLockAxis === 'v') { _bkPosX = ed2d._shiftLockOrigin.x; }
						else { _bkPosX = ed2d._shiftLockOrigin.x; _bkPosY = ed2d._shiftLockOrigin.y; }
					}
					ed2d.bracketDragOffsets.forEach(function(off) {
						var br = brackets.find(function(b) { return b.id === off.id; });
						if (br) { br.x1 = _bkPosX + off.ox1; br.y1 = _bkPosY + off.oy1; br.x2 = _bkPosX + off.ox2; br.y2 = _bkPosY + off.oy2; }
					});
					detectAlignGuides();
					scheduleRender();
				}
				return;
			}

			/* Drag brackets (+ selected atoms) */
			if (ed2d.mouseDownTarget && ed2d.mouseDownTarget.type === 'bracket' && ed2d.selectedBrackets.length > 0) {
				if (dist > ed2d.DRAG_THRESHOLD) {
					ed2d.isDragging = true;
					ed2d.svgEl.style.cursor = 'grabbing';
					ed2d.bracketDragOffsets.forEach(function(off) {
						var br = brackets.find(function(b) { return b.id === off.id; });
						if (br) { br.x1 = pos.x + off.ox1; br.y1 = pos.y + off.oy1; br.x2 = pos.x + off.ox2; br.y2 = pos.y + off.oy2; }
					});
					ed2d.dragOffsets.forEach(function(off) {
						var a = atomMap[off.id];
						if (a) { a.x = pos.x + off.ox; a.y = pos.y + off.oy; }
					});
					detectAlignGuides();
					scheduleRender();
				}
				return;
			}

			/* Rubber band selection (empty space mousedown) */
			if (!ed2d.mouseDownTarget && dist > ed2d.DRAG_THRESHOLD) {
				ed2d.rubberBand = {
					x1: Math.min(ed2d.mouseDownPos.x, pos.x), y1: Math.min(ed2d.mouseDownPos.y, pos.y),
					x2: Math.max(ed2d.mouseDownPos.x, pos.x), y2: Math.max(ed2d.mouseDownPos.y, pos.y)
				};
				scheduleRender();
				return;
			}
		}
	};
	ed2d.onMouseUp = function(e) {
		/* ── Atom tool: 단순 클릭(드래그 없음) → 원소 배치/변경 ── */
		if (ed2d._atomPending) {
			var ap = ed2d._atomPending;
			ed2d._atomPending = null;
			ed2d.mouseDownPos = null;
			ed2d.mouseDownTarget = null;
			if (ap.clickedAtom) {
				if (ap.clickedAtom.element === selectedElement) {
					/* 같은 원소 클릭 → 선택 후 select 모드로 전환 */
					ed2d.selectedAtoms = [ap.clickedAtom.id]; ed2d.selectedBonds = [];
					clearElementSelection();
					setTool('select');
					refreshCurrentTab(); updateInfo();
					return;
				}
				ap.clickedAtom.element = selectedElement;
				delete ap.clickedAtom.hideLabel;
				if (selectedFixedH !== null) ap.clickedAtom.fixedH = selectedFixedH; else delete ap.clickedAtom.fixedH;
			} else {
				var na = { id: genId(), element: selectedElement, x: ap.pos.x, y: ap.pos.y, font: chemFont };
				if (selectedFixedH !== null) na.fixedH = selectedFixedH;
				atoms.push(na);
				ed2d.selectedAtoms = []; ed2d.selectedBonds = [];
			}
			saveState(); refreshCurrentTab(); updateInfo();
			return;
		}
		/* ── Ring drag commit ── */
		if (ed2d._ringDrag) {
			var rd = ed2d._ringDrag;
			var upPos = e && e.clientX !== undefined ? ed2d.getPos(e) : ed2d.mousePos;
			var dx = upPos.x - rd.sx, dy = upPos.y - rd.sy;
			var dist = Math.sqrt(dx * dx + dy * dy);
			var radius = dist > 10 ? dist / 2 : 40;
			var cx = (rd.sx + upPos.x) / 2, cy = (rd.sy + upPos.y) / 2;
			if (dist <= 10) { cx = rd.sx; cy = rd.sy; }
			ed2d._ringDrag = null;
			placeRing(cx, cy, rd.type, radius);
			return;
		}
		/* ── Selection resize commit ── */
		if (ed2d._selResize) {
			ed2d._selResize = null;
			ed2d.mouseDownPos = null;
			ed2d.mouseDownTarget = null;
			ed2d.svgEl.style.cursor = 'crosshair';
			saveState(); ed2d.render();
			return;
		}
		/* ── Atom resize commit ── */
		if (ed2d._atomResize) {
			ed2d._atomResize = null;
			ed2d.mouseDownPos = null;
			ed2d.mouseDownTarget = null;
			ed2d.svgEl.style.cursor = 'crosshair';
			saveState(); ed2d.render(); updateInfo();
			return;
		}
		/* ── Bracket resize commit ── */
		if (ed2d._bracketResize) {
			ed2d._bracketResize = null;
			ed2d.mouseDownPos = null;
			ed2d.mouseDownTarget = null;
			ed2d.svgEl.style.cursor = 'crosshair';
			saveState(); ed2d.render();
			return;
		}
		/* ── Drag rotation commit ── */
		if (ed2d._rotating && ed2d._rotating.mode === 'drag') { cdCommitRotation(); return; }
		/* ── Bond tool: 드래그 끝 → 원자 위에서 놓으면 연결 ── */
		if (ed2d.tool === 'bond' && ed2d.bondStart && ed2d.bondDragging) {
			var upPos = e && e.clientX !== undefined ? ed2d.getPos(e) : ed2d.mousePos;
			var targetAtom = findAtomAt(upPos.x, upPos.y);
			if (targetAtom && targetAtom.id !== ed2d.bondStart) {
				var exist = bonds.find(function(b) { return (b.from === ed2d.bondStart && b.to === targetAtom.id) || (b.from === targetAtom.id && b.to === ed2d.bondStart); });
				if (exist) { var idx = BOND_TYPES.indexOf(exist.type); exist.type = BOND_TYPES[(idx + 1) % 3]; }
				else { bonds.push({ id: genId(), from: ed2d.bondStart, to: targetAtom.id, type: bondType }); }
				saveState(); updateInfo();
			}
			ed2d.bondStart = null; ed2d.bondDragging = false; ed2d.render();
			return;
		}
		/* ── Select tool (atom 모드 드래그 완료 시에도 동일 동작) ── */
		if (ed2d.tool === 'select' || (ed2d.tool === 'atom' && !ed2d._atomPending && ed2d.mouseDownPos)) {
			var upPos = e && e.clientX !== undefined ? ed2d.getPos(e) : ed2d.mousePos;
			var now = Date.now();

			/* Drag end → commit positions */
			if (ed2d.isDragging) {
				ed2d.isDragging = false;
				ed2d._alignGuides = [];
				ed2d._shiftLockAxis = null;
				ed2d._shiftLockOrigin = null;
				ed2d.svgEl.style.cursor = 'pointer';
				saveState();
				ed2d.mouseDownPos = null; ed2d.mouseDownTarget = null;
				ed2d.render();
				return;
			}

			/* Rubber band end → select atoms inside */
			if (ed2d.rubberBand) {
				var rb = ed2d.rubberBand;
				atoms.forEach(function(a) {
					if (a.x >= rb.x1 && a.x <= rb.x2 && a.y >= rb.y1 && a.y <= rb.y2) {
						if (ed2d.selectedAtoms.indexOf(a.id) < 0) ed2d.selectedAtoms.push(a.id);
					}
				});
				bonds.forEach(function(b) {
					var a1 = atomMap[b.from];
					var a2 = atomMap[b.to];
					if (a1 && a2 && a1.x >= rb.x1 && a1.x <= rb.x2 && a1.y >= rb.y1 && a1.y <= rb.y2 &&
						a2.x >= rb.x1 && a2.x <= rb.x2 && a2.y >= rb.y1 && a2.y <= rb.y2) {
						if (ed2d.selectedBonds.indexOf(b.id) < 0) ed2d.selectedBonds.push(b.id);
					}
				});
				brackets.forEach(function(br) {
					if (br.x1 >= rb.x1 && br.x2 <= rb.x2 && br.y1 >= rb.y1 && br.y2 <= rb.y2) {
						if (ed2d.selectedBrackets.indexOf(br.id) < 0) ed2d.selectedBrackets.push(br.id);
					}
				});
				ed2d.rubberBand = null;
				ed2d.mouseDownPos = null; ed2d.mouseDownTarget = null;
				ed2d.render();
				return;
			}

			/* Click (no drag) */
			if (ed2d.mouseDownTarget) {
				/* Double-click atom → 라벨 숨김 토글 (선은 유지) */
				if (ed2d.mouseDownTarget.type === 'atom') {
					if (now - ed2d.lastClickTime < ed2d.DBLCLICK_MS && ed2d.lastClickAtomId === ed2d.mouseDownTarget.id) {
						var at = atomMap[ed2d.mouseDownTarget.id];
						if (at) {
							if (at.hideLabel) {
								delete at.hideLabel;
							} else {
								at.hideLabel = true;
							}
							saveState(); updateInfo();
						}
						ed2d.lastClickTime = 0; ed2d.lastClickAtomId = -1;
					} else {
						ed2d.lastClickTime = now;
						ed2d.lastClickAtomId = ed2d.mouseDownTarget.id;
						ed2d.lastClickBondId = -1;
					}
				}
				/* Double-click bond → cycle type */
				if (ed2d.mouseDownTarget.type === 'bond') {
					if (now - ed2d.lastClickTime < ed2d.DBLCLICK_MS && ed2d.lastClickBondId === ed2d.mouseDownTarget.id) {
						var bd = bonds.find(function(b) { return b.id === ed2d.mouseDownTarget.id; });
						if (bd) { var idx = BOND_TYPES.indexOf(bd.type); bd.type = BOND_TYPES[(idx + 1) % 3]; saveState(); updateInfo(); }
						ed2d.lastClickTime = 0; ed2d.lastClickBondId = -1;
					} else {
						ed2d.lastClickTime = now;
						ed2d.lastClickBondId = ed2d.mouseDownTarget.id;
						ed2d.lastClickAtomId = -1;
					}
				}
			} else {
				/* Click empty space → deselect */
				ed2d.lastClickTime = 0; ed2d.lastClickAtomId = -1; ed2d.lastClickBondId = -1;
			}

			ed2d.mouseDownPos = null; ed2d.mouseDownTarget = null;
			ed2d.render();
		}
	};
	/* ── Wheel: CSS transform 즉시 줌 + 디바운스 re-render ── */
	var _wheelAccum = null; /* { scale, cx, cy } — 누적 변환 */
	ed2d.onWheel = function(e) {
		e.preventDefault();
		e.stopPropagation();
		if (atoms.length === 0) return;
		var factor = e.deltaY < 0 ? 1.1 : 0.9;
		var _hasSel = ed2d.selectedAtoms.length > 0 || ed2d.selectedBrackets.length > 0;
		var isCtrl = e.ctrlKey && _hasSel;

		/* Ctrl+wheel: 선택 원자만 스케일 (기존 방식) */
		if (isCtrl) {
			var cx = 0, cy = 0, cnt = 0;
			ed2d.selectedAtoms.forEach(function(id) { var a = atomMap[id]; if (a) { cx += a.x; cy += a.y; cnt++; } });
			ed2d.selectedBrackets.forEach(function(id) { var br = brackets.find(function(b) { return b.id === id; }); if (br) { cx += (br.x1 + br.x2) / 2; cy += (br.y1 + br.y2) / 2; cnt++; } });
			if (cnt === 0) return;
			cx /= cnt; cy /= cnt;
			ed2d.selectedAtoms.forEach(function(id) { var a = atomMap[id]; if (a) { a.x = cx + (a.x - cx) * factor; a.y = cy + (a.y - cy) * factor; } });
			ed2d.selectedBrackets.forEach(function(id) { var br = brackets.find(function(b) { return b.id === id; }); if (br) { br.x1 = cx + (br.x1 - cx) * factor; br.y1 = cy + (br.y1 - cy) * factor; br.x2 = cx + (br.x2 - cx) * factor; br.y2 = cy + (br.y2 - cy) * factor; } });
			ed2d.render();
			clearTimeout(_wheelSaveTimer);
			_wheelSaveTimer = setTimeout(function() { saveState(); updateInfo(); }, 300);
			return;
		}

		/* 일반 줌: CSS transform으로 즉시 시각 피드백 (GPU 가속) */
		var pos = ed2d.getPos(e);
		if (!_wheelAccum) {
			_wheelAccum = { scale: factor, cx: pos.x, cy: pos.y };
		} else {
			_wheelAccum.scale *= factor;
		}
		var g = document.getElementById('cdContentGroup');
		if (g) {
			var s = _wheelAccum.scale, wcx = _wheelAccum.cx, wcy = _wheelAccum.cy;
			g.setAttribute('transform', 'translate(' + wcx + ',' + wcy + ') scale(' + s + ') translate(' + (-wcx) + ',' + (-wcy) + ')');
		}
		/* 디바운스: 줌 멈추면 좌표 반영 + re-render */
		clearTimeout(_wheelSaveTimer);
		_wheelSaveTimer = setTimeout(function() {
			var s = _wheelAccum.scale, wcx = _wheelAccum.cx, wcy = _wheelAccum.cy;
			for (var i = 0; i < atoms.length; i++) { var a = atoms[i]; a.x = wcx + (a.x - wcx) * s; a.y = wcy + (a.y - wcy) * s; }
			for (var j = 0; j < brackets.length; j++) { var br = brackets[j]; br.x1 = wcx + (br.x1 - wcx) * s; br.y1 = wcy + (br.y1 - wcy) * s; br.x2 = wcx + (br.x2 - wcx) * s; br.y2 = wcy + (br.y2 - wcy) * s; }
			_wheelAccum = null;
			ed2d.render();
			saveState(); updateInfo();
		}, 150);
	};
	ed2d.onKeyDown = function(e) {
		var win = document.getElementById('fmlChemDrawWin');
		if (!win || $(win).attr('data-view') !== 'Y') return;
		if (document.activeElement && document.activeElement.tagName === 'INPUT') {
			/* Only Ctrl+Z/Redo in input fields */
			var k = e.key.toLowerCase();
			if ((e.metaKey || e.ctrlKey) && k === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
			if ((e.metaKey || e.ctrlKey) && k === 'y') { e.preventDefault(); redo(); }
			return;
		}

		/* Delete / Backspace: delete multi-selected atoms, bonds, bracket */
		if (e.key === 'Delete' || e.key === 'Backspace') {
			e.preventDefault();
			var changed = false;
			if (ed2d.selectedAtoms.length > 0) {
				var delIds = {};
				ed2d.selectedAtoms.forEach(function(id) { delIds[id] = true; });
				atoms = atoms.filter(function(a) { return !delIds[a.id]; });
				bonds = bonds.filter(function(b) { return !delIds[b.from] && !delIds[b.to]; });
				ed2d.selectedAtoms = [];
				changed = true;
			}
			if (ed2d.selectedBonds.length > 0) {
				var delBIds = {};
				ed2d.selectedBonds.forEach(function(id) { delBIds[id] = true; });
				bonds = bonds.filter(function(b) { return !delBIds[b.id]; });
				ed2d.selectedBonds = [];
				changed = true;
			}
			if (ed2d.selectedBrackets.length > 0) {
				var delBrIds = {};
				ed2d.selectedBrackets.forEach(function(id) { delBrIds[id] = true; });
				brackets = brackets.filter(function(b) { return !delBrIds[b.id]; });
				ed2d.selectedBrackets = [];
				changed = true;
			} else if (ed2d.selectedBracket) {
				brackets = brackets.filter(function(b) { return b.id !== ed2d.selectedBracket; });
				ed2d.selectedBracket = null;
				changed = true;
			}
			if (changed) { saveState(); ed2d.render(); updateInfo(); }
		}
		/* Ctrl+A: select all */
		if ((e.metaKey || e.ctrlKey) && (e.key === 'a' || e.key === 'A')) {
			e.preventDefault();
			ed2d.selectedAtoms = atoms.map(function(a) { return a.id; });
			ed2d.selectedBonds = bonds.map(function(b) { return b.id; });
			ed2d.selectedBrackets = brackets.map(function(br) { return br.id; });
			ed2d.render();
		}
		/* Ctrl+C: copy selected */
		if ((e.metaKey || e.ctrlKey) && (e.key === 'c' || e.key === 'C') && !e.shiftKey) {
			e.preventDefault(); cdCopySelection();
		}
		/* Ctrl+X: cut selected */
		if ((e.metaKey || e.ctrlKey) && (e.key === 'x' || e.key === 'X') && !e.shiftKey) {
			e.preventDefault(); cdCopySelection(); cdDeleteSelection();
		}
		/* Ctrl+V: paste */
		if ((e.metaKey || e.ctrlKey) && (e.key === 'v' || e.key === 'V') && !e.shiftKey) {
			e.preventDefault(); cdPasteClipboard();
		}
		/* Escape: deselect all + select 모드 복귀 */
		if (e.key === 'Escape') {
			ed2d.selectedAtoms = []; ed2d.selectedBonds = []; ed2d.selectedBracket = null; ed2d.selectedBrackets = [];
			ed2d.bondStart = null;
			setTool('select');
		}
		/* Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y */
		var k = e.key.toLowerCase();
		if ((e.metaKey || e.ctrlKey) && k === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
		if ((e.metaKey || e.ctrlKey) && k === 'y') { e.preventDefault(); redo(); }
	};
	ed2d.render = function() {
		if (!ed2d.svgEl || !ed2d.containerEl) return;
		rebuildAtomMap();
		var w = ed2d.containerEl.clientWidth, h = ed2d.containerEl.clientHeight;
		ed2d.svgEl.setAttribute('width', w); ed2d.svgEl.setAttribute('height', h);
		var html = '';
		html += renderBondsSVG(ed2d.selectedBond, null);
		if (ed2d.tool === 'bond' && ed2d.bondStart) {
			var a = atomMap[ed2d.bondStart];
			if (a) html += '<line x1="'+a.x+'" y1="'+a.y+'" x2="'+ed2d.mousePos.x+'" y2="'+ed2d.mousePos.y+'" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="6 3" opacity="0.6"/>';
		}
		html += renderAtomsSVG(ed2d.selectedAtom, ed2d.bondStart, null);
		html += renderBracketsSVG(ed2d.selectedBracket);
		/* Rubber band selection rectangle */
		if (ed2d.rubberBand) {
			var rb = ed2d.rubberBand;
			html += '<rect x="'+rb.x1+'" y="'+rb.y1+'" width="'+(rb.x2-rb.x1)+'" height="'+(rb.y2-rb.y1)+'" fill="rgba(66,165,245,0.1)" stroke="#42a5f5" stroke-width="1" stroke-dasharray="4"/>';
		}
		/* Selection bounding box + resize handles + rotation handle */
		ed2d._rotateHandlePos = null;
		ed2d._selBox = null;
		if (ed2d.selectedAtoms.length >= 2) {
			var _sMinX = Infinity, _sMinY = Infinity, _sMaxX = -Infinity, _sMaxY = -Infinity;
			ed2d.selectedAtoms.forEach(function(id) {
				var a = atomMap[id];
				if (a) { if (a.x < _sMinX) _sMinX = a.x; if (a.y < _sMinY) _sMinY = a.y; if (a.x > _sMaxX) _sMaxX = a.x; if (a.y > _sMaxY) _sMaxY = a.y; }
			});
			if (_sMinX !== Infinity) {
				var _pad = 20;
				var _bx = _sMinX - _pad, _by = _sMinY - _pad, _bw = _sMaxX - _sMinX + _pad * 2, _bh = _sMaxY - _sMinY + _pad * 2;
				ed2d._selBox = { x: _bx, y: _by, w: _bw, h: _bh };
				html += '<rect x="'+_bx+'" y="'+_by+'" width="'+_bw+'" height="'+_bh+'" fill="none" stroke="#42a5f5" stroke-width="1" stroke-dasharray="5 3" rx="4" opacity="0.45"/>';
				/* Resize handles (8개: 코너4 + 엣지 중앙4) */
				var _hs = 5, _hc = '#42a5f5';
				var _bmx = _bx + _bw/2, _bmy = _by + _bh/2;
				[[_bx,_by],[_bx+_bw,_by],[_bx,_by+_bh],[_bx+_bw,_by+_bh]].forEach(function(p) {
					html += '<rect x="'+(p[0]-_hs)+'" y="'+(p[1]-_hs)+'" width="'+(_hs*2)+'" height="'+(_hs*2)+'" fill="rgba(255,255,255,0.9)" stroke="'+_hc+'" stroke-width="1.5" rx="1.5" style="cursor:nwse-resize"/>';
				});
				[[_bx,_bmy],[_bx+_bw,_bmy],[_bmx,_by],[_bmx,_by+_bh]].forEach(function(p) {
					html += '<rect x="'+(p[0]-_hs+1)+'" y="'+(p[1]-_hs+1)+'" width="'+(_hs*2-2)+'" height="'+(_hs*2-2)+'" fill="rgba(255,255,255,0.9)" stroke="'+_hc+'" stroke-width="1" rx="1"/>';
				});
				/* Rotation handle — top-right corner, clamped within SVG */
				var _hx = Math.min(_bx + _bw + 14, w - 14);
				var _hy = Math.max(_by - 14, 14);
				ed2d._rotateHandlePos = { x: _hx, y: _hy };
				html += '<line x1="'+(_bx+_bw)+'" y1="'+_by+'" x2="'+_hx+'" y2="'+_hy+'" stroke="#42a5f5" stroke-width="0.8" stroke-dasharray="2 2" opacity="0.35"/>';
				html += '<g transform="translate('+_hx+','+_hy+')">';
				html += '<circle cx="0" cy="0" r="11" fill="rgba(255,255,255,0.92)" stroke="#42a5f5" stroke-width="1.5" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,0.12))"/>';
				html += '<path d="M0,-5 A5,5 0 1 1 -5,0" fill="none" stroke="#42a5f5" stroke-width="1.8" stroke-linecap="round"/>';
				html += '<polygon points="-5,0 -7.5,-2.5 -2.5,-2.5" fill="#42a5f5"/>';
				html += '</g>';
				/* Rotation guide during active rotation */
				if (ed2d._rotating) {
					var _rc = ed2d._rotating;
					html += '<circle cx="'+_rc.cx+'" cy="'+_rc.cy+'" r="3" fill="#42a5f5" opacity="0.5"/>';
					html += '<line x1="'+_rc.cx+'" y1="'+_rc.cy+'" x2="'+ed2d.mousePos.x+'" y2="'+ed2d.mousePos.y+'" stroke="#42a5f5" stroke-width="1" stroke-dasharray="4 2" opacity="0.4"/>';
					var _deg = Math.round((_rc.currentAngle || 0) * 180 / Math.PI);
					html += '<text x="'+(_rc.cx)+'" y="'+(_rc.cy - 14)+'" text-anchor="middle" fill="#42a5f5" font-size="11" font-weight="600" style="text-shadow:0 0 3px #fff,0 0 3px #fff">'+_deg+'°</text>';
				}
			}
		}
		/* Ring drag preview */
		if (ed2d._ringDrag && ed2d._ringDrag.cx !== undefined) {
			var _rd = ed2d._ringDrag;
			var _dx = _rd.cx - _rd.sx, _dy = _rd.cy - _rd.sy;
			var _dist = Math.sqrt(_dx*_dx + _dy*_dy);
			if (_dist > 10) {
				var _n = (_rd.type[0] === '5') ? 5 : 6;
				var _r = _dist / 2;
				var _mx = (_rd.sx + _rd.cx) / 2, _my = (_rd.sy + _rd.cy) / 2;
				var _pts = '';
				for (var _i = 0; _i < _n; _i++) {
					var _ang = -Math.PI/2 + (2*Math.PI*_i/_n);
					if (_i > 0) _pts += ' ';
					_pts += (_mx + _r*Math.cos(_ang)).toFixed(1) + ',' + (_my + _r*Math.sin(_ang)).toFixed(1);
				}
				html += '<polygon points="'+_pts+'" fill="rgba(66,165,245,0.08)" stroke="#42a5f5" stroke-width="1.5" stroke-dasharray="5 3"/>';
			}
		}
		/* 정렬 가이드 (빨간 점선) */
		if (ed2d._alignGuides && ed2d._alignGuides.length > 0) {
			ed2d._alignGuides.forEach(function(g) {
				if (g.type === 'h') {
					html += '<line x1="'+g.from+'" y1="'+g.pos+'" x2="'+g.to+'" y2="'+g.pos+'" stroke="#e53935" stroke-width="0.8" stroke-dasharray="4 3" opacity="0.7"/>';
				} else {
					html += '<line x1="'+g.pos+'" y1="'+g.from+'" x2="'+g.pos+'" y2="'+g.to+'" stroke="#e53935" stroke-width="0.8" stroke-dasharray="4 3" opacity="0.7"/>';
				}
			});
		}
		ed2d.svgEl.innerHTML = '<g id="cdContentGroup">' + html + '</g>';
		var emptyEl = document.getElementById('chemDrawEmpty');
		if (emptyEl) emptyEl.style.display = (atoms.length === 0 && brackets.length === 0) ? 'flex' : 'none';
		updateFontUI();
	};

	/* ═══════════════════════════════════════════════════════
	   [TAB 2] 2D View (read-only, auto-centered)
	   ═══════════════════════════════════════════════════════ */
	var view2d = { svgEl: null, containerEl: null };
	view2d.render = function() {
		if (!view2d.svgEl || !view2d.containerEl) return;
		rebuildAtomMap();
		var w = view2d.containerEl.clientWidth, h = view2d.containerEl.clientHeight;
		view2d.svgEl.setAttribute('width', w); view2d.svgEl.setAttribute('height', h);
		var emptyEl = document.getElementById('chemDraw2DViewEmpty');
		if (atoms.length === 0 && brackets.length === 0) { if (emptyEl) emptyEl.style.display = 'flex'; view2d.svgEl.innerHTML = ''; return; }
		if (emptyEl) emptyEl.style.display = 'none';
		var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		atoms.forEach(function(a) { var r = (ELEMENTS[a.element] || ELEMENTS.C).radius * (a.scale || 1); minX = Math.min(minX, a.x - r); minY = Math.min(minY, a.y - r); maxX = Math.max(maxX, a.x + r); maxY = Math.max(maxY, a.y + r); });
		brackets.forEach(function(br) { minX = Math.min(minX, br.x1); minY = Math.min(minY, br.y1); maxX = Math.max(maxX, br.x2 + 20); maxY = Math.max(maxY, br.y2 + 18); });
		var mw = maxX - minX || 1, mh = maxY - minY || 1, pad = 50;
		var sc = Math.min((w - pad * 2) / mw, (h - pad * 2) / mh, 2);
		var cenX = (minX + maxX) / 2, cenY = (minY + maxY) / 2, ox = w / 2, oy = h / 2;
		var html = '';
		bonds.forEach(function(b) {
			var a1 = atomMap[b.from], a2 = atomMap[b.to];
			if (!a1 || !a2) return;
			var bx1 = (a1.x - cenX) * sc + ox, by1 = (a1.y - cenY) * sc + oy, bx2 = (a2.x - cenX) * sc + ox, by2 = (a2.y - cenY) * sc + oy;
			var dx = bx2 - bx1, dy = by2 - by1, len = Math.hypot(dx, dy); if (len === 0) return;
			var ux = dx / len, uy = dy / len;
			var nx = -dy / len, ny = dx / len, sw = 2.5;
			var p1 = getAtomLabelPad(a1, ux, uy);
			var p2 = getAtomLabelPad(a2, -ux, -uy);
			if (p1 + p2 >= len) { p1 = 0; p2 = 0; }
			var x1 = bx1 + ux * p1, y1 = by1 + uy * p1, x2 = bx2 - ux * p2, y2 = by2 - uy * p2;
			/* 링 소속 여부 */
			var _adj1v = bondAdj[a1.id]||[], _adj2v = bondAdj[a2.id]||[];
			var _a2nv={}; for(var _jv=0;_jv<_adj2v.length;_jv++) _a2nv[_adj2v[_jv].to]=true;
			var _isRingV=false;
			for(var _iv=0;_iv<_adj1v.length;_iv++){if(_adj1v[_iv].to!==a2.id&&_a2nv[_adj1v[_iv].to]){_isRingV=true;break;}}
			if (_isRingV && p1===0 && p2===0) {
				var rp=2*sc; x1+=ux*rp; y1+=uy*rp; x2-=ux*rp; y2-=uy*rp;
			}
			if (b.type === 'single') { html += '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#444" stroke-width="'+sw+'"/>'; }
			else if (b.type === 'double') {
				var odx = a2.x - a1.x, ody = a2.y - a1.y, olen = Math.hypot(odx, ody);
				var onx = olen > 0 ? -ody / olen : 0, ony = olen > 0 ? odx / olen : 0;
				var side = _dblBondInnerSide(b, a1, a2, onx, ony);
				if (_isRingV) {
					var o=4*sc, shrink=4*sc;
					html += '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#444" stroke-width="'+sw+'"/>';
					html += '<line x1="'+(x1+nx*o*side+ux*shrink)+'" y1="'+(y1+ny*o*side+uy*shrink)+'" x2="'+(x2+nx*o*side-ux*shrink)+'" y2="'+(y2+ny*o*side-uy*shrink)+'" stroke="#444" stroke-width="'+sw+'"/>';
				} else {
					var half=2.5*sc;
					html += '<line x1="'+(x1-nx*half*side)+'" y1="'+(y1-ny*half*side)+'" x2="'+(x2-nx*half*side)+'" y2="'+(y2-ny*half*side)+'" stroke="#444" stroke-width="'+sw+'"/>';
					html += '<line x1="'+(x1+nx*half*side)+'" y1="'+(y1+ny*half*side)+'" x2="'+(x2+nx*half*side)+'" y2="'+(y2+ny*half*side)+'" stroke="#444" stroke-width="'+sw+'"/>';
				}
			}
			else if (b.type === 'triple') { html += '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#444" stroke-width="'+sw+'"/>'; html += '<line x1="'+(x1+nx*5)+'" y1="'+(y1+ny*5)+'" x2="'+(x2+nx*5)+'" y2="'+(y2+ny*5)+'" stroke="#444" stroke-width="'+sw+'"/>'; html += '<line x1="'+(x1-nx*5)+'" y1="'+(y1-ny*5)+'" x2="'+(x2-nx*5)+'" y2="'+(y2-ny*5)+'" stroke="#444" stroke-width="'+sw+'"/>'; }
		});
		atoms.forEach(function(a) {
			var info = ELEMENTS[a.element] || ELEMENTS.C;
			var vS = a.scale || 1;
			var CW=8.4*vS, FS=14*vS, SUB_FS=10*vS, SUB_CW=6*vS, PX=3*vS, PY=3*vS;
			var x = (a.x - cenX) * sc + ox, y = (a.y - cenY) * sc + oy;
			var label = getAtomLabel(a);
			if (label.hide) return;
			var parts = parseLabelParts(label.text);
			var textW = 0;
			parts.forEach(function(p){ textW += p.sub ? SUB_CW*p.ch.length : CW*p.ch.length; });
			var anchor = label.anchor, rx, startX;
			if (anchor==='start') { rx=x-PX; startX=x; }
			else if (anchor==='end') { rx=x-textW-PX; startX=x-textW; }
			else { rx=x-textW/2-PX; startX=x-textW/2; }
			html += '<rect x="'+rx+'" y="'+(y-FS/2-PY)+'" width="'+(textW+PX*2)+'" height="'+(FS+PY*2)+'" fill="transparent"/>';
			var textCol = (info.color==='#FFFFFF'||info.color==='#FFFF30'||info.color==='#F0C8A0') ? '#333' : info.color;
			var cx2 = startX;
			parts.forEach(function(p){
				var fs = p.sub ? SUB_FS : FS;
				var w = p.sub ? SUB_CW*p.ch.length : CW*p.ch.length;
				var py = p.sub ? y+5*vS : y+1;
				html += '<text x="'+(cx2+w/2)+'" y="'+py+'" text-anchor="middle" dominant-baseline="middle" font-size="'+fs+'" font-weight="bold" font-family="'+(a.font||chemFont)+',sans-serif" fill="'+textCol+'">'+p.ch+'</text>';
				cx2 += w;
			});
			/* Charge badge in 2D view */
			if (a.charge) html += renderChargeSVG(rx + textW + PX*2 + 4*vS, y - FS/2 - PY - 2*vS, a.charge, vS);
		});
		// Render brackets in 2D view with coordinate transform
		var bArm2d = 8 * sc;
		brackets.forEach(function(br) {
			var bx1 = (br.x1 - cenX) * sc + ox, by1 = (br.y1 - cenY) * sc + oy;
			var bx2 = (br.x2 - cenX) * sc + ox, by2 = (br.y2 - cenY) * sc + oy;
			html += '<polyline points="'+(bx1+bArm2d)+','+by1+' '+bx1+','+by1+' '+bx1+','+by2+' '+(bx1+bArm2d)+','+by2+'" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>';
			html += '<polyline points="'+(bx2-bArm2d)+','+by1+' '+bx2+','+by1+' '+bx2+','+by2+' '+(bx2-bArm2d)+','+by2+'" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>';
			if (br.subscript) {
				html += '<text x="'+(bx2+4)+'" y="'+(by2+4)+'" font-size="'+(14*sc)+'" font-weight="bold" font-family="'+(br.font||chemFont)+',sans-serif" fill="#333" dominant-baseline="hanging">'+br.subscript+'</text>';
			}
		});
		view2d.svgEl.innerHTML = html;
	};

	/* ═══════════════════════════════════════════════════════
	   [TAB 3] 3D Editor
	   ═══════════════════════════════════════════════════════ */
	var ed3d = {
		scene: null, camera: null, renderer: null, group: null,
		frameId: null, mountEl: null, raycaster: null, mouse: null,
		atomMeshes: [], selectedId: null, bondStartId: null,
		tool: 'select', isDragging: false, isRotating: false,
		dragAtom: null, dragPlane: null, dragOffset: null,
		prevMouse: { x: 0, y: 0 }, scale: 0.02, center: { x: 0, y: 0 },
		gridHelper: null, showGrid: true, DRAG_THRESHOLD: 5
	};
	ed3d.init = function() {
		ed3d.mountEl = document.getElementById('chemDraw3DEditorMount');
		if (!ed3d.mountEl || typeof THREE === 'undefined') return;
		var w = ed3d.mountEl.clientWidth, h = ed3d.mountEl.clientHeight;
		ed3d.scene = new THREE.Scene(); ed3d.scene.background = new THREE.Color(0xf8f9fa);
		ed3d.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000); ed3d.camera.position.set(0, 0, 12);
		ed3d.renderer = new THREE.WebGLRenderer({ antialias: true }); ed3d.renderer.setSize(w, h);
		ed3d.mountEl.innerHTML = ''; ed3d.mountEl.appendChild(ed3d.renderer.domElement);
		ed3d.scene.add(new THREE.AmbientLight(0x606060, 0.8));
		var dl = new THREE.DirectionalLight(0xffffff, 0.8); dl.position.set(5, 5, 5); ed3d.scene.add(dl);
		ed3d.gridHelper = new THREE.GridHelper(100, 100, 0xcccccc, 0xe0e0e0);
		ed3d.gridHelper.rotation.x = Math.PI / 2; ed3d.scene.add(ed3d.gridHelper);
		ed3d.group = new THREE.Group(); ed3d.scene.add(ed3d.group);
		ed3d.raycaster = new THREE.Raycaster(); ed3d.mouse = new THREE.Vector2();
		ed3d.renderer.domElement.addEventListener('mousedown', ed3d.onMouseDown);
		ed3d.renderer.domElement.addEventListener('mousemove', ed3d.onMouseMove);
		ed3d.renderer.domElement.addEventListener('mouseup', ed3d.onMouseUp);
		ed3d.renderer.domElement.addEventListener('wheel', ed3d.onWheel);
		ed3d.renderer.domElement.addEventListener('contextmenu', function(e) { e.preventDefault(); });
		function animate() { ed3d.frameId = requestAnimationFrame(animate); ed3d.renderer.render(ed3d.scene, ed3d.camera); }
		animate(); ed3d.rebuild();
	};
	ed3d.rebuild = function(freezeCenter) {
		if (!ed3d.group) return;
		while (ed3d.group.children.length) { var c = ed3d.group.children[0]; ed3d.group.remove(c); if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }
		ed3d.atomMeshes = [];
		var emptyEl = document.getElementById('chemDraw3DEditorEmpty');
		if (emptyEl) emptyEl.style.display = atoms.length === 0 ? 'flex' : 'none';
		if (atoms.length === 0) return;
		if (!freezeCenter) {
			var sumX = 0, sumY = 0;
			atoms.forEach(function(a) { sumX += a.x; sumY += a.y; });
			ed3d.center = { x: sumX / atoms.length, y: sumY / atoms.length };
		}
		var cx = ed3d.center.x, cy = ed3d.center.y, sc = ed3d.scale, atomPosMap = {};
		atoms.forEach(function(a) {
			var info = ELEMENTS[a.element] || ELEMENTS.C;
			var px = (a.x - cx) * sc, py = -(a.y - cy) * sc, pz = (a.z || 0) * sc;
			atomPosMap[a.id] = new THREE.Vector3(px, py, pz);
			var geo = new THREE.SphereGeometry(info.r3d, 32, 32);
			var isSelected = a.id === ed3d.selectedId;
			var mat = new THREE.MeshLambertMaterial({ color: info.color3d, emissive: isSelected ? 0x2563eb : 0x000000, emissiveIntensity: isSelected ? 0.4 : 0 });
			var mesh = new THREE.Mesh(geo, mat); mesh.position.set(px, py, pz); mesh.userData = { atomId: a.id };
			ed3d.group.add(mesh); ed3d.atomMeshes.push({ mesh: mesh, atomId: a.id });
		});
		bonds.forEach(function(b) {
			var p1 = atomPosMap[b.from], p2 = atomPosMap[b.to]; if (!p1 || !p2) return;
			var dir = new THREE.Vector3().subVectors(p2, p1), dist = dir.length(); if (dist === 0) return;
			var makeCyl = function(off) {
				var geo = new THREE.CylinderGeometry(0.06, 0.06, dist, 8), mat = new THREE.MeshLambertMaterial({ color: 0x666666 }), mesh = new THREE.Mesh(geo, mat);
				var mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5); if (off) mid.add(off);
				mesh.position.copy(mid); mesh.lookAt(p2); mesh.rotateX(Math.PI / 2); ed3d.group.add(mesh);
			};
			if (b.type === 'single') { makeCyl(); }
			else if (b.type === 'double') { var perp = Math.abs(dir.y) < 0.9*dist ? new THREE.Vector3(0,1,0).cross(dir).normalize() : new THREE.Vector3(1,0,0).cross(dir).normalize(); makeCyl(perp.clone().multiplyScalar(0.08)); makeCyl(perp.clone().multiplyScalar(-0.08)); }
			else if (b.type === 'triple') { var perp2 = Math.abs(dir.y) < 0.9*dist ? new THREE.Vector3(0,1,0).cross(dir).normalize() : new THREE.Vector3(1,0,0).cross(dir).normalize(); makeCyl(); makeCyl(perp2.clone().multiplyScalar(0.1)); makeCyl(perp2.clone().multiplyScalar(-0.1)); }
		});
		if (!freezeCenter) {
			var box = new THREE.Box3().setFromObject(ed3d.group), size = box.getSize(new THREE.Vector3());
			if (ed3d.camera) ed3d.camera.position.z = Math.max(Math.max(size.x, size.y, size.z) * 2, 5);
		}
	};
	ed3d.pickAtom = function(e) {
		var rect = ed3d.renderer.domElement.getBoundingClientRect();
		ed3d.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
		ed3d.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
		ed3d.raycaster.setFromCamera(ed3d.mouse, ed3d.camera);
		var meshes = ed3d.atomMeshes.map(function(o) { return o.mesh; });
		var hits = ed3d.raycaster.intersectObjects(meshes);
		if (hits.length > 0) { var atomId = hits[0].object.userData.atomId; return atomMap[atomId]; }
		return null;
	};
	ed3d.updateStatus = function(msg) { var el = document.getElementById('chemDraw3DEditorStatus'); if (el) el.textContent = msg; };
	ed3d.onMouseDown = function(e) {
		e.preventDefault();
		ed3d.prevMouse = { x: e.clientX, y: e.clientY };
		ed3d.mouseDownPos = { x: e.clientX, y: e.clientY };
		ed3d.isDragging = false; ed3d.pendingClick = true; ed3d.dragMode = null;
		if (e.shiftKey || e.button === 2) { ed3d.isRotating = true; ed3d.pendingClick = false; ed3d.updateStatus('Rotating model...'); return; }
		var pickedAtom = ed3d.pickAtom(e);
		ed3d.pickedAtom = pickedAtom; ed3d.ctrlOnDown = e.ctrlKey;
		if (pickedAtom) {
			ed3d.dragAtom = pickedAtom; ed3d.dragStartY = e.clientY; ed3d.dragStartZ = pickedAtom.z || 0;
			ed3d.dragStartAtom = { x: pickedAtom.x, y: pickedAtom.y, z: pickedAtom.z || 0 };
			var sc = ed3d.scale, cx2 = ed3d.center.x, cy2 = ed3d.center.y;
			var lpx = (pickedAtom.x - cx2) * sc, lpy = -(pickedAtom.y - cy2) * sc, lpz = (pickedAtom.z || 0) * sc;
			var alpha = ed3d.group.rotation.x, beta = ed3d.group.rotation.y, gamma = ed3d.group.rotation.z;
			var ca = Math.cos(alpha), sa = Math.sin(alpha), cb = Math.cos(beta), sb = Math.sin(beta), cg = Math.cos(gamma), sg = Math.sin(gamma);
			var r1x = lpx, r1y = ca * lpy - sa * lpz, r1z = sa * lpy + ca * lpz;
			var r2x = cb * r1x + sb * r1z, r2y = r1y, r2z = -sb * r1x + cb * r1z;
			var wpx = cg * r2x - sg * r2y, wpy = sg * r2x + cg * r2y, wpz = r2z;
			ed3d.dragAtomWorldStart = new THREE.Vector3(wpx, wpy, wpz);
			var camDir = new THREE.Vector3(); ed3d.camera.getWorldDirection(camDir);
			ed3d.dragPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(camDir, ed3d.dragAtomWorldStart);
			var clickPt = new THREE.Vector3(); ed3d.raycaster.ray.intersectPlane(ed3d.dragPlane, clickPt);
			ed3d.dragClickOffset = new THREE.Vector3().subVectors(ed3d.dragAtomWorldStart, clickPt);
		} else { ed3d.dragAtom = null; }
	};
	ed3d.onMouseMove = function(e) {
		if (ed3d.isRotating) {
			ed3d.group.rotation.y += (e.clientX - ed3d.prevMouse.x) * 0.01;
			ed3d.group.rotation.x += (e.clientY - ed3d.prevMouse.y) * 0.01;
			ed3d.prevMouse = { x: e.clientX, y: e.clientY }; return;
		}
		if (ed3d.pendingClick && ed3d.dragAtom) {
			var dx = e.clientX - ed3d.mouseDownPos.x, dy = e.clientY - ed3d.mouseDownPos.y;
			if (Math.sqrt(dx * dx + dy * dy) > ed3d.DRAG_THRESHOLD) {
				ed3d.isDragging = true; ed3d.pendingClick = false;
				ed3d.dragMode = (ed3d.ctrlOnDown || e.ctrlKey) ? 'z' : 'xy';
				ed3d.updateStatus(ed3d.dragMode === 'z' ? 'Ctrl+Drag: moving [' + ed3d.dragAtom.element + '] up/down (Z axis)' : 'Dragging [' + ed3d.dragAtom.element + ']');
			}
		}
		if (ed3d.isDragging && ed3d.dragAtom) {
			if (ed3d.dragMode === 'z' || e.ctrlKey) {
				var deltaY = (ed3d.dragStartY - e.clientY) * 0.5;
				ed3d.dragAtom.z = ed3d.dragStartZ + deltaY;
				ed3d.rebuild(true); ed3d.updateStatus('Z depth: ' + Math.round(ed3d.dragAtom.z)); return;
			}
			var rect = ed3d.renderer.domElement.getBoundingClientRect();
			ed3d.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
			ed3d.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
			ed3d.raycaster.setFromCamera(ed3d.mouse, ed3d.camera);
			var pt = new THREE.Vector3();
			if (ed3d.raycaster.ray.intersectPlane(ed3d.dragPlane, pt)) {
				pt.add(ed3d.dragClickOffset);
				var alpha = ed3d.group.rotation.x, beta = ed3d.group.rotation.y, gamma = ed3d.group.rotation.z;
				var ca = Math.cos(alpha), sa = Math.sin(alpha), cb = Math.cos(beta), sb = Math.sin(beta), cg = Math.cos(gamma), sg = Math.sin(gamma);
				var wx = pt.x - ed3d.dragAtomWorldStart.x, wy = pt.y - ed3d.dragAtomWorldStart.y, wz = pt.z - ed3d.dragAtomWorldStart.z;
				var t1x = cg * wx + sg * wy, t1y = -sg * wx + cg * wy, t1z = wz;
				var t2x = cb * t1x - sb * t1z, t2y = t1y, t2z = sb * t1x + cb * t1z;
				var lx = t2x, ly = ca * t2y + sa * t2z, lz = -sa * t2y + ca * t2z;
				var sc = ed3d.scale;
				ed3d.dragAtom.x = ed3d.dragStartAtom.x + lx / sc;
				ed3d.dragAtom.y = ed3d.dragStartAtom.y - ly / sc;
				ed3d.dragAtom.z = ed3d.dragStartAtom.z + lz / sc;
				ed3d.rebuild(true);
			}
		}
	};
	ed3d.onMouseUp = function(e) {
		if (ed3d.isRotating) { ed3d.isRotating = false; ed3d.pendingClick = false; ed3d.showToolStatus(); return; }
		if (ed3d.isDragging) { saveState(); ed3d.isDragging = false; ed3d.dragAtom = null; ed3d.dragMode = null; ed3d.pendingClick = false; ed3d.rebuild(); ed3d.showToolStatus(); return; }
		if (ed3d.pendingClick) {
			ed3d.pendingClick = false;
			var pickedAtom = ed3d.pickedAtom;
			if (ed3d.tool === 'select') { ed3d.selectedId = pickedAtom ? pickedAtom.id : null; ed3d.rebuild(); }
			if (ed3d.tool === 'atom') {
				if (pickedAtom) { pickedAtom.element = selectedElement || 'C'; if (selectedFixedH !== null) pickedAtom.fixedH = selectedFixedH; else delete pickedAtom.fixedH; saveState(); ed3d.rebuild(); updateInfo(); }
				else {
					var rect = ed3d.renderer.domElement.getBoundingClientRect();
					ed3d.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
					ed3d.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
					ed3d.raycaster.setFromCamera(ed3d.mouse, ed3d.camera);
					var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), pt = new THREE.Vector3();
					if (ed3d.raycaster.ray.intersectPlane(plane, pt)) {
						var sc = ed3d.scale, cx2 = ed3d.center.x || 0, cy2 = ed3d.center.y || 0;
						var na3d = { id: genId(), element: selectedElement || 'C', x: pt.x / sc + cx2, y: -pt.y / sc + cy2, z: 0 };
						if (selectedFixedH !== null) na3d.fixedH = selectedFixedH;
						atoms.push(na3d);
						saveState(); ed3d.rebuild(); updateInfo();
					}
				}
			}
			if (ed3d.tool === 'bond') {
				if (pickedAtom) {
					if (!ed3d.bondStartId) { ed3d.bondStartId = pickedAtom.id; ed3d.selectedId = pickedAtom.id; ed3d.updateStatus('Click second atom to create bond'); ed3d.rebuild(); }
					else if (pickedAtom.id !== ed3d.bondStartId) {
						var exist = bonds.find(function(b) { return (b.from === ed3d.bondStartId && b.to === pickedAtom.id) || (b.from === pickedAtom.id && b.to === ed3d.bondStartId); });
						if (exist) { var idx = BOND_TYPES.indexOf(exist.type); exist.type = BOND_TYPES[(idx+1)%3]; }
						else { bonds.push({ id: genId(), from: ed3d.bondStartId, to: pickedAtom.id, type: bondType }); }
						ed3d.bondStartId = null; ed3d.selectedId = null; saveState(); ed3d.rebuild(); updateInfo();
					}
				}
			}
			if (ed3d.tool === 'eraser') {
				if (pickedAtom) {
					atoms = atoms.filter(function(a) { return a.id !== pickedAtom.id; });
					bonds = bonds.filter(function(b) { return b.from !== pickedAtom.id && b.to !== pickedAtom.id; });
					saveState(); ed3d.rebuild(); updateInfo();
				}
			}
		}
		ed3d.dragAtom = null; ed3d.dragMode = null;
	};
	ed3d.showToolStatus = function() {
		var msgs = {
			select: 'Drag atom: move / Ctrl+drag: Z depth / Shift+drag: rotate / Scroll: zoom',
			atom: 'Click: place atom / Drag: move / Click atom: change element / Shift+drag: rotate',
			bond: 'Click two atoms to bond / Drag atom: move / Shift+drag: rotate',
			eraser: 'Click atom: delete / Drag atom: move / Shift+drag: rotate'
		};
		ed3d.updateStatus(msgs[ed3d.tool] || '');
	};
	ed3d.onWheel = function(e) { e.preventDefault(); ed3d.camera.position.z = Math.max(3, Math.min(50, ed3d.camera.position.z + e.deltaY * 0.02)); };
	ed3d.resize = function() {
		if (!ed3d.mountEl || !ed3d.renderer || !ed3d.camera) return;
		var w = ed3d.mountEl.clientWidth, h = ed3d.mountEl.clientHeight;
		ed3d.renderer.setSize(w, h); ed3d.camera.aspect = w / h; ed3d.camera.updateProjectionMatrix();
	};
	ed3d.destroy = function() {
		if (ed3d.frameId) cancelAnimationFrame(ed3d.frameId);
		if (ed3d.renderer) {
			ed3d.renderer.domElement.removeEventListener('mousedown', ed3d.onMouseDown);
			ed3d.renderer.domElement.removeEventListener('mousemove', ed3d.onMouseMove);
			ed3d.renderer.domElement.removeEventListener('mouseup', ed3d.onMouseUp);
			ed3d.renderer.domElement.removeEventListener('wheel', ed3d.onWheel);
			ed3d.renderer.dispose();
		}
		ed3d.scene = null; ed3d.camera = null; ed3d.renderer = null; ed3d.group = null;
		ed3d.frameId = null; ed3d.atomMeshes = [];
	};

	/* ═══════════════════════════════════════════════════════
	   [TAB 4] 3D View (auto-rotate, read-only)
	   ═══════════════════════════════════════════════════════ */
	var view3d = {
		scene: null, camera: null, renderer: null, group: null,
		frameId: null, autoRotate: true, mountEl: null, md: false, mx: 0, my: 0
	};
	view3d.init = function() {
		view3d.mountEl = document.getElementById('chemDraw3DViewMount');
		if (!view3d.mountEl || typeof THREE === 'undefined') return;
		var w = view3d.mountEl.clientWidth, h = view3d.mountEl.clientHeight;
		view3d.scene = new THREE.Scene(); view3d.scene.background = new THREE.Color(0xf0f2f5);
		view3d.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000); view3d.camera.position.set(0, 0, 12);
		view3d.renderer = new THREE.WebGLRenderer({ antialias: true }); view3d.renderer.setSize(w, h);
		view3d.mountEl.innerHTML = ''; view3d.mountEl.appendChild(view3d.renderer.domElement);
		view3d.scene.add(new THREE.AmbientLight(0x404040, 0.7));
		var dl = new THREE.DirectionalLight(0xffffff, 0.9); dl.position.set(5, 5, 5); view3d.scene.add(dl);
		view3d.group = new THREE.Group(); view3d.scene.add(view3d.group);
		view3d.renderer.domElement.addEventListener('mousedown', function(e) { view3d.md = true; view3d.mx = e.clientX; view3d.my = e.clientY; view3d.autoRotate = false; });
		view3d.renderer.domElement.addEventListener('mouseup', function() { view3d.md = false; });
		view3d.renderer.domElement.addEventListener('mousemove', function(e) {
			if (!view3d.md) return;
			view3d.group.rotation.y += (e.clientX - view3d.mx) * 0.01; view3d.group.rotation.x += (e.clientY - view3d.my) * 0.01;
			view3d.mx = e.clientX; view3d.my = e.clientY;
		});
		view3d.renderer.domElement.addEventListener('wheel', function(e) { view3d.camera.position.z = Math.max(3, Math.min(50, view3d.camera.position.z + e.deltaY * 0.01)); });
		view3d.autoRotate = true;
		function animate() { view3d.frameId = requestAnimationFrame(animate); if (view3d.autoRotate) view3d.group.rotation.y += 0.008; view3d.renderer.render(view3d.scene, view3d.camera); }
		animate(); view3d.rebuild();
	};
	view3d.rebuild = function() {
		if (!view3d.group) return;
		while (view3d.group.children.length) { var c = view3d.group.children[0]; view3d.group.remove(c); if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }
		var emptyEl = document.getElementById('chemDraw3DViewEmpty'), ctrlEl = document.getElementById('chemDraw3DViewControls');
		if (emptyEl) emptyEl.style.display = atoms.length === 0 ? 'flex' : 'none';
		if (ctrlEl) ctrlEl.style.display = atoms.length > 0 ? 'block' : 'none';
		if (atoms.length === 0) return;
		var cx = 0, cy = 0;
		atoms.forEach(function(a) { cx += a.x; cy += a.y; }); cx /= atoms.length; cy /= atoms.length;
		var sc = 0.02, atomMap = {};
		atoms.forEach(function(a) {
			var info = ELEMENTS[a.element] || ELEMENTS.C;
			var pos = new THREE.Vector3((a.x - cx) * sc, -(a.y - cy) * sc, ((a.z || 0) * sc) || (Math.random() - 0.5) * 0.3);
			atomMap[a.id] = pos;
			var geo = new THREE.SphereGeometry(info.r3d, 32, 32), mat = new THREE.MeshLambertMaterial({ color: info.color3d }), mesh = new THREE.Mesh(geo, mat);
			mesh.position.copy(pos); view3d.group.add(mesh);
		});
		bonds.forEach(function(b) {
			var p1 = atomMap[b.from], p2 = atomMap[b.to]; if (!p1 || !p2) return;
			var dir = new THREE.Vector3().subVectors(p2, p1), dist = dir.length(); if (dist === 0) return;
			var makeCyl = function(off) {
				var geo = new THREE.CylinderGeometry(0.06, 0.06, dist, 8), mat = new THREE.MeshLambertMaterial({ color: 0x666666 }), mesh = new THREE.Mesh(geo, mat);
				var mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5); if (off) mid.add(off);
				mesh.position.copy(mid); mesh.lookAt(p2); mesh.rotateX(Math.PI / 2); view3d.group.add(mesh);
			};
			if (b.type === 'single') { makeCyl(); }
			else if (b.type === 'double') { var perp = Math.abs(dir.y)<0.9*dist ? new THREE.Vector3(0,1,0).cross(dir).normalize() : new THREE.Vector3(1,0,0).cross(dir).normalize(); makeCyl(perp.clone().multiplyScalar(0.08)); makeCyl(perp.clone().multiplyScalar(-0.08)); }
			else if (b.type === 'triple') { var perp2 = Math.abs(dir.y)<0.9*dist ? new THREE.Vector3(0,1,0).cross(dir).normalize() : new THREE.Vector3(1,0,0).cross(dir).normalize(); makeCyl(); makeCyl(perp2.clone().multiplyScalar(0.1)); makeCyl(perp2.clone().multiplyScalar(-0.1)); }
		});
		var box = new THREE.Box3().setFromObject(view3d.group), size = box.getSize(new THREE.Vector3());
		view3d.camera.position.z = Math.max(Math.max(size.x, size.y, size.z) * 2, 5);
	};
	view3d.resize = function() {
		if (!view3d.mountEl || !view3d.renderer || !view3d.camera) return;
		var w = view3d.mountEl.clientWidth, h = view3d.mountEl.clientHeight;
		view3d.renderer.setSize(w, h); view3d.camera.aspect = w / h; view3d.camera.updateProjectionMatrix();
	};
	view3d.destroy = function() {
		if (view3d.frameId) cancelAnimationFrame(view3d.frameId);
		if (view3d.renderer) view3d.renderer.dispose();
		view3d.scene = null; view3d.camera = null; view3d.renderer = null; view3d.group = null; view3d.frameId = null;
	};

	/* ═══════════════════════════════════════
	   UI Helpers
	   ═══════════════════════════════════════ */
	function setTool(t) {
		ed2d.tool = t; ed2d.bondStart = null;
		ed2d.hoveredAtom = -1; ed2d.hoveredBond = -1; ed2d.hoveredBracket = -1;
		ed2d.rubberBand = null; ed2d.isDragging = false; ed2d.mouseDownPos = null; ed2d.mouseDownTarget = null;
		ed2d._rotating = null;
		if (ed2d.svgEl) ed2d.svgEl.style.cursor = (t === 'atom' || t === 'ring') ? 'cell' : (t === 'bond') ? 'crosshair' : 'crosshair';
		if (t !== 'atom') clearElementSelection();
		if (t !== 'bond') clearBondSelection();
		if (t !== 'ring') clearRingSelection();
		updateStatusBar(); ed2d.render();
	}
	function setElement(el) {
		selectedElement = el;
		$('#fmlChemDrawWin .btnBox[data-element]').removeClass('on');
		$('#fmlChemDrawWin .btnBox[data-element="'+el+'"]').addClass('on');
		/* 선택된 원자가 있으면 즉시 원소 적용 */
		if (el && currentTab === 'editor' && ed2d.selectedAtoms && ed2d.selectedAtoms.length > 0) {
			var changed = false;
			ed2d.selectedAtoms.forEach(function(id) {
				var a = atomMap[id];
				if (a) {
					a.element = el;
					delete a.hideLabel;
					if (selectedFixedH !== null) a.fixedH = selectedFixedH; else delete a.fixedH;
					changed = true;
				}
			});
			if (changed) { saveState(); ed2d.render(); updateInfo(); }
			setTool('select');
		} else if (el && currentTab === 'editor') {
			setTool('atom');
		}
		updateStatusBar();
	}
	function clearElementSelection() {
		selectedElement = null;
		$('#fmlChemDrawWin .btnBox[data-element]').removeClass('on');
	}
	function setBondTypeUI(bt) {
		bondType = bt || 'single';
		$('#fmlChemDrawWin .btnBox[data-bondtype]').removeClass('on');
		if (bt) $('#fmlChemDrawWin .btnBox[data-bondtype="'+bt+'"]').addClass('on');
	}
	function clearBondSelection() {
		$('#fmlChemDrawWin .btnBox[data-bondtype]').removeClass('on');
	}
	/* Ring tool */
	var selectedRing = null;
	function setRing(type) {
		selectedRing = type;
		$('#fmlChemDrawWin .ringBtn').removeClass('on');
		if (type) $('#fmlChemDrawWin .ringBtn[data-ring="'+type+'"]').addClass('on');
		if (type) { clearElementSelection(); clearBondSelection(); ed2d.tool = 'ring'; if (ed2d.svgEl) ed2d.svgEl.style.cursor = 'cell'; updateStatusBar(); ed2d.render(); }
	}
	function clearRingSelection() {
		selectedRing = null;
		$('#fmlChemDrawWin .ringBtn').removeClass('on');
	}
	function placeRing(cx, cy, type, radius) {
		var n = (type[0] === '5') ? 5 : 6;
		var dbl = (type[1] === 'd');
		var r = radius || 40;
		var newAtoms = [], newBonds = [];
		/* 정다각형 꼭짓점: 좌표를 소수점 2자리로 반올림하여 대칭 보장 */
		var startAngle = (n === 6) ? 0 : -Math.PI / 2; /* 6각형: flat-top/bottom (0도 시작), 5각형: 꼭짓점 위 */
		for (var i = 0; i < n; i++) {
			var angle = startAngle + (2 * Math.PI * i / n);
			var ax = Math.round((cx + r * Math.cos(angle)) * 100) / 100;
			var ay = Math.round((cy + r * Math.sin(angle)) * 100) / 100;
			var a = { id: genId(), element: 'C', x: ax, y: ay, hideLabel: true };
			newAtoms.push(a);
			atoms.push(a);
		}
		for (var i = 0; i < n; i++) {
			var from = newAtoms[i].id;
			var to = newAtoms[(i + 1) % n].id;
			var bt = 'single';
			if (dbl && i % 2 === 0) bt = 'double';
			var b = { id: genId(), from: from, to: to, type: bt };
			newBonds.push(b);
			bonds.push(b);
		}
		ed2d.selectedAtoms = newAtoms.map(function(a) { return a.id; });
		ed2d.selectedBonds = newBonds.map(function(b) { return b.id; });
		ed2d.selectedBrackets = [];
		saveState(); refreshCurrentTab(); updateInfo();
		setTool('select');
	}

	/* ═══════════════════════════════════════
	   Periodic Table Modal
	   ═══════════════════════════════════════ */
	function buildPeriodicTable() {
		var html = '';
		var existing = {};
		$('#cdSelectOptions .btnBox[data-element]').each(function() {
			existing[$(this).attr('data-element')] = true;
		});
		/* Row labels for f-block */
		html += '<div class="pt-cell pt-ref" style="grid-row:9;grid-column:1;grid-column-end:3;border:none;justify-content:flex-end;"><span class="pt-sym" style="font-size:10px;color:rgba(244,143,177,0.8);">Lanthanides</span></div>';
		html += '<div class="pt-cell pt-ref" style="grid-row:10;grid-column:1;grid-column-end:3;border:none;justify-content:flex-end;"><span class="pt-sym" style="font-size:10px;color:rgba(255,171,145,0.8);">Actinides</span></div>';
		PT_DATA.forEach(function(el) {
			var sym = el[0], z = el[1], r = el[2], c = el[3], cat = el[4], name = el[7];
			var catColor = PT_CAT_COLORS[cat] || '#e0e0e0';
			var glowRgb = PT_CAT_GLOW[cat] || '189,189,189';
			var added = existing[sym] ? ' pt-added' : '';
			var radioactive = (typeof PT_MASS[sym] === 'string' && PT_MASS[sym].indexOf('(') === 0) ? ' pt-radioactive' : '';
			var checkHtml = existing[sym] ? '<span class="pt-check-overlay">\u2713</span>' : '';
			html += '<div class="pt-cell pt-hidden' + added + radioactive + '" data-pt-sym="' + sym + '" ' +
				'style="grid-row:' + r + ';grid-column:' + c + ';background:' + catColor +
				';box-shadow:0 0 12px rgba(' + glowRgb + ',0.25), inset 0 0 10px rgba(' + glowRgb + ',0.08)' +
				';border-color:rgba(' + glowRgb + ',0.2);--cat-glow:' + glowRgb + ';--pulse-delay:' + (Math.random() * 2).toFixed(2) + 's' +
				(radioactive ? ';--decay-dx:' + (Math.random()>0.5?1:-1) * (20 + Math.random()*25).toFixed(0) + 'px' +
					';--decay-dy:' + (Math.random()>0.5?1:-1) * (20 + Math.random()*25).toFixed(0) + 'px' +
					';--decay-duration:' + (2.5 + Math.random()*2).toFixed(1) + 's' +
					';--decay-delay:' + (Math.random()*3).toFixed(1) + 's' +
					';--decay-dx2:' + (Math.random()>0.5?1:-1) * (18 + Math.random()*22).toFixed(0) + 'px' +
					';--decay-dy2:' + (Math.random()>0.5?1:-1) * (18 + Math.random()*22).toFixed(0) + 'px' +
					';--decay-duration2:' + (2 + Math.random()*2).toFixed(1) + 's' +
					';--decay-delay2:' + (Math.random()*3).toFixed(1) + 's' : '') +
				';" ' +
				'data-pt-name="' + name + '" data-pt-cat="' + (PT_CAT_NAMES[cat]||'') + '" data-pt-mass="' + (PT_MASS[sym]||'') + '" data-pt-en="' + (PT_EN[sym]||'') + '">' +
				checkHtml +
				(radioactive ? '<span class="pt-decay-p2"></span>' : '') +
				'<span class="pt-z">' + z + '</span>' +
				'<span class="pt-en">' + (PT_EN[sym] || '') + '</span>' +
				'<span class="pt-sym">' + sym + '</span>' +
				'<span class="pt-mass">' + (PT_MASS[sym] || '') + '</span></div>';
		});
		$('#cdPTGrid').html(html);
		/* Legend (brighter dots for visibility) */
		var PT_LEGEND_COLORS = {
			'am':'rgba(239,83,80,0.7)','ae':'rgba(255,202,40,0.7)','tm':'rgba(186,104,200,0.6)',
			'pt':'rgba(144,164,174,0.6)','md':'rgba(102,187,106,0.7)','nm':'rgba(77,208,225,0.7)',
			'ha':'rgba(255,238,88,0.7)','ng':'rgba(79,195,247,0.7)','la':'rgba(240,98,146,0.7)',
			'ac':'rgba(255,138,101,0.7)','uk':'rgba(189,189,189,0.5)'
		};
		var legend = '';
		Object.keys(PT_CAT_COLORS).forEach(function(cat) {
			legend += '<span class="pt-legend-item"><span class="pt-legend-dot" style="background:' + (PT_LEGEND_COLORS[cat]||PT_CAT_COLORS[cat]) + ';"></span>' + PT_CAT_NAMES[cat] + '</span>';
		});
		$('#cdPTLegend').html(legend);
	}

	function openPeriodicTable() {
		buildPeriodicTable();
		$('#cdPeriodicTableOverlay').addClass('active');
		/* 모달이 열린 뒤 원소 셀을 랜덤 딜레이로 띄용! 팝 */
		setTimeout(function() {
			var $cells = $('#cdPTGrid .pt-cell[data-pt-sym]');
			$cells.each(function() {
				var $c = $(this);
				var delay = Math.random() * 700;
				setTimeout(function() {
					$c.removeClass('pt-hidden').addClass('pt-pop');
					$c.one('animationend', function() {
						$(this).removeClass('pt-pop').css({'opacity': 1, 'transform': ''});
					});
				}, delay);
			});
		}, 150);
	}
	function closePeriodicTable() {
		$('#cdPeriodicTableOverlay').removeClass('active');
	}

	function addElementFromPT(sym) {
		var slots = cdGetElementSlots();
		/* Already in toolbar → just select it */
		if (slots.indexOf(sym) >= 0) {
			setElement(sym);
			closePeriodicTable();
			return;
		}
		/* ELEMENTS / VALENCES 등록 */
		cdRegisterElement(sym);
		/* 10개 초과 → 마지막 원소 제거, 오른쪽으로 밀기 */
		if (slots.length >= CD_MAX_SLOTS) {
			slots.pop();
		}
		slots.unshift(sym);
		cdSaveElementSlots(slots);
		cdRenderElementSlots();
		/* Select the new element */
		setElement(sym);
		closePeriodicTable();
	}

	function updateStatusBar() {
		var statusEl = document.getElementById('chemDrawStatus'); if (!statusEl) return;
		var msg = '';
		if (ed2d.tool === 'atom') msg = '\uCE94\uBC84\uC2A4 \uD074\uB9AD: ' + (selectedElement || '') + ' \uC6D0\uC790 \uBC30\uCE58 | \uAE30\uC874 \uC6D0\uC790 \uD074\uB9AD: \uC6D0\uC18C \uBCC0\uACBD';
		else if (ed2d.tool === 'select') msg = '\uB4DC\uB798\uADF8: \uC774\uB3D9 | \uB354\uBE14\uD074\uB9AD: \uC18D\uC131\uBCC0\uACBD | Del: \uC0AD\uC81C | Ctrl+\uD074\uB9AD: \uAC1C\uBCC4\uC120\uD0DD | Shift+\uD074\uB9AD: \uADF8\uB8F9\uC120\uD0DD | Ctrl+A: \uC804\uCCB4\uC120\uD0DD | Ctrl+C/V: \uBCF5\uC0AC/\uBD99\uC5EC\uB123\uAE30 | Ctrl+Z/Y: \uC2E4\uD589\uCDE8\uC18C/\uC7AC\uC2E4\uD589 | Ctrl+\uD720: \uD655\uB300\uCD95\uC18C | \uC6B0\uD074\uB9AD: \uBA54\uB274';
		else if (ed2d.tool === 'bond') msg = '\uC6D0\uC790\uC5D0\uC11C \uB4DC\uB798\uADF8\uD558\uC5EC \uB2E4\uB978 \uC6D0\uC790\uC5D0 \uB193\uAE30: \uC120 \uC5F0\uACB0 | \uAE30\uC874 \uC120 \uD074\uB9AD: \uB2E8\uC77C\u2192\uC774\uC911\u2192\uC0BC\uC911 \uC21C\uD658';
		else if (ed2d.tool === 'ring') msg = '\uCE94\uBC84\uC2A4 \uD074\uB9AD: \uB9C1 \uAD6C\uC870 \uBC30\uCE58 | Ring \uBC84\uD2BC \uC7AC\uD074\uB9AD: \uD574\uC81C';
		statusEl.textContent = msg;
	}
	function set3DTool(t) {
		ed3d.tool = t; ed3d.bondStartId = null; ed3d.selectedId = null;
		$('#cd3DToolTab li').removeClass('on');
		$('#cd3DToolTab li[data-tool="'+t+'"]').addClass('on');
		cdUpdateTabBg($('#cd3DToolTab'));
		$('#cd3DBondOptions').css('display', t === 'bond' ? 'flex' : 'none');
		ed3d.showToolStatus(); ed3d.rebuild();
	}

	/* ═══════════════════════════════════════
	   AI Drawing Loader
	   ═══════════════════════════════════════ */
	function showDrawingLoader(msg) {
		var loader = document.getElementById('aiDrawingLoader');
		var textEl = document.getElementById('aiLoaderText');
		var subEl  = document.getElementById('aiLoaderSub');
		if (msg) textEl.textContent = msg;
		else textEl.textContent = 'AI가 분자 구조를 그리고 있습니다...';
		subEl.textContent = '잠시만 기다려주세요';
		loader.classList.remove('done');
		loader.classList.add('active');
	}

	function hideDrawingLoader(doneMsg) {
		var loader = document.getElementById('aiDrawingLoader');
		var textEl = document.getElementById('aiLoaderText');
		var subEl  = document.getElementById('aiLoaderSub');
		loader.classList.add('done');
		textEl.textContent = doneMsg || '분자 구조가 완성되었습니다!';
		subEl.textContent = '';
		setTimeout(function() {
			loader.classList.remove('active', 'done');
		}, 800);
	}

	/* ═══════════════════════════════════════
	   AI Chat
	   ═══════════════════════════════════════ */
	var aiChatHistory = []; // 대화 이력 (세션 유지)
	var aiWs = null;        // WebSocket 연결
	var aiCurrentTypingDiv = null;
	var aiCurrentIsDrawRequest = false;
	var aiChunkBuffer = '';   // 스트리밍 청크 누적 버퍼
	var aiDescText = '';      // 추출된 description 텍스트
	var aiDescShown = 0;      // 현재까지 표시된 글자 수
	var aiStreamTimer = null; // 한 글자씩 표시 타이머

	/* description 텍스트 추출 (부분 JSON에서) */
	function aiExtractDesc(buf) {
		var dIdx = buf.indexOf('"description"');
		if (dIdx < 0) return '';
		var colonIdx = buf.indexOf(':', dIdx + 13);
		if (colonIdx < 0) return '';
		var rest = buf.substring(colonIdx + 1);
		var qIdx = rest.indexOf('"');
		if (qIdx < 0) return '';
		var raw = rest.substring(qIdx + 1);
		// description 값 끝 감지
		var ends = ['","action"', '", "action"', '",\n', '"\n}'];
		var endIdx = -1;
		for (var i = 0; i < ends.length; i++) {
			var idx = raw.indexOf(ends[i]);
			if (idx >= 0 && (endIdx < 0 || idx < endIdx)) endIdx = idx;
		}
		if (endIdx >= 0) raw = raw.substring(0, endIdx);
		return raw.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, '\t').replace(/\\\\/g, '\\');
	}

	/* 한 글자씩 부드럽게 표시 */
	function aiStreamTick() {
		if (aiDescShown >= aiDescText.length) return;
		var ch = aiDescText.charAt(aiDescShown);
		// HTML 태그는 통째로 출력
		if (ch === '<') {
			var closeIdx = aiDescText.indexOf('>', aiDescShown);
			if (closeIdx >= 0) { aiDescShown = closeIdx + 1; }
			else return;
		} else if (ch === '&') {
			var semiIdx = aiDescText.indexOf(';', aiDescShown);
			if (semiIdx >= 0 && semiIdx - aiDescShown < 10) { aiDescShown = semiIdx + 1; }
			else aiDescShown++;
		} else {
			aiDescShown++;
		}
		var shown = aiDescText.substring(0, aiDescShown);
		if (aiCurrentTypingDiv) {
			var bubbleEl = aiCurrentTypingDiv.querySelector('.aiMsgBubble');
			if (bubbleEl) {
				bubbleEl.classList.remove('typing');
				bubbleEl.innerHTML = '<div class="aiMsgAvatar" style="display:inline;"><i class="material-icons" style="font-size:14px;vertical-align:middle;margin-right:4px;">auto_awesome</i></div>' + shown.replace(/\n/g, '<br>');
			}
			var msgEl = document.getElementById('aiChatMessages');
			if (msgEl) msgEl.scrollTop = msgEl.scrollHeight;
		}
	}

	/* WebSocket 연결 확보 */
	function ensureAiWs() {
		if (aiWs && aiWs.readyState === WebSocket.OPEN) return Promise.resolve();
		return new Promise(function(resolve, reject) {
			try { if (aiWs) aiWs.close(); } catch(e) {}
			aiWs = new WebSocket('wss://4xh7lw15ah.execute-api.us-west-2.amazonaws.com/prod');
			aiWs.onopen = function() { resolve(); };
			aiWs.onerror = function() { reject(new Error('WebSocket 연결 실패')); };
			aiWs.onclose = function() { aiWs = null; };
			aiWs.onmessage = onAiWsMessage;
		});
	}
	window.ensureAiWs = ensureAiWs;

	/* Keepalive ping (30초마다, idle 타임아웃 방지) */
	setInterval(function() {
		if (aiWs && aiWs.readyState === WebSocket.OPEN) {
			try { aiWs.send(JSON.stringify({ action: 'chemStudioAgentFunction', type: 'ping' })); } catch(e) {}
		}
	}, 30000);

	/* WebSocket 메시지 수신 처리 */
	function onAiWsMessage(evt) {
		var m;
		try { m = JSON.parse(evt.data); } catch(e) { return; }
		var messagesEl = document.getElementById('aiChatMessages');

		switch(m.type) {
		case 'chunk':
			aiChunkBuffer += (m.token || '');
			var extracted = aiExtractDesc(aiChunkBuffer);
			if (extracted && extracted.length > aiDescText.length) {
				aiDescText = extracted;
				// 타이머가 없으면 시작 (15ms 간격 한 글자씩)
				if (!aiStreamTimer) {
					aiStreamTimer = setInterval(aiStreamTick, 15);
				}
			}
			break;

		case 'done':
			// 타이핑 타이머 정리
			if (aiStreamTimer) { clearInterval(aiStreamTimer); aiStreamTimer = null; }
			// 스트리밍 div를 최종 결과 div로 재사용
			var botDiv = aiCurrentTypingDiv || document.createElement('div');
			if (!aiCurrentTypingDiv) {
				botDiv.className = 'aiMsg bot';
				messagesEl.appendChild(botDiv);
			}
			aiCurrentTypingDiv = null;

			try {
				var reply = m.reply;
				if (typeof reply === 'string') reply = JSON.parse(reply);

				if (reply.success) {
					if (reply.draw !== false && reply.atoms && reply.atoms.length > 0) {
						atoms.length = 0; bonds.length = 0; brackets.length = 0;
						reply.atoms.forEach(function(a) { atoms.push(a); });
						(reply.bonds || []).forEach(function(b) { bonds.push(b); });
						(reply.brackets || []).forEach(function(br) { brackets.push(br); });
						var maxId = 0;
						atoms.forEach(function(a) { if (a.id > maxId) maxId = a.id; });
						bonds.forEach(function(b) { if (b.id > maxId) maxId = b.id; });
						brackets.forEach(function(br) { if (br.id > maxId) maxId = br.id; });
						nextId = maxId + 1;
						if (!ed2d.svgEl) { fnInitChemDraw(); }
						ed2d.render();
						$('#chemDrawEmpty').hide();
						try { saveState(); } catch(se) {}
						try { updateChemInfo(); } catch(ue) {}
						hideDrawingLoader((reply.name || '구조') + ' 생성 완료!');
					} else {
						if (aiCurrentIsDrawRequest) hideDrawingLoader('완료');
					}
					aiChatHistory.push({ role: 'assistant', content: JSON.stringify(reply) });

					var bubbleHtml = reply.description || '구조를 생성했습니다.';
					if (reply.name || reply.formula) {
						bubbleHtml += '<br><span class="aiMsgHint">' + (reply.name || '') + (reply.formula ? ' (' + reply.formula + ')' : '') + '</span>';
					}
					// 최종 포맷 바로 적용 (typewriteHtml 없이 — 이미 스트리밍으로 표시됨)
					botDiv.innerHTML = '<div class="aiMsgAvatar"><i class="material-icons">auto_awesome</i></div>'
						+ '<div class="aiMsgBubble">' + bubbleHtml + '</div>';
				} else {
					if (aiCurrentIsDrawRequest) hideDrawingLoader('요청 처리 실패');
					aiChatHistory.push({ role: 'assistant', content: JSON.stringify(reply) });
					botDiv.innerHTML = '<div class="aiMsgAvatar"><i class="material-icons">auto_awesome</i></div>'
						+ '<div class="aiMsgBubble">' + (reply.error || '요청을 처리할 수 없습니다.')
						+ (reply.suggestion ? '<br><span class="aiMsgHint">' + reply.suggestion + '</span>' : '') + '</div>';
				}
			} catch(e) {
				if (aiCurrentIsDrawRequest) hideDrawingLoader('오류가 발생했습니다');
				botDiv.innerHTML = '<div class="aiMsgAvatar"><i class="material-icons">auto_awesome</i></div>'
					+ '<div class="aiMsgBubble">응답 처리 중 오류가 발생했습니다.<br><span class="aiMsgHint">' + e.message + '</span></div>';
			}
			messagesEl.scrollTop = messagesEl.scrollHeight;
			aiCurrentIsDrawRequest = false;
			break;

		case 'error':
			if (aiCurrentTypingDiv) { aiCurrentTypingDiv.remove(); aiCurrentTypingDiv = null; }
			if (aiCurrentIsDrawRequest) hideDrawingLoader('연결 실패');
			var errDiv = document.createElement('div');
			errDiv.className = 'aiMsg bot';
			errDiv.innerHTML = '<div class="aiMsgAvatar"><i class="material-icons">auto_awesome</i></div>'
				+ '<div class="aiMsgBubble">오류가 발생했습니다.<br><span class="aiMsgHint">' + (m.error || m.details || 'unknown') + '</span></div>';
			messagesEl.appendChild(errDiv);
			messagesEl.scrollTop = messagesEl.scrollHeight;
			aiCurrentIsDrawRequest = false;
			break;

		case 'pong':
			// keepalive 응답 — 무시
			break;
		}
	}

	/* HTML 태그 보존 타이핑 효과 */
	function typewriteHtml(el, html, speed, callback) {
		var tokens = [];
		var re = /(<[^>]+>|&[a-zA-Z0-9#]+;|[^<&])/g;
		var m;
		while ((m = re.exec(html)) !== null) tokens.push(m[0]);
		var i = 0, buf = '';
		var messagesEl = document.getElementById('aiChatMessages');
		function tick() {
			if (i >= tokens.length) { if (callback) callback(); return; }
			var t = tokens[i++];
			buf += t;
			el.innerHTML = buf;
			if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
			if (t.charAt(0) === '<' || t.charAt(0) === '&') {
				tick();
			} else {
				setTimeout(tick, speed || 15);
			}
		}
		tick();
	}



	window.sendAiChat = async function() {
		var input = document.getElementById('aiChatInputField');
		var msg = input.value.trim();
		if (!msg) return;
		var messagesEl = document.getElementById('aiChatMessages');

		// 사용자 메시지 UI
		var userDiv = document.createElement('div');
		userDiv.className = 'aiMsg user';
		userDiv.innerHTML = '<div class="aiMsgBubble">' + msg.replace(/</g,'&lt;') + '</div>';
		messagesEl.appendChild(userDiv);
		input.value = '';

		// 현재 캔버스 구조를 메시지에 첨부
		var aiMsg = msg;
		if (atoms.length > 0) {
			var canvasState = {
				atoms: atoms.map(function(a) {
					var o = { id: a.id, element: a.element, x: Math.round(a.x), y: Math.round(a.y) };
					if (a.fixedH !== undefined && a.fixedH !== null) o.fixedH = a.fixedH;
					if (a.charge) o.charge = a.charge;
					return o;
				}),
				bonds: bonds.map(function(b) {
					return { id: b.id, from: b.from, to: b.to, type: b.type };
				})
			};
			aiMsg = '[현재 캔버스 구조]\n' + JSON.stringify(canvasState) + '\n\n[사용자 요청]\n' + msg;
		}
		aiChatHistory.push({ role: 'user', content: aiMsg });

		// 타이핑 인디케이터
		var typingDiv = document.createElement('div');
		typingDiv.className = 'aiMsg bot';
		typingDiv.innerHTML = '<div class="aiMsgAvatar"><i class="material-icons">auto_awesome</i></div><div class="aiMsgBubble typing"><span></span><span></span><span></span></div>';
		messagesEl.appendChild(typingDiv);
		messagesEl.scrollTop = messagesEl.scrollHeight;
		aiCurrentTypingDiv = typingDiv;
		aiChunkBuffer = '';
		aiDescText = '';
		aiDescShown = 0;
		if (aiStreamTimer) { clearInterval(aiStreamTimer); aiStreamTimer = null; }

		// 그리기 요청 여부 판별: "그려줘","추가해줘" 등 명확한 지시형만 매칭
		aiCurrentIsDrawRequest = /그려줘|그려 ?줘|추가해줘|추가해 ?줘|변경해줘|변경해 ?줘|제거해줘|제거해 ?줘|만들어줘|만들어 ?줘|바꿔줘|바꿔 ?줘|붙여줘|붙여 ?줘|삭제해줘|삭제해 ?줘|수정해줘|수정해 ?줘|합성해줘|합성해 ?줘|생성해줘|생성해 ?줘|이어줘|이어 ?줘|결합해줘|결합해 ?줘/.test(msg);
		if (aiCurrentIsDrawRequest) showDrawingLoader('생성중..');

		// WebSocket 연결 & 전송
		try {
			await ensureAiWs();
			aiWs.send(JSON.stringify({ action: 'chemStudioAgentFunction', messages: aiChatHistory, stream: true }));
		} catch(e) {
			typingDiv.remove();
			aiCurrentTypingDiv = null;
			if (aiCurrentIsDrawRequest) hideDrawingLoader('연결 실패');
			var errDiv = document.createElement('div');
			errDiv.className = 'aiMsg bot';
			errDiv.innerHTML = '<div class="aiMsgAvatar"><i class="material-icons">auto_awesome</i></div>'
				+ '<div class="aiMsgBubble">서버 연결에 실패했습니다.<br><span class="aiMsgHint">' + e.message + '</span></div>';
			messagesEl.appendChild(errDiv);
			messagesEl.scrollTop = messagesEl.scrollHeight;
		}
	}

	// 채팅 초기화 (에디터 닫을 때)
	window.resetAiChat = function() {
		aiChatHistory = [];
		aiCurrentTypingDiv = null;
		aiCurrentIsDrawRequest = false;
		aiChunkBuffer = '';
		aiDescText = '';
		aiDescShown = 0;
		if (aiStreamTimer) { clearInterval(aiStreamTimer); aiStreamTimer = null; }
		var messagesEl = document.getElementById('aiChatMessages');
		messagesEl.innerHTML = '<div class="aiMsg bot">'
			+ '<div class="aiMsgAvatar"><i class="material-icons">auto_awesome</i></div>'
			+ '<div class="aiMsgBubble">안녕하세요! 분자 구조를 그려드릴게요. 원하는 분자를 말씀해주세요.<br><span class="aiMsgHint">예: "벤젠 그려줘", "OH기 추가해줘"</span></div>'
			+ '</div>';
		// 채팅 패널 닫기
		var panel = document.querySelector('.aiChatPanel');
		if (panel) panel.classList.add('collapsed');
	}

	/* ═══════════════════════════════════════
	   AI Chat Panel — Drag & Resize
	   ═══════════════════════════════════════ */
	;(function() {
		var panel = document.getElementById('aiChatPanel');
		var handle = document.getElementById('aiChatDragHandle');
		if (!panel || !handle) return;

		var isDragging = false, isResizing = false, resizeDir = '';
		var startX, startY, startLeft, startTop, startW, startH;
		var MIN_W = 280, MIN_H = 250;

		/* — 초기 위치를 left/top/width/height으로 전환 (right/bottom 제거) — */
		function ensureLeftTop() {
			if (panel.dataset.posInit) return;
			var parent = panel.offsetParent || panel.parentElement;
			var pRect = parent.getBoundingClientRect();
			var rect = panel.getBoundingClientRect();
			panel.style.width  = rect.width + 'px';
			panel.style.height = rect.height + 'px';
			panel.style.left   = (rect.left - pRect.left) + 'px';
			panel.style.top    = (rect.top  - pRect.top)  + 'px';
			panel.style.right  = 'auto';
			panel.style.bottom = 'auto';
			panel.dataset.posInit = '1';
		}

		/* — Drag (헤더 잡고 이동) — */
		handle.addEventListener('mousedown', function(e) {
			if (e.target.closest('.aiChatToggle')) return;
			if (panel.classList.contains('collapsed')) return;
			ensureLeftTop();
			isDragging = true;
			startX = e.clientX;
			startY = e.clientY;
			startLeft = panel.offsetLeft;
			startTop  = panel.offsetTop;
			panel.style.transition = 'none';
			document.body.style.userSelect = 'none';
			document.body.classList.add('aiChat-dragging');
			e.preventDefault();
		});

		/* — Resize (가장자리 핸들) — */
		panel.addEventListener('mousedown', function(e) {
			var t = e.target;
			if (!t.classList.contains('aiResize')) return;
			ensureLeftTop();
			isResizing = true;
			resizeDir = t.className.replace('aiResize aiResize-', '');
			startX = e.clientX;
			startY = e.clientY;
			startW = panel.offsetWidth;
			startH = panel.offsetHeight;
			startLeft = panel.offsetLeft;
			startTop  = panel.offsetTop;
			panel.style.transition = 'none';
			document.body.style.userSelect = 'none';
			e.preventDefault();
		});

		var resized = false;

		document.addEventListener('mousemove', function(e) {
			if (isDragging) {
				var dx = e.clientX - startX;
				var parent = panel.offsetParent || panel.parentElement;
				var maxL = parent.clientWidth  - panel.offsetWidth;
				var newL = Math.max(0, Math.min(startLeft + dx, maxL));
				panel.style.left = newL + 'px';
				if (resized) {
					var dy = e.clientY - startY;
					var maxT = parent.clientHeight - panel.offsetHeight;
					var newT = Math.max(0, Math.min(startTop + dy, maxT));
					panel.style.top = newT + 'px';
				}
			}
			if (isResizing) {
				var dx = e.clientX - startX;
				var dy = e.clientY - startY;
				var d = resizeDir;
				var newW = startW, newH = startH, newL = startLeft, newT = startTop;

				if (d.indexOf('e') !== -1) newW = Math.max(MIN_W, startW + dx);
				if (d.indexOf('w') !== -1) { newW = Math.max(MIN_W, startW - dx); newL = startLeft + (startW - newW); }
				if (d.indexOf('s') !== -1) newH = Math.max(MIN_H, startH + dy);
				if (d.indexOf('n') !== -1) { newH = Math.max(MIN_H, startH - dy); newT = startTop + (startH - newH); }

				panel.style.width  = newW + 'px';
				panel.style.height = newH + 'px';
				panel.style.left   = newL + 'px';
				panel.style.top    = newT + 'px';
			}
		});

		document.addEventListener('mouseup', function() {
			if (isDragging || isResizing) {
				if (isResizing) resized = true;
				isDragging = false;
				isResizing = false;
				resizeDir = '';
				panel.style.transition = '';
				document.body.style.userSelect = '';
				document.body.classList.remove('aiChat-dragging');
			}
		});

		/* — 패널 닫힐 때: 현재 위치에서 사라진 후 위치 리셋 — */
		var obs = new MutationObserver(function(muts) {
			muts.forEach(function(m) {
				if (m.attributeName === 'class' && panel.classList.contains('collapsed')) {
					panel.addEventListener('transitionend', function onEnd(e) {
						if (e.propertyName !== 'transform') return;
						panel.removeEventListener('transitionend', onEnd);
						panel.style.left = ''; panel.style.top = '';
						panel.style.right = ''; panel.style.bottom = '';
						panel.style.width = ''; panel.style.height = '';
						delete panel.dataset.posInit;
						resized = false;
					});
				}
			});
		});
		obs.observe(panel, { attributes: true, attributeFilter: ['class'] });
	})();

	/* ═══════════════════════════════════════
	   Tab switching
	   ═══════════════════════════════════════ */
	function switchTab(tab) {
		currentTab = tab;
		/* 메인 탭 활성 상태 */
		$('#cdMainTabs li').removeClass('on');
		$('#cdMainTabs li[data-tab="'+tab+'"]').addClass('on');
		cdUpdateTabBg($('#cdMainTabs'));
		/* 에디터 영역 전환 */
		$('#chemDrawEditorArea, #chemDraw2DViewArea, #chemDraw3DViewArea').css('display', 'none');
		/* toolsArea 표시/숨김 */
		var isEditor = (tab === 'editor');
		$('#chemDrawToolsArea').toggle(isEditor);
		$('#cd2DToolsContent').css('display', tab === 'editor' ? 'flex' : 'none');
		$('#cdCopyBtn, #cdDownloadBtn').css('display', tab === '2dview' ? '' : 'none');
		/* Clear/Save 표시 및 chemDrawMolNm 활성 (editor 탭에서만) */
		$('#cdClearBtn, #cdSaveBtn').toggle(isEditor);
		$('.editorStatusBar').toggle(isEditor);
		$('#chemDrawMolNm, #chemDrawCasNo').prop('disabled', !isEditor);
		if (tab === 'editor') {
			$('#chemDrawEditorArea').css('display', 'flex');
			$('.editorModeArea').css('background-image', ed2d.showGrid ? '' : 'none');
			/* 도구 버튼 순차 fadeIn (경량: CSS transition 사용, reflow 1회) */
			var $allBtns = $('#cdSelectOptions .btnBox, #cdAddElementBtn, #cdSelectOptions .ringBtn');
			$allBtns.css({'opacity': 0, 'transform': 'translateX(-8px)', 'transition': 'none'});
			void $allBtns[0].offsetHeight; /* reflow 1회만 */
			$allBtns.each(function(i) {
				var $el = $(this);
				setTimeout(function() {
					$el.css({'opacity': 1, 'transform': '', 'transition': 'opacity 0.15s ease, transform 0.15s ease'});
				}, i * 20);
			});
			/* transition 정리 */
			setTimeout(function() { $allBtns.css('transition', ''); }, $allBtns.length * 20 + 200);
			setTimeout(function() { ed2d.render(); }, 50);
		}
		else if (tab === '2dview') {
			$('#chemDraw2DViewArea').css('display', 'flex');
			$('.editorModeArea').css('background-image', 'none');
			/* Copy/Download/CopyToNew bounceIn 애니메이션 */
			$('#cdCopyBtn, #cdDownloadBtn, #cdCopyToNewBtn').removeClass('animate__animated animate__bounceIn');
			setTimeout(function() {
				$('#cdCopyBtn, #cdDownloadBtn, #cdCopyToNewBtn').addClass('animate__animated animate__bounceIn');
			}, 100);
			setTimeout(function() { view2d.svgEl = document.getElementById('chemDraw2DViewSvg'); view2d.containerEl = document.getElementById('chemDraw2DViewContainer'); view2d.render(); }, 50);
		}
		else if (tab === '3dview') {
			$('#chemDraw3DViewArea').css('display', 'flex');
			$('.editorModeArea').css('background-image', 'none');
			if (!view3d.renderer) { setTimeout(view3d.init, 100); } else { setTimeout(function() { view3d.resize(); view3d.rebuild(); }, 50); }
		}
	}

	/* ═══════════════════════════════════════
	   Initialize / Destroy
	   ═══════════════════════════════════════ */
	function fnInitChemDraw() {
		var container = document.getElementById('chemDrawContainer');
		if (!container) return;
		var oldSvg = document.getElementById('chemDrawSvg');
		if (oldSvg) oldSvg.remove();
		var newSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		newSvg.id = 'chemDrawSvg';
		newSvg.style.cursor = 'crosshair';
		container.insertBefore(newSvg, container.firstChild);
		ed2d.containerEl = container;
		ed2d.svgEl = newSvg;
		atoms = []; bonds = []; brackets = []; nextId = 1;
		ed2d.tool = 'select'; selectedElement = null; selectedRing = null; bondType = 'single'; selectedFixedH = null;
		ed2d.selectedAtom = null; ed2d.selectedBond = null; ed2d.selectedBracket = null;
		ed2d.dragging = null; ed2d.bondStart = null; ed2d._dragGroup = null;
		ed2d.hoveredAtom = -1; ed2d.hoveredBond = -1; ed2d.hoveredBracket = -1;
		ed2d.selectedAtoms = []; ed2d.selectedBonds = []; ed2d.selectedBrackets = []; ed2d.bracketDragOffsets = [];
		ed2d.rubberBand = null; ed2d.isDragging = false;
		ed2d.mouseDownPos = null; ed2d.mouseDownTarget = null;
		ed2d.lastClickTime = 0; ed2d.lastClickAtomId = -1; ed2d.lastClickBondId = -1;
		history = []; historyIdx = -1; ed2d.showGrid = true; currentTab = 'editor';
		saveState();
		clearElementSelection();
		newSvg.addEventListener('mousedown', ed2d.onMouseDown);
		newSvg.addEventListener('mousemove', ed2d.onMouseMove);
		newSvg.addEventListener('mouseup', ed2d.onMouseUp);
		newSvg.addEventListener('mouseleave', ed2d.onMouseUp);
		newSvg.addEventListener('wheel', ed2d.onWheel, { passive: false });
		cdAttachContextMenu(newSvg);
		$(document).off('keydown.chemdraw').on('keydown.chemdraw', ed2d.onKeyDown);
		$(window).off('resize.chemdraw').on('resize.chemdraw', function() {
			if (currentTab === 'editor') ed2d.render();
			else if (currentTab === '2dview') view2d.render();
			else if (currentTab === '3dview') view3d.resize();
		});
		if (window.ResizeObserver) {
			if (ed2d._resizeObs) ed2d._resizeObs.disconnect();
			ed2d._lastW = 0; ed2d._lastH = 0;
			var _roTimer = null;
			ed2d._resizeObs = new ResizeObserver(function(entries) {
				var entry = entries[0];
				var nw = Math.round(entry.contentRect.width), nh = Math.round(entry.contentRect.height);
				if (nw === ed2d._lastW && nh === ed2d._lastH) return;
				ed2d._lastW = nw; ed2d._lastH = nh;
				/* debounce: 애니메이션 중 연속 호출 방지 */
				if (_roTimer) clearTimeout(_roTimer);
				_roTimer = setTimeout(function() {
					_roTimer = null;
					if (currentTab === 'editor') ed2d.render();
					else if (currentTab === '2dview') view2d.render();
					else if (currentTab === '3dview') view3d.resize();
				}, 100);
			});
			ed2d._resizeObs.observe(ed2d.containerEl);
		}
		setTool('select'); clearElementSelection(); setBondTypeUI(null); setHCount('auto');
		showImplicitH = true;
		/* readOnly mode: 본인 작성이 아닌 경우 2D Editor 탭 숨김 */
		var $editorTab = $('#cdMainTabs li[data-tab="editor"]');
		if (cdIsOwner) {
			$editorTab.show();
			$('#cdCopyToNewBtn').hide();
			switchTab('editor');
		} else {
			$editorTab.hide();
			$('#cdCopyToNewBtn').show();
			switchTab('2dview');
		}
		ed2d.render(); updateInfo();
		if ($('#SEQ_CHEMDRAW').val()) fnLoadChemDraw();
	}

	function fnDestroyChemDraw() { }

	/* ═══════════════════════════════════════
	   Data Extraction
	   ═══════════════════════════════════════ */
	function fnGetChemDrawData() {
		var elementCounts = {};
		atoms.forEach(function(a) { elementCounts[a.element] = (elementCounts[a.element] || 0) + 1; });
		/* 그리드·선택 표시 없이 깨끗한 SVG 저장 */
		var svgData = '';
		if (ed2d.svgEl) {
			var savedGrid = ed2d.showGrid;
			var savedSelAtoms = ed2d.selectedAtoms, savedSelBonds = ed2d.selectedBonds, savedSelBrackets = ed2d.selectedBrackets;
			var savedSelAtom = ed2d.selectedAtom, savedSelBond = ed2d.selectedBond, savedSelBracket = ed2d.selectedBracket;
			var savedHoverAtom = ed2d.hoveredAtom, savedHoverBond = ed2d.hoveredBond, savedHoverBracket = ed2d.hoveredBracket;
			var savedRubber = ed2d.rubberBand;
			ed2d.showGrid = false;
			ed2d.selectedAtoms = []; ed2d.selectedBonds = []; ed2d.selectedBrackets = [];
			ed2d.selectedAtom = null; ed2d.selectedBond = null; ed2d.selectedBracket = null;
			ed2d.hoveredAtom = -1; ed2d.hoveredBond = -1; ed2d.hoveredBracket = -1;
			ed2d.rubberBand = null;
			ed2d.render();
			svgData = ed2d.svgEl.outerHTML;
			ed2d.showGrid = savedGrid;
			ed2d.selectedAtoms = savedSelAtoms; ed2d.selectedBonds = savedSelBonds; ed2d.selectedBrackets = savedSelBrackets;
			ed2d.selectedAtom = savedSelAtom; ed2d.selectedBond = savedSelBond; ed2d.selectedBracket = savedSelBracket;
			ed2d.hoveredAtom = savedHoverAtom; ed2d.hoveredBond = savedHoverBond; ed2d.hoveredBracket = savedHoverBracket;
			ed2d.rubberBand = savedRubber;
			ed2d.render();
		}
		return {
			MOLECULAR_FORMULA: getFormula(),
			MOLECULAR_NM: $('#chemDrawMolNm').val(),
			CAS_NO: $('#chemDrawCasNo').val(),
			ATOMS_JSON: JSON.stringify(atoms),
			BONDS_JSON: JSON.stringify(bonds),
			BRACKETS_JSON: JSON.stringify(brackets),
			ATOM_COUNT: atoms.length,
			BOND_COUNT: bonds.length,
			ELEMENT_COUNTS: JSON.stringify(elementCounts),
			SVG_DATA: svgData
		};
	}

	/* ═══════════════════════════════════════
	   DB Save / Load (Admin)
	   ═══════════════════════════════════════ */
	function fnSaveChemDraw() {
		if (!$('#chemDrawMolNm').val() || !$.trim($('#chemDrawMolNm').val())) { M.toast({ html: '[Molecular Name] 항목은 필수 입력값입니다.', classes: 'cd-toast-glass cd-toast-error' }); $('#chemDrawMolNm').focus(); return false; }
		var data = fnGetChemDrawData();
		var seq = $('#SEQ_CHEMDRAW').val();
		if (seq) data.SEQ_CHEMDRAW = seq;
		$.ajax({
			url: '/admin/popup/saveChemDrawAjax',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(data),
			success: function() {
				M.toast({ html: 'ChemDraw 저장 완료', classes: 'cd-toast-glass' });
				fnLoadChemDrawList();
			},
			error: function() { M.toast({ html: 'ChemDraw 저장 실패', classes: 'cd-toast-glass cd-toast-error' }); }
		});
	}

	function fnLoadChemDraw() {
		var seq = $('#SEQ_CHEMDRAW').val();
		if (!seq) return;
		$.ajax({
			url: '/admin/popup/selectChemDrawAjax',
			type: 'GET',
			data: { SEQ_CHEMDRAW: seq },
			success: function(res) {
				if (res && res.ATOMS_JSON) {
					try {
						atoms = JSON.parse(res.ATOMS_JSON);
						bonds = JSON.parse(res.BONDS_JSON);
						brackets = res.BRACKETS_JSON ? JSON.parse(res.BRACKETS_JSON) : [];
						var maxId = 0;
						atoms.forEach(function(a) { if (a.id > maxId) maxId = a.id; });
						bonds.forEach(function(b) { if (b.id > maxId) maxId = b.id; });
						brackets.forEach(function(b) { if (b.id > maxId) maxId = b.id; });
						nextId = maxId + 1;
						history = []; historyIdx = -1;
						saveState(); refreshCurrentTab();
					} catch (e) { console.error('ChemDraw load parse error:', e); }
				}
				$('#chemDrawMolNm').val(res.MOLECULAR_NM || '');
				$('#chemDrawCasNo').val(res.CAS_NO || '');
			}
		});
	}

	/* ═══════════════════════════════════════
	   Expose to global (onclick handlers)
	   ═══════════════════════════════════════ */
	function setHCount(val) {
		selectedFixedH = (val === 'auto' || val === null) ? null : parseInt(val);
		$('#fmlChemDrawWin .btnBox[data-hcount]').removeClass('on');
		$('#fmlChemDrawWin .btnBox[data-hcount="'+(selectedFixedH !== null ? selectedFixedH : 'auto')+'"]').addClass('on');
		if (selectedFixedH !== null && !showImplicitH) { showImplicitH = true; refreshCurrentTab(); }
	}
	/* Font UI 동기화: 선택된 원소의 font에 맞게 Font 버튼 활성화 */
	function updateFontUI() {
		var $fontBtns = $('#fmlChemDrawWin .btnBox[data-font]');
		if (ed2d.selectedAtoms.length === 0) {
			/* 선택 없음 → 현재 기본 chemFont 표시 */
			$fontBtns.removeClass('on');
			$fontBtns.filter('[data-font="'+chemFont+'"]').addClass('on');
			return;
		}
		/* 선택된 원소들의 font 수집 */
		var fonts = {};
		ed2d.selectedAtoms.forEach(function(id) {
			var a = atomMap[id];
			if (a) fonts[a.font || 'Arial'] = true;
		});
		var fontKeys = Object.keys(fonts);
		$fontBtns.removeClass('on');
		if (fontKeys.length === 1) {
			/* 모든 선택 원소가 같은 font → 해당 font 버튼 활성화 */
			$fontBtns.filter('[data-font="'+fontKeys[0]+'"]').addClass('on');
		}
		/* fontKeys.length > 1 → 혼합 (모두 비활성화) */
	}
	function addAtomToCanvas() {
		var w = ed2d.containerEl ? ed2d.containerEl.clientWidth : 800;
		var h = ed2d.containerEl ? ed2d.containerEl.clientHeight : 500;
		var cx = w / 2, cy = h / 2;
		/* Offset if atom already at center */
		var offset = 0;
		while (atoms.some(function(a) { return Math.abs(a.x - (cx + offset)) < 15 && Math.abs(a.y - cy) < 15; })) { offset += 40; }
		var newAtom = { id: genId(), element: selectedElement || 'C', x: cx + offset, y: cy, font: chemFont };
		if (selectedFixedH !== null) newAtom.fixedH = selectedFixedH;
		atoms.push(newAtom);
		ed2d.selectedAtoms = [newAtom.id]; ed2d.selectedBonds = [];
		saveState(); refreshCurrentTab(); updateInfo();
	}
	window.cdAddAtom = addAtomToCanvas;
	window.cdSetHCount = setHCount;
	window.cdSetTool = setTool;
	window.cdSet3DTool = set3DTool;
	window.cdSetElement = setElement;
	window.cdSetBondType = setBondTypeUI;
	window.cdUndo = function() { if (historyIdx > 0) undo(); };
	window.cdRedo = function() { if (historyIdx < history.length - 1) redo(); };
	window.cdClearAll = clearAll;
	window.cdSwitchTab = switchTab;
	window.cdDownloadImage = function() {
		var formula = getFormula();
		var fileName = 'ChemDraw_' + (formula !== '-' ? formula : 'molecule') + '_' + currentTab;
		if (currentTab === '2dview') {
			var svgEl = document.getElementById('chemDraw2DViewSvg');
			if (!svgEl) return;
			var svgData = new XMLSerializer().serializeToString(svgEl);
			var canvas = document.createElement('canvas');
			var bbox = svgEl.getBoundingClientRect();
			canvas.width = bbox.width * 2;
			canvas.height = bbox.height * 2;
			var ctx = canvas.getContext('2d');
			ctx.scale(2, 2);
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(0, 0, bbox.width, bbox.height);
			var img = new Image();
			var blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
			var url = URL.createObjectURL(blob);
			img.onload = function() {
				ctx.drawImage(img, 0, 0, bbox.width, bbox.height);
				URL.revokeObjectURL(url);
				var a = document.createElement('a');
				a.download = fileName + '.png';
				a.href = canvas.toDataURL('image/png');
				a.click();
			};
			img.src = url;
		} else if (currentTab === '3dview') {
			if (!view3d.renderer) return;
			view3d.renderer.render(view3d.scene, view3d.camera);
			var dataURL = view3d.renderer.domElement.toDataURL('image/png');
			var a = document.createElement('a');
			a.download = fileName + '.png';
			a.href = dataURL;
			a.click();
		}
	};
	window.cdCopyImage = function() {
		function svgToCanvas(svgEl, callback) {
			var svgData = new XMLSerializer().serializeToString(svgEl);
			var canvas = document.createElement('canvas');
			var bbox = svgEl.getBoundingClientRect();
			canvas.width = bbox.width * 2;
			canvas.height = bbox.height * 2;
			var ctx = canvas.getContext('2d');
			ctx.scale(2, 2);
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(0, 0, bbox.width, bbox.height);
			var img = new Image();
			var blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
			var url = URL.createObjectURL(blob);
			img.onload = function() {
				ctx.drawImage(img, 0, 0, bbox.width, bbox.height);
				URL.revokeObjectURL(url);
				callback(canvas);
			};
			img.src = url;
		}
		function copyCanvas(canvas) {
			canvas.toBlob(function(blob) {
				var item = new ClipboardItem({ 'image/png': blob });
				navigator.clipboard.write([item]).then(function() {
					M.toast({ html: '클립보드에 복사되었습니다.', classes: 'cd-toast-glass' });
				}, function() {
					M.toast({ html: '복사 실패', classes: 'cd-toast-glass cd-toast-error' });
				});
			}, 'image/png');
		}
		if (currentTab === '2dview') {
			var svgEl = document.getElementById('chemDraw2DViewSvg');
			if (!svgEl) return;
			svgToCanvas(svgEl, copyCanvas);
		} else if (currentTab === '3dview') {
			if (!view3d.renderer) return;
			view3d.renderer.render(view3d.scene, view3d.camera);
			copyCanvas(view3d.renderer.domElement);
		}
	};
	window.cdToggleGrid = function() {
		ed2d.showGrid = !ed2d.showGrid;
		$('#cdGridToggle').toggleClass('on', ed2d.showGrid);
		var modeArea = document.querySelector('#fmlChemDrawWin .editorModeArea');
		if (modeArea) modeArea.style.backgroundImage = ed2d.showGrid ? '' : 'none';
	};
	window.cdToggle3DGrid = function() { if (!ed3d.gridHelper) return; ed3d.showGrid = !ed3d.showGrid; ed3d.gridHelper.visible = ed3d.showGrid; $('#cd3DGridToggle').toggleClass('on', ed3d.showGrid); };
	window.fnSaveChemDraw = fnSaveChemDraw;
	window.cdCopyToNew = function() {
		/* 현재 구조를 복사하여 새 에디터에서 수정 가능하도록 */
		var copiedAtoms = JSON.parse(JSON.stringify(atoms));
		var copiedBonds = JSON.parse(JSON.stringify(bonds));
		var copiedBrackets = JSON.parse(JSON.stringify(brackets));
		var molNm = $('#chemDrawMolNm').val();
		var casNo = $('#chemDrawCasNo').val();
		/* 새 에디터 열기 (SEQ 초기화 → 새 항목으로 저장됨) */
		$('#SEQ_CHEMDRAW').val('');
		cdIsOwner = true;
		fnShowChemDrawWin();
		/* 복사한 구조 복원 */
		setTimeout(function() {
			atoms = copiedAtoms;
			bonds = copiedBonds;
			brackets = copiedBrackets;
			var maxId = 0;
			atoms.forEach(function(a) { if (a.id > maxId) maxId = a.id; });
			bonds.forEach(function(b) { if (b.id > maxId) maxId = b.id; });
			brackets.forEach(function(b) { if (b.id > maxId) maxId = b.id; });
			nextId = maxId + 1;
			$('#chemDrawMolNm').val(molNm ? molNm + ' (copy)' : '');
			$('#chemDrawCasNo').val(casNo || '');
			history = []; historyIdx = -1;
			saveState(); refreshCurrentTab(); updateInfo();
		}, 200);
	};

	/* ═══════════════════════════════════════
	   불러오기 (TAP_CHEMDRAW → Editor)
	   ═══════════════════════════════════════ */
	function cdApplyChemDrawData(seq) {
		$('#cdSearchDropdown').hide();
		$.ajax({
			url: '/admin/popup/selectChemDrawAjax',
			type: 'GET',
			data: { SEQ_CHEMDRAW: seq },
			success: function(res) {
				if (res && res.ATOMS_JSON) {
					try {
						var newAtoms = JSON.parse(res.ATOMS_JSON);
						var newBonds = JSON.parse(res.BONDS_JSON);
						var idMap = {};
						newAtoms.forEach(function(a) {
							var oldId = a.id;
							a.id = nextId++;
							idMap[oldId] = a.id;
						});
						newBonds.forEach(function(b) {
							b.id = nextId++;
							b.from = idMap[b.from];
							b.to = idMap[b.to];
						});
						var newBrackets = res.BRACKETS_JSON ? JSON.parse(res.BRACKETS_JSON) : [];
						newBrackets.forEach(function(b) { b.id = nextId++; });
						atoms = atoms.concat(newAtoms);
						bonds = bonds.concat(newBonds);
						brackets = brackets.concat(newBrackets);
						/* 불러온 구조 전체 선택 (바로 이동 가능하도록) */
						ed2d.selectedAtoms = newAtoms.map(function(a) { return a.id; });
						ed2d.selectedBonds = newBonds.map(function(b) { return b.id; });
						ed2d.selectedBrackets = newBrackets.map(function(b) { return b.id; });
						saveState(); refreshCurrentTab(); updateInfo();
						$('#cdSearchInput').val('');
						M.toast({ html: 'SEQ ' + seq + ' 불러오기 완료 (선택됨 — 드래그하여 이동)', classes: 'cd-toast-glass' });
					} catch (e) {
						console.error('ChemDraw load parse error:', e);
						M.toast({ html: '데이터 파싱 오류', classes: 'cd-toast-glass cd-toast-error' });
					}
				} else {
					M.toast({ html: 'SEQ ' + seq + '에 해당하는 데이터가 없습니다.', classes: 'cd-toast-glass cd-toast-error' });
				}
			},
			error: function() { M.toast({ html: '불러오기 실패', classes: 'cd-toast-glass cd-toast-error' }); }
		});
	}

	/* ═══════════════════════════════════════
	   통합 검색 드롭다운
	   ═══════════════════════════════════════ */
	var cdAcTimer = null;

	function cdFitSvgThumb(svgStr) {
		var tmp = document.createElement('div');
		tmp.style.cssText = 'position:absolute;left:-9999px;top:-9999px;visibility:hidden;';
		tmp.innerHTML = svgStr;
		document.body.appendChild(tmp);
		var svg = tmp.querySelector('svg');
		var result = svgStr;
		if (svg) {
			try {
				/* 그리드 라인 제거 (opacity < 0.1인 그룹) */
				var gridGroups = svg.querySelectorAll('g[opacity]');
				for (var gi = 0; gi < gridGroups.length; gi++) {
					if (parseFloat(gridGroups[gi].getAttribute('opacity')) < 0.1) gridGroups[gi].remove();
				}
				/* 선택/드래그 사각형 제거 */
				var dashRects = svg.querySelectorAll('rect[stroke-dasharray]');
				for (var ri = 0; ri < dashRects.length; ri++) dashRects[ri].remove();
				/* 원자 라벨 뒤 흰색 배경 rect 투명 처리 */
				var whiteRects = svg.querySelectorAll('rect[fill="#fff"], rect[fill="white"], rect[fill="#ffffff"]');
				for (var wi = 0; wi < whiteRects.length; wi++) whiteRects[wi].setAttribute('fill', 'transparent');

				var bbox = svg.getBBox();
				if (bbox.width > 0 && bbox.height > 0) {
					var pad = 10;
					svg.setAttribute('viewBox', (bbox.x - pad) + ' ' + (bbox.y - pad) + ' ' + (bbox.width + pad * 2) + ' ' + (bbox.height + pad * 2));
					svg.setAttribute('width', '100%');
					svg.setAttribute('height', '100%');
					svg.removeAttribute('id');
					svg.style.cssText = 'display:block;max-width:100%;max-height:100%;';
					svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
					result = svg.outerHTML;
				}
			} catch (e) { }
		}
		document.body.removeChild(tmp);
		return result;
	}

	/* --- 통합 검색 (Formula + CAS-NO 동시) --- */
	var cdCasResults = []; // CAS-NO AJAX 결과 캐시

	function cdRenderSearchDropdown(keyword) {
		var dropdown = $('#cdSearchDropdown');
		if (!keyword) { dropdown.hide(); return; }

		/* 1) Formula: 로컬 데이터 필터 (즉시) */
		var kw = keyword.toUpperCase();
		var formulaFiltered = chemDrawAllData.filter(function(item) {
			return (item.MOLECULAR_FORMULA || '').toUpperCase().indexOf(kw) >= 0
				|| (item.MOLECULAR_NM || '').toUpperCase().indexOf(kw) >= 0;
		}).slice(0, 5);

		/* Formula 결과 먼저 렌더 */
		var html = cdBuildFormulaHtml(formulaFiltered);

		/* CAS-NO 로딩 표시 */
		html += '<div class="cd-search-section" style="padding:4px 10px; font-size:11px; color:#999; background:#f5f5f5; border-top:1px solid #eee;">CAS-NO</div>';
		html += '<div id="cdCasSection"><div class="cd-ac-empty" style="padding:8px;">검색 중...</div></div>';
		dropdown.html(html).show();

		/* 2) CAS-NO: AJAX 검색 (비동기) */
		cdFetchCasNoList(keyword);
	}

	function cdBuildFormulaHtml(filtered) {
		var html = '<div class="cd-search-section" style="padding:4px 10px; font-size:11px; color:#999; background:#f5f5f5;">Formula / 명칭</div>';
		if (filtered.length === 0) {
			html += '<div class="cd-ac-empty" style="padding:8px; font-size:11px;">결과 없음</div>';
			return html;
		}
		$.each(filtered, function(i, item) {
			var svgHtml = item.SVG_DATA ? cdFitSvgThumb(item.SVG_DATA) : '<span style="font-size:10px;color:#ccc;">No preview</span>';
			html += '<div class="cd-search-result cd-ac-item" data-type="formula" data-seq="' + item.SEQ_CHEMDRAW + '">';
			html += '<div class="cd-ac-thumb">' + svgHtml + '</div>';
			html += '<div class="cd-ac-info">';
			html += '<div style="font-size:13px; font-weight:600; color:#1a237e; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + (item.MOLECULAR_NM || '-') + '</div>';
			html += '<div class="cd-ac-formula" style="color:#333;">' + (item.MOLECULAR_FORMULA || '-') + '</div>';
			html += '<div class="cd-ac-meta">' + (item.REG_EMP_NM || '-') + ' | ' + (item.REG_DATETIME || '-').substring(0, 10) + '</div>';
			html += '</div></div>';
		});
		return html;
	}

	/* CAS-NO 클릭 시 바로 에디터에 로드 */
	function cdLoadByCasNoDirect(casNo) {
		$('#cdSearchDropdown').hide();
		$.ajax({
			url: '/admin/popup/selectSmilesByCasNoAjax',
			type: 'GET',
			data: { CAS_NO: casNo },
			success: function(res) {
				if (res && res.SMILES) {
					try {
						var parsed = cdParseSmiles(res.SMILES);
						var w = ed2d.containerEl ? ed2d.containerEl.clientWidth : 800;
						var h = ed2d.containerEl ? ed2d.containerEl.clientHeight : 500;
						var cx = w / 2, cy = h / 2;
						var bounds = cdCalcBounds(parsed.atoms);
						var ox = cx - (bounds.minX + bounds.maxX) / 2;
						var oy = cy - (bounds.minY + bounds.maxY) / 2;
						var idMap = {};
						parsed.atoms.forEach(function(a) {
							var oldId = a.id;
							a.id = genId();
							a.x += ox; a.y += oy;
							idMap[oldId] = a.id;
						});
						parsed.bonds.forEach(function(b) {
							b.id = genId();
							b.from = idMap[b.from]; b.to = idMap[b.to];
						});
						atoms = atoms.concat(parsed.atoms);
						bonds = bonds.concat(parsed.bonds);
						/* 불러온 구조 전체 선택 */
						ed2d.selectedAtoms = parsed.atoms.map(function(a) { return a.id; });
						ed2d.selectedBonds = parsed.bonds.map(function(b) { return b.id; });
						ed2d.selectedBrackets = [];
						saveState(); refreshCurrentTab(); updateInfo();
						$('#cdSearchInput').val('');
						M.toast({ html: 'CAS-NO ' + casNo + ' 불러오기 완료 (선택됨 — 드래그하여 이동)', classes: 'cd-toast-glass' });
					} catch (e) {
						console.error('SMILES parse error:', e);
						M.toast({ html: 'SMILES 파싱 오류: ' + e.message, classes: 'cd-toast-glass cd-toast-error' });
					}
				} else {
					M.toast({ html: 'CAS-NO ' + casNo + '에 해당하는 SMILES 데이터가 없습니다.', classes: 'cd-toast-glass cd-toast-error' });
				}
			},
			error: function() { M.toast({ html: 'SMILES 불러오기 실패', classes: 'cd-toast-glass cd-toast-error' }); }
		});
	}

	/* ═══════════════════════════════════════
	   CAS-NO Input Quick Search (autocomplete)
	   ═══════════════════════════════════════ */
	var cdCasAcTimer = null;

	$(document).on('input', '#chemDrawCasNo', function() {
		var val = $(this).val().trim();
		clearTimeout(cdCasAcTimer);
		if (val.length < 5) { $('#cdCasNoDropdown').hide(); return; }
		cdCasAcTimer = setTimeout(function() { cdCasNoQuickSearch(val); }, 300);
	});

	function cdCasNoQuickSearch(keyword) {
		$.ajax({
			url: '/casNoListAjax',
			type: 'GET',
			data: { search_word: keyword },
			success: function(data) {
				cdRenderCasNoDropdown(data || [], keyword);
			},
			error: function() { $('#cdCasNoDropdown').hide(); }
		});
	}

	function cdRenderCasNoDropdown(list, keyword) {
		var $dd = $('#cdCasNoDropdown');
		if (!list.length) {
			$dd.html('<div class="cd-cas-empty">검색된 결과가 없습니다.</div>').show();
			return;
		}
		var re = new RegExp('(' + keyword.replace(/[{}.*+?^$()|[\]\\]/g, '\\$&') + ')', 'gi');
		var html = '';
		list.forEach(function(item) {
			var casNo = item.CD || '';
			var cdNm = item.CD_NM || '';
			var highlighted = cdNm.replace(re, '<span style="font-weight:700;color:#f44336;">$1</span>');
			html += '<div class="cd-cas-item" data-casno="' + casNo + '">';
			html += '<div class="cd-cas-info">';
			html += '<div class="cd-cas-casno">' + highlighted + '</div>';
			html += '</div></div>';
		});
		$dd.html(html).show();
	}

	$(document).on('click', '#cdCasNoDropdown .cd-cas-item', function() {
		var casNo = $(this).data('casno');
		$('#chemDrawCasNo').val(casNo);
		$('#cdCasNoDropdown').hide();
	});

	/* 외부 클릭 시 CAS-NO 드롭다운 닫기 */
	$(document).on('mousedown', function(e) {
		if (!$(e.target).closest('#chemDrawCasNo, #cdCasNoDropdown').length) {
			$('#cdCasNoDropdown').hide();
		}
	});

	/* focus 시 기존 검색어가 5자 이상이면 다시 열기 */
	$(document).on('focus', '#chemDrawCasNo', function() {
		var val = $(this).val().trim();
		if (val.length >= 5 && $('#cdCasNoDropdown').children().length) {
			$('#cdCasNoDropdown').show();
		}
	});

	/* 검색 입력 이벤트 */
	$(document).on('input', '#cdSearchInput', function() {
		var val = $(this).val().trim();
		clearTimeout(cdAcTimer);
		if (!val) { $('#cdSearchDropdown').hide(); return; }
		cdAcTimer = setTimeout(function() { cdRenderSearchDropdown(val); }, 250);
	});

	$(document).on('focus', '#cdSearchInput', function() {
		var val = $(this).val().trim();
		if (val) cdRenderSearchDropdown(val);
	});

	/* 검색 결과 클릭 → 바로 에디터에 로드 */
	$(document).on('click', '.cd-search-result', function() {
		var type = $(this).attr('data-type');
		if (type === 'formula') {
			var seq = $(this).attr('data-seq');
			$('#cdSearchDropdown').hide();
			cdApplyChemDrawData(seq);
		} else if (type === 'casno') {
			var cas = $(this).attr('data-cas');
			cdLoadByCasNoDirect(cas);
		}
	});

	$(document).on('mousedown', function(e) {
		if (!$(e.target).closest('.srchArea').length) {
			$('#cdSearchDropdown').hide();
		}
		if (!$(e.target).closest('#cdContextMenu').length) {
			$('#cdContextMenu').hide();
		}
	});

	/* ═══════════════════════════════════════
	   SMILES → atoms/bonds 파서
	   ═══════════════════════════════════════ */
	var CD_BOND_LEN = 60;

	function cdParseSmiles(smi) {
		var pAtoms = [], pBonds = [];
		var idCnt = 1;
		var stack = [];       // branch stack: { atomId, bondType }
		var ringMap = {};
		var prevId = null;
		var pendingBond = 'single';
		var aromaticIds = {};  // id → true 면 방향족 원자
		var i = 0, len = smi.length;

		function mkAtom(elem, aromatic) {
			var a = { id: idCnt++, element: elem, x: 0, y: 0 };
			pAtoms.push(a);
			if (aromatic) aromaticIds[a.id] = true;
			return a;
		}
		function mkBond(f, t, tp) {
			// 중복 결합 방지
			for (var bi = 0; bi < pBonds.length; bi++) {
				var pb = pBonds[bi];
				if ((pb.from === f && pb.to === t) || (pb.from === t && pb.to === f)) return;
			}
			pBonds.push({ id: idCnt++, from: f, to: t, type: tp });
		}
		function connectPrev(newId) {
			if (prevId !== null) {
				mkBond(prevId, newId, pendingBond);
				pendingBond = 'single';
			}
			prevId = newId;
		}

		while (i < len) {
			var ch = smi[i];

			// 결합 유형
			if (ch === '=') { pendingBond = 'double'; i++; continue; }
			if (ch === '#') { pendingBond = 'triple'; i++; continue; }
			if (ch === '-') { pendingBond = 'single'; i++; continue; }
			if (ch === ':') { pendingBond = 'single'; i++; continue; } // 방향족 결합 → 후처리
			if (ch === '/' || ch === '\\') { i++; continue; } // cis/trans 무시

			// 분기
			if (ch === '(') { stack.push({ atomId: prevId, bondType: pendingBond }); pendingBond = 'single'; i++; continue; }
			if (ch === ')') { var st = stack.pop(); prevId = st.atomId; pendingBond = 'single'; i++; continue; }

			// 고리 숫자
			if (ch >= '0' && ch <= '9') {
				var rk = ch;
				if (ringMap[rk]) {
					var rb = ringMap[rk];
					var bt = pendingBond !== 'single' ? pendingBond : rb.bondType;
					mkBond(prevId, rb.atomId, bt);
					pendingBond = 'single';
					delete ringMap[rk];
				} else {
					ringMap[rk] = { atomId: prevId, bondType: pendingBond };
					pendingBond = 'single';
				}
				i++; continue;
			}
			if (ch === '%') {
				var rk2 = smi.substr(i + 1, 2);
				if (ringMap[rk2]) {
					var rb2 = ringMap[rk2];
					var bt2 = pendingBond !== 'single' ? pendingBond : rb2.bondType;
					mkBond(prevId, rb2.atomId, bt2);
					pendingBond = 'single';
					delete ringMap[rk2];
				} else {
					ringMap[rk2] = { atomId: prevId, bondType: pendingBond };
					pendingBond = 'single';
				}
				i += 3; continue;
			}

			// 브라켓 원자 [...]
			if (ch === '[') {
				var j = smi.indexOf(']', i);
				if (j < 0) j = len;
				var inner = smi.substring(i + 1, j);
				var emBr = inner.match(/^([A-Z][a-z]?)/);
				var elBr = emBr ? emBr[1] : 'C';
				var aa = mkAtom(elBr, false);
				connectPrev(aa.id);
				i = j + 1; continue;
			}

			// 2글자 원소: Br, Cl, Si
			if (i + 1 < len) {
				var tw = smi.substr(i, 2);
				if (tw === 'Br' || tw === 'Cl' || tw === 'Si') {
					var a2 = mkAtom(tw, false);
					connectPrev(a2.id);
					i += 2; continue;
				}
			}

			// 방향족 소문자: b,c,n,o,p,s
			if ('bcnops'.indexOf(ch) >= 0) {
				var arom = mkAtom(ch.toUpperCase(), true);
				connectPrev(arom.id);
				i++; continue;
			}

			// 일반 대문자: B,C,N,O,P,S,F,I
			if ('BCNOPSFI'.indexOf(ch) >= 0) {
				var a3 = mkAtom(ch, false);
				connectPrev(a3.id);
				i++; continue;
			}

			// 분리(.)
			if (ch === '.') { prevId = null; pendingBond = 'single'; i++; continue; }

			// 기타 문자(H 등은 무시 - 브라켓 밖의 H)
			if (ch === 'H') {
				// 이전 원자에 H 카운트 확인 (유기 서브셋에서 H는 무시)
				i++; continue;
			}

			i++;
		}

		// ── 방향족 링 이중결합 후처리 (Kekulization) ──
		// 방향족 원자들로만 구성된 링을 찾아 교대 이중결합 배정
		cdKekulize(pAtoms, pBonds, aromaticIds);

		// ── 2D 레이아웃 ──
		cdLayoutMolecule(pAtoms, pBonds);

		return { atoms: pAtoms, bonds: pBonds };
	}

	/* ═══════════════════════════════════════
	   Kekulization: 방향족 교대 이중결합 배정
	   ═══════════════════════════════════════ */
	function cdKekulize(atomList, bondList, aromaticIds) {
		var aromBonds = [];
		bondList.forEach(function(b) {
			if (aromaticIds[b.from] && aromaticIds[b.to]) aromBonds.push(b);
		});
		if (aromBonds.length === 0) return;

		var aromAtomIds = Object.keys(aromaticIds).map(Number);
		var hasDouble = {};

		function tryAssign(bondIdx) {
			if (bondIdx >= aromBonds.length) {
				// 모든 방향족 원자가 정확히 1개의 이중결합을 가져야 완료
				return aromAtomIds.every(function(id) { return hasDouble[id]; });
			}
			var b = aromBonds[bondIdx];
			// double 먼저 시도 (방향족은 이중결합이 있어야 하므로)
			if (!hasDouble[b.from] && !hasDouble[b.to]) {
				b.type = 'double';
				hasDouble[b.from] = true;
				hasDouble[b.to] = true;
				if (tryAssign(bondIdx + 1)) return true;
				b.type = 'single';
				delete hasDouble[b.from];
				delete hasDouble[b.to];
			}
			// single 유지
			if (tryAssign(bondIdx + 1)) return true;
			return false;
		}
		tryAssign(0);
	}

	/* ═══════════════════════════════════════
	   2D Coordinate Layout
	   ═══════════════════════════════════════ */
	function cdCalcBounds(atomList) {
		var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		atomList.forEach(function(a) {
			if (a.x < minX) minX = a.x;
			if (a.y < minY) minY = a.y;
			if (a.x > maxX) maxX = a.x;
			if (a.y > maxY) maxY = a.y;
		});
		return { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
	}

	function cdLayoutMolecule(atomList, bondList) {
		if (!atomList.length) return;
		var BL = CD_BOND_LEN;
		var atomMap = {};
		atomList.forEach(function(a) { atomMap[a.id] = a; });

		// 인접 리스트
		var adj = {};
		atomList.forEach(function(a) { adj[a.id] = []; });
		bondList.forEach(function(b) {
			adj[b.from].push(b.to);
			adj[b.to].push(b.from);
		});

		// ── 링 탐색 (SSSR 간이판) ──
		var rings = cdFindRings(atomList, bondList, adj);

		// 각 원자가 속한 링 기록
		var atomRings = {};
		atomList.forEach(function(a) { atomRings[a.id] = []; });
		rings.forEach(function(ring, ri) {
			ring.forEach(function(aid) { atomRings[aid].push(ri); });
		});

		var placed = {};

		// 링을 정다각형으로 배치
		function placeRing(ring, cx, cy, startAngle) {
			var n = ring.length;
			var r = BL / (2 * Math.sin(Math.PI / n)); // 정다각형 외접원 반지름
			for (var k = 0; k < n; k++) {
				var angle = startAngle - Math.PI / 2 + (2 * Math.PI * k) / n;
				atomMap[ring[k]].x = cx + r * Math.cos(angle);
				atomMap[ring[k]].y = cy + r * Math.sin(angle);
				placed[ring[k]] = true;
			}
		}

		// 링 배치 여부
		var ringPlaced = {};

		// BFS로 전체 분자 배치
		function layoutComponent(startId) {
			// 시작 원자가 링에 속하면 그 링부터 배치
			if (atomRings[startId].length > 0 && !ringPlaced[atomRings[startId][0]]) {
				var ri = atomRings[startId][0];
				placeRing(rings[ri], 0, 0, 0);
				ringPlaced[ri] = true;
			} else if (!placed[startId]) {
				atomMap[startId].x = 0;
				atomMap[startId].y = 0;
				placed[startId] = true;
			}

			var queue = [];
			// 이미 배치된 원자들의 이웃부터 시작
			atomList.forEach(function(a) {
				if (placed[a.id]) queue.push(a.id);
			});

			var visited = {};
			while (queue.length) {
				var cur = queue.shift();
				if (visited[cur]) continue;
				visited[cur] = true;

				var neighbors = adj[cur] || [];
				var unplaced = neighbors.filter(function(n) { return !placed[n]; });
				if (unplaced.length === 0) continue;

				// 배치된 이웃들로부터 기준 각도
				var placedNbrs = neighbors.filter(function(n) { return placed[n]; });
				var baseAngle;
				if (placedNbrs.length > 0) {
					// 배치된 이웃들의 평균 방향의 반대
					var sx = 0, sy = 0;
					placedNbrs.forEach(function(n) {
						sx += atomMap[n].x - atomMap[cur].x;
						sy += atomMap[n].y - atomMap[cur].y;
					});
					baseAngle = Math.atan2(-sy, -sx); // 반대 방향
				} else {
					baseAngle = -Math.PI / 6; // 기본 오른쪽 위
				}

				// 미배치 이웃 중 링에 속하는 것 먼저 처리
				unplaced.forEach(function(nid) {
					if (placed[nid]) return;

					// 이 이웃이 아직 배치 안 된 링에 속하는 경우
					var nrings = atomRings[nid].filter(function(ri) { return !ringPlaced[ri]; });
					if (nrings.length > 0) {
						var ri = nrings[0];
						var ring = rings[ri];
						// cur와 nid 사이 결합 방향으로 링 배치
						var curIdx = ring.indexOf(cur);
						var nidIdx = ring.indexOf(nid);

						if (curIdx >= 0 && nidIdx >= 0) {
							// cur가 이미 배치되어 있고 ring에 속함
							// ring 내 cur 위치 기준으로 배치
							var n = ring.length;
							var r = BL / (2 * Math.sin(Math.PI / n));

							// cur의 링 내 각도 기준으로 링 중심 계산
							// nid가 cur 바로 다음이 되도록 startAngle 결정
							var diff = ((nidIdx - curIdx) + n) % n;
							var curAngleInRing = (2 * Math.PI * 0) / n - Math.PI / 2;
							var nidAngleInRing = (2 * Math.PI * diff) / n - Math.PI / 2;

							// baseAngle 방향으로 nid가 위치하도록
							var desiredAngle = Math.atan2(
								atomMap[cur].y + BL * Math.sin(baseAngle) - atomMap[cur].y,
								atomMap[cur].x + BL * Math.cos(baseAngle) - atomMap[cur].x
							);

							var startAngle = desiredAngle - (2 * Math.PI * diff) / n + Math.PI / 2;
							var cx = atomMap[cur].x - r * Math.cos(startAngle - Math.PI / 2);
							var cy = atomMap[cur].y - r * Math.sin(startAngle - Math.PI / 2);

							for (var k = 0; k < n; k++) {
								var aid = ring[k];
								if (!placed[aid]) {
									var kIdx = ((k - curIdx) + n) % n;
									var angle = startAngle - Math.PI / 2 + (2 * Math.PI * kIdx) / n;
									atomMap[aid].x = cx + r * Math.cos(angle);
									atomMap[aid].y = cy + r * Math.sin(angle);
									placed[aid] = true;
								}
							}
							ringPlaced[ri] = true;
							ring.forEach(function(aid) { queue.push(aid); });
							return;
						}
					}
				});

				// 남은 미배치 비-링 이웃 처리
				unplaced = neighbors.filter(function(n) { return !placed[n]; });
				if (unplaced.length === 0) continue;

				placedNbrs = neighbors.filter(function(n) { return placed[n]; });
				if (placedNbrs.length > 0) {
					var sx2 = 0, sy2 = 0;
					placedNbrs.forEach(function(n) {
						sx2 += atomMap[n].x - atomMap[cur].x;
						sy2 += atomMap[n].y - atomMap[cur].y;
					});
					baseAngle = Math.atan2(-sy2, -sx2);
				}

				var step = Math.PI / 3; // 60도
				var totalSpread = (unplaced.length - 1) * step;
				var startA = baseAngle - totalSpread / 2;

				unplaced.forEach(function(nid, idx) {
					if (placed[nid]) return;
					var angle = startA + idx * step;
					atomMap[nid].x = atomMap[cur].x + BL * Math.cos(angle);
					atomMap[nid].y = atomMap[cur].y + BL * Math.sin(angle);
					placed[nid] = true;
					queue.push(nid);
				});
			}
		}

		// 분리된 컴포넌트 처리
		var compOffset = 0;
		atomList.forEach(function(a) {
			if (!placed[a.id]) {
				layoutComponent(a.id);
				// 컴포넌트 분리 오프셋
				var compAtoms = atomList.filter(function(aa) { return placed[aa.id]; });
				var b = cdCalcBounds(compAtoms);
				compOffset = b.maxX + BL * 2;
			}
		});

		// ── 겹침 해소 (Force-directed relaxation) ──
		var MIN_DIST = BL * 0.5;
		for (var iter = 0; iter < 80; iter++) {
			var moved = false;
			for (var i = 0; i < atomList.length; i++) {
				for (var j = i + 1; j < atomList.length; j++) {
					var ai = atomList[i], aj = atomList[j];
					var dx = aj.x - ai.x, dy = aj.y - ai.y;
					var dist = Math.hypot(dx, dy);
					if (dist < MIN_DIST && dist > 0.01) {
						// 결합이 있는 쌍은 건너뜀
						var hasBond = false;
						for (var bi = 0; bi < bondList.length; bi++) {
							if ((bondList[bi].from === ai.id && bondList[bi].to === aj.id) ||
								(bondList[bi].from === aj.id && bondList[bi].to === ai.id)) { hasBond = true; break; }
						}
						if (hasBond) continue;
						var push = (MIN_DIST - dist) / 2 + 0.5;
						var ux = dx / dist, uy = dy / dist;
						ai.x -= ux * push; ai.y -= uy * push;
						aj.x += ux * push; aj.y += uy * push;
						moved = true;
					}
				}
			}
			if (!moved) break;
		}
	}

	/* ═══════════════════════════════════════
	   Ring Detection (간이 SSSR)
	   ═══════════════════════════════════════ */
	function cdFindRings(atomList, bondList, adj) {
		var rings = [];
		var atomIds = atomList.map(function(a) { return a.id; });
		var idSet = {};
		atomIds.forEach(function(id) { idSet[id] = true; });

		// DFS 기반 사이클 탐색 (최대 크기 8까지)
		function dfs(start, cur, path, visited, maxLen) {
			if (path.length > maxLen) return;
			var neighbors = adj[cur] || [];
			for (var ni = 0; ni < neighbors.length; ni++) {
				var nb = neighbors[ni];
				if (nb === start && path.length >= 3) {
					// 링 발견! 중복 체크
					var ring = path.slice();
					if (!isRingDuplicate(ring)) {
						rings.push(ring);
					}
					continue;
				}
				if (visited[nb] || !idSet[nb]) continue;
				visited[nb] = true;
				path.push(nb);
				dfs(start, nb, path, visited, maxLen);
				path.pop();
				delete visited[nb];
			}
		}

		function isRingDuplicate(ring) {
			var sorted = ring.slice().sort(function(a, b) { return a - b; });
			var key = sorted.join(',');
			for (var ri = 0; ri < rings.length; ri++) {
				var existing = rings[ri].slice().sort(function(a, b) { return a - b; });
				if (existing.join(',') === key) return true;
			}
			return false;
		}

		atomIds.forEach(function(startId) {
			var visited = {};
			visited[startId] = true;
			dfs(startId, startId, [startId], visited, 8);
		});

		// 크기순 정렬, 작은 링 우선
		rings.sort(function(a, b) { return a.length - b.length; });

		// SSSR: 큰 링이 작은 링들의 합집합이면 제거
		var filtered = [];
		rings.forEach(function(ring) {
			var ringSet = {};
			ring.forEach(function(id) { ringSet[id] = true; });

			// 이 링의 모든 원자가 이미 filtered에 있는 더 작은 링들로 완전히 커버되는지 확인
			var dominated = false;
			if (ring.length > 3) {
				// 같은 원자 쌍을 공유하는 더 작은 링 2개로 구성되는지 확인
				for (var fi = 0; fi < filtered.length && !dominated; fi++) {
					for (var fj = fi + 1; fj < filtered.length && !dominated; fj++) {
						var union = {};
						filtered[fi].forEach(function(id) { union[id] = true; });
						filtered[fj].forEach(function(id) { union[id] = true; });
						var allCovered = ring.every(function(id) { return union[id]; });
						if (allCovered && (filtered[fi].length + filtered[fj].length - ring.length) >= 2) {
							dominated = true;
						}
					}
				}
			}
			if (!dominated) filtered.push(ring);
		});

		return filtered;
	}

	function cdFetchCasNoList(keyword) {
		$.ajax({
			url: '/admin/popup/searchCasNoListAjax',
			type: 'GET',
			data: { keyword: keyword },
			success: function(data) {
				cdRenderCasSearchDropdown(data || []);
			},
			error: function() { M.toast({ html: 'CAS-NO 검색 실패', classes: 'cd-toast-glass cd-toast-error' }); }
		});
	}

	function cdSmilesToSvgThumb(smi) {
		try {
			var parsed = cdParseSmiles(smi);
			if (!parsed.atoms.length) return null;
			var tAtoms = parsed.atoms, tBonds = parsed.bonds;
			var bounds = cdCalcBounds(tAtoms);
			var bw = bounds.maxX - bounds.minX || 1, bh = bounds.maxY - bounds.minY || 1;
			var pad = 12;
			var vx = bounds.minX - pad, vy = bounds.minY - pad;
			var vw = bw + pad * 2, vh = bh + pad * 2;
			var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vx + ' ' + vy + ' ' + vw + ' ' + vh + '" preserveAspectRatio="xMidYMid meet">';
			tBonds.forEach(function(b) {
				var a1 = null, a2 = null;
				for (var j = 0; j < tAtoms.length; j++) { if (tAtoms[j].id === b.from) a1 = tAtoms[j]; if (tAtoms[j].id === b.to) a2 = tAtoms[j]; }
				if (!a1 || !a2) return;
				var dx = a2.x - a1.x, dy = a2.y - a1.y, len = Math.hypot(dx, dy);
				if (len === 0) return;
				var nx = -dy / len, ny = dx / len;
				if (b.type === 'single') { svg += '<line x1="'+a1.x+'" y1="'+a1.y+'" x2="'+a2.x+'" y2="'+a2.y+'" stroke="#444" stroke-width="1.5"/>'; }
				else if (b.type === 'double') { var o=2.5; svg += '<line x1="'+(a1.x+nx*o)+'" y1="'+(a1.y+ny*o)+'" x2="'+(a2.x+nx*o)+'" y2="'+(a2.y+ny*o)+'" stroke="#444" stroke-width="1.5"/>'; svg += '<line x1="'+(a1.x-nx*o)+'" y1="'+(a1.y-ny*o)+'" x2="'+(a2.x-nx*o)+'" y2="'+(a2.y-ny*o)+'" stroke="#444" stroke-width="1.5"/>'; }
				else if (b.type === 'triple') { var o2=3.5; svg += '<line x1="'+a1.x+'" y1="'+a1.y+'" x2="'+a2.x+'" y2="'+a2.y+'" stroke="#444" stroke-width="1.5"/>'; svg += '<line x1="'+(a1.x+nx*o2)+'" y1="'+(a1.y+ny*o2)+'" x2="'+(a2.x+nx*o2)+'" y2="'+(a2.y+ny*o2)+'" stroke="#444" stroke-width="1.5"/>'; svg += '<line x1="'+(a1.x-nx*o2)+'" y1="'+(a1.y-ny*o2)+'" x2="'+(a2.x-nx*o2)+'" y2="'+(a2.y-ny*o2)+'" stroke="#444" stroke-width="1.5"/>'; }
			});
			tAtoms.forEach(function(a) {
				var info = ELEMENTS[a.element] || ELEMENTS.C;
				if (a.element !== 'C') {
					svg += '<rect x="'+(a.x-8)+'" y="'+(a.y-7)+'" width="16" height="14" fill="#fff" rx="2"/>';
					svg += '<text x="'+a.x+'" y="'+(a.y+4)+'" text-anchor="middle" font-size="11" font-family="Arial,sans-serif" font-weight="bold" fill="'+info.color+'">'+a.element+'</text>';
				}
			});
			svg += '</svg>';
			return { svg: svg, atomCount: tAtoms.length, bondCount: tBonds.length };
		} catch(e) { return null; }
	}

	/* CAS-NO 검색결과를 #cdCasSection 영역에만 렌더링 */
	function cdRenderCasSearchDropdown(list) {
		var section = $('#cdCasSection');
		if (!section.length) return;
		if (!list.length) {
			section.html('<div class="cd-ac-empty" style="padding:8px; font-size:11px;">결과 없음</div>');
			return;
		}
		var html = '';
		list.forEach(function(item) {
			var thumbHtml = '<span style="font-size:9px;color:#ccc;">No SMILES</span>';
			var atomCount = 0, bondCount = 0;
			if (item.SMILES) {
				var result = cdSmilesToSvgThumb(item.SMILES);
				if (result) { thumbHtml = result.svg; atomCount = result.atomCount; bondCount = result.bondCount; }
			}
			html += '<div class="cd-search-result cd-ac-item" data-type="casno" data-cas="' + (item.CAS_NO || '') + '">';
			html += '<div class="cd-ac-thumb">' + thumbHtml + '</div>';
			html += '<div class="cd-ac-info">';
			html += '<div class="cd-ac-formula">' + (item.CAS_NO || '-') + '</div>';
			if (item.ENG_NM) html += '<div class="cd-ac-meta" style="color:#555;">' + item.ENG_NM + '</div>';
			html += '<div class="cd-ac-meta">Atoms: ' + atomCount + ' | Bonds: ' + bondCount + '</div>';
			html += '</div>';
			html += '</div>';
		});
		section.html(html);
	}

	/* ═══════════════════════════════════════
	   Context Menu (우클릭)
	   ═══════════════════════════════════════ */
	function cdAttachContextMenu(svgEl) {
		svgEl.addEventListener('contextmenu', function(e) {
			e.preventDefault();
			var pos = ed2d.getPos(e);
			/* 우클릭 위치에 원자/본드/브라켓이 있으면 자동 선택 */
			var rAtom = findAtomAt(pos.x, pos.y);
			var rBond = !rAtom ? findBondAt(pos.x, pos.y) : null;
			var rBr = (!rAtom && !rBond) ? findBracketAt(pos.x, pos.y) : null;
			if (rAtom && ed2d.selectedAtoms.indexOf(rAtom.id) < 0) {
				ed2d.selectedAtoms = [rAtom.id]; ed2d.selectedBonds = []; ed2d.selectedBrackets = [];
				ed2d.render();
			} else if (rBond && ed2d.selectedBonds.indexOf(rBond.id) < 0) {
				ed2d.selectedBonds = [rBond.id]; ed2d.selectedAtoms = []; ed2d.selectedBrackets = [];
				ed2d.render();
			} else if (rBr && ed2d.selectedBrackets.indexOf(rBr.id) < 0) {
				ed2d.selectedBrackets = [rBr.id]; ed2d.selectedBracket = rBr.id; ed2d.selectedAtoms = []; ed2d.selectedBonds = [];
				ed2d.render();
			} else if (!rAtom && !rBond && !rBr) {
				/* 빈 공간 우클릭 → 선택 해제 */
				ed2d.selectedAtoms = []; ed2d.selectedBonds = []; ed2d.selectedBrackets = []; ed2d.selectedBracket = null;
				ed2d.render();
			}
			var hasAtoms = ed2d.selectedAtoms && ed2d.selectedAtoms.length > 0;
			var hasBonds = ed2d.selectedBonds && ed2d.selectedBonds.length > 0;
			var hasBrackets = ed2d.selectedBrackets && ed2d.selectedBrackets.length > 0;
			var hasBracket = !!ed2d.selectedBracket;
			var hasSelection = hasAtoms || hasBonds || hasBrackets || hasBracket;
			if (!hasSelection && !clipboard) return;
			var container = document.getElementById('chemDrawContainer');
			var rect = container.getBoundingClientRect();
			var menu = document.getElementById('cdContextMenu');
			/* 그리드 정렬 / Bracket 추가: 원자가 선택되었을 때만 표시 */
			$('#cdCtxAlign').toggle(hasAtoms);
			$('#cdCtxRotate').toggle(hasAtoms);
			$('#cdCtxFlipH').toggle(hasAtoms);
			$('#cdCtxFlipV').toggle(hasAtoms);
			$('#cdCtxBracket').toggle(hasAtoms);
			/* Bracket 정렬: bracket 2개 이상 선택 시 또는 bracket 2개 이상 존재 시 표시 */
			var multiBrackets = (ed2d.selectedBrackets && ed2d.selectedBrackets.length >= 2) || (hasBrackets && brackets.length >= 2);
			$('#cdCtxBracketAlign').toggle(multiBrackets);
			/* 전하 상태: 원자 1개 선택 시만 표시, 현재 상태 표시 */
			var singleAtom = hasAtoms && ed2d.selectedAtoms.length === 1;
			$('#cdCtxCharge').toggle(singleAtom);
			if (singleAtom) {
				var _ca = atomMap[ed2d.selectedAtoms[0]];
				var _cv = _ca ? (_ca.charge || 0) : 0;
				$('#cdCtxCharge .cd-ctx-submenu .cd-ctx-item').removeClass('cd-ctx-active');
				$('#cdCtxCharge .cd-ctx-submenu .cd-ctx-item[data-charge="'+_cv+'"]').addClass('cd-ctx-active');
			}
			/* 크기 초기화: 선택 원자 중 scale 값이 있는 경우만 표시 */
			var hasScaled = hasAtoms && ed2d.selectedAtoms.some(function(id) { var a = atomMap[id]; return a && a.scale && a.scale !== 1; });
			$('#cdCtxResetSize').toggle(hasScaled);
			$('#cdCtxSep1').toggle(hasSelection);
			$('#cdCtxCopy').toggle(hasSelection);
			$('#cdCtxCut').toggle(hasSelection);
			$('#cdCtxPaste').toggle(!!clipboard);
			$('#cdCtxDelete').toggle(hasSelection);
			menu.style.display = 'block';
			var mx = e.clientX - rect.left, my = e.clientY - rect.top;
			var mw = menu.offsetWidth, mh = menu.offsetHeight;
			if (mx + mw > rect.width) mx = rect.width - mw - 4;
			if (my + mh > rect.height) my = rect.height - mh - 4;
			if (mx < 0) mx = 4;
			if (my < 0) my = 4;
			menu.style.left = mx + 'px';
			menu.style.top = my + 'px';
		});
	}
	/* 복사/잘라내기/붙여넣기 공통 함수 */
	function cdCopySelection() {
		var selAtomIds = ed2d.selectedAtoms || [];
		if (selAtomIds.length === 0) return;
		var selSet = {};
		selAtomIds.forEach(function(id) { selSet[id] = true; });
		var cAtoms = atoms.filter(function(a) { return selSet[a.id]; }).map(function(a) { return JSON.parse(JSON.stringify(a)); });
		var cBonds = bonds.filter(function(b) { return selSet[b.from] && selSet[b.to]; }).map(function(b) { return JSON.parse(JSON.stringify(b)); });
		var cBrackets = brackets.filter(function(br) { return (ed2d.selectedBrackets || []).indexOf(br.id) >= 0; }).map(function(br) { return JSON.parse(JSON.stringify(br)); });
		clipboard = { atoms: cAtoms, bonds: cBonds, brackets: cBrackets };
	}
	function cdPasteClipboard() {
		if (!clipboard || clipboard.atoms.length === 0) return;
		var OFFSET = 30, idMap = {}, newAtomIds = [];
		clipboard.atoms.forEach(function(a) {
			var nid = genId(); idMap[a.id] = nid;
			var na = { id: nid, element: a.element, x: a.x + OFFSET, y: a.y + OFFSET, fixedH: a.fixedH, font: a.font };
			if (a.charge) na.charge = a.charge;
			if (a.scale) na.scale = a.scale;
			if (a.hideLabel) na.hideLabel = a.hideLabel;
			atoms.push(na);
			newAtomIds.push(nid);
		});
		clipboard.bonds.forEach(function(b) { bonds.push({ id: genId(), from: idMap[b.from], to: idMap[b.to], type: b.type }); });
		clipboard.brackets.forEach(function(br) { brackets.push({ id: genId(), x1: br.x1 + OFFSET, y1: br.y1 + OFFSET, x2: br.x2 + OFFSET, y2: br.y2 + OFFSET, subscript: br.subscript, font: br.font }); });
		ed2d.selectedAtoms = newAtomIds; ed2d.selectedBonds = []; ed2d.selectedBrackets = [];
		saveState(); refreshCurrentTab(); updateInfo();
	}
	function cdDeleteSelection() {
		var changed = false;
		if (ed2d.selectedAtoms && ed2d.selectedAtoms.length > 0) {
			var delIds = {}; ed2d.selectedAtoms.forEach(function(id) { delIds[id] = true; });
			atoms = atoms.filter(function(a) { return !delIds[a.id]; });
			bonds = bonds.filter(function(b) { return !delIds[b.from] && !delIds[b.to]; });
			ed2d.selectedAtoms = []; changed = true;
		}
		if (ed2d.selectedBonds && ed2d.selectedBonds.length > 0) {
			var delBIds = {}; ed2d.selectedBonds.forEach(function(id) { delBIds[id] = true; });
			bonds = bonds.filter(function(b) { return !delBIds[b.id]; });
			ed2d.selectedBonds = []; changed = true;
		}
		if (ed2d.selectedBrackets && ed2d.selectedBrackets.length > 0) {
			var delBrIds = {}; ed2d.selectedBrackets.forEach(function(id) { delBrIds[id] = true; });
			brackets = brackets.filter(function(b) { return !delBrIds[b.id]; });
			ed2d.selectedBrackets = []; changed = true;
		} else if (ed2d.selectedBracket) {
			brackets = brackets.filter(function(b) { return b.id !== ed2d.selectedBracket; });
			ed2d.selectedBracket = null; changed = true;
		}
		if (changed) { saveState(); refreshCurrentTab(); updateInfo(); }
	}
	/* 컨텍스트 메뉴: 전하 상태 */
	$(document).on('click', '#cdCtxCharge .cd-ctx-submenu .cd-ctx-item[data-charge]', function(e) {
		e.stopPropagation();
		$('#cdContextMenu').hide();
		var val = parseInt($(this).attr('data-charge'), 10);
		if (ed2d.selectedAtoms.length === 1) {
			var a = atomMap[ed2d.selectedAtoms[0]];
			if (a) {
				a.charge = val || 0;
				saveState(); ed2d.render(); updateInfo();
			}
		}
	});
	/* 컨텍스트 메뉴: 복사 */
	$(document).on('click', '#cdCtxCopy', function() { $('#cdContextMenu').hide(); cdCopySelection(); });
	/* 컨텍스트 메뉴: 잘라내기 */
	$(document).on('click', '#cdCtxCut', function() { $('#cdContextMenu').hide(); cdCopySelection(); cdDeleteSelection(); });
	/* 컨텍스트 메뉴: 붙여넣기 */
	$(document).on('click', '#cdCtxPaste', function() { $('#cdContextMenu').hide(); cdPasteClipboard(); });
	/* 삭제 */
	$(document).on('click', '#cdCtxDelete', function() {
		$('#cdContextMenu').hide();
		var changed = false;
		/* 선택된 원자/결합 삭제 */
		if (ed2d.selectedAtoms && ed2d.selectedAtoms.length > 0) {
			var delIds = {};
			ed2d.selectedAtoms.forEach(function(id) { delIds[id] = true; });
			atoms = atoms.filter(function(a) { return !delIds[a.id]; });
			bonds = bonds.filter(function(b) { return !delIds[b.from] && !delIds[b.to]; });
			ed2d.selectedAtoms = [];
			changed = true;
		}
		if (ed2d.selectedBonds && ed2d.selectedBonds.length > 0) {
			var delBIds = {};
			ed2d.selectedBonds.forEach(function(id) { delBIds[id] = true; });
			bonds = bonds.filter(function(b) { return !delBIds[b.id]; });
			ed2d.selectedBonds = [];
			changed = true;
		}
		/* 선택된 bracket 삭제 */
		if (ed2d.selectedBracket) {
			brackets = brackets.filter(function(b) { return b.id !== ed2d.selectedBracket; });
			ed2d.selectedBracket = null;
			changed = true;
		}
		if (changed) { saveState(); refreshCurrentTab(); updateInfo(); }
	});
	/* Bracket 추가 */
	/* ── Bracket subscript 모달 ── */
	var _bkResolve = null;
	function openBracketModal() {
		$('#cdBKInput').val('');
		$('.bk-preset-btn').removeClass('on').first().addClass('on');
		$('#cdBracketOverlay').addClass('active');
		setTimeout(function() { $('#cdBKInput').focus(); }, 200);
		return new Promise(function(resolve) { _bkResolve = resolve; });
	}
	function closeBracketModal(val) {
		$('#cdBracketOverlay').removeClass('active');
		if (_bkResolve) { _bkResolve(val); _bkResolve = null; }
	}
	$(document).on('click', '.bk-preset-btn', function() {
		$('.bk-preset-btn').removeClass('on');
		$(this).addClass('on');
		$('#cdBKInput').val('');
	});
	$(document).on('input', '#cdBKInput', function() {
		if ($(this).val().trim()) $('.bk-preset-btn').removeClass('on');
	});
	$(document).on('click', '#cdBKOk', function() {
		var val = $('#cdBKInput').val().trim() || ($('.bk-preset-btn.on').attr('data-val') || 'n');
		closeBracketModal(val);
	});
	$(document).on('click', '#cdBKCancel', function() { closeBracketModal(null); });
	$(document).on('click', '#cdBKClose', function() { closeBracketModal(null); });
	$(document).on('click', '#cdBracketOverlay', function(e) { if (e.target === this) closeBracketModal(null); });
	$(document).on('keydown', '#cdBKInput', function(e) {
		if (e.key === 'Enter') { e.preventDefault(); $('#cdBKOk').click(); }
		if (e.key === 'Escape') { closeBracketModal(null); }
	});

	$(document).on('click', '#cdCtxBracket', function() {
		$('#cdContextMenu').hide();
		if (!ed2d.selectedAtoms || ed2d.selectedAtoms.length === 0) return;
		openBracketModal().then(function(sub) {
			if (sub === null) return;
			/* 선택된 원자들의 바운딩 박스 계산 */
			var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
			ed2d.selectedAtoms.forEach(function(id) {
				var a = atomMap[id];
				if (a) {
					var r = (ELEMENTS[a.element] || ELEMENTS.C).radius + 5;
					if (a.x - r < minX) minX = a.x - r;
					if (a.y - r < minY) minY = a.y - r;
					if (a.x + r > maxX) maxX = a.x + r;
					if (a.y + r > maxY) maxY = a.y + r;
				}
			});
			if (minX === Infinity) return;
			var pad = 12;
			var newX1 = minX - pad, newY1 = minY - pad, newX2 = maxX + pad, newY2 = maxY + pad;
			/* 기존 bracket과 겹침 방지: 동일 x 범위에서 y가 겹치면 아래로 밀기 */
			var BRACKET_GAP = 8;
			var shifted = true;
			var maxIter = 20;
			while (shifted && maxIter-- > 0) {
				shifted = false;
				for (var bi = 0; bi < brackets.length; bi++) {
					var eb = brackets[bi];
					/* x 범위가 겹치는지 확인 */
					var xOverlap = newX1 < eb.x2 + 5 && newX2 > eb.x1 - 5;
					/* y 범위가 겹치는지 확인 */
					var yOverlap = newY1 < eb.y2 + BRACKET_GAP && newY2 > eb.y1 - BRACKET_GAP;
					if (xOverlap && yOverlap) {
						var shiftY = eb.y2 + BRACKET_GAP - newY1;
						newY1 += shiftY;
						newY2 += shiftY;
						shifted = true;
					}
				}
			}
			brackets.push({ id: genId(), x1: newX1, y1: newY1, x2: newX2, y2: newY2, subscript: sub || 'n', font: chemFont });
			saveState(); refreshCurrentTab(); updateInfo();
		});
	});
	/* Bracket 정렬: 선택된 bracket들의 높이/위치를 통일 */
	$(document).on('click', '#cdCtxBracketAlign', function() {
		$('#cdContextMenu').hide();
		/* 정렬 대상: 선택된 bracket이 2개 이상이면 선택된 것만, 아니면 전체 */
		var targetIds = (ed2d.selectedBrackets && ed2d.selectedBrackets.length >= 2) ? ed2d.selectedBrackets.slice() : brackets.map(function(b) { return b.id; });
		if (targetIds.length < 2) return;
		var targetBrs = [];
		targetIds.forEach(function(id) {
			var br = brackets.find(function(b) { return b.id === id; });
			if (br) targetBrs.push(br);
		});
		if (targetBrs.length < 2) return;
		/* 첫 번째 bracket 기준으로 크기(높이) + 위치(y1, y2) 통일 */
		var ref = targetBrs[0];
		var refY1 = ref.y1, refY2 = ref.y2;
		for (var i = 1; i < targetBrs.length; i++) {
			targetBrs[i].y1 = refY1;
			targetBrs[i].y2 = refY2;
		}
		saveState(); refreshCurrentTab(); updateInfo();
	});
	/* Snap to Grid — 링 감지 시 정다각형 배치, 체인은 그리드 스냅 */
	$(document).on('click', '#cdCtxResetSize', function() {
		$('#cdContextMenu').hide();
		if (!ed2d.selectedAtoms || ed2d.selectedAtoms.length === 0) return;
		ed2d.selectedAtoms.forEach(function(id) {
			var a = atomMap[id];
			if (a) delete a.scale;
		});
		saveState(); refreshCurrentTab(); updateInfo();
	});
	$(document).on('click', '#cdCtxAlign', function() {
		$('#cdContextMenu').hide();
		if (!ed2d.selectedAtoms || ed2d.selectedAtoms.length === 0) return;
		var selSet = {};
		ed2d.selectedAtoms.forEach(function(id) { selSet[id] = true; });
		/* 인접 리스트 구축 */
		var adj = {};
		ed2d.selectedAtoms.forEach(function(id) { adj[id] = []; });
		var selBonds = [];
		bonds.forEach(function(b) {
			if (selSet[b.from] && selSet[b.to]) {
				adj[b.from].push(b.to); adj[b.to].push(b.from);
				selBonds.push(b);
			}
		});
		/* 선택된 원자 리스트 */
		var selAtoms = ed2d.selectedAtoms.map(function(id) { return atomMap[id]; }).filter(Boolean);
		var BL = CD_BOND_LEN || 60;

		/* ═══ 전체 모든 링 탐색 (cdFindRings 재활용) ═══ */
		var rings = cdFindRings(selAtoms, selBonds, adj);

		/* 각 원자가 속한 링 기록 */
		var atomRings = {};
		ed2d.selectedAtoms.forEach(function(id) { atomRings[id] = []; });
		rings.forEach(function(ring, ri) {
			ring.forEach(function(aid) { if (atomRings[aid]) atomRings[aid].push(ri); });
		});

		var placed = {};
		var ringPlaced = {};

		/* 링을 정다각형으로 배치 */
		function placeRing(ring, cx, cy, startAngle) {
			var n = ring.length;
			var r = BL / (2 * Math.sin(Math.PI / n));
			for (var k = 0; k < n; k++) {
				var angle = startAngle - Math.PI / 2 + (2 * Math.PI * k) / n;
				var a = atomMap[ring[k]];
				if (a) { a.x = cx + r * Math.cos(angle); a.y = cy + r * Math.sin(angle); }
				placed[ring[k]] = true;
			}
		}

		/* 공유 원자/변 찾기: ringA와 ringB의 공유 원자 */
		function findSharedAtoms(rA, rB) {
			var setA = {};
			rA.forEach(function(id) { setA[id] = true; });
			return rB.filter(function(id) { return setA[id]; });
		}

		/* 공유 변(edge)을 기준으로 융합 링 배치 */
		function placeFusedRing(ring, ri) {
			var n = ring.length;
			var r = BL / (2 * Math.sin(Math.PI / n));
			/* 이미 배치된 원자 찾기 */
			var placedInRing = ring.filter(function(id) { return placed[id]; });
			if (placedInRing.length < 2) return false;

			/* 공유 변(edge): 링 내에서 연속인 배치 원자 쌍 */
			var edgeA = null, edgeB = null;
			for (var i = 0; i < n; i++) {
				var cur = ring[i], next = ring[(i + 1) % n];
				if (placed[cur] && placed[next]) { edgeA = cur; edgeB = next; break; }
			}
			if (!edgeA) { edgeA = placedInRing[0]; edgeB = placedInRing[1]; }

			var a1 = atomMap[edgeA], a2 = atomMap[edgeB];
			if (!a1 || !a2) return false;

			/* 공유 변의 중점에서 링 중심 방향 계산 */
			var mx = (a1.x + a2.x) / 2, my = (a1.y + a2.y) / 2;
			var edgeDx = a2.x - a1.x, edgeDy = a2.y - a1.y;
			var edgeLen = Math.hypot(edgeDx, edgeDy);
			/* 공유 변에 수직인 방향 (새 링은 기존 링 반대편) */
			var perpNx = -edgeDy / edgeLen, perpNy = edgeDx / edgeLen;

			/* 이미 배치된 다른 원자들의 무게중심 → 반대편으로 새 링 배치 */
			var existCx = 0, existCy = 0, existCnt = 0;
			for (var id in placed) {
				if (placed[id] && !ring.some(function(rid) { return rid == id; })) {
					var ea = atomMap[id];
					if (ea) { existCx += ea.x; existCy += ea.y; existCnt++; }
				}
			}
			if (existCnt > 0) {
				existCx /= existCnt; existCy /= existCnt;
				var dot = (existCx - mx) * perpNx + (existCy - my) * perpNy;
				if (dot > 0) { perpNx = -perpNx; perpNy = -perpNy; }
			}

			/* 새 링 중심 계산 */
			var apothem = r * Math.cos(Math.PI / n);
			var ncx = mx + perpNx * apothem;
			var ncy = my + perpNy * apothem;

			/* edgeA의 링 내 인덱스 기준으로 시작 각도 결정 */
			var idxA = ring.indexOf(edgeA);
			var idxB = ring.indexOf(edgeB);
			var angleA = Math.atan2(a1.y - ncy, a1.x - ncx);
			var angleB = Math.atan2(a2.y - ncy, a2.x - ncx);

			/* 감기 방향 결정 */
			var step = 2 * Math.PI / n;
			var diff = ((idxB - idxA) + n) % n;
			var angleDiff = angleB - angleA;
			while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
			while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
			var cw = (angleDiff > 0) ? 1 : -1;

			/* 링 원자 배치 */
			for (var k = 0; k < n; k++) {
				var aid = ring[k];
				if (placed[aid]) continue;
				var kFromA = ((k - idxA) + n) % n;
				var angle = angleA + cw * kFromA * step;
				var a = atomMap[aid];
				if (a) {
					a.x = ncx + r * Math.cos(angle);
					a.y = ncy + r * Math.sin(angle);
				}
				placed[aid] = true;
			}
			ringPlaced[ri] = true;
			return true;
		}

		/* ── 1단계: 링 배치 (크기 작은 것부터, 융합 링 처리) ── */
		if (rings.length > 0) {
			/* 첫 번째 링: 현재 위치 기준 중심 유지 */
			var firstRing = rings[0];
			var fn = firstRing.length;
			var fcx = 0, fcy = 0;
			firstRing.forEach(function(id) { var a = atomMap[id]; if (a) { fcx += a.x; fcy += a.y; } });
			fcx /= fn; fcy /= fn;
			/* 감기 방향 보존 */
			var fcross = 0;
			for (var i = 0; i < fn; i++) {
				var ca = atomMap[firstRing[i]], na = atomMap[firstRing[(i + 1) % fn]];
				if (ca && na) fcross += (na.x - ca.x) * (na.y + ca.y);
			}
			var fStartAngle = atomMap[firstRing[0]] ? Math.atan2(atomMap[firstRing[0]].y - fcy, atomMap[firstRing[0]].x - fcx) + Math.PI / 2 : 0;
			placeRing(firstRing, fcx, fcy, fStartAngle);
			ringPlaced[0] = true;

			/* 나머지 링: 공유 변 기반 융합 배치 */
			var changed = true;
			var maxIter = rings.length * 2;
			while (changed && maxIter-- > 0) {
				changed = false;
				for (var ri = 0; ri < rings.length; ri++) {
					if (ringPlaced[ri]) continue;
					var ring = rings[ri];
					var shared = ring.filter(function(id) { return placed[id]; });
					if (shared.length >= 2) {
						if (placeFusedRing(ring, ri)) changed = true;
					} else if (shared.length === 1) {
						/* 스피로(spiro) 결합: 공유 원자 1개 */
						var pivot = atomMap[shared[0]];
						if (pivot) {
							var usedAngles = [];
							(adj[shared[0]] || []).forEach(function(nid) {
								if (placed[nid]) {
									var na = atomMap[nid];
									if (na) usedAngles.push(Math.atan2(na.y - pivot.y, na.x - pivot.x));
								}
							});
							/* 가장 빈 방향 찾기 */
							var bestA = 0, bestGap = -1;
							for (var t = 0; t < 24; t++) {
								var cand = t * Math.PI / 12;
								var minG = Infinity;
								usedAngles.forEach(function(u) {
									var d = Math.abs(cand - u);
									if (d > Math.PI) d = 2 * Math.PI - d;
									if (d < minG) minG = d;
								});
								if (minG > bestGap) { bestGap = minG; bestA = cand; }
							}
							var nr = BL / (2 * Math.sin(Math.PI / ring.length));
							var ncx = pivot.x + nr * Math.cos(bestA);
							var ncy = pivot.y + nr * Math.sin(bestA);
							var pivIdx = ring.indexOf(shared[0]);
							var pivAngle = Math.atan2(pivot.y - ncy, pivot.x - ncx) + Math.PI / 2;
							placeRing(ring, ncx, ncy, pivAngle);
							ringPlaced[ri] = true;
							changed = true;
						}
					}
				}
			}
			/* 독립 링 (연결 안 된 것) */
			for (var ri = 0; ri < rings.length; ri++) {
				if (ringPlaced[ri]) continue;
				var ring = rings[ri];
				var rcx = 0, rcy = 0;
				ring.forEach(function(id) { var a = atomMap[id]; if (a) { rcx += a.x; rcy += a.y; } });
				rcx /= ring.length; rcy /= ring.length;
				placeRing(ring, rcx, rcy, 0);
				ringPlaced[ri] = true;
			}
		}

		/* ── 링이 없는 사슬형: spine 수평 + 가지 수직 레이아웃 ── */
		if (rings.length === 0 && ed2d.selectedAtoms.length > 0) {
			/* 차수 계산 → degree>=2 인 원자를 spine 후보로 (없으면 전체 사용) */
			var _deg = {};
			ed2d.selectedAtoms.forEach(function(id) { _deg[id] = (adj[id] || []).length; });
			var _spineCands = ed2d.selectedAtoms.filter(function(id) { return _deg[id] >= 2; });
			if (_spineCands.length < 2) _spineCands = ed2d.selectedAtoms.slice();
			var _spineSet = {};
			_spineCands.forEach(function(id) { _spineSet[id] = true; });
			var _spineAdj = {};
			_spineCands.forEach(function(id) {
				_spineAdj[id] = (adj[id] || []).filter(function(nb) { return _spineSet[nb]; });
			});
			/* 두 번 BFS로 트리 diameter(최장 경로) 찾기 */
			function _spineBfs(start) {
				var dist = {}; dist[start] = 0;
				var par = {}; par[start] = null;
				var q = [start], far = start, fd = 0;
				while (q.length > 0) {
					var c = q.shift();
					(_spineAdj[c] || []).forEach(function(nb) {
						if (!(nb in dist)) {
							dist[nb] = dist[c] + 1; par[nb] = c;
							if (dist[nb] > fd) { fd = dist[nb]; far = nb; }
							q.push(nb);
						}
					});
				}
				return { far: far, par: par };
			}
			var spine = [];
			if (_spineCands.length > 0) {
				var _r1 = _spineBfs(_spineCands[0]);
				var _r2 = _spineBfs(_r1.far);
				var _cur = _r2.far;
				while (_cur !== null && _cur !== undefined) { spine.unshift(_cur); _cur = _r2.par[_cur]; }
			}
			/* 원래 가로 방향 보존(왼쪽이 spine[0]) */
			if (spine.length >= 2) {
				var _sf = atomMap[spine[0]], _sl = atomMap[spine[spine.length - 1]];
				if (_sf && _sl && _sf.x > _sl.x) spine.reverse();
			}
			/* spine 수평 배치 (첫 원자 현재 위치 앵커) */
			if (spine.length > 0) {
				var _sa = atomMap[spine[0]];
				var _sx0 = _sa.x, _sy0 = _sa.y;
				spine.forEach(function(bid, i) {
					var a = atomMap[bid];
					if (a) { a.x = _sx0 + i * BL; a.y = _sy0; placed[bid] = true; }
				});
			}
			/* spine 각 원자에 매달린 비-spine 가지 배치 */
			var _STEP60 = Math.PI / 3;
			spine.forEach(function(bid, bidx) {
				var bAtom = atomMap[bid];
				if (!bAtom) return;
				var branches = (adj[bid] || []).filter(function(nid) {
					return selSet[nid] && !placed[nid];
				});
				if (branches.length === 0) return;
				var isStart = (bidx === 0);
				var isEnd = (bidx === spine.length - 1);
				if (isStart || isEnd) {
					/* 끝점: 위(-90°)/바깥(180°·0°)/아래(90°) 90° 간격 T자 정렬 */
					var outward = isStart ? Math.PI : 0;
					var slots;
					if (branches.length === 1) {
						slots = [outward];
					} else if (branches.length === 2) {
						slots = [-Math.PI / 2, Math.PI / 2];
					} else if (branches.length === 3) {
						slots = [-Math.PI / 2, outward, Math.PI / 2];
					} else {
						/* 4개 이상: T자 + 바깥 ±45° 대각선 */
						slots = [-Math.PI / 2, outward, Math.PI / 2];
						for (var _k = 3; _k < branches.length; _k++) {
							var _diag = (_k % 2 === 0) ? -Math.PI / 4 : Math.PI / 4;
							slots.push(outward + _diag);
						}
					}
					branches.forEach(function(nid, idx) {
						var ang = slots[idx];
						var na = atomMap[nid];
						if (na) {
							na.x = bAtom.x + BL * Math.cos(ang);
							na.y = bAtom.y + BL * Math.sin(ang);
							placed[nid] = true;
						}
					});
				} else {
					/* 중간: 수직 위/아래 교대 (3개 이상은 ±30° 분산) */
					branches.forEach(function(nid, idx) {
						var na = atomMap[nid];
						if (!na) return;
						var sign = (idx % 2 === 0) ? -1 : 1;
						var off = Math.floor(idx / 2);
						var ang = sign * Math.PI / 2 + sign * off * Math.PI / 6;
						na.x = bAtom.x + BL * Math.cos(ang);
						na.y = bAtom.y + BL * Math.sin(ang);
						placed[nid] = true;
					});
				}
			});
		}

		/* ── 2단계: 비-링 원자 BFS 배치 (깊은 가지) ── */
		var bfsQ = [];
		ed2d.selectedAtoms.forEach(function(id) { if (placed[id]) bfsQ.push(id); });
		var bfsVisited = {};
		while (bfsQ.length > 0) {
			var cid = bfsQ.shift();
			if (bfsVisited[cid]) continue;
			bfsVisited[cid] = true;
			var ca = atomMap[cid];
			if (!ca) continue;
			/* 이미 배치된 이웃 방향 수집 */
			var usedAngles = [];
			(adj[cid] || []).forEach(function(nid) {
				if (!placed[nid]) return;
				var na = atomMap[nid];
				if (na) usedAngles.push(Math.atan2(na.y - ca.y, na.x - ca.x));
			});
			/* 미배치 이웃 */
			var pending = [];
			(adj[cid] || []).forEach(function(nid) {
				if (placed[nid] || !selSet[nid]) return;
				/* 이 이웃이 미배치 링에 속하면 링 전체를 배치 */
				var nrings = (atomRings[nid] || []).filter(function(ri) { return !ringPlaced[ri]; });
				if (nrings.length > 0) {
					var ri = nrings[0];
					var ring = rings[ri];
					/* 링을 cid와 nid 연결 방향으로 배치 */
					var baseAngle = usedAngles.length > 0
						? (function() {
							var sx = 0, sy = 0;
							usedAngles.forEach(function(a) { sx += Math.cos(a); sy += Math.sin(a); });
							return Math.atan2(-sy, -sx);
						})()
						: -Math.PI / 6;
					var nr = BL / (2 * Math.sin(Math.PI / ring.length));
					var nx = ca.x + BL * Math.cos(baseAngle);
					var ny = ca.y + BL * Math.sin(baseAngle);
					var ncx = ca.x + (nr + BL * 0.1) * Math.cos(baseAngle);
					var ncy = ca.y + (nr + BL * 0.1) * Math.sin(baseAngle);
					/* cid가 ring에 포함된 경우 */
					var cidIdx = ring.indexOf(cid);
					var nidIdx = ring.indexOf(nid);
					if (cidIdx >= 0) {
						atomMap[cid].x = ca.x; atomMap[cid].y = ca.y;
						placed[cid] = true;
						var nn = ring.length;
						var rr = BL / (2 * Math.sin(Math.PI / nn));
						var diff = ((nidIdx - cidIdx) + nn) % nn;
						var desiredAngle = baseAngle;
						var startA = desiredAngle - (2 * Math.PI * diff) / nn + Math.PI / 2;
						var ccx = ca.x - rr * Math.cos(startA - Math.PI / 2);
						var ccy = ca.y - rr * Math.sin(startA - Math.PI / 2);
						for (var k = 0; k < nn; k++) {
							var aid = ring[k];
							if (placed[aid] && aid !== cid) continue;
							var kIdx = ((k - cidIdx) + nn) % nn;
							var angle = startA - Math.PI / 2 + (2 * Math.PI * kIdx) / nn;
							var aa = atomMap[aid];
							if (aa) { aa.x = ccx + rr * Math.cos(angle); aa.y = ccy + rr * Math.sin(angle); }
							placed[aid] = true;
						}
					} else {
						placeRing(ring, ncx, ncy, Math.atan2(ca.y - ncy, ca.x - ncx) + Math.PI / 2);
					}
					ringPlaced[ri] = true;
					ring.forEach(function(aid) { bfsQ.push(aid); });
					return;
				}
				pending.push({ id: nid, atom: atomMap[nid] });
			});
			if (pending.length === 0) continue;

			/* 기준 각도: 배치된 이웃 반대 방향 */
			var baseAngle;
			if (usedAngles.length > 0) {
				var sx = 0, sy = 0;
				usedAngles.forEach(function(a) { sx += Math.cos(a); sy += Math.sin(a); });
				baseAngle = Math.atan2(-sy, -sx);
			} else {
				baseAngle = -Math.PI / 6;
			}

			/* 각 60도 간격 배치 */
			var step = Math.PI / 3;
			var totalSpread = (pending.length - 1) * step;
			var startA = baseAngle - totalSpread / 2;
			pending.forEach(function(p, idx) {
				if (placed[p.id]) return;
				var angle = startA + idx * step;
				/* 겹침 방지: 이미 사용된 각도와 가까우면 회피 */
				var tooClose = true;
				var attempt = 0;
				while (tooClose && attempt < 6) {
					tooClose = false;
					for (var u = 0; u < usedAngles.length; u++) {
						var d = Math.abs(angle - usedAngles[u]);
						if (d > Math.PI) d = 2 * Math.PI - d;
						if (d < Math.PI / 6) { angle += step / 2; tooClose = true; break; }
					}
					attempt++;
				}
				p.atom.x = ca.x + BL * Math.cos(angle);
				p.atom.y = ca.y + BL * Math.sin(angle);
				usedAngles.push(angle);
				placed[p.id] = true;
				bfsQ.push(p.id);
			});
		}

		/* 미배치 독립 원자 → 현재 위치 유지 */
		ed2d.selectedAtoms.forEach(function(id) {
			if (!placed[id]) placed[id] = true;
		});

		/* ── 3단계: 겹침 해소 (Force-directed relaxation) ── */
		var MIN_DIST = BL * 0.6;
		for (var iter = 0; iter < 50; iter++) {
			var moved = false;
			for (var i = 0; i < selAtoms.length; i++) {
				for (var j = i + 1; j < selAtoms.length; j++) {
					var ai = selAtoms[i], aj = selAtoms[j];
					var dx = aj.x - ai.x, dy = aj.y - ai.y;
					var dist = Math.hypot(dx, dy);
					if (dist < MIN_DIST && dist > 0.1) {
						var push = (MIN_DIST - dist) / 2 + 1;
						var ux = dx / dist, uy = dy / dist;
						ai.x -= ux * push; ai.y -= uy * push;
						aj.x += ux * push; aj.y += uy * push;
						moved = true;
					}
				}
			}
			if (!moved) break;
		}

		saveState(); refreshCurrentTab(); updateInfo();
	});

	/* ── 회전/반전 공통 함수 ── */
	function cdTransformSelected(transformFn) {
		$('#cdContextMenu').hide();
		if (!ed2d.selectedAtoms || ed2d.selectedAtoms.length === 0) return;
		var selSet = {};
		ed2d.selectedAtoms.forEach(function(id) { selSet[id] = true; });
		/* 선택된 원자들의 bounding box 중심 계산 */
		var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		ed2d.selectedAtoms.forEach(function(id) {
			var a = atomMap[id];
			if (a) {
				if (a.x < minX) minX = a.x;
				if (a.y < minY) minY = a.y;
				if (a.x > maxX) maxX = a.x;
				if (a.y > maxY) maxY = a.y;
			}
		});
		if (minX === Infinity) return;
		var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
		/* 원자 변환 */
		ed2d.selectedAtoms.forEach(function(id) {
			var a = atomMap[id];
			if (a) {
				var p = transformFn(a.x, a.y, cx, cy);
				a.x = p.x; a.y = p.y;
			}
		});
		/* 브라켓 변환 */
		if (ed2d.selectedBracket) {
			var br = brackets.find(function(b) { return b.id === ed2d.selectedBracket; });
			if (br) {
				var p1 = transformFn(br.x1, br.y1, cx, cy);
				var p2 = transformFn(br.x2, br.y2, cx, cy);
				br.x1 = Math.min(p1.x, p2.x); br.y1 = Math.min(p1.y, p2.y);
				br.x2 = Math.max(p1.x, p2.x); br.y2 = Math.max(p1.y, p2.y);
			}
		}
		saveState(); refreshCurrentTab(); updateInfo();
	}
	/* ── 자유 회전 (Free Rotation) ── */
	function cdStartRotation(pos, mode) {
		if (!ed2d.selectedAtoms || ed2d.selectedAtoms.length < 2) return;
		var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		ed2d.selectedAtoms.forEach(function(id) {
			var a = atomMap[id];
			if (a) { if (a.x < minX) minX = a.x; if (a.y < minY) minY = a.y; if (a.x > maxX) maxX = a.x; if (a.y > maxY) maxY = a.y; }
		});
		if (minX === Infinity) return;
		var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
		var startAngle = Math.atan2(pos.y - cy, pos.x - cx);
		ed2d._rotating = {
			mode: mode, cx: cx, cy: cy, startAngle: startAngle, currentAngle: 0,
			origAtoms: ed2d.selectedAtoms.map(function(id) {
				var a = atomMap[id];
				return a ? { id: id, x: a.x, y: a.y } : null;
			}).filter(Boolean),
			origBrackets: ed2d.selectedBrackets.map(function(id) {
				var br = brackets.find(function(b) { return b.id === id; });
				return br ? { id: id, x1: br.x1, y1: br.y1, x2: br.x2, y2: br.y2 } : null;
			}).filter(Boolean)
		};
		ed2d.svgEl.style.cursor = 'grabbing';
	}
	function cdDoRotation(pos) {
		var r = ed2d._rotating;
		var angle = Math.atan2(pos.y - r.cy, pos.x - r.cx);
		var delta = angle - r.startAngle;
		r.currentAngle = delta;
		var cos = Math.cos(delta), sin = Math.sin(delta);
		r.origAtoms.forEach(function(orig) {
			var a = atomMap[orig.id];
			if (a) { var dx = orig.x - r.cx, dy = orig.y - r.cy; a.x = r.cx + dx * cos - dy * sin; a.y = r.cy + dx * sin + dy * cos; }
		});
		r.origBrackets.forEach(function(orig) {
			var br = brackets.find(function(b) { return b.id === orig.id; });
			if (br) {
				var dx1 = orig.x1 - r.cx, dy1 = orig.y1 - r.cy, dx2 = orig.x2 - r.cx, dy2 = orig.y2 - r.cy;
				var nx1 = r.cx + dx1*cos - dy1*sin, ny1 = r.cy + dx1*sin + dy1*cos;
				var nx2 = r.cx + dx2*cos - dy2*sin, ny2 = r.cy + dx2*sin + dy2*cos;
				br.x1 = Math.min(nx1, nx2); br.y1 = Math.min(ny1, ny2);
				br.x2 = Math.max(nx1, nx2); br.y2 = Math.max(ny1, ny2);
			}
		});
		scheduleRender();
	}
	function cdCommitRotation() {
		ed2d._rotating = null;
		ed2d.svgEl.style.cursor = 'crosshair';
		saveState(); refreshCurrentTab(); updateInfo();
	}
	$(document).on('click', '#cdCtxRotate', function() {
		$('#cdContextMenu').hide();
		if (ed2d.selectedAtoms.length >= 2) cdStartRotation(ed2d.mousePos, 'free');
	});
	/* 좌우 반전 */
	$(document).on('click', '#cdCtxFlipH', function() {
		cdTransformSelected(function(x, y, cx, cy) {
			return { x: 2 * cx - x, y: y };
		});
	});
	/* 상하 반전 */
	$(document).on('click', '#cdCtxFlipV', function() {
		cdTransformSelected(function(x, y, cx, cy) {
			return { x: x, y: 2 * cy - y };
		});
	});

	/* ═══════════════════════════════════════
	   newAppleTab & UI Event Handlers
	   ═══════════════════════════════════════ */
	function cdUpdateTabBg($tab) {
		var $active = $tab.find('li.on');
		if ($active.length) {
			var pos = $active.position();
			$tab.find('.tabBg').stop().animate({ left: pos.left - 2, width: $active.outerWidth() + 4 }, 200);
		}
	}
	function cdInitAllTabBgs() {
		$('#fmlChemDrawWin .newAppleTab').each(function() {
			var $tab = $(this);
			var $active = $tab.find('li.on');
			if ($active.length) {
				var pos = $active.position();
				$tab.find('.tabBg').css({ left: pos.left - 2, width: $active.outerWidth() + 4 });
			}
		});
	}
	/* 메인 탭 클릭 */
	$(document).on('click', '#cdMainTabs li', function() {
		var tab = $(this).attr('data-tab');
		switchTab(tab);
	});
	/* 3D 도구 탭 (Select/Atom/Bond/Eraser) */
	$(document).on('click', '#cd3DToolTab li', function() {
		var tool = $(this).attr('data-tool');
		set3DTool(tool);
	});
	/* Element 버튼 클릭 */
	$(document).on('click', '#fmlChemDrawWin .btnBox[data-element]', function() {
		var el = $(this).attr('data-element');
		if ($(this).hasClass('on')) {
			clearElementSelection();
			setTool('select');
		} else {
			cdSetElement(el);
		}
	});
	/* cdAddElementBtn → 옵션 팝업 (주기율표 / 직접추가) */
	$(document).on('click', '#cdAddElementBtn', function(e) {
		e.stopPropagation();
		var popup = document.getElementById('cdAddElementPopup');
		if (popup.style.display === 'block') { popup.style.display = 'none'; return; }
		var rect = this.getBoundingClientRect();
		var parentRect = document.getElementById('fmlChemDrawWin').getBoundingClientRect();
		popup.style.left = (rect.left - parentRect.left) + 'px';
		popup.style.top = (rect.bottom - parentRect.top + 4) + 'px';
		popup.style.display = 'block';
	});
	$(document).on('click', function(e) {
		if (!$(e.target).closest('#cdAddElementPopup, #cdAddElementBtn').length) {
			$('#cdAddElementPopup').hide();
		}
	});
	$(document).on('click', '#cdAddElPT', function() {
		$('#cdAddElementPopup').hide();
		openPeriodicTable();
	});
	$(document).on('click', '#cdAddElCustom', function() {
		$('#cdAddElementPopup').hide();
		openCustomElementModal();
	});
	/* 직접추가 모달 */
	var _celResolve = null;
	function openCustomElementModal() {
		$('#cdCustomElInput').val('');
		$('#cdCustomElOverlay').addClass('active');
		setTimeout(function() { $('#cdCustomElInput').focus(); }, 200);
	}
	function closeCustomElementModal(val) {
		$('#cdCustomElOverlay').removeClass('active');
		if (val) addCustomElement(val);
	}
	function addCustomElement(sym) {
		sym = sym.trim();
		if (!sym) return;
		if (!ELEMENTS[sym]) {
			ELEMENTS[sym] = { color: '#8E24AA', color3d: 0x8e24aa, radius: 20, r3d: 0.45, label: sym, name: sym };
			VALENCES[sym] = 0;
		}
		var slots = cdGetElementSlots();
		if (slots.indexOf(sym) >= 0) { setElement(sym); return; }
		if (slots.length >= CD_MAX_SLOTS) slots.pop();
		slots.unshift(sym);
		cdSaveElementSlots(slots);
		cdRenderElementSlots();
		setElement(sym);
	}
	$(document).on('click', '#cdCustomElOk', function() {
		var val = $('#cdCustomElInput').val().trim();
		closeCustomElementModal(val);
	});
	$(document).on('click', '#cdCustomElCancel', function() { closeCustomElementModal(null); });
	$(document).on('click', '#cdCustomElClose', function() { closeCustomElementModal(null); });
	$(document).on('click', '#cdCustomElOverlay', function(e) { if (e.target === this) closeCustomElementModal(null); });
	$(document).on('keydown', '#cdCustomElInput', function(e) {
		if (e.key === 'Enter') { e.preventDefault(); $('#cdCustomElOk').click(); }
		if (e.key === 'Escape') { closeCustomElementModal(null); }
	});
	$(document).on('click', '#cdPeriodicTableOverlay', function(e) {
		if (e.target === this) closePeriodicTable();
	});
	$(document).on('click', '#cdPTClose', function() {
		closePeriodicTable();
	});
	$(document).on('click', '.pt-cell[data-pt-sym]', function() {
		addElementFromPT($(this).attr('data-pt-sym'));
	});
	/* 커스텀 툴팁 — 즉시 표시 */
	(function() {
		var tip = document.createElement('div');
		tip.id = 'ptTooltip';
		tip.style.cssText = 'position:fixed;pointer-events:none;z-index:99999;opacity:0;transition:opacity 0.12s;' +
			'background:rgba(10,10,20,0.92);border:1px solid rgba(255,255,255,0.15);border-radius:8px;' +
			'padding:8px 12px;font-family:SUIT-Regular;font-size:12px;color:rgba(255,255,255,0.9);' +
			'backdrop-filter:blur(10px);box-shadow:0 4px 20px rgba(0,0,0,0.5);white-space:nowrap;';
		document.body.appendChild(tip);
		var ptGrid = document.getElementById('cdPTGrid');
		ptGrid.addEventListener('mouseover', function(e) {
			var cell = e.target.closest('.pt-cell[data-pt-sym]');
			if (!cell) { tip.style.opacity = '0'; return; }
			var sym = cell.getAttribute('data-pt-sym');
			var name = cell.getAttribute('data-pt-name');
			var cat = cell.getAttribute('data-pt-cat');
			var mass = cell.getAttribute('data-pt-mass');
			var en = cell.getAttribute('data-pt-en');
			var rgb = getComputedStyle(cell).getPropertyValue('--cat-glow').trim() || '255,255,255';
			tip.innerHTML = '<span style="color:rgba(' + rgb + ',1);font-family:SUIT-Bold;font-size:16px;">' + sym + '</span>' +
				' <span style="color:rgba(255,255,255,0.8);font-size:13px;">' + name + '</span>' +
				'<span style="color:rgba(255,255,255,0.55);font-size:12px;margin-left:6px;">' + cat + '</span>' +
				'<br><span style="color:rgba(255,255,255,0.85);font-size:12px;">\u2696 ' + mass + ' u</span>' +
				(en ? '<span style="color:rgba(' + rgb + ',0.8);font-size:12px;margin-left:10px;">EN ' + en + '</span>' : '');
			tip.style.opacity = '1';
		});
		ptGrid.addEventListener('mousemove', function(e) {
			tip.style.left = (e.clientX + 14) + 'px';
			tip.style.top = (e.clientY + 14) + 'px';
		});
		ptGrid.addEventListener('mouseleave', function() {
			tip.style.opacity = '0';
		});
	})();
	/* 근접 글로우 (Proximity Glow): 역제곱 법칙 기반 — 최적화: 셀 캐시 + rAF */
	(function() {
		var ptGrid = document.getElementById('cdPTGrid');
		var glowRadius = 200, k = 40;
		var _glowCells = null; /* cached cell data: [{el, cx, cy, rgb, defShadow, defBorder}] */
		var _glowRAF = 0, _glowMX = 0, _glowMY = 0;
		function _buildCellCache() {
			var nodes = ptGrid.querySelectorAll('.pt-cell[data-pt-sym]');
			_glowCells = [];
			nodes.forEach(function(cell) {
				if (!cell.hasAttribute('data-default-border')) {
					cell.setAttribute('data-default-border', cell.style.borderColor || '');
					cell.setAttribute('data-default-shadow', cell.style.boxShadow || '');
				}
				var rect = cell.getBoundingClientRect();
				_glowCells.push({
					el: cell,
					cx: rect.left + rect.width / 2,
					cy: rect.top + rect.height / 2,
					rgb: cell.style.getPropertyValue('--cat-glow') || getComputedStyle(cell).getPropertyValue('--cat-glow').trim() || '255,255,255',
					defShadow: cell.getAttribute('data-default-shadow') || '',
					defBorder: cell.getAttribute('data-default-border') || ''
				});
			});
		}
		function _applyGlow() {
			_glowRAF = 0;
			if (!_glowCells) return;
			var mx = _glowMX, my = _glowMY;
			for (var i = 0; i < _glowCells.length; i++) {
				var c = _glowCells[i];
				var dx = mx - c.cx, dy = my - c.cy;
				var dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < glowRadius) {
					var intensity = 1 / (1 + (dist / k) * (dist / k));
					var blur = Math.round(intensity * 35);
					var opacity = (intensity * 1.3).toFixed(2);
					var innerOpacity = (intensity * 0.9).toFixed(2);
					var proxShadow = '0 0 ' + blur + 'px rgba(' + c.rgb + ',' + opacity + '),inset 0 -12px 16px -8px rgba(' + c.rgb + ',' + innerOpacity + ')';
					c.el.style.boxShadow = c.defShadow ? c.defShadow + ',' + proxShadow : proxShadow;
					c.el.style.borderColor = 'rgba(' + c.rgb + ',' + Math.max(0.2, intensity * 0.8).toFixed(2) + ')';
				} else {
					c.el.style.boxShadow = c.defShadow;
					c.el.style.borderColor = c.defBorder;
				}
			}
		}
		ptGrid.addEventListener('mousemove', function(e) {
			_glowMX = e.clientX; _glowMY = e.clientY;
			if (!_glowRAF) { _glowRAF = requestAnimationFrame(_applyGlow); }
		});
		ptGrid.addEventListener('mouseenter', function() { _buildCellCache(); });
		ptGrid.addEventListener('mouseleave', function() {
			if (_glowRAF) { cancelAnimationFrame(_glowRAF); _glowRAF = 0; }
			if (_glowCells) { for (var i = 0; i < _glowCells.length; i++) { var c = _glowCells[i]; c.el.style.boxShadow = c.defShadow; c.el.style.borderColor = c.defBorder; } }
			_glowCells = null;
		});
	})();
	/* H 카운트 버튼 클릭 */
	$(document).on('click', '#fmlChemDrawWin .btnBox[data-hcount]', function() {
		var val = $(this).attr('data-hcount');
		cdSetHCount(val);
	});
	/* Bond 타입 버튼 클릭 (토글: 선택 → bond 모드, 재클릭 → select 모드) */
	$(document).on('click', '#fmlChemDrawWin .btnBox[data-bondtype]', function() {
		var bt = $(this).attr('data-bondtype');
		if (ed2d.tool === 'bond' && bondType === bt) {
			setBondTypeUI(null);
			setTool('select');
		} else {
			setBondTypeUI(bt);
			ed2d.tool = 'bond'; ed2d.bondStart = null;
			ed2d.hoveredAtom = -1; ed2d.hoveredBond = -1; ed2d.hoveredBracket = -1;
			ed2d.rubberBand = null; ed2d.isDragging = false; ed2d.mouseDownPos = null; ed2d.mouseDownTarget = null;
			clearElementSelection();
			if (ed2d.svgEl) ed2d.svgEl.style.cursor = 'crosshair';
			updateStatusBar(); ed2d.render();
		}
	});
	/* Font 버튼 클릭 */
	$(document).on('click', '#fmlChemDrawWin .btnBox[data-font]', function() {
		var font = $(this).attr('data-font');
		$('#fmlChemDrawWin .btnBox[data-font]').removeClass('on');
		$(this).addClass('on');
		var hasSelection = ed2d.selectedAtoms.length > 0 || ed2d.selectedBrackets.length > 0;
		if (!hasSelection) {
			/* 선택 없음 → 기본 폰트만 변경 */
			chemFont = font;
			refreshCurrentTab();
			return;
		}
		var changed = false;
		/* 선택된 원소가 있으면 해당 원소들의 font만 변경 */
		if (ed2d.selectedAtoms.length > 0) {
			ed2d.selectedAtoms.forEach(function(id) {
				var a = atomMap[id];
				if (a) a.font = font;
			});
			changed = true;
		}
		/* 선택된 bracket의 font만 변경 */
		if (ed2d.selectedBrackets.length > 0) {
			ed2d.selectedBrackets.forEach(function(id) {
				var br = brackets.find(function(b) { return b.id === id; });
				if (br) br.font = font;
			});
			changed = true;
		}
		if (changed) saveState();
		refreshCurrentTab();
	});
	/* Ring 버튼 클릭 (토글: 선택 → ring 모드, 재클릭 → select 모드) */
	$(document).on('click', '#fmlChemDrawWin .ringBtn', function() {
		var rt = $(this).attr('data-ring');
		if (ed2d.tool === 'ring' && selectedRing === rt) {
			clearRingSelection();
			setTool('select');
		} else {
			setRing(rt);
		}
	});

	/* ═══════════════════════════════════════
	   List / Window control
	   ═══════════════════════════════════════ */
	var chemDrawAllData = [];
	var bookmarkFilterOn = false;

	function fnLoadChemDrawList() {
		var param = {};
		if (bookmarkFilterOn) param.BOOKMARK_FILTER = 'Y';
		$.ajax({
			url: '/admin/popup/selectChemDrawListAjax',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(param),
			success: function(data) {
				chemDrawAllData = data || [];
				fnRenderChemDrawList(chemDrawAllData);
			}
		});
	}

	function fnRenderChemDrawList(data) {
		var html = '';
		if (data && data.length > 0) {
			$.each(data, function(idx, item) {
				var svgHtml = '<span style="font-size:11px;color:#ccc;">No preview</span>';
				if (item.SVG_DATA) {
					svgHtml = cdFitSvgThumb(item.SVG_DATA);
				}
				var regDate = (item.REG_DATETIME || '-').substring(0, 10);
				var isBookmarked = (item.BOOKMARK_YN === 'Y');
				var bmIcon = isBookmarked ? 'star' : 'star_border';
				var bmColor = isBookmarked ? 'color:#ff9800;' : 'color:#aaa;';
				var titleText = (item.MOLECULAR_NM || '-');
				if (item.MOLECULAR_FORMULA) titleText += ' (' + item.MOLECULAR_FORMULA + ')';
				html += '<div class="grid_list_item waves-effect waves-hColor chemDrawCard animate__animated animate__flipInX" data-seq="'+item.SEQ_CHEMDRAW+'" data-is-owner="'+(item.IS_OWNER||'N')+'" style="animation-delay:'+(idx * 0.06)+'s;">';
				html += '<i class="material-icons bookmarkBtn" data-seq="'+item.SEQ_CHEMDRAW+'" data-bookmark="'+(isBookmarked?'Y':'N')+'" title="즐겨찾기" style="'+bmColor+'">'+bmIcon+'</i>';
				if (item.IS_OWNER === 'Y') html += '<i class="material-icons deleteBtn btnDeleteChemDraw" data-seq="'+item.SEQ_CHEMDRAW+'" title="삭제">close</i>';
				html += '<div class="chemImg">' + svgHtml + '</div>';
				html += '<div class="infoArea">';
				html += '<div class="tit">' + titleText + '</div>';
				html += '<div class="regInfo">';
				html += '<div>' + (item.REG_EMP_NM || '-') + '</div>';
				html += '<div>' + regDate + '</div>';
				html += '</div>';
				html += '</div>';
				html += '</div>';
			});
		} else {
			var emptyMsg = bookmarkFilterOn ? '즐겨찾기한 항목이 없습니다.' : '저장된 데이터가 없습니다.';
			html = '<div style="padding:40px; text-align:center; color:#999; grid-column: 1/-1;">'+emptyMsg+'</div>';
		}
		$('#chemDrawGridList').html(html);
		/* 검색 영역 너비를 첫 번째 카드와 동일하게 맞춤 */
		requestAnimationFrame(function() {
			var card = document.querySelector('#chemDrawGridList .chemDrawCard');
			if (card) $('#cdSearchWrap').css('width', card.offsetWidth + 'px');
		});
	}

	function fnSearchChemDraw() {
		var keyword = ($('#searchChemDraw').val() || '').trim().toUpperCase();
		if (!keyword) {
			fnRenderChemDrawList(chemDrawAllData);
			return;
		}
		var filtered = chemDrawAllData.filter(function(item) {
			return (item.MOLECULAR_FORMULA || '').toUpperCase().indexOf(keyword) >= 0
				|| (item.MOLECULAR_NM || '').toUpperCase().indexOf(keyword) >= 0;
		});
		fnRenderChemDrawList(filtered);
	}
	window.fnSearchChemDraw = fnSearchChemDraw;

	/* 검색 영역 너비 동기화 (resize) */
	$(window).on('resize.cdSearch', function() {
		var card = document.querySelector('#chemDrawGridList .chemDrawCard');
		if (card) $('#cdSearchWrap').css('width', card.offsetWidth + 'px');
	});

	/* 즐겨찾기 필터 토글 */
	$(document).on('click', '#btnBookmarkFilter', function() {
		bookmarkFilterOn = !bookmarkFilterOn;
		var $btn = $(this);
		if (bookmarkFilterOn) {
			$btn.text('star').css('color', '#ff9800');
		} else {
			$btn.text('star').css('color', '#aaa');
		}
		fnLoadChemDrawList();
	});

	/* 즐겨찾기 별표 클릭 */
	$(document).on('click', '.bookmarkBtn', function(e) {
		e.stopPropagation();
		var $icon = $(this);
		var seq = $icon.attr('data-seq');
		var current = $icon.attr('data-bookmark');
		var newVal = (current === 'Y') ? 'N' : 'Y';
		$.ajax({
			url: '/admin/popup/mergeChemDrawBookmarkAjax',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({ SEQ_CHEMDRAW: seq, BOOKMARK_YN: newVal }),
			success: function() {
				if (newVal === 'Y') {
					$icon.text('star').css('color', '#ff9800').attr('data-bookmark', 'Y');
				} else {
					$icon.text('star_border').css({'color': '#aaa', 'text-shadow': 'none'}).attr('data-bookmark', 'N');
				}
				/* 필터가 켜져 있으면 리스트 재조회 */
				if (bookmarkFilterOn && newVal === 'N') {
					fnLoadChemDrawList();
				}
				/* 로컬 데이터도 업데이트 */
				for (var i = 0; i < chemDrawAllData.length; i++) {
					if (String(chemDrawAllData[i].SEQ_CHEMDRAW) === String(seq)) {
						chemDrawAllData[i].BOOKMARK_YN = newVal;
						break;
					}
				}
			}
		});
	});

	var _cdHideTimer = null;

	/* 모달 열려있을 때 Ctrl+Wheel 브라우저 줌 차단 */
	document.addEventListener('wheel', function(e) {
		if (e.ctrlKey && $('#fmlChemDrawWin').attr('data-view') === 'Y') {
			e.preventDefault();
		}
	}, { passive: false });

	function openModal(modal) {
		var overlay = document.querySelector('.modal-overlay');
		if (!overlay) {
			overlay = document.createElement('div');
			overlay.className = 'modal-overlay';
			document.body.appendChild(overlay);
		}
		overlay.style.display = 'block';
		overlay.onclick = function() { closeModal(modal); };

		/* CSS transition 기반 부드러운 열기 */
		modal.classList.remove('animate__animated', 'animate__zoomIn', 'animate__zoomOut');
		modal.style.display = 'block';
		modal.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
		modal.style.transform = 'scale(0.92)';
		modal.style.opacity = '0';
		modal.offsetHeight; /* reflow */
		modal.style.opacity = '1';
		modal.style.transform = 'scale(1)';
		modal.setAttribute('data-view', 'Y');

		/* Elements 버튼 순차 fadeInLeft 효과 (경량화) */
		modal.querySelectorAll('.btnArea .btnBox').forEach(function(btn, i) {
			btn.classList.remove('animate__animated', 'animate__fadeInLeft');
			btn.style.opacity = '0';
			btn.style.transform = 'translateX(-12px)';
			btn.style.transition = 'none';
			setTimeout(function() {
				btn.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
				btn.style.opacity = '';
				btn.style.transform = '';
			}, i * 25);
		});
	}

	function closeModal(modal) {
		modal.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
		modal.style.opacity = '0';
		modal.style.transform = 'scale(0.95)';
		modal.setAttribute('data-view', 'N');
		setTimeout(function() {
			modal.style.display = 'none';
			modal.style.transform = '';
			modal.style.transition = '';
		}, 260);
		var overlay = document.querySelector('.modal-overlay');
		if (overlay) overlay.style.display = 'none';
	}

	function fnShowChemDrawWin() {
		if (_cdHideTimer) { clearTimeout(_cdHideTimer); _cdHideTimer = null; }
		var modal = document.getElementById('fmlChemDrawWin');
		openModal(modal);
		fnInitChemDraw();
		setTimeout(cdInitAllTabBgs, 50);
	}

	window.fnOpenNewChemDraw = function() {
		$('#SEQ_CHEMDRAW').val('');
		$('#cdSearchInput').val('');
		$('#chemDrawMolNm').val('');
		$('#chemDrawCasNo').val('');
		$('#cdSearchDropdown').hide();
		cdIsOwner = true;
		fnShowChemDrawWin();
	};

	/* ═══════════════════════════════════════
	   Drag & Drop (리스트 카드 순서 변경 – transform 기반)
	   ═══════════════════════════════════════ */
	var cdDrag = { el:null, ghost:null, startX:0, startY:0, offsetX:0, offsetY:0,
		active:false, targetIdx:-1, origIdx:-1, slots:[], cards:[] };
	var cdDragJustEnded = false;

	$(document).on('mousedown', '.chemDrawCard', function(e) {
		if ($(e.target).closest('.btnDeleteChemDraw, .bookmarkBtn').length) return;
		if (e.button !== 0) return;
		var rect = this.getBoundingClientRect();
		cdDrag.el = this;
		cdDrag.startX = e.clientX;
		cdDrag.startY = e.clientY;
		cdDrag.offsetX = e.clientX - rect.left;
		cdDrag.offsetY = e.clientY - rect.top;
		cdDrag.active = false;
		cdDrag.targetIdx = -1;
	});

	$(document).on('mousemove', function(e) {
		if (!cdDrag.el) return;
		/* 임계값 – 6px 이상 움직여야 드래그 시작 */
		if (!cdDrag.active) {
			if (Math.abs(e.clientX - cdDrag.startX) < 6 && Math.abs(e.clientY - cdDrag.startY) < 6) return;
			cdDrag.active = true;
			$('body').addClass('cd-drag-active');
			/* 카드 위치(슬롯) 기록 – offsetLeft/Top 사용 (스크롤 영향 없음) */
			var allCards = $('#chemDrawGridList .chemDrawCard').toArray();
			cdDrag.cards = allCards;
			cdDrag.origIdx = allCards.indexOf(cdDrag.el);
			$(allCards).removeClass('animate__animated animate__flipInX cd-drop-anim').css({ transition:'none', transform:'' });
			cdDrag.slots = allCards.map(function(c) {
				return { left:c.offsetLeft, top:c.offsetTop, w:c.offsetWidth, h:c.offsetHeight };
			});
			/* 고스트 컨테이너 (CSS context 유지용) */
			if (!document.getElementById('cdGhostWrap')) {
				$('body').append('<div id="cdGhostWrap" class="h_grid_list" style="position:fixed;inset:0;overflow:visible;z-index:10000;pointer-events:none;padding:0;margin:0;display:block;"></div>');
			}
			/* 고스트 생성 – transform3d로 GPU 가속 */
			var $el = $(cdDrag.el);
			var vr = cdDrag.el.getBoundingClientRect();
			cdDrag.ghost = $el.clone()
				.removeClass('waves-effect waves-hColor cd-drop-anim animate__animated animate__flipInX')
				.addClass('cd-ghost')
				.css({ position:'fixed', width:vr.width, height:vr.height,
					left:0, top:0, margin:0, animation:'none',
					transform:'translate3d('+vr.left+'px,'+vr.top+'px,0) scale(1.03) rotate(1deg)' })
				.appendTo('#cdGhostWrap');
			/* 원본 숨김 (visibility:hidden → 레이아웃 공간 유지) */
			$el.css('visibility','hidden');
			/* 다른 카드 transition 활성화 (1프레임 후) */
			requestAnimationFrame(function() {
				cdDrag.cards.forEach(function(c) {
					if (c !== cdDrag.el) c.style.transition = 'transform 0.15s cubic-bezier(.2,0,0,1)';
				});
			});
		}
		e.preventDefault();
		/* 고스트 이동 (GPU 가속) */
		var gx = e.clientX - cdDrag.offsetX, gy = e.clientY - cdDrag.offsetY;
		cdDrag.ghost[0].style.transform = 'translate3d('+gx+'px,'+gy+'px,0) scale(1.03)';
		/* 고스트 위치 → 그리드 상대 좌표 */
		var grid = document.getElementById('chemDrawGridList');
		var gr = grid.getBoundingClientRect();
		var rx = gx - gr.left + grid.scrollLeft, ry = gy - gr.top + grid.scrollTop;
		var s0 = cdDrag.slots[cdDrag.origIdx];
		var cx = rx + s0.w/2, cy = ry + s0.h/2;
		/* 가장 가까운 슬롯 찾기 */
		var best = cdDrag.origIdx, bestD = 1e9;
		for (var i = 0; i < cdDrag.slots.length; i++) {
			var s = cdDrag.slots[i];
			var dx = cx - (s.left + s.w/2), dy = cy - (s.top + s.h/2);
			var d = dx*dx + dy*dy;
			if (d < bestD) { bestD = d; best = i; }
		}
		if (best !== cdDrag.targetIdx) {
			cdDrag.targetIdx = best;
			/* 카드 transform으로 빈자리(갭) 생성 – DOM 이동 없음 */
			var orig = cdDrag.origIdx, tgt = best;
			cdDrag.cards.forEach(function(c, i) {
				if (c === cdDrag.el) return;
				var vslot;
				if (orig < tgt) {
					vslot = (i > orig && i <= tgt) ? i - 1 : i;
				} else if (orig > tgt) {
					vslot = (i >= tgt && i < orig) ? i + 1 : i;
				} else {
					vslot = i;
				}
				if (vslot !== i) {
					var from = cdDrag.slots[i], to = cdDrag.slots[vslot];
					c.style.transform = 'translate('+(to.left - from.left)+'px,'+(to.top - from.top)+'px)';
				} else {
					c.style.transform = '';
				}
			});
		}
		/* 스크롤 컨테이너 가장자리 자동 스크롤 */
		var EDGE = 50, speed = 0;
		if (e.clientY < gr.top + EDGE) speed = -Math.round((EDGE - (e.clientY - gr.top)) / EDGE * 12);
		else if (e.clientY > gr.bottom - EDGE) speed = Math.round(((e.clientY - (gr.bottom - EDGE)) / EDGE) * 12);
		if (speed) grid.scrollTop += speed;
	});

	$(document).on('mouseup', function() {
		if (!cdDrag.el) return;
		if (cdDrag.active && cdDrag.ghost) {
			cdDrag.ghost.remove();
			var $el = $(cdDrag.el);
			/* 모든 카드 transform/transition 초기화 */
			$(cdDrag.cards).css({ transform:'', transition:'' });
			$el.css('visibility','');
			/* 실제 DOM 이동 (mouseup 시점에만) */
			var orig = cdDrag.origIdx, tgt = cdDrag.targetIdx;
			if (tgt !== -1 && tgt !== orig) {
				var ordered = cdDrag.cards.slice();
				var dragged = ordered.splice(orig, 1)[0];
				ordered.splice(tgt, 0, dragged);
				var grid = document.getElementById('chemDrawGridList');
				ordered.forEach(function(c) { grid.appendChild(c); });
			}
			/* 드롭 바운스 */
			$el.addClass('cd-drop-anim');
			setTimeout(function() { $el.removeClass('cd-drop-anim'); }, 350);
			$('body').removeClass('cd-drag-active');
			cdSyncLocalOrder();
			/* 드래그 직후 클릭 방지 */
			cdDragJustEnded = true;
			setTimeout(function() { cdDragJustEnded = false; }, 0);
		}
		cdDrag.el = null; cdDrag.ghost = null; cdDrag.active = false; cdDrag.targetIdx = -1;
	});

	function cdSyncLocalOrder() {
		var seqMap = {};
		var orderList = [];
		$('#chemDrawGridList .chemDrawCard').each(function(i) {
			var seq = $(this).attr('data-seq');
			seqMap[seq] = i;
			orderList.push({ SEQ_CHEMDRAW: seq, SORT: i });
		});
		chemDrawAllData.forEach(function(item) {
			var o = seqMap[String(item.SEQ_CHEMDRAW)];
			if (o !== undefined) item._sortOrder = o;
		});
		chemDrawAllData.sort(function(a, b) {
			return ((a._sortOrder !== undefined) ? a._sortOrder : 999999) - ((b._sortOrder !== undefined) ? b._sortOrder : 999999);
		});
		/* 서버에 순서 저장 */
		if (orderList.length > 0) {
			$.ajax({
				url: '/admin/popup/mergeChemDrawUserOrderAjax',
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify(orderList),
				error: function(xhr) { console.error('순서 저장 실패', xhr); }
			});
		}
	}

	/* ═══════════════════════════════════════
	   카드 프레넬 반사 효과 (Schlick's Fresnel approximation)
	   ═══════════════════════════════════════ */
	var R0 = 0.04;
	var lightIntensity = 8;
	document.addEventListener('mousemove', function(e) {
		if (!e.target || !e.target.closest) return;
		var item = e.target.closest('.h_grid_list .grid_list_item');
		if (!item) return;
		var rect = item.getBoundingClientRect();
		var x = (e.clientX - rect.left) / rect.width * 100;
		var y = (e.clientY - rect.top) / rect.height * 100;
		var nx = (x - 50) / 50;
		var ny = (y - 50) / 50;
		var dist = Math.min(Math.sqrt(nx * nx + ny * ny), 1);
		var cosTheta = 1 - dist;
		var fresnel = R0 + (1 - R0) * Math.pow(1 - cosTheta, 5);
		var reflected = Math.min(fresnel * lightIntensity, 1);
		var specSize = 15 + dist * 35;
		var specIntensity = Math.min(0.4 + reflected * 0.6, 1);
		var edgeGlow = reflected * 0.7;
		var maxTilt = 3;
		var tiltY = nx * maxTilt;
		var tiltX = -ny * maxTilt;
		var caIntensity = Math.pow(dist, 3) * 0.25;
		var lightAngle = Math.atan2(ny, nx) * (180 / Math.PI);
		item.style.setProperty('--light-x', x + '%');
		item.style.setProperty('--light-y', y + '%');
		item.style.setProperty('--fresnel', fresnel.toFixed(3));
		item.style.setProperty('--spec-size', specSize + '%');
		item.style.setProperty('--spec-intensity', specIntensity.toFixed(3));
		item.style.setProperty('--edge-glow', edgeGlow.toFixed(3));
		item.style.setProperty('--ca-intensity', caIntensity.toFixed(3));
		item.style.setProperty('--light-angle', lightAngle.toFixed(1) + 'deg');
		item.style.transition = 'transform 0.08s ease-out';
		item.style.transform = 'perspective(600px) rotateX(' + tiltX.toFixed(2) + 'deg) rotateY(' + tiltY.toFixed(2) + 'deg) scale(1.03)';
	});
	document.addEventListener('mouseleave', function(e) {
		if (!e.target || !e.target.closest) return;
		var item = e.target.closest('.h_grid_list .grid_list_item');
		if (!item) return;
		if (e.relatedTarget && item.contains(e.relatedTarget)) return;
		item.style.transition = 'transform 0.4s ease-out';
		item.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
		item.style.setProperty('--spec-intensity', '0');
		item.style.setProperty('--edge-glow', '0');
		item.style.setProperty('--ca-intensity', '0');
		var cleanup = function() {
			item.style.removeProperty('--light-x');
			item.style.removeProperty('--light-y');
			item.style.removeProperty('--fresnel');
			item.style.removeProperty('--spec-size');
			item.style.removeProperty('--spec-intensity');
			item.style.removeProperty('--edge-glow');
			item.style.removeProperty('--ca-intensity');
			item.style.removeProperty('--light-angle');
			item.style.transform = '';
			item.style.transition = '';
			item.removeEventListener('transitionend', cleanup);
		};
		item.addEventListener('transitionend', cleanup);
	}, true);

	/* flipInX 애니메이션 끝나면 클래스 제거
	   (animation-fill-mode: forwards 가 transform 을 잡고 있어서 3D 틸트 차단됨) */
	document.getElementById('chemDrawGridList').addEventListener('animationend', function(e) {
		var card = e.target.closest('.grid_list_item');
		if (card) card.classList.remove('animate__animated', 'animate__flipInX');
	});

	/* ═══════════════════════════════════════
	   Document Ready
	   ═══════════════════════════════════════ */
	$(document).ready(function() {
		$(".btn-pop-close").on("click", function() { window.close(); });
		cdRenderElementSlots();
		fnLoadChemDrawList();
	});

	$(document).on('click', '.chemDrawCard', function(e) {
		if (cdDragJustEnded) return;
		if ($(e.target).closest('.btnDeleteChemDraw').length) return;
		if ($(e.target).closest('.bookmarkBtn').length) return;
		$('#SEQ_CHEMDRAW').val($(this).attr('data-seq'));
		cdIsOwner = ($(this).attr('data-is-owner') === 'Y');
		fnShowChemDrawWin();
	});

	$(document).on('click', '.btnDeleteChemDraw', function(e) {
		e.stopPropagation();
		var seq = $(this).attr('data-seq');
		if (!confirm('삭제하시겠습니까?')) return;
		$.ajax({
			url: '/admin/popup/deleteChemDrawAjax',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({ SEQ_CHEMDRAW: seq }),
			success: function(res) {
				M.toast({ html: '삭제되었습니다.', classes: 'cd-toast-glass' });
				fnLoadChemDrawList();
			},
			error: function() {
				M.toast({ html: '삭제 실패', classes: 'cd-toast-glass cd-toast-error' });
			}
		});
	});

	$(document).on("click", "#fmlChemDrawWin .close", function() {
		resetAiChat();
		var modal = document.getElementById('fmlChemDrawWin');
		closeModal(modal);
	});
	

	/* ═══════════════════════════════════════
	   Ripple Effect (클릭 위치 기반)
	   ═══════════════════════════════════════ */
	$(document).on('click', '.waves-effect', function(e) {
		var el = this;
		var rect = el.getBoundingClientRect();
		var size = Math.max(rect.width, rect.height) * 2;
		var ripple = document.createElement('span');
		ripple.className = 'waves-ripple';
		ripple.style.width = ripple.style.height = size + 'px';
		ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
		ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
		el.appendChild(ripple);
		ripple.addEventListener('animationend', function() { ripple.remove(); });
	});

	/* ═══════════════════════════════════════
	   ToolsArea Specular Highlight
	   ═══════════════════════════════════════ */
	(function() {
		var toolsArea = document.getElementById('chemDrawToolsArea');
		if (!toolsArea) return;
		toolsArea.addEventListener('mousemove', function(e) {
			var rect = toolsArea.getBoundingClientRect();
			var x = ((e.clientX - rect.left) / rect.width * 100);
			var y = ((e.clientY - rect.top) / rect.height * 100);
			toolsArea.style.setProperty('--tools-light-x', x + '%');
			toolsArea.style.setProperty('--tools-light-y', y + '%');
		});
		toolsArea.addEventListener('mouseleave', function() {
			toolsArea.style.setProperty('--tools-light-x', '-100%');
			toolsArea.style.setProperty('--tools-light-y', '50%');
		});
	})();

	console.log('[ChemDraw] IIFE completed successfully. fnOpenNewChemDraw:', typeof window.fnOpenNewChemDraw);
})();
</script>

