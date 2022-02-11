import Npc from "./npc";

import { Types } from "../../shared/js/gametypes";

var Npcs = {
  Guard: class Guard extends Npc {
    constructor(id) {
      super(id, Types.Entities.GUARD, 1);
    }
  },

  King: class King extends Npc {
    constructor(id) {
      super(id, Types.Entities.KING, 1);
    }
  },

  Agent: class Agent extends Npc {
    constructor(id) {
      super(id, Types.Entities.AGENT, 1);
    }
  },

  Rick: class Rick extends Npc {
    constructor(id) {
      super(id, Types.Entities.RICK, 1);
    }
  },

  VillageGirl: class VillageGirl extends Npc {
    constructor(id) {
      super(id, Types.Entities.VILLAGEGIRL, 1);
    }
  },

  Villager: class Villager extends Npc {
    constructor(id) {
      super(id, Types.Entities.VILLAGER, 1);
    }
  },

  CarlosMatos: class CarlosMatos extends Npc {
    constructor(id) {
      super(id, Types.Entities.CARLOSMATOS, 1);
    }
  },

  Satoshi: class Satoshi extends Npc {
    constructor(id) {
      super(id, Types.Entities.SATOSHI, 1);
    }
  },

  Coder: class Coder extends Npc {
    constructor(id) {
      super(id, Types.Entities.CODER, 1);
    }
  },

  Scientist: class Scientist extends Npc {
    constructor(id) {
      super(id, Types.Entities.SCIENTIST, 1);
    }
  },

  Nyan: class Nyan extends Npc {
    constructor(id) {
      super(id, Types.Entities.NYAN, 1);
      this.idleSpeed = 50;
    }
  },

  Sorcerer: class Sorcerer extends Npc {
    constructor(id) {
      super(id, Types.Entities.SORCERER, 1);
      this.idleSpeed = 150;
    }
  },

  Priest: class Priest extends Npc {
    constructor(id) {
      super(id, Types.Entities.PRIEST, 1);
    }
  },

  BeachNpc: class BeachNpc extends Npc {
    constructor(id) {
      super(id, Types.Entities.BEACHNPC, 1);
    }
  },

  ForestNpc: class ForestNpc extends Npc {
    constructor(id) {
      super(id, Types.Entities.FORESTNPC, 1);
    }
  },

  DesertNpc: class DesertNpc extends Npc {
    constructor(id) {
      super(id, Types.Entities.DESERTNPC, 1);
    }
  },

  LavaNpc: class LavaNpc extends Npc {
    constructor(id) {
      super(id, Types.Entities.LAVANPC, 1);
    }
  },

  Octocat: class Octocat extends Npc {
    constructor(id) {
      super(id, Types.Entities.OCTOCAT, 1);
    }
  },

  Anvil: class Anvil extends Npc {
    constructor(id) {
      super(id, Types.Entities.ANVIL, 1);
    }
  },

  Waypointx: class Waypointx extends Npc {
    constructor(id) {
      super(id, Types.Entities.WAYPOINTX, 1);
    }
  },

  Waypointn: class Waypointn extends Npc {
    constructor(id) {
      super(id, Types.Entities.WAYPOINTN, 1);
    }
  },

  Stash: class Stash extends Npc {
    constructor(id) {
      super(id, Types.Entities.STASH, 1);
    }
  },

  CowPortal: class CowPortal extends Npc {
    constructor(id) {
      super(id, Types.Entities.COWPORTAL, 1);
    }
  },
};

export default Npcs;
