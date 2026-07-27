// Live battery integration via navigator.getBattery().
// Maps the device battery to indicator states and degrades gracefully
// when the API is unavailable (Firefox / Safari).
(function () {
  const BL = window.BL;
  let battery = null;

  BL.getLiveState = function () { return null; };

  BL.initBattery = function () {
    if (!BL.config.useRealBattery) {
      BL.getLiveState = function () { return null; };
      return;
    }
    if (!('getBattery' in navigator)) {
      const hint = document.getElementById('shareHint');
      if (hint) {
        hint.textContent = '当前浏览器不支持电量 API（建议 Chrome / Edge）';
        setTimeout(() => { if (hint.textContent.indexOf('电量 API') >= 0) hint.textContent = ''; }, 3200);
      }
      BL.getLiveState = function () { return null; };
      return;
    }
    if (battery) return;

    navigator.getBattery().then((b) => {
      battery = b;
      const refresh = () => {};
      b.addEventListener('levelchange', refresh);
      b.addEventListener('chargingchange', refresh);
    }).catch(() => { battery = null; });

    BL.getLiveState = function () {
      if (!battery) return null;
      const lvl = battery.level;
      const charging = battery.charging;
      let state;
      if (charging && lvl >= 0.999) state = 'full';
      else if (charging) state = 'charging';
      else if (lvl <= 0.2) state = 'low';
      else state = 'off';
      return { state, level: lvl, charging };
    };
  };
})();
