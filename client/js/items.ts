import { Types } from "../../shared/js/gametypes";
import Item from "./item";

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
      this.lootMessage = "You pick up a sapphire sword";
    }
  },

  DiamondSword: class DiamondSword extends Item {
    constructor(id) {
      super(id, Types.Entities.DIAMONDSWORD, "weapon");
      this.lootMessage = "You pick up a diamond sword";
    }
  },

  MinotaurAxe: class MinotaurAxe extends Item {
    constructor(id) {
      super(id, Types.Entities.MINOTAURAXE, "weapon");
      this.lootMessage = "You pick up a minotaur axe";
    }
  },

  EmeraldSword: class EmeraldSword extends Item {
    constructor(id) {
      super(id, Types.Entities.EMERALDSWORD, "weapon");
      this.lootMessage = "You pick up an emerald sword";
    }
  },

  MoonSword: class MoonSword extends Item {
    constructor(id) {
      super(id, Types.Entities.MOONSWORD, "weapon");
      this.lootMessage = "You pick up a moon partisan";
    }
  },

  TemplarSword: class TemplarSword extends Item {
    constructor(id) {
      super(id, Types.Entities.TEMPLARSWORD, "weapon");
      this.lootMessage = "You pick up a templar sword";
    }
  },

  SpikeGlaive: class SpikeGlaive extends Item {
    constructor(id) {
      super(id, Types.Entities.SPIKEGLAIVE, "weapon");
      this.lootMessage = "You pick up a spike glaive";
    }
  },

  EclypseDagger: class EclypseDagger extends Item {
    constructor(id) {
      super(id, Types.Entities.ECLYPSEDAGGER, "weapon");
      this.lootMessage = "You pick up an eclypse dagger";
    }
  },

  DemonAxe: class DemonAxe extends Item {
    constructor(id) {
      super(id, Types.Entities.DEMONAXE, "weapon");
      this.lootMessage = "You pick up a demon axe";
    }
  },

  PaladinAxe: class PaladinAxe extends Item {
    constructor(id) {
      super(id, Types.Entities.PALADINAXE, "weapon");
      this.lootMessage = "You pick up a paladin axe";
    }
  },

  ImmortalSword: class ImmortalSword extends Item {
    constructor(id) {
      super(id, Types.Entities.IMMORTALSWORD, "weapon");
      this.lootMessage = "You pick up an immortal sword";
    }
  },

  ExecutionerSword: class ExecutionerSword extends Item {
    constructor(id) {
      super(id, Types.Entities.EXECUTIONERSWORD, "weapon");
      this.lootMessage = "You pick up an executioner sword";
    }
  },

  MysticalSword: class MysticalSword extends Item {
    constructor(id) {
      super(id, Types.Entities.MYSTICALSWORD, "weapon");
      this.lootMessage = "You pick up a mystical sword";
    }
  },

  DragonSword: class DragonSword extends Item {
    constructor(id) {
      super(id, Types.Entities.DRAGONSWORD, "weapon");
      this.lootMessage = "You pick up a dragon sword";
    }
  },

  HellHammer: class HellHammer extends Item {
    constructor(id) {
      super(id, Types.Entities.HELLHAMMER, "weapon");
      this.lootMessage = "You pick up a hell hammer";
    }
  },

  HelmLeather: class HelmLeather extends Item {
    constructor(id) {
      super(id, Types.Entities.HELMLEATHER, "helm");
      this.lootMessage = "You pick up a leather helm";
    }
  },

  HelmMail: class HelmMail extends Item {
    constructor(id) {
      super(id, Types.Entities.HELMMAIL, "helm");
      this.lootMessage = "You pick up a mail helm";
    }
  },

  HelmPlate: class HelmPlate extends Item {
    constructor(id) {
      super(id, Types.Entities.HELMPLATE, "helm");
      this.lootMessage = "You pick up a plate helm";
    }
  },

  HelmRed: class HelmRed extends Item {
    constructor(id) {
      super(id, Types.Entities.HELMRED, "helm");
      this.lootMessage = "You pick up a ruby helm";
    }
  },

  HelmGolden: class HelmGolden extends Item {
    constructor(id) {
      super(id, Types.Entities.HELMGOLDEN, "helm");
      this.lootMessage = "You pick up a golden helm";
    }
  },

  HelmBlue: class HelmBlue extends Item {
    constructor(id) {
      super(id, Types.Entities.HELMBLUE, "helm");
      this.lootMessage = "You pick up a frozen helm";
    }
  },

  HelmHorned: class HelmHorned extends Item {
    constructor(id) {
      super(id, Types.Entities.HELMHORNED, "helm");
      this.lootMessage = "You pick up a horned helm";
    }
  },

  HelmFrozen: class HelmFrozen extends Item {
    constructor(id) {
      super(id, Types.Entities.HELMFROZEN, "helm");
      this.lootMessage = "You pick up a sapphire helm";
    }
  },

  HelmDiamond: class HelmDiamond extends Item {
    constructor(id) {
      super(id, Types.Entities.HELMDIAMOND, "helm");
      this.lootMessage = "You pick up a diamond helm";
    }
  },

  HelmEmerald: class HelmEmerald extends Item {
    constructor(id) {
      super(id, Types.Entities.HELMEMERALD, "helm");
      this.lootMessage = "You pick up an emerald helm";
    }
  },

  HelmTemplar: class HelmTemplar extends Item {
    constructor(id) {
      super(id, Types.Entities.HELMTEMPLAR, "helm");
      this.lootMessage = "You pick up a templar helm";
    }
  },

  HelmDragon: class HelmDragon extends Item {
    constructor(id) {
      super(id, Types.Entities.HELMDRAGON, "helm");
      this.lootMessage = "You pick up a dragon helm";
    }
  },

  HelmMoon: class HelmMoon extends Item {
    constructor(id) {
      super(id, Types.Entities.HELMMOON, "helm");
      this.lootMessage = "You pick up a moon helm";
    }
  },

  HelmDemon: class HelmDemon extends Item {
    constructor(id) {
      super(id, Types.Entities.HELMDEMON, "helm");
      this.lootMessage = "You pick up a demon helm";
    }
  },

  HelmMystical: class HelmMystical extends Item {
    constructor(id) {
      super(id, Types.Entities.HELMMYSTICAL, "helm");
      this.lootMessage = "You pick up a mystical helm";
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
      this.lootMessage = "You pick up a frozen armor";
    }
  },

  HornedArmor: class HornedArmor extends Item {
    constructor(id) {
      super(id, Types.Entities.HORNEDARMOR, "armor");
      this.lootMessage = "You pick up a horned armor";
    }
  },

  FrozenArmor: class FrozenArmor extends Item {
    constructor(id) {
      super(id, Types.Entities.FROZENARMOR, "armor");
      this.lootMessage = "You pick up a sapphire armor";
    }
  },

  DiamondArmor: class DiamondArmor extends Item {
    constructor(id) {
      super(id, Types.Entities.DIAMONDARMOR, "armor");
      this.lootMessage = "You pick up a diamond armor";
    }
  },

  EmeraldArmor: class EmeraldArmor extends Item {
    constructor(id) {
      super(id, Types.Entities.EMERALDARMOR, "armor");
      this.lootMessage = "You pick up an emerald armor";
    }
  },

  TemplarArmor: class TemplarArmor extends Item {
    constructor(id) {
      super(id, Types.Entities.TEMPLARARMOR, "armor");
      this.lootMessage = "You pick up a templar armor";
    }
  },

  DragonArmor: class DragonArmor extends Item {
    constructor(id) {
      super(id, Types.Entities.DRAGONARMOR, "armor");
      this.lootMessage = "You pick up a dragon armor";
    }
  },

  MoonArmor: class MoonArmor extends Item {
    constructor(id) {
      super(id, Types.Entities.MOONARMOR, "armor");
      this.lootMessage = "You pick up a moon armor";
    }
  },

  DemonArmor: class DemonArmor extends Item {
    constructor(id) {
      super(id, Types.Entities.DEMONARMOR, "armor");
      this.lootMessage = "You pick up a demon armor";
    }
  },

  MysticalArmor: class MysticalArmor extends Item {
    constructor(id) {
      super(id, Types.Entities.MYSTICALARMOR, "armor");
      this.lootMessage = "You pick up a mystical armor";
    }
  },

  ImmortalArmor: class ImmortalArmor extends Item {
    constructor(id) {
      super(id, Types.Entities.IMMORTALARMOR, "armor");
      this.lootMessage = "You pick up an immortal armor";
    }
  },

  PaladinArmor: class PaladinArmor extends Item {
    constructor(id) {
      super(id, Types.Entities.PALADINARMOR, "armor");
      this.lootMessage = "You pick up a paladin armor";
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
      this.lootMessage = "You pick up a sapphire belt";
    }
  },

  BeltHorned: class BeltHorned extends Item {
    constructor(id) {
      super(id, Types.Entities.BELTHORNED, "belt");
      this.lootMessage = "You pick up a horned belt";
    }
  },

  BeltDiamond: class BeltDiamond extends Item {
    constructor(id) {
      super(id, Types.Entities.BELTDIAMOND, "belt");
      this.lootMessage = "You pick up a diamond belt";
    }
  },

  BeltMinotaur: class BeltMinotaur extends Item {
    constructor(id) {
      super(id, Types.Entities.BELTMINOTAUR, "belt");
      this.lootMessage = "You pick up a minotaur belt";
    }
  },

  BeltEmerald: class BeltEmerald extends Item {
    constructor(id) {
      super(id, Types.Entities.BELTEMERALD, "belt");
      this.lootMessage = "You pick up an emerald belt";
    }
  },

  BeltExecutioner: class BeltExecutioner extends Item {
    constructor(id) {
      super(id, Types.Entities.BELTEXECUTIONER, "belt");
      this.lootMessage = "You pick up an executioner belt";
    }
  },

  BeltMystical: class BeltMystical extends Item {
    constructor(id) {
      super(id, Types.Entities.BELTMYSTICAL, "belt");
      this.lootMessage = "You pick up a mystical belt";
    }
  },

  BeltTemplar: class BeltTemplar extends Item {
    constructor(id) {
      super(id, Types.Entities.BELTTEMPLAR, "belt");
      this.lootMessage = "You pick up a templar belt";
    }
  },

  BeltDemon: class BeltDemon extends Item {
    constructor(id) {
      super(id, Types.Entities.BELTDEMON, "belt");
      this.lootMessage = "You pick up a demon belt";
    }
  },

  BeltMoon: class BeltMoon extends Item {
    constructor(id) {
      super(id, Types.Entities.BELTMOON, "belt");
      this.lootMessage = "You pick up a moon belt";
    }
  },

  Cape: class Cape extends Item {
    constructor(id) {
      super(id, Types.Entities.CAPE, "cape");
      this.lootMessage = "You pick up a cape";
    }
  },

  ShieldWood: class ShieldWood extends Item {
    constructor(id) {
      super(id, Types.Entities.SHIELDWOOD, "shield");
      this.lootMessage = "You pick up a wood shield";
    }
  },

  ShieldIron: class ShieldIron extends Item {
    constructor(id) {
      super(id, Types.Entities.SHIELDIRON, "shield");
      this.lootMessage = "You pick up an iron shield";
    }
  },

  ShieldPlate: class ShieldPlate extends Item {
    constructor(id) {
      super(id, Types.Entities.SHIELDPLATE, "shield");
      this.lootMessage = "You pick up a plate shield";
    }
  },

  ShieldRed: class ShieldRed extends Item {
    constructor(id) {
      super(id, Types.Entities.SHIELDRED, "shield");
      this.lootMessage = "You pick up a red shield";
    }
  },

  ShieldGolden: class ShieldGolden extends Item {
    constructor(id) {
      super(id, Types.Entities.SHIELDGOLDEN, "shield");
      this.lootMessage = "You pick up a golden shield";
    }
  },

  ShieldBlue: class ShieldBlue extends Item {
    constructor(id) {
      super(id, Types.Entities.SHIELDBLUE, "shield");
      this.lootMessage = "You pick up a frozen shield";
    }
  },

  ShieldHorned: class ShieldHorned extends Item {
    constructor(id) {
      super(id, Types.Entities.SHIELDHORNED, "shield");
      this.lootMessage = "You pick up a horned shield";
    }
  },

  ShieldFrozen: class ShieldFrozen extends Item {
    constructor(id) {
      super(id, Types.Entities.SHIELDFROZEN, "shield");
      this.lootMessage = "You pick up a sapphire shield";
    }
  },

  ShieldDiamond: class ShieldDiamond extends Item {
    constructor(id) {
      super(id, Types.Entities.SHIELDDIAMOND, "shield");
      this.lootMessage = "You pick up a diamond shield";
    }
  },

  ShieldTemplar: class ShieldTemplar extends Item {
    constructor(id) {
      super(id, Types.Entities.SHIELDTEMPLAR, "shield");
      this.lootMessage = "You pick up a templar shield";
    }
  },

  ShieldEmerald: class ShieldEmerald extends Item {
    constructor(id) {
      super(id, Types.Entities.SHIELDEMERALD, "shield");
      this.lootMessage = "You pick up an emerald shield";
    }
  },

  ShieldExecutioner: class ShieldExecutioner extends Item {
    constructor(id) {
      super(id, Types.Entities.SHIELDEXECUTIONER, "shield");
      this.lootMessage = "You pick up an executioner shield";
    }
  },

  ShieldMystical: class ShieldMystical extends Item {
    constructor(id) {
      super(id, Types.Entities.SHIELDMYSTICAL, "shield");
      this.lootMessage = "You pick up a mystical shield";
    }
  },

  ShieldDragon: class ShieldDragon extends Item {
    constructor(id) {
      super(id, Types.Entities.SHIELDDRAGON, "shield");
      this.lootMessage = "You pick up a dragon shield";
    }
  },

  ShieldDemon: class ShieldDemon extends Item {
    constructor(id) {
      super(id, Types.Entities.SHIELDDEMON, "shield");
      this.lootMessage = "You pick up a demon shield";
    }
  },

  ShieldMoon: class ShieldMoon extends Item {
    constructor(id) {
      super(id, Types.Entities.SHIELDMOON, "shield");
      this.lootMessage = "You pick up a moon shield";
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

  BananoPotion: class BananoPotion extends Item {
    constructor(id) {
      super(id, Types.Entities.BANANOPOTION, "object");
      this.lootMessage = "You drink a BANANO potion";
    }
  },

  RuneSat: class RuneSat extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.SAT, "rune");
      this.lootMessage = "You pick up a SAT Rune";
    }
  },

  RuneAl: class RuneAl extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.AL, "rune");
      this.lootMessage = "You pick up an AL Rune";
    }
  },

  RuneBul: class RuneBul extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.BUL, "rune");
      this.lootMessage = "You pick up a BUL Rune";
    }
  },

  RuneNan: class RuneNan extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.NAN, "rune");
      this.lootMessage = "You pick up a NAN Rune";
    }
  },

  RuneMir: class RuneMir extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.MIR, "rune");
      this.lootMessage = "You pick up a MIR Rune";
    }
  },

  RuneGel: class RuneGel extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.GEL, "rune");
      this.lootMessage = "You pick up a GEL Rune";
    }
  },

  RuneDo: class RuneDo extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.DO, "rune");
      this.lootMessage = "You pick up a DO Rune";
    }
  },

  RuneBan: class RuneBan extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.BAN, "rune");
      this.lootMessage = "You pick up a BAN Rune";
    }
  },

  RuneSol: class RuneSol extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.SOL, "rune");
      this.lootMessage = "You pick up a SOL Rune";
    }
  },

  RuneUm: class RuneUm extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.UM, "rune");
      this.lootMessage = "You pick up an UM Rune";
    }
  },

  RuneHex: class RuneHex extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.HEX, "rune");
      this.lootMessage = "You pick up a HEX Rune";
    }
  },

  RuneZal: class RuneZal extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.ZAL, "rune");
      this.lootMessage = "You pick up a ZAL Rune";
    }
  },

  RuneVie: class RuneVie extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.VIE, "rune");
      this.lootMessage = "You pick up a VIE Rune";
    }
  },

  RuneEth: class RuneEth extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.ETH, "rune");
      this.lootMessage = "You pick up an ETH Rune";
    }
  },

  RuneBtc: class RuneBtc extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.BTC, "rune");
      this.lootMessage = "You pick up a BTC Rune";
    }
  },

  RuneVax: class RuneVax extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.VAX, "rune");
      this.lootMessage = "You pick up a VAX Rune";
    }
  },

  RunePor: class RunePor extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.POR, "rune");
      this.lootMessage = "You pick up a POR Rune";
    }
  },

  RuneLas: class RuneLas extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.LAS, "rune");
      this.lootMessage = "You pick up a LAS Rune";
    }
  },

  RuneCham: class RuneCham extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.CHAM, "rune");
      this.lootMessage = "You pick up a CHAM Rune";
    }
  },

  RuneDur: class RuneDur extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.DUR, "rune");
      this.lootMessage = "You pick up a DUR Rune";
    }
  },

  RuneXno: class RuneXno extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.XNO, "rune");
      this.lootMessage = "You pick up a XNO Rune";
    }
  },

  RuneFal: class RuneFal extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.FAL, "rune");
      this.lootMessage = "You pick up a FAL Rune";
    }
  },

  RuneKul: class RuneKul extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.KUL, "rune");
      this.lootMessage = "You pick up a KUL Rune";
    }
  },

  RuneMer: class RuneMer extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.MER, "rune");
      this.lootMessage = "You pick up a MER Rune";
    }
  },

  RuneQua: class RuneQua extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.QUA, "rune");
      this.lootMessage = "You pick up a QUA Rune";
    }
  },

  RuneGul: class RuneGul extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.GUL, "rune");
      this.lootMessage = "You pick up a GUL Rune";
    }
  },

  RuneBer: class RuneBer extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.BER, "rune");
      this.lootMessage = "You pick up a BER Rune";
    }
  },

  RuneTor: class RuneTor extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.TOR, "rune");
      this.lootMessage = "You pick up a TOR Rune";
    }
  },

  RuneJah: class RuneJah extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.JAH, "rune");
      this.lootMessage = "You pick up a JAH Rune";
    }
  },

  RuneShi: class RuneShi extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.SHI, "rune");
      this.lootMessage = "You pick up a SHI Rune";
    }
  },

  RuneVod: class RuneVod extends Item {
    constructor(id) {
      super(id, Types.Entities.RUNE.VOD, "rune");
      this.lootMessage = "You pick up a VOD Rune";
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
      this.lootMessage = "You pick up amount gold";
    }
  },

  NanoCoin: class NanoCoin extends Item {
    constructor(id) {
      super(id, Types.Entities.NANOCOIN, "object");
      this.lootMessage = "You pick up amount XNO";
    }
  },

  BananoCoin: class BananoCoin extends Item {
    constructor(id) {
      super(id, Types.Entities.BANANOCOIN, "object");
      this.lootMessage = "You pick up amount BAN";
    }
  },

  BarBronze: class BarBronze extends Item {
    constructor(id) {
      super(id, Types.Entities.BARBRONZE, "object");
      this.lootMessage = "You pick up a Bronze Bar";
    }
  },

  BarSilver: class BarSilver extends Item {
    constructor(id) {
      super(id, Types.Entities.BARSILVER, "object");
      this.lootMessage = "You pick up a Silver Bar";
    }
  },

  BarGold: class BarGold extends Item {
    constructor(id) {
      super(id, Types.Entities.BARGOLD, "object");
      this.lootMessage = "You pick up a Gold Bar";
    }
  },

  BarPlatinum: class BarPlatinum extends Item {
    constructor(id) {
      super(id, Types.Entities.BARPLATINUM, "object");
      this.lootMessage = "You pick up a Platinum Bar";
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

  RingPlatinum: class RingPlatinum extends Item {
    constructor(id) {
      super(id, Types.Entities.RINGPLATINUM, "ring");
      this.lootMessage = "You pick up a platinum ring";
    }
  },

  RingNecromancer: class RingNecromancer extends Item {
    constructor(id) {
      super(id, Types.Entities.RINGNECROMANCER, "ring");
      this.lootMessage = "You pick up the Necromancer Death Wish";
    }
  },

  RingRaiStone: class RingRaiStone extends Item {
    constructor(id) {
      super(id, Types.Entities.RINGRAISTONE, "ring");
      this.lootMessage = "You pick up the Rai Stone";
    }
  },

  RingFountain: class RingFountain extends Item {
    constructor(id) {
      super(id, Types.Entities.RINGFOUNTAIN, "ring");
      this.lootMessage = "You pick up the Fountain of Youth";
    }
  },

  RingMinotaur: class RingMinotaur extends Item {
    constructor(id) {
      super(id, Types.Entities.RINGMINOTAUR, "ring");
      this.lootMessage = "You pick up the Minotaur Hell Freeze";
    }
  },

  RingMystical: class RingMystical extends Item {
    constructor(id) {
      super(id, Types.Entities.RINGMYSTICAL, "ring");
      this.lootMessage = "You pick up the Oculus";
    }
  },

  RingBalrog: class RingBalrog extends Item {
    constructor(id) {
      super(id, Types.Entities.RINGBALROG, "ring");
      this.lootMessage = "You pick up the Ring of Power";
    }
  },

  RingConqueror: class RingConqueror extends Item {
    constructor(id) {
      super(id, Types.Entities.RINGCONQUEROR, "ring");
      this.lootMessage = "You pick up a conqueror ring";
    }
  },

  RingHeaven: class RingHeaven extends Item {
    constructor(id) {
      super(id, Types.Entities.RINGHEAVEN, "ring");
      this.lootMessage = "You pick up a touch of heaven ring";
    }
  },

  RingWizard: class RingWizard extends Item {
    constructor(id) {
      super(id, Types.Entities.RINGWIZARD, "ring");
      this.lootMessage = "You pick up a wizard ring";
    }
  },

  RingGreed: class RingGreed extends Item {
    constructor(id) {
      super(id, Types.Entities.RINGGREED, "ring");
      this.lootMessage = "You pick up a ring of greed";
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

  AmuletPlatinum: class AmuletPlatinum extends Item {
    constructor(id) {
      super(id, Types.Entities.AMULETPLATINUM, "amulet");
      this.lootMessage = "You pick up a platinum amulet";
    }
  },

  AmuletCow: class AmuletCow extends Item {
    constructor(id) {
      super(id, Types.Entities.AMULETCOW, "amulet");
      this.lootMessage = "You pick up the Holy Cow King Talisman";
    }
  },

  AmuletFrozen: class AmuletFrozen extends Item {
    constructor(id) {
      super(id, Types.Entities.AMULETFROZEN, "amulet");
      this.lootMessage = "You pick up the Frozen Heart";
    }
  },

  AmuletDemon: class AmuletDemon extends Item {
    constructor(id) {
      super(id, Types.Entities.AMULETDEMON, "amulet");
      this.lootMessage = "You pick up the Fiend";
    }
  },

  AmuletMoon: class AmuletMoon extends Item {
    constructor(id) {
      super(id, Types.Entities.AMULETMOON, "amulet");
      this.lootMessage = "You pick up the Crescent";
    }
  },

  AmuletStar: class AmuletStar extends Item {
    constructor(id) {
      super(id, Types.Entities.AMULETSTAR, "amulet");
      this.lootMessage = "You pick up the North Star";
    }
  },

  AmuletSkull: class AmuletSkull extends Item {
    constructor(id) {
      super(id, Types.Entities.AMULETSKULL, "amulet");
      this.lootMessage = "You pick up the White Death";
    }
  },

  AmuletDragon: class AmuletDragon extends Item {
    constructor(id) {
      super(id, Types.Entities.AMULETDRAGON, "amulet");
      this.lootMessage = "You pick up the Dragon Eye";
    }
  },

  AmuletEye: class AmuletEye extends Item {
    constructor(id) {
      super(id, Types.Entities.AMULETEYE, "amulet");
      this.lootMessage = "You pick up the All-Seeing Eye";
    }
  },

  AmuletGreed: class AmuletGreed extends Item {
    constructor(id) {
      super(id, Types.Entities.AMULETGREED, "amulet");
      this.lootMessage = "You pick up the amulet of Greed";
    }
  },

  ChestBlue: class ChestBlue extends Item {
    constructor(id) {
      super(id, Types.Entities.CHESTBLUE, "chest");
      this.lootMessage = "You pick up a blue chest";
    }
  },

  ChestGreen: class ChestGreen extends Item {
    constructor(id) {
      super(id, Types.Entities.CHESTGREEN, "chest");
      this.lootMessage = "You pick up a green chest";
    }
  },

  ChestPurple: class ChestPurple extends Item {
    constructor(id) {
      super(id, Types.Entities.CHESTPURPLE, "chest");
      this.lootMessage = "You pick up a purple chest";
    }
  },

  ChestRed: class ChestRed extends Item {
    constructor(id) {
      super(id, Types.Entities.CHESTRED, "chest");
      this.lootMessage = "You pick up a red chest";
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

  ScrollUpgradeLegendary: class ScrollUpgradeLegendary extends Item {
    constructor(id) {
      super(id, Types.Entities.SCROLLUPGRADELEGENDARY, "scroll");
      this.lootMessage = "You pick up a legendary class upgrade scroll";
    }
  },

  ScrollUpgradeBlessed: class ScrollUpgradeBlessed extends Item {
    constructor(id) {
      super(id, Types.Entities.SCROLLUPGRADEBLESSED, "scroll");
      this.lootMessage = "You pick up a blessed high class upgrade scroll";
    }
  },

  ScrollUpgradeSacred: class ScrollUpgradeSacred extends Item {
    constructor(id) {
      super(id, Types.Entities.SCROLLUPGRADESACRED, "scroll");
      this.lootMessage = "You pick up a sacred legendary class upgrade scroll";
    }
  },

  ScrollTransmute: class ScrollTransmute extends Item {
    constructor(id) {
      super(id, Types.Entities.SCROLLTRANSMUTE, "scroll");
      this.lootMessage = "You pick up a transmute scroll";
    }
  },

  ScrollTransmuteBlessed: class ScrollTransmute extends Item {
    constructor(id) {
      super(id, Types.Entities.SCROLLTRANSMUTEBLESSED, "scroll");
      this.lootMessage = "You pick up a blessed transmute scroll";
    }
  },

  StoneSocket: class StoneSocket extends Item {
    constructor(id) {
      super(id, Types.Entities.STONESOCKET, "stone");
      this.lootMessage = "You pick up a socket stone";
    }
  },

  StoneDragon: class StoneDragon extends Item {
    constructor(id) {
      super(id, Types.Entities.STONEDRAGON, "stone");
      this.lootMessage = "You pick up a dragon stone";
    }
  },

  StoneHero: class StoneHero extends Item {
    constructor(id) {
      super(id, Types.Entities.STONEHERO, "stone");
      this.lootMessage = "You pick up a hero emblem";
    }
  },

  JewelSkull: class JewelSkull extends Item {
    constructor(id) {
      super(id, Types.Entities.JEWELSKULL, "jewel");
      this.lootMessage = "You pick up a skull jewel";
    }
  },

  SkeletonKey: class SkeletonKey extends Item {
    constructor(id) {
      super(id, Types.Entities.SKELETONKEY, "object");
      this.lootMessage = "You pick up the Skeleton Key";
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
      this.lootMessage = "You pick up the Necromancer's heart";
    }
  },

  CowkingHorn: class CowkingHorn extends Item {
    constructor(id) {
      super(id, Types.Entities.COWKINGHORN, "object");
      this.lootMessage = "You pick up the Cow King's horn";
    }
  },

  Chalice: class Chalice extends Item {
    constructor(id) {
      super(id, Types.Entities.CHALICE, "object");
      this.lootMessage = "You pick up the Golden Chalice";
    }
  },

  SoulStone: class SoulStone extends Item {
    constructor(id) {
      super(id, Types.Entities.SOULSTONE, "object");
      this.lootMessage = "You pick up the Soul Stone";
    }
  },

  Nft: class Nft extends Item {
    constructor(id) {
      super(id, Types.Entities.NFT, "object");
      this.lootMessage = "You pick up the Stone NFT";
    }
  },

  Wing: class Wing extends Item {
    constructor(id) {
      super(id, Types.Entities.WING, "object");
      this.lootMessage = "You pick up a Dragon Wing";
    }
  },

  Crystal: class Crystal extends Item {
    constructor(id) {
      super(id, Types.Entities.CRYSTAL, "object");
      this.lootMessage = "You pick up the Crystal";
    }
  },

  PowderBlack: class PowderBlack extends Item {
    constructor(id) {
      super(id, Types.Entities.POWDERBLACK, "object");
      this.lootMessage = "You pick up the Soul powder";
    }
  },

  PowderBlue: class PowderBlue extends Item {
    constructor(id) {
      super(id, Types.Entities.POWDERBLUE, "object");
      this.lootMessage = "You pick up the Illusion powder";
    }
  },

  PowderGold: class PowderGold extends Item {
    constructor(id) {
      super(id, Types.Entities.POWDERGOLD, "object");
      this.lootMessage = "You pick up the BTC maxi powder";
    }
  },

  PowderGreen: class PowderGreen extends Item {
    constructor(id) {
      super(id, Types.Entities.POWDERGREEN, "object");
      this.lootMessage = "You pick up the Poison powder";
    }
  },

  PowderRed: class PowderRed extends Item {
    constructor(id) {
      super(id, Types.Entities.POWDERRED, "object");
      this.lootMessage = "You pick up the Blood powder";
    }
  },

  PowderQuantum: class PowderQuantum extends Item {
    constructor(id) {
      super(id, Types.Entities.POWDERQUANTUM, "object");
      this.lootMessage = "You pick up the Quantum powder";
    }
  },

  Pickaxe: class Pickaxe extends Item {
    constructor(id) {
      super(id, Types.Entities.PICKAXE, "object");
      this.lootMessage = "You pick up a Pickaxe";
    }
  },

  Mushrooms: class Mushrooms extends Item {
    constructor(id) {
      super(id, Types.Entities.MUSHROOMS, "object");
      this.lootMessage = "You pick up some Mushrooms";
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

  Firefoxpotion: class Firefoxpotion extends Item {
    constructor(id) {
      super(id, Types.Entities.FIREFOXPOTION, "object");
      this.lootMessage = "You feel the power of Firefox!";
    }

    onLoot(player) {
      player.startInvincibility();
    }
  },
};

export default Items;
