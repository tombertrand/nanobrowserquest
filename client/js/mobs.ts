import { Types } from "../../shared/js/gametypes";
import Mob from "./mob";
import Timer from "./timer";

export const Mobs = {
  Rat: class Rat extends Mob {
    constructor(id) {
      super(id, Types.Entities.RAT);
      this.moveSpeed = 350;
      this.idleSpeed = 700;
      this.shadowOffsetY = -2;
      this.isAggressive = false;
    }
  },

  Skeleton: class Skeleton extends Mob {
    constructor(id) {
      super(id, Types.Entities.SKELETON);
      this.moveSpeed = 350;
      this.atkSpeed = 100;
      this.idleSpeed = 800;
      this.shadowOffsetY = 1;
      this.setAttackRate(1300);
    }
  },

  Skeleton2: class Skeleton extends Mob {
    constructor(id) {
      super(id, Types.Entities.SKELETON2);
      this.moveSpeed = 200;
      this.atkSpeed = 100;
      this.idleSpeed = 800;
      this.walkSpeed = 200;
      this.shadowOffsetY = 1;
      this.setAttackRate(1300);
    }
  },

  Spectre: class Spectre extends Mob {
    constructor(id) {
      super(id, Types.Entities.SPECTRE);
      this.moveSpeed = 150;
      this.atkSpeed = 50;
      this.idleSpeed = 200;
      this.walkSpeed = 200;
      this.shadowOffsetY = 1;
      this.setAttackRate(900);
    }
  },

  Goblin: class Goblin extends Mob {
    constructor(id) {
      super(id, Types.Entities.GOBLIN);
      this.moveSpeed = 150;
      this.atkSpeed = 60;
      this.idleSpeed = 600;
      this.setAttackRate(700);
    }
  },

  Ogre: class Ogre extends Mob {
    constructor(id) {
      super(id, Types.Entities.OGRE);
      this.moveSpeed = 300;
      this.atkSpeed = 100;
      this.idleSpeed = 600;
    }
  },

  Crab: class Crab extends Mob {
    constructor(id) {
      super(id, Types.Entities.CRAB);
      this.moveSpeed = 200;
      this.atkSpeed = 40;
      this.idleSpeed = 500;
    }
  },

  Snake: class Snake extends Mob {
    constructor(id) {
      super(id, Types.Entities.SNAKE);
      this.moveSpeed = 200;
      this.atkSpeed = 40;
      this.idleSpeed = 250;
      this.walkSpeed = 100;
      this.shadowOffsetY = -4;
    }
  },

  Eye: class Eye extends Mob {
    constructor(id) {
      super(id, Types.Entities.EYE);
      this.moveSpeed = 200;
      this.atkSpeed = 40;
      this.idleSpeed = 50;
    }
  },

  Bat: class Bat extends Mob {
    constructor(id) {
      super(id, Types.Entities.BAT);
      this.moveSpeed = 120;
      this.atkSpeed = 90;
      this.idleSpeed = 90;
      this.walkSpeed = 85;
      this.isAggressive = false;
    }
  },

  Wizard: class Wizard extends Mob {
    constructor(id) {
      super(id, Types.Entities.WIZARD);
      this.moveSpeed = 200;
      this.atkSpeed = 100;
      this.idleSpeed = 150;
    }
  },

  Deathknight: class Deathknight extends Mob {
    constructor(id) {
      super(id, Types.Entities.DEATHKNIGHT);
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
    constructor(id) {
      super(id, Types.Entities.BOSS);
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
    constructor(id) {
      super(id, Types.Entities.RAT2);
      this.moveSpeed = 350;
      this.idleSpeed = 700;
      this.shadowOffsetY = -2;
      this.isAggressive = false;
    }
  },

  Bat2: class Bat2 extends Mob {
    constructor(id) {
      super(id, Types.Entities.BAT2);
      this.moveSpeed = 120;
      this.atkSpeed = 90;
      this.idleSpeed = 90;
      this.walkSpeed = 85;
      this.isAggressive = false;
    }
  },

  Goblin2: class Goblin2 extends Mob {
    constructor(id) {
      super(id, Types.Entities.GOBLIN2);
      this.moveSpeed = 150;
      this.atkSpeed = 60;
      this.idleSpeed = 600;
      this.setAttackRate(700);
    }
  },

  Yeti: class Yeti extends Mob {
    constructor(id) {
      super(id, Types.Entities.YETI);
      this.moveSpeed = 300;
      this.atkSpeed = 100;
      this.idleSpeed = 600;
    }
  },

  Werewolf: class Werewolf extends Mob {
    constructor(id) {
      super(id, Types.Entities.WEREWOLF);
      this.moveSpeed = 200;
      this.atkSpeed = 80;
      this.idleSpeed = 600;
    }
  },

  Skeleton3: class Skeleton3 extends Mob {
    constructor(id) {
      super(id, Types.Entities.SKELETON3);
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
    constructor(id) {
      super(id, Types.Entities.SKELETONCOMMANDER);
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
    constructor(id) {
      super(id, Types.Entities.SNAKE2);
      this.moveSpeed = 200;
      this.atkSpeed = 40;
      this.idleSpeed = 250;
      this.walkSpeed = 100;
      this.shadowOffsetY = -4;
      this.aggroRange = 3;
    }
  },

  Wraith: class Wraith extends Mob {
    constructor(id) {
      super(id, Types.Entities.WRAITH);
      this.atkSpeed = 50;
      this.moveSpeed = 220;
      this.walkSpeed = 100;
      this.idleSpeed = 450;
      this.setAttackRate(800);
      this.aggroRange = 3;
    }
  },

  Zombie: class Zombie extends Mob {
    constructor(id) {
      super(id, Types.Entities.ZOMBIE);
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
    constructor(id) {
      super(id, Types.Entities.NECROMANCER);
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
    constructor(id) {
      super(id, Types.Entities.COW);
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
    constructor(id) {
      super(id, Types.Entities.COWKING);
      this.moveSpeed = 200;
      this.atkSpeed = 100;
      this.idleSpeed = 800;
      this.walkSpeed = 200;
      this.shadowOffsetY = 1;
      this.aggroRange = 3;
      this.auras = ["thunderstorm"];
      this.resistances = Types.resistances[Types.Entities.COWKING];
      this.setAttackRate(1300);
    }
  },

  Minotaur: class Minotaur extends Mob {
    constructor(id) {
      super(id, Types.Entities.MINOTAUR);
      this.moveSpeed = 200;
      this.atkSpeed = 100;
      this.idleSpeed = 800;
      this.walkSpeed = 200;
      this.shadowOffsetY = 1;
      this.aggroRange = 5;
      this.auras = ["freeze"];
      this.resistances = Types.resistances[Types.Entities.MINOTAUR];
      this.setAttackRate(1300);
    }
  },
};

export default Mobs;
