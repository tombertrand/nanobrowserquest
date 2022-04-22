import Character from "./character";

class Mob extends Character {
  aggroRange: number;
  isAggressive: boolean;

  constructor(id: number, kind: number) {
    super(id, kind);

    this.aggroRange = 1;
    this.isAggressive = true;
    this.type = "mob";
  }
}

export default Mob;
