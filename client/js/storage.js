define(function () {
  var Storage = Class.extend({
    init: function () {
      if (this.hasLocalStorage() && localStorage.data) {
        this.data = JSON.parse(localStorage.data);
      } else {
        this.resetData();
      }
    },

    // @TODO Add periodic checks if the storage is manipulated, if so BAN

    resetData: function () {
      this.data = {
        hasAlreadyPlayed: false,
        player: {
          name: "",
          weapon: "",
          armor: "",
          guild: "",
          image: "",
        },
        // old format
        achievements: {
          unlocked: [],
          ratCount: 0,
          skeletonCount: 0,
          spectreCount: 0,
          totalKills: 0,
          totalDmg: 0,
          totalRevives: 0,
        },
        achievement: new Array(24).fill(0),
      };
    },

    hasLocalStorage: function () {
      return Modernizr.localstorage;
    },

    save: function () {
      if (this.hasLocalStorage()) {
        localStorage.data = JSON.stringify(this.data);
      }
    },

    clear: function () {
      if (this.hasLocalStorage()) {
        localStorage.data = "";
        this.resetData();
      }
    },

    // Player

    hasAlreadyPlayed: function () {
      return this.data.hasAlreadyPlayed;
    },

    initPlayer: function (name, account) {
      this.data.hasAlreadyPlayed = true;
      this.setPlayerName(name);
      this.setPlayerAccount(account);
    },

    setPlayerName: function (name) {
      this.data.player.name = name;
      this.save();
    },

    setPlayerAccount: function (account) {
      this.data.player.account = account;
      this.save();
    },

    setPlayerImage: function (img) {
      this.data.player.image = img;
      this.save();
    },

    setPlayerArmor: function (armor) {
      this.data.player.armor = armor;
      this.save();
    },

    setPlayerWeapon: function (weapon) {
      this.data.player.weapon = weapon;
      this.save();
    },

    setAchievement: function (achievement) {
      this.data.achievement = achievement;
      this.save();
    },

    setPlayerGuild: function (guild) {
      if (typeof guild !== "undefined") {
        this.data.player.guild = {
          id: guild.id,
          name: guild.name,
          // @TODO: Fix if supporting guild
          // members: JSON.stringify(guild.members),
        };
        this.save();
      } else {
        delete this.data.player.guild;
        this.save();
      }
    },

    savePlayer: function (img, armor, weapon, guild) {
      this.setPlayerImage(img);
      this.setPlayerArmor(armor);
      this.setPlayerWeapon(weapon);
      this.setPlayerGuild(guild);
    },

    // Achievements

    hasUnlockedAchievement: function (id) {
      return this.data.achievement[id - 1];
    },

    unlockAchievement: function (id) {
      if (!this.hasUnlockedAchievement(id)) {
        this.data.achievement[id - 1] = 1;
        this.save();
        return true;
      }
      return false;
    },

    getAchievementCount: function () {
      //   return _.size(this.data.achievements.unlocked);
      return this.data.achievement.filter(Boolean).length;
    },

    // Angry rats
    getRatCount: function () {
      return this.data.achievements.ratCount;
    },

    incrementRatCount: function () {
      if (this.data.achievements.ratCount < 10) {
        this.data.achievements.ratCount++;
        this.save();
      }
    },

    // Skull Collector
    getSkeletonCount: function () {
      return this.data.achievements.skeletonCount;
    },

    incrementSkeletonCount: function () {
      if (this.data.achievements.skeletonCount < 10) {
        this.data.achievements.skeletonCount++;
        this.save();
      }
    },

    // Spectre Collector
    getSpectreCount: function () {
      return this.data.achievements.spectreCount;
    },

    incrementSpectreCount: function () {
      if (!this.data.achievements.spectreCount) {
        this.data.achievements.spectreCount = 0;
      }

      if (this.data.achievements.spectreCount < 10) {
        this.data.achievements.spectreCount++;
        this.save();
      }
    },

    // Meatshield
    getTotalDamageTaken: function () {
      return this.data.achievements.totalDmg;
    },

    addDamage: function (damage) {
      if (this.data.achievements.totalDmg < 5000) {
        this.data.achievements.totalDmg += damage;
        this.save();
      }
    },

    // Hunter
    getTotalKills: function () {
      return this.data.achievements.totalKills;
    },

    incrementTotalKills: function () {
      if (this.data.achievements.totalKills < 50) {
        this.data.achievements.totalKills++;
        this.save();
      }
    },

    // Still Alive
    getTotalRevives: function () {
      return this.data.achievements.totalRevives;
    },

    incrementRevives: function () {
      if (this.data.achievements.totalRevives < 5) {
        this.data.achievements.totalRevives++;
        this.save();
      }
    },
  });

  return Storage;
});
