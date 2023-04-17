import Entity from "./entity";

export interface ItemProps {
  kind: number;
  x: number;
  y: number;
  partyId?: number;
  level?: number;
  mobKind?: number;
  amount?: number;
}

class Item extends Entity {
  isStatic: boolean;
  isFromChest: boolean;
  blinkTimeout: NodeJS.Timeout;
  despawnTimeout: NodeJS.Timeout;
  respawnCallback: any;
  partyId?: number;
  level?: number;
  mobKind?: number;
  amount?: number;

  constructor({ id, kind, x, y, partyId, level, mobKind, amount }: ItemProps & { id: string }) {
    super(id, "item", kind, x, y);
    this.isStatic = false;
    this.isFromChest = false;
    this.partyId = partyId;
    this.level = level;
    this.mobKind = mobKind;

    if (amount) {
      this.amount = amount;
    }
  }

  handleDespawn(params) {
    var self = this;

    this.blinkTimeout = setTimeout(function () {
      params.blinkCallback();
      self.despawnTimeout = setTimeout(params.despawnCallback, params.blinkingDuration);
    }, params.beforeBlinkDelay);
  }

  destroy() {
    if (this.blinkTimeout) {
      clearTimeout(this.blinkTimeout);
    }
    if (this.despawnTimeout) {
      clearTimeout(this.despawnTimeout);
    }

    if (this.isStatic) {
      this.scheduleRespawn(30000);
    }
  }

  scheduleRespawn(delay) {
    var self = this;
    setTimeout(function () {
      if (self.respawnCallback) {
        self.respawnCallback();
      }
    }, delay);
  }

  onRespawn(callback) {
    this.respawnCallback = callback;
  }
}

export default Item;
