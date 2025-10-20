const svg = d3.select(".nodeChart svg");
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
    const text = gsel.append("text")
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(d.data.name);

    gsel.insert("rect", "text")
      .attr("rx", 6);

    measureAndBox(gsel);
  });
}

// 텍스트 bbox로 rect 크기 갱신
function measureAndBox(selection, padX = 8, padY = 6) {
  selection.each(function (d) {
    const gsel = d3.select(this);
    const text = gsel.select("text");
    if (text.empty()) return;

    const bbox = text.node().getBBox();
    d.bbox = bbox;

    const w = bbox.width + padX * 2;
    const h = bbox.height + padY * 2;

    gsel.select("rect")
      .attr("x", -w / 2)
      .attr("y", -h / 2)
      .attr("width", w)
      .attr("height", h);
  });
}

// 컨텐츠 경계 계산 → viewBox 중앙정렬
function centerByViewBox(pad = 24) {
  if (!g) return;
  measureAndBox(g.selectAll(".node"));

  const padX = 8, padY = 6;
  const dataNodes = g.selectAll(".node").data();
  if (!dataNodes || !dataNodes.length) return;

  const rectOf = (d) => {
    const x = d.x + ((d.bbox?.y ?? -padY) - padY);
    const y = d.y + ((d.bbox?.x ?? -padX) - padX);
    const w = (d.bbox?.width ?? 0) + padX * 2;
    const h = (d.bbox?.height ?? 0) + padY * 2;
    return { left: y, right: y + w, top: x, bottom: x + h };
  };

  const xs = dataNodes.map(rectOf);
  const xMin = d3.min(xs, r => r.top);
  const xMax = d3.max(xs, r => r.bottom);
  const yMin = d3.min(xs, r => r.left);
  const yMax = d3.max(xs, r => r.right);

  const vbX = yMin - pad;
  const vbY = xMin - pad;
  const vbW = (yMax - yMin) + 2 * pad;
  const vbH = (xMax - xMin) + 2 * pad;

  svg.attr("viewBox", `${vbX} ${vbY} ${vbW} ${vbH}`)
     .attr("preserveAspectRatio", "xMidYMid meet");
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
  const container = document.querySelector('.nodeChart');
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