import isEqual from "lodash/isEqual";

import { kinds, Types } from "../../shared/js/gametypes";
import {
  ACHIEVEMENT_CRYSTAL_INDEX,
  ACHIEVEMENT_NFT_INDEX,
  ACHIEVEMENT_OBELISK_INDEX,
  ACHIEVEMENT_WING_INDEX,
} from "../../shared/js/types/achievements";
import { toArray, toNumber } from "../../shared/js/utils";
import Character from "./character";
import Exceptions from "./exceptions";

interface PartyMember {
  id: number;
  name: string;
}

class Player extends Character {
  spriteName: any;
  name: any;
  account: any;
  hash: string;
  nameOffsetY: number;
  armorName: string;
  armorLevel: number;
  armorBonus: null | number[];
  armorSocket: null | number[];
  weaponName: string;
  weaponLevel: number;
  weaponBonus: null | number[];
  weaponSocket: null | number[];
  weaponSkill: null | number[];
  weaponRuneword: null | string;
  isWeaponUnique: boolean;
  beltName: null;
  beltLevel: number | null;
  beltBonus: null | number[];
  cape?: string;
  capeLevel?: number;
  capeBonus: null | number[];
  capeHue: number;
  capeSaturate: number;
  capeContrast: number;
  capeBrightness: number;
  shieldName: null;
  shieldLevel: number | null;
  shieldBonus: number[] | null;
  shieldSocket: number[] | null;
  defenseSkill: number | null;
  defenseSkillTimeout: NodeJS.Timeout;
  attackSkill: number | null;
  attackSkillTimeout: NodeJS.Timeout;
  inventory: any[];
  stash: any[];
  upgrade: any[];
  tradePlayer1: any[];
  tradePlayer2: any[];
  experience: number;
  gold: number;
  goldStash: number;
  goldTrade: number;
  coin: number;
  gems: any;
  artifact: any;
  expansion1: boolean;
  expansion2: boolean;
  waypoints: any[];
  skeletonKey: boolean;
  nanoPotions: number;
  damage: string;
  absorb: string;
  ring1Name: null;
  ring1Level: number | null;
  ring1Bonus: null | number[];
  ring2Name: null;
  ring2Level: number | null;
  ring2Bonus: null | number[];
  amuletName: null;
  amuletLevel: number | null;
  amuletBonus: null | number[];
  bonus: any;
  setBonus: any;
  isLootMoving: boolean;
  isSwitchingWeapon: boolean;
  pvpFlag: boolean;
  invite: any;
  currentArmorSprite: any;
  id: any;
  invincible: any;
  sprite: any;
  switch_callback: any;
  invinciblestart_callback: any;
  invinciblestop_callback: any;
  invincibleTimeout: any;
  level: any;
  x: number;
  y: number;
  gridX: number;
  gridY: number;
  moveUp: boolean;
  moveDown: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  disableKeyboardNpcTalk: boolean;
  isHurtByTrap: boolean;

  partyId?: number;
  partyLeader?: PartyMember;
  partyMembers: PartyMember[];

  network: "nano" | "ban";

  constructor(id, name, account, kind) {
    super(id, kind);

    this.type = "player";
    this.name = name;
    this.account = account;
    this.level = 1;

    // Renderer
    this.nameOffsetY = -10;

    // sprites
    this.spriteName = "clotharmor";
    this.armorName = "clotharmor";
    this.armorLevel = 1;
    this.armorBonus = null;
    this.weaponName = "dagger";
    this.weaponLevel = 1;
    this.weaponBonus = null;
    this.weaponRuneword = null;
    this.isWeaponUnique = false;
    this.beltName = null;
    this.beltLevel = 1;
    this.beltBonus = null;
    this.cape = null;
    this.capeLevel = null;
    this.capeBonus = null;
    this.capeHue = 0;
    this.capeSaturate = 0;
    this.capeContrast = 0;
    this.capeBrightness = 1;
    this.shieldName = null;
    this.shieldLevel = 1;
    this.shieldBonus = null;
    this.inventory = [];
    this.stash = [];
    this.upgrade = [];
    this.tradePlayer1 = [];
    this.tradePlayer2 = [];
    this.gems = [];
    this.artifact = [];
    this.expansion1 = false;
    this.expansion2 = false;
    this.waypoints = [];
    this.skeletonKey = false;

    this.nanoPotions = 0;
    this.damage = "0";
    this.absorb = "0";
    this.ring1Name = null;
    this.ring1Level = null;
    this.ring1Bonus = null;
    this.ring2Name = null;
    this.ring2Level = null;
    this.ring2Bonus = null;
    this.amuletName = null;
    this.amuletLevel = null;
    this.amuletBonus = null;
    this.auras = [];
    this.setBonus = {};
    this.bonus = {};

    // modes
    this.isLootMoving = false;
    this.isSwitchingWeapon = true;

    // PVP Flag
    this.pvpFlag = true;
    this.moveUp = false;
    this.moveDown = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.disableKeyboardNpcTalk = false;

    this.partyId = null;
    this.partyLeader = null;
    this.partyMembers = null;

    this.network = null;
  }

  setPartyId(partyId) {
    this.partyId = partyId;
  }

  setPartyLeader(partyLeader) {
    this.partyLeader = partyLeader;
  }

  setPartyMembers(partyMembers) {
    this.partyMembers = partyMembers;
  }

  setCapeHue(hue: number) {
    this.capeHue = hue;
  }

  setCapeSaturate(saturate: number) {
    this.capeSaturate = saturate;
  }

  setCapeContrast(contrast: number) {
    this.capeContrast = contrast;
  }

  setCapeBrightness(brightness: number) {
    this.capeBrightness = brightness;
  }

  loot(item, achievements) {
    if (item) {
      if (Types.Entities.Gems.includes(item.kind)) {
        var index = Types.Entities.Gems.indexOf(item.kind);
        if (index > -1 && this.gems[index] !== 0) {
          throw new Exceptions.LootException(`You already collected the ${Types.getGemNameFromKind(item.kind)} gem.`);
        } else {
          this.gems[index] = 1;
        }
      } else if (Types.Entities.Artifact.includes(item.kind)) {
        var index = Types.Entities.Artifact.indexOf(item.kind);
        if (index > -1 && this.artifact[index] !== 0) {
          throw new Exceptions.LootException(
            `You already collected the ${Types.getArtifactNameFromKind(item.kind)} part.`,
          );
        } else {
          this.artifact[index] = 1;
        }
      } else if (item.kind === Types.Entities.SKELETONKEY) {
        if (this.skeletonKey) {
          throw new Exceptions.LootException(`You already have the Skeleton Key.`);
        } else {
          this.skeletonKey = true;
        }
      } else if (item.kind === Types.Entities.NANOPOTION || item.kind === Types.Entities.BANANOPOTION) {
        this.nanoPotions += 1;
      } else if (item.partyId && item.partyId !== this.partyId) {
        // @NOTE Allow item to be looted by others if player is alone in the party?
        throw new Exceptions.LootException("Can't loot item, it belongs to a party.");
      } else if (["armor", "weapon", "belt", "cape", "shield", "ring", "amulet", "rune"].includes(item.type)) {
        // @NOTE Check for stack-able items with quantity
        if (this.inventory.length >= 24) {
          throw new Exceptions.LootException("Your inventory is full.");
        }
      } else if (Types.isSingle(item.kind)) {
        const { itemKind } = item;
        const isFound = this.inventory
          .concat(this.upgrade)
          .concat(this.stash)
          .concat([{ item: this.weaponName }])
          .some(({ item }) => item === itemKind);

        if (isFound) {
          throw new Exceptions.LootException("You already have this item.");
        } else if (item.kind === Types.Entities.NFT && achievements[ACHIEVEMENT_NFT_INDEX]) {
          throw new Exceptions.LootException("You already completed the NFT achievement.");
        } else if (item.kind === Types.Entities.WING && achievements[ACHIEVEMENT_WING_INDEX]) {
          throw new Exceptions.LootException("You already completed the Dragon Wing achievement.");
        } else if (item.kind === Types.Entities.CRYSTAL && achievements[ACHIEVEMENT_CRYSTAL_INDEX]) {
          throw new Exceptions.LootException("You already completed the Crystal achievement.");
        } else if (item.kind === Types.Entities.PICKAXE && achievements[ACHIEVEMENT_OBELISK_INDEX]) {
          throw new Exceptions.LootException("You already completed the Obelisk achievement.");
        }
      } else if (item.kind === Types.Entities.NANOCOIN && this.network !== "nano") {
        throw new Exceptions.LootException("You can't loot XNO coins.");
      } else if (item.kind === Types.Entities.BANANOCOIN && this.network !== "ban") {
        throw new Exceptions.LootException("You can't loot BAN coins.");
      }

      console.info("Player " + this.id + " has looted " + item.id);
      if (item.kind === Types.Entities.FIREFOXPOTION) {
        item.onLoot(this);
      }
    }
  }

  /**
   * Returns true if the character is currently walking towards an item in order to loot it.
   */
  isMovingToLoot() {
    return this.isLootMoving;
  }

  getEquipment() {
    return [
      this.weaponName,
      this.armorName,
      this.beltName,
      this.shieldName,
      this.amuletName,
      this.ring1Name,
      this.ring2Name,
    ];
  }

  getSpriteName() {
    return this.spriteName;
  }

  setSpriteName(name) {
    this.spriteName = name;
  }

  getArmorSprite() {
    if (this.invincible) {
      return this.normalSprite;
    } else {
      return this.sprite;
    }
  }

  getArmorName() {
    var sprite = this.getArmorSprite();
    return sprite.id;
  }

  setArmorName(name) {
    this.armorName = name;
  }

  getArmorLevel() {
    return this.armorLevel;
  }

  setArmorLevel(level) {
    this.armorLevel = toNumber(level);
  }

  getArmorBonus() {
    return this.armorBonus;
  }

  getArmorSocket() {
    return this.armorSocket;
  }

  setArmorBonus(bonus) {
    this.armorBonus = toArray(bonus);
  }

  setArmorSocket(socket) {
    this.armorSocket = toArray(socket);
  }

  getWeaponName() {
    return this.weaponName;
  }

  setWeaponName(name) {
    this.weaponName = name;
  }

  getWeaponLevel() {
    return this.weaponLevel;
  }

  setWeaponLevel(level) {
    this.weaponLevel = toNumber(level);
  }

  getWeaponBonus() {
    return this.weaponBonus;
  }

  setWeaponBonus(bonus) {
    this.weaponBonus = toArray(bonus);
    this.isWeaponUnique = !!(this.weaponBonus && this.weaponBonus?.length === 2);
  }

  setWeaponSocket(socket) {
    this.weaponSocket = toArray(socket);
    this.weaponRuneword = Array.isArray(this.weaponSocket)
      ? Types.getRunewordBonus({
          isUnique: this.isWeaponUnique,
          socket: this.weaponSocket,
          type: "weapon",
        }).runeword
      : null;
  }

  getWeaponSocket() {
    return this.weaponSocket;
  }

  getShieldName() {
    return this.shieldName;
  }

  setShieldName(name) {
    this.shieldName = name;
  }

  getShieldLevel() {
    return this.shieldLevel;
  }

  setShieldLevel(level) {
    this.shieldLevel = toNumber(level);
  }

  getShieldBonus() {
    return this.shieldBonus;
  }

  setShieldBonus(bonus) {
    this.shieldBonus = toArray(bonus);
  }

  setShieldSocket(socket) {
    this.shieldSocket = toArray(socket);
  }

  getShieldSocket() {
    return this.shieldSocket;
  }

  getDefenseSkill() {
    return this.defenseSkill;
  }

  setDefenseSkill(skill) {
    this.defenseSkill = toNumber(skill);
  }

  getAttackSkill() {
    return this.attackSkill;
  }

  setAttackSkill(skill) {
    this.attackSkill = toNumber(skill);
  }

  setBelt(rawBelt) {
    if (rawBelt) {
      const [belt, level, bonus] = rawBelt.split(":");

      this.beltName = belt;
      this.beltLevel = toNumber(level);
      this.beltBonus = toArray(bonus);
    } else {
      this.beltName = null;
      this.beltLevel = null;
      this.beltBonus = null;
    }
  }

  setCape(rawCape) {
    if (rawCape) {
      const [cape, level, bonus] = rawCape.split(":");

      this.cape = cape;
      this.capeLevel = toNumber(level);
      this.capeBonus = toArray(bonus);
    } else {
      this.cape = null;
      this.capeLevel = null;
      this.capeBonus = null;
    }
  }

  setShield(rawShield) {
    if (rawShield) {
      const [shield, level, bonus, socket, skill] = rawShield.split(":");

      this.shieldName = shield;
      this.shieldLevel = toNumber(level);
      this.shieldBonus = toArray(bonus);
      this.shieldSocket = toArray(socket);
      this.defenseSkill = toNumber(skill);
    } else {
      this.shieldName = null;
      this.shieldLevel = null;
      this.shieldBonus = null;
      this.defenseSkill = null;
    }
  }

  setSettings(settings) {
    if (settings.capeHue) {
      this.capeHue = settings.capeHue;
    }
    if (settings.capeSaturate) {
      this.capeSaturate = settings.capeSaturate;
    }
    if (settings.capeContrast) {
      this.capeContrast = settings.capeContrast;
    }
    if (settings.capeBrightness) {
      this.capeBrightness = settings.capeBrightness;
    }
  }

  setRing1(ring) {
    if (ring) {
      const [name, level, bonus] = ring.split(":");

      this.ring1Name = name;
      this.ring1Level = toNumber(level);
      this.ring1Bonus = toArray(bonus);
    } else {
      this.ring1Name = null;
      this.ring1Level = null;
      this.ring1Bonus = null;
    }
  }

  setRing2(ring) {
    if (ring) {
      const [name, level, bonus] = ring.split(":");

      this.ring2Name = name;
      this.ring2Level = toNumber(level);
      this.ring2Bonus = toArray(bonus);
    } else {
      this.ring2Name = null;
      this.ring2Level = null;
      this.ring2Bonus = null;
    }
  }

  setAmulet(amulet) {
    if (amulet) {
      const [name, level, bonus] = amulet.split(":");

      this.amuletName = name;
      this.amuletLevel = toNumber(level);
      this.amuletBonus = toArray(bonus);
    } else {
      this.amuletName = null;
      this.amuletLevel = null;
      this.amuletBonus = null;
    }
  }

  setLevel(level) {
    this.level = level;
  }

  setAuras(auras) {
    this.auras = auras || [];
  }

  hasWeapon() {
    return this.weaponName !== null;
  }

  switchWeapon(weapon, level: number, bonus?: number[], socket?: number[], skill?: number) {
    var isDifferent = false;

    if (weapon !== this.getWeaponName()) {
      isDifferent = true;
      this.setWeaponName(weapon);
    }
    if (toNumber(level) !== this.getWeaponLevel()) {
      isDifferent = true;
      this.setWeaponLevel(level);
    }
    if (!isEqual(bonus, this.getWeaponBonus())) {
      isDifferent = true;
      this.setWeaponBonus(bonus);
    }
    if (!isEqual(socket, this.getWeaponSocket())) {
      isDifferent = true;
      this.setWeaponSocket(socket);
    }
    if (toNumber(skill) !== this.getAttackSkill()) {
      isDifferent = true;
      this.setAttackSkill(skill);
    }

    if (isDifferent) {
      this.switch_callback?.();
    }
  }

  switchArmor(armorSprite, level: number, bonus?: number[], socket?: number[]) {
    var isDifferent = false;

    if (armorSprite && armorSprite.id !== this.getSpriteName()) {
      isDifferent = true;
      this.setSprite(armorSprite);
      this.setSpriteName(armorSprite.id);
      this.setArmorName(armorSprite.id);
    }

    if (armorSprite.name !== "firefox" && level && level !== this.getArmorLevel()) {
      isDifferent = true;
      this.setArmorLevel(level);
    }

    if (bonus !== this.getArmorBonus()) {
      isDifferent = true;
      this.setArmorBonus(bonus);
    }

    if (socket !== this.getArmorSocket()) {
      isDifferent = true;
      this.setArmorSocket(socket);
    }

    if (armorSprite.name !== "firefox" && isDifferent) {
      this.switch_callback?.();
    }
  }

  switchCape(cape, level: number, bonus?: number[]) {
    var isDifferent = false;

    if (cape !== this.cape) {
      isDifferent = true;
      this.cape = cape;
    }
    if (level !== this.capeLevel) {
      isDifferent = true;
      this.capeLevel = level;
    }
    if (bonus !== this.capeBonus) {
      isDifferent = true;
      this.capeBonus = bonus;
    }

    if (isDifferent) {
      this.switch_callback?.();
    }
  }

  switchShield(shield, level: number, bonus?: number[], socket?: number[], skill?: number) {
    var isDifferent = false;

    if (shield !== this.getShieldName()) {
      isDifferent = true;
      this.setShieldName(shield);
    }
    if (level !== this.getShieldLevel()) {
      isDifferent = true;
      this.setShieldLevel(level);
    }
    if (toArray(bonus) !== this.getShieldBonus()) {
      isDifferent = true;
      this.setShieldBonus(bonus);
    }
    if (toArray(socket) !== this.getShieldSocket()) {
      isDifferent = true;
      this.setShieldSocket(bonus);
    }

    if (skill !== this.getDefenseSkill()) {
      isDifferent = true;
      this.setDefenseSkill(skill);
    }

    if (isDifferent) {
      this.switch_callback?.();
    }
  }

  removeCape() {
    this.cape = null;
    this.capeLevel = null;
    this.capeBonus = null;

    this.switch_callback?.();
  }

  removeShield() {
    this.shieldName = null;
    this.shieldLevel = null;
    this.shieldBonus = null;
    this.defenseSkill = null;

    this.switch_callback?.();
  }

  prepareRawItems(items) {
    return items
      .map((rawItem, slot) => {
        if (!rawItem) return false;
        const delimiter = Types.isJewel(rawItem) ? "|" : ":";
        const [item, levelOrQuantity, bonus, socket, skill] = rawItem.split(delimiter);

        const isWeapon = kinds[item][1] === "weapon";
        const isArmor = kinds[item][1] === "armor";
        const isBelt = kinds[item][1] === "belt";
        const isCape = kinds[item][1] === "cape";
        const isShield = kinds[item][1] === "shield";
        const isRing = kinds[item][1] === "ring";
        const isAmulet = kinds[item][1] === "amulet";
        const isChest = kinds[item][1] === "chest";
        const isJewel = kinds[item][1] === "jewel";
        const hasLevel = isWeapon || isArmor || isBelt || isCape || isShield || isRing || isAmulet || isJewel;
        const level = hasLevel ? parseInt(levelOrQuantity) : null;
        const isUnique = Types.isUnique(item, bonus, isJewel ? level : undefined);

        let requirement = null;
        let quantity = null;
        let runeword = null;

        if (hasLevel) {
          requirement = Types.getItemRequirement(item, levelOrQuantity);

          if (isWeapon || isArmor || isShield) {
            ({ runeword } = Types.getRunewordBonus({
              isUnique,
              socket: toArray(socket),
              type: kinds[item][1],
            }));
          }
        } else if (Types.isScroll(item) || isChest || Types.isRune(item) || Types.isStone(item)) {
          quantity = parseInt(levelOrQuantity);
        }

        return {
          item,
          bonus,
          skill,
          socket,
          slot,
          requirement,
          isUnique,
          runeword,
          ...{ level },
          ...{ quantity },
        };
      })
      .filter(Boolean);
  }

  setInventory(inventory) {
    this.inventory = this.prepareRawItems(inventory);
  }

  setUpgrade(upgrade) {
    this.upgrade = this.prepareRawItems(upgrade);
  }

  setStash(stash) {
    this.stash = this.prepareRawItems(stash);
  }

  setGold(gold) {
    this.gold = gold;
  }

  setGoldStash(gold) {
    this.goldStash = gold;
  }

  setGoldTrade(gold) {
    this.goldTrade = gold;
  }

  setCoin(coin) {
    this.coin = coin;
  }

  setTradePlayer1(items) {
    this.tradePlayer1 = this.prepareRawItems(items);
  }

  setTradePlayer2(items) {
    this.tradePlayer2 = this.prepareRawItems(items);
  }

  onSwitchItem(callback) {
    this.switch_callback = callback;
  }

  onInvincibleStart(callback) {
    this.invinciblestart_callback = callback;
  }

  onInvincibleStop(callback) {
    this.invinciblestop_callback = callback;
  }

  startInvincibility() {
    var self = this;

    if (this.invincibleTimeout) {
      clearTimeout(this.invincibleTimeout);
      this.invincibleTimeout = null;
    }

    if (!this.invincible) {
      this.currentArmorSprite = this.getSprite();
      this.invincible = true;
      this.invinciblestart_callback();
    }

    this.invincibleTimeout = setTimeout(function () {
      self.stopInvincibility();
      self.idle(Types.Orientations.DOWN);
    }, 10000);
  }

  stopInvincibility() {
    this.invincible = false;
    this.invinciblestop_callback();

    if (this.invincibleTimeout) {
      clearTimeout(this.invincibleTimeout);
      this.invincibleTimeout = null;
    }

    if (this.currentArmorSprite) {
      this.setSprite(this.currentArmorSprite);
      this.setSpriteName(this.currentArmorSprite.id);
      this.currentArmorSprite = null;
    }
  }

  flagPVP(pvpFlag) {
    this.pvpFlag = pvpFlag;
  }
}

export default Player;
