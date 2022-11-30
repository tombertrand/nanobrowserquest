import { Types } from "../../shared/js/gametypes";
import Character from "./character";

class Spell extends Character {
  element: Elements;

  constructor(id: number, kind: number) {
    super(id, kind);

    this.type = "spell";
  }

  getSpriteName(element?: Elements) {
    return `${Types.getKindAsString(this.kind)}${element ? `-${element}` : ""}`;
  }

  hasShadow() {
    return false;
  }
}

export default Spell;
