import Character from "./character";

class Spell extends Character {
  // aggroRange: number;
  // isAggressive: boolean;
  element: "magic" | "flame" | "lightning" | "cold" | "poison" | "physical";

  constructor(id: number, kind: number) {
    super(id, kind);

    // this.aggroRange = 1;
    // this.isAggressive = true;
    this.type = "spell";
  }a

  setElement(element) {
    this.element = element;
  }

  hasShadow() {
    return false;
  }
}

export default Spell;
