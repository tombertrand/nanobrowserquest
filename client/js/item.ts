import { Types } from "../../shared/js/gametypes";
import Entity from "./entity";

class Item extends Entity {
  kind: any;
  itemKind: any;
  type: any;
  wasDropped: boolean;
  lootMessage: any;
  amount?: number;

  constructor(id, kind, type) {
    super(id, kind);

    this.itemKind = Types.getKindAsString(kind);
    this.type = type;
    this.wasDropped = false;
  }

  hasShadow() {
    return true;
  }

  getSpriteName(suffix = "") {
    return `item-${this.itemKind}${suffix}`;
  }

  getLootMessage() {
    if ([Types.Entities.GOLD, Types.Entities.NANOCOIN, Types.Entities.BANANOCOIN].includes(this.kind)) {
      return this.lootMessage.replace("amount", this.amount);
    }

    return this.lootMessage;
  }
}

export default Item;
