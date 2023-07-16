import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";

// import type { Recipes } from "./types";

var Messages: any = {};
module.exports = Messages;

Messages.Spawn = class Message {
  constructor(private entity) {}
  serialize() {
    return [Types.Messages.SPAWN, this.entity.getState()];
  }
};

Messages.SpawnBatch = class Message {
  constructor(private entities) {}
  serialize() {
    var spawn = [Types.Messages.SPAWN_BATCH];
    return spawn.concat(this.entities.map(entity => entity.getState()));
  }
};

Messages.Despawn = class Message {
  constructor(private entityId) {}
  serialize() {
    return [Types.Messages.DESPAWN, this.entityId];
  }
};

Messages.Move = class Message {
  constructor(private entity) {}
  serialize() {
    return [Types.Messages.MOVE, this.entity.id, this.entity.x, this.entity.y];
  }
};

Messages.LootMove = class Message {
  constructor(private entity, private item) {}
  serialize() {
    return [Types.Messages.LOOTMOVE, this.entity.id, this.item.id];
  }
};

Messages.Attack = class Message {
  constructor(private attackerId, private targetId) {}
  serialize() {
    return [Types.Messages.ATTACK, this.attackerId, this.targetId];
  }
};

Messages.Raise = class Message {
  constructor(private mobId, private targetId) {}
  serialize() {
    return [Types.Messages.RAISE, this.mobId, this.targetId];
  }
};

Messages.Unraise = class Message {
  constructor(private mobId, private targetId) {}
  serialize() {
    return [Types.Messages.UNRAISE, this.mobId];
  }
};

Messages.Taunt = class Message {
  constructor(private mobId) {}
  serialize() {
    return [Types.Messages.TAUNT, this.mobId];
  }
};

Messages.CowLevelStart = class Message {
  constructor(private coords) {}
  serialize() {
    return [Types.Messages.COWLEVEL_START, this.coords.x, this.coords.y];
  }
};

Messages.CowLevelEnd = class Message {
  constructor(private isCompleted) {}
  serialize() {
    return [Types.Messages.COWLEVEL_END, this.isCompleted];
  }
};

Messages.MinotaurLevelStart = class Message {
  constructor(private coords) {}
  serialize() {
    return [Types.Messages.MINOTAURLEVEL_START];
  }
};

Messages.MinotaurLevelEnd = class Message {
  constructor(private isCompleted) {}
  serialize() {
    return [Types.Messages.MINOTAURLEVEL_END];
  }
};

Messages.ChaliceLevelStart = class Message {
  constructor(private coords) {}
  serialize() {
    return [Types.Messages.CHALICELEVEL_START];
  }
};

Messages.ChaliceLevelEnd = class Message {
  constructor(private isCompleted) {}
  serialize() {
    return [Types.Messages.CHALICELEVEL_END, this.isCompleted];
  }
};

Messages.TempleLevelStart = class Message {
  constructor(private coords) {}
  serialize() {
    return [Types.Messages.TEMPLELEVEL_START];
  }
};

Messages.TempleLevelEnd = class Message {
  constructor() {}
  serialize() {
    return [Types.Messages.TEMPLELEVEL_END];
  }
};

Messages.StoneLevelStart = class Message {
  constructor(private coords) {}
  serialize() {
    return [Types.Messages.STONELEVEL_START];
  }
};

Messages.StoneLevelEnd = class Message {
  constructor(private isCompleted) {}
  serialize() {
    return [Types.Messages.STONELEVEL_END];
  }
};

Messages.GatewayLevelStart = class Message {
  constructor(private coords) {}
  serialize() {
    return [Types.Messages.GATEWAYLEVEL_START];
  }
};

Messages.GatewayLevelEnd = class Message {
  constructor(private isCompleted) {}
  serialize() {
    return [Types.Messages.GATEWAYLEVEL_END];
  }
};

Messages.LevelInProgress = class Message {
  constructor(private levelClock, private level: TimedLevel) {}
  serialize() {
    return [Types.Messages.LEVEL_INPROGRESS, this.levelClock, this.level];
  }
};

Messages.Health = class Message {
  constructor(private health) {}
  serialize() {
    return [Types.Messages.HEALTH, this.health];
  }
};

Messages.HealthEntity = class Message {
  constructor(private health) {}
  serialize() {
    return [Types.Messages.HEALTH_ENTITY, this.health];
  }
};

Messages.Frozen = class Message {
  constructor(private entityId, private duration) {}
  serialize() {
    return [Types.Messages.FROZEN, this.entityId, this.duration];
  }
};

Messages.Slowed = class Message {
  constructor(private entityId, private duration) {}
  serialize() {
    return [Types.Messages.SLOWED, this.entityId, this.duration];
  }
};

Messages.Poisoned = class Message {
  constructor(private entityId, private duration) {}
  serialize() {
    return [Types.Messages.POISONED, this.entityId, this.duration];
  }
};

Messages.Cursed = class Message {
  constructor(private entityId, private curseId, private duration) {}
  serialize() {
    return [Types.Messages.CURSED, this.entityId, this.curseId, this.duration];
  }
};

Messages.Stats = class Message {
  constructor(private stats) {}
  serialize() {
    return [Types.Messages.STATS, this.stats];
  }
};

Messages.SetBonus = class Message {
  constructor(private bonus) {}
  serialize() {
    return [Types.Messages.SETBONUS, this.bonus];
  }
};

Messages.Settings = class Message {
  constructor(private player, private settings) {}
  serialize() {
    return [Types.Messages.SETTINGS, this.player.id, this.settings];
  }
};

Messages.EquipItem = class Message {
  constructor(private player, private item) {}
  serialize() {
    return [Types.Messages.EQUIP, this.player.id, this.item];
  }
};

Messages.Auras = class Message {
  constructor(private player) {}
  serialize() {
    return [Types.Messages.AURAS, this.player.id, this.player.auras];
  }
};

Messages.Skill = class Message {
  constructor(private player, private skill) {}
  serialize() {
    return [Types.Messages.SKILL, this.player.id, this.skill];
  }
};

Messages.Drop = class Message {
  constructor(private mob, private item) {}
  serialize() {
    var drop = [
      Types.Messages.DROP,
      {
        mobId: this.mob.id,
        itemId: this.item.id,
        kind: this.item.kind,
        mobHateList: _.map(this.mob.hateList, "id"),
        partyId: this.item.partyId,
        ...(this.item.amount ? { amount: this.item.amount } : null),
      },
    ];

    return drop;
  }
};

Messages.Chat = class Message {
  constructor(private player, private message, private type) {}
  serialize() {
    return [Types.Messages.CHAT, this.player.id, this.player.name, this.message, this.type];
  }
};

Messages.Teleport = class Message {
  constructor(private entity) {}
  serialize() {
    return [Types.Messages.TELEPORT, this.entity.id, this.entity.x, this.entity.y];
  }
};

Messages.AnvilUpgrade = class Message {
  constructor(private isSuccess) {}
  serialize() {
    return [Types.Messages.ANVIL_UPGRADE, this.isSuccess];
  }
};

Messages.AnvilRecipe = class Message {
  constructor(private recipe: Recipes) {}
  serialize() {
    return [Types.Messages.ANVIL_RECIPE, this.recipe];
  }
};

Messages.AnvilOdds = class Message {
  constructor(private message) {}
  serialize() {
    return [Types.Messages.ANVIL_ODDS, this.message];
  }
};

Messages.Damage = class Message {
  constructor(private entity, private dmg, private hp, private maxHitPoints, private isCritical, private isBlocked) {}
  serialize() {
    return [
      Types.Messages.DAMAGE,
      this.entity.id,
      this.dmg,
      this.hp,
      this.maxHitPoints,
      this.isCritical,
      this.isBlocked,
    ];
  }
};

Messages.Population = class Message {
  constructor(private players, private levelupPlayer) {}
  serialize() {
    return [Types.Messages.POPULATION, this.players, this.levelupPlayer];
  }
};

Messages.Kill = class Message {
  constructor(private mob, private level, private playerExp, private exp) {}
  serialize() {
    return [
      Types.Messages.KILL,
      {
        kind: this.mob.kind,
        level: this.level,
        playerExp: this.playerExp,
        exp: this.exp,
        isMiniBoss: !!(this.mob.enchants?.length >= 3) && !Types.isBoss(this.mob.kind),
      },
    ];
  }
};

Messages.List = class Message {
  constructor(private ids) {}
  serialize() {
    var list = this.ids;

    list.unshift(Types.Messages.LIST);
    return list;
  }
};

Messages.Destroy = class Message {
  constructor(private entity) {}
  serialize() {
    return [Types.Messages.DESTROY, this.entity.id];
  }
};

Messages.Blink = class Message {
  constructor(private item) {}
  serialize() {
    return [Types.Messages.BLINK, this.item.id];
  }
};

Messages.Party = class Message {
  constructor(private action, private info) {}
  serialize() {
    return [Types.Messages.PARTY, this.action].concat(this.info);
  }
};

Messages.SoulStone = class Message {
  constructor(private item) {}
  serialize() {
    return [Types.Messages.SOULSTONE, this.item];
  }
};

Messages.Trade = class Message {
  constructor(private action, private info) {}
  serialize() {
    return [Types.Messages.TRADE, this.action, this.info];
  }
};

Messages.MerchantLog = class Message {
  constructor(private log) {}
  serialize() {
    return [Types.Messages.MERCHANT.LOG, this.log];
  }
};

export default Messages;
