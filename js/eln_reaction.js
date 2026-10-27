/* MAPIS ELN — Reaction 모듈 엔진(분자식 파싱·분자량·원자 수지·화학량론 계산·반응식 SVG/PNG).
   계산 함수(parseFormula·formulaWeight·balance·compute)는 DOM 을 쓰지 않는 순수 함수 → node 에서도 그대로 시험 가능.
   DOM 을 쓰는 것은 schemeSvg(DOMParser·글자 폭 측정)·toPng(Image·canvas)·inlineSvg(화면에 넣을 요소) 셋뿐. 화면 표시 형식(소수 자리)은 UI(eln.js) 몫. */
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

  /* 화학량론 — model.rows[i] = { role:'reactant'|'product'|'reagent'|'solvent', formula, coef, mass(g), mmol, volume(mL), density(g/mL),
     purity(%, 비면 100), equiv(basis 'equiv' 일 때 친 값),
     basis:'mass'|'mmol'|'volume'|'equiv'(반응물에서 마지막으로 입력한 칸), actual(생성물 실측 g), limit(반응물: 사용자가 한계 반응물로 지정) }.
     반환: { rows:[{ mw, coef, mass, mmol, volume, equiv, theoMmol, theoMass, yieldPct }], limiting: 계산 기준 행 index(-1 = 없음),
             auto: 가장 먼저 떨어지는 반응물 index, pinned: 지정 행 index(-1 = 자동), short:[한계 반응물보다 먼저 떨어지는 반응물 index],
             totalVolume(mL), solventVolume(mL), volumeExcluded:[부피를 모르는 반응물 index], molarity(M) }.
     · 반응물: basis 칸에서 나머지를 유도(mass↔mmol 은 MW 와 순도, mass↔volume 은 밀도). 질량 · 부피 = 저울에 다는 양(순도 포함 그대로),
       mmol = 실제 반응하는 양 = 질량 × 순도 / MW. 용매: 부피만
     · 한계 반응물 = 지정이 있으면 그 행(양을 아직 안 넣었으면 -1), 없으면 직접 양을 넣은 반응물(basis 가 equiv 가 아닌 것) 중 mmol/coef 최소(0 포함).
       basis 'equiv' 행은 한계 반응물 기준으로 mmol = equiv × 한계 mmol/한계 coef × 자기 coef(한계 후보에서 빠짐 — 서로 물고 돌지 않게)
       equiv = (mmol/coef) / (한계 mmol/한계 coef) — 1 미만(지정 · equiv 입력으로 생김)은 short 에 들어감
     · 생성물 이론 mmol = 한계 mmol / 한계 coef × 생성물 coef, 이론 질량 = 이론 mmol × MW / 1000, 수율 = 실측 / 이론 × 100
     · 총 부피 = 용매 부피 + 부피가 있는 반응물(밀도로 유도 포함). 양(질량·mmol)은 있는데 부피를 모르는 반응물(밀도·분자식 없음)은 빼고 volumeExcluded 에.
       몰 농도 = 한계 반응물 mmol / 총 부피 mL (= mol/L) */
  function compute(model) {
    var rows = (model && model.rows) || [], out = [];
    rows.forEach(function (r) {
      var o = { mw: r.role === 'reagent' ? null : formulaWeight(r.formula), coef: coefOf(r.coef), mass: null, mmol: null, volume: null,
        equiv: null, theoMmol: null, theoMass: null, yieldPct: null };
      if (r.role === 'solvent') o.volume = num(r.volume);
      if (r.role === 'reactant') {
        var d = num(r.density), basis = r.basis || 'mass', p = num(r.purity);
        if (d != null && d <= 0) d = null;
        p = p != null && p > 0 && p <= 100 ? p / 100 : 1;   // 순도 0 초과 ~ 100 % 만, 그 밖 · 빈칸 = 100 %
        o.purity = p; o.d = d;
        if (basis === 'mmol') {
          o.mmol = num(r.mmol);
          if (o.mmol != null && o.mw) o.mass = o.mmol * o.mw / 1000 / p;
        } else if (basis === 'volume') {
          o.volume = num(r.volume);
          if (o.volume != null && d != null) o.mass = o.volume * d;
          if (o.mass != null && o.mw) o.mmol = o.mass * p / o.mw * 1000;
        } else if (basis === 'mass') {
          o.mass = num(r.mass);
          if (o.mass != null && o.mw) o.mmol = o.mass * p / o.mw * 1000;
        }   // basis 'equiv' = 한계 반응물이 정해진 뒤 아래에서
        if (basis !== 'volume' && o.mass != null && d != null) o.volume = o.mass / d;
      }
      out.push(o);
    });
    var auto = -1, autoBest = Infinity, pinned = -1;
    rows.forEach(function (r, i) {
      var o = out[i];
      if (r.role !== 'reactant' || !(o.coef > 0)) return;
      if (r.limit && pinned < 0) pinned = i;
      if (r.basis === 'equiv' || o.mmol == null || o.mmol < 0) return;   // 0 mmol 은 입력한 값이므로 한계 후보(빈칸 = null · equiv 입력 행만 제외)
      var per = o.mmol / o.coef;
      if (per < autoBest) { autoBest = per; auto = i; }
    });
    var lim = auto, best = autoBest;
    if (pinned >= 0) { lim = rows[pinned].basis !== 'equiv' && out[pinned].mmol != null && out[pinned].mmol >= 0 ? pinned : -1; best = lim >= 0 ? out[pinned].mmol / out[pinned].coef : Infinity; }
    if (lim >= 0) rows.forEach(function (r, i) {   // equiv 로 넣은 반응물 — 한계 반응물에서 mmol, 거기서 질량(순도) · 부피(밀도)
      var o = out[i], e = num(r.equiv);
      if (r.role !== 'reactant' || r.basis !== 'equiv' || e == null || i === lim) return;
      o.mmol = e * best * o.coef;
      if (o.mw) o.mass = o.mmol * o.mw / 1000 / o.purity;
      if (o.mass != null && o.d != null) o.volume = o.mass / o.d;
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
    var short = [];
    if (lim >= 0) rows.forEach(function (r, i) { if (r.role === 'reactant' && i !== lim && out[i].equiv != null && out[i].equiv < 1 - 1e-9) short.push(i); });
    out.forEach(function (o) { delete o.d; });   // 계산용 밀도는 결과에서 뺌(purity 는 남김 — 화면 · PDF 가 씀)
    var tv = 0, sv = 0, excl = [];
    rows.forEach(function (r, i) {
      var o = out[i];
      if (r.role === 'solvent') { if (o.volume != null) { tv += o.volume; sv += o.volume; } }
      else if (r.role === 'reactant') { if (o.volume != null) tv += o.volume; else if (o.mass > 0 || o.mmol > 0) excl.push(i); }   // 양은 있는데 부피를 모름(밀도·분자식 없음)
    });
    var molarity = lim >= 0 && tv > 0 ? out[lim].mmol / tv : null;
    return { rows: out, limiting: lim, auto: auto, pinned: pinned, short: short, totalVolume: tv, solventVolume: sv, volumeExcluded: excl, molarity: molarity };
  }
  // 목표 몰 농도(M)를 맞추는 용매 부피 합(mL) — 한계 반응물 mmol / M − 용매가 아닌 부피. 한계 반응물이 없거나 M ≤ 0 이면 null, 음수 = 반응물 부피만으로 이미 묽음
  function solventFor(calc, molarity) {
    if (!calc || calc.limiting < 0 || !(molarity > 0)) return null;
    var mmol = calc.rows[calc.limiting].mmol; if (!(mmol > 0)) return null;
    return mmol / molarity - (calc.totalVolume - calc.solventVolume);
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

  /* style 속성 정리 — 선언 하나씩. 외부 자원(url·image-set·@import)·CSS 이스케이프(\72 = r 처럼 글자를 숨김)·넘침/위치/커서 선언은 버리고
     그리기 선언(fill·stroke·font …)은 남김. RDKit·Ketcher 그림은 선을 style 속성으로 그리므로 통째로 지우면 구조가 망가짐 */
  var BAD_DECL = /\\|url\s*\(|image|@|expression|binding|behavior|^\s*(overflow|position|cursor|content)\s*:/i;
  function cleanStyle(v) { return String(v).split(';').filter(function (d) { return d.trim() && !BAD_DECL.test(d); }).join(';'); }
  var LOCAL_URL = /^\s*url\(\s*(['"]?)#[\w.:-]+\1\s*\)\s*$/i;   // 속성 값 전체가 url(#id) 하나일 때만 참조로 인정

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
        if (a.localName === 'href') {   // 접두어 무관(xlink:href·foo:href)
          if (v.charAt(0) === '#') { if (ids[v.slice(1)]) n.setAttribute(nm, '#' + ids[v.slice(1)]); else n.removeAttribute(nm); }   // 구조 밖 id(다른 카드·페이지 SVG) 참조 금지
          else if (!/^data:image\//i.test(v)) n.removeAttribute(nm);   // 외부 참조 금지(img·canvas 에서 그려지지 않음)
          return;
        }
        if (nm === 'id' && ids[v]) { n.setAttribute('id', ids[v]); return; }
        if (nm === 'style') { var cs = cleanStyle(v); if (cs) n.setAttribute(nm, cs); else n.removeAttribute(nm); return; }
        if (/url|\\/i.test(v)) {   // 대소문자·이스케이프 무관: 값 전체가 url(#id) 이면 접두어만 바꾸고, 그 밖은 속성째 버림
          if (LOCAL_URL.test(v)) { var id0 = v.replace(/^[^#]*#([\w.:-]+)[\s\S]*$/, '$1'); if (ids[id0]) n.setAttribute(nm, 'url(#' + ids[id0] + ')'); else n.removeAttribute(nm); }
          else n.removeAttribute(nm);
        }
      });
    });
    // 구조 뿌리의 style(overflow:visible 등)·transform·filter·mask·clip-path 제거 — 칸(overflow="hidden")을 덮거나 옮기거나 칸 밖에 그리지 못하게
    ['style', 'transform', 'filter', 'mask', 'clip-path'].forEach(function (k) { svg.removeAttribute(k); });
    Array.prototype.slice.call(svg.querySelectorAll('style')).forEach(function (st) {   // 이스케이프 든 글은 통째로 버림, @import·외부 url() 제거 + id 참조 접두어(내보내기 <img>·canvas 용 — 화면 inlineSvg 는 <style> 자체를 버림)
      if (/\\/.test(st.textContent)) { st.textContent = ''; return; }
      st.textContent = st.textContent.replace(/@import[^;]*;?/gi, '').replace(/url\(\s*(?!['"]?\s*#)[^)]*\)?/gi, 'none').replace(/image-set\(/gi, 'none(').replace(/#([A-Za-z_][\w-]*)/g, function (m0, id) { return ids[id] ? '#' + ids[id] : m0; });
    });
    var vb = svg.getAttribute('viewBox'), w = parseFloat(svg.getAttribute('width')), h = parseFloat(svg.getAttribute('height'));
    var box = vb ? vb.trim().split(/[\s,]+/).map(Number) : null;
    if (!box || box.length !== 4 || !(box[2] > 0) || !(box[3] > 0)) {
      box = [0, 0, w > 0 ? w : 200, h > 0 ? h : 150];
      svg.setAttribute('viewBox', box.join(' '));
    }
    return { el: svg, w: box[2], h: box[3] };
  }

  /* 반응식 SVG — model = { rows:[{role, name, formula, coef, svg, tag, rid}], conditions }.
     반응물(+로 이음) → 화살표(위 = 시약 이름 ', ' 로, 아래 = 조건) → 생성물. 구조 아래 이름·분자식, coef ≠ 1 이면 구조 앞에 숫자.
     tag(R1·P1 …)가 있으면 이름 첫 줄 앞에 역할 색 작은 태그(속성으로만 칠함 — 페이지 CSS 없이 PNG·PDF 에도 그대로).
     opts.link = 화면용: 구조 블록마다 <g class="elnRxnSch" data-rid> + 투명 바탕판(hover 때 CSS 가 옅게 칠함), 이름 아래 양 줄
                 <text class="elnRxnAmt">(행의 amt 글자, lim 이면 "Limiting"), 화살표 위 <g class="elnRxnArrowUp">(시약 · 용매 추가 — 비면 "+ Reagent or Solvent", 있으면 그 위 한 줄에 같은 문구, 늘 보임)
                 · 화살표와 아래 <g class="elnRxnArrow">(Conditions — 비면 "Add Conditions", 누르면 화면 쪽이 그 자리에 입력칸을 띄움),
                 아래 26px = 블록 도구 막대 자리. 내보내기는 link 없이.
     opts.idp = 구조 id 접두어 앞에 붙일 문자열(화면에 인라인으로 넣을 때 카드끼리 id 가 겹치지 않게).
     흰 바탕·산세리프·내용 크기. 외부 참조가 없어 <img> 와 canvas 에서 똑같이 그려짐. 그릴 구조가 없으면 '' */
  var ROLE_C = { reactant: '#A47B67', product: '#7592ca' };   // 표 Role 칩(roundBox mocha25·cfblue25)과 같은 색
  function schemeSvg(model, opts) {
    opts = opts || {};
    var rows = (model && model.rows) || [];
    var reac = rows.filter(function (r) { return r.role === 'reactant'; });
    var prod = rows.filter(function (r) { return r.role === 'product'; });
    var reag = rows.filter(function (r) { return (r.role === 'reagent' || r.role === 'solvent') && String(r.name || '').trim(); }).map(function (r) { return String(r.name).trim(); });   // 화살표 위: 시약, 용매 순(행 순서)
    // 그릴 것이 하나도 없을 때만 ''. 구조가 없어도 시약 · 용매 · 조건이 있으면 화살표만으로 그림(넣은 값이 숨지 않게)
    if (!reac.length && !prod.length && !reag.length && !String((model && model.conditions) || '').trim()) return '';
    var SH_MAX = opts.structH || 150, SW_MAX = 300, PAD = 18, GAP = 14, NAME_PX = 12, F_PX = 11.5, COEF_PX = 20, PLUS_PX = 22, LBL_PX = 12, TAG_PX = 10.5, AMT_PX = 10.5;
    var idp = String(opts.idp || '').replace(/[^\w-]/g, '');
    var serializer = typeof XMLSerializer !== 'undefined' ? new XMLSerializer() : null;
    var seq = 0, maxText = 1;   // 구조 아래 글자 줄 수(이름 1~2줄 + 분자식) 최댓값 — 그림 높이를 내용에 맞춤
    // 모든 구조에 같은 배율 하나 — Ketcher SVG 는 결합 길이 단위가 같아서, 구조마다 칸에 맞춰 줄이면 큰 분자만 글자·선이 작아진다.
    // 배율 = 가장 큰 구조가 SH_MAX × SW_MAX 칸에 들어가는 값. 줄 높이 SH = 배율 적용 뒤 가장 높은 구조
    var sts = {};
    reac.concat(prod).forEach(function (r, i) { sts[i] = serializer ? sanitizeStructure(r.svg, idp + 'rx' + (++seq) + '_') : null; r.__rxnIdx = i; });
    var K = Infinity;
    Object.keys(sts).forEach(function (i) { var st = sts[i]; if (st) K = Math.min(K, SH_MAX / st.h, SW_MAX / st.w); });
    if (!isFinite(K)) K = 1;
    var SH = 90;
    Object.keys(sts).forEach(function (i) { if (sts[i]) SH = Math.max(SH, sts[i].h * K); });
    function block(r) {   // 구조 하나(그림 + 이름 + 분자식)의 크기와 그리기 함수
      var st = sts[r.__rxnIdx]; delete r.__rxnIdx;
      var sw = st ? st.w * K : 90, sh = st ? st.h * K : SH;
      var tag = r.tag ? String(r.tag) : '', tagW = tag ? Math.ceil(textW(tag, TAG_PX, true)) + 8 : 0, tagSp = tag ? tagW + 5 : 0;
      var rc = ROLE_C[r.role] || '#7a6a5e';
      var lines = wrapName(r.name || '(unnamed)', NAME_PX, 200 - tagSp);
      var fw = r.formula ? formulaWidth(r.formula, F_PX) : 0;
      var lw = lines.map(function (l, i) { return textW(l, NAME_PX, true) + (i ? 0 : tagSp); });   // 첫 줄은 태그 폭 포함
      var tw = Math.max.apply(null, lw.concat([fw]));
      var coef = coefOf(r.coef), cs = coef !== 1 ? fmtCoef(coef) : '';
      var cw = cs ? textW(cs, COEF_PX, true) + 8 : 0;
      // 화면용(link): 이름 아래 양 줄(r.amt, 한계면 r.lim) 한 줄을 늘 비워 둠 — 입력 중에는 화면 쪽이 글자만 바꿈(넓어지면 다시 그림)
      var amt = opts.link ? String(r.amt || '') : '', limTxt = opts.link && r.lim ? (amt ? ' · ' : '') + 'Limiting' : '';
      var aw = opts.link ? textW(amt, AMT_PX) + textW(limTxt, AMT_PX, true) : 0;
      var bodyW = Math.max(sw, tw, aw);
      maxText = Math.max(maxText, lines.length + (r.formula ? 1 : 0) + (opts.link ? 1 : 0));
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
          lines.forEach(function (l, i) {
            if (i === 0 && tag) {   // [R1] 이름 — 태그 + 첫 줄을 한 덩어리로 가운데 정렬. 옅은 역할색 바탕(13%) + 역할색 글자, 테두리·그림자 없음
              var lx = cx - lw[0] / 2;
              h += '<rect x="' + lx + '" y="' + (ty - 11) + '" width="' + tagW + '" height="15" rx="3.5" fill="' + rc + '" fill-opacity="0.13"/>'
                + '<text x="' + (lx + tagW / 2) + '" y="' + (ty + 0.3) + '" font-size="' + TAG_PX + '" font-weight="bold" fill="' + rc + '" text-anchor="middle">' + xesc(tag) + '</text>'
                + '<text x="' + (lx + tagSp) + '" y="' + ty + '" font-size="' + NAME_PX + '" font-weight="bold" text-anchor="start">' + xesc(l) + '</text>';
            } else h += '<text x="' + cx + '" y="' + (ty + i * 15) + '" font-size="' + NAME_PX + '" font-weight="bold" text-anchor="middle">' + xesc(l) + '</text>';
          });
          if (r.formula) h += '<text x="' + cx + '" y="' + (ty + lines.length * 15 + 1) + '" font-size="' + F_PX + '" fill="#5a3e30" text-anchor="middle">' + formulaTspans(r.formula, F_PX) + '</text>';
          if (opts.link && r.rid != null) {   // 화면용 연결 블록 — 바탕판(투명, hover 때 CSS 가 fill-opacity 를 올림)이 블록 전체를 hover 영역으로 만듦
            var ay = ty + lines.length * 15 + (r.formula ? 16 : 0) + 1;
            h += '<text class="elnRxnAmt" data-rid="' + xesc(r.rid) + '" data-w="' + Math.ceil(bodyW) + '" x="' + cx + '" y="' + ay + '" font-size="' + AMT_PX + '" fill="#9b8c7e" text-anchor="middle">'
              + xesc(amt) + (limTxt ? '<tspan fill="' + rc + '" font-weight="bold">' + xesc(limTxt) + '</tspan>' : '') + '</text>';
            var by = ay + 6;
            h = '<g class="elnRxnSch" data-rid="' + xesc(r.rid) + '" data-role="' + xesc(r.role) + '">'
              + '<rect class="elnRxnPlate" x="' + (x - 6) + '" y="' + (top - 6) + '" width="' + (cw + bodyW + 12) + '" height="' + (by - top + 6) + '" rx="10" fill="' + rc + '" fill-opacity="0"/>'
              + h + '</g>';
          }
          return h;
        }
      };
    }
    var reagTxt = reag.join(', '), condTxt = String((model && model.conditions) || '').trim();
    var arrowW = Math.max(90, textW(reagTxt, LBL_PX) + 24, textW(condTxt, LBL_PX) + 24,
      opts.link ? textW('+ Reagent or Solvent', LBL_PX) + 24 : 0);   // 화면용 안내 글자도 화살표 폭 안에
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
    var H = Math.round(top + SH + nameH + PAD + (opts.link ? 26 : 0)), x = PAD, mid = top + SH / 2, body = '';   // 화면용: 아래에 블록 도구 막대 자리
    items.forEach(function (it) {
      if (it.kind === 'plus') body += '<text x="' + (x + it.w / 2) + '" y="' + (mid + PLUS_PX * 0.35) + '" font-size="' + PLUS_PX + '" text-anchor="middle">+</text>';
      else if (it.kind === 'arrow') {
        var x1 = x + GAP, x2 = x + it.w - GAP, ax = (x1 + x2) / 2;
        var arrow = '<line x1="' + x1 + '" y1="' + mid + '" x2="' + (x2 - 9) + '" y2="' + mid + '" stroke="#2b211b" stroke-width="1.6"/>'
          + '<polygon points="' + x2 + ',' + mid + ' ' + (x2 - 11) + ',' + (mid - 5) + ' ' + (x2 - 11) + ',' + (mid + 5) + '" fill="#2b211b"/>';
        var up = reagTxt ? '<text x="' + ax + '" y="' + (mid - 9) + '" font-size="' + LBL_PX + '" text-anchor="middle">' + xesc(reagTxt) + '</text>' : '';
        var dn = condTxt ? '<text x="' + ax + '" y="' + (mid + 20) + '" font-size="' + LBL_PX + '" fill="#5a3e30" text-anchor="middle">' + xesc(condTxt) + '</text>' : '';
        if (!opts.link) body += arrow + up + dn;
        else {   // 화면용: 화살표 위쪽 = 시약 · 용매 추가, 아래쪽(화살표 선 포함) = Conditions 칸. 각각 투명 판이 클릭 영역, 비어 있으면 옅은 안내
          var hw = x2 - x1;
          // 안내 글자는 늘 보임(숨기지 않음) — 시약이 있으면 그 위 한 줄에 작게 "+ Reagent or Solvent"(더 넣는 길)
          var PH = '#a8998b', upTop = up ? mid - 38 : mid - 30;
          body += '<g class="elnRxnArrowUp" tabindex="0" role="button" aria-label="Add a reagent or solvent"><rect x="' + x1 + '" y="' + upTop + '" width="' + hw + '" height="' + (mid - 3 - upTop) + '" fill="#fff" fill-opacity="0"/>'
            + (up || '<text class="elnRxnPh" x="' + ax + '" y="' + (mid - 9) + '" font-size="' + LBL_PX + '" fill="' + PH + '" text-anchor="middle">+ Reagent or Solvent</text>')
            + (up ? '<text class="elnRxnPh" x="' + ax + '" y="' + (mid - 25) + '" font-size="' + (LBL_PX - 1) + '" fill="' + PH + '" text-anchor="middle">+ Reagent or Solvent</text>' : '') + '</g>'
            + '<g class="elnRxnArrow" tabindex="0" role="button" aria-label="Edit conditions"><rect x="' + x1 + '" y="' + (mid - 3) + '" width="' + hw + '" height="31" fill="#fff" fill-opacity="0"/>' + arrow
            + (dn || '<text class="elnRxnPh" x="' + ax + '" y="' + (mid + 20) + '" font-size="' + LBL_PX + '" fill="' + PH + '" text-anchor="middle">Add Conditions</text>') + '</g>';
        }
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

  /* 반응식 SVG 문자열 → 문서에 바로 넣을 <svg> 요소(화면 hover 연결용). <img> 와 달리 문서 안에서 살아 있으므로 한 번 더 걸러 냄:
     SVG 그림 요소 허용 목록 밖(script·style·foreignObject·a·animate/set·metadata …)은 통째로 제거 — <style> 은 페이지 전체에 먹고,
     <a>·<set> 은 클릭·속성 바꾸기 경로라서. on* 속성, '#'·data:image 가 아닌 href, javascript: 값, 외부 url(…) 도 제거. 못 읽으면 null */
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var SAFE_EL = /^(svg|g|path|rect|circle|ellipse|line|polyline|polygon|text|tspan|defs|clipPath|mask|linearGradient|radialGradient|stop|pattern|symbol|use|marker|title|desc|image)$/;
  function inlineSvg(svgString) {
    if (!svgString || typeof DOMParser === 'undefined' || typeof document === 'undefined') return null;
    var doc;
    try { doc = new DOMParser().parseFromString(String(svgString), 'image/svg+xml'); } catch (e) { return null; }
    var svg = doc && doc.documentElement;
    if (!svg || svg.namespaceURI !== SVG_NS || svg.localName !== 'svg' || doc.getElementsByTagName('parsererror').length) return null;
    [svg].concat(Array.prototype.slice.call(svg.querySelectorAll('*'))).forEach(function (n) {
      if (n !== svg && !svg.contains(n)) return;   // 이미 지운 조상 아래
      if (n.namespaceURI !== SVG_NS || !SAFE_EL.test(n.localName)) { n.parentNode.removeChild(n); return; }
      // 구조 그림 안(안쪽 <svg> 와 그 아래) = 밖에서 온 것: class·data-* 는 버림(가짜 elnRxnSch 블록으로 다른 행을 강조·클릭시키거나 페이지 CSS 를 끌어오지 못하게)
      var own = n === svg ? null : n.localName === 'svg' ? n : n.parentElement && n.parentElement.closest('svg');
      var inStruct = !!own && own !== svg;
      if (inStruct && n.localName === 'svg') ['style', 'transform', 'filter', 'mask', 'clip-path'].forEach(function (k) { n.removeAttribute(k); });
      Array.prototype.slice.call(n.attributes).forEach(function (a) {
        var nm = a.name, v = a.value;
        if (/^on/i.test(nm) || /javascript:|vbscript:/i.test(v.replace(/[\s\u0000-\u001f]+/g, ''))) { n.removeAttribute(nm); return; }
        if (inStruct && (nm === 'class' || /^data-/i.test(nm))) { n.removeAttribute(nm); return; }
        if (a.localName === 'href') {
          if (!(v.charAt(0) === '#' || (n.localName === 'image' && /^data:image\//i.test(v)))) n.removeAttribute(nm);
          return;
        }
        if (nm === 'style') { var cs = cleanStyle(v); if (cs) n.setAttribute(nm, cs); else n.removeAttribute(nm); return; }
        if (/url|\\/i.test(v) && !LOCAL_URL.test(v)) n.removeAttribute(nm);   // url(#id) 하나뿐인 값만 남김(대문자 URL(·이스케이프·닫히지 않은 url( 포함 차단)
      });
    });
    return document.importNode(svg, true);
  }

  var api = { parseFormula: parseFormula, formulaWeight: formulaWeight, balance: balance, compute: compute, solventFor: solventFor, schemeSvg: schemeSvg, toPng: toPng, inlineSvg: inlineSvg };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ElnReaction = api;
})(typeof window !== 'undefined' ? window : this);
