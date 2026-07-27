// Bootstrap: wire everything together once the DOM is ready.
(function () {
  const BL = window.BL;

  function init() {
    BL.loadFromURL();
    BL.initControls();
    BL.applyConfigToInputs();
    BL.initLed(document.getElementById('stage'));
    BL.initBattery();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
