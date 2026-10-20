// 主题：8 套预设 + 自定义。每套只给 5 个基础色（底色、卡面、墨色、次要文字、强调色），
// 其余颜色在 base.css 里由它们派生。选择保存在 localStorage，每个页面在 <head> 里先加载本文件。
// 预设色值出处见 ../配色调研.md。
(function () {
  const PRESETS = [
    { id: 'braun',   name: 'Braun 暖灰',   from: 'Braun · Radix sand / orange', bg: '#f1f0ef', card: '#fbfaf8', ink: '#21201c', ink2: '#63635e', accent: '#cc4e00' },
    { id: 'sage',    name: '苔庭',         from: 'Radix sage / jade',          bg: '#eef1f0', card: '#fbfdfc', ink: '#1a211e', ink2: '#5f6563', accent: '#208368' },
    { id: 'apple',   name: 'Apple 灰',     from: 'apple.com · HIG 系统蓝',     bg: '#e8e8ed', card: '#fafafb', ink: '#1d1d1f', ink2: '#6e6e73', accent: '#0071e3' },
    { id: 'stripe',  name: '墨蓝',         from: 'stripe.com',                 bg: '#e5edf5', card: '#f8fafd', ink: '#061b31', ink2: '#50617a', accent: '#533afd' },
    { id: 'kinfolk', name: '纸本',         from: 'kinfolk.com · 柿渋',         bg: '#eeeae8', card: '#f9f7f5', ink: '#1c1c1c', ink2: '#5e5e5e', accent: '#a35e47' },
    { id: 'nezumi',  name: '鼠と藍',       from: '日本传统色 白練 / 藍',       bg: '#eeede6', card: '#fcfaf2', ink: '#1c1c1c', ink2: '#5e605e', accent: '#0d5661' },
    { id: 'stone',   name: 'Stone 青',     from: 'Tailwind stone / teal',      bg: '#e7e5e4', card: '#fafaf9', ink: '#1c1917', ink2: '#57534e', accent: '#0f766e' },
    { id: 'geppaku', name: '月白',         from: '中国传统色 月白 / 深灰蓝',   bg: '#d8e3e7', card: '#eef7f2', ink: '#132c33', ink2: '#41525e', accent: '#527a7f' },
  ];
  // 自定义：只选强调色的色相和底色的冷暖，其余按"灰色跟强调色同色相、卡面几乎是灰"推出来
  const TONES = { follow: '跟随强调色', warm: '暖', neutral: '中性', cool: '冷' };
  function custom(h, tone) {
    const nh = tone === 'warm' ? 70 : tone === 'cool' ? 250 : h;
    const c = tone === 'neutral' ? 0 : 0.007;
    return {
      id: 'custom', name: '自定义', from: '你的搭配',
      bg: `oklch(0.955 ${c} ${nh})`, card: `oklch(0.987 ${c * 0.6} ${nh})`,
      ink: `oklch(0.23 ${c * 2} ${nh})`, ink2: `oklch(0.47 ${c * 2} ${nh})`,
      accent: `oklch(0.57 0.15 ${h})`,
    };
  }


  // —— 颜色运算（OKLab）。派生色在这里算成具体值，老浏览器不支持 color-mix / oklch 也能正常显示 ——
  const toLin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const toGam = c => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
  function rgbToLab([r, g, b]) {
    [r, g, b] = [r, g, b].map(toLin);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
  }
  function labToRgb([L, a, b]) {
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s]
      .map(c => Math.min(1, Math.max(0, toGam(c))));
  }
  function parse(c) {
    c = c.trim();
    if (c[0] === '#') return rgbToLab([1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16) / 255));
    const m = c.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
    if (m) { const [L, C, h] = m.slice(1).map(Number), r = h * Math.PI / 180; return [L, C * Math.cos(r), C * Math.sin(r)]; }
    throw new Error(`无法解析颜色：${c}`);
  }
  const hex = lab => '#' + labToRgb(lab).map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
  // mix(a, p, b)：a 占 p（0–1），其余是 b；b 省略表示透明
  function mix(a, p, b) {
    const A = parse(a);
    if (b === undefined) { const [r, g, bl] = labToRgb(A).map(v => Math.round(v * 255)); return `rgba(${r}, ${g}, ${bl}, ${+p.toFixed(3)})`; }
    const B = parse(b);
    return hex(A.map((v, i) => v * p + B[i] * (1 - p)));
  }
  // 与 base.css 里的派生规则一一对应
  function derive(t) {
    const bg = hex(parse(t.bg)), card = hex(parse(t.card)), ink = hex(parse(t.ink)), ink2 = hex(parse(t.ink2)), accent = hex(parse(t.accent));
    const night = mix(ink, 0.94, accent);
    return {
      '--bg': bg, '--card': card, '--ink': ink, '--ink-2': ink2, '--accent': accent,
      '--accent-ink': mix(accent, 0.82, ink), '--accent-soft': mix(accent, 0.12),
      '--mute': mix(ink, 0.10), '--line': mix(ink, 0.08), '--hair': mix(ink, 0.14), '--hair-2': mix(ink, 0.22),
      '--ink-strong-2': mix(ink, 0.80, bg),
      '--cat-1': mix(ink, 0.78, card), '--cat-2': mix(ink, 0.40, card), '--cat-3': mix(ink, 0.18, card),
      '--seg-1': mix(ink, 0.09, card), '--seg-2': mix(ink, 0.18, card), '--seg-3': mix(ink, 0.30, card),
      '--bar': mix(ink, 0.12, card), '--pager': mix(ink, 0.20, bg),
      '--night': night, '--night-ink': card, '--night-ink-2': mix(card, 0.64, night), '--night-accent': mix(accent, 0.65, '#ffffff'),
    };
  }

  const KEY = 'wb-theme';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; } };
  const write = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* 无痕模式下不记忆 */ } };

  // 选择：{ id: 'braun' } 或 { id: 'custom', h: 38, tone: 'follow' }；地址上的 ?theme= 优先（截图用）
  function resolve(sel) {
    if (sel && sel.id === 'custom') return custom(+sel.h || 0, sel.tone in TONES ? sel.tone : 'follow');
    return PRESETS.find(p => p.id === (sel && sel.id)) || PRESETS[0];
  }
  function apply(sel) {
    const t = resolve(sel), st = document.documentElement.style;
    for (const [k, v] of Object.entries(derive(t))) st.setProperty(k, v);
    document.documentElement.dataset.theme = t.id;
    return t;
  }

  const q = new URLSearchParams(location.search);
  const fromUrl = q.get('theme') ? { id: q.get('theme'), h: q.get('h'), tone: q.get('tone') } : null;
  let current = fromUrl || read() || { id: 'braun' };
  apply(current);

  // 解析后的颜色值：给 SVG 属性用（属性里不能写 var()）
  const probe = () => {
    let p = document.getElementById('theme-probe');
    if (!p) { p = document.createElement('i'); p.id = 'theme-probe'; p.style.display = 'none'; (document.body || document.documentElement).appendChild(p); }
    return p;
  };
  function fit() {
    const ph = document.querySelector('.phone');
    if (!ph || innerWidth >= 600) return;
    const k = Math.min(innerWidth / 390, innerHeight / 844);
    ph.style.transformOrigin = 'top left';
    ph.style.transform = `scale(${k})`;
    ph.style.margin = `0 0 0 ${(innerWidth - 390 * k) / 2}px`;
    document.body.style.height = `${innerHeight}px`;
    document.body.style.overflow = 'hidden';
  }
  addEventListener('DOMContentLoaded', fit);
  addEventListener('resize', fit);

  window.THEME = {
    PRESETS, TONES, custom, resolve, mix, hex: c => hex(parse(c)),
    get current() { return current; },
    set(sel) { current = sel; write(sel); apply(sel); },
    v(name) { const p = probe(); p.style.color = `var(${name})`; return getComputedStyle(p).color; },
  };
})();
