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

  // onDeath(callback: any): void {

  //   entity.onDeath(function () {
  //     console.info(this.id + " is dead");

  //     this.stop();
  //     this.isDying = true;

  //       this.setSprite(this.getSprite("death"));

  //     console.info(this.id + " was removed");

  //     this.removeEntity(this);

  //   });

  // }
}

export default Pet;
