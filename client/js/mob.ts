import { Types } from "../../shared/js/gametypes";
import Character from "./character";

class Mob extends Character {
  aggroRange: number;
  isAggressive: boolean;
  castRange?: number;
  hurtDelay: number;

  constructor(id: number, kind: number) {
    super(id, kind);

    this.aggroRange = 1;
    this.hurtDelay = 0;
    this.castRange = null;
    this.isAggressive = true;
    this.type = "mob";
    this.name = Types.getKindAsString(kind);
    this.resistances = this.resistances || Types.getResistance(this);
  }
}

export default Mob;
