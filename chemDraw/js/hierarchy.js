const getTierText = (depth) => TIER_LABELS[depth] ?? `Depth ${depth}`;


// (선택) 단계별 간격을 다르게 주고 싶으면 사용
const GAP_BY_DEPTH = [10, 9, 8, 8]; // 0,1,2,3 깊이별 gap
const getTierGap = (depth, def = 8) => GAP_BY_DEPTH[depth] ?? def;
//Fail Modem, Fail Effect, Fail Cause, Current Control

const svg = d3.select(".nodeChart svg");  // ← 여기로
let g = null;        // 매 오픈 때 새로 만듦
let ro = null;       // ResizeObserver
let centeredOnce = false;

// 레이아웃/링크
const treeLayout = d3.tree()
  .nodeSize([36, 220])
  .separation((a, b) => (a.parent === b.parent ? 1.4 : 2.0));

const linkGen = d3.linkHorizontal()
  .x(d => d.y)
  .y(d => d.x);

// 노드 도형(텍스트 + 박스)
function drawNode(selection) {
  selection.each(function (d) {
    const gsel = d3.select(this);

    // 본문 라벨
    gsel.append("text")
      .attr("class", "label")
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(d.data.name);

    // 본문 박스
    gsel.insert("rect", "text")
      .attr("class", "hier-line")
      .attr("rx", 6);

    // ---- 단계 라벨(텍스트+박스) 묶는 그룹 ----
    const tierG = gsel.append("g").attr("class", "tier-wrap");

    tierG.append("rect")
      .attr("class", `tier-box tier-box${d.depth + 1}`);

    tierG.append("text")
      .attr("class", "tier-text")   // ← 기존 .tier 대신 .tier-text 사용
      .attr("text-anchor", "start")
      .text(getTierText(d.depth));

    measureAndBox(gsel);
  });
}


// 텍스트 bbox로 rect 크기 갱신
function measureAndBox(selection, padX_base = 10, padY_base = 4) {
  selection.each(function (d) {
    const gsel = d3.select(this);
    const label = gsel.select("text.label");
    if (label.empty()) return;

    const lb = label.node().getBBox();
    const w = lb.width + padX_base * 2;
    const h = lb.height + padY_base * 2;

    gsel.select("rect.hier-line")
      .attr("x", -w/2).attr("y", -h/2)
      .attr("width", w).attr("height", h);

    const tierG = gsel.select(".tier-wrap");
    if (tierG.empty()) return;

    const gap = getTierGap?.(d.depth, 8) ?? 8;
    const H_OVERLAP = 0;
    const V_OVERLAP = 6;
    const tierY = -h/2 - gap + V_OVERLAP;
    const rectLeft = -w/2 + H_OVERLAP;

    const t = tierG.select("text.tier-text")
      .attr("x", 0)
      .attr("y", 0)

      .attr("dominant-baseline", "middle")
      .node();

    // ---- 타이트 패딩 설정 ----
    const fs = parseFloat(getComputedStyle(t).fontSize) || 9;

    // 기존보다 확 줄이기 (거의 딱 맞게)
    const padX = 2;                       // ← 좌우 패딩 거의 없음
    const padY = Math.max(1, Math.round(fs * 0.10)); // ← 상하 패딩 매우 작게
    const extra = 0;                      // ← 여분 제거
    const minW = 0;                       // ← 최소너비 제한 제거
    const rx   = Math.round(fs * 0.5);    // 둥근 모서리(선택)

    // 텍스트 길이
    const textLen = t.getComputedTextLength ? t.getComputedTextLength() : t.getBBox().width;

    // 박스 크기 = 텍스트 + 아주 작은 패딩
    const rW = Math.max(Math.ceil(textLen) + 2*padX + extra, minW);
    const rH = Math.ceil(t.getBBox().height) + 2*padY + extra;

    tierG.select("rect.tier-box")
      .attr("x", 0)
      .attr("y", -(rH/2))   // 텍스트를 middle로 두었으니 중앙 기준 배치
      .attr("width", rW)
      .attr("height", rH)
      .attr("rx", rx);

    // 텍스트는 좌측 패딩만큼 오른쪽으로
    d3.select(t).attr("x", padX);

    tierG.attr("transform", `translate(${rectLeft},${tierY})`);
  });
}




// 컨텐츠 경계 계산 → viewBox 중앙정렬
function centerByViewBox(pad = 24) {
  if (!g) return;

  // 최신 bbox 반영 (라벨/뱃지 크기 확정)
  measureAndBox(g.selectAll(".node"));

  const nodesSel = g.selectAll(".node");
  if (nodesSel.size() === 0) return;

  let xMin = +Infinity, xMax = -Infinity, yMin = +Infinity, yMax = -Infinity;

  // 각 노드(<g class="node">)의 그룹 bbox를 사용
  nodesSel.each(function(d){
    const bb = this.getBBox();  // 해당 그룹(라벨+박스+뱃지 포함) local bbox
    // 현재 transform은 translate(d.y, d.x) 이므로 전역 좌표는 +d.y / +d.x
    const left   = d.y + bb.x;
    const right  = d.y + bb.x + bb.width;
    const top    = d.x + bb.y;
    const bottom = d.x + bb.y + bb.height;

    if (left   < yMin) yMin = left;
    if (right  > yMax) yMax = right;
    if (top    < xMin) xMin = top;
    if (bottom > xMax) xMax = bottom;
  });

  // 사방 패딩 지원 (숫자 또는 객체)
  const P = (typeof pad === "number")
    ? { left: pad, right: pad, top: pad, bottom: pad }
    : { left: pad.left ?? 24, right: pad.right ?? 24, top: pad.top ?? 24, bottom: pad.bottom ?? 24 };

  // 선(stroke) 여유 +1~2px 추가
  const strokePad = 2;

  const vbX = Math.floor(yMin) - P.left - strokePad;
  const vbY = Math.floor(xMin) - P.top - strokePad;
  const vbW = Math.ceil(yMax - yMin) + P.left + P.right + strokePad * 2;
  const vbH = Math.ceil(xMax - xMin) + P.top + P.bottom + strokePad * 2;

  svg
    .attr("viewBox", `${vbX} ${vbY} ${vbW} ${vbH}`)
    .attr("preserveAspectRatio", "xMidYMid meet"); // 전체가 보이게(잘림 방지)
}


// 간단 드래그(개별 노드만 이동)
const drag = d3.drag()
  .on("start", function (event, d) {
    d3.select(this).raise().classed("dragging", true);
  })
  .on("drag", function (event, d) {
    d.x += event.dy;
    d.y += event.dx;

    // 노드 이동
    d3.select(this).attr("transform", `translate(${d.y},${d.x})`);

    // 링크 업데이트
    if (!g) return;
    g.selectAll(".link").attr("d", l => linkGen({
      source: { x: l.source.x, y: l.source.y },
      target: { x: l.target.x, y: l.target.y }
    }));
  })
  .on("end", function () {
    d3.select(this).classed("dragging", false);
  });

// 디바운스
function debounce(fn, wait = 150) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
function buildTree() {
  svg.selectAll("*").remove();
  svg.attr("viewBox", null).attr("preserveAspectRatio", null);
  centeredOnce = false;

  g = svg.append("g");

  const root = d3.hierarchy(data);
  treeLayout(root);
  root.each(d => { d.x0 = root.x; d.y0 = 0; });

  const links = g.selectAll(".link").data(root.links(), d => d.target.data.name);
  const nodes = g.selectAll(".node").data(root.descendants(), d => d.data.name);

  const linkEnter = links.enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d => linkGen({
      source: { x: d.source.x0, y: d.source.y0 },
      target: { x: d.source.x0, y: d.source.y0 }
    }));

  const nodeEnter = nodes.enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.y0},${d.x0})`)
    .style("opacity", 0);

  drawNode(nodeEnter);

  // ✅ ① 그린 직후 1회 중앙 맞춤(초기 깜빡임/잘림 방지)
  centerByViewBox(24);


  const reveal = d3.transition().duration(900).ease(d3.easeCubicOut);

  linkEnter.transition(reveal).attrTween("d", function (d) {
    const sx = d3.interpolateNumber(d.source.x0, d.source.x);
    const sy = d3.interpolateNumber(d.source.y0, d.source.y);
    const tx = d3.interpolateNumber(d.target.x0, d.target.x);
    const ty = d3.interpolateNumber(d.target.y0, d.target.y);
    return t => linkGen({
      source: { x: sx(t), y: sy(t) },
      target: { x: tx(t), y: ty(t) }
    });
  });

  nodeEnter.transition(reveal)
    .attr("transform", d => `translate(${d.y},${d.x})`)
    .style("opacity", 1);

  nodeEnter.call(drag);

  // ✅ ② 전개 끝난 뒤 1번 더(폰트 로드 등으로 bbox 변동 흡수)
  reveal.on("end", () => {
    if (!centeredOnce) {
      centeredOnce = true;
      // 폰트 적용/텍스트 렌더 안정화를 위해 한 프레임 뒤 실행
      requestAnimationFrame(() => centerByViewBox(24));

    }
  });

  // ✅ ③ 모달/컨테이너 리사이즈 대응
  const container = document.querySelector('#HierarchyViewModal .nodeChart');
  if (container) {
    if (ro) ro.disconnect();
    ro = new ResizeObserver(debounce(() => centerByViewBox(24), 150));
    ro.observe(container);
  }
}

// 해제(모달 닫힐 때 호출)
function teardown() {
  if (ro) { ro.disconnect(); ro = null; }
  svg.selectAll("*").remove();
  svg.attr("viewBox", null).attr("preserveAspectRatio", null);
  g = null;
  centeredOnce = false;
}