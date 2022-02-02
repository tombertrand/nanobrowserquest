var _ = require("underscore");
var cls = require("./lib/class");
var Types = require("../../shared/js/gametypes");

var Messages = {};
module.exports = Messages;

var Message = cls.Class.extend({});

Messages.Spawn = Message.extend({
  init: function (entity) {
    this.entity = entity;
  },
  serialize: function () {
    var spawn = [Types.Messages.SPAWN];
    return spawn.concat(this.entity.getState());
  },
});

Messages.Despawn = Message.extend({
  init: function (entityId) {
    this.entityId = entityId;
  },
  serialize: function () {
    return [Types.Messages.DESPAWN, this.entityId];
  },
});

Messages.Move = Message.extend({
  init: function (entity) {
    this.entity = entity;
  },
  serialize: function () {
    return [Types.Messages.MOVE, this.entity.id, this.entity.x, this.entity.y];
  },
});

Messages.LootMove = Message.extend({
  init: function (entity, item) {
    this.entity = entity;
    this.item = item;
  },
  serialize: function () {
    return [Types.Messages.LOOTMOVE, this.entity.id, this.item.id];
  },
});

Messages.Attack = Message.extend({
  init: function (attackerId, targetId) {
    this.attackerId = attackerId;
    this.targetId = targetId;
  },
  serialize: function () {
    return [Types.Messages.ATTACK, this.attackerId, this.targetId];
  },
});

Messages.Raise = Message.extend({
  init: function (mobId) {
    this.mobId = mobId;
  },
  serialize: function () {
    return [Types.Messages.RAISE, this.mobId];
  },
});

Messages.CowLevelStart = Message.extend({
  init: function () {},
  serialize: function () {
    return [Types.Messages.COWLEVEL_START];
  },
});

Messages.CowLevelEnd = Message.extend({
  init: function () {},
  serialize: function () {
    return [Types.Messages.COWLEVEL_END];
  },
});

Messages.Health = Message.extend({
  init: function ({ points, isRegen, isHurt }) {
    this.points = points;
    this.isRegen = isRegen;
    this.isHurt = isHurt;
  },
  serialize: function () {
    return [Types.Messages.HEALTH, this.points, this.isRegen, this.isHurt];
  },
});

Messages.Stats = Message.extend({
  init: function ({ maxHitPoints, damage, defense, absorb }) {
    this.maxHitPoints = maxHitPoints;
    this.damage = damage;
    this.defense = defense;
    this.absorb = absorb;
  },
  serialize: function () {
    return [Types.Messages.STATS, this.maxHitPoints, this.damage, this.defense, this.absorb];
  },
});

Messages.EquipItem = Message.extend({
  init: function (player, itemKind, itemLevel, itemBonus) {
    this.playerId = player.id;
    this.itemKind = itemKind;
    this.itemLevel = parseInt(itemLevel);
    this.itemBonus = itemBonus;
  },
  serialize: function () {
    return [Types.Messages.EQUIP, this.playerId, this.itemKind, this.itemLevel, this.itemBonus];
  },
});

Messages.Auras = Message.extend({
  init: function (player) {
    this.playerId = player.id;
    this.auras = player.auras;
  },
  serialize: function () {
    return [Types.Messages.AURAS, this.playerId, this.auras];
  },
});

Messages.Drop = Message.extend({
  init: function (mob, item) {
    this.mob = mob;
    this.item = item;
  },
  serialize: function () {
    var drop = [Types.Messages.DROP, this.mob.id, this.item.id, this.item.kind, _.map(this.mob.hateList, "id")];

    return drop;
  },
});

Messages.Chat = Message.extend({
  init: function (player, message, type) {
    this.playerId = player.id;
    this.name = player.name;
    this.message = message;
    this.type = type;
  },
  serialize: function () {
    return [Types.Messages.CHAT, this.playerId, this.name, this.message, this.type];
  },
});

Messages.Teleport = Message.extend({
  init: function (entity) {
    this.entity = entity;
  },
  serialize: function () {
    return [Types.Messages.TELEPORT, this.entity.id, this.entity.x, this.entity.y];
  },
});

Messages.AnvilUpgrade = Message.extend({
  init: function (isSuccess) {
    this.isSuccess = isSuccess;
  },
  serialize: function () {
    return [Types.Messages.ANVIL_UPGRADE, this.isSuccess];
  },
});

Messages.AnvilRecipe = Message.extend({
  init: function (recipe) {
    this.recipe = recipe;
  },
  serialize: function () {
    return [Types.Messages.ANVIL_RECIPE, this.recipe];
  },
});

Messages.Damage = Message.extend({
  init: function (entity, points, hp, maxHp, isCritical, isBlocked) {
    this.entity = entity;
    this.points = points;
    this.hp = hp;
    this.maxHitPoints = maxHp;
    this.isCritical = isCritical;
    this.isBlocked = isBlocked;
  },
  serialize: function () {
    return [
      Types.Messages.DAMAGE,
      this.entity.id,
      this.points,
      this.hp,
      this.maxHitPoints,
      this.isCritical,
      this.isBlocked,
    ];
  },
});

Messages.Population = Message.extend({
  init: function (world, total, players, levelupPlayer) {
    this.world = world;
    this.total = total;
    this.players = players;
    this.levelupPlayer = levelupPlayer;
  },
  serialize: function () {
    return [Types.Messages.POPULATION, this.world, this.total, this.players, this.levelupPlayer];
  },
});

Messages.Kill = Message.extend({
  init: function (mob, level, playerExp, exp) {
    this.mob = mob;
    this.level = level;
    this.playerExp = playerExp;
    this.exp = exp;
  },
  serialize: function () {
    return [Types.Messages.KILL, this.mob.kind, this.level, this.playerExp, this.exp];
  },
});

Messages.List = Message.extend({
  init: function (ids) {
    this.ids = ids;
  },
  serialize: function () {
    var list = this.ids;

    list.unshift(Types.Messages.LIST);
    return list;
  },
});

Messages.Destroy = Message.extend({
  init: function (entity) {
    this.entity = entity;
  },
  serialize: function () {
    return [Types.Messages.DESTROY, this.entity.id];
  },
});

Messages.Blink = Message.extend({
  init: function (item) {
    this.item = item;
  },
  serialize: function () {
    return [Types.Messages.BLINK, this.item.id];
  },
});

Messages.GuildError = Message.extend({
  init: function (errorType, guildName) {
    this.guildName = guildName;
    this.errorType = errorType;
  },
  serialize: function () {
    return [Types.Messages.GUILDERROR, this.errorType, this.guildName];
  },
});

Messages.Guild = Message.extend({
  init: function (action, info) {
    this.action = action;
    this.info = info;
  },
  serialize: function () {
    return [Types.Messages.GUILD, this.action].concat(this.info);
  },
});

Messages.PVP = Message.extend({
  init: function (isPVP) {
    this.isPVP = isPVP;
  },
  serialize: function () {
    return [Types.Messages.PVP, this.isPVP];
  },
});
