/* MAPIS ELN — Reaction 모듈 엔진(분자식 파싱·분자량·원자 수지·화학량론 계산·반응식 SVG/PNG).
   계산 함수(parseFormula·formulaWeight·balance·compute)는 DOM 을 쓰지 않는 순수 함수 → node 에서도 그대로 시험 가능.
   DOM 을 쓰는 것은 schemeSvg(DOMParser·글자 폭 측정)·toPng(Image·canvas) 둘뿐. 화면 표시 형식(소수 자리)은 UI(eln_proto_simple.js) 몫. */
(function (root) {
  'use strict';

  /* ── 원자량 표 — ChemStudio(apis-boot-chemguest static/js/chem/chemstudio-core.js 138~152줄)에서 그대로 옮김.
     같은 숫자를 써야 노트의 MW 가 ChemStudio 화면의 분자량과 맞는다(IUPAC 관용값, 방사성 원소는 최장수명 동위원소 질량수) ── */
  var SYMBOLS = ' H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
  var WEIGHTS = [0, 1.008, 4.0026, 6.94, 9.0122, 10.81, 12.011, 14.007, 15.999, 18.998, 20.180, 22.990, 24.305, 26.982, 28.085, 30.974, 32.06, 35.45, 39.948, 39.098, 40.078,
    44.956, 47.867, 50.942, 51.996, 54.938, 55.845, 58.933, 58.693, 63.546, 65.38, 69.723, 72.630, 74.922, 78.971, 79.904, 83.798, 85.468, 87.62, 88.906, 91.224,
    92.906, 95.95, 98, 101.07, 102.91, 106.42, 107.87, 112.41, 114.82, 118.71, 121.76, 127.60, 126.90, 131.29, 132.91, 137.33, 138.91, 140.12, 140.91, 144.24,
    145, 150.36, 151.96, 157.25, 158.93, 162.50, 164.93, 167.26, 168.93, 173.05, 174.97, 178.49, 180.95, 183.84, 186.21, 190.23, 192.22, 195.08, 196.97, 200.59,
    204.38, 207.2, 208.98, 209, 210, 222, 223, 226, 227, 232.04, 231.04, 238.03, 237, 244, 243, 247, 247, 251, 252, 257, 258, 259, 266, 267, 268, 269, 270, 269,
    278, 281, 282, 285, 286, 289, 290, 293, 294, 294];
  var WEIGHT_BY_SYMBOL = SYMBOLS.reduce(function (map, symbol, z) { if (symbol) map[symbol] = WEIGHTS[z]; return map; }, { D: 2.014, T: 3.016 });

  function addCounts(into, from, times) { for (var el in from) into[el] = (into[el] || 0) + from[el] * times; }

  /* 분자식 → {원소: 개수}. ChemStudio formulaWeight 와 같은 문법: Hill 식 "C7H22O2Si3"·"ClH", Indigo 의 띄어 쓴 "C3 H4 O2",
     '.'·';'·'·' 로 이은 조각과 조각 앞 배수("2H2O"), 괄호/대괄호와 개수("Ca(OH)2"), 끝의 전하("C2H3O2-").
     모르는 기호·고분자 'n'·빈 식 → null. 분자식에는 암시적 수소가 이미 들어 있으므로 그림의 원자 수는 쓰지 않는다 */
  function parseFormula(formula) {
    var text = String(formula == null ? '' : formula).replace(/<[^>]*>/g, '').replace(/\s+/g, '');
    if (!text) return null;
    var total = {}, any = false, parts = text.split(/[;.·]/);
    for (var p = 0; p < parts.length; p++) {
      var part = parts[p], lead = /^\d+/.exec(part), times = lead ? parseInt(lead[0], 10) : 1;
      if (lead) part = part.slice(lead[0].length);
      if (!part) continue;
      var stack = [{}], i = 0, m;
      while (i < part.length) {
        var ch = part.charAt(i);
        if (ch === '(' || ch === '[') { stack.push({}); i++; }
        else if (ch === ')' || ch === ']') {
          if (stack.length < 2) return null;
          m = /^\d*/.exec(part.slice(i + 1)); i += 1 + m[0].length;
          var group = stack.pop(); addCounts(stack[stack.length - 1], group, m[0] ? parseInt(m[0], 10) : 1);
        }
        else if (ch === '+' || ch === '-') { m = /^[+-]+\d*/.exec(part.slice(i)); i += m[0].length; }   // 전하는 원자 수에 넣지 않음
        else if ((m = /^([A-Z][a-z]?)(\d*)/.exec(part.slice(i)))) {
          if (WEIGHT_BY_SYMBOL[m[1]] === undefined) return null;
          var top = stack[stack.length - 1];
          top[m[1]] = (top[m[1]] || 0) + (m[2] ? parseInt(m[2], 10) : 1); i += m[0].length;
          any = true;
        }
        else return null;
      }
      if (stack.length !== 1) return null;
      addCounts(total, stack[0], times);
    }
    return any ? total : null;
  }

  // 분자량(g/mol) — 원자 수 × 원자량 합. 해석 못 하는 식은 null
  function formulaWeight(formula) {
    var c = parseFormula(formula); if (!c) return null;
    var w = 0;
    for (var el in c) w += WEIGHT_BY_SYMBOL[el] * c[el];
    return w > 0 ? w : null;
  }

  // Hill 순서(C, H, 나머지 알파벳; C 가 없으면 전부 알파벳) — 불균형 표시 순서
  function hillOrder(keys) {
    var hasC = keys.indexOf('C') >= 0;
    return keys.slice().sort(function (a, b) {
      if (hasC) {
        if (a === 'C') return -1; if (b === 'C') return 1;
        if (a === 'H') return -1; if (b === 'H') return 1;
      }
      return a < b ? -1 : a > b ? 1 : 0;
    });
  }
  function coefOf(x) { var c = Number(x); return x == null || x === '' || !isFinite(c) ? 1 : c; }

  /* 원자 수지 — items: {formula, coef(기본 1), name}. 시약(reagent)은 호출부에서 뺀다.
     diff = 생성물 쪽 − 반응물 쪽(0 이 아닌 원소만, Hill 순서 키). 분자식이 없거나 못 읽는 항목은 unknown 에 이름으로 */
  function balance(reactants, products) {
    var side = [{}, {}], unknown = [];
    [reactants || [], products || []].forEach(function (list, s) {
      list.forEach(function (it) {
        var c = parseFormula(it && it.formula);
        if (!c) { unknown.push((it && (it.name || it.formula)) || '?'); return; }
        addCounts(side[s], c, coefOf(it.coef));
      });
    });
    var els = Object.keys(side[0]).concat(Object.keys(side[1])).filter(function (e, i, a) { return a.indexOf(e) === i; });
    var diff = {};
    hillOrder(els).forEach(function (el) {
      var d = (side[1][el] || 0) - (side[0][el] || 0);
      if (Math.abs(d) > 1e-9) diff[el] = d;
    });
    var ok = !unknown.length && !Object.keys(diff).length && !!(reactants && reactants.length) && !!(products && products.length);
    return { ok: ok, diff: diff, unknown: unknown };
  }

  function num(x) { if (x == null || x === '') return null; var n = Number(x); return isFinite(n) ? n : null; }

  /* 화학량론 — model.rows[i] = { role:'reactant'|'product'|'reagent', formula, coef, mass(g), mmol, volume(mL), density(g/mL),
     basis:'mass'|'mmol'|'volume'(반응물에서 마지막으로 입력한 칸), actual(생성물 실측 g) }.
     반환: { rows:[{ mw, coef, mass, mmol, volume, equiv, theoMmol, theoMass, yieldPct }], limiting: 행 index(-1 = 없음) }.
     · 반응물: basis 칸에서 나머지를 유도(mass↔mmol 은 MW, mass↔volume 은 밀도)
     · 한계 반응물 = mmol 이 있는 반응물 중 mmol/coef 최소(0 포함). equiv = (mmol/coef) / (한계 mmol/한계 coef)
     · 생성물 이론 mmol = 한계 mmol / 한계 coef × 생성물 coef, 이론 질량 = 이론 mmol × MW / 1000, 수율 = 실측 / 이론 × 100 */
  function compute(model) {
    var rows = (model && model.rows) || [], out = [];
    rows.forEach(function (r) {
      var o = { mw: r.role === 'reagent' ? null : formulaWeight(r.formula), coef: coefOf(r.coef), mass: null, mmol: null, volume: null,
        equiv: null, theoMmol: null, theoMass: null, yieldPct: null };
      if (r.role === 'reactant') {
        var d = num(r.density), basis = r.basis || 'mass';
        if (d != null && d <= 0) d = null;
        if (basis === 'mmol') {
          o.mmol = num(r.mmol);
          if (o.mmol != null && o.mw) o.mass = o.mmol * o.mw / 1000;
        } else if (basis === 'volume') {
          o.volume = num(r.volume);
          if (o.volume != null && d != null) o.mass = o.volume * d;
          if (o.mass != null && o.mw) o.mmol = o.mass / o.mw * 1000;
        } else {
          o.mass = num(r.mass);
          if (o.mass != null && o.mw) o.mmol = o.mass / o.mw * 1000;
        }
        if (basis !== 'volume' && o.mass != null && d != null) o.volume = o.mass / d;
      }
      out.push(o);
    });
    var lim = -1, best = Infinity;
    rows.forEach(function (r, i) {
      var o = out[i];
      if (r.role !== 'reactant' || o.mmol == null || o.mmol < 0 || !(o.coef > 0)) return;   // 0 mmol 은 입력한 값이므로 한계 후보(빈칸 = null 만 제외)
      var per = o.mmol / o.coef;
      if (per < best) { best = per; lim = i; }
    });
    if (lim >= 0) {
      rows.forEach(function (r, i) {
        var o = out[i];
        // Equiv = (mmol/coef) / (한계 mmol/한계 coef) — 한계 반응물 1.00, 나머지는 화학량론상 1 이상. 한계가 0 이면 나눌 수 없어 한계 행만 1
        if (r.role === 'reactant' && o.mmol != null) o.equiv = best > 0 ? (o.mmol / o.coef) / best : (i === lim ? 1 : null);
        if (r.role === 'product') {
          o.theoMmol = best * o.coef;
          if (o.mw) o.theoMass = o.theoMmol * o.mw / 1000;
        }
      });
    }
    rows.forEach(function (r, i) {
      var o = out[i], act = num(r.actual);
      if (r.role === 'product' && act != null && o.theoMass > 0) o.yieldPct = act / o.theoMass * 100;
    });
    return { rows: out, limiting: lim };
  }

  /* ════ 여기부터 DOM 사용 ════ */

  var FONT = 'Arial, Helvetica, sans-serif';
  var _ctx = null;
  function textW(s, px, bold) {   // 글자 폭 측정(canvas) — SVG 를 내용 크기에 맞추기 위함. canvas 가 없으면 근사치
    try {
      if (!_ctx) _ctx = document.createElement('canvas').getContext('2d');
      _ctx.font = (bold ? 'bold ' : '') + px + 'px ' + FONT;
      return _ctx.measureText(String(s)).width;
    } catch (e) { return String(s).length * px * 0.56; }
  }
  function xesc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function fmtCoef(c) { return String(Math.round(c * 1000) / 1000); }

  // 분자식 조각 — 숫자는 아래첨자(작은 글씨 + dy). img·canvas 어디서나 같게 그려지도록 baseline-shift 대신 dy 사용
  function formulaParts(f) {
    var out = [], re = /(\d+)|([^\d]+)/g, m, s = String(f || '');
    // 조각 앞 배수(2H2O 의 첫 2, '.' 뒤 숫자)는 아래첨자가 아님
    while ((m = re.exec(s))) {
      var lead = m[1] && (m.index === 0 || /[.;·\s]/.test(s.charAt(m.index - 1)));
      out.push({ t: m[0], sub: !!m[1] && !lead });
    }
    return out;
  }
  function formulaWidth(f, px) {
    return formulaParts(f).reduce(function (w, p) { return w + textW(p.t, p.sub ? px * 0.75 : px); }, 0);
  }
  function formulaTspans(f, px) {
    var h = '', down = false, sub = Math.round(px * 0.75 * 10) / 10, dy = Math.round(px * 0.3 * 10) / 10;
    formulaParts(f).forEach(function (p) {
      if (p.sub && !down) { h += '<tspan dy="' + dy + '" font-size="' + sub + '">' + xesc(p.t) + '</tspan>'; down = true; }
      else if (!p.sub && down) { h += '<tspan dy="' + (-dy) + '">' + xesc(p.t) + '</tspan>'; down = false; }
      else h += '<tspan' + (p.sub ? ' font-size="' + sub + '"' : '') + '>' + xesc(p.t) + '</tspan>';
    });
    return h;
  }
  // 이름 줄바꿈(최대 2줄, 넘치면 …)
  function wrapName(name, px, maxW) {
    var words = String(name || '').split(/\s+/).filter(Boolean), lines = [], cur = '';
    words.forEach(function (w) {
      var t = cur ? cur + ' ' + w : w;
      if (textW(t, px, true) <= maxW || !cur) cur = t; else { lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur);
    if (lines.length > 2) { lines = lines.slice(0, 2); lines[1] += '…'; }
    return lines.map(function (l) {
      while (l.length > 2 && textW(l, px, true) > maxW) l = l.slice(0, -2) + '…';
      return l;
    });
  }

  /* 구조 SVG 문자열 → 바깥 SVG 안에 넣을 안전한 <svg> 요소. XML 머리말·script·foreignObject·on* 속성·외부 참조 제거,
     viewBox 가 없으면 width/height 로 만들고, id 는 구조마다 접두어를 붙여 서로 겹치지 않게 한다. 못 읽으면 null */
  function sanitizeStructure(svgStr, prefix) {
    if (!svgStr || typeof DOMParser === 'undefined') return null;
    var s = String(svgStr).replace(/<\?xml[\s\S]*?\?>/g, '').replace(/<!DOCTYPE[\s\S]*?>/gi, '').trim();
    var doc;
    try { doc = new DOMParser().parseFromString(s, 'image/svg+xml'); } catch (e) { return null; }
    var svg = doc && doc.documentElement;
    if (!svg || svg.nodeName.toLowerCase() !== 'svg' || doc.getElementsByTagName('parsererror').length) return null;
    Array.prototype.slice.call(svg.querySelectorAll('script, foreignObject, iframe, object, embed')).forEach(function (n) { n.parentNode.removeChild(n); });
    var all = [svg].concat(Array.prototype.slice.call(svg.querySelectorAll('*')));
    var ids = {};
    all.forEach(function (n) { if (n.id) ids[n.id] = prefix + n.id; });
    all.forEach(function (n) {
      Array.prototype.slice.call(n.attributes).forEach(function (a) {
        var nm = a.name, v = a.value;
        if (/^on/i.test(nm)) { n.removeAttribute(nm); return; }
        if (nm === 'href' || nm === 'xlink:href') {
          if (v.charAt(0) === '#') { if (ids[v.slice(1)]) n.setAttribute(nm, '#' + ids[v.slice(1)]); }
          else if (!/^data:image\//i.test(v)) n.removeAttribute(nm);   // 외부 참조 금지(img·canvas 에서 그려지지 않음)
          return;
        }
        if (nm === 'id' && ids[v]) { n.setAttribute('id', ids[v]); return; }
        if (v.indexOf('url(') >= 0) n.setAttribute(nm, v.replace(/url\(\s*['"]?#([^'")\s]+)['"]?\s*\)/g, function (all2, id) { return ids[id] ? 'url(#' + ids[id] + ')' : 'none'; }));
      });
    });
    Array.prototype.slice.call(svg.querySelectorAll('style')).forEach(function (st) {   // @import 제거 + id 참조 접두어
      st.textContent = st.textContent.replace(/@import[^;]*;?/g, '').replace(/#([A-Za-z_][\w-]*)/g, function (m0, id) { return ids[id] ? '#' + ids[id] : m0; });
    });
    var vb = svg.getAttribute('viewBox'), w = parseFloat(svg.getAttribute('width')), h = parseFloat(svg.getAttribute('height'));
    var box = vb ? vb.trim().split(/[\s,]+/).map(Number) : null;
    if (!box || box.length !== 4 || !(box[2] > 0) || !(box[3] > 0)) {
      box = [0, 0, w > 0 ? w : 200, h > 0 ? h : 150];
      svg.setAttribute('viewBox', box.join(' '));
    }
    return { el: svg, w: box[2], h: box[3] };
  }

  /* 반응식 SVG — model = { rows:[{role, name, formula, coef, svg}], conditions }.
     반응물(+로 이음) → 화살표(위 = 시약 이름 ', ' 로, 아래 = 조건) → 생성물. 구조 아래 이름·분자식, coef ≠ 1 이면 구조 앞에 숫자.
     흰 바탕·산세리프·내용 크기. 외부 참조가 없어 <img> 와 canvas 에서 똑같이 그려짐. 그릴 구조가 없으면 '' */
  function schemeSvg(model, opts) {
    opts = opts || {};
    var rows = (model && model.rows) || [];
    var reac = rows.filter(function (r) { return r.role === 'reactant'; });
    var prod = rows.filter(function (r) { return r.role === 'product'; });
    var reag = rows.filter(function (r) { return r.role === 'reagent' && String(r.name || '').trim(); }).map(function (r) { return String(r.name).trim(); });
    if (!reac.length && !prod.length) return '';
    var SH_MAX = opts.structH || 150, SW_MAX = 300, PAD = 18, GAP = 14, NAME_PX = 12, F_PX = 11.5, COEF_PX = 20, PLUS_PX = 22, LBL_PX = 12;
    var serializer = typeof XMLSerializer !== 'undefined' ? new XMLSerializer() : null;
    var seq = 0, maxText = 1;   // 구조 아래 글자 줄 수(이름 1~2줄 + 분자식) 최댓값 — 그림 높이를 내용에 맞춤
    // 모든 구조에 같은 배율 하나 — Ketcher SVG 는 결합 길이 단위가 같아서, 구조마다 칸에 맞춰 줄이면 큰 분자만 글자·선이 작아진다.
    // 배율 = 가장 큰 구조가 SH_MAX × SW_MAX 칸에 들어가는 값. 줄 높이 SH = 배율 적용 뒤 가장 높은 구조
    var sts = {};
    reac.concat(prod).forEach(function (r, i) { sts[i] = serializer ? sanitizeStructure(r.svg, 'rx' + (++seq) + '_') : null; r.__rxnIdx = i; });
    var K = Infinity;
    Object.keys(sts).forEach(function (i) { var st = sts[i]; if (st) K = Math.min(K, SH_MAX / st.h, SW_MAX / st.w); });
    if (!isFinite(K)) K = 1;
    var SH = 90;
    Object.keys(sts).forEach(function (i) { if (sts[i]) SH = Math.max(SH, sts[i].h * K); });
    function block(r) {   // 구조 하나(그림 + 이름 + 분자식)의 크기와 그리기 함수
      var st = sts[r.__rxnIdx]; delete r.__rxnIdx;
      var sw = st ? st.w * K : 90, sh = st ? st.h * K : SH;
      var lines = wrapName(r.name || '(unnamed)', NAME_PX, 200);
      var fw = r.formula ? formulaWidth(r.formula, F_PX) : 0;
      var tw = Math.max.apply(null, lines.map(function (l) { return textW(l, NAME_PX, true); }).concat([fw]));
      var coef = coefOf(r.coef), cs = coef !== 1 ? fmtCoef(coef) : '';
      var cw = cs ? textW(cs, COEF_PX, true) + 8 : 0;
      var bodyW = Math.max(sw, tw);
      maxText = Math.max(maxText, lines.length + (r.formula ? 1 : 0));
      return {
        w: cw + bodyW,
        draw: function (x, top) {
          var h = '', cx = x + cw + bodyW / 2, sy = top, mid = top + SH / 2;
          if (cs) h += '<text x="' + (x + cw - 8) + '" y="' + (mid + COEF_PX * 0.35) + '" font-size="' + COEF_PX + '" font-weight="bold" text-anchor="end">' + xesc(cs) + '</text>';
          if (st) {
            st.el.setAttribute('x', cx - sw / 2); st.el.setAttribute('y', sy + (SH - sh) / 2);   // 줄 가운데에 세로 정렬
            st.el.setAttribute('width', sw); st.el.setAttribute('height', sh);
            if (!st.el.getAttribute('preserveAspectRatio')) st.el.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            st.el.setAttribute('overflow', 'hidden');
            h += serializer.serializeToString(st.el);
          } else {
            h += '<rect x="' + (cx - sw / 2) + '" y="' + (sy + 10) + '" width="' + sw + '" height="' + (SH - 20) + '" rx="8" fill="none" stroke="#c9bcae" stroke-dasharray="4 3"/>'
              + '<text x="' + cx + '" y="' + (mid + 5) + '" font-size="13" fill="#9b8c7e" text-anchor="middle">No structure</text>';
          }
          var ty = sy + SH + 16;
          lines.forEach(function (l, i) { h += '<text x="' + cx + '" y="' + (ty + i * 15) + '" font-size="' + NAME_PX + '" font-weight="bold" text-anchor="middle">' + xesc(l) + '</text>'; });
          if (r.formula) h += '<text x="' + cx + '" y="' + (ty + lines.length * 15 + 1) + '" font-size="' + F_PX + '" fill="#5a3e30" text-anchor="middle">' + formulaTspans(r.formula, F_PX) + '</text>';
          return h;
        }
      };
    }
    var reagTxt = reag.join(', '), condTxt = String((model && model.conditions) || '').trim();
    var arrowW = Math.max(90, textW(reagTxt, LBL_PX) + 24, textW(condTxt, LBL_PX) + 24);
    var items = [];   // {kind:'blk'|'plus'|'arrow', w, draw}
    function pushSide(list) {
      list.forEach(function (r, i) {
        if (i) items.push({ kind: 'plus', w: textW('+', PLUS_PX) + GAP * 2 });
        items.push(block(r));
      });
    }
    pushSide(reac);
    items.push({ kind: 'arrow', w: arrowW + GAP * 2 });
    pushSide(prod);
    var nameH = 15 * maxText + 6, top = PAD + (reagTxt ? 4 : 0);
    var H = Math.round(top + SH + nameH + PAD), x = PAD, mid = top + SH / 2, body = '';
    items.forEach(function (it) {
      if (it.kind === 'plus') body += '<text x="' + (x + it.w / 2) + '" y="' + (mid + PLUS_PX * 0.35) + '" font-size="' + PLUS_PX + '" text-anchor="middle">+</text>';
      else if (it.kind === 'arrow') {
        var x1 = x + GAP, x2 = x + it.w - GAP, ax = (x1 + x2) / 2;
        body += '<line x1="' + x1 + '" y1="' + mid + '" x2="' + (x2 - 9) + '" y2="' + mid + '" stroke="#2b211b" stroke-width="1.6"/>'
          + '<polygon points="' + x2 + ',' + mid + ' ' + (x2 - 11) + ',' + (mid - 5) + ' ' + (x2 - 11) + ',' + (mid + 5) + '" fill="#2b211b"/>';
        if (reagTxt) body += '<text x="' + ax + '" y="' + (mid - 9) + '" font-size="' + LBL_PX + '" text-anchor="middle">' + xesc(reagTxt) + '</text>';
        if (condTxt) body += '<text x="' + ax + '" y="' + (mid + 20) + '" font-size="' + LBL_PX + '" fill="#5a3e30" text-anchor="middle">' + xesc(condTxt) + '</text>';
      } else body += it.draw(x, top);
      x += it.w;
    });
    var W = Math.round(x + PAD);
    return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"'
      + ' font-family="' + FONT + '" fill="#2b211b">'
      + '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#fff"/>' + body + '</svg>';
  }

  // SVG 문자열 → PNG Blob(Image 로 읽어 canvas 에 scale 배로 그림). 흰 바탕은 SVG 자체에 있음
  function toPng(svgString, scale) {
    scale = scale || 2;
    return new Promise(function (resolve, reject) {
      if (!svgString) { reject(new Error('Empty scheme')); return; }
      var m = /<svg\b[^>]*\bwidth="([\d.]+)"[^>]*\bheight="([\d.]+)"/.exec(svgString);
      var w = m ? parseFloat(m[1]) : 600, h = m ? parseFloat(m[2]) : 240;
      var img = new Image();
      img.onload = function () {
        try {
          var cv = document.createElement('canvas');
          cv.width = Math.round(w * scale); cv.height = Math.round(h * scale);
          var cx = cv.getContext('2d');
          cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height);
          cx.drawImage(img, 0, 0, cv.width, cv.height);
          cv.toBlob(function (b) { if (b) resolve(b); else reject(new Error('PNG encode failed')); }, 'image/png');
        } catch (e) { reject(e); }
      };
      img.onerror = function () { reject(new Error('SVG could not be drawn')); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
    });
  }

  var api = { parseFormula: parseFormula, formulaWeight: formulaWeight, balance: balance, compute: compute, schemeSvg: schemeSvg, toPng: toPng };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ElnReaction = api;
})(typeof window !== 'undefined' ? window : this);
