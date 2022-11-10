import Character from "./character";

class Spell extends Character {
  // aggroRange: number;
  // isAggressive: boolean;

  constructor(id: number, kind: number) {
    super(id, kind);

    // this.aggroRange = 1;
    // this.isAggressive = true;
    this.type = "spell";
  }
}

export default Spell;
