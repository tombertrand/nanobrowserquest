import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";

import type { Recipes } from "./types";

var Messages: any = {};
module.exports = Messages;

Messages.Spawn = class Message {
  constructor(private entity) {}
  serialize() {
    var spawn = [Types.Messages.SPAWN];
    return spawn.concat(this.entity.getState());
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
  constructor(private mobId) {
    this.mobId = mobId;
  }
  serialize() {
    return [Types.Messages.RAISE, this.mobId];
  }
};

Messages.CowLevelStart = class Message {
  constructor(private coords) {}
  serialize() {
    return [Types.Messages.COWLEVEL_START, this.coords.x, this.coords.y];
  }
};

Messages.CowLevelInProgress = class Message {
  constructor(private cowLevelClock) {}
  serialize() {
    return [Types.Messages.COWLEVEL_INPROGRESS, this.cowLevelClock];
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

Messages.MinotaurLevelInProgress = class Message {
  constructor(private minotaurLevelClock) {}
  serialize() {
    return [Types.Messages.MINOTAURLEVEL_INPROGRESS, this.minotaurLevelClock];
  }
};

Messages.MinotaurLevelEnd = class Message {
  constructor(private isCompleted) {}
  serialize() {
    return [Types.Messages.MINOTAURLEVEL_END];
  }
};

Messages.Health = class Message {
  constructor(private health) {}
  serialize() {
    return [Types.Messages.HEALTH, this.health.points, this.health.isRegen, this.health.isHurt];
  }
};

Messages.Frozen = class Message {
  constructor(private entityId, private freezeChanceLevel) {}
  serialize() {
    return [Types.Messages.FROZEN, this.entityId, this.freezeChanceLevel];
  }
};

Messages.Stats = class Message {
  constructor(private stats) {}
  serialize() {
    return [Types.Messages.STATS, this.stats.maxHitPoints, this.stats.damage, this.stats.defense, this.stats.absorb];
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
  constructor(private player, private skill, private level) {}
  serialize() {
    return [Types.Messages.SKILL, this.player.id, this.skill, this.level];
  }
};

Messages.Drop = class Message {
  constructor(private mob, private item) {}
  serialize() {
    var drop = [
      Types.Messages.DROP,
      this.mob.id,
      this.item.id,
      this.item.kind,
      _.map(this.mob.hateList, "id"),
      this.item.partyId,
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
    return [Types.Messages.KILL, this.mob.kind, this.level, this.playerExp, this.exp];
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

Messages.Trade = class Message {
  constructor(private action, private info) {}
  serialize() {
    return [Types.Messages.TRADE, this.action, this.info];
  }
};

Messages.PVP = class Message {
  constructor(private isPVP) {}
  serialize() {
    return [Types.Messages.PVP, this.isPVP];
  }
};

export default Messages;
