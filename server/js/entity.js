/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:false, undef:true,
    unused:true, curly:true, browser:true, node:true, indent:4, maxerr:50, camelcase: true,
    quotmark: single, trailing: true*/

var cls = require('./lib/class');
var Messages = require('./message');
var Utils = require('./utils');

var Entity = cls.Class.extend({
    init: function (id, type, kind, x, y) {
        this.id = parseInt(id, 10);
        this.type = type;
        this.kind = kind;
        this.x = x;
        this.y = y;
    },

    destroy: function () {

    },

    _getBaseState: function () {
        return [
            parseInt(this.id, 10),
            this.kind,
            this.x,
            this.y
        ];
    },

    getState: function () {
        return this._getBaseState();
    },

    spawn: function () {
        return new Messages.Spawn(this);
    },

    despawn: function () {
        return new Messages.Despawn(this.id);
    },

    setPosition: function (x, y) {
        this.x = x;
        this.y = y;
    },

    getPositionNextTo: function (entity) {
        var pos = null;
        if (entity) {
            pos = {};
            // This is a quick & dirty way to give mobs a random position
            // close to another entity.
            var r = Utils.random(4);

            pos.x = entity.x;
            pos.y = entity.y;
            if (r === 0) {
                pos.y -= 1;
            }
            if (r === 1) {
                pos.y += 1;
            }
            if (r === 2) {
                pos.x -= 1;
            }
            if (r === 3) {
                pos.x += 1;
            }
        }
        return pos;
    }
});

module.exports = Entity;

