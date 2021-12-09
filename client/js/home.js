define(["lib/class", "lib/underscore.min", "lib/stacktrace", "util"], function () {
  requirejs.config({
    shim: {
      "lib/jquery.ui.touch-punch": {
        deps: ["lib/jquery-ui", "lib/jquery.snowfall"],
      },
    },
  });

  require(["main"]);
});
