import { Types } from "../../shared/js/gametypes";
import Pet from "./pet";
// import Timer from "./timer";

export const Pets = {
  Dino: class Dino extends Pet {
    constructor(id, props: any = {}) {
      super(id, Types.Entities.PET_DINO, props);
      this.moveSpeed = 200;
      this.atkSpeed = 100;
      this.raiseSpeed = 125;
      this.idleSpeed = 100;
      this.atkRate = 2000;
      this.raiseRate = 1000;
      // this.attackCooldown = new Timer(this.atkRate);
      // this.raiseCooldown = new Timer(this.raiseRate);
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

  Bat: class Bat extends Pet {
    constructor(id, props: any = {}) {
      super(id, Types.Entities.PET_BAT, props);
      this.moveSpeed = 200;
      this.idleSpeed = 100;
    }
  },
  Cat: class Cat extends Pet {
    constructor(id, props: any = {}) {
      super(id, Types.Entities.PET_CAT, props);
      this.moveSpeed = 200;
      this.idleSpeed = 175;
    }
  },
  Dog: class Dog extends Pet {
    constructor(id, props: any = {}) {
      super(id, Types.Entities.PET_DOG, props);
      this.moveSpeed = 200;
      this.idleSpeed = 175;
    }
  },
  Turtle: class Turtle extends Pet {
    constructor(id, props: any = {}) {
      super(id, Types.Entities.PET_TURTLE, props);
      this.moveSpeed = 200;
      this.idleSpeed = 200;
    }
  },

  Duck: class Duck extends Pet {
    constructor(id, props: any = {}) {
      super(id, Types.Entities.PET_DUCK, props);
      this.moveSpeed = 200;
      this.idleSpeed = 200;
    }
  },

  Deer: class Deer extends Pet {
    constructor(id, props: any = {}) {
      super(id, Types.Entities.PET_DEER, props);
      this.moveSpeed = 200;
      this.idleSpeed = 200;
    }
  },

  ReinDeer: class ReinDeer extends Pet {
    constructor(id, props: any = {}) {
      super(id, Types.Entities.PET_REINDEER, props);
      this.moveSpeed = 200;
      this.idleSpeed = 200;
    }
  },

  Monkey: class  Monkey extends Pet {
    constructor(id, props: any = {}) {
      super(id, Types.Entities.PET_MONKEY, props);
      this.moveSpeed = 200;
      this.idleSpeed = 200;
    }
  },

  Hellhound: class Hellhound extends Pet {
    constructor(id, props: any = {}) {
      super(id, Types.Entities.PET_HELLHOUND, props);
      this.moveSpeed = 200;
      this.idleSpeed = 200;
    }
  },

  Dragon: class Dragon extends Pet {
    constructor(id, props: any = {}) {
      super(id, Types.Entities.PET_DRAGON, props);
      this.moveSpeed = 200;
      this.idleSpeed = 100;
    }
  },
  Axolotl: class Axolotl extends Pet {
    constructor(id, props: any = {}) {
      super(id, Types.Entities.PET_AXOLOTL, props);
      this.moveSpeed = 200;
      this.idleSpeed = 175;
    }
  },
  Fox: class Fox extends Pet {
    constructor(id, props: any = {}) {
      super(id, Types.Entities.PET_FOX, props);
      this.moveSpeed = 200;
      this.idleSpeed = 175;
    }
  },
  Mouse: class Mouse extends Pet {
    constructor(id, props: any = {}) {
      super(id, Types.Entities.PET_MOUSE, props);
      this.moveSpeed = 200;
      this.idleSpeed = 175;
    }
  },
  Hedgehog: class Hedgehog extends Pet {
    constructor(id, props: any = {}) {
      super(id, Types.Entities.PET_HEDGEHOG, props);
      this.moveSpeed = 200;
      this.idleSpeed = 175;
    }
  },
};

export default Pets;
