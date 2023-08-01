import merge from "lodash/merge";

import { ACHIEVEMENT_COUNT } from "../../shared/js/types/achievements";
import {
  COW_COUNT,
  DMG_TOTAL,
  GHOST_COUNT,
  GOLEM_COUNT,
  KILLS_TOTAL,
  MAGE_COUNT,
  MINI_BOSS_COUNT,
  OCULOTHORAX_COUNT,
  RAT_COUNT,
  RAT3_COUNT,
  SKELETON_COUNT,
  SKELETON3_COUNT,
  SKELETON4_COUNT,
  SKELETONARCHER_COUNT,
  SKELETONBERSERKER_COUNT,
  SPECTRE_COUNT,
  WEREWOLF_COUNT,
  WRAITH_COUNT,
  WRAITH2_COUNT,
  YETI_COUNT,
} from "./achievements";

const defaultData = {
  hasAlreadyPlayed: false,
  player: {
    name: "",
    weapon: "",
    armor: "",
    image: "",
    password: "",
  },
  settings: {
    music: true,
    musicVolume: 0.7,
    sound: true,
    soundVolume: 0.7,
    showEntityName: true,
    showDamageInfo: true,
    showAnvilOdds: false,
    showHealthAboveBars: false,
    capeHue: 0,
    capeSaturate: 0,
    capeContrast: 0,
    capeBrightness: 1,
    debug: false,
    effects: true,
  },
  achievements: {
    ratCount: 0,
    rat3Count: 0,
    skeletonCount: 0,
    spectreCount: 0,
    yetiCount: 0,
    werewolfCount: 0,
    skeleton3Count: 0,
    wraithCount: 0,
    cowCount: 0,
    mageCount: 0,
    golemCount: 0,
    oculothoraxCount: 0,
    skeleton4Count: 0,
    ghostCount: 0,
    skeletonBerserkerCount: 0,
    skeletonArcherCount: 0,
    wraith2Count: 0,
    miniBossCount: 0,
    totalKills: 0,
    totalDmg: 0,
    totalRevives: 0,
    magicStones: [0, 0, 0, 0, 0, 0],
  },
  achievement: new Array(ACHIEVEMENT_COUNT).fill(0),
};

// @TODO Add periodic checks if the storage is manipulated, if so BAN

class Storage {
  data: any;

  constructor() {
    if (this.hasLocalStorage() && window.localStorage.data) {
      this.data = merge(defaultData, JSON.parse(window.localStorage.data));
    } else {
      this.data = defaultData;
    }
    this.save();
  }

  hasLocalStorage() {
    return !!window.localStorage;
  }

  save() {
    if (this.hasLocalStorage()) {
      localStorage.data = JSON.stringify(this.data);
    }
  }

  clear() {
    if (this.hasLocalStorage()) {
      this.data = defaultData;
      this.save();
    }
  }

  // Player

  hasAlreadyPlayed() {
    return this.data.hasAlreadyPlayed;
  }

  initPlayer(name, account) {
    this.data.hasAlreadyPlayed = true;
    this.setPlayerName(name);
    this.setPlayerAccount(account);
  }

  setPlayerName(name) {
    this.data.player.name = name;
    this.save();
  }

  setPlayerAccount(account) {
    this.data.player.account = account;
    this.save();
  }

  setPlayerPassword(password) {
    this.data.player.password = password;
    this.save();
  }

  setPlayerImage(img) {
    this.data.player.image = img;
    this.save();
  }

  setPlayerArmor(armor) {
    this.data.player.armor = armor;
    this.save();
  }

  setPlayerWeapon(weapon) {
    this.data.player.weapon = weapon;
    this.save();
  }

  setAchievement(achievement) {
    this.data.achievement = achievement;
    this.save();
  }

  setMusicEnabled(enabled) {
    this.data.settings.music = enabled;
    this.save();
  }

  setMusicVolume(volume) {
    this.data.settings.musicVolume = volume;
    this.save();
  }

  setSoundEnabled(enabled) {
    this.data.settings.sound = enabled;
    this.save();
  }

  setSoundVolume(volume) {
    this.data.settings.soundVolume = volume;
    this.save();
  }

  setShowEntityNameEnabled(enabled) {
    this.data.settings.showEntityName = enabled;
    this.save();
  }

  setShowDamageInfoEnabled(enabled) {
    this.data.settings.showDamageInfo = enabled;
    this.save();
  }

  setDebug(enabled) {
    this.data.settings.debug = enabled;
    this.save();
  }

  // setShowAnvilOddsEnabled(enabled) {
  //   this.data.settings.showAnvilOdds = enabled;
  //   this.save();
  // }

  // setShowHealthAboveBarsEnabled(enabled) {
  //   this.data.settings.showHealthAboveBars = enabled;
  //   this.save();
  // }

  // isAudioEnabled() {
  //   if (typeof this.data.settings.audio !== "boolean" || this.data.settings.audio) {
  //     return true;
  //   }
  //   return false;
  // }

  isMusicEnabled() {
    if (typeof this.data.settings.music !== "boolean" || this.data.settings.music) {
      return true;
    }
    return false;
  }

  isSoundEnabled() {
    if (typeof this.data.settings.sound !== "boolean" || this.data.settings.sound) {
      return true;
    }
    return false;
  }

  showEntityNameEnabled() {
    if (typeof this.data.settings.showEntityName !== "boolean" || this.data.settings.showEntityName) {
      return true;
    }
    return false;
  }

  showDamageInfoEnabled() {
    if (typeof this.data.settings.showDamageInfo !== "boolean" || this.data.settings.showDamageInfo) {
      return true;
    }
    return false;
  }

  showAnvilOddsEnabled() {
    if (typeof this.data.settings.showAnvilOdds !== "boolean") return false;

    return this.data.settings.showAnvilOdds;
  }

  debugEnabled() {
    if (typeof this.data.settings.debug !== "boolean") return false;

    return this.data.settings.debug;
  }

  showHealthAboveBarsEnabled() {
    if (typeof this.data.settings.showHealthAboveBars !== "boolean") return false;

    return this.data.settings.showHealthAboveBars;
  }

  savePlayer(img) {
    this.setPlayerImage(img);
  }

  // Achievements

  hasUnlockedAchievement(id) {
    return this.data.achievement[id - 1];
  }

  unlockAchievement(id) {
    if (!this.hasUnlockedAchievement(id)) {
      this.data.achievement[id - 1] = 1;
      this.save();
      return true;
    }
    return false;
  }

  getAchievements() {
    return this.data.achievement;
  }

  getAchievementCount() {
    return this.data.achievement.filter(Boolean).length;
  }

  // Angry rats
  getRatCount() {
    return this.data.achievements.ratCount;
  }

  incrementRatCount() {
    if (this.data.achievements.ratCount < RAT_COUNT) {
      this.data.achievements.ratCount++;
      this.save();
    }
  }

  // Skull Collector
  getSkeletonCount() {
    return this.data.achievements.skeletonCount;
  }

  incrementSkeletonCount() {
    if (this.data.achievements.skeletonCount < SKELETON_COUNT) {
      this.data.achievements.skeletonCount++;
      this.save();
    }
  }

  // Spectre Collector
  getSpectreCount() {
    return this.data.achievements.spectreCount;
  }

  incrementSpectreCount() {
    if (!this.data.achievements.spectreCount) {
      this.data.achievements.spectreCount = 0;
    }

    if (this.data.achievements.spectreCount < SPECTRE_COUNT) {
      this.data.achievements.spectreCount++;
      this.save();
    }
  }

  // Bloodlust
  getWerewolfCount() {
    return this.data.achievements.werewolfCount;
  }

  incrementWerewolfCount() {
    if (!this.data.achievements.werewolfCount) {
      this.data.achievements.werewolfCount = 0;
    }

    if (this.data.achievements.werewolfCount < WEREWOLF_COUNT) {
      this.data.achievements.werewolfCount++;
      this.save();
    }
  }

  // Myth or Real
  getYetiCount() {
    return this.data.achievements.yetiCount;
  }

  incrementYetiCount() {
    if (!this.data.achievements.yetiCount) {
      this.data.achievements.yetiCount = 0;
    }

    if (this.data.achievements.yetiCount < YETI_COUNT) {
      this.data.achievements.yetiCount++;
      this.save();
    }
  }

  // R.I.P.
  getSkeleton3Count() {
    return this.data.achievements.skeleton3Count;
  }

  incrementSkeleton3Count() {
    if (!this.data.achievements.skeleton3Count) {
      this.data.achievements.skeleton3Count = 0;
    }

    if (this.data.achievements.skeleton3Count < SKELETON3_COUNT) {
      this.data.achievements.skeleton3Count++;
      this.save();
    }
  }

  // GHOSTBUSTER
  getWraithCount() {
    return this.data.achievements.wraithCount;
  }

  incrementWraithCount() {
    if (!this.data.achievements.wraithCount) {
      this.data.achievements.wraithCount = 0;
    }

    if (this.data.achievements.wraithCount < WRAITH_COUNT) {
      this.data.achievements.wraithCount++;
      this.save();
    }
  }

  // Meat Fest
  getCowCount() {
    return this.data.achievements.cowCount;
  }

  incrementCowCount() {
    if (!this.data.achievements.cowCount) {
      this.data.achievements.cowCount = 0;
    }

    if (this.data.achievements.cowCount < COW_COUNT) {
      this.data.achievements.cowCount++;
      this.save();
    }
  }

  // ANTIDOTE
  getRat3Count() {
    return this.data.achievements.rat3Count;
  }

  incrementRat3Count() {
    if (this.data.achievements.rat3Count < RAT3_COUNT) {
      this.data.achievements.rat3Count++;
      this.save();
    }
  }

  // UNBREAKABLE
  getGolemCount() {
    return this.data.achievements.golemCount;
  }

  incrementGolemCount() {
    if (!this.data.achievements.golemCount) {
      this.data.achievements.golemCount = 0;
    }

    if (this.data.achievements.golemCount < GOLEM_COUNT) {
      this.data.achievements.golemCount++;
      this.save();
    }
  }

  // CYCLOP
  getOculothoraxCount() {
    return this.data.achievements.oculothoraxCount;
  }

  incrementOculothoraxCount() {
    if (!this.data.achievements.oculothoraxCount) {
      this.data.achievements.oculothoraxCount = 0;
    }

    if (this.data.achievements.oculothoraxCount < OCULOTHORAX_COUNT) {
      this.data.achievements.oculothoraxCount++;
      this.save();
    }
  }

  // CRUSADER
  getSkeleton4Count() {
    return this.data.achievements.skeleton4Count;
  }

  incrementSkeleton4Count() {
    if (!this.data.achievements.skeleton4Count) {
      this.data.achievements.skeleton4Count = 0;
    }

    if (this.data.achievements.skeleton4Count < SKELETON4_COUNT) {
      this.data.achievements.skeleton4Count++;
      this.save();
    }
  }

  // VIKING
  getSkeletonBerserkerCount() {
    return this.data.achievements.skeletonBerserkerCount;
  }

  incrementSkeletonBerserkerCount() {
    if (!this.data.achievements.skeletonBerserkerCount) {
      this.data.achievements.skeletonBerserkerCount = 0;
    }

    if (this.data.achievements.skeletonBerserkerCount < SKELETONBERSERKER_COUNT) {
      this.data.achievements.skeletonBerserkerCount++;
      this.save();
    }
  }

  // BULLSEYE
  getSkeletonArcherCount() {
    return this.data.achievements.skeletonArcherCount;
  }

  incrementSkeletonArcherCount() {
    if (!this.data.achievements.skeletonArcherCount) {
      this.data.achievements.skeletonArcherCount = 0;
    }

    if (this.data.achievements.skeletonArcherCount < SKELETONARCHER_COUNT) {
      this.data.achievements.skeletonArcherCount++;
      this.save();
    }
  }

  // BOO
  getGhostCount() {
    return this.data.achievements.ghostCount;
  }

  incrementGhostCount() {
    if (!this.data.achievements.ghostCount) {
      this.data.achievements.ghostCount = 0;
    }

    if (this.data.achievements.ghostCount < GHOST_COUNT) {
      this.data.achievements.ghostCount++;
      this.save();
    }
  }

  // SPECTRAL
  getWraith2Count() {
    return this.data.achievements.wraith2Count;
  }

  incrementWraith2Count() {
    if (!this.data.achievements.wraith2Count) {
      this.data.achievements.wraith2Count = 0;
    }

    if (this.data.achievements.wraith2Count < WRAITH2_COUNT) {
      this.data.achievements.wraith2Count++;
      this.save();
    }
  }

  // ARCHMAGE
  getMageCount() {
    return this.data.achievements.mageCount;
  }

  incrementMageCount() {
    if (!this.data.achievements.mageCount) {
      this.data.achievements.mageCount = 0;
    }

    if (this.data.achievements.mageCount < MAGE_COUNT) {
      this.data.achievements.mageCount++;
      this.save();
    }
  }

  // MINI_BOSS
  getMiniBossCount() {
    return this.data.achievements.miniBossCount;
  }

  incrementMiniBossCount() {
    if (!this.data.achievements.miniBossCount) {
      this.data.achievements.miniBossCount = 0;
    }

    if (this.data.achievements.miniBossCount < MINI_BOSS_COUNT) {
      this.data.achievements.miniBossCount++;
      this.save();
    }
  }

  // Meatshield
  getTotalDamageTaken() {
    return this.data.achievements.totalDmg;
  }

  addDamage(damage) {
    if (this.data.achievements.totalDmg < DMG_TOTAL) {
      this.data.achievements.totalDmg += damage;
      this.save();
    }
  }

  // Hunter
  getTotalKills() {
    return this.data.achievements.totalKills;
  }

  incrementTotalKills() {
    if (this.data.achievements.totalKills < KILLS_TOTAL) {
      this.data.achievements.totalKills++;
      this.save();
    }
  }

  // Still Alive
  getTotalRevives() {
    return this.data.achievements.totalRevives;
  }

  incrementRevives() {
    if (this.data.achievements.totalRevives < 5) {
      this.data.achievements.totalRevives++;
      this.save();
    }
  }

  // STONEHENGE
  hasAllMagicStones() {
    return !this.data.achievements.magicStones.some(x => x === 0);
  }

  activateMagicStone(x) {
    if (!this.data.achievements.magicStones.includes(x)) {
      const index = this.data.achievements.magicStones.findIndex(value => value === 0);
      this.data.achievements.magicStones[index] = x;
      this.save();
    }
  }
}

const storage = new Storage();

export default storage;
