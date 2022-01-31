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
      this.armorBonus = null;
      this.weaponName = "dagger";
      this.weaponLevel = 1;
      this.weaponBonus = null;
      this.beltName = null;
      this.beltLevel = 1;
      this.beltBonus = null;
      this.inventory = [];
      this.stash = [];
      this.upgrade = [];
      this.gems = [];
      this.artifact = [];
      this.expansion1 = false;
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
        } else if (item.kind === Types.Entities.NANOPOTION) {
          this.nanoPotions += 1;
        } else if (item.type === "armor" || item.type === "weapon" || item.type === "belt" || item.type === "ring") {
          // @TODO Check for stack-able items with quantity
          if (this.inventory.length >= 24) {
            throw new Exceptions.LootException("Your inventory is full.");
          }
        } else if (Types.isSingle(item.kind)) {
          const { itemKind } = item;
          const isFound = this.inventory
            .concat(this.upgrade)
            .concat(this.stash)
            .some(({ item }) => item === itemKind);

          if (isFound) {
            throw new Exceptions.LootException("You already have this item.");
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
      this.armorLevel = parseInt(level);
    },

    getArmorBonus: function () {
      return this.armorBonus;
    },

    setArmorBonus: function (bonus) {
      this.armorBonus = bonus;
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
      this.weaponLevel = parseInt(level);
    },

    getWeaponBonus: function () {
      return this.weaponBonus;
    },

    setWeaponBonus: function (bonus) {
      this.weaponBonus = bonus;
    },

    setBelt: function (rawBelt) {
      if (rawBelt) {
        const [belt, level, bonus] = rawBelt.split(":");

        this.beltName = belt;
        this.beltLevel = parseInt(level);
        this.beltBonus = bonus;
      } else {
        this.beltName = null;
        this.beltLevel = null;
        this.beltBonus = null;
      }
    },

    setRing1: function (ring) {
      if (ring) {
        const [name, level, bonus] = ring.split(":");

        this.ring1Name = name;
        this.ring1Level = parseInt(level);
        this.ring1Bonus = bonus;
      } else {
        this.ring1Name = null;
        this.ring1Level = null;
        this.ring1Bonus = null;
      }
    },

    setRing2: function (ring) {
      if (ring) {
        const [name, level, bonus] = ring.split(":");

        this.ring2Name = name;
        this.ring2Level = parseInt(level);
        this.ring2Bonus = bonus;
      } else {
        this.ring2Name = null;
        this.ring2Level = null;
        this.ring2Bonus = null;
      }
    },

    setAmulet: function (amulet) {
      if (amulet) {
        const [name, level, bonus] = amulet.split(":");

        this.amuletName = name;
        this.amuletLevel = parseInt(level);
        this.amuletBonus = bonus;
      } else {
        this.amuletName = null;
        this.amuletLevel = null;
        this.amuletBonus = null;
      }
    },

    setAuras: function (auras) {
      this.auras = auras;
    },

    hasWeapon: function () {
      return this.weaponName !== null;
    },

    switchWeapon: function (weapon, level, bonus) {
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
      if (bonus !== this.getWeaponBonus()) {
        isDifferent = true;
        self.setWeaponBonus(bonus);
      }

      if (isDifferent && self.switch_callback) {
        self.switch_callback();
      }
    },

    switchArmor: function (armorSprite, level, bonus) {
      var self = this;
      var isDifferent = false;

      if (armorSprite && armorSprite.id !== this.getSpriteName()) {
        isDifferent = true;
        self.setSprite(armorSprite);
        self.setSpriteName(armorSprite.id);
        self.setArmorName(armorSprite.id);
      }

      if (armorSprite.kind !== Types.Entities.FIREFOX && level && level !== this.getArmorLevel) {
        isDifferent = true;
        self.setArmorLevel(level);
      }

      if (bonus !== this.getArmorBonus()) {
        isDifferent = true;
        self.setArmorBonus(bonus);
      }

      if (isDifferent && self.switch_callback) {
        self.switch_callback();
      }
    },

    prepareRawItems: function (items) {
      return items
        .map((rawItem, slot) => {
          if (!rawItem) return false;

          const [item, levelOrQuantity, bonus] = rawItem.split(":");
          const isWeapon = kinds[item][1] === "weapon";
          const isArmor = kinds[item][1] === "armor";
          const isBelt = kinds[item][1] === "belt";
          const isRing = kinds[item][1] === "ring";
          const isAmulet = kinds[item][1] === "amulet";
          const requirement =
            isWeapon || isArmor || isBelt || isRing || isAmulet ? Types.getItemRequirement(item, levelOrQuantity) : 0;

          return {
            item,
            [isWeapon || isArmor || isBelt || isRing || isAmulet ? "level" : "quantity"]: levelOrQuantity,
            bonus,
            slot,
            requirement,
          };
        })
        .filter(Boolean);
    },

    setInventory: function (inventory) {
      this.inventory = this.prepareRawItems(inventory);
    },

    setUpgrade: function (upgrade) {
      this.upgrade = this.prepareRawItems(upgrade);
    },

    setStash: function (stash) {
      this.stash = this.prepareRawItems(stash);
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
      }, 10000);
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
