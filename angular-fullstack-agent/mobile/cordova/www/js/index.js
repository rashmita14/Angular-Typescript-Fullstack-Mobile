(function () {
  'use strict';
  function onDeviceReady() {
    var status = document.getElementById('device-status');
    if (status) {
      status.textContent = 'Cordova is ready. Replace the placeholder API URL and integrate the Angular web build.';
    }
  }
  document.addEventListener('deviceready', onDeviceReady, false);
})();
