import _ from "lodash";

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

  PortalGateway: class PortalGateway extends Npc {
    constructor(id) {
      super(id, Types.Entities.PORTALGATEWAY);
    }
    hasShadow() {
      return false;
    }
  },

  GatewayFx: class GatewayFx extends Npc {
    constructor(id) {
      super(id, Types.Entities.GATEWAYFX);

      this.raiseSpeed = 125;
      this.idleSpeed = 250;
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

  AltarSoulStone: class AltarSoulStone extends Npc {
    constructor(id) {
      super(id, Types.Entities.ALTARSOULSTONE);
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

  SecretStairs2: class SecretStairs2 extends Npc {
    constructor(id) {
      super(id, Types.Entities.SECRETSTAIRS2);
    }
    // hasShadow() {
    //   return false;
    // }
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

  Lever2: class Lever2 extends Npc {
    constructor(id) {
      super(id, Types.Entities.LEVER2);
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
      this.isFading = false;
    }
    hasShadow() {
      return false;
    }
  },

  Fossil: class Fossil extends Npc {
    constructor(id) {
      super(id, Types.Entities.FOSSIL);
      this.isFading = false;
    }
    hasShadow() {
      return false;
    }
  },

  Hands: class Hands extends Npc {
    constructor(id) {
      super(id, Types.Entities.HANDS);
      this.isFading = false;
    }
    hasShadow() {
      return false;
    }
  },

  Alkor: class Alkor extends Npc {
    constructor(id) {
      super(id, Types.Entities.ALKOR);
      this.isFading = false;
    }
  },

  Olaf: class Olaf extends Npc {
    constructor(id) {
      super(id, Types.Entities.OLAF);
      this.isFading = false;
    }
  },

  Victor: class Victor extends Npc {
    constructor(id) {
      super(id, Types.Entities.VICTOR);
      this.isFading = false;
    }
  },

  Fox: class Fox extends Npc {
    constructor(id) {
      super(id, Types.Entities.FOX);
      this.isFading = false;

      this.playRandomAnimation();
    }

    playRandomAnimation() {
      const animations = ["walk", "idle", "atk", "raise", "unraise"];

      this.animate(_.shuffle(animations)[0], 100, 15);

      setTimeout(() => {
        this.playRandomAnimation();
      }, 10_000);
    }
  },

  Tree: class Tree extends Npc {
    constructor(id) {
      super(id, Types.Entities.TREE);
      this.isFading = false;
    }
    hasShadow() {
      return false;
    }
  },

  Trap: class Trap extends Npc {
    constructor(id) {
      super(id, Types.Entities.TRAP);
      this.isFading = false;
    }
    hasShadow() {
      return false;
    }
  },

  Trap2: class Trap2 extends Npc {
    constructor(id) {
      super(id, Types.Entities.TRAP2);
      this.isFading = false;
    }
    hasShadow() {
      return false;
    }
  },

  Trap3: class Trap3 extends Npc {
    constructor(id) {
      super(id, Types.Entities.TRAP3);
      this.isFading = false;
    }
    hasShadow() {
      return false;
    }
  },

  Statue: class Statue extends Npc {
    constructor(id) {
      super(id, Types.Entities.STATUE);
      this.isFading = false;
    }
    hasShadow() {
      return false;
    }
  },

  Statue2: class Statue2 extends Npc {
    constructor(id) {
      super(id, Types.Entities.STATUE2);
      this.isFading = false;
    }
    hasShadow() {
      return false;
    }
  },
};

export default Npcs;
