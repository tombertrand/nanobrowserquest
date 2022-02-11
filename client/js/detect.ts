var Detect: any = {};

Detect.supportsWebSocket = function () {
  return window.WebSocket || window.MozWebSocket;
};

Detect.userAgentContains = function (string: string) {
  return navigator.userAgent.indexOf(string) != -1;
};

Detect.isTablet = function (screenWidth: number) {
  if (screenWidth > 640) {
    if (
      (Detect.userAgentContains("Android") && Detect.userAgentContains("Firefox")) ||
      Detect.userAgentContains("Mobile")
    ) {
      return true;
    }
  }
  return false;
};

Detect.isWindows = function () {
  return Detect.userAgentContains("Windows");
};

Detect.isChromeOnWindows = function () {
  return Detect.userAgentContains("Chrome") && Detect.userAgentContains("Windows");
};

Detect.canPlayMP3 = function () {
  return true;
};

Detect.isSafari = function () {
  return Detect.userAgentContains("Safari") && !Detect.userAgentContains("Chrome");
};

Detect.isOpera = function () {
  return Detect.userAgentContains("Opera");
};

Detect.isFirefoxAndroid = function () {
  return Detect.userAgentContains("Android") && Detect.userAgentContains("Firefox");
};

export default Detect;
