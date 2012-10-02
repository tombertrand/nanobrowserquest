/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:false, undef:true,
    unused:true, curly:true, browser:true, node:true, indent:4, maxerr:50, camelcase: true,
    quotmark: single, trailing: true*/

var cls = require('./lib/class');
var Utils = require('./utils');

var Checkpoint = cls.Class.extend({
    init: function (id, x, y, width, height) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    },

    getRandomPosition: function () {
        var pos = {};

        pos.x = this.x + Utils.randomInt(0, this.width - 1);
        pos.y = this.y + Utils.randomInt(0, this.height - 1);
        return pos;
    }
});

module.exports = Checkpoint;
