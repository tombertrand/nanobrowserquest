import Entity from "./entity";
import { Types } from "../../shared/js/gametypes";

class Item extends Entity {
  kind: any;
  itemKind: any;
  type: any;
  wasDropped: boolean;
  lootMessage: any;

  constructor(id, kind, type) {
    super(id, kind);

    this.itemKind = Types.getKindAsString(kind);
    this.type = type;
    this.wasDropped = false;
  }

  hasShadow() {
    return true;
  }

  getSpriteName() {
    return "item-" + this.itemKind;
  }

  getLootMessage() {
    return this.lootMessage;
  }
}

export default Item;
