// Global state + config for Apple Battery LED.
// Uses a single `window.BL` namespace so the tool also runs from file://
// (ES modules are blocked there by browser CORS).
(function () {
  const BL = (window.BL = window.BL || {});

  // ---- Default configuration -------------------------------------------------
  BL.DEFAULT_CONFIG = {
    size: 140,            // LED diameter in px
    mode: 'breathing',    // solid | breathing | pulse | ripple
    speed: 1.6,           // animation speed multiplier
    glow: 0.85,           // glow intensity 0..1
    brightness: 1,        // overall brightness 0.3..1.5
    chargingColor: '#ff9f0a', // amber, Apple's classic charging color
    fullColor: '#34c759',     // green, fully charged
    lowColor: '#ff3b30',      // red, low battery warning
    state: 'charging',    // charging | full | low | off (manual mode)
    useRealBattery: false,// use navigator.getBattery() when available
    deviceMock: false     // draw the recessed port bezel
  };

  // ---- Built-in presets ------------------------------------------------------
  BL.presets = {
    apple: {
      label: 'Apple 经典',
      chargingColor: '#ff9f0a', fullColor: '#34c759', lowColor: '#ff3b30',
      mode: 'breathing', speed: 1.6, glow: 0.85, brightness: 1
    },
    midnight: {
      label: 'Midnight',
      chargingColor: '#5ac8fa', fullColor: '#30d158', lowColor: '#ff453a',
      mode: 'breathing', speed: 1.3, glow: 0.9, brightness: 1.05
    },
    sunset: {
      label: 'Sunset',
      chargingColor: '#ff9f0a', fullColor: '#ffd60a', lowColor: '#ff375f',
      mode: 'pulse', speed: 1.8, glow: 0.95, brightness: 1.1
    },
    neon: {
      label: 'Neon',
      chargingColor: '#bf5af2', fullColor: '#64d2ff', lowColor: '#ff375f',
      mode: 'ripple', speed: 1.4, glow: 1, brightness: 1.15
    },
    matrix: {
      label: 'Matrix',
      chargingColor: '#30d158', fullColor: '#30d158', lowColor: '#ff453a',
      mode: 'solid', speed: 1, glow: 0.6, brightness: 1
    }
  };

  BL.config = Object.assign({}, BL.DEFAULT_CONFIG);

  const KEYS = [
    'size', 'mode', 'speed', 'glow', 'brightness',
    'chargingColor', 'fullColor', 'lowColor',
    'state', 'useRealBattery', 'deviceMock'
  ];

  // ---- Shareable link (encode config into the URL hash) ----------------------
  BL.loadFromURL = function () {
    if (location.hash && location.hash.indexOf('#c=') === 0) {
      try {
        const json = decodeURIComponent(atob(location.hash.slice(3)));
        const data = JSON.parse(json);
        KEYS.forEach((k) => { if (k in data) BL.config[k] = data[k]; });
        return true;
      } catch (e) {
        console.warn('Bad share link, ignoring.', e);
      }
    }
    return false;
  };

  BL.encodeURL = function () {
    const data = {};
    KEYS.forEach((k) => { data[k] = BL.config[k]; });
    return (
      location.origin + location.pathname +
      '#c=' + btoa(encodeURIComponent(JSON.stringify(data)))
    );
  };

  // ---- Bind config <-> DOM ---------------------------------------------------
  BL.applyConfigToInputs = function () {
    const c = BL.config;
    KEYS.forEach((k) => {
      const el = document.getElementById(k);
      if (!el) return;
      if (el.type === 'checkbox') el.checked = !!c[k];
      else el.value = c[k];
    });
    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    set('sizeVal', c.size + 'px');
    set('speedVal', (+c.speed).toFixed(1) + 'x');
    set('glowVal', Math.round(c.glow * 100) + '%');
    set('brightnessVal', Math.round(c.brightness * 100) + '%');
  };

  BL.readInputs = function () {
    const c = BL.config;
    KEYS.forEach((k) => {
      const el = document.getElementById(k);
      if (!el) return;
      if (el.type === 'checkbox') c[k] = el.checked;
      else if (el.type === 'range' || el.type === 'number') c[k] = parseFloat(el.value);
      else c[k] = el.value;
    });
  };
})();
