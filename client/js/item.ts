import { Types } from "../../shared/js/gametypes";
import Entity from "./entity";

class Item extends Entity {
  kind: any;
  itemKind: any;
  type: any;
  wasDropped: boolean;
  lootMessage: any;
  amount?: number;
  skin?: number;

  constructor(id: number, kind: number, type: string, props?: any) {
    super(id, kind);

    this.itemKind = Types.getKindAsString(kind);
    this.type = type;
    this.wasDropped = false;

    this.skin = props?.skin || "";
  }

  hasShadow() {
    return true;
  }

  getSpriteName(skin = "") {
    if (skin || this.skin) {
      return `item-${this.itemKind}-${skin || this.skin}`;
    } else {
      return `item-${this.itemKind}`;
    }
  }

  getLootMessage({ amount }: { amount?: number } = {}) {
    if ([Types.Entities.GOLD, Types.Entities.NANOCOIN, Types.Entities.BANANOCOIN].includes(this.kind)) {
      return this.lootMessage.replace("amount", amount || this.amount);
    }

    return this.lootMessage;
  }
}

export default Item;
