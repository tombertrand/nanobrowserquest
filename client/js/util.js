Function.prototype.bind = function (bind) {
  var self = this;
  return function () {
    var args = Array.prototype.slice.call(arguments);
    return self.apply(bind || null, args);
  };
};

var isInt = function (n) {
  return n % 1 === 0;
};

var TRANSITIONEND = "transitionend webkitTransitionEnd oTransitionEnd";

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (/* function */ callback, /* DOMElement */ element) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

var getUrlVars = function () {
  //from http://snipplr.com/view/19838/get-url-parameters/
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    vars[key] = value;
  });
  return vars;
};

const rawToRai = raw => {
  const value = new BigNumber(raw.toString());
  return value.shiftedBy(30 * -1).toNumber();
};

const raiToRaw = rai => {
  const value = new BigNumber(rai.toString());
  return value.shiftedBy(30).toNumber();
};

// 02LV are not present in addresses
const ACCOUNT_REGEX = /((nano|xrb)_)?[13][13-9a-km-uw-z]{59}/;

const isValidAccountAddress = address =>
  new RegExp(`^${ACCOUNT_REGEX.toString().replace(/\//g, "")}$`, "i").test(address);

const getAccountAddressFromText = text => {
  const [, address] =
    text.match(new RegExp(`[^sS]*?(${ACCOUNT_REGEX.toString().replace(/\//g, "")})[^sS]*?`, "i")) || [];
  return address;
};
