import * as _ from "lodash";

import Mobs from "./mobs";
import Items from "./items";
import Npcs from "./npcs";
import Warrior from "./warrior";
import Chest from "./chest";

import { Types } from "../../shared/js/gametypes";

var EntityFactory: any = {};

EntityFactory.createEntity = function (kind, id, name) {
  if (!kind) {
    console.error("kind is undefined", true);
    return;
  }

  if (!_.isFunction(EntityFactory.builders[kind])) {
    throw Error(kind + " is not a valid Entity type");
  }

  return EntityFactory.builders[kind](id, name);
};

//===== mobs ======

EntityFactory.builders = [];

EntityFactory.builders[Types.Entities.WARRIOR] = function (id, name) {
  return new Warrior(id, name);
};

EntityFactory.builders[Types.Entities.RAT] = function (id) {
  return new Mobs.Rat(id);
};

EntityFactory.builders[Types.Entities.SKELETON] = function (id) {
  return new Mobs.Skeleton(id);
};

EntityFactory.builders[Types.Entities.SKELETON2] = function (id) {
  return new Mobs.Skeleton2(id);
};

EntityFactory.builders[Types.Entities.SPECTRE] = function (id) {
  return new Mobs.Spectre(id);
};

EntityFactory.builders[Types.Entities.DEATHKNIGHT] = function (id) {
  return new Mobs.Deathknight(id);
};

EntityFactory.builders[Types.Entities.GOBLIN] = function (id) {
  return new Mobs.Goblin(id);
};

EntityFactory.builders[Types.Entities.OGRE] = function (id) {
  return new Mobs.Ogre(id);
};

EntityFactory.builders[Types.Entities.CRAB] = function (id) {
  return new Mobs.Crab(id);
};

EntityFactory.builders[Types.Entities.SNAKE] = function (id) {
  return new Mobs.Snake(id);
};

EntityFactory.builders[Types.Entities.EYE] = function (id) {
  return new Mobs.Eye(id);
};

EntityFactory.builders[Types.Entities.BAT] = function (id) {
  return new Mobs.Bat(id);
};

EntityFactory.builders[Types.Entities.WIZARD] = function (id) {
  return new Mobs.Wizard(id);
};

EntityFactory.builders[Types.Entities.BOSS] = function (id) {
  return new Mobs.Boss(id);
};

EntityFactory.builders[Types.Entities.RAT2] = function (id) {
  return new Mobs.Rat2(id);
};

EntityFactory.builders[Types.Entities.BAT2] = function (id) {
  return new Mobs.Bat2(id);
};

EntityFactory.builders[Types.Entities.GOBLIN2] = function (id) {
  return new Mobs.Goblin2(id);
};

EntityFactory.builders[Types.Entities.YETI] = function (id) {
  return new Mobs.Yeti(id);
};

EntityFactory.builders[Types.Entities.WEREWOLF] = function (id) {
  return new Mobs.Werewolf(id);
};

EntityFactory.builders[Types.Entities.SKELETON3] = function (id) {
  return new Mobs.Skeleton3(id);
};

EntityFactory.builders[Types.Entities.SKELETONCOMMANDER] = function (id) {
  return new Mobs.SkeletonCommander(id);
};

EntityFactory.builders[Types.Entities.SNAKE2] = function (id) {
  return new Mobs.Snake2(id);
};

EntityFactory.builders[Types.Entities.WRAITH] = function (id) {
  return new Mobs.Wraith(id);
};

EntityFactory.builders[Types.Entities.ZOMBIE] = function (id) {
  return new Mobs.Zombie(id);
};

EntityFactory.builders[Types.Entities.NECROMANCER] = function (id) {
  return new Mobs.Necromancer(id);
};

EntityFactory.builders[Types.Entities.COW] = function (id) {
  return new Mobs.Cow(id);
};

EntityFactory.builders[Types.Entities.COWKING] = function (id) {
  return new Mobs.CowKing(id);
};

//===== items ======

EntityFactory.builders[Types.Entities.SWORD] = function (id) {
  return new Items.Sword(id);
};

EntityFactory.builders[Types.Entities.AXE] = function (id) {
  return new Items.Axe(id);
};

EntityFactory.builders[Types.Entities.BLUEAXE] = function (id) {
  return new Items.BlueAxe(id);
};

EntityFactory.builders[Types.Entities.BLUEMORNINGSTAR] = function (id) {
  return new Items.BlueMorningStar(id);
};

EntityFactory.builders[Types.Entities.REDSWORD] = function (id) {
  return new Items.RedSword(id);
};

EntityFactory.builders[Types.Entities.BLUESWORD] = function (id) {
  return new Items.BlueSword(id);
};

EntityFactory.builders[Types.Entities.GOLDENSWORD] = function (id) {
  return new Items.GoldenSword(id);
};

EntityFactory.builders[Types.Entities.FROZENSWORD] = function (id) {
  return new Items.FrozenSword(id);
};

EntityFactory.builders[Types.Entities.DIAMONDSWORD] = function (id) {
  return new Items.DiamondSword(id);
};

EntityFactory.builders[Types.Entities.MORNINGSTAR] = function (id) {
  return new Items.MorningStar(id);
};

EntityFactory.builders[Types.Entities.MAILARMOR] = function (id) {
  return new Items.MailArmor(id);
};

EntityFactory.builders[Types.Entities.LEATHERARMOR] = function (id) {
  return new Items.LeatherArmor(id);
};

EntityFactory.builders[Types.Entities.PLATEARMOR] = function (id) {
  return new Items.PlateArmor(id);
};

EntityFactory.builders[Types.Entities.REDARMOR] = function (id) {
  return new Items.RedArmor(id);
};

EntityFactory.builders[Types.Entities.GOLDENARMOR] = function (id) {
  return new Items.GoldenArmor(id);
};

EntityFactory.builders[Types.Entities.BLUEARMOR] = function (id) {
  return new Items.BlueArmor(id);
};

EntityFactory.builders[Types.Entities.FROZENARMOR] = function (id) {
  return new Items.FrozenArmor(id);
};

EntityFactory.builders[Types.Entities.HORNEDARMOR] = function (id) {
  return new Items.HornedArmor(id);
};

EntityFactory.builders[Types.Entities.BELTLEATHER] = function (id) {
  return new Items.BeltLeather(id);
};

EntityFactory.builders[Types.Entities.BELTPLATED] = function (id) {
  return new Items.BeltPlated(id);
};

EntityFactory.builders[Types.Entities.BELTFROZEN] = function (id) {
  return new Items.BeltFrozen(id);
};

EntityFactory.builders[Types.Entities.FLASK] = function (id) {
  return new Items.Flask(id);
};

EntityFactory.builders[Types.Entities.REJUVENATIONPOTION] = function (id) {
  return new Items.RejuvenationPotion(id);
};

EntityFactory.builders[Types.Entities.POISONPOTION] = function (id) {
  return new Items.PoisonPotion(id);
};

EntityFactory.builders[Types.Entities.NANOPOTION] = function (id) {
  return new Items.NanoPotion(id);
};

EntityFactory.builders[Types.Entities.GEMRUBY] = function (id) {
  return new Items.GemRuby(id);
};

EntityFactory.builders[Types.Entities.GEMEMERALD] = function (id) {
  return new Items.GemEmerald(id);
};

EntityFactory.builders[Types.Entities.GEMAMETHYST] = function (id) {
  return new Items.GemAmethyst(id);
};

EntityFactory.builders[Types.Entities.GEMTOPAZ] = function (id) {
  return new Items.GemTopaz(id);
};

EntityFactory.builders[Types.Entities.GEMSAPPHIRE] = function (id) {
  return new Items.GemSapphire(id);
};

EntityFactory.builders[Types.Entities.GOLD] = function (id) {
  return new Items.Gold(id);
};

EntityFactory.builders[Types.Entities.RINGBRONZE] = function (id) {
  return new Items.RingBronze(id);
};

EntityFactory.builders[Types.Entities.RINGSILVER] = function (id) {
  return new Items.RingSilver(id);
};

EntityFactory.builders[Types.Entities.RINGGOLD] = function (id) {
  return new Items.RingGold(id);
};

EntityFactory.builders[Types.Entities.RINGNECROMANCER] = function (id) {
  return new Items.RingNecromancer(id);
};

EntityFactory.builders[Types.Entities.RINGRAISTONE] = function (id) {
  return new Items.RingRaiStone(id);
};

EntityFactory.builders[Types.Entities.RINGFOUNTAIN] = function (id) {
  return new Items.RingFountain(id);
};

EntityFactory.builders[Types.Entities.AMULETSILVER] = function (id) {
  return new Items.AmuletSilver(id);
};

EntityFactory.builders[Types.Entities.AMULETGOLD] = function (id) {
  return new Items.AmuletGold(id);
};

EntityFactory.builders[Types.Entities.AMULETCOW] = function (id) {
  return new Items.AmuletCow(id);
};

EntityFactory.builders[Types.Entities.SCROLLUPGRADELOW] = function (id) {
  return new Items.ScrollUpgradeLow(id);
};

EntityFactory.builders[Types.Entities.SCROLLUPGRADEMEDIUM] = function (id) {
  return new Items.ScrollUpgradeMedium(id);
};

EntityFactory.builders[Types.Entities.SCROLLUPGRADEHIGH] = function (id) {
  return new Items.ScrollUpgradeHigh(id);
};

EntityFactory.builders[Types.Entities.SCROLLUPGRADEBLESSED] = function (id) {
  return new Items.ScrollUpgradeBlessed(id);
};

EntityFactory.builders[Types.Entities.SKELETONKEY] = function (id) {
  return new Items.SkeletonKey(id);
};

EntityFactory.builders[Types.Entities.RAIBLOCKSTL] = function (id) {
  return new Items.RaiblocksTL(id);
};

EntityFactory.builders[Types.Entities.RAIBLOCKSTR] = function (id) {
  return new Items.RaiblocksTR(id);
};

EntityFactory.builders[Types.Entities.RAIBLOCKSBL] = function (id) {
  return new Items.RaiblocksBL(id);
};

EntityFactory.builders[Types.Entities.RAIBLOCKSBR] = function (id) {
  return new Items.RaiblocksBR(id);
};

EntityFactory.builders[Types.Entities.WIRTLEG] = function (id) {
  return new Items.WirtLeg(id);
};

EntityFactory.builders[Types.Entities.SKELETONKINGCAGE] = function (id) {
  return new Items.SkeletonKingCage(id);
};

EntityFactory.builders[Types.Entities.NECROMANCERHEART] = function (id) {
  return new Items.NecromancerHeart(id);
};

EntityFactory.builders[Types.Entities.FIREPOTION] = function (id) {
  return new Items.FirePotion(id);
};

EntityFactory.builders[Types.Entities.BURGER] = function (id) {
  return new Items.Burger(id);
};

EntityFactory.builders[Types.Entities.CAKE] = function (id) {
  return new Items.Cake(id);
};

EntityFactory.builders[Types.Entities.CHEST] = function (id) {
  return new Chest(id);
};

//====== Npcs ======

EntityFactory.builders[Types.Entities.GUARD] = function (id) {
  return new Npcs.Guard(id);
};

EntityFactory.builders[Types.Entities.KING] = function (id) {
  return new Npcs.King(id);
};

EntityFactory.builders[Types.Entities.VILLAGEGIRL] = function (id) {
  return new Npcs.VillageGirl(id);
};

EntityFactory.builders[Types.Entities.VILLAGER] = function (id) {
  return new Npcs.Villager(id);
};

EntityFactory.builders[Types.Entities.CARLOSMATOS] = function (id) {
  return new Npcs.CarlosMatos(id);
};

EntityFactory.builders[Types.Entities.SATOSHI] = function (id) {
  return new Npcs.Satoshi(id);
};

EntityFactory.builders[Types.Entities.CODER] = function (id) {
  return new Npcs.Coder(id);
};

EntityFactory.builders[Types.Entities.AGENT] = function (id) {
  return new Npcs.Agent(id);
};

EntityFactory.builders[Types.Entities.RICK] = function (id) {
  return new Npcs.Rick(id);
};

EntityFactory.builders[Types.Entities.SCIENTIST] = function (id) {
  return new Npcs.Scientist(id);
};

EntityFactory.builders[Types.Entities.NYAN] = function (id) {
  return new Npcs.Nyan(id);
};

EntityFactory.builders[Types.Entities.PRIEST] = function (id) {
  return new Npcs.Priest(id);
};

EntityFactory.builders[Types.Entities.SORCERER] = function (id) {
  return new Npcs.Sorcerer(id);
};

EntityFactory.builders[Types.Entities.BEACHNPC] = function (id) {
  return new Npcs.BeachNpc(id);
};

EntityFactory.builders[Types.Entities.FORESTNPC] = function (id) {
  return new Npcs.ForestNpc(id);
};

EntityFactory.builders[Types.Entities.DESERTNPC] = function (id) {
  return new Npcs.DesertNpc(id);
};

EntityFactory.builders[Types.Entities.LAVANPC] = function (id) {
  return new Npcs.LavaNpc(id);
};

EntityFactory.builders[Types.Entities.OCTOCAT] = function (id) {
  return new Npcs.Octocat(id);
};

EntityFactory.builders[Types.Entities.ANVIL] = function (id) {
  return new Npcs.Anvil(id);
};

EntityFactory.builders[Types.Entities.WAYPOINTX] = function (id) {
  return new Npcs.Waypointx(id);
};

EntityFactory.builders[Types.Entities.WAYPOINTN] = function (id) {
  return new Npcs.Waypointn(id);
};

EntityFactory.builders[Types.Entities.STASH] = function (id) {
  return new Npcs.Stash(id);
};

EntityFactory.builders[Types.Entities.COWPORTAL] = function (id) {
  return new Npcs.CowPortal(id);
};

export default EntityFactory;
