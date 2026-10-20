// 三个方向共用的示例数据：本人
window.WB = {
  weight: 68.25,
  delta: -0.15,
  recent: [
    { day: '10/13', v: 68.92 }, { day: '10/14', v: 68.70 }, { day: '10/15', v: 68.76 }, { day: '10/16', v: 68.58 },
    { day: '10/17', v: 68.50 }, { day: '昨天', v: 68.40 }, { day: '今天', v: 68.25 },
  ],
  metrics: [
    { key: 'fat', name: '体脂率', v: 18.6, unit: '%', lv: '标准', min: 5, max: 35, lo: 11, hi: 22, icon: 'drop' },
    { key: 'muscle', name: '肌肉量', v: 52.1, unit: 'kg', lv: '标准', min: 40, max: 65, lo: 49.4, hi: 59.4, icon: 'barbell' },
    { key: 'water', name: '水分率', v: 55.2, unit: '%', lv: '标准', min: 45, max: 70, lo: 55, hi: 65, icon: 'drop-half' },
    { key: 'visceral', name: '内脏脂肪', v: 11, unit: '级', lv: '偏高', off: true, min: 1, max: 20, lo: 1, hi: 9.5, icon: 'heart' },
  ],
};
WB.icon = (name, size = 20, color = 'currentColor') =>
  window.ICONS[name].replace('<svg ', `<svg width="${size}" height="${size}" style="color:${color};display:block" `);
WB.fmt = m => Number.isInteger(m.v) ? String(m.v) : m.v.toFixed(1);
