// 所有页面共用的小工具：图标、状态栏、dock、状态切换
window.UI = {
  icon(name, size = 20, color = 'currentColor') {
    const svg = window.ICONS[name];
    if (!svg) throw new Error(`缺少图标：${name}`);
    return svg.replace('<svg ', `<svg width="${size}" height="${size}" style="color:${color};display:block;flex:none" `);
  },
  // <i data-icon="wifi-high" data-size="20"></i> 换成 SVG
  hydrate(root = document) {
    root.querySelectorAll('[data-icon]').forEach(n => { n.outerHTML = UI.icon(n.dataset.icon, +(n.dataset.size || 20), n.dataset.color || 'currentColor'); });
  },
  statusbar() { return '<div class="sb"><span>7:42</span><span>●●● ▮</span></div>'; },
  // tab: today | trend | device | settings
  dock(tab) {
    const items = [['today', 'house', '今天'], ['trend', 'chart-line-up', '趋势'], ['device', 'scales', '设备'], ['settings', 'gear-six', '设置']];
    return `<nav class="dock">${items.map(([k, i, t]) => `<span class="${k === tab ? 'on' : ''}">${UI.icon(i, 22)}${t}</span>`).join('')}</nav>`;
  },
  // 读取 ?state=，并只显示 data-state 含该名的元素；返回当前状态名
  states(fallback) {
    const s = new URLSearchParams(location.search).get('state') || fallback;
    document.querySelectorAll('[data-state]').forEach(n => { n.hidden = !n.dataset.state.split(' ').includes(s); });
    document.documentElement.dataset.state = s;
    return s;
  },
};
