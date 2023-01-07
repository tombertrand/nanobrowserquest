import { Types } from "../../shared/js/gametypes";
import Spell from "./spell";
import Timer from "./timer";

export const Spells = {
  MageSpell: class MageSpell extends Spell {
    constructor(id) {
      super(id, Types.Entities.MAGESPELL);
      this.moveSpeed = 130;
      this.atkSpeed = 250;
      this.idleSpeed = 100;
      this.atkRate = 2000;
      this.attackCooldown = new Timer(this.atkRate);
      this.aggroRange = 0;
    }
  },

  DeathAngelSpell: class DeathAngelSpell extends Spell {
    constructor(id) {
      super(id, Types.Entities.DEATHANGELSPELL);
      this.moveSpeed = 100;
      this.atkSpeed = 250;
      this.idleSpeed = 100;
      this.atkRate = 2000;
      this.attackCooldown = new Timer(this.atkRate);
      this.aggroRange = 0;
    }
  },
};

export default Spells;
