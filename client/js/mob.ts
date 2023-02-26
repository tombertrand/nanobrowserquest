import { Types } from "../../shared/js/gametypes";
import Character from "./character";

class Mob extends Character {
  aggroRange: number;
  isAggressive: boolean;
  castRange?: number;
  hurtDelay: number;

  constructor(id: number, kind: number, props) {
    super(id, kind);

    this.aggroRange = 1;
    this.hurtDelay = 0;
    this.castRange = null;
    this.isAggressive = true;
    this.type = "mob";
    this.name = Types.getKindAsString(kind);

    Object.keys(props).forEach(prop => {
      this[prop] = props[prop];
    });
  }
}

export default Mob;
