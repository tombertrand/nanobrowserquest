define(["item"], function (Item) {
  var Items = {
    Sword2: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.SWORD2, "weapon");
        this.lootMessage = "You pick up a sword";
      },
    }),

    Axe: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.AXE, "weapon");
        this.lootMessage = "You pick up an axe";
      },
    }),

    BlueAxe: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.BLUEAXE, "weapon");
        this.lootMessage = "You pick up a frozen axe";
      },
    }),

    RedSword: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.REDSWORD, "weapon");
        this.lootMessage = "You pick up a blazing sword";
      },
    }),

    BlueSword: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.BLUESWORD, "weapon");
        this.lootMessage = "You pick up a magic sword";
      },
    }),

    GoldenSword: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.GOLDENSWORD, "weapon");
        this.lootMessage = "You pick up a golden sword";
      },
    }),

    MorningStar: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.MORNINGSTAR, "weapon");
        this.lootMessage = "You pick up a morning star";
      },
    }),

    LeatherArmor: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.LEATHERARMOR, "armor");
        this.lootMessage = "You pick up a leather armor";
      },
    }),

    MailArmor: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.MAILARMOR, "armor");
        this.lootMessage = "You pick up a mail armor";
      },
    }),

    PlateArmor: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.PLATEARMOR, "armor");
        this.lootMessage = "You pick up a plate armor";
      },
    }),

    RedArmor: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.REDARMOR, "armor");
        this.lootMessage = "You pick up a ruby armor";
      },
    }),

    GoldenArmor: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.GOLDENARMOR, "armor");
        this.lootMessage = "You pick up a golden armor";
      },
    }),

    FrozenArmor: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.FROZENARMOR, "armor");
        this.lootMessage = "You pick up a frozen armor";
      },
    }),

    HornedArmor: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.HORNEDARMOR, "armor");
        this.lootMessage = "You pick up a horned armor";
      },
    }),

    BeltLeather: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.BELTLEATHER, "armor");
        this.lootMessage = "You pick up a leather belt";
      },
    }),

    BeltPlated: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.BELTPLATED, "armor");
        this.lootMessage = "You pick up a plated belt";
      },
    }),

    Flask: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.FLASK, "object");
        this.lootMessage = "You drink a health potion";
      },
    }),

    NanoPotion: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.NANOPOTION, "object");
        this.lootMessage = "You drink a NANO potion";
      },
    }),

    GemRuby: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.GEMRUBY, "object");
        this.lootMessage = "You pick up a Ruby";
      },
    }),

    GemEmerald: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.GEMEMERALD, "object");
        this.lootMessage = "You pick up an Emerald";
      },
    }),

    GemAmethyst: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.GEMAMETHYST, "object");
        this.lootMessage = "You pick up an Amethyst";
      },
    }),

    GemTopaz: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.GEMTOPAZ, "object");
        this.lootMessage = "You pick up a Topaz";
      },
    }),

    GemSapphire: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.GEMSAPPHIRE, "object");
        this.lootMessage = "You pick up a Sapphire";
      },
    }),

    RingBronze: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.RINGBRONZE, "object");
        this.lootMessage = "You pick up a bronze ring";
      },
    }),

    RingSilver: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.RINGSILVER, "object");
        this.lootMessage = "You pick up a silver ring";
      },
    }),

    RingGold: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.RINGGOLD, "object");
        this.lootMessage = "You pick up a gold ring";
      },
    }),

    ScrollUpgradeLow: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.SCROLLUPGRADELOW, "object");
        this.lootMessage = "You pick up a low class upgrade scroll";
      },
    }),

    ScrollUpgradeMedium: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.SCROLLUPGRADEMEDIUM, "object");
        this.lootMessage = "You pick up a medium class upgrade scroll";
      },
    }),

    ScrollUpgradeHigh: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.SCROLLUPGRADEHIGH, "object");
        this.lootMessage = "You pick up a high class upgrade scroll";
      },
    }),

    Cake: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.CAKE, "object");
        this.lootMessage = "You eat a cake";
      },
    }),

    Burger: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.BURGER, "object");
        this.lootMessage = "You can haz rat burger";
      },
    }),

    FirePotion: Item.extend({
      init: function (id) {
        this._super(id, Types.Entities.FIREPOTION, "object");
        this.lootMessage = "You feel the power of Firefox!";
      },

      onLoot: function (player) {
        player.startInvincibility();
      },
    }),
  };

  return Items;
});
