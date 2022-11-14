import Character from "./character";

class Spell extends Character {
  element: "magic" | "flame" | "lightning" | "cold" | "poison" | "physical";

  constructor(id: number, kind: number) {
    super(id, kind);

    this.type = "spell";
  }

  setElement(element) {
    this.element = element;

    this.sprite.image.src = this.sprite.image.src.replace(
      /-?(?:magic|flame|lightning|cold|poison)?.png$/,
      element !== "physical" ? `-${element}.png` : ".png",
    );
  }

  hasShadow() {
    return false;
  }
}

export default Spell;
