import Character from "./character";

class Pet extends Character {
  ownerId: number;

  constructor(id: number, kind: number, props) {
    super(id, kind);

    this.aggroRange = 0;
    this.castRange = null;
    this.type = "pet";
    this.name = "pet";

    Object.keys(props).forEach(prop => {
      this[prop] = props[prop];
    });
  }
}

export default Pet;
