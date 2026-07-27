// LED rendering engine: a single requestAnimationFrame loop that reads
// BL.config every frame and paints the indicator via CSS custom properties.
(function () {
  const BL = window.BL;
  let lastClass = '';

  BL.initLed = function (stage) {
    stage.innerHTML =
      '<div class="led-wrap">' +
        '<div class="led" id="led">' +
          '<div class="led-glow"></div>' +
          '<div class="led-core"></div>' +
          '<div class="led-ring r1"></div>' +
          '<div class="led-ring r2"></div>' +
        '</div>' +
      '</div>' +
      '<div class="led-status" id="ledStatus"></div>';
    requestAnimationFrame(loop);
  };

  const t0 = performance.now();

  function loop() {
    render((performance.now() - t0) / 1000);
    requestAnimationFrame(loop);
  }

  function render(t) {
    const led = document.getElementById('led');
    if (!led) return;

    const live = BL.config.useRealBattery ? BL.getLiveState() : null;
    const state = live ? live.state : BL.config.state;

    let color;
    switch (state) {
      case 'charging': color = BL.config.chargingColor; break;
      case 'full': color = BL.config.fullColor; break;
      case 'low': color = BL.config.lowColor; break;
      default: color = '#23232b';
    }

    let coreO = 1;
    let glowO = BL.config.glow;
    const sp = BL.config.speed;

    if (state === 'off') {
      coreO = 0.25;
      glowO = BL.config.glow * 0.2;
    } else if (BL.config.mode === 'breathing') {
      const x = 0.5 + 0.5 * Math.sin(2 * Math.PI * sp * 0.18 * t);
      coreO = 0.5 + 0.5 * x;
      glowO = BL.config.glow * (0.35 + 0.65 * x);
    } else if (BL.config.mode === 'pulse') {
      const ph = (t * sp) % 1;
      const p = Math.exp(-Math.pow((ph - 0.12) * 6, 2));
      coreO = 0.45 + 0.55 * p;
      glowO = BL.config.glow * (0.3 + 0.7 * p);
    } else if (BL.config.mode === 'solid') {
      coreO = 1;
      glowO = BL.config.glow;
    } else if (BL.config.mode === 'ripple') {
      coreO = 0.85;
      glowO = BL.config.glow * 0.8;
    }

    led.style.setProperty('--c', color);
    led.style.setProperty('--core-o', coreO.toFixed(3));
    led.style.setProperty('--glow-o', glowO.toFixed(3));
    led.style.setProperty('--sz', BL.config.size + 'px');
    led.style.setProperty('--ripple-dur', (3 / Math.max(0.2, sp)).toFixed(2) + 's');
    led.style.filter = 'brightness(' + BL.config.brightness + ')';

    const cls = 'led mode-' + BL.config.mode + (BL.config.deviceMock ? ' with-device' : '');
    if (cls !== lastClass) {
      led.className = cls;
      lastClass = cls;
    }

    // Status caption
    const st = document.getElementById('ledStatus');
    if (st) {
      const map = {
        charging: live ? '充电中' : '充电中 · 模拟',
        full: live ? '已充满' : '已充满 · 模拟',
        low: live ? '低电量' : '低电量 · 模拟',
        off: '熄灭'
      };
      let txt = map[state] || '';
      if (live) txt += ' · ' + Math.round(live.level * 100) + '%';
      st.textContent = txt;
    }
  }
})();
