import { Types } from "../../shared/js/gametypes";
import Character from "./character";

class Pet extends Character {
  ownerId: number;
  level: number;
  skin: number;
  idleTimeout: any;

  constructor(id: number, kind: number, props) {
    super(id, kind);

    this.aggroRange = 0;
    this.castRange = null;
    this.type = "pet";
    this.name = "pet";

    this.idleTimeout = null;

    Object.keys(props).forEach(prop => {
      this[prop] = props[prop];
    });
  }

  go(x, y) {
    if (this.isAttacking()) {
      this.disengage();
    } else if (this.followingMode) {
      this.followingMode = false;
      this.target = null;
    }
    this.moveTo_(x, y);

    this.setIdleAnimation();
  }

  setIdleAnimation() {
    clearTimeout(this.idleTimeout);

    const sitCount = Types.Entities.PET_BAT ? 1 : 5;

    this.idleTimeout = window.setTimeout(() => {
      this.animate("sit", this.idleSpeed, sitCount, () => {
        this.animate("liedown", this.idleSpeed);
      });
    }, 10000);
  }
}

export default Pet;
