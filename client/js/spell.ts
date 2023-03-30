import { Types } from "../../shared/js/gametypes";
import Character from "./character";

class Spell extends Character {
  element: Elements;
  lastUpdate: number;
  casterId: number;
  targetId?: number;
  angle: number;
  angled: boolean;

  constructor(id: number, kind: number) {
    super(id, kind);

    this.type = "spell";

    this.lastUpdate = Date.now();
    this.isFading = false;

    this.angled = [Types.Entities.ARROW].includes(kind);
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
    this.updateAngle();
  }

  getTimeDiff(): number {
    return (Date.now() - this.lastUpdate) / 1000;
  }

  updateAngle(): void {
    if (!this.target) return;

    this.angle = this.angled
      ? Math.atan2(this.target.y - this.y, this.target.x - this.x) * (180 / Math.PI) + 135
      : null;
  }

  getAngle(): number {
    return (this.angle * Math.PI) / 180;
  }

  die(hurtPlayer = false) {
    this.isDead = true;

    if (this.death_callback) {
      this.death_callback(hurtPlayer);
    }
  }
}

export default Spell;
