import Entity from "./entity";

class Item extends Entity {
  constructor(id, kind, type) {
    super(id, kind);

    this.itemKind = Types.getKindAsString(kind);
    this.type = type;
    this.wasDropped = false;
  }

  hasShadow() {
    return true;
  }

  onLoot() {}

  getSpriteName() {
    return "item-" + this.itemKind;
  }

  getLootMessage() {
    return this.lootMessage;
  }
}

export default Item;
