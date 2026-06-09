(function($) {
	const D3G = {
		svg: null,
		g: null,
		zoom: null,
		ro: null,
		data: null,
		root: null,
		treeLayout: null,
		linkGen: null,
		tooltipEl: null,
		config: {
			width: '100%',
			height: null,
			nodeSize: [40, 220],
			padding: 24,
			tierLabels: ["Mode", "Effect", "Cause", "Control"],
			gapByDepth: [10, 9, 8, 8]
		}
	};

	// --- 노드 고정 크기 상수 ---
	const NODE_WIDTH        = 180;   // 노드 고정 너비 (px)
	const NODE_HEIGHT       = 28;    // 노드 고정 높이 (px)
	const NODE_TEXT_PADDING = 16;    // 텍스트 좌우 여백 합계 (px)

	// --- 내부 비공개 함수들 ---
	const getTierText = (depth) => D3G.config.tierLabels[depth] ?? `Depth ${depth}`;
	const getTierGap = (depth) => D3G.config.gapByDepth[depth] ?? 8;

	// --- 커스텀 툴팁 헬퍼 ---
	function showTooltip(text, event) {
		const tip = D3G.tooltipEl;
		if (!tip) return;
		tip.textContent = text;
		tip.classList.add('is-on');
		moveTooltip(event);
	}

	function moveTooltip(event) {
		const tip = D3G.tooltipEl;
		if (!tip) return;
		const OFFSET = 12;
		let x = event.pageX + OFFSET;
		let y = event.pageY + OFFSET;

		const rect = tip.getBoundingClientRect();
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		if (x + rect.width > vw)  x = event.pageX - rect.width - OFFSET;
		if (y + rect.height > vh) y = event.pageY - rect.height - OFFSET;

		tip.style.left = x + 'px';
		tip.style.top  = y + 'px';
	}

	function hideTooltip() {
		if (D3G.tooltipEl) D3G.tooltipEl.classList.remove('is-on');
	}

	// 텍스트 말줄임 처리 (이진 탐색, O(log n))
	function truncateText(textEl, maxWidth, fullText) {
		textEl.text(fullText);
		if (textEl.node().getComputedTextLength() <= maxWidth) return false;

		let lo = 0, hi = fullText.length;
		while (lo < hi) {
			const mid = Math.ceil((lo + hi) / 2);
			textEl.text(fullText.slice(0, mid) + "...");
			if (textEl.node().getComputedTextLength() <= maxWidth) {
				lo = mid;
			} else {
				hi = mid - 1;
			}
		}
		textEl.text(fullText.slice(0, lo) + "...");
		return true;
	}

	function measureAndBox($nodeSelection) {
		$nodeSelection.each(function(d) {
			const gsel = d3.select(this);
			const label = gsel.select("text.label");
			if (label.empty()) return;

			// 노드 고정 크기 적용
			const w = NODE_WIDTH;
			const h = NODE_HEIGHT;

			gsel.select("rect.hier-line")
				.attr("x", -w / 2).attr("y", -h / 2)
				.attr("width", w).attr("height", h);

			// 텍스트 말줄임 처리 + 커스텀 툴팁 플래그
			const fullText = d.data.name;
			const maxTextW = w - NODE_TEXT_PADDING;
			d._truncated = truncateText(label, maxTextW, fullText);
			gsel.select("title").remove();

			// Tier 라벨 위치 (고정 높이 기반)
			const tierG = gsel.select(".tier-wrap");
			if (tierG.empty()) return;

			const tierY = -h / 2 - getTierGap(d.depth) + 6;
			const t = tierG.select("text.tier-text").node();
			const fs = parseFloat(getComputedStyle(t).fontSize) || 9;
			const textLen = t.getComputedTextLength ? t.getComputedTextLength() : t.getBBox().width;

			const rW = Math.ceil(textLen) + 4;
			const rH = Math.ceil(t.getBBox().height) + (fs * 0.2);

			tierG.select("rect.tier-box").attr("y", -(rH / 2)).attr("width", rW).attr("height", rH).attr("rx", fs * 0.5);
			d3.select(t).attr("x", 2);
			tierG.attr("transform", `translate(${-w / 2},${tierY})`);
		});
	}

	function centerByViewBox(pad = 24) {
		if (!D3G.g) return;
		measureAndBox(D3G.g.selectAll(".node"));

		const nodesSel = D3G.g.selectAll(".node");
		if (nodesSel.size() === 0) return;

		let xMin = +Infinity, xMax = -Infinity, yMin = +Infinity, yMax = -Infinity;
		nodesSel.each(function(d) {
			const bb = this.getBBox();
			const left = d.y + bb.x, right = d.y + bb.x + bb.width;
			const top = d.x + bb.y, bottom = d.x + bb.y + bb.height;
			if (left < yMin) yMin = left; if (right > yMax) yMax = right;
			if (top < xMin) xMin = top; if (bottom > xMax) xMax = bottom;
		});

		D3G.svg.attr("viewBox", `${yMin - pad} ${xMin - pad} ${yMax - yMin + pad * 2} ${xMax - xMin + pad * 2}`);

		// Zoom/Pan 상태를 초기(identity)로 리셋하여 viewBox 재계산과의 충돌 방지
		if (D3G.zoom) {
			D3G.svg.call(D3G.zoom.transform, d3.zoomIdentity);
		}
	}

	// 노드 드래그: container를 D3G.g로 지정하여 zoom 배율에 관계없이 정확한 좌표 계산
	const drag = d3.drag()
		.container(function() { return D3G.g?.node() || this.ownerSVGElement; })
		.on("start", function() { hideTooltip(); d3.select(this).raise().classed("dragging", true); })
		.on("drag", function(event, d) {
			d.x += event.dy; d.y += event.dx;
			d3.select(this).attr("transform", `translate(${d.y},${d.x})`);
			D3G.g.selectAll(".link").attr("d", l => D3G.linkGen({
				source: { x: l.source.x, y: l.source.y },
				target: { x: l.target.x, y: l.target.y }
			}));
		})
		.on("end", function() { d3.select(this).classed("dragging", false); });

	// --- 플러그인 본체 ---
	$.fn.d3graph = function(options) {
		if (typeof options === 'string') {

			// 1. 초기화 (init)
			if (options === 'init') {
				const initOption = arguments[1] || {};
				$.extend(D3G.config, initOption);

				// 기존 요소 제거 후 새로 생성
				this.empty();

				// SVG 직접 생성 및 크기 부여
				D3G.svg = d3.select(this.get(0))
					.append('svg')
					.attr('width', D3G.config.width)
					.attr('height', D3G.config.height)
					.attr('class', 'd3graph-svg')
					.style('touch-action', 'none');  // 터치 디바이스에서 브라우저 기본 제스처 방지

				D3G.g = D3G.svg.append("g");

				// 커스텀 툴팁 싱글톤 생성
				if (!D3G.tooltipEl) {
					D3G.tooltipEl = document.createElement('div');
					D3G.tooltipEl.classList.add('d3-node-tooltip');
					document.body.appendChild(D3G.tooltipEl);
				}

				// Zoom/Pan 초기화: SVG에 이벤트 바인딩 → <g> transform 적용
				D3G.zoom = d3.zoom()
					.scaleExtent([0.3, 4])
					.on("start", (event) => {
						if (event.sourceEvent && event.sourceEvent.type === "mousedown") {
							D3G.svg.classed("grabbing", true);
						}
					})
					.on("zoom", (event) => {
						D3G.g.attr("transform", event.transform);
					})
					.on("end", () => {
						D3G.svg.classed("grabbing", false);
					});
				D3G.svg.call(D3G.zoom)
					.on("dblclick.zoom", null);  // 더블클릭 줌 비활성화 (의도치 않은 줌 방지)

				D3G.treeLayout = d3.tree().nodeSize(D3G.config.nodeSize).separation((a, b) => (a.parent === b.parent ? 1.4 : 2.0));
				D3G.linkGen = d3.linkHorizontal().x(d => d.y).y(d => d.x);

				// 리사이즈 감시 (ResizeObserver 활용)
				if (D3G.ro) D3G.ro.disconnect();
				D3G.ro = new ResizeObserver(() => centerByViewBox(D3G.config.padding));
				D3G.ro.observe(this.get(0));

				return this;
			}

			if(options === 'setNoData') {
				this.d3graph("destroy");
				D3G.svg = d3.select(this.get(0))
					.append('svg')
					.attr('width', D3G.config.width)
					.attr('height', D3G.config.height)
					.attr('class', 'd3graph-svg');

				D3G.g = D3G.svg.append("g");
				const bgColor = getComputedStyle(document.documentElement).getPropertyValue("--main-background-color").trim() || "#f0f0f0";

				D3G.g.append("rect")
					.attr("fill", bgColor)
					.attr("rx", 5)
					.attr("ry", 5)
					.attr("width", "100%")
					.attr("height", "100%");
				D3G.g.append("text")
					.attr("x", "50%")
					.attr("y", "50%")
					.attr("text-anchor", "middle")
					.attr("dominant-baseline", "middle")
					.text(_msg["cm_nodata"] || "No Data");

				return this;
			}

			// 2. 데이터 세팅 및 그리기 (setData)
			if (options === 'setData') {
				D3G.data = arguments[1];
				if (!D3G.data || Object.keys(D3G.data).length == 0) {
					this.d3graph("destroy");
					this.d3graph('setNoData');
					return;
				};

				this.d3graph("init");

				D3G.root = d3.hierarchy(D3G.data);
				D3G.treeLayout(D3G.root);
				D3G.root.each(d => { d.x0 = D3G.root.x; d.y0 = 0; });

				const linkEnter = D3G.g.selectAll(".link").data(D3G.root.links()).enter()
					.append("path").attr("class", "link")
					.attr("d", d => D3G.linkGen({ source: { x: d.source.x0, y: d.source.y0 }, target: { x: d.source.x0, y: d.source.y0 } }));

				const nodeEnter = D3G.g.selectAll(".node").data(D3G.root.descendants()).enter()
					.append("g").attr("class", "node").attr("transform", d => `translate(${d.y0},${d.x0})`)
					.style("opacity", 0).call(drag);

				nodeEnter
					.on("mouseenter", function(event, d) {
						if (d._truncated) showTooltip(d.data.name, event);
					})
					.on("mousemove", function(event) {
						moveTooltip(event);
					})
					.on("mouseleave", function() {
						hideTooltip();
					});

				nodeEnter.each(function(d) {
					const gsel = d3.select(this);
					gsel.append("text").attr("class", "label").attr("dy", "0.35em").attr("text-anchor", "middle").text(d.data.name);
					gsel.insert("rect", "text").attr("class", "hier-line").attr("rx", 6);
					const tierG = gsel.append("g").attr("class", "tier-wrap");
					tierG.append("rect").attr("class", `tier-box tier-box${d.depth + 1}`);
					tierG.append("text").attr("class", "tier-text").attr("text-anchor", "start").attr("dominant-baseline", "middle").text(getTierText(d.depth));
				});

				centerByViewBox(D3G.config.padding);

				const reveal = d3.transition().duration(900).ease(d3.easeCubicOut);
				linkEnter.transition(reveal).attrTween("d", function(d) {
					const sx = d3.interpolateNumber(d.source.x0, d.source.x), sy = d3.interpolateNumber(d.source.y0, d.source.y);
					const tx = d3.interpolateNumber(d.target.x0, d.target.x), ty = d3.interpolateNumber(d.target.y0, d.target.y);
					return t => D3G.linkGen({ source: { x: sx(t), y: sy(t) }, target: { x: tx(t), y: ty(t) } });
				});

				nodeEnter.transition(reveal).attr("transform", d => `translate(${d.y},${d.x})`).style("opacity", 1);

				return D3G.root.descendants().length;
			}

			// 3. 리셋
			if (options === 'destroy') {
				this.empty();
				if (D3G.ro) D3G.ro.disconnect();
				if (D3G.tooltipEl) {
					D3G.tooltipEl.remove();
					D3G.tooltipEl = null;
				}
				D3G.zoom = null;
				return this;
			}

			// 4. FMEA 트리 렌더링 (renderFmeaTree)
			// stepData = { mstList: [...], dtlList: [...] }, fmeaType = "D" | "P"
			if (options === 'renderFmeaTree') {
				const TIER_LABEL_MAP = {
					D: {
						single: ["Next lower level", "Next lower-level func", "Failure effect", "Failure mode", "Failure cause"],
						multi:  ["Focus element", "Next lower level", "Next lower-level func", "Failure effect", "Failure mode", "Failure cause"]
					},
					P: {
						single: ["Process step", "Process step func.", "Failure effect", "Failure mode", "Failure cause"],
						multi:  ["Process item", "Process step", "Process step func.", "Failure effect", "Failure mode", "Failure cause"]
					}
				};

				const stepData = arguments[1];
				const rawType = (arguments[2] ?? "").toString().trim().toUpperCase();
				const fmeaType = rawType.startsWith("P") ? "P" : "D";
				const mstList = stepData?.mstList || [];
				const dtlList = stepData?.dtlList || [];

				if (mstList.length === 0) {
					this.d3graph("setNoData");
					return this;
				}

				const nvl = (v) => (typeof au !== 'undefined' ? au.NVL(v) : v) || "-";

				// 고장분석 트리 구성 (Effect → Mode → Cause)
				function buildFailureTree(mstId) {
					const effectMap = new Map();
					dtlList.filter(d => d.mstId == mstId).forEach(dtl => {
						const eff = nvl(dtl.failriskEffect);
						const mode = nvl(dtl.failriskMode);
						const cause = nvl(dtl.failriskCause);
						if (!effectMap.has(eff)) effectMap.set(eff, new Map());
						const modeMap = effectMap.get(eff);
						if (!modeMap.has(mode)) modeMap.set(mode, new Set());
						modeMap.get(mode).add(cause);
					});
					const nodes = [];
					effectMap.forEach((modeMap, effName) => {
						const effNode = { name: effName, children: [] };
						modeMap.forEach((causeSet, modeName) => {
							const modeNode = { name: modeName, children: [] };
							causeSet.forEach(causeName => { modeNode.children.push({ name: causeName }); });
							effNode.children.push(modeNode);
						});
						nodes.push(effNode);
					});
					return nodes;
				}

				// DFMEA: struct_3 → func_3 → effect → mode → cause
				// PFMEA: struct_2 (Process Step) → func_2 (Process Step Func.) → effect → mode → cause
				const stepNodes = mstList.map(mst => {
					const failureNodes = buildFailureTree(mst.mstId);
					if (fmeaType === "P") {
						const funcNode = { name: nvl(mst.func2), children: failureNodes };
						return { name: nvl(mst.struct2), children: [funcNode] };
					} else {
						const funcNode = { name: nvl(mst.func3), children: failureNodes };
						return { name: nvl(mst.struct3), children: [funcNode] };
					}
				});

				const labelSet = TIER_LABEL_MAP[fmeaType] || TIER_LABEL_MAP["D"];
				let graphData, tierLabels;

				if (stepNodes.length === 1) {
					graphData = stepNodes[0];
					tierLabels = labelSet.single;
				} else {
					// DFMEA: struct_2 (Focus Element)로 묶기 / PFMEA: struct_1 (Process Item)로 묶기
					const wrapperName = fmeaType === "P" ? nvl(mstList[0]?.struct1) : nvl(mstList[0]?.struct2);
					graphData = {
						name: wrapperName,
						children: stepNodes
					};
					tierLabels = labelSet.multi;
				}

				this.d3graph("init", { tierLabels, padding: 24 });
				this.d3graph("setData", graphData);
				return this;
			}

			// 5. Root 노드를 가시 영역 좌측·Y축 중앙에 확대 배치 (opt-in 호출 전용)
			if (options === 'centerRoot') {
				const svgNode = D3G.svg?.node();
				if (!svgNode || !D3G.root || !D3G.zoom) return this;

				const containerEl = svgNode.parentNode;

				// --- 초기 렌더링 설정 상수 ---
				const MODAL_VISIBLE_HEIGHT = 650;              // 모달 가시 높이 (700px - header 50px)
				const TARGET_CENTER_Y     = MODAL_VISIBLE_HEIGHT / 2; // 325px
				const INITIAL_SCALE       = 0.8;               // 초기 확대 배율
				const INITIAL_MARGIN_LEFT = 100;                // 좌측 여백 (px)

				// ResizeObserver 중단 (모달은 고정 크기이므로 재연결 불필요, destroy 시 정리됨)
				if (D3G.ro) D3G.ro.disconnect();

				// viewBox → SVG 고정 크기 전환 (zoom transform으로 배치를 직접 제어)
				const containerW = containerEl.clientWidth || 800;
				D3G.svg
					.attr("viewBox", null)
					.attr("width", containerW)
					.attr("height", MODAL_VISIBLE_HEIGHT);

				// Root 좌표 (D3 tree nodeSize 기반: root.y=수평, root.x=수직, 보통 둘 다 0)
				const rootY = D3G.root.y || 0;
				const rootX = D3G.root.x || 0;

				// translate 계산: 데이터(px,py) → 화면 = (px * k + tx, py * k + ty)
				const k  = INITIAL_SCALE;
				const tx = INITIAL_MARGIN_LEFT - rootY * k;    // root를 좌측 여백 위치에
				const ty = TARGET_CENTER_Y    - rootX * k;     // root를 Y축 325px에

				D3G.svg.call(D3G.zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(k));

				return this;
			}
		}
		return this;
	};
})(jQuery);
