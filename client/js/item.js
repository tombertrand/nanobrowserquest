define(["entity"], function (Entity) {
  var Item = Entity.extend({
    init: function (id, kind, type) {
      this._super(id, kind);

      this.itemKind = Types.getKindAsString(kind);
      this.type = type;
      this.wasDropped = false;
    },

    hasShadow: function () {
      return true;
    },

    onLoot: function () {},

    getSpriteName: function () {
      return "item-" + this.itemKind;
    },

    getLootMessage: function () {
      return this.lootMessage;
    },
  });

  return Item;
});
