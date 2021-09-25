define(["character", "exceptions", "../../shared/js/gametypes"], function (Character, Exceptions) {
  var Player = Character.extend({
    init: function (id, name, account, kind, guild) {
      this._super(id, kind);

      this.name = name;
      this.account = account;

      if (typeof guild !== "undefined") {
        this.setGuild(guild);
      }

      // Renderer
      this.nameOffsetY = -10;

      // sprites
      this.spriteName = "clotharmor";
      this.armorName = "clotharmor";
      this.armorLevel = 1;
      this.weaponName = "sword1";
      this.weaponLevel = 1;
      this.inventory = [];
      this.upgrade = [];
      this.gems = [];
      this.nanoPotions = 0;
      this.damage = "0";
      this.absorb = "0";

      // modes
      this.isLootMoving = false;
      this.isSwitchingWeapon = true;

      // PVP Flag
      this.pvpFlag = true;
    },

    getGuild: function () {
      return this.guild;
    },

    setGuild: function (guild) {
      this.guild = guild;
      $("#guild-population").addClass("visible");
      $("#guild-name").html(guild.name);
    },

    unsetGuild: function () {
      delete this.guild;
      $("#guild-population").removeClass("visible");
    },

    hasGuild: function () {
      return typeof this.guild !== "undefined";
    },

    addInvite: function (inviteGuildId) {
      this.invite = { time: new Date().valueOf(), guildId: inviteGuildId };
    },

    deleteInvite: function () {
      delete this.invite;
    },

    checkInvite: function () {
      if (this.invite && new Date().valueOf() - this.invite.time < 595000) {
        return this.invite.guildId;
      } else {
        if (this.invite) {
          this.deleteInvite();
          return -1;
        } else {
          return false;
        }
      }
    },

    loot: function (item) {
      if (item) {
        var rank, currentRank, msg, currentArmorName;

        if (this.currentArmorSprite) {
          currentArmorName = this.currentArmorSprite.name;
        } else {
          currentArmorName = this.spriteName;
        }

        if (Types.Entities.Gems.includes(item.kind)) {
          var index = Types.Entities.Gems.indexOf(item.kind);
          if (index > -1 && this.gems[index] !== 0) {
            throw new Exceptions.LootException(`You already collected the ${Types.getGemNameFromKind(item.kind)} gem.`);
          } else {
            this.gems[index] = 1;
          }
        } else if (item.kind === Types.Entities.NANOPOTION) {
          this.nanoPotions += 1;
        } else if (item.type === "armor" || item.type === "weapon") {
          // @TODO Check for stack-able items with quantity
          if (this.inventory.length >= 24) {
            throw new Exceptions.LootException("Your inventory is full.");
          }
        }

        log.info("Player " + this.id + " has looted " + item.id);
        if (Types.isArmor(item.kind) && this.invincible) {
          this.stopInvincibility();
        } else if (item.kind === Types.Entities.FIREPOTION) {
          item.onLoot(this);
        }
      }
    },

    /**
     * Returns true if the character is currently walking towards an item in order to loot it.
     */
    isMovingToLoot: function () {
      return this.isLootMoving;
    },

    getSpriteName: function () {
      return this.spriteName;
    },

    getDisplayArmorName: function (armorName) {
      return armorMap[armorName] || armorName;
    },

    setSpriteName: function (name) {
      this.spriteName = name;
    },

    getArmorSprite: function () {
      if (this.invincible) {
        return this.currentArmorSprite;
      } else {
        return this.sprite;
      }
    },

    getArmorName: function () {
      var sprite = this.getArmorSprite();
      return sprite.id;
    },

    setArmorName: function (name) {
      this.armorName = name;
    },

    getArmorLevel: function () {
      return this.armorLevel;
    },

    setArmorLevel: function (level) {
      this.armorLevel = level;
    },

    getWeaponName: function () {
      return this.weaponName;
    },

    setWeaponName: function (name) {
      this.weaponName = name;
    },

    getWeaponLevel: function () {
      return this.weaponLevel;
    },

    setWeaponLevel: function (level) {
      this.weaponLevel = level;
    },

    hasWeapon: function () {
      return this.weaponName !== null;
    },

    switchWeapon: function (weapon, level) {
      var self = this;
      var isDifferent = false;

      if (weapon !== this.getWeaponName()) {
        isDifferent = true;
        self.setWeaponName(weapon);
      }
      if (level !== this.getWeaponLevel()) {
        isDifferent = true;
        self.setWeaponLevel(level);
      }

      if (isDifferent && self.switch_callback) {
        self.switch_callback();
      }
    },

    switchArmor: function (armorSprite, level) {
      var self = this;
      var hasChanged = false;

      if (armorSprite && armorSprite.id !== this.getSpriteName()) {
        hasChanged = true;
        self.setSprite(armorSprite);
        self.setSpriteName(armorSprite.id);
        self.setArmorName(armorSprite.id);
      }

      if (level !== this.getArmorLevel) {
        hasChanged = true;
        this.setArmorLevel(level);
      }

      if (hasChanged && self.switch_callback) {
        self.switch_callback();
      }
    },

    setInventory: function (inventory) {
      this.inventory = inventory
        .map((rawItem, slot) => {
          if (!rawItem) return false;

          const [item, levelOrQuantity] = rawItem.split(":");
          const isWeapon = kinds[item][1] === "weapon";
          const isArmor = kinds[item][1] === "armor";

          return {
            item,
            [isWeapon || isArmor ? "level" : "quantity"]: levelOrQuantity,
            slot,
          };
        })
        .filter(Boolean);
    },

    setUpgrade: function (upgrade) {
      this.upgrade = upgrade
        .map((rawItem, slot) => {
          if (!rawItem) return false;

          const [item, levelOrQuantity] = rawItem.split(":");
          const isWeapon = kinds[item][1] === "weapon";
          const isArmor = kinds[item][1] === "armor";

          return {
            item,
            [isWeapon || isArmor ? "level" : "quantity"]: levelOrQuantity,
            slot,
          };
        })
        .filter(Boolean);
    },

    onArmorLoot: function (callback) {
      this.armorloot_callback = callback;
    },

    onSwitchItem: function (callback) {
      this.switch_callback = callback;
    },

    onInvincible: function (callback) {
      this.invincible_callback = callback;
    },

    startInvincibility: function () {
      var self = this;

      if (!this.invincible) {
        this.currentArmorSprite = this.getSprite();
        this.invincible = true;
        this.invincible_callback();
      } else {
        // If the player already has invincibility, just reset its duration.
        if (this.invincibleTimeout) {
          clearTimeout(this.invincibleTimeout);
        }
      }

      this.invincibleTimeout = setTimeout(function () {
        self.stopInvincibility();
        self.idle();
      }, 15000);
    },

    stopInvincibility: function () {
      this.invincible_callback();
      this.invincible = false;

      if (this.currentArmorSprite) {
        this.setSprite(this.currentArmorSprite);
        this.setSpriteName(this.currentArmorSprite.id);
        this.currentArmorSprite = null;
      }
      if (this.invincibleTimeout) {
        clearTimeout(this.invincibleTimeout);
      }
    },
    flagPVP: function (pvpFlag) {
      this.pvpFlag = pvpFlag;
    },
  });

  return Player;
});
