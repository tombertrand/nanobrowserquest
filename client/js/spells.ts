import { Types } from "../../shared/js/gametypes";
import Spell from "./spell";
import Timer from "./timer";

export const Spells = {
  DeathAngelSpell: class DeathAngelSpell extends Spell {
    constructor(id) {
      super(id, Types.Entities.DEATHANGELSPELL);
      this.moveSpeed = 150;
      this.atkSpeed = 100;
      this.idleSpeed = 100;
      this.atkRate = 2000;
      this.attackCooldown = new Timer(this.atkRate);
      this.aggroRange = 0;
    }

    // idle(orientation) {
    //   if (!this.hasTarget()) {
    //     super.idle(Types.Orientations.DOWN);
    //   } else {
    //     super.idle(orientation);
    //   }
    // }
  },
};

export default Spells;
