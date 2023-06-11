import { Types } from "../../shared/js/gametypes";
import Mob from "./mob";
import Timer from "./timer";

export const Mobs = {
  Rat: class Rat extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.RAT, props);
      this.moveSpeed = 350;
      this.idleSpeed = 700;
      this.shadowOffsetY = -2;
      this.isAggressive = false;
    }
  },

  Skeleton: class Skeleton extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.SKELETON, props);
      this.moveSpeed = 350;
      this.atkSpeed = 100;
      this.idleSpeed = 800;
      this.shadowOffsetY = 1;
      this.setAttackRate(1300);
    }
  },

  Skeleton2: class Skeleton extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.SKELETON2, props);
      this.moveSpeed = 200;
      this.atkSpeed = 100;
      this.idleSpeed = 800;
      this.walkSpeed = 200;
      this.shadowOffsetY = 1;
      this.setAttackRate(1300);
    }
  },

  Spectre: class Spectre extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.SPECTRE, props);
      this.moveSpeed = 150;
      this.atkSpeed = 50;
      this.idleSpeed = 200;
      this.walkSpeed = 200;
      this.shadowOffsetY = 1;
      this.setAttackRate(900);
    }
  },

  Goblin: class Goblin extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.GOBLIN, props);
      this.moveSpeed = 150;
      this.atkSpeed = 60;
      this.idleSpeed = 600;
      this.setAttackRate(700);
    }
  },

  Ogre: class Ogre extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.OGRE, props);
      this.moveSpeed = 300;
      this.atkSpeed = 100;
      this.idleSpeed = 600;
    }
  },

  Crab: class Crab extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.CRAB, props);
      this.moveSpeed = 200;
      this.atkSpeed = 40;
      this.idleSpeed = 500;
    }
  },

  Snake: class Snake extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.SNAKE, props);
      this.moveSpeed = 200;
      this.atkSpeed = 40;
      this.idleSpeed = 250;
      this.walkSpeed = 100;
      this.shadowOffsetY = -4;
    }
  },

  Eye: class Eye extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.EYE, props);
      this.moveSpeed = 200;
      this.atkSpeed = 40;
      this.idleSpeed = 50;
    }
  },

  Bat: class Bat extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.BAT, props);
      this.moveSpeed = 120;
      this.atkSpeed = 90;
      this.idleSpeed = 90;
      this.walkSpeed = 85;
      this.isAggressive = false;
    }
  },

  Wizard: class Wizard extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.WIZARD, props);
      this.moveSpeed = 200;
      this.atkSpeed = 100;
      this.idleSpeed = 150;
    }
  },

  Deathknight: class Deathknight extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.DEATHKNIGHT, props);
      this.atkSpeed = 50;
      this.moveSpeed = 220;
      this.walkSpeed = 100;
      this.idleSpeed = 450;
      this.setAttackRate(800);
      this.aggroRange = 3;
    }

    idle(orientation) {
      if (!this.hasTarget()) {
        super.idle(Types.Orientations.DOWN);
      } else {
        super.idle(orientation);
      }
    }
  },

  Boss: class Boss extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.BOSS, props);
      this.moveSpeed = 300;
      this.atkSpeed = 50;
      this.idleSpeed = 400;
      this.atkRate = 2000;
      this.attackCooldown = new Timer(this.atkRate);
      this.aggroRange = 3;
    }

    idle(orientation) {
      if (!this.hasTarget()) {
        super.idle(Types.Orientations.DOWN);
      } else {
        super.idle(orientation);
      }
    }
  },

  Rat2: class Rat2 extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.RAT2, props);
      this.moveSpeed = 350;
      this.idleSpeed = 700;
      this.shadowOffsetY = -2;
      this.isAggressive = false;
    }
  },

  Bat2: class Bat2 extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.BAT2, props);
      this.moveSpeed = 120;
      this.atkSpeed = 90;
      this.idleSpeed = 90;
      this.walkSpeed = 85;
      this.isAggressive = false;
    }
  },

  Goblin2: class Goblin2 extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.GOBLIN2, props);
      this.moveSpeed = 150;
      this.atkSpeed = 60;
      this.idleSpeed = 600;
      this.setAttackRate(700);
    }
  },

  Yeti: class Yeti extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.YETI, props);
      this.moveSpeed = 300;
      this.atkSpeed = 100;
      this.idleSpeed = 600;
    }
  },

  Werewolf: class Werewolf extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.WEREWOLF, props);
      this.moveSpeed = 200;
      this.atkSpeed = 80;
      this.idleSpeed = 600;
    }
  },

  Skeleton3: class Skeleton3 extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.SKELETON3, props);
      this.moveSpeed = 200;
      this.atkSpeed = 100;
      this.idleSpeed = 800;
      this.walkSpeed = 200;
      this.shadowOffsetY = 1;
      this.aggroRange = 3;
      this.setAttackRate(1300);
    }
  },

  SkeletonCommander: class SkeletonCommander extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.SKELETONCOMMANDER, props);
      this.moveSpeed = 300;
      this.atkSpeed = 50;
      this.idleSpeed = 400;
      this.atkRate = 2000;
      this.attackCooldown = new Timer(this.atkRate);
      this.aggroRange = 3;
    }

    idle(orientation) {
      if (!this.hasTarget()) {
        super.idle(Types.Orientations.DOWN);
      } else {
        super.idle(orientation);
      }
    }
  },

  Snake2: class Snake2 extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.SNAKE2, props);
      this.moveSpeed = 200;
      this.atkSpeed = 40;
      this.idleSpeed = 250;
      this.walkSpeed = 100;
      this.shadowOffsetY = -4;
      this.aggroRange = 3;
    }
  },

  Wraith: class Wraith extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.WRAITH, props);
      this.atkSpeed = 50;
      this.moveSpeed = 220;
      this.walkSpeed = 100;
      this.idleSpeed = 450;
      this.setAttackRate(800);
      this.aggroRange = 3;
    }
  },

  Zombie: class Zombie extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.ZOMBIE, props);
      this.atkSpeed = 50;
      this.raiseSpeed = 250;
      this.moveSpeed = 220;
      this.walkSpeed = 100;
      this.idleSpeed = 450;
      this.setAttackRate(800);
      this.isAggressive = false;
    }

    idle(orientation) {
      if (!this.hasTarget()) {
        super.idle(Types.Orientations.DOWN);
      } else {
        super.idle(orientation);
      }
    }
  },

  Necromancer: class Necromancer extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.NECROMANCER, props);
      this.moveSpeed = 300;
      this.atkSpeed = 100;
      this.raiseSpeed = 250;
      this.idleSpeed = 400;
      this.atkRate = 2000;
      this.raiseRate = 1250;
      this.attackCooldown = new Timer(this.atkRate);
      this.raiseCooldown = new Timer(this.raiseRate);
      this.aggroRange = 3;
      this.auras = ["drainlife"];
    }

    idle(orientation) {
      if (!this.hasTarget()) {
        super.idle(Types.Orientations.DOWN);
      } else {
        super.idle(orientation);
      }
    }
  },

  Cow: class Cow extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.COW, props);
      this.moveSpeed = 200;
      this.atkSpeed = 100;
      this.idleSpeed = 800;
      this.walkSpeed = 200;
      this.shadowOffsetY = 1;
      this.aggroRange = 3;
      this.setAttackRate(1300);
    }
  },

  CowKing: class CowKing extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.COWKING, props);
      this.moveSpeed = 200;
      this.atkSpeed = 100;
      this.idleSpeed = 800;
      this.walkSpeed = 200;
      this.shadowOffsetY = 1;
      this.aggroRange = 3;
      this.auras = ["thunderstorm"];
      this.setAttackRate(1300);
    }
  },

  Minotaur: class Minotaur extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.MINOTAUR, props);
      this.moveSpeed = 200;
      this.atkSpeed = 100;
      this.idleSpeed = 800;
      this.walkSpeed = 200;
      this.shadowOffsetY = 1;
      this.aggroRange = 5;
      this.auras = ["freeze"];
      this.setAttackRate(1300);
    }
  },

  Rat3: class Rat3 extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.RAT3, props);
      this.moveSpeed = 350;
      this.idleSpeed = 700;
      this.shadowOffsetY = -2;
      this.isAggressive = true;
    }
  },

  Skeleton4: class Skeleton4 extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.SKELETON4, props);
      this.moveSpeed = 200;
      this.atkSpeed = 50;
      this.idleSpeed = 400;
      this.walkSpeed = 100;
      this.shadowOffsetY = 1;
      this.aggroRange = 2;
      this.setAttackRate(1300);
    }
  },

  Golem: class Golem extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.GOLEM, props);
      this.moveSpeed = 200;
      this.atkSpeed = 75;
      this.idleSpeed = 800;
      this.walkSpeed = 200;
      this.shadowOffsetY = 1;
      this.aggroRange = 2;
      this.hurtDelay = 500;
      this.setAttackRate(1600);
    }
  },

  Worm: class Worm extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.WORM, props);
      this.moveSpeed = 200;
      this.atkSpeed = 100;
      this.idleSpeed = 800;
      this.walkSpeed = 200;
      this.shadowOffsetY = 1;
      this.aggroRange = 4;
      this.setAttackRate(1300);
    }
    hasShadow() {
      return false;
    }
  },

  Snake3: class Snake3 extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.SNAKE3, props);
      this.moveSpeed = 200;
      this.atkSpeed = 40;
      this.idleSpeed = 250;
      this.walkSpeed = 100;
      this.shadowOffsetY = -4;
      this.aggroRange = 2;
    }
  },

  Snake4: class Snake4 extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.SNAKE4, props);
      this.moveSpeed = 200;
      this.atkSpeed = 40;
      this.idleSpeed = 250;
      this.walkSpeed = 100;
      this.shadowOffsetY = -4;
      this.aggroRange = 2;
    }
  },

  Wraith2: class Wraith2 extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.WRAITH2, props);
      this.atkSpeed = 50;
      this.moveSpeed = 220;
      this.walkSpeed = 100;
      this.idleSpeed = 450;
      this.setAttackRate(800);
      this.aggroRange = 2;
    }
  },

  Ghost: class Ghost extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.GHOST, props);
      this.atkSpeed = 50;
      this.moveSpeed = 220;
      this.walkSpeed = 100;
      this.idleSpeed = 450;
      this.setAttackRate(800);
      this.aggroRange = 4;
    }
  },

  Mage: class Mage extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.MAGE, props);
      this.atkSpeed = 50;
      this.moveSpeed = 200;
      this.walkSpeed = 100;
      this.idleSpeed = 250;
      this.raiseSpeed = 150;
      this.raiseRate = 1000;
      this.setAttackRate(800);
      this.raiseCooldown = new Timer(this.raiseRate);
      this.aggroRange = 4;
      this.castRange = 6;
    }
  },

  Shaman: class Shaman extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.SHAMAN, props);
      this.atkSpeed = 50;
      this.moveSpeed = 200;
      this.walkSpeed = 100;
      this.idleSpeed = 150;
      this.raiseSpeed = 75;
      this.raise2Speed = 35;
      this.raiseRate = 1800;
      this.setAttackRate(800);
      this.raiseCooldown = new Timer(this.raiseRate);
      this.aggroRange = 5;
      this.castRange = 6;
    }
  },

  SkeletonTemplar: class SkeletonTemplar extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.SKELETONTEMPLAR, props);
      this.atkSpeed = 50;
      this.moveSpeed = 200;
      this.walkSpeed = 100;
      this.idleSpeed = 150;
      this.setAttackRate(3000);
      this.aggroRange = 5;
    }
  },

  SkeletonTemplar2: class SkeletonTemplar2 extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.SKELETONTEMPLAR2, props);
      this.atkSpeed = 50;
      this.moveSpeed = 200;
      this.walkSpeed = 100;
      this.idleSpeed = 150;
      this.setAttackRate(3000);
      this.aggroRange = 5;
    }
  },

  Spider: class Spider extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.SPIDER, props);
      this.atkSpeed = 50;
      this.moveSpeed = 200;
      this.walkSpeed = 100;
      this.idleSpeed = 150;
      this.setAttackRate(1200);
      this.aggroRange = 3;
    }
  },

  Spider2: class Spider2 extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.SPIDER2, props);
      this.atkSpeed = 50;
      this.moveSpeed = 200;
      this.walkSpeed = 100;
      this.idleSpeed = 150;
      this.setAttackRate(1200);
      this.aggroRange = 3;
    }
  },

  SpiderQueen: class SpiderQueen extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.SPIDERQUEEN, props);
      this.atkSpeed = 75;
      this.moveSpeed = 200;
      this.walkSpeed = 100;
      this.idleSpeed = 150;
      this.setAttackRate(1500);
      this.aggroRange = 4;
    }
  },

  Butcher: class Butcher extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.BUTCHER, props);
      this.atkSpeed = 75;
      this.moveSpeed = 200;
      this.walkSpeed = 100;
      this.idleSpeed = 150;
      this.setAttackRate(1500);
      this.aggroRange = 5;
      this.hurtDelay = 100;
      this.taunt = "fresh-meat";
    }
  },

  Oculothorax: class Oculothorax extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.OCULOTHORAX, props);
      this.atkSpeed = 50;
      this.moveSpeed = 200;
      this.walkSpeed = 100;
      this.idleSpeed = 150;
      this.setAttackRate(1200);
      this.aggroRange = 2;
    }
  },

  Kobold: class Kobold extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.KOBOLD, props);
      this.atkSpeed = 50;
      this.moveSpeed = 200;
      this.walkSpeed = 100;
      this.idleSpeed = 150;
      this.setAttackRate(1200);
      this.aggroRange = 3;
    }
  },

  SkeletonBerserker: class SkeletonBerserker extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.SKELETONBERSERKER, props);
      this.atkSpeed = 50;
      this.moveSpeed = 200;
      this.walkSpeed = 100;
      this.idleSpeed = 150;
      this.setAttackRate(1200);
      this.aggroRange = 3;
    }
  },

  SkeletonArcher: class SkeletonArcher extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.SKELETONARCHER, props);
      this.atkSpeed = 50;
      this.moveSpeed = 200;
      this.walkSpeed = 100;
      this.idleSpeed = 250;
      this.raiseSpeed = 150;
      this.raiseRate = 1000;
      this.setAttackRate(800);
      this.raiseCooldown = new Timer(this.raiseRate);
      this.aggroRange = 4;
      this.castRange = 6;
    }
  },

  DeathBringer: class DeathBringer extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.DEATHBRINGER, props);
      this.moveSpeed = 400;
      this.atkSpeed = 100;
      this.raiseSpeed = 125;
      this.idleSpeed = 100;
      this.atkRate = 2000;
      this.raiseRate = 1000;
      this.attackCooldown = new Timer(this.atkRate);
      this.raiseCooldown = new Timer(this.raiseRate);
      this.aggroRange = 5;
      this.hurtDelay = 200;
    }

    idle(orientation) {
      if (!this.hasTarget()) {
        super.idle(Types.Orientations.DOWN);
      } else {
        super.idle(orientation);
      }
    }
  },

  DeathAngel: class DeathAngel extends Mob {
    constructor(id, props) {
      super(id, Types.Entities.DEATHANGEL, props);
      this.moveSpeed = 200;
      this.atkSpeed = 100;
      this.raiseSpeed = 125;
      this.idleSpeed = 100;
      this.atkRate = 2000;
      this.raiseRate = 1000;
      this.attackCooldown = new Timer(this.atkRate);
      this.raiseCooldown = new Timer(this.raiseRate);
      this.aggroRange = 5;
      this.hurtDelay = 200;
      // @TODO prevent monster heal aura
      // this.auras = ["drainlife", "lowerresistance"];
    }

    idle(orientation) {
      if (!this.hasTarget()) {
        super.idle(Types.Orientations.DOWN);
      } else {
        super.idle(orientation);
      }
    }
  },
};

export default Mobs;
