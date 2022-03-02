class Storage {
  data: any;

  constructor() {
    if (this.hasLocalStorage() && localStorage.data) {
      this.data = JSON.parse(localStorage.data);
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
      audio: true,
      // old format
      achievements: {
        unlocked: [],
        ratCount: 0,
        skeletonCount: 0,
        spectreCount: 0,
        yetiCount: 0,
        werewolfCount: 0,
        skeleton3Count: 0,
        wraithCount: 0,
        cowCount: 0,
        totalKills: 0,
        totalDmg: 0,
        totalRevives: 0,
      },
      achievement: new Array(40).fill(0),
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

  setAudioEnabled(enabled) {
    this.data.audio = enabled;
    this.save();
  }

  isAudioEnabled() {
    if (typeof this.data.audio !== "boolean" || this.data.audio) {
      return true;
    }
    return false;
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
    //   return _.size(this.data.achievements.unlocked);
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

export default Storage;
