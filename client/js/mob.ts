import { Types } from "../../shared/js/gametypes";
import Character from "./character";

class Mob extends Character {
  aggroRange: number;
  isAggressive: boolean;

  constructor(id: number, kind: number) {
    super(id, kind);

    this.aggroRange = 1;
    this.isAggressive = true;
    this.type = "mob";
    this.name = Types.getKindAsString(kind);
    this.resistances = Types.getResistance(this);
  }
}

export default Mob;
