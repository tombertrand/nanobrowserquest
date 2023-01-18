class Storage {
  data: any;

  constructor() {
    if (this.hasLocalStorage() && localStorage.data) {
      this.data = JSON.parse(localStorage.data);

      if (!this.data.settings) {
        this.resetData();
      }
    } else {
      this.resetData();
    }
  }

  // @TODO Add periodic checks if the storage is manipulated, if so BAN

  resetData() {
    this.data = {
      hasAlreadyPlayed: false,
      player: {
        name: "",
        weapon: "",
        armor: "",
        image: "",
      },
      settings: {
        music: true,
        musicVolume: 0.7,
        sound: true,
        soundVolume: 0.7,
        showEntityName: true,
        showDamageInfo: true,
        showAnvilOdds: false,
        capeHue: 0,
        capeSaturate: 0,
        capeContrast: 0,
        capeBrightness: 1,
      },
      achievements: {
        ratCount: 0,
        skeletonCount: 0,
        spectreCount: 0,
        yetiCount: 0,
        werewolfCount: 0,
        skeleton3Count: 0,
        skeleton4Count: 0,
        wraithCount: 0,
        wraith2Count: 0,
        cowCount: 0,
        mageCount: 0,
        totalKills: 0,
        totalDmg: 0,
        totalRevives: 0,
      },
      achievement: new Array(44).fill(0),
    };
  }

  hasLocalStorage() {
    return true;
  }

  save() {
    if (this.hasLocalStorage()) {
      localStorage.data = JSON.stringify(this.data);
    }
  }

  clear() {
    if (this.hasLocalStorage()) {
      localStorage.data = "";
      this.resetData();
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

  setShowAnvilOddsEnabled(enabled) {
    this.data.settings.showAnvilOdds = enabled;
    this.save();
  }

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

  savePlayer(img, armor, weapon) {
    this.setPlayerImage(img);
    this.setPlayerArmor(armor);
    this.setPlayerWeapon(weapon);
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

  getAchievementCount() {
    return this.data.achievement.filter(Boolean).length;
  }

  // Angry rats
  getRatCount() {
    return this.data.achievements.ratCount;
  }

  incrementRatCount() {
    if (this.data.achievements.ratCount < 10) {
      this.data.achievements.ratCount++;
      this.save();
    }
  }

  // Skull Collector
  getSkeletonCount() {
    return this.data.achievements.skeletonCount;
  }

  incrementSkeletonCount() {
    if (this.data.achievements.skeletonCount < 10) {
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

    if (this.data.achievements.spectreCount < 15) {
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

    if (this.data.achievements.werewolfCount < 25) {
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

    if (this.data.achievements.yetiCount < 25) {
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

    if (this.data.achievements.skeleton3Count < 50) {
      this.data.achievements.skeleton3Count++;
      this.save();
    }
  }

  // Cruisader
  getSkeleton4Count() {
    return this.data.achievements.skeleton4Count;
  }

  incrementSkeleton4Count() {
    if (!this.data.achievements.skeleton4Count) {
      this.data.achievements.skeleton4Count = 0;
    }

    if (this.data.achievements.skeleton4Count < 250) {
      this.data.achievements.skeleton4Count++;
      this.save();
    }
  }

  // Ghostbusters
  getWraithCount() {
    return this.data.achievements.wraithCount;
  }

  incrementWraithCount() {
    if (!this.data.achievements.wraithCount) {
      this.data.achievements.wraithCount = 0;
    }

    if (this.data.achievements.wraithCount < 50) {
      this.data.achievements.wraithCount++;
      this.save();
    }
  }

  // TBD
  getWraith2Count() {
    return this.data.achievements.wraith2Count;
  }

  incrementWraith2Count() {
    if (!this.data.achievements.wraith2Count) {
      this.data.achievements.wraith2Count = 0;
    }

    if (this.data.achievements.wraith2Count < 50) {
      this.data.achievements.wraith2Count++;
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

    if (this.data.achievements.cowCount < 500) {
      this.data.achievements.cowCount++;
      this.save();
    }
  }

  // Meat Fest
  getMageCount() {
    return this.data.achievements.mageCount;
  }

  incrementMageCount() {
    if (!this.data.achievements.mageCount) {
      this.data.achievements.mageCount = 0;
    }

    if (this.data.achievements.mageCount < 250) {
      this.data.achievements.mageCount++;
      this.save();
    }
  }

  // Meatshield
  getTotalDamageTaken() {
    return this.data.achievements.totalDmg;
  }

  addDamage(damage) {
    if (this.data.achievements.totalDmg < 5000) {
      this.data.achievements.totalDmg += damage;
      this.save();
    }
  }

  // Hunter
  getTotalKills() {
    return this.data.achievements.totalKills;
  }

  incrementTotalKills() {
    if (this.data.achievements.totalKills < 50) {
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
}

const storage = new Storage();

export default storage;
