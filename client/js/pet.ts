import { Types } from "../../shared/js/gametypes";
import Character from "./character";

class Pet extends Character {
  ownerId: number;
  level: number;
  skin: number;
  itemKind:string;
  isPet:boolean
  idleTimeout: any;

  constructor(id: number, kind: number, props) {
    super(id, kind);

    this.aggroRange = 0;
    this.castRange = null;
    this.type = "pet";
    this.name = "pet";
    this.isPet = true

    this.itemKind = Types.getKindAsString(kind);

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

  getSpriteName(skin?: string) {
    return `${Types.getKindAsString(this.kind)}${skin ? `-${skin}` : ""}`;
  }
}

export default Pet;
