import { Types } from "../../shared/js/gametypes";
import Npc from "./npc";

var Npcs = {
  Guard: class Guard extends Npc {
    constructor(id) {
      super(id, Types.Entities.GUARD);
    }
  },

  King: class King extends Npc {
    constructor(id) {
      super(id, Types.Entities.KING);
    }
  },

  Agent: class Agent extends Npc {
    constructor(id) {
      super(id, Types.Entities.AGENT);
    }
  },

  Rick: class Rick extends Npc {
    constructor(id) {
      super(id, Types.Entities.RICK);
    }
  },

  VillageGirl: class VillageGirl extends Npc {
    constructor(id) {
      super(id, Types.Entities.VILLAGEGIRL);
    }
  },

  Villager: class Villager extends Npc {
    constructor(id) {
      super(id, Types.Entities.VILLAGER);
    }
  },

  CarlosMatos: class CarlosMatos extends Npc {
    constructor(id) {
      super(id, Types.Entities.CARLOSMATOS);
    }
  },

  Satoshi: class Satoshi extends Npc {
    constructor(id) {
      super(id, Types.Entities.SATOSHI);
    }
  },

  Coder: class Coder extends Npc {
    constructor(id) {
      super(id, Types.Entities.CODER);
    }
  },

  Scientist: class Scientist extends Npc {
    constructor(id) {
      super(id, Types.Entities.SCIENTIST);
    }
  },

  Nyan: class Nyan extends Npc {
    constructor(id) {
      super(id, Types.Entities.NYAN);
      this.idleSpeed = 50;
    }
  },

  Sorcerer: class Sorcerer extends Npc {
    constructor(id) {
      super(id, Types.Entities.SORCERER);
      this.idleSpeed = 150;
    }
  },

  Priest: class Priest extends Npc {
    constructor(id) {
      super(id, Types.Entities.PRIEST);
    }
  },

  BeachNpc: class BeachNpc extends Npc {
    constructor(id) {
      super(id, Types.Entities.BEACHNPC);
    }
  },

  ForestNpc: class ForestNpc extends Npc {
    constructor(id) {
      super(id, Types.Entities.FORESTNPC);
    }
  },

  DesertNpc: class DesertNpc extends Npc {
    constructor(id) {
      super(id, Types.Entities.DESERTNPC);
    }
  },

  LavaNpc: class LavaNpc extends Npc {
    constructor(id) {
      super(id, Types.Entities.LAVANPC);
    }
  },

  Octocat: class Octocat extends Npc {
    constructor(id) {
      super(id, Types.Entities.OCTOCAT);
    }
  },

  Anvil: class Anvil extends Npc {
    constructor(id) {
      super(id, Types.Entities.ANVIL);
    }
  },

  Waypointx: class Waypointx extends Npc {
    constructor(id) {
      super(id, Types.Entities.WAYPOINTX);
    }
  },

  Waypointn: class Waypointn extends Npc {
    constructor(id) {
      super(id, Types.Entities.WAYPOINTN);
    }
  },

  Waypointo: class Waypointo extends Npc {
    constructor(id) {
      super(id, Types.Entities.WAYPOINTO);
    }
  },

  Stash: class Stash extends Npc {
    constructor(id) {
      super(id, Types.Entities.STASH);
    }
  },

  PortalCow: class PortalCow extends Npc {
    constructor(id) {
      super(id, Types.Entities.PORTALCOW);
    }
  },

  PortalMinotaur: class PortalMinotaur extends Npc {
    constructor(id) {
      super(id, Types.Entities.PORTALMINOTAUR);
    }
  },

  PortalTemple: class PortalTemple extends Npc {
    constructor(id) {
      super(id, Types.Entities.PORTALTEMPLE);
    }
  },

  PortalDeathAngel: class PortalDeathAngel extends Npc {
    constructor(id) {
      super(id, Types.Entities.PORTALDEATHANGEL);
    }
    hasShadow() {
      return false;
    }
  },

  MagicStone: class MagicStone extends Npc {
    constructor(id) {
      super(id, Types.Entities.MAGICSTONE);
      this.raiseRate = 1300;
    }
  },

  BlueFlame: class BlueFlame extends Npc {
    constructor(id) {
      super(id, Types.Entities.BLUEFLAME);
      this.raiseRate = 1300;
    }
    hasShadow() {
      return false;
    }
  },

  AltarChalice: class AltarChalice extends Npc {
    constructor(id) {
      super(id, Types.Entities.ALTARCHALICE);
      this.raiseRate = 1300;
    }
  },

  AltarInfinityStone: class AltarInfinityStone extends Npc {
    constructor(id) {
      super(id, Types.Entities.ALTARINFINITYSTONE);
    }
  },

  SecretStairs: class SecretStairs extends Npc {
    constructor(id) {
      super(id, Types.Entities.SECRETSTAIRS);
    }
  },

  SecretStairsUp: class SecretStairsUp extends Npc {
    constructor(id) {
      super(id, Types.Entities.SECRETSTAIRSUP);
    }
  },

  DeathAngelTomb: class DeathAngelTomb extends Npc {
    constructor(id) {
      super(id, Types.Entities.DEATHANGELTOMB);
    }
    hasShadow() {
      return false;
    }
  },

  Lever: class Lever extends Npc {
    constructor(id) {
      super(id, Types.Entities.LEVER);
      this.raiseRate = 500;
    }
  },
};

export default Npcs;
