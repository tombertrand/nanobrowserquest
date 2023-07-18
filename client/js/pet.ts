import Character from "./character";

class Pet extends Character {
  owner: string;

  constructor(id: number, kind: number, props) {
    super(id, kind);

    this.aggroRange = 0;
    this.castRange = null;
    this.type = "pet";
    this.name = "pet";
    this.owner = "a player name";

    Object.keys(props).forEach(prop => {
      this[prop] = props[prop];
    });
  }
}

export default Pet;
