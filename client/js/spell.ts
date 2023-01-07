import { Types } from "../../shared/js/gametypes";
import Character from "./character";

class Spell extends Character {
  element: Elements;
  lastUpdate: number;
  casterId: number;

  constructor(id: number, kind: number) {
    super(id, kind);

    this.type = "spell";

    this.lastUpdate = Date.now();
    this.isFading = false;
  }

  getSpriteName(element?: Elements) {
    return `${Types.getKindAsString(this.kind)}${element ? `-${element}` : ""}`;
  }

  hasShadow() {
    return false;
  }

  setTarget(target: Character): void {
    if (!target) return;

    this.target = target;
  }

  getTimeDiff(): number {
    return (Date.now() - this.lastUpdate) / 1000;
  }

  die(hurtPlayer = false) {
    this.isDead = true;

    if (this.death_callback) {
      this.death_callback(hurtPlayer);
    }
  }
}

export default Spell;
