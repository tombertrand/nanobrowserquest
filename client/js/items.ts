import Item from "./item";

import { Types } from "../../shared/js/gametypes";

var Items = {
  Sword: class Sword extends Item {
    constructor(id) {
      super(id, Types.Entities.SWORD, "weapon");
      this.lootMessage = "You pick up a sword";
    }
  },

  Axe: class Axe extends Item {
    constructor(id) {
      super(id, Types.Entities.AXE, "weapon");
      this.lootMessage = "You pick up an axe";
    }
  },

  MorningStar: class MorningStar extends Item {
    constructor(id) {
      super(id, Types.Entities.MORNINGSTAR, "weapon");
      this.lootMessage = "You pick up a morning star";
    }
  },

  BlueAxe: class BlueAxe extends Item {
    constructor(id) {
      super(id, Types.Entities.BLUEAXE, "weapon");
      this.lootMessage = "You pick up a frozen axe";
    }
  },

  BlueMorningStar: class BlueMorningStar extends Item {
    constructor(id) {
      super(id, Types.Entities.BLUEMORNINGSTAR, "weapon");
      this.lootMessage = "You pick up a frozen morning star";
    }
  },

  RedSword: class RedSword extends Item {
    constructor(id) {
      super(id, Types.Entities.REDSWORD, "weapon");
      this.lootMessage = "You pick up a blazing sword";
    }
  },

  BlueSword: class BlueSword extends Item {
    constructor(id) {
      super(id, Types.Entities.BLUESWORD, "weapon");
      this.lootMessage = "You pick up a magic sword";
    }
  },

  GoldenSword: class GoldenSword extends Item {
    constructor(id) {
      super(id, Types.Entities.GOLDENSWORD, "weapon");
      this.lootMessage = "You pick up a golden sword";
    }
  },

  FrozenSword: class FrozenSword extends Item {
    constructor(id) {
      super(id, Types.Entities.FROZENSWORD, "weapon");
      this.lootMessage = "You pick up a Sapphire sword";
    }
  },

  DiamondSword: class DiamondSword extends Item {
    constructor(id) {
      super(id, Types.Entities.DIAMONDSWORD, "weapon");
      this.lootMessage = "You pick up a Diamond sword";
    }
  },

  LeatherArmor: class LeatherArmor extends Item {
    constructor(id) {
      super(id, Types.Entities.LEATHERARMOR, "armor");
      this.lootMessage = "You pick up a leather armor";
    }
  },

  MailArmor: class MailArmor extends Item {
    constructor(id) {
      super(id, Types.Entities.MAILARMOR, "armor");
      this.lootMessage = "You pick up a mail armor";
    }
  },

  PlateArmor: class PlateArmor extends Item {
    constructor(id) {
      super(id, Types.Entities.PLATEARMOR, "armor");
      this.lootMessage = "You pick up a plate armor";
    }
  },

  RedArmor: class RedArmor extends Item {
    constructor(id) {
      super(id, Types.Entities.REDARMOR, "armor");
      this.lootMessage = "You pick up a ruby armor";
    }
  },

  GoldenArmor: class GoldenArmor extends Item {
    constructor(id) {
      super(id, Types.Entities.GOLDENARMOR, "armor");
      this.lootMessage = "You pick up a golden armor";
    }
  },

  BlueArmor: class BlueArmor extends Item {
    constructor(id) {
      super(id, Types.Entities.BLUEARMOR, "armor");
      this.lootMessage = "You pick up a sapphire armor";
    }
  },

  FrozenArmor: class FrozenArmor extends Item {
    constructor(id) {
      super(id, Types.Entities.FROZENARMOR, "armor");
      this.lootMessage = "You pick up a frozen armor";
    }
  },

  HornedArmor: class HornedArmor extends Item {
    constructor(id) {
      super(id, Types.Entities.HORNEDARMOR, "armor");
      this.lootMessage = "You pick up a horned armor";
    }
  },

  BeltLeather: class BeltLeather extends Item {
    constructor(id) {
      super(id, Types.Entities.BELTLEATHER, "belt");
      this.lootMessage = "You pick up a leather belt";
    }
  },

  BeltPlated: class BeltPlated extends Item {
    constructor(id) {
      super(id, Types.Entities.BELTPLATED, "belt");
      this.lootMessage = "You pick up a plated belt";
    }
  },

  BeltFrozen: class BeltFrozen extends Item {
    constructor(id) {
      super(id, Types.Entities.BELTFROZEN, "belt");
      this.lootMessage = "You pick up a frozen belt";
    }
  },

  Flask: class Flask extends Item {
    constructor(id) {
      super(id, Types.Entities.FLASK, "object");
      this.lootMessage = "You drink a health potion";
    }
  },

  RejuvenationPotion: class RejuvenationPotion extends Item {
    constructor(id) {
      super(id, Types.Entities.REJUVENATIONPOTION, "object");
      this.lootMessage = "You drink a rejuvenation potion";
    }
  },

  PoisonPotion: class PoisonPotion extends Item {
    constructor(id) {
      super(id, Types.Entities.POISONPOTION, "object");
      this.lootMessage = "You drink a poisonous potion";
    }
  },

  NanoPotion: class NanoPotion extends Item {
    constructor(id) {
      super(id, Types.Entities.NANOPOTION, "object");
      this.lootMessage = "You drink a NANO potion";
    }
  },

  GemRuby: class GemRuby extends Item {
    constructor(id) {
      super(id, Types.Entities.GEMRUBY, "object");
      this.lootMessage = "You pick up a Ruby";
    }
  },

  GemEmerald: class GemEmerald extends Item {
    constructor(id) {
      super(id, Types.Entities.GEMEMERALD, "object");
      this.lootMessage = "You pick up an Emerald";
    }
  },

  GemAmethyst: class GemAmethyst extends Item {
    constructor(id) {
      super(id, Types.Entities.GEMAMETHYST, "object");
      this.lootMessage = "You pick up an Amethyst";
    }
  },

  GemTopaz: class GemTopaz extends Item {
    constructor(id) {
      super(id, Types.Entities.GEMTOPAZ, "object");
      this.lootMessage = "You pick up a Topaz";
    }
  },

  GemSapphire: class GemSapphire extends Item {
    constructor(id) {
      super(id, Types.Entities.GEMSAPPHIRE, "object");
      this.lootMessage = "You pick up a Sapphire";
    }
  },

  Gold: class Gold extends Item {
    constructor(id) {
      super(id, Types.Entities.GOLD, "object");
      this.lootMessage = "You pick up some gold";
    }
  },

  RingBronze: class RingBronze extends Item {
    constructor(id) {
      super(id, Types.Entities.RINGBRONZE, "ring");
      this.lootMessage = "You pick up a bronze ring";
    }
  },

  RingSilver: class RingSilver extends Item {
    constructor(id) {
      super(id, Types.Entities.RINGSILVER, "ring");
      this.lootMessage = "You pick up a silver ring";
    }
  },

  RingGold: class RingGold extends Item {
    constructor(id) {
      super(id, Types.Entities.RINGGOLD, "ring");
      this.lootMessage = "You pick up a gold ring";
    }
  },

  RingNecromancer: class RingNecromancer extends Item {
    constructor(id) {
      super(id, Types.Entities.RINGNECROMANCER, "ring");
      this.lootMessage = "You pick up a Necromancer Death Wish";
    }
  },

  RingRaiStone: class RingRaiStone extends Item {
    constructor(id) {
      super(id, Types.Entities.RINGRAISTONE, "ring");
      this.lootMessage = "You pick up a Rai Stone";
    }
  },

  RingFountain: class RingFountain extends Item {
    constructor(id) {
      super(id, Types.Entities.RINGFOUNTAIN, "ring");
      this.lootMessage = "You pick up a Fountain of Youth";
    }
  },

  AmuletSilver: class AmuletSilver extends Item {
    constructor(id) {
      super(id, Types.Entities.AMULETSILVER, "amulet");
      this.lootMessage = "You pick up a silver amulet";
    }
  },

  AmuletGold: class AmuletGold extends Item {
    constructor(id) {
      super(id, Types.Entities.AMULETGOLD, "amulet");
      this.lootMessage = "You pick up a gold amulet";
    }
  },

  AmuletCow: class AmuletCow extends Item {
    constructor(id) {
      super(id, Types.Entities.AMULETCOW, "amulet");
      this.lootMessage = "You pick up a Cow King Holy Talisman";
    }
  },

  ScrollUpgradeLow: class ScrollUpgradeLow extends Item {
    constructor(id) {
      super(id, Types.Entities.SCROLLUPGRADELOW, "scroll");
      this.lootMessage = "You pick up a low class upgrade scroll";
    }
  },

  ScrollUpgradeMedium: class ScrollUpgradeMedium extends Item {
    constructor(id) {
      super(id, Types.Entities.SCROLLUPGRADEMEDIUM, "scroll");
      this.lootMessage = "You pick up a medium class upgrade scroll";
    }
  },

  ScrollUpgradeHigh: class ScrollUpgradeHigh extends Item {
    constructor(id) {
      super(id, Types.Entities.SCROLLUPGRADEHIGH, "scroll");
      this.lootMessage = "You pick up a high class upgrade scroll";
    }
  },

  ScrollUpgradeBlessed: class ScrollUpgradeBlessed extends Item {
    constructor(id) {
      super(id, Types.Entities.SCROLLUPGRADEBLESSED, "scroll");
      this.lootMessage = "You pick up a blessed high class upgrade scroll";
    }
  },

  SkeletonKey: class SkeletonKey extends Item {
    constructor(id) {
      super(id, Types.Entities.SKELETONKEY, "object");
      this.lootMessage = "You pick up a skeleton key";
    }
  },

  RaiblocksTL: class RaiblocksTL extends Item {
    constructor(id) {
      super(id, Types.Entities.RAIBLOCKSTL, "object");
      this.lootMessage = "You pick up a Raiblocks artifact part";
    }
  },

  RaiblocksBL: class RaiblocksBL extends Item {
    constructor(id) {
      super(id, Types.Entities.RAIBLOCKSBL, "object");
      this.lootMessage = "You pick up a Raiblocks artifact part";
    }
  },

  RaiblocksBR: class RaiblocksBR extends Item {
    constructor(id) {
      super(id, Types.Entities.RAIBLOCKSBR, "object");
      this.lootMessage = "You pick up a Raiblocks artifact part";
    }
  },

  RaiblocksTR: class RaiblocksTR extends Item {
    constructor(id) {
      super(id, Types.Entities.RAIBLOCKSTR, "object");
      this.lootMessage = "You pick up a Raiblocks artifact part";
    }
  },

  WirtLeg: class WirtLeg extends Item {
    constructor(id) {
      super(id, Types.Entities.WIRTLEG, "object");
      this.lootMessage = "You pick up Wirt's leg";
    }
  },

  SkeletonKingCage: class SkeletonKingCage extends Item {
    constructor(id) {
      super(id, Types.Entities.SKELETONKINGCAGE, "object");
      this.lootMessage = "You pick up the Skeleton King's thoracic cage";
    }
  },

  NecromancerHeart: class NecromancerHeart extends Item {
    constructor(id) {
      super(id, Types.Entities.NECROMANCERHEART, "object");
      this.lootMessage = "You pick the Necromancer's heart";
    }
  },

  Cake: class Cake extends Item {
    constructor(id) {
      super(id, Types.Entities.CAKE, "object");
      this.lootMessage = "You eat a cake";
    }
  },

  Burger: class Burger extends Item {
    constructor(id) {
      super(id, Types.Entities.BURGER, "object");
      this.lootMessage = "You can haz rat burger";
    }
  },

  FirePotion: class FirePotion extends Item {
    constructor(id) {
      super(id, Types.Entities.FIREPOTION, "object");
      this.lootMessage = "You feel the power of Firefox!";
    }

    onLoot(player) {
      player.startInvincibility();
    }
  },
};

export default Items;
