import BigNumber from "bignumber.js";

Function.prototype.bind = function (bind) {
  var self = this;
  return function () {
    var args = Array.prototype.slice.call(arguments);
    return self.apply(bind || null, args);
  };
};

export var isInt = function (n: number) {
  return n % 1 === 0;
};

export var TRANSITIONEND = "transitionend webkitTransitionEnd oTransitionEnd";

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (/* function */ callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

export const rawToRai = (raw: string | number, network: Network) => {
  const decimals = network === "nano" ? 30 : 29;
  const value = new BigNumber(raw.toString());
  return value.shiftedBy(decimals * -1).toNumber();
};

export const raiToRaw = (rai: string | number, network: Network) => {
  const decimals = network === "nano" ? 30 : 29;
  const value = new BigNumber(rai.toString());
  return value.shiftedBy(decimals).toNumber();
};

export function copyToClipboard(text: string) {
  var sampleTextarea = document.createElement("textarea");
  document.body.appendChild(sampleTextarea);
  sampleTextarea.value = text; //save main text in it
  sampleTextarea.select(); //select textarea contenrs
  document.execCommand("copy");
  document.body.removeChild(sampleTextarea);
}

export function randomRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}
