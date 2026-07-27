// Control panel wiring: presets, inputs, randomize, share link.
(function () {
  const BL = window.BL;

  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
      const c = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      return Math.round(255 * c).toString(16).padStart(2, '0');
    };
    return '#' + f(0) + f(8) + f(4);
  }

  BL.initControls = function () {
    const c = BL.config;

    // Preset dropdown
    const presetSel = document.getElementById('preset');
    Object.keys(BL.presets).forEach((key) => {
      const o = document.createElement('option');
      o.value = key;
      o.textContent = BL.presets[key].label;
      presetSel.appendChild(o);
    });
    presetSel.addEventListener('change', () => {
      const p = BL.presets[presetSel.value];
      if (!p) return;
      ['chargingColor', 'fullColor', 'lowColor', 'mode', 'speed', 'glow', 'brightness']
        .forEach((k) => { c[k] = p[k]; });
      BL.applyConfigToInputs();
      BL._toggleManual();
    });

    // Bind every input -> config
    const inputIds = [
      'size', 'mode', 'speed', 'glow', 'brightness',
      'chargingColor', 'fullColor', 'lowColor',
      'state', 'useRealBattery', 'deviceMock'
    ];
    inputIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const evt = (el.tagName === 'SELECT' || el.type === 'checkbox') ? 'change' : 'input';
      el.addEventListener(evt, () => {
        BL.readInputs();
        BL.applyConfigToInputs();
        if (id === 'useRealBattery') {
          BL._toggleManual();
          BL.initBattery();
        }
      });
    });

    // Randomize
    document.getElementById('randomBtn').addEventListener('click', () => {
      c.mode = ['breathing', 'pulse', 'ripple', 'solid'][Math.floor(Math.random() * 4)];
      const baseH = Math.floor(Math.random() * 360);
      c.chargingColor = hslToHex(baseH, 90, 55);
      c.fullColor = hslToHex((baseH + 140) % 360, 80, 55);
      c.lowColor = hslToHex((baseH + 200) % 360, 85, 55);
      c.speed = +(0.8 + Math.random() * 3).toFixed(1);
      c.glow = +(0.5 + Math.random() * 0.5).toFixed(2);
      BL.applyConfigToInputs();
    });

    // Share link
    document.getElementById('shareBtn').addEventListener('click', () => {
      const url = BL.encodeURL();
      history.replaceState(null, '', url);
      const hint = document.getElementById('shareHint');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          hint.textContent = '已复制分享链接 ✓';
          setTimeout(() => { if (hint.textContent === '已复制分享链接 ✓') hint.textContent = ''; }, 2000);
        }).catch(() => { hint.textContent = url; });
      } else {
        hint.textContent = url;
      }
    });

    // Show/hide the manual state selector depending on the signal source
    BL._toggleManual = function () {
      const wrap = document.getElementById('manualStateWrap');
      if (wrap) wrap.style.display = c.useRealBattery ? 'none' : '';
    };
    BL._toggleManual();
  };
})();
