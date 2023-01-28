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
      this.isFading = false;
    }
  },

  Waypointx: class Waypointx extends Npc {
    constructor(id) {
      super(id, Types.Entities.WAYPOINTX);
      this.isFading = false;
    }
  },

  Waypointn: class Waypointn extends Npc {
    constructor(id) {
      super(id, Types.Entities.WAYPOINTN);
      this.isFading = false;
    }
  },

  Waypointo: class Waypointo extends Npc {
    constructor(id) {
      super(id, Types.Entities.WAYPOINTO);
      this.isFading = false;
    }
  },

  Stash: class Stash extends Npc {
    constructor(id) {
      super(id, Types.Entities.STASH);
      this.isFading = false;
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

  PortalStone: class PortalStone extends Npc {
    constructor(id) {
      super(id, Types.Entities.PORTALSTONE);
    }
  },

  PortalCrypt: class PortalCrypt extends Npc {
    constructor(id) {
      super(id, Types.Entities.PORTALCRYPT);
    }
    hasShadow() {
      return false;
    }
  },

  PortalRuins: class PortalRuins extends Npc {
    constructor(id) {
      super(id, Types.Entities.PORTALRUINS);
    }
    hasShadow() {
      return false;
    }
  },

  MagicStone: class MagicStone extends Npc {
    constructor(id) {
      super(id, Types.Entities.MAGICSTONE);
      this.raiseRate = 1300;
      this.isFading = false;
    }
    hasShadow() {
      return false;
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
      this.isFading = false;
    }
  },

  AltarInfinityStone: class AltarInfinityStone extends Npc {
    constructor(id) {
      super(id, Types.Entities.ALTARINFINITYSTONE);
      this.isFading = false;
    }
    hasShadow() {
      return false;
    }
  },

  SecretStairs: class SecretStairs extends Npc {
    constructor(id) {
      super(id, Types.Entities.SECRETSTAIRS);
    }
    hasShadow() {
      return false;
    }
  },

  SecretStairsUp: class SecretStairsUp extends Npc {
    constructor(id) {
      super(id, Types.Entities.SECRETSTAIRSUP);
      this.isFading = false;
    }
    hasShadow() {
      return false;
    }
  },

  TombDeathAngel: class TombDeathAngel extends Npc {
    constructor(id) {
      super(id, Types.Entities.TOMBDEATHANGEL);
      this.isFading = false;
    }
    hasShadow() {
      return false;
    }
  },

  TombAngel: class TombAngel extends Npc {
    constructor(id) {
      super(id, Types.Entities.TOMBANGEL);
      this.isFading = false;
    }
    hasShadow() {
      return false;
    }
  },

  TombCross: class TombCross extends Npc {
    constructor(id) {
      super(id, Types.Entities.TOMBCROSS);
      this.isFading = false;
    }
    hasShadow() {
      return false;
    }
  },

  TombSkull: class TombSkull extends Npc {
    constructor(id) {
      super(id, Types.Entities.TOMBSKULL);
      this.isFading = false;
    }
    hasShadow() {
      return false;
    }
  },

  Lever: class Lever extends Npc {
    constructor(id) {
      super(id, Types.Entities.LEVER);
      this.raiseRate = 500;
      this.isFading = false;
    }
    hasShadow() {
      return false;
    }
  },

  LeverWall: class LeverWall extends Npc {
    constructor(id) {
      super(id, Types.Entities.LEVERWALL);
      this.raiseRate = 500;
      this.isFading = false;
    }
    hasShadow() {
      return false;
    }
  },

  Grimoire: class Grimoire extends Npc {
    constructor(id) {
      super(id, Types.Entities.GRIMOIRE);
    }
    hasShadow() {
      return false;
    }
  },

  Tree: class Tree extends Npc {
    constructor(id) {
      super(id, Types.Entities.TREE);
    }
    hasShadow() {
      return false;
    }
  },
  Statue: class Statue extends Npc {
    constructor(id) {
      super(id, Types.Entities.STATUE);
    }
    hasShadow() {
      return false;
    }
  },
};

export default Npcs;
