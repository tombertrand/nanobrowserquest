import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";
import Chest from "./chest";
import Items from "./items";
import Mobs from "./mobs";
import Npcs from "./npcs";
import Spells from "./spells";
import Warrior from "./warrior";

var EntityFactory: any = {};

EntityFactory.createEntity = function ({ kind, id, ...rest }) {
  if (!kind) {
    console.error("kind is undefined");
    return;
  }

  if (!_.isFunction(EntityFactory.builders[kind])) {
    throw Error(kind + " is not a valid Entity type");
  }

  return EntityFactory.builders[kind](id, rest);
};

//===== mobs ======

EntityFactory.builders = [];

EntityFactory.builders[Types.Entities.WARRIOR] = function (id, props) {
  return new Warrior(id, props);
};

EntityFactory.builders[Types.Entities.RAT] = function (id, props) {
  return new Mobs.Rat(id, props);
};

EntityFactory.builders[Types.Entities.SKELETON] = function (id, props) {
  return new Mobs.Skeleton(id, props);
};

EntityFactory.builders[Types.Entities.SKELETON2] = function (id, props) {
  return new Mobs.Skeleton2(id, props);
};

EntityFactory.builders[Types.Entities.SPECTRE] = function (id, props) {
  return new Mobs.Spectre(id, props);
};

EntityFactory.builders[Types.Entities.DEATHKNIGHT] = function (id, props) {
  return new Mobs.Deathknight(id, props);
};

EntityFactory.builders[Types.Entities.GOBLIN] = function (id, props) {
  return new Mobs.Goblin(id, props);
};

EntityFactory.builders[Types.Entities.OGRE] = function (id, props) {
  return new Mobs.Ogre(id, props);
};

EntityFactory.builders[Types.Entities.CRAB] = function (id, props) {
  return new Mobs.Crab(id, props);
};

EntityFactory.builders[Types.Entities.SNAKE] = function (id, props) {
  return new Mobs.Snake(id, props);
};

EntityFactory.builders[Types.Entities.EYE] = function (id, props) {
  return new Mobs.Eye(id, props);
};

EntityFactory.builders[Types.Entities.BAT] = function (id, props) {
  return new Mobs.Bat(id, props);
};

EntityFactory.builders[Types.Entities.WIZARD] = function (id, props) {
  return new Mobs.Wizard(id, props);
};

EntityFactory.builders[Types.Entities.BOSS] = function (id, props) {
  return new Mobs.Boss(id, props);
};

EntityFactory.builders[Types.Entities.RAT2] = function (id, props) {
  return new Mobs.Rat2(id, props);
};

EntityFactory.builders[Types.Entities.BAT2] = function (id, props) {
  return new Mobs.Bat2(id, props);
};

EntityFactory.builders[Types.Entities.GOBLIN2] = function (id, props) {
  return new Mobs.Goblin2(id, props);
};

EntityFactory.builders[Types.Entities.YETI] = function (id, props) {
  return new Mobs.Yeti(id, props);
};

EntityFactory.builders[Types.Entities.WEREWOLF] = function (id, props) {
  return new Mobs.Werewolf(id, props);
};

EntityFactory.builders[Types.Entities.SKELETON3] = function (id, props) {
  return new Mobs.Skeleton3(id, props);
};

EntityFactory.builders[Types.Entities.SKELETONCOMMANDER] = function (id, props) {
  return new Mobs.SkeletonCommander(id, props);
};

EntityFactory.builders[Types.Entities.SNAKE2] = function (id, props) {
  return new Mobs.Snake2(id, props);
};

EntityFactory.builders[Types.Entities.WRAITH] = function (id, props) {
  return new Mobs.Wraith(id, props);
};

EntityFactory.builders[Types.Entities.ZOMBIE] = function (id, props) {
  return new Mobs.Zombie(id, props);
};

EntityFactory.builders[Types.Entities.NECROMANCER] = function (id, props) {
  return new Mobs.Necromancer(id, props);
};

EntityFactory.builders[Types.Entities.COW] = function (id, props) {
  return new Mobs.Cow(id, props);
};

EntityFactory.builders[Types.Entities.COWKING] = function (id, props) {
  return new Mobs.CowKing(id, props);
};

EntityFactory.builders[Types.Entities.MINOTAUR] = function (id, props) {
  return new Mobs.Minotaur(id, props);
};

EntityFactory.builders[Types.Entities.RAT3] = function (id, props) {
  return new Mobs.Rat3(id, props);
};

EntityFactory.builders[Types.Entities.SNAKE3] = function (id, props) {
  return new Mobs.Snake3(id, props);
};

EntityFactory.builders[Types.Entities.SNAKE4] = function (id, props) {
  return new Mobs.Snake4(id, props);
};

EntityFactory.builders[Types.Entities.SKELETON4] = function (id, props) {
  return new Mobs.Skeleton4(id, props);
};

EntityFactory.builders[Types.Entities.GOLEM] = function (id, props) {
  return new Mobs.Golem(id, props);
};

EntityFactory.builders[Types.Entities.WORM] = function (id, props) {
  return new Mobs.Worm(id, props);
};

EntityFactory.builders[Types.Entities.WRAITH2] = function (id, props) {
  return new Mobs.Wraith2(id, props);
};

EntityFactory.builders[Types.Entities.GHOST] = function (id, props) {
  return new Mobs.Ghost(id, props);
};

EntityFactory.builders[Types.Entities.MAGE] = function (id, props) {
  return new Mobs.Mage(id, props);
};

EntityFactory.builders[Types.Entities.SHAMAN] = function (id, props) {
  return new Mobs.Shaman(id, props);
};

EntityFactory.builders[Types.Entities.SKELETONTEMPLAR] = function (id, props) {
  return new Mobs.SkeletonTemplar(id, props);
};

EntityFactory.builders[Types.Entities.SKELETONTEMPLAR2] = function (id, props) {
  return new Mobs.SkeletonTemplar2(id, props);
};

EntityFactory.builders[Types.Entities.SPIDER] = function (id, props) {
  return new Mobs.Spider(id, props);
};

EntityFactory.builders[Types.Entities.SPIDER2] = function (id, props) {
  return new Mobs.Spider2(id, props);
};

EntityFactory.builders[Types.Entities.SPIDERQUEEN] = function (id, props) {
  return new Mobs.SpiderQueen(id, props);
};

EntityFactory.builders[Types.Entities.BUTCHER] = function (id, props) {
  return new Mobs.Butcher(id, props);
};

EntityFactory.builders[Types.Entities.OCULOTHORAX] = function (id, props) {
  return new Mobs.Oculothorax(id, props);
};

EntityFactory.builders[Types.Entities.KOBOLD] = function (id, props) {
  return new Mobs.Kobold(id, props);
};

EntityFactory.builders[Types.Entities.SKELETONBERSERKER] = function (id, props) {
  return new Mobs.SkeletonBerserker(id, props);
};

EntityFactory.builders[Types.Entities.SKELETONARCHER] = function (id, props) {
  return new Mobs.SkeletonArcher(id, props);
};

EntityFactory.builders[Types.Entities.DEATHANGEL] = function (id, props) {
  return new Mobs.DeathAngel(id, props);
};

EntityFactory.builders[Types.Entities.MAGESPELL] = function (id) {
  return new Spells.MageSpell(id);
};

EntityFactory.builders[Types.Entities.ARROW] = function (id) {
  return new Spells.Arrow(id);
};

EntityFactory.builders[Types.Entities.STATUE] = function (id) {
  return new Npcs.Statue(id);
};

EntityFactory.builders[Types.Entities.STATUE2] = function (id) {
  return new Npcs.Statue2(id);
};

EntityFactory.builders[Types.Entities.STATUESPELL] = function (id) {
  return new Spells.StatueSpell(id);
};

EntityFactory.builders[Types.Entities.STATUE2SPELL] = function (id) {
  return new Spells.Statue2Spell(id);
};

EntityFactory.builders[Types.Entities.DEATHANGELSPELL] = function (id) {
  return new Spells.DeathAngelSpell(id);
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

EntityFactory.builders[Types.Entities.MINOTAURAXE] = function (id) {
  return new Items.MinotaurAxe(id);
};

EntityFactory.builders[Types.Entities.EMERALDSWORD] = function (id) {
  return new Items.EmeraldSword(id);
};

EntityFactory.builders[Types.Entities.MOONSWORD] = function (id) {
  return new Items.MoonSword(id);
};

EntityFactory.builders[Types.Entities.TEMPLARSWORD] = function (id) {
  return new Items.TemplarSword(id);
};

EntityFactory.builders[Types.Entities.SPIKEGLAIVE] = function (id) {
  return new Items.SpikeGlaive(id);
};

EntityFactory.builders[Types.Entities.ECLYPSEDAGGER] = function (id) {
  return new Items.EclypseDagger(id);
};

EntityFactory.builders[Types.Entities.DEMONAXE] = function (id) {
  return new Items.DemonAxe(id);
};

EntityFactory.builders[Types.Entities.PALADINAXE] = function (id) {
  return new Items.PaladinAxe(id);
};

EntityFactory.builders[Types.Entities.IMMORTALSWORD] = function (id) {
  return new Items.ImmortalSword(id);
};

EntityFactory.builders[Types.Entities.EXECUTIONERSWORD] = function (id) {
  return new Items.ExecutionerSword(id);
};

EntityFactory.builders[Types.Entities.MYSTICALSWORD] = function (id) {
  return new Items.MysticalSword(id);
};

EntityFactory.builders[Types.Entities.DRAGONSWORD] = function (id) {
  return new Items.DragonSword(id);
};

EntityFactory.builders[Types.Entities.HELLHAMMER] = function (id) {
  return new Items.HellHammer(id);
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

EntityFactory.builders[Types.Entities.HORNEDARMOR] = function (id) {
  return new Items.HornedArmor(id);
};

EntityFactory.builders[Types.Entities.FROZENARMOR] = function (id) {
  return new Items.FrozenArmor(id);
};

EntityFactory.builders[Types.Entities.DIAMONDARMOR] = function (id) {
  return new Items.DiamondArmor(id);
};

EntityFactory.builders[Types.Entities.EMERALDARMOR] = function (id) {
  return new Items.EmeraldArmor(id);
};

EntityFactory.builders[Types.Entities.TEMPLARARMOR] = function (id) {
  return new Items.TemplarArmor(id);
};

EntityFactory.builders[Types.Entities.DRAGONARMOR] = function (id) {
  return new Items.DragonArmor(id);
};

EntityFactory.builders[Types.Entities.MOONARMOR] = function (id) {
  return new Items.MoonArmor(id);
};

EntityFactory.builders[Types.Entities.DEMONARMOR] = function (id) {
  return new Items.DemonArmor(id);
};

EntityFactory.builders[Types.Entities.MYSTICALARMOR] = function (id) {
  return new Items.MysticalArmor(id);
};

EntityFactory.builders[Types.Entities.IMMORTALARMOR] = function (id) {
  return new Items.ImmortalArmor(id);
};

EntityFactory.builders[Types.Entities.PALADINARMOR] = function (id) {
  return new Items.PaladinArmor(id);
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

EntityFactory.builders[Types.Entities.BELTHORNED] = function (id) {
  return new Items.BeltHorned(id);
};

EntityFactory.builders[Types.Entities.BELTDIAMOND] = function (id) {
  return new Items.BeltDiamond(id);
};

EntityFactory.builders[Types.Entities.BELTMINOTAUR] = function (id) {
  return new Items.BeltMinotaur(id);
};

EntityFactory.builders[Types.Entities.BELTEMERALD] = function (id) {
  return new Items.BeltEmerald(id);
};

EntityFactory.builders[Types.Entities.BELTEXECUTIONER] = function (id) {
  return new Items.BeltExecutioner(id);
};

EntityFactory.builders[Types.Entities.BELTMYSTICAL] = function (id) {
  return new Items.BeltMystical(id);
};

EntityFactory.builders[Types.Entities.BELTTEMPLAR] = function (id) {
  return new Items.BeltTemplar(id);
};

EntityFactory.builders[Types.Entities.BELTDEMON] = function (id) {
  return new Items.BeltDemon(id);
};

EntityFactory.builders[Types.Entities.BELTMOON] = function (id) {
  return new Items.BeltMoon(id);
};

EntityFactory.builders[Types.Entities.CAPE] = function (id) {
  return new Items.Cape(id);
};

EntityFactory.builders[Types.Entities.SHIELDWOOD] = function (id) {
  return new Items.ShieldWood(id);
};

EntityFactory.builders[Types.Entities.SHIELDIRON] = function (id) {
  return new Items.ShieldIron(id);
};

EntityFactory.builders[Types.Entities.SHIELDPLATE] = function (id) {
  return new Items.ShieldPlate(id);
};

EntityFactory.builders[Types.Entities.SHIELDRED] = function (id) {
  return new Items.ShieldRed(id);
};

EntityFactory.builders[Types.Entities.SHIELDGOLDEN] = function (id) {
  return new Items.ShieldGolden(id);
};

EntityFactory.builders[Types.Entities.SHIELDBLUE] = function (id) {
  return new Items.ShieldBlue(id);
};

EntityFactory.builders[Types.Entities.SHIELDHORNED] = function (id) {
  return new Items.ShieldHorned(id);
};

EntityFactory.builders[Types.Entities.SHIELDFROZEN] = function (id) {
  return new Items.ShieldFrozen(id);
};

EntityFactory.builders[Types.Entities.SHIELDDIAMOND] = function (id) {
  return new Items.ShieldDiamond(id);
};

EntityFactory.builders[Types.Entities.SHIELDTEMPLAR] = function (id) {
  return new Items.ShieldTemplar(id);
};

EntityFactory.builders[Types.Entities.SHIELDEMERALD] = function (id) {
  return new Items.ShieldEmerald(id);
};

EntityFactory.builders[Types.Entities.SHIELDEXECUTIONER] = function (id) {
  return new Items.ShieldExecutioner(id);
};

EntityFactory.builders[Types.Entities.SHIELDMYSTICAL] = function (id) {
  return new Items.ShieldMystical(id);
};

EntityFactory.builders[Types.Entities.SHIELDDRAGON] = function (id) {
  return new Items.ShieldDragon(id);
};

EntityFactory.builders[Types.Entities.SHIELDDEMON] = function (id) {
  return new Items.ShieldDemon(id);
};

EntityFactory.builders[Types.Entities.SHIELDMOON] = function (id) {
  return new Items.ShieldMoon(id);
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

EntityFactory.builders[Types.Entities.BANANOPOTION] = function (id) {
  return new Items.BananoPotion(id);
};

EntityFactory.builders[Types.Entities.RUNE.SAT] = function (id) {
  return new Items.RuneSat(id);
};

EntityFactory.builders[Types.Entities.RUNE.AL] = function (id) {
  return new Items.RuneAl(id);
};

EntityFactory.builders[Types.Entities.RUNE.BUL] = function (id) {
  return new Items.RuneBul(id);
};

EntityFactory.builders[Types.Entities.RUNE.NAN] = function (id) {
  return new Items.RuneNan(id);
};

EntityFactory.builders[Types.Entities.RUNE.MIR] = function (id) {
  return new Items.RuneMir(id);
};

EntityFactory.builders[Types.Entities.RUNE.GEL] = function (id) {
  return new Items.RuneGel(id);
};

EntityFactory.builders[Types.Entities.RUNE.DO] = function (id) {
  return new Items.RuneDo(id);
};

EntityFactory.builders[Types.Entities.RUNE.BAN] = function (id) {
  return new Items.RuneBan(id);
};

EntityFactory.builders[Types.Entities.RUNE.SOL] = function (id) {
  return new Items.RuneSol(id);
};

EntityFactory.builders[Types.Entities.RUNE.UM] = function (id) {
  return new Items.RuneUm(id);
};

EntityFactory.builders[Types.Entities.RUNE.HEX] = function (id) {
  return new Items.RuneHex(id);
};

EntityFactory.builders[Types.Entities.RUNE.ZAL] = function (id) {
  return new Items.RuneZal(id);
};

EntityFactory.builders[Types.Entities.RUNE.VIE] = function (id) {
  return new Items.RuneVie(id);
};

EntityFactory.builders[Types.Entities.RUNE.ETH] = function (id) {
  return new Items.RuneEth(id);
};

EntityFactory.builders[Types.Entities.RUNE.BTC] = function (id) {
  return new Items.RuneBtc(id);
};

EntityFactory.builders[Types.Entities.RUNE.VAX] = function (id) {
  return new Items.RuneVax(id);
};

EntityFactory.builders[Types.Entities.RUNE.POR] = function (id) {
  return new Items.RunePor(id);
};

EntityFactory.builders[Types.Entities.RUNE.LAS] = function (id) {
  return new Items.RuneLas(id);
};

EntityFactory.builders[Types.Entities.RUNE.CHAM] = function (id) {
  return new Items.RuneCham(id);
};

EntityFactory.builders[Types.Entities.RUNE.DUR] = function (id) {
  return new Items.RuneDur(id);
};

EntityFactory.builders[Types.Entities.RUNE.XNO] = function (id) {
  return new Items.RuneXno(id);
};

EntityFactory.builders[Types.Entities.RUNE.FAL] = function (id) {
  return new Items.RuneFal(id);
};

EntityFactory.builders[Types.Entities.RUNE.KUL] = function (id) {
  return new Items.RuneKul(id);
};

EntityFactory.builders[Types.Entities.RUNE.MER] = function (id) {
  return new Items.RuneMer(id);
};

EntityFactory.builders[Types.Entities.RUNE.QUA] = function (id) {
  return new Items.RuneQua(id);
};

EntityFactory.builders[Types.Entities.RUNE.GUL] = function (id) {
  return new Items.RuneGul(id);
};

EntityFactory.builders[Types.Entities.RUNE.BER] = function (id) {
  return new Items.RuneBer(id);
};

EntityFactory.builders[Types.Entities.RUNE.TOR] = function (id) {
  return new Items.RuneTor(id);
};

EntityFactory.builders[Types.Entities.RUNE.JAH] = function (id) {
  return new Items.RuneJah(id);
};

EntityFactory.builders[Types.Entities.RUNE.SHI] = function (id) {
  return new Items.RuneShi(id);
};

EntityFactory.builders[Types.Entities.RUNE.VOD] = function (id) {
  return new Items.RuneVod(id);
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

EntityFactory.builders[Types.Entities.RINGPLATINUM] = function (id) {
  return new Items.RingPlatinum(id);
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

EntityFactory.builders[Types.Entities.RINGMINOTAUR] = function (id) {
  return new Items.RingMinotaur(id);
};

EntityFactory.builders[Types.Entities.RINGMYSTICAL] = function (id) {
  return new Items.RingMystical(id);
};

EntityFactory.builders[Types.Entities.RINGBALROG] = function (id) {
  return new Items.RingBalrog(id);
};

EntityFactory.builders[Types.Entities.RINGCONQUEROR] = function (id) {
  return new Items.RingConqueror(id);
};

EntityFactory.builders[Types.Entities.RINGHEAVEN] = function (id) {
  return new Items.RingHeaven(id);
};

EntityFactory.builders[Types.Entities.RINGWIZARD] = function (id) {
  return new Items.RingWizard(id);
};

EntityFactory.builders[Types.Entities.AMULETSILVER] = function (id) {
  return new Items.AmuletSilver(id);
};

EntityFactory.builders[Types.Entities.AMULETGOLD] = function (id) {
  return new Items.AmuletGold(id);
};

EntityFactory.builders[Types.Entities.AMULETPLATINUM] = function (id) {
  return new Items.AmuletPlatinum(id);
};

EntityFactory.builders[Types.Entities.AMULETCOW] = function (id) {
  return new Items.AmuletCow(id);
};

EntityFactory.builders[Types.Entities.AMULETFROZEN] = function (id) {
  return new Items.AmuletFrozen(id);
};

EntityFactory.builders[Types.Entities.AMULETDEMON] = function (id) {
  return new Items.AmuletDemon(id);
};

EntityFactory.builders[Types.Entities.AMULETMOON] = function (id) {
  return new Items.AmuletMoon(id);
};

EntityFactory.builders[Types.Entities.AMULETSTAR] = function (id) {
  return new Items.AmuletStar(id);
};

EntityFactory.builders[Types.Entities.AMULETSKULL] = function (id) {
  return new Items.AmuletSkull(id);
};

EntityFactory.builders[Types.Entities.AMULETDRAGON] = function (id) {
  return new Items.AmuletDragon(id);
};

EntityFactory.builders[Types.Entities.CHESTBLUE] = function (id) {
  return new Items.ChestBlue(id);
};

EntityFactory.builders[Types.Entities.CHESTGREEN] = function (id) {
  return new Items.ChestGreen(id);
};

EntityFactory.builders[Types.Entities.CHESTPURPLE] = function (id) {
  return new Items.ChestPurple(id);
};

EntityFactory.builders[Types.Entities.CHESTRED] = function (id) {
  return new Items.ChestRed(id);
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

EntityFactory.builders[Types.Entities.SCROLLUPGRADELEGENDARY] = function (id) {
  return new Items.ScrollUpgradeLegendary(id);
};

EntityFactory.builders[Types.Entities.SCROLLUPGRADEBLESSED] = function (id) {
  return new Items.ScrollUpgradeBlessed(id);
};

EntityFactory.builders[Types.Entities.SCROLLUPGRADESACRED] = function (id) {
  return new Items.ScrollUpgradeSacred(id);
};

EntityFactory.builders[Types.Entities.SCROLLTRANSMUTE] = function (id) {
  return new Items.ScrollTransmute(id);
};

EntityFactory.builders[Types.Entities.SCROLLTRANSMUTEBLESSED] = function (id) {
  return new Items.ScrollTransmuteBlessed(id);
};

EntityFactory.builders[Types.Entities.STONESOCKET] = function (id) {
  return new Items.StoneSocket(id);
};

EntityFactory.builders[Types.Entities.STONEDRAGON] = function (id) {
  return new Items.StoneDragon(id);
};

EntityFactory.builders[Types.Entities.STONEHERO] = function (id) {
  return new Items.StoneHero(id);
};

EntityFactory.builders[Types.Entities.JEWELSKULL] = function (id) {
  return new Items.JewelSkull(id);
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

EntityFactory.builders[Types.Entities.COWKINGHORN] = function (id) {
  return new Items.CowkingHorn(id);
};

EntityFactory.builders[Types.Entities.CHALICE] = function (id) {
  return new Items.Chalice(id);
};

EntityFactory.builders[Types.Entities.SOULSTONE] = function (id) {
  return new Items.SoulStone(id);
};

EntityFactory.builders[Types.Entities.NFT] = function (id) {
  return new Items.Nft(id);
};

EntityFactory.builders[Types.Entities.WING] = function (id) {
  return new Items.Wing(id);
};

EntityFactory.builders[Types.Entities.CRYSTAL] = function (id) {
  return new Items.Crystal(id);
};

EntityFactory.builders[Types.Entities.POWDERBLACK] = function (id) {
  return new Items.PowderBlack(id);
};

EntityFactory.builders[Types.Entities.POWDERBLUE] = function (id) {
  return new Items.PowderBlue(id);
};

EntityFactory.builders[Types.Entities.POWDERGOLD] = function (id) {
  return new Items.PowderGold(id);
};

EntityFactory.builders[Types.Entities.POWDERGREEN] = function (id) {
  return new Items.PowderGreen(id);
};

EntityFactory.builders[Types.Entities.POWDERRED] = function (id) {
  return new Items.PowderRed(id);
};

EntityFactory.builders[Types.Entities.POWDERQUANTUM] = function (id) {
  return new Items.PowderQuantum(id);
};

EntityFactory.builders[Types.Entities.PICKAXE] = function (id) {
  return new Items.Pickaxe(id);
};

EntityFactory.builders[Types.Entities.FIREFOXPOTION] = function (id) {
  return new Items.Firefoxpotion(id);
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

EntityFactory.builders[Types.Entities.WAYPOINTO] = function (id) {
  return new Npcs.Waypointo(id);
};

EntityFactory.builders[Types.Entities.STASH] = function (id) {
  return new Npcs.Stash(id);
};

EntityFactory.builders[Types.Entities.PORTALCOW] = function (id) {
  return new Npcs.PortalCow(id);
};

EntityFactory.builders[Types.Entities.PORTALMINOTAUR] = function (id) {
  return new Npcs.PortalMinotaur(id);
};

EntityFactory.builders[Types.Entities.PORTALSTONE] = function (id) {
  return new Npcs.PortalStone(id);
};

EntityFactory.builders[Types.Entities.PORTALGATEWAY] = function (id) {
  return new Npcs.PortalGateway(id);
};

EntityFactory.builders[Types.Entities.GATEWAYFX] = function (id) {
  return new Npcs.GatewayFx(id);
};

EntityFactory.builders[Types.Entities.GATE] = function (id) {
  return new Npcs.Gate(id);
};

EntityFactory.builders[Types.Entities.MAGICSTONE] = function (id) {
  return new Npcs.MagicStone(id);
};

EntityFactory.builders[Types.Entities.BLUEFLAME] = function (id) {
  return new Npcs.BlueFlame(id);
};

EntityFactory.builders[Types.Entities.ALTARCHALICE] = function (id) {
  return new Npcs.AltarChalice(id);
};

EntityFactory.builders[Types.Entities.ALTARSOULSTONE] = function (id) {
  return new Npcs.AltarSoulStone(id);
};

EntityFactory.builders[Types.Entities.SECRETSTAIRS] = function (id) {
  return new Npcs.SecretStairs(id);
};

EntityFactory.builders[Types.Entities.SECRETSTAIRS2] = function (id) {
  return new Npcs.SecretStairs2(id);
};

EntityFactory.builders[Types.Entities.SECRETSTAIRSUP] = function (id) {
  return new Npcs.SecretStairsUp(id);
};

EntityFactory.builders[Types.Entities.TOMBDEATHANGEL] = function (id) {
  return new Npcs.TombDeathAngel(id);
};

EntityFactory.builders[Types.Entities.TOMBANGEL] = function (id) {
  return new Npcs.TombAngel(id);
};

EntityFactory.builders[Types.Entities.TOMBCROSS] = function (id) {
  return new Npcs.TombCross(id);
};

EntityFactory.builders[Types.Entities.TOMBSKULL] = function (id) {
  return new Npcs.TombSkull(id);
};

EntityFactory.builders[Types.Entities.LEVER] = function (id) {
  return new Npcs.Lever(id);
};

EntityFactory.builders[Types.Entities.LEVER2] = function (id) {
  return new Npcs.Lever2(id);
};

EntityFactory.builders[Types.Entities.GRIMOIRE] = function (id) {
  return new Npcs.Grimoire(id);
};

EntityFactory.builders[Types.Entities.FOSSIL] = function (id) {
  return new Npcs.Fossil(id);
};

EntityFactory.builders[Types.Entities.OBELISK] = function (id) {
  return new Npcs.Obelisk(id);
};

EntityFactory.builders[Types.Entities.HANDS] = function (id) {
  return new Npcs.Hands(id);
};

EntityFactory.builders[Types.Entities.ALKOR] = function (id) {
  return new Npcs.Alkor(id);
};

EntityFactory.builders[Types.Entities.OLAF] = function (id) {
  return new Npcs.Olaf(id);
};

EntityFactory.builders[Types.Entities.VICTOR] = function (id) {
  return new Npcs.Victor(id);
};

EntityFactory.builders[Types.Entities.FOX] = function (id) {
  return new Npcs.Fox(id);
};

EntityFactory.builders[Types.Entities.TREE] = function (id) {
  return new Npcs.Tree(id);
};

EntityFactory.builders[Types.Entities.TRAP] = function (id) {
  return new Npcs.Trap(id);
};

EntityFactory.builders[Types.Entities.TRAP2] = function (id) {
  return new Npcs.Trap2(id);
};

EntityFactory.builders[Types.Entities.TRAP3] = function (id) {
  return new Npcs.Trap3(id);
};

EntityFactory.builders[Types.Entities.DOORDEATHANGEL] = function (id) {
  return new Npcs.DoorDeathAngel(id);
};

export default EntityFactory;
