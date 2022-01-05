define([
  "infomanager",
  "bubble",
  "renderer",
  "map",
  "animation",
  "sprite",
  "tile",
  "warrior",
  "gameclient",
  "audio",
  "updater",
  "transition",
  "pathfinder",
  "item",
  "mob",
  "npc",
  "player",
  "character",
  "chest",
  "mobs",
  "exceptions",
  "config",
  "guild",
  "../../shared/js/gametypes",
], function (
  InfoManager,
  BubbleManager,
  Renderer,
  Map,
  Animation,
  Sprite,
  AnimatedTile,
  Warrior,
  GameClient,
  AudioManager,
  Updater,
  Transition,
  Pathfinder,
  Item,
  Mob,
  Npc,
  Player,
  Character,
  Chest,
  Mobs,
  Exceptions,
  config,
  Guild,
) {
  var Game = Class.extend({
    init: function (app) {
      this.app = app;
      this.app.config = config;
      this.ready = false;
      this.started = false;
      this.hasNeverStarted = true;
      this.isUpgradeItemSent = false;
      this.isAnvilSuccess = false;
      this.anvilSuccessTimeout = null;
      this.isAnvilFail = false;
      this.anvilFailTimeout = null;

      this.renderer = null;
      this.updater = null;
      this.pathfinder = null;
      this.chatinput = null;
      this.bubbleManager = null;
      this.audioManager = null;

      // Player
      this.player = new Warrior("player", "");
      this.player.moveUp = false;
      this.player.moveDown = false;
      this.player.moveLeft = false;
      this.player.moveRight = false;
      this.player.disableKeyboardNpcTalk = false;

      // Game state
      this.entities = {};
      this.deathpositions = {};
      this.entityGrid = null;
      this.pathingGrid = null;
      this.renderingGrid = null;
      this.itemGrid = null;
      this.currentCursor = null;
      this.mouse = { x: 0, y: 0 };
      this.zoningQueue = [];
      this.previousClickPosition = {};

      this.cursorVisible = true;
      this.selectedX = 0;
      this.selectedY = 0;
      this.selectedCellVisible = false;
      this.targetColor = "rgba(255, 255, 255, 0.5)";
      this.targetCellVisible = true;
      this.hoveringTarget = false;
      this.hoveringPlayer = false;
      this.hoveringMob = false;
      this.hoveringItem = false;
      this.hoveringCollidingTile = false;

      // combat
      this.infoManager = new InfoManager(this);

      // zoning
      this.currentZoning = null;

      this.cursors = {};

      this.sprites = {};

      // tile animation
      this.animatedTiles = null;

      // debug
      this.debugPathing = false;

      // pvp
      this.pvpFlag = false;

      // sprites
      this.spriteNames = [
        "hand",
        "attack",
        "loot",
        "target",
        "levelup",
        "talk",
        "sparks",
        "shadow16",
        "rat",
        "rat2",
        "skeleton",
        "skeleton2",
        "skeleton3",
        "spectre",
        "boss",
        "skeletonleader",
        "deathknight",
        "ogre",
        "yeti",
        "werewolf",
        "wraith",
        "crab",
        "snake",
        "snake2",
        "eye",
        "bat",
        "bat2",
        "goblin",
        "goblin2",
        "zombie",
        "necromancer",
        "wizard",
        "guard",
        "king",
        "villagegirl",
        "villager",
        "carlosmatos",
        "satoshi",
        "coder",
        "agent",
        "rick",
        "scientist",
        "nyan",
        "priest",
        "sorcerer",
        "octocat",
        "anvil",
        "anvil-success",
        "anvil-fail",
        "waypointx",
        "waypointn",
        "stash",
        "beachnpc",
        "forestnpc",
        "desertnpc",
        "lavanpc",
        "clotharmor",
        "leatherarmor",
        "mailarmor",
        "platearmor",
        "redarmor",
        "goldenarmor",
        "bluearmor",
        "frozenarmor",
        "hornedarmor",
        "firefox",
        "death",
        "dagger",
        "axe",
        "blueaxe",
        "bluemorningstar",
        "chest",
        "sword",
        "redsword",
        "bluesword",
        "goldensword",
        "frozensword",
        "item-sword",
        "item-axe",
        "item-blueaxe",
        "item-bluemorningstar",
        "item-redsword",
        "item-bluesword",
        "item-goldensword",
        "item-frozensword",
        "item-leatherarmor",
        "item-mailarmor",
        "item-platearmor",
        "item-redarmor",
        "item-goldenarmor",
        "item-bluearmor",
        "item-frozenarmor",
        "item-hornedarmor",
        "item-beltleather",
        "item-beltplated",
        "item-beltfrozen",
        "item-flask",
        "item-rejuvenationpotion",
        "item-poisonpotion",
        "item-nanopotion",
        "item-gemruby",
        "item-gememerald",
        "item-gemamethyst",
        "item-gemtopaz",
        "item-gemsapphire",
        "item-gold",
        "item-ringbronze",
        "item-ringsilver",
        "item-ringgold",
        "item-amuletsilver",
        "item-amuletgold",
        "item-scrollupgradelow",
        "item-scrollupgrademedium",
        "item-scrollupgradehigh",
        "item-skeletonkey",
        "item-raiblockstl",
        "item-raiblockstr",
        "item-raiblocksbl",
        "item-raiblocksbr",
        "item-cake",
        "item-burger",
        "morningstar",
        "item-morningstar",
        "item-firepotion",
      ];
    },

    setup: function ($bubbleContainer, canvas, background, foreground, input) {
      this.setBubbleManager(new BubbleManager($bubbleContainer));
      this.setRenderer(new Renderer(this, canvas, background, foreground));
      this.setChatInput(input);
    },

    setStorage: function (storage) {
      this.storage = storage;
    },

    setStore: function (store) {
      this.store = store;
    },

    setRenderer: function (renderer) {
      this.renderer = renderer;
    },

    setUpdater: function (updater) {
      this.updater = updater;
    },

    setPathfinder: function (pathfinder) {
      this.pathfinder = pathfinder;
    },

    setChatInput: function (element) {
      this.chatinput = element;
    },

    setBubbleManager: function (bubbleManager) {
      this.bubbleManager = bubbleManager;
    },

    loadMap: function () {
      var self = this;

      this.map = new Map(!this.renderer.upscaledRendering, this);

      this.map.ready(function () {
        log.info("Map loaded.");
        var tilesetIndex = self.renderer.upscaledRendering ? 0 : self.renderer.scale - 1;
        self.renderer.setTileset(self.map.tilesets[tilesetIndex]);
      });
    },

    initPlayer: function () {
      if (this.storage.hasAlreadyPlayed() && this.storage.data.player) {
        if (this.storage.data.player.armor && this.storage.data.player.weapon) {
          this.player.setSpriteName(this.storage.data.player.armor);
          this.player.setWeaponName(this.storage.data.player.weapon);
        }
        if (this.storage.data.player.guild) {
          this.player.setGuild(this.storage.data.player.guild);
        }
      }
      this.player.setSprite(this.sprites[this.player.getSpriteName()]);
      this.player.idle();

      log.debug("Finished initPlayer");
    },

    initShadows: function () {
      this.shadows = {};
      this.shadows["small"] = this.sprites["shadow16"];
    },

    initCursors: function () {
      this.cursors["hand"] = this.sprites["hand"];
      this.cursors["attack"] = this.sprites["attack"];
      this.cursors["loot"] = this.sprites["loot"];
      this.cursors["target"] = this.sprites["target"];
      this.cursors["arrow"] = this.sprites["arrow"];
      this.cursors["talk"] = this.sprites["talk"];
      this.cursors["join"] = this.sprites["talk"];
    },

    initAnimations: function () {
      this.targetAnimation = new Animation("idle_down", 4, 0, 16, 16);
      this.targetAnimation.setSpeed(50);

      this.sparksAnimation = new Animation("idle_down", 6, 0, 16, 16);
      this.sparksAnimation.setSpeed(120);

      this.levelupAnimation = new Animation("idle_down", 4, 0, 16, 16);
      this.levelupAnimation.setSpeed(50);

      this.anvilSuccessAnimation = new Animation("idle_down", 4, 0, 15, 8);
      this.anvilSuccessAnimation.setSpeed(80);

      this.anvilFailAnimation = new Animation("idle_down", 4, 0, 15, 8);
      this.anvilFailAnimation.setSpeed(80);
    },

    initHurtSprites: function () {
      var self = this;

      Types.forEachArmorKind(function (kind, kindName) {
        self.sprites[kindName].createHurtSprite();
      });
    },

    initSilhouettes: function () {
      var self = this;

      Types.forEachMobOrNpcKind(function (kind, kindName) {
        self.sprites[kindName].createSilhouette();
      });
      self.sprites["chest"].createSilhouette();
      self.sprites["item-cake"].createSilhouette();
    },

    initMuteButton: function () {
      var self = this;
      if (!self.storage.isAudioEnabled()) {
        self.audioManager.disableAudio();
      } else {
        $("#mute-button").addClass("active");
      }
    },

    initTooltips: function () {
      var self = this;

      $(document).tooltip({
        items: "[data-item]",
        track: true,
        // hide: 1000000,
        position: { my: "left bottom-10", at: "left bottom", collision: "flipfit" },
        content: function () {
          const element = $(this);
          const item = element.attr("data-item");
          const level = element.attr("data-level");
          const rawBonus = element.attr("data-bonus") ? JSON.parse(element.attr("data-bonus")) : undefined;

          const {
            name,
            itemClass,
            defense,
            damage,
            healthBonus,
            magicDamage,
            bonus = [],
            requirement,
            description,
          } = Types.getItemDetails(item, level, rawBonus);

          return `<div>
            <div class="item-title">${name}${level ? `(+${level})` : ""} </div>
            ${itemClass ? `<div class="item-class">(${itemClass} class item)</div>` : ""}
            ${defense ? `<div class="item-description">Defense: ${defense}</div>` : ""}
            ${damage ? `<div class="item-description">Attack: ${damage}</div>` : ""}
            ${magicDamage ? `<div class="item-bonus">Magic damage: ${magicDamage}</div>` : ""}
            ${healthBonus ? `<div class="item-bonus">Health bonus: ${healthBonus}</div>` : ""}
            ${bonus.map(({ description }) => `<div class="item-bonus">${description}</div>`).join("")}
            ${requirement ? `<div class="item-description">Required level: ${requirement}</div>` : ""}
            ${description ? `<div class="item-description">${description}</div>` : ""}
          </div>`;
        },
      });
    },

    initSendUpgradeItem: function () {
      var self = this;
      $("#upgrade-btn").on("click", function () {
        if (self.player.upgrade.length !== 2) return;

        if (!self.isUpgradeItemSent) {
          self.client.sendUpgradeItem();
        }
        self.isUpgradeItemSent = true;
      });
    },

    initUpgradeItemPreview: function () {
      var self = this;

      $("#upgrade-preview-btn").on("click", function () {
        self.player.upgrade.forEach(({ item, level, slot, bonus }) => {
          if (slot !== 0) return;
          const previewSlot = $(`#upgrade .item-slot:eq(10)`);

          if (previewSlot.is(":empty")) {
            previewSlot.append(
              $("<div />", {
                class: `item-not-draggable`,
                css: {
                  "background-image": `url("${self.getIconPath(item)}")`,
                },
                "data-item": item,
                "data-level": parseInt(level) + 1,
                "data-bonus": bonus,
              }),
            );
          }
        });
      });
    },

    initDroppable: function () {
      var self = this;

      $(".item-droppable").droppable({
        greedy: true,
        over: function () {},
        out: function () {},
        drop: function (event, ui) {
          // @NOTE Delay droppable.drop() callback for draggable.stop()
          setTimeout(() => {
            const fromItemEl = $(ui.draggable[0]);
            const fromItemElParent = fromItemEl.parent();
            const fromSlot = fromItemElParent.data("slot");
            const toSlot = $(this).data("slot");
            const toItemEl = $(this).find("> div");

            if (fromSlot === toSlot) {
              return;
            }

            const item = fromItemEl.attr("data-item");
            const level = fromItemEl.attr("data-level");

            const toItem = toItemEl.attr("data-item");
            const toLevel = toItemEl.attr("data-level");

            if (toItem) {
              if (
                [100, 101, 102, 103, 104, 105].includes(fromSlot) &&
                (!toLevel || !Types.isCorrectTypeForSlot(fromSlot, toItem) || toLevel > self.player.level)
              ) {
                return;
              }
            }

            if (
              [100, 101, 102, 103, 104, 105].includes(toSlot) &&
              Types.getItemRequirement(item, level) > self.player.level
            ) {
              return;
            }

            self.client.sendMoveItem(fromSlot, toSlot);

            if (toSlot === -1) {
              fromItemEl.remove();
            } else {
              $(this).append(fromItemEl.detach());
              if (toItemEl.length) {
                $(fromItemElParent).append(toItemEl.detach());
              }
            }

            if (toSlot === 100) {
              self.player.switchWeapon(item, level);
            } else if (toSlot === 101) {
              self.player.switchArmor(self.sprites[item], level);
            }

            const type = kinds[item][1];
            if (type === "armor" && $(".item-equip-armor").is(":empty")) {
              self.player.switchArmor(self.sprites["clotharmor"], 1);
            } else if (type === "weapon" && $(".item-equip-weapon").is(":empty")) {
              self.player.switchWeapon("dagger", 1);
            }
          });
        },
      });
    },
    destroyDroppable: function () {
      $(".item-not-draggable").remove();
      $(".item-droppable").droppable("destroy");
    },

    initDraggable: function () {
      var self = this;

      $(".item-draggable").draggable({
        zIndex: 100,
        revertDuration: 0,
        revert: true,
        containment: "#canvasborder",
        drag: function () {},
        start: function () {
          $(this).parent().addClass("ui-droppable-origin");

          const item = $(this).attr("data-item");
          const type = kinds[item][1];

          if (["weapon", "armor", "belt", "ring", "amulet"].includes(type) && $(`.item-${type}`).is(":empty")) {
            $(`.item-${type}`).addClass("item-droppable");
          } else if (["scrollupgradelow", "scrollupgrademedium", "scrollupgradehigh"].includes(item)) {
            $(`.item-scroll`).addClass("item-droppable");
          }

          self.initDroppable();
        },
        stop: function (event, ui) {
          self.destroyDroppable();

          $(".ui-droppable-origin").removeClass("ui-droppable-origin");
          $(".item-weapon, .item-armor, .item-ring, .item-amulet, item-belt, .item-scroll").removeClass(
            "item-droppable",
          );
        },
      });
    },

    destroyDraggable: function () {
      $(".item-draggable.ui-draggable").draggable("destroy");
    },

    getIconPath: function (spriteName) {
      const scale = this.renderer.getScaleFactor();

      return `img/${scale}/item-${spriteName}.png`;
    },

    initInventory: function () {
      $("#item-inventory").empty();
      for (var i = 0; i < 24; i++) {
        $("#item-inventory").append(`<div class="item-slot item-inventory item-droppable" data-slot="${i}"></div>`);
      }

      $("#item-weapon").empty().append('<div class="item-slot item-equip-weapon item-weapon" data-slot="100"></div>');
      $("#item-armor").empty().append('<div class="item-slot item-equip-armor item-armor" data-slot="101"></div>');
      $("#item-belt").empty().append('<div class="item-slot item-equip-belt item-belt" data-slot="102"></div>');
      $("#item-ring1")
        .empty()
        .append('<div class="item-slot item-equip-ring item-ring item-ring1" data-slot="103"></div>');
      $("#item-ring2")
        .empty()
        .append('<div class="item-slot item-equip-ring item-ring item-ring2" data-slot="104"></div>');
      $("#item-amulet")
        .empty()
        .append('<div class="item-slot item-equip-amulet item-amulet item-amulet" data-slot="105"></div>');
      $("#item-delete").empty().append('<div class="item-slot item-droppable item-delete" data-slot="-1"></div>');

      if (this.player.weaponName !== "dagger") {
        $(".item-equip-weapon").append(
          $("<div />", {
            class: "item-draggable",
            css: {
              "background-image": `url("${this.getIconPath(this.player.weaponName)}")`,
            },
            "data-item": this.player.weaponName,
            "data-level": this.player.weaponLevel,
          }),
        );
      }
      if (this.player.armorName !== "clotharmor") {
        $(".item-equip-armor").append(
          $("<div />", {
            class: "item-draggable",
            css: {
              "background-image": `url("${this.getIconPath(this.player.armorName)}")`,
            },
            "data-item": this.player.armorName,
            "data-level": this.player.armorLevel,
          }),
        );
      }

      if (this.player.beltName) {
        $(".item-equip-belt").append(
          $("<div />", {
            class: "item-draggable",
            css: {
              "background-image": `url("${this.getIconPath(this.player.beltName)}")`,
            },
            "data-item": this.player.beltName,
            "data-level": this.player.beltLevel,
          }),
        );
      }

      if (this.player.ring1Name) {
        $(".item-ring1").append(
          $("<div />", {
            class: "item-draggable",
            css: {
              "background-image": `url("${this.getIconPath(this.player.ring1Name)}")`,
            },
            "data-item": this.player.ring1Name,
            "data-level": this.player.ring1Level,
            "data-bonus": this.player.ring1Bonus,
          }),
        );
      }

      if (this.player.ring2Name) {
        $(".item-ring2").append(
          $("<div />", {
            class: "item-draggable",
            css: {
              "background-image": `url("${this.getIconPath(this.player.ring2Name)}")`,
            },
            "data-item": this.player.ring2Name,
            "data-level": this.player.ring2Level,
            "data-bonus": this.player.ring2Bonus,
          }),
        );
      }

      if (this.player.amuletName) {
        $(".item-amulet").append(
          $("<div />", {
            class: "item-draggable",
            css: {
              "background-image": `url("${this.getIconPath(this.player.amuletName)}")`,
            },
            "data-item": this.player.amuletName,
            "data-level": this.player.amuletLevel,
            "data-bonus": this.player.amuletBonus,
          }),
        );
      }

      this.updateInventory();
      this.updateRequirement();
    },

    updateInventory: function () {
      if ($("#inventory").hasClass("visible")) {
        this.destroyDraggable();
      }

      // @TODO instead of empty-ing, compare and replace
      $(".item-inventory").empty();

      this.player.inventory.forEach(({ item, level, quantity, bonus, requirement, slot }) => {
        $(`#item-inventory .item-slot:eq(${slot})`).append(
          $("<div />", {
            class: `item-draggable ${quantity ? "item-quantity" : ""}`,
            css: {
              "background-image": `url("${this.getIconPath(item)}")`,
            },
            "data-item": item,
            "data-level": level,
            "data-quantity": quantity,
            "data-bonus": bonus,
            "data-requirement": requirement,
          }),
        );
      });

      if ($("#inventory").hasClass("visible")) {
        this.initDraggable();
      }

      this.updateRequirement();
    },

    updateStash: function () {
      if ($("#stash").hasClass("visible")) {
        this.destroyDraggable();
      }

      // @TODO instead of empty-ing, compare and replace
      $(".item-stash").empty();

      this.player.stash.forEach(({ item, level, quantity, bonus, requirement, slot }) => {
        $(`#item-stash .item-slot:eq(${slot})`).append(
          $("<div />", {
            class: `item-draggable ${quantity ? "item-quantity" : ""}`,
            css: {
              "background-image": `url("${this.getIconPath(item)}")`,
            },
            "data-item": item,
            "data-level": level,
            "data-quantity": quantity,
            "data-bonus": bonus,
            "data-requirement": requirement,
          }),
        );
      });

      if ($("#stash").hasClass("visible")) {
        this.initDraggable();
      }

      this.updateRequirement();
    },

    updateRequirement: function () {
      var self = this;

      $("[data-requirement]").each(function () {
        const requirement = $(this).data("requirement");

        let backgroundColor = "inherit";
        if (requirement > self.player.level) {
          backgroundColor = "rgba(158, 0, 0, 0.5)";
        }
        $(this).css("background-color", backgroundColor);
      });
    },

    initUpgrade: function () {
      $("#upgrade-scroll").empty();
      for (var i = 1; i < 10; i++) {
        $("#upgrade-scroll").append(`<div class="item-slot item-scroll" data-slot="${200 + i}"></div>`);
      }
      $("#upgrade-item")
        .empty()
        .append(
          '<div class="item-slot item-upgrade item-upgrade-weapon item-upgrade-armor item-weapon item-armor item-ring item-amulet item-belt" data-slot="200"></div>',
        );
      $("#upgrade-result").empty().append('<div class="item-slot item-upgraded" data-slot="210"></div>');
    },

    updateUpgrade: function () {
      if ($("#inventory").hasClass("visible")) {
        this.destroyDraggable();
      }

      $(".item-scroll").empty();
      $(".item-upgrade").empty();
      $(".item-upgraded").empty();

      let upgradeInfoText = "&nbsp;";

      this.player.upgrade.forEach(({ item, level, quantity, slot, bonus }) => {
        if (slot === 0 && level) {
          const successRates = Types.getUpgradeSuccessRates();
          const successRate = successRates[parseInt(level) - 1];

          upgradeInfoText = `${successRate}% chance of successful upgrade`;
        }

        $(`#upgrade .item-slot:eq(${slot})`)
          .removeClass("item-droppable")
          .append(
            $("<div />", {
              class: `item-draggable ${quantity ? "item-quantity" : ""}`,
              css: {
                "background-image": `url("${this.getIconPath(item)}")`,
              },
              "data-item": item,
              "data-level": level,
              "data-quantity": quantity,
              "data-bonus": bonus,
            }),
          );
      });

      $("#upgrade-info").html(upgradeInfoText);

      if ($("#upgrade").hasClass("visible")) {
        this.initDraggable();
      }
    },

    initStash: function () {
      $("#item-stash").empty();
      for (var i = 0; i < 48; i++) {
        $("#item-stash").append(`<div class="item-slot item-stash item-droppable" data-slot="${i + 300}"></div>`);
      }

      this.updateStash();
    },

    initAchievements: function () {
      var self = this;

      this.achievements = {
        A_TRUE_WARRIOR: {
          id: 1,
          name: "A True Warrior",
          desc: "Find a new weapon",
          nano: 3,
        },
        INTO_THE_WILD: {
          id: 2,
          name: "Into the Wild",
          desc: "Venture outside the village",
          nano: 2,
        },
        ANGRY_RATS: {
          id: 3,
          name: "Angry Rats",
          desc: "Kill 10 rats",
          isCompleted: function () {
            return self.storage.getRatCount() >= 10;
          },
          nano: 5,
        },
        SMALL_TALK: {
          id: 4,
          name: "Small Talk",
          desc: "Talk to a non-player character",
          nano: 3,
        },
        FAT_LOOT: {
          id: 5,
          name: "Fat Loot",
          desc: "Get a new armor set",
          nano: 5,
        },
        UNDERGROUND: {
          id: 6,
          name: "Underground",
          desc: "Explore at least one cave",
          nano: 3,
        },
        AT_WORLDS_END: {
          id: 7,
          name: "At World's End",
          desc: "Reach the south shore",
          nano: 5,
        },
        COWARD: {
          id: 8,
          name: "Coward",
          desc: "Successfully escape an enemy",
          nano: 4,
        },
        TOMB_RAIDER: {
          id: 9,
          name: "Tomb Raider",
          desc: "Find the graveyard",
          nano: 5,
        },
        SKULL_COLLECTOR: {
          id: 10,
          name: "Skull Collector",
          desc: "Kill 10 skeletons",
          isCompleted: function () {
            return self.storage.getSkeletonCount() >= 10;
          },
          nano: 8,
        },
        NINJA_LOOT: {
          id: 11,
          name: "Ninja Loot",
          desc: "Get an item you didn't fight for",
          nano: 4,
        },
        NO_MANS_LAND: {
          id: 12,
          name: "No Man's Land",
          desc: "Travel through the desert",
          nano: 3,
        },
        HUNTER: {
          id: 13,
          name: "Hunter",
          desc: "Kill 50 enemies",
          isCompleted: function () {
            return self.storage.getTotalKills() >= 50;
          },
          nano: 4,
        },
        STILL_ALIVE: {
          id: 14,
          name: "Still Alive",
          desc: "Revive your character five times",
          isCompleted: function () {
            return self.storage.getTotalRevives() >= 5;
          },
          nano: 5,
        },
        MEATSHIELD: {
          id: 15,
          name: "Meatshield",
          desc: "Take 5,000 points of damage",
          isCompleted: function () {
            return self.storage.getTotalDamageTaken() >= 5000;
          },
          nano: 7,
        },
        NYAN: {
          id: 16,
          name: "Nyan Cat",
          desc: "Find the Nyan cat",
          nano: 3,
        },
        HOT_SPOT: {
          id: 17,
          name: "Hot Spot",
          desc: "Enter the volcanic mountains",
          nano: 3,
        },
        SPECTRE_COLLECTOR: {
          id: 18,
          name: "No Fear",
          desc: "Kill 10 spectres",
          isCompleted: function () {
            return self.storage.getSpectreCount() >= 10;
          },
          nano: 8,
        },
        GEM_HUNTER: {
          id: 19,
          name: "Gem Hunter",
          desc: "Collect all the hidden gems",
          nano: 8,
        },
        NANO_POTIONS: {
          id: 20,
          name: "Lucky Find",
          desc: "Collect 5 NANO potions",
          nano: 8,
        },
        HERO: {
          id: 21,
          name: "Hero",
          desc: "Defeat the Skeleton King",
          nano: 25,
        },
        FOXY: {
          id: 22,
          name: "Foxy",
          desc: "Find the Firefox costume",
          hidden: true,
          nano: 2,
        },
        FOR_SCIENCE: {
          id: 23,
          name: "For Science",
          desc: "Enter into a portal",
          hidden: true,
          nano: 4,
        },
        RICKROLLD: {
          id: 24,
          name: "Rickroll'd",
          desc: "Take some singing lessons",
          hidden: true,
          nano: 6,
        },
        XNO: {
          id: 25,
          name: "XNO",
          desc: "Complete your first purchase!",
          hidden: false,
          nano: 133,
        },
        FREEZING_LANDS: {
          id: 26,
          name: "BrrRRrr",
          desc: "Enter the freezing lands",
          hidden: false,
          nano: 12,
        },
        SKELETON_KEY: {
          id: 27,
          name: "Unique Key",
          desc: "Find the skeleton key",
          hidden: false,
          nano: 15,
        },
        BLOODLUST: {
          id: 28,
          name: "Bloodlust",
          desc: "Defeat 10 Werewolves",
          hidden: false,
          nano: 15,
          isCompleted: function () {
            return self.storage.getWerewolfCount() >= 10;
          },
        },
        SATOSHI: {
          id: 29,
          name: "Satoshi",
          desc: "Have a chat with Satoshi Nakamoto",
          hidden: false,
          nano: 10,
        },
        WEN: {
          id: 30,
          name: "WEN?",
          desc: "Find a very very large announcement",
          hidden: false,
          nano: 12,
        },
        INDIANA_JONES: {
          id: 31,
          name: "Indiana Jones",
          desc: "Reassemble the lost artifact",
          hidden: false,
          nano: 35,
        },
        MYTH_OR_REAL: {
          id: 32,
          name: "Myth or Real",
          desc: "Defeat 10 Yetis",
          hidden: false,
          nano: 15,
          isCompleted: function () {
            return self.storage.getYetiCount() >= 10;
          },
        },
        RIP: {
          id: 33,
          name: "R.I.P.",
          desc: "Defeat 10 Skeleton Guards",
          hidden: false,
          nano: 15,
          isCompleted: function () {
            return self.storage.getSkeleton3Count() >= 10;
          },
        },
        DEAD_NEVER_DIE: {
          id: 34,
          name: "What is dead may never die",
          desc: "Defeat the Skeleton Leader",
          hidden: false,
          nano: 30,
        },
        WALK_ON_WATER: {
          id: 35,
          name: "Walk on Water",
          desc: "Make your way though the floating ice",
          hidden: false,
          nano: 10,
        },
        GHOSTBUSTERS: {
          id: 36,
          name: "Ghostbusters",
          desc: "Kill 10 Wraiths",
          hidden: false,
          nano: 15,
          isCompleted: function () {
            return self.storage.getWraithCount() >= 10;
          },
        },
        BLACK_MAGIC: {
          id: 37,
          name: "Black Magic",
          desc: "Defeat the Necromancer",
          hidden: false,
          nano: 50,
        },
        LUCKY7: {
          id: 38,
          name: "Lucky 7",
          desc: "Upgrade a high class item to +7",
          hidden: true,
          nano: 13,
        },
        NOT_SAFU: {
          id: 39,
          name: "Not Safu",
          desc: "Kill a monster with less than 1% HP left",
          hidden: true,
          nano: 20,
        },
        TICKLE_FROM_UNDER: {
          id: 40,
          name: "Tickle from Under",
          desc: "Be surrounded by 15 zombies",
          hidden: true,
          nano: 15,
        },
      };

      _.each(this.achievements, function (obj) {
        if (!obj.isCompleted) {
          obj.isCompleted = function () {
            return true;
          };
        }
        if (!obj.hidden) {
          obj.hidden = false;
        }
      });

      this.app.initAchievementList(this.achievements);

      const unlockedAchievementIds = this.storage.data.achievement
        .map((unlocked, index) => (unlocked ? index + 1 : false))
        .filter(Boolean);
      const totalNano = unlockedAchievementIds.reduce((acc, id) => {
        const achievement = Object.values(self.achievements)[id - 1];
        acc += achievement ? achievement.nano : 0;
        return acc;
      }, 0);

      this.app.initUnlockedAchievements(unlockedAchievementIds, totalNano);
    },

    getAchievementById: function (id) {
      var found = null;
      _.each(this.achievements, function (achievement, key) {
        if (achievement.id === parseInt(id)) {
          found = achievement;
        }
      });
      return found;
    },

    initWaypoints: function (waypoints) {
      $("#waypoint-list").empty();
      var self = this;

      if (Array.isArray(waypoints)) {
        waypoints.forEach((status, i) => {
          // Statuses
          // 0, disabled
          // 1, available
          // 2, locked (no expansion)
          let statusClass = "";
          if (status === 0) {
            statusClass = "disabled";
          } else if (status === 2) {
            statusClass = "locked disabled expansion1";
          }

          $("<div/>", {
            id: `waypoint-${Types.waypoints[i].id}`,
            "data-waypoint-id": Types.waypoints[i].id,
            class: `waypoint-spaced-row waypoint-row ${statusClass}`,
            html: `
            <div class="waypoint-icon"></div>
            <div class="waypoint-text">${Types.waypoints[i].name}</div>
            `,
            click: function (e) {
              e.preventDefault();
              e.stopPropagation();

              // Only teleport to enabled locations
              if ($(this).hasClass("locked") || $(this).hasClass("disabled") || $(this).hasClass("active")) return;

              const id = parseInt($(this).data("waypoint-id"));
              const clickedWaypoint = Types.waypoints.find(({ id: waypointId }) => waypointId === id);

              // Waypoint has to be enabled
              if (clickedWaypoint && self.player.waypoints[id - 1] === 1) {
                const { gridX, gridY } = clickedWaypoint;
                self.app.closeWaypoint();
                self.player.stop_pathing_callback({ x: gridX + 1, y: gridY, isWaypoint: true });
              }
            },
          }).appendTo("#waypoint-list");
        });
      }
    },

    activateWaypoint: function (id) {
      $(`#waypoint-${id}`).removeClass("disabled locked").addClass("active");
    },

    loadSprite: function (name) {
      if (this.renderer.upscaledRendering) {
        this.spritesets[0][name] = new Sprite(name, 1);
      } else {
        this.spritesets[1][name] = new Sprite(name, 2);
        if (!this.renderer.mobile && !this.renderer.tablet) {
          this.spritesets[2][name] = new Sprite(name, 3);
        }
      }
    },

    setSpriteScale: function (scale) {
      var self = this;

      if (this.renderer.upscaledRendering) {
        this.sprites = this.spritesets[0];
      } else {
        this.sprites = this.spritesets[scale - 1];

        _.each(this.entities, function (entity) {
          entity.sprite = null;
          entity.setSprite(self.sprites[entity.getSpriteName()]);
        });
        this.initHurtSprites();
        this.initShadows();
        this.initCursors();
      }
    },

    loadSprites: function () {
      log.info("Loading sprites...");
      this.spritesets = [];
      this.spritesets[0] = {};
      this.spritesets[1] = {};
      this.spritesets[2] = {};
      _.map(this.spriteNames, this.loadSprite.bind(this));
    },

    spritesLoaded: function () {
      if (
        _.some(this.sprites, function (sprite) {
          return !sprite.isLoaded;
        })
      ) {
        return false;
      }
      return true;
    },

    setCursor: function (name, orientation) {
      if (name in this.cursors) {
        this.currentCursor = this.cursors[name];
        this.currentCursorOrientation = orientation;
      } else {
        log.error("Unknown cursor name :" + name);
      }
    },

    updateCursorLogic: function () {
      if (this.hoveringCollidingTile && this.started) {
        this.targetColor = "rgba(255, 50, 50, 0.5)";
      } else {
        this.targetColor = "rgba(255, 255, 255, 0.5)";
      }

      if (this.hoveringPlayer && this.started) {
        if (this.pvpFlag) this.setCursor("attack");
        else this.setCursor("hand");
        this.hoveringTarget = false;
        this.hoveringMob = false;
        this.targetCellVisible = false;
      } else if (this.hoveringMob && this.started) {
        this.setCursor("attack");
        this.hoveringTarget = false;
        this.hoveringPlayer = false;
        this.targetCellVisible = false;
      } else if (this.hoveringNpc && this.started) {
        this.setCursor("talk");
        this.hoveringTarget = false;
        this.targetCellVisible = false;
      } else if ((this.hoveringItem || this.hoveringChest) && this.started) {
        this.setCursor("loot");
        this.hoveringTarget = false;
        this.targetCellVisible = true;
      } else {
        this.setCursor("hand");
        this.hoveringTarget = false;
        this.hoveringPlayer = false;
        this.targetCellVisible = true;
      }
    },

    focusPlayer: function () {
      this.renderer.camera.lookAt(this.player);
    },

    addEntity: function (entity) {
      var self = this;

      if (this.entities[entity.id] === undefined) {
        this.entities[entity.id] = entity;
        this.registerEntityPosition(entity);

        if (
          !(entity instanceof Item && entity.wasDropped) &&
          !(this.renderer.mobile || this.renderer.tablet) &&
          entity.kind !== Types.Entities.ZOMBIE
        ) {
          entity.fadeIn(this.currentTime);
        }

        if (this.renderer.mobile || this.renderer.tablet) {
          entity.onDirty(function (e) {
            if (self.camera.isVisible(e)) {
              e.dirtyRect = self.renderer.getEntityBoundingRect(e);
              self.checkOtherDirtyRects(e.dirtyRect, e, e.gridX, e.gridY);
            }
          });
        }
      } else {
        log.error("This entity already exists : " + entity.id + " (" + entity.kind + ")");
      }
    },

    removeEntity: function (entity) {
      if (entity.id in this.entities) {
        this.unregisterEntityPosition(entity);
        delete this.entities[entity.id];
      } else {
        log.error("Cannot remove entity. Unknown ID : " + entity.id);
      }
    },

    addItem: function (item, x, y) {
      item.setSprite(this.sprites[item.getSpriteName()]);
      item.setGridPosition(x, y);
      item.setAnimation("idle", 150);
      this.addEntity(item);
    },

    removeItem: function (item) {
      if (item) {
        this.removeFromItemGrid(item, item.gridX, item.gridY);
        this.removeFromRenderingGrid(item, item.gridX, item.gridY);
        delete this.entities[item.id];
      } else {
        log.error("Cannot remove item. Unknown ID : " + item.id);
      }
    },

    initPathingGrid: function () {
      this.pathingGrid = [];
      for (var i = 0; i < this.map.height; i += 1) {
        this.pathingGrid[i] = [];
        for (var j = 0; j < this.map.width; j += 1) {
          this.pathingGrid[i][j] = this.map.grid[i][j];
        }
      }
      log.info("Initialized the pathing grid with static colliding cells.");
    },

    initEntityGrid: function () {
      this.entityGrid = [];
      for (var i = 0; i < this.map.height; i += 1) {
        this.entityGrid[i] = [];
        for (var j = 0; j < this.map.width; j += 1) {
          this.entityGrid[i][j] = {};
        }
      }
      log.info("Initialized the entity grid.");
    },

    initRenderingGrid: function () {
      this.renderingGrid = [];
      for (var i = 0; i < this.map.height; i += 1) {
        this.renderingGrid[i] = [];
        for (var j = 0; j < this.map.width; j += 1) {
          this.renderingGrid[i][j] = {};
        }
      }
      log.info("Initialized the rendering grid.");
    },

    initItemGrid: function () {
      this.itemGrid = [];
      for (var i = 0; i < this.map.height; i += 1) {
        this.itemGrid[i] = [];
        for (var j = 0; j < this.map.width; j += 1) {
          this.itemGrid[i][j] = {};
        }
      }
      log.info("Initialized the item grid.");
    },

    /**
     *
     */
    initAnimatedTiles: function () {
      var self = this,
        m = this.map;

      this.animatedTiles = [];
      this.forEachVisibleTile(function (id, index) {
        if (m.isAnimatedTile(id)) {
          var tile = new AnimatedTile(id, m.getTileAnimationLength(id), m.getTileAnimationDelay(id), index),
            pos = self.map.tileIndexToGridPosition(tile.index);

          tile.x = pos.x;
          tile.y = pos.y;
          self.animatedTiles.push(tile);
        }
      }, 1);
      //log.info("Initialized animated tiles.");
    },

    addToRenderingGrid: function (entity, x, y) {
      if (!this.map.isOutOfBounds(x, y)) {
        this.renderingGrid[y][x][entity.id] = entity;
      }
    },

    removeFromRenderingGrid: function (entity, x, y) {
      if (entity && this.renderingGrid[y][x] && entity.id in this.renderingGrid[y][x]) {
        delete this.renderingGrid[y][x][entity.id];
      }
    },

    removeFromEntityGrid: function (entity, x, y) {
      if (this.entityGrid[y][x][entity.id]) {
        delete this.entityGrid[y][x][entity.id];
      }
    },

    removeFromItemGrid: function (item, x, y) {
      if (item && this.itemGrid[y][x][item.id]) {
        delete this.itemGrid[y][x][item.id];
      }
    },

    removeFromPathingGrid: function (x, y) {
      this.pathingGrid[y][x] = 0;
    },

    /**
     * Registers the entity at two adjacent positions on the grid at the same time.
     * This situation is temporary and should only occur when the entity is moving.
     * This is useful for the hit testing algorithm used when hovering entities with the mouse cursor.
     *
     * @param {Entity} entity The moving entity
     */
    registerEntityDualPosition: function (entity) {
      if (entity) {
        this.entityGrid[entity.gridY][entity.gridX][entity.id] = entity;

        this.addToRenderingGrid(entity, entity.gridX, entity.gridY);

        if (entity.nextGridX >= 0 && entity.nextGridY >= 0) {
          this.entityGrid[entity.nextGridY][entity.nextGridX][entity.id] = entity;
          if (!(entity instanceof Player)) {
            this.pathingGrid[entity.nextGridY][entity.nextGridX] = 1;
          }
        }
      }
    },

    /**
     * Clears the position(s) of this entity in the entity grid.
     *
     * @param {Entity} entity The moving entity
     */
    unregisterEntityPosition: function (entity) {
      if (entity) {
        this.removeFromEntityGrid(entity, entity.gridX, entity.gridY);
        this.removeFromPathingGrid(entity.gridX, entity.gridY);

        this.removeFromRenderingGrid(entity, entity.gridX, entity.gridY);

        if (entity.nextGridX >= 0 && entity.nextGridY >= 0) {
          this.removeFromEntityGrid(entity, entity.nextGridX, entity.nextGridY);
          this.removeFromPathingGrid(entity.nextGridX, entity.nextGridY);
        }
      }
    },

    registerEntityPosition: function (entity) {
      var x = entity.gridX,
        y = entity.gridY;

      if (entity) {
        if (entity instanceof Character || entity instanceof Chest) {
          this.entityGrid[y][x][entity.id] = entity;
          if (!(entity instanceof Player)) {
            this.pathingGrid[y][x] = 1;
          }
        }
        if (entity instanceof Item) {
          this.itemGrid[y][x][entity.id] = entity;
        }

        this.addToRenderingGrid(entity, x, y);
      }
    },

    setServerOptions: function (host, port, username, useraccount) {
      this.host = host;
      this.port = port;
      this.username = username;
      this.useraccount = useraccount;
    },

    loadAudio: function () {
      this.audioManager = new AudioManager(this);
    },

    initMusicAreas: function () {
      var self = this;

      _.each(this.map.musicAreas, function (area) {
        self.audioManager.addArea(area.x, area.y, area.w, area.h, area.id);
      });
    },

    run: function (action, started_callback) {
      var self = this;

      this.loadSprites();
      this.setUpdater(new Updater(this));
      this.camera = this.renderer.camera;

      this.setSpriteScale(this.renderer.scale);

      var wait = setInterval(function () {
        if (self.map.isLoaded && self.spritesLoaded()) {
          self.ready = true;
          log.debug("All sprites loaded.");

          self.loadAudio();

          self.initMusicAreas();
          self.initCursors();
          self.initAnimations();
          self.initShadows();
          self.initHurtSprites();

          if (!self.renderer.mobile && !self.renderer.tablet && self.renderer.upscaledRendering) {
            self.initSilhouettes();
          }

          self.initEntityGrid();
          self.initItemGrid();
          self.initPathingGrid();
          self.initRenderingGrid();

          self.setPathfinder(new Pathfinder(self.map.width, self.map.height));
          self.initPlayer();
          self.setCursor("hand");

          self.connect(action, started_callback);
          clearInterval(wait);
        }
      }, 100);
    },

    tick: function () {
      this.currentTime = new Date().getTime();

      if (this.started) {
        this.updateCursorLogic();
        this.updater.update();
        this.renderer.renderFrame();
      }

      if (!this.isStopped) {
        requestAnimFrame(this.tick.bind(this));
      }
    },

    start: function () {
      this.tick();
      this.hasNeverStarted = false;
      log.info("Game loop started.");
    },

    stop: function () {
      log.info("Game stopped.");
      this.isStopped = true;
    },

    entityIdExists: function (id) {
      return id in this.entities;
    },

    getEntityById: function (id) {
      if (id in this.entities) {
        return this.entities[id];
      } else {
        // log.error("Unknown entity id : " + id, true);
      }
    },

    connect: function (action, started_callback) {
      var self = this,
        connecting = false; // always in dispatcher mode in the build version

      this.client = new GameClient(this.host, this.port);
      this.client.fail_callback = function (reason) {
        started_callback({
          success: false,
          reason: reason,
        });
        self.started = false;
      };

      //>>excludeStart("prodHost", pragmas.prodHost);
      var config = this.app.config.local || this.app.config.dev;
      if (config) {
        this.client.connect(config.dispatcher); // false if the client connects directly to a game server
        connecting = true;
      }
      //>>excludeEnd("prodHost");

      //>>includeStart("prodHost", pragmas.prodHost);
      if (!connecting) {
        this.client.connect(false); // dont use the dispatcher in production
      }
      //>>includeEnd("prodHost");

      this.client.onDispatched(function (host, port) {
        log.debug("Dispatched to game server " + host + ":" + port);

        self.client.host = host;
        self.client.port = port;
        self.client.connect(); // connect to actual game server
      });

      this.client.onConnected(function () {
        log.info("Starting client/server handshake");

        self.player.name = self.username;
        self.player.account = self.useraccount;
        self.started = true;

        if (action === "create") {
          self.client.sendCreate(self.player);
        } else {
          self.client.sendLogin(self.player);
        }
      });

      this.client.onEntityList(function (list) {
        var entityIds = _.map(self.entities, "id"),
          knownIds = _.intersection(entityIds, list),
          newIds = _.difference(list, knownIds);

        self.obsoleteEntities = _.reject(self.entities, function (entity) {
          return _.includes(knownIds, entity.id) || entity.id === self.player.id;
        });

        // Destroy entities outside of the player's zone group
        self.removeObsoleteEntities();

        // Ask the server for spawn information about unknown entities
        if (_.size(newIds) > 0) {
          self.client.sendWho(newIds);
        }
      });

      this.client.onWelcome(function ({
        id,
        name,
        x,
        y,
        hp,
        armor,
        weapon,
        belt,
        ring1,
        ring2,
        amulet,
        experience,
        achievement,
        inventory,
        stash,
        hash,
        hash1,
        nanoPotions,
        gems,
        artifact,
        expansion1,
        waypoints,
        depositAccount,
      }) {
        log.info("Received player ID from server : " + id);
        self.player.id = id;
        self.playerId = id;
        // Always accept name received from the server which will
        // sanitize and shorten names exceeding the allowed length.
        self.player.name = name;

        var [armor, armorLevel] = armor.split(":");
        var [weapon, weaponLevel] = weapon.split(":");

        self.storage.setPlayerName(name);
        self.storage.setPlayerArmor(armor);
        self.storage.setPlayerWeapon(weapon);
        self.storage.setAchievement(achievement);

        self.player.setGridPosition(x, y);
        self.player.setMaxHitPoints(hp);
        self.player.setArmorName(armor);
        self.player.setArmorLevel(armorLevel);
        self.player.setSpriteName(armor);
        self.player.setWeaponName(weapon);
        self.player.setWeaponLevel(weaponLevel);
        self.player.setBelt(belt);
        self.player.setRing1(ring1);
        self.player.setRing2(ring2);
        self.player.setAmulet(amulet);
        self.initPlayer();
        self.player.experience = experience;
        self.player.level = Types.getLevel(experience);
        self.player.setInventory(inventory);
        self.player.setStash(stash);

        self.initMuteButton();
        self.updateBars();
        self.updateExpBar();
        self.resetCamera();
        self.updatePlateauMode();
        self.audioManager.updateMusic();
        self.initAchievements();
        self.initInventory();
        self.initUpgrade();
        self.initStash();
        self.initTooltips();
        self.initSendUpgradeItem();
        self.initUpgradeItemPreview();
        self.initWaypoints(waypoints);

        self.store.depositAccount = depositAccount;

        self.player.nanoPotions = nanoPotions;
        self.player.gems = gems;
        self.player.artifact = artifact;
        self.player.expansion1 = expansion1;
        self.player.waypoints = waypoints;
        self.player.skeletonKey = !!achievement[26];

        self.addEntity(self.player);
        self.player.dirtyRect = self.renderer.getEntityBoundingRect(self.player);

        setTimeout(function () {
          self.tryUnlockingAchievement("STILL_ALIVE");
        }, 1500);

        self.app.updateNanoPotions(nanoPotions);
        self.app.updateGems(gems);
        self.app.updateArtifact(artifact);

        self.storage.initPlayer(self.player.name, self.player.account);
        self.storage.savePlayer(
          self.renderer.getPlayerImage(),
          self.player.getSpriteName(),
          self.player.getWeaponName(),
          self.player.getGuild(),
        );

        if (!self.storage.hasAlreadyPlayed()) {
          self.showNotification("Welcome to Nano BrowserQuest!");
        } else {
          self.showNotification("Welcome Back. You are level " + self.player.level + ".");
          // self.storage.setPlayerName(name);
        }

        if (hash || hash1) {
          self.gamecompleted_callback({ hash, hash1, fightAgain: false });
        }

        // @NOTE possibly optimize this? sending request to move items to inventory
        self.client.sendMoveUpgradeItemsToInventory();

        self.player.onStartPathing(function (path) {
          var i = path.length - 1,
            x = path[i][0],
            y = path[i][1];

          if (self.player.isMovingToLoot()) {
            self.player.isLootMoving = false;
          } else if (!self.player.isAttacking()) {
            self.client.sendMove(x, y);
          }

          // Target cursor position
          self.selectedX = x;
          self.selectedY = y;

          self.selectedCellVisible = true;

          if (self.renderer.mobile || self.renderer.tablet) {
            self.drawTarget = true;
            self.clearTarget = true;
            self.renderer.targetRect = self.renderer.getTargetBoundingRect();
            self.checkOtherDirtyRects(self.renderer.targetRect, null, self.selectedX, self.selectedY);
          }
        });

        self.player.onCheckAggro(function () {
          self.forEachMob(function (mob) {
            if (mob.isAggressive && !mob.isAttacking() && self.player.isNear(mob, mob.aggroRange) && !mob.isRaising()) {
              self.player.aggro(mob);
            }
          });
        });

        self.player.onAggro(function (mob) {
          if (!mob.isWaitingToAttack(self.player) && !self.player.isAttackedBy(mob)) {
            self.player.log_info("Aggroed by " + mob.id + " at (" + self.player.gridX + ", " + self.player.gridY + ")");
            self.client.sendAggro(mob);
            mob.waitToAttack(self.player);
          }
        });

        self.player.onBeforeStep(function () {
          var blockingEntity = self.getEntityAt(self.player.nextGridX, self.player.nextGridY);
          if (blockingEntity && blockingEntity.id !== self.playerId) {
            log.debug("Blocked by " + blockingEntity.id);
          }
          self.unregisterEntityPosition(self.player);
        });

        self.player.onStep(function () {
          if (self.player.hasNextStep()) {
            self.registerEntityDualPosition(self.player);
          }

          if (self.isZoningTile(self.player.gridX, self.player.gridY)) {
            self.isCharacterZoning = true;
            self.enqueueZoningFrom(self.player.gridX, self.player.gridY);
          }

          self.player.forEachAttacker(self.makeAttackerFollow);

          var item = self.getItemAt(self.player.gridX, self.player.gridY);
          if (item instanceof Item) {
            self.tryLootingItem(item);
          }

          if (
            (self.player.gridX <= 85 && self.player.gridY <= 179 && self.player.gridY > 178) ||
            (self.player.gridX <= 85 && self.player.gridY <= 266 && self.player.gridY > 265)
          ) {
            self.tryUnlockingAchievement("INTO_THE_WILD");
          }

          if (self.player.gridX <= 85 && self.player.gridY <= 293 && self.player.gridY > 292) {
            self.tryUnlockingAchievement("AT_WORLDS_END");
          }

          if (self.player.gridX <= 85 && self.player.gridY <= 100 && self.player.gridY > 99) {
            self.tryUnlockingAchievement("NO_MANS_LAND");
          }

          if (self.player.gridX <= 85 && self.player.gridY <= 51 && self.player.gridY > 50) {
            self.tryUnlockingAchievement("HOT_SPOT");
          }

          if (self.player.gridX <= 27 && self.player.gridY <= 123 && self.player.gridY > 112) {
            self.tryUnlockingAchievement("TOMB_RAIDER");
          }

          if (self.player.gridY > 444) {
            self.tryUnlockingAchievement("FREEZING_LANDS");
          }

          if (self.player.gridY >= 350 && self.player.gridY <= 365 && self.player.gridX <= 80) {
            self.tryUnlockingAchievement("WALK_ON_WATER");
          }

          if (
            self.player.gridY >= 328 &&
            self.player.gridY <= 332 &&
            self.player.gridX >= 13 &&
            self.player.gridX <= 23
          ) {
            self.tryUnlockingAchievement("WEN");
          }

          self.updatePlayerCheckpoint();

          if (!self.player.isDead) {
            self.audioManager.updateMusic();
          }
        });

        self.player.onStopPathing(function ({ x, y, confirmed, isWaypoint }) {
          if (self.player.hasTarget()) {
            self.player.lookAtTarget();
          }

          self.selectedCellVisible = false;

          if (self.isItemAt(x, y)) {
            var item = self.getItemAt(x, y);
            self.tryLootingItem(item);
          }

          const isDoor = !isWaypoint && self.map.isDoor(x, y);
          if ((!self.player.hasTarget() && isDoor) || isWaypoint) {
            var dest = isWaypoint ? { x, y, orientation: 2 } : self.map.getDoorDestination(x, y);
            if (!confirmed && x === 71 && y === 21 && dest.x === 155 && dest.y === 96) {
              self.client.sendBossCheck(false);
              return;
            }

            var desty = dest.y;

            // @TODO Fix this...
            if (self.renderer.mobile) {
              //push them off the door spot so they can use the
              //arrow keys and mouse to walk back in or out
              if (dest.orientation === Types.Orientations.UP) {
                desty--;
              } else if (dest.orientation === Types.Orientations.DOWN) {
                desty++;
              }
            }

            self.player.setGridPosition(dest.x, desty);
            self.player.nextGridX = dest.x;
            self.player.nextGridY = desty;
            self.player.turnTo(dest.orientation);
            self.client.sendTeleport(dest.x, desty);

            if (self.renderer.mobile && dest.cameraX && dest.cameraY) {
              self.camera.setGridPosition(dest.cameraX, dest.cameraY);
              self.resetZone();
            } else {
              if (dest.portal) {
                self.assignBubbleTo(self.player);
              } else {
                self.camera.focusEntity(self.player);
                self.resetZone();
              }
            }

            if (_.size(self.player.attackers) > 0) {
              setTimeout(function () {
                self.tryUnlockingAchievement("COWARD");
              }, 500);
            }
            self.player.forEachAttacker(function (attacker) {
              attacker.disengage();
              attacker.idle();
            });

            self.updatePlateauMode();

            self.checkUndergroundAchievement();

            if (self.renderer.mobile || self.renderer.tablet) {
              // When rendering with dirty rects, clear the whole screen when entering a door.
              self.renderer.clearScreen(self.renderer.context);
            }

            if (dest.portal || isWaypoint) {
              self.audioManager.playSound("teleport");
            }

            if (!self.player.isDead) {
              self.audioManager.updateMusic();
            }
          }

          if (self.player.target instanceof Npc && !isWaypoint) {
            self.makeNpcTalk(self.player.target);
          } else if (self.player.target instanceof Chest) {
            if (self.player.target.gridX === 154 && self.player.target.gridY === 365 && !self.player.skeletonKey) {
              // @NOTE skip playing the chest open sound if the SKELETON_KEY quest is not completed
              self.showNotification("You need to find the Skeleton Key");
              self.audioManager.playSound("noloot");
            } else {
              self.client.sendOpen(self.player.target);
              self.audioManager.playSound("chest");
            }
          }

          self.player.forEachAttacker(function (attacker) {
            if (!attacker.isAdjacentNonDiagonal(self.player)) {
              attacker.follow(self.player);
            }
          });

          self.unregisterEntityPosition(self.player);
          self.registerEntityPosition(self.player);
        });

        self.player.onRequestPath(function (x, y) {
          var ignored = [self.player]; // Always ignore self

          if (self.player.hasTarget()) {
            ignored.push(self.player.target);
          }
          return self.findPath(self.player, x, y, ignored);
        });

        self.player.onDeath(function () {
          log.info(self.playerId + " is dead");

          self.player.stopBlinking();
          self.player.setSprite(self.sprites["death"]);
          self.player.animate("death", 120, 1, function () {
            log.info(self.playerId + " was removed");

            self.removeEntity(self.player);
            self.removeFromRenderingGrid(self.player, self.player.gridX, self.player.gridY);

            self.player = null;
            self.client.disable();

            setTimeout(function () {
              self.playerdeath_callback();
            }, 1000);
          });

          self.player.forEachAttacker(function (attacker) {
            attacker.disengage();
            attacker.idle();
          });

          self.audioManager.fadeOutCurrentMusic();
          self.audioManager.playSound("death");
        });

        self.player.onHasMoved(function (player) {
          self.assignBubbleTo(player);
        });
        self.client.onPVPChange(function (pvpFlag) {
          self.player.flagPVP(pvpFlag);
          if (pvpFlag) {
            self.showNotification("PVP is on.");
          } else {
            self.showNotification("PVP is off.");
          }
        });

        self.player.onArmorLoot(function (armorName) {
          self.player.switchArmor(self.sprites[armorName]);
        });

        self.player.onSwitchItem(function () {
          // self.storage.savePlayer(
          //   self.renderer.getPlayerImage(),
          //   self.player.getArmorName(),
          //   self.player.getWeaponName(),
          //   self.player.getGuild(),
          // );
          if (self.equipment_callback) {
            self.equipment_callback();
          }
        });

        self.player.onInvincible(function () {
          self.invincible_callback();
          self.player.switchArmor(self.sprites["firefox"]);
        });

        self.client.onSpawnItem(function (item, x, y) {
          // log.info("Spawned " + Types.getKindAsString(item.kind) + " (" + item.id + ") at " + x + ", " + y);
          self.addItem(item, x, y);
        });

        self.client.onSpawnChest(function (chest, x, y) {
          // log.info("Spawned chest (" + chest.id + ") at " + x + ", " + y);
          chest.setSprite(self.sprites[chest.getSpriteName()]);
          chest.setGridPosition(x, y);
          chest.setAnimation("idle_down", 150);
          self.addEntity(chest, x, y);

          chest.onOpen(function () {
            chest.stopBlinking();
            chest.setSprite(self.sprites["death"]);
            chest.setAnimation("death", 120, 1, function () {
              log.info(chest.id + " was removed");
              self.removeEntity(chest);
              self.removeFromRenderingGrid(chest, chest.gridX, chest.gridY);
              self.previousClickPosition = {};
            });
          });
        });

        self.client.onSpawnCharacter(function (entity, x, y, orientation, targetId) {
          if (!self.entityIdExists(entity.id)) {
            try {
              if (entity.id !== self.playerId) {
                entity.setSprite(self.sprites[entity.getSpriteName()]);
                entity.setGridPosition(x, y);
                entity.setOrientation(orientation);
                if (entity.kind === Types.Entities.ZOMBIE) {
                  entity.raise();

                  setTimeout(() => {
                    entity.aggroRange = 10;
                    entity.isAggressive = true;
                  }, 1000);
                } else {
                  entity.idle();
                }

                self.addEntity(entity);

                // log.debug(
                //   "Spawned " +
                //     Types.getKindAsString(entity.kind) +
                //     " (" +
                //     entity.id +
                //     ") at " +
                //     entity.gridX +
                //     ", " +
                //     entity.gridY,
                // );

                if (entity instanceof Character) {
                  entity.onBeforeStep(function () {
                    self.unregisterEntityPosition(entity);
                  });

                  entity.onStep(function () {
                    if (!entity.isDying) {
                      self.registerEntityDualPosition(entity);

                      if (self.player && self.player.target === entity) {
                        self.makeAttackerFollow(self.player);
                      }

                      entity.forEachAttacker(function (attacker) {
                        if (attacker.isAdjacent(attacker.target)) {
                          attacker.lookAtTarget();
                        } else {
                          attacker.follow(entity);
                        }
                      });
                    }
                  });

                  entity.onStopPathing(function (x, y) {
                    if (!entity.isDying) {
                      if (entity.hasTarget() && entity.isAdjacent(entity.target)) {
                        entity.lookAtTarget();
                      }

                      if (entity instanceof Player) {
                        var gridX = entity.destination.gridX,
                          gridY = entity.destination.gridY;

                        if (self.map.isDoor(gridX, gridY)) {
                          var dest = self.map.getDoorDestination(gridX, gridY);
                          entity.setGridPosition(dest.x, dest.y);
                        }
                      }

                      entity.forEachAttacker(function (attacker) {
                        if (!attacker.isAdjacentNonDiagonal(entity) && attacker.id !== self.playerId) {
                          attacker.follow(entity);
                        }
                      });

                      self.unregisterEntityPosition(entity);
                      self.registerEntityPosition(entity);
                    }
                  });

                  entity.onRequestPath(function (x, y) {
                    var ignored = [entity], // Always ignore self
                      ignoreTarget = function (target) {
                        ignored.push(target);

                        // also ignore other attackers of the target entity
                        target.forEachAttacker(function (attacker) {
                          ignored.push(attacker);
                        });
                      };

                    if (entity.hasTarget()) {
                      ignoreTarget(entity.target);
                    } else if (entity.previousTarget) {
                      // If repositioning before attacking again, ignore previous target
                      // See: tryMovingToADifferentTile()
                      ignoreTarget(entity.previousTarget);
                    }

                    return self.findPath(entity, x, y, ignored);
                  });

                  entity.onDeath(function () {
                    log.info(entity.id + " is dead");

                    if (entity instanceof Mob) {
                      // Keep track of where mobs die in order to spawn their dropped items
                      // at the right position later.
                      self.deathpositions[entity.id] = {
                        x: entity.gridX,
                        y: entity.gridY,
                      };
                    }

                    entity.isDying = true;
                    entity.setSprite(self.sprites[entity instanceof Mobs.Rat ? "rat" : "death"]);
                    entity.animate("death", 120, 1, function () {
                      log.info(entity.id + " was removed");

                      self.removeEntity(entity);
                      self.removeFromRenderingGrid(entity, entity.gridX, entity.gridY);
                    });

                    entity.forEachAttacker(function (attacker) {
                      attacker.disengage();
                    });

                    if (self.player.target && self.player.target.id === entity.id) {
                      self.player.disengage();
                    }

                    // Upon death, this entity is removed from both grids, allowing the player
                    // to click very fast in order to loot the dropped item and not be blocked.
                    // The entity is completely removed only after the death animation has ended.
                    self.removeFromEntityGrid(entity, entity.gridX, entity.gridY);
                    self.removeFromPathingGrid(entity.gridX, entity.gridY);

                    if (self.camera.isVisible(entity)) {
                      self.audioManager.playSound("kill" + Math.floor(Math.random() * 2 + 1));
                    }

                    self.updateCursor();
                  });

                  entity.onHasMoved(function (entity) {
                    self.assignBubbleTo(entity); // Make chat bubbles follow moving entities
                  });

                  if (entity instanceof Mob) {
                    if (targetId) {
                      var player = self.getEntityById(targetId);
                      if (player) {
                        self.createAttackLink(entity, player);
                      }
                    }
                  }
                }
              }
            } catch (err) {
              log.error(err);
            }
          } else {
            log.debug("Character " + entity.id + " already exists. Don't respawn.");
          }
        });

        self.client.onDespawnEntity(function (entityId) {
          var entity = self.getEntityById(entityId);

          if (entity) {
            log.info("Despawning " + Types.getKindAsString(entity.kind) + " (" + entity.id + ")");

            if (entity.gridX === self.previousClickPosition.x && entity.gridY === self.previousClickPosition.y) {
              self.previousClickPosition = {};
            }

            if (entity instanceof Item) {
              self.removeItem(entity);
            } else if (entity instanceof Character) {
              entity.forEachAttacker(function (attacker) {
                if (attacker.canReachTarget()) {
                  attacker.hit();
                }
              });
              entity.die();
            } else if (entity instanceof Chest) {
              entity.open();
            }

            entity.clean();
          }
        });

        self.client.onItemBlink(function (id) {
          var item = self.getEntityById(id);

          if (item) {
            item.blink(150);
          }
        });

        self.client.onGuildError(function (errorType, info) {
          if (errorType === Types.Messages.GUILDERRORTYPE.BADNAME) {
            self.showNotification(info + " seems to be an inappropriate guild name…");
          } else if (errorType === Types.Messages.GUILDERRORTYPE.ALREADYEXISTS) {
            self.showNotification(info + " already exists…");
            setTimeout(function () {
              self.showNotification("Either change the name of YOUR guild");
            }, 2500);
            setTimeout(function () {
              self.showNotification("Or ask a member of " + info + " if you can join them.");
            }, 5000);
          } else if (errorType === Types.Messages.GUILDERRORTYPE.IDWARNING) {
            self.showNotification("WARNING: the server was rebooted.");
            setTimeout(function () {
              self.showNotification(info + " has changed ID.");
            }, 2500);
          } else if (errorType === Types.Messages.GUILDERRORTYPE.BADINVITE) {
            self.showNotification(info + " is ALREADY a member of “" + self.player.getGuild().name + "”");
          }
        });

        self.client.onGuildCreate(function (guildId, guildName) {
          self.player.setGuild(new Guild(guildId, guildName));
          self.storage.setPlayerGuild(self.player.getGuild());
          self.showNotification("You successfully created and joined…");
          setTimeout(function () {
            self.showNotification("…" + self.player.getGuild().name);
          }, 2500);
        });

        self.client.onGuildInvite(function (guildId, guildName, invitorName) {
          self.showNotification(invitorName + " invited you to join “" + guildName + "”.");
          self.player.addInvite(guildId);
          setTimeout(function () {
            $("#chatinput").attr(
              "placeholder",
              "Do you want to join " + guildName + " ? Type /guild accept yes or /guild accept no",
            );
            self.app.showChat();
          }, 2500);
        });

        self.client.onGuildJoin(function (playerName, id, guildId, guildName) {
          if (typeof id === "undefined") {
            self.showNotification(playerName + " failed to answer to your invitation in time.");
            setTimeout(function () {
              self.showNotification("Might have to send another invite…");
            }, 2500);
          } else if (id === false) {
            self.showNotification(playerName + " respectfully declined your offer…");
            setTimeout(function () {
              self.showNotification("…to join “" + self.player.getGuild().name + "”.");
            }, 2500);
          } else if (id === self.player.id) {
            self.player.setGuild(new Guild(guildId, guildName));
            self.storage.setPlayerGuild(self.player.getGuild());
            self.showNotification("You just joined “" + guildName + "”.");
          } else {
            self.showNotification(playerName + " is now a jolly member of “" + guildName + "”."); //#updateguild
          }
        });

        self.client.onGuildLeave(function (name, playerId, guildName) {
          if (self.player.id === playerId) {
            if (self.player.hasGuild()) {
              if (self.player.getGuild().name === guildName) {
                //do not erase new guild on create
                self.player.unsetGuild();
                self.storage.setPlayerGuild();
                self.showNotification("You successfully left “" + guildName + "”.");
              }
            }
            //missing elses above should not happen (errors)
          } else {
            self.showNotification(name + " has left “" + guildName + "”."); //#updateguild
          }
        });

        self.client.onGuildTalk(function (name, id, message) {
          if (id === self.player.id) {
            self.showNotification("YOU: " + message);
          } else {
            self.showNotification(name + ": " + message);
          }
        });

        self.client.onMemberConnect(function (name) {
          self.showNotification(name + " connected to your world."); //#updateguild
        });

        self.client.onMemberDisconnect(function (name) {
          self.showNotification(name + " lost connection with your world.");
        });

        self.client.onReceiveGuildMembers(function (memberNames) {
          self.showNotification(
            memberNames.join(", ") + (memberNames.length === 1 ? " is " : " are ") + "currently online.",
          ); //#updateguild
        });

        self.client.onEntityMove(function (id, x, y) {
          var entity = null;
          if (id !== self.playerId) {
            entity = self.getEntityById(id);

            if (entity) {
              if (self.player.isAttackedBy(entity)) {
                self.tryUnlockingAchievement("COWARD");
              }
              entity.disengage();
              entity.idle();
              self.makeCharacterGoTo(entity, x, y);
            }
          }
        });

        self.client.onEntityDestroy(function (id) {
          var entity = self.getEntityById(id);
          if (entity) {
            if (entity instanceof Item) {
              self.removeItem(entity);
            } else {
              self.removeEntity(entity);
            }
            log.debug("Entity was destroyed: " + entity.id);
          }
        });

        self.client.onPlayerMoveToItem(function (playerId, itemId) {
          var player, item;
          if (playerId !== self.playerId) {
            player = self.getEntityById(playerId);
            item = self.getEntityById(itemId);

            if (player && item) {
              self.makeCharacterGoTo(player, item.gridX, item.gridY);
            }
          }
        });

        self.client.onEntityAttack(function (attackerId, targetId) {
          var attacker = self.getEntityById(attackerId);
          var target = self.getEntityById(targetId);

          if (attacker && target && attacker.id !== self.playerId) {
            log.debug(attacker.id + " attacks " + target.id);

            if (
              attacker &&
              target instanceof Player &&
              target.id !== self.playerId &&
              target.target &&
              target.target.id === attacker.id &&
              attacker.getDistanceToEntity(target) < 3
            ) {
              setTimeout(function () {
                self.createAttackLink(attacker, target);
              }, 200); // delay to prevent other players attacking mobs from ending up on the same tile as they walk towards each other.
            } else {
              self.createAttackLink(attacker, target);
            }
          }
        });

        self.client.onEntityRaise(function (mobId) {
          var mob = self.getEntityById(mobId);
          if (mob) {
            mob.setRaisingMode();
            self.audioManager.playSound("raise");
          }
        });

        self.client.onPlayerDamageMob(function ({ id, dmg, hp, maxHp, isCritical }) {
          var mob = self.getEntityById(id);
          if (mob && dmg) {
            self.infoManager.addDamageInfo({ value: dmg, x: mob.x, y: mob.y - 15, type: "inflicted", isCritical });
          }
          if (self.player.hasTarget()) {
            self.updateTarget(id, dmg, hp, maxHp);
          }
        });

        self.client.onPlayerKillMob(function (kind, level, playerExp, exp) {
          self.player.experience = playerExp;

          if (self.player.level !== level) {
            self.player.level = level;
            self.updateRequirement();
          }

          if (exp) {
            self.updateExpBar();
            self.infoManager.addDamageInfo({
              value: "+" + exp + " exp",
              x: self.player.x,
              y: self.player.y - 15,
              type: "exp",
              duration: 3000,
            });
          }

          // var expInThisLevel = self.player.experience - Types.expForLevel[self.player.level - 1];
          // var expForLevelUp = Types.expForLevel[self.player.level] - Types.expForLevel[self.player.level - 1];
          // var expPercentThisLevel = (100 * expInThisLevel) / expForLevelUp;

          // self.showNotification(
          //   "Total xp: " + self.player.experience + ". " + expPercentThisLevel.toFixed(0) + "% of this level done.",
          // );

          var mobName = Types.getKindAsString(kind);
          mobName = Types.getAliasFromName(mobName);

          self.storage.incrementTotalKills();
          self.tryUnlockingAchievement("HUNTER");

          if (kind === Types.Entities.RAT) {
            self.storage.incrementRatCount();
            self.tryUnlockingAchievement("ANGRY_RATS");
          } else if (kind === Types.Entities.SKELETON || kind === Types.Entities.SKELETON2) {
            self.storage.incrementSkeletonCount();
            self.tryUnlockingAchievement("SKULL_COLLECTOR");
          } else if (kind === Types.Entities.SPECTRE) {
            self.storage.incrementSpectreCount();
            self.tryUnlockingAchievement("SPECTRE_COLLECTOR");
          } else if (kind === Types.Entities.BOSS) {
            self.tryUnlockingAchievement("HERO").then(() => {
              self.client.sendRequestPayout(Types.Entities.BOSS);
            });
          } else if (kind === Types.Entities.WEREWOLF) {
            self.storage.incrementWerewolfCount();
            self.tryUnlockingAchievement("BLOODLUST");
          } else if (kind === Types.Entities.YETI) {
            self.storage.incrementYetiCount();
            self.tryUnlockingAchievement("MYTH_OR_REAL");
          } else if (kind === Types.Entities.SKELETON3) {
            self.storage.incrementSkeleton3Count();
            self.tryUnlockingAchievement("RIP");
          } else if (kind === Types.Entities.WRAITH) {
            self.storage.incrementWraithCount();
            self.tryUnlockingAchievement("GHOSTBUSTERS");
          } else if (kind === Types.Entities.SKELETONLEADER) {
            self.tryUnlockingAchievement("DEAD_NEVER_DIE");
          } else if (kind === Types.Entities.NECROMANCER) {
            self.tryUnlockingAchievement("BLACK_MAGIC").then(() => {
              self.client.sendRequestPayout(Types.Entities.NECROMANCER);
            });
          }

          if (Math.floor((self.player.hitPoints * 100) / self.player.maxHitPoints) <= 1 && kind > Types.Entities.RAT2) {
            self.tryUnlockingAchievement("NOT_SAFU");
          }
        });

        self.client.onPlayerChangeHealth(function (points, isRegen) {
          var player = self.player,
            diff,
            isHurt;

          if (player && !player.isDead && !player.invincible) {
            isHurt = points <= player.hitPoints;
            diff = points - player.hitPoints;
            player.hitPoints = points;

            if (player.hitPoints <= 0) {
              player.die();
            }
            if (isHurt) {
              player.hurt();
              self.infoManager.addDamageInfo({ value: diff, x: player.x, y: player.y - 15, type: "received" });
              self.audioManager.playSound("hurt");
              self.storage.addDamage(-diff);
              self.tryUnlockingAchievement("MEATSHIELD");
              if (self.playerhurt_callback) {
                self.playerhurt_callback();
              }
            } else if (!isRegen) {
              self.infoManager.addDamageInfo({ value: "+" + diff, x: player.x, y: player.y - 15, type: "healed" });
            }
            self.updateBars();
          }
        });

        self.client.onPlayerChangeStats(function ({ maxHitPoints, damage, absorb }) {
          if (self.player.maxHitPoints !== maxHitPoints || self.player.invincible) {
            self.player.maxHitPoints = maxHitPoints;
            self.player.hitPoints = maxHitPoints;

            self.updateBars();
          }
          if (self.player.damage !== damage) {
            self.player.damage = damage;
            self.updateDamage();
          }
          if (self.player.absorb !== absorb) {
            self.player.absorb = absorb;
            self.updateAbsorb();
          }
        });

        self.client.onPlayerEquipItem(function (playerId, itemKind, itemLevel) {
          var player = self.getEntityById(playerId);
          var itemName = Types.getKindAsString(itemKind);

          if (player) {
            if (Types.isArmor(itemKind)) {
              player.setArmorLevel(itemLevel);
              player.setSprite(self.sprites[itemName]);
            } else if (Types.isWeapon(itemKind)) {
              player.setWeaponName(itemName);
              player.setWeaponLevel(itemLevel);
            }
          }
        });

        self.client.onPlayerTeleport(function (id, x, y) {
          var entity = null,
            currentOrientation;

          if (id !== self.playerId) {
            entity = self.getEntityById(id);

            if (entity) {
              currentOrientation = entity.orientation;

              self.makeCharacterTeleportTo(entity, x, y);
              entity.setOrientation(currentOrientation);

              entity.forEachAttacker(function (attacker) {
                attacker.disengage();
                attacker.idle();
                attacker.stop();
              });
            }
          }
        });

        self.client.onDropItem(function (item, mobId) {
          var pos = self.getDeadMobPosition(mobId);

          if (pos) {
            self.addItem(item, pos.x, pos.y);
            self.updateCursor();
          }
        });

        self.client.onChatMessage(function (entityId, name, message, type) {
          var entity = self.getEntityById(entityId);
          self.createBubble(entityId, message);
          self.assignBubbleTo(entity);
          self.audioManager.playSound("chat");
          self.chat_callback(entityId, name, message, type);
        });

        self.client.onPopulationChange(function (worldPlayers, totalPlayers, players, levelupPlayer) {
          if (self.nbplayers_callback) {
            self.nbplayers_callback(worldPlayers, totalPlayers, players);
          }
          if (levelupPlayer) {
            if (self.entities[levelupPlayer]) {
              self.entities[levelupPlayer].setLevelup();
            }

            if (levelupPlayer === self.playerId) {
              self.audioManager.playSound("levelup");
            }
          }
        });

        self.client.onGuildPopulation(function (guildName, guildPopulation) {
          if (self.nbguildplayers_callback) {
            self.nbguildplayers_callback(guildName, guildPopulation);
          }
        });

        self.client.onBossCheck(function (data) {
          const { status, message, hash, hash1, check } = data;

          if (status === "ok") {
            const position = parseInt(check[check.length - 1]);
            if (check[position] != position) {
              self.client.sendBanPlayer("Invalid check position");
            } else {
              let s = check;
              s = s.slice(0, position) + s.slice(position + 1, s.length - 1);
              s = parseInt(s);

              const now = Date.now();
              const absS = Math.abs(s - now);
              // 10s range
              // @TODO people getting banned here?
              // if (absS < 1000 * 10) {
              self.player.stop_pathing_callback({ x: 71, y: 21, confirmed: true });
              // } else {
              //   self.client.sendBanPlayer(`Invalid check time ${check}, ${s}, ${now}`);
              // }
            }
          } else if (status === "failed") {
            self.bosscheckfailed_callback(message);
          } else if (status === "completed") {
            self.gamecompleted_callback({ hash, hash1, fightAgain: true, show: true });
          }
        });

        self.client.onReceiveNotification(function (data) {
          const { message, hash, hash1 } = data;

          if (hash || hash1) {
            self.gamecompleted_callback({ hash, hash1 });
          }

          setTimeout(() => {
            self.showNotification(message, 30000);
          }, 250);
        });

        self.client.onReceiveInventory(function (data) {
          self.player.setInventory(data);
          self.updateInventory();
        });

        self.client.onReceiveStash(function (data) {
          self.player.setStash(data);
          self.updateStash();
        });

        self.client.onReceiveUpgrade(function (data, isLucky7) {
          self.isUpgradeItemSent = false;
          self.player.setUpgrade(data);
          self.updateUpgrade();

          if (isLucky7) {
            self.tryUnlockingAchievement("LUCKY7");
          }
        });

        self.client.onReceiveAnvilUpgrade(function (isSuccess) {
          if (isSuccess) {
            self.setAnvilSuccess();
          } else {
            self.setAnvilFail();
          }
        });

        self.client.onReceiveStoreItems(function (items) {
          self.store.addStoreItems(items);
        });

        self.client.onReceivePurchaseCompleted(function (payment) {
          if (payment.id === Types.Store.EXPANSION1) {
            self.player.expansion1 = true;
          }
          self.store.purchaseCompleted(payment);
        });

        self.client.onReceivePurchaseError(function (error) {
          self.store.purchaseError(error);
        });

        self.client.onReceiveWaypointsUpdate(function (waypoints) {
          self.player.waypoints = waypoints;
          self.initWaypoints(waypoints);
        });

        self.client.onDisconnected(function (message) {
          if (self.player) {
            self.player.die();
          }
          if (self.disconnect_callback) {
            self.disconnect_callback(message);
          }
        });

        self.gamestart_callback();

        if (self.hasNeverStarted) {
          self.start();
          started_callback({ success: true });
        }
      });
    },

    /**
     * Links two entities in an attacker<-->target relationship.
     * This is just a utility method to wrap a set of instructions.
     *
     * @param {Entity} attacker The attacker entity
     * @param {Entity} target The target entity
     */
    createAttackLink: function (attacker, target) {
      if (attacker.hasTarget()) {
        attacker.removeTarget();
      }
      attacker.engage(target);

      if (attacker.id !== this.playerId) {
        target.addAttacker(attacker);

        if (attacker.kind === Types.Entities.ZOMBIE && Object.keys(target.attackers).length >= 15) {
          this.tryUnlockingAchievement("TICKLE_FROM_UNDER");
        }
      }
    },

    /**
     * Converts the current mouse position on the screen to world grid coordinates.
     * @returns {Object} An object containing x and y properties.
     */
    getMouseGridPosition: function () {
      var mx = this.mouse.x,
        my = this.mouse.y,
        c = this.renderer.camera,
        s = this.renderer.scale,
        ts = this.renderer.tilesize,
        offsetX = mx % (ts * s),
        offsetY = my % (ts * s),
        x = (mx - offsetX) / (ts * s) + c.gridX,
        y = (my - offsetY) / (ts * s) + c.gridY;

      return { x: x, y: y };
    },

    /**
     * Moves a character to a given location on the world grid.
     *
     * @param {Number} x The x coordinate of the target location.
     * @param {Number} y The y coordinate of the target location.
     */
    makeCharacterGoTo: function (character, x, y) {
      if (!this.map.isOutOfBounds(x, y)) {
        character.go(x, y);
      }
    },

    /**
     *
     */
    makeCharacterTeleportTo: function (character, x, y) {
      if (!this.map.isOutOfBounds(x, y)) {
        this.unregisterEntityPosition(character);

        character.setGridPosition(x, y);

        this.registerEntityPosition(character);
        this.assignBubbleTo(character);
      } else {
        log.debug("Teleport out of bounds: " + x + ", " + y);
      }
    },

    /**
     *
     */
    makePlayerAttackNext: function () {
      pos = {
        x: this.player.gridX,
        y: this.player.gridY,
      };
      switch (this.player.orientation) {
        case Types.Orientations.DOWN:
          pos.y += 1;
          this.makePlayerAttackTo(pos);
          break;
        case Types.Orientations.UP:
          pos.y -= 1;
          this.makePlayerAttackTo(pos);
          break;
        case Types.Orientations.LEFT:
          pos.x -= 1;
          this.makePlayerAttackTo(pos);
          break;
        case Types.Orientations.RIGHT:
          pos.x += 1;
          this.makePlayerAttackTo(pos);
          break;

        default:
          break;
      }
    },

    /**
     *
     */
    makePlayerAttackTo: function (pos) {
      entity = this.getEntityAt(pos.x, pos.y);
      if (entity instanceof Mob) {
        this.makePlayerAttack(entity);
      }
    },

    /**
     * Moves the current player to a given target location.
     * @see makeCharacterGoTo
     */
    makePlayerGoTo: function (x, y) {
      this.makeCharacterGoTo(this.player, x, y);
    },

    /**
     * Moves the current player towards a specific item.
     * @see makeCharacterGoTo
     */
    makePlayerGoToItem: function (item) {
      if (item) {
        this.player.isLootMoving = true;
        this.makePlayerGoTo(item.gridX, item.gridY);
        this.client.sendLootMove(item, item.gridX, item.gridY);
      }
    },

    /**
     *
     */
    makePlayerTalkTo: function (npc) {
      if (npc) {
        this.player.setTarget(npc);
        this.player.follow(npc);
      }
    },

    makePlayerOpenChest: function (chest) {
      if (chest) {
        this.player.setTarget(chest);
        this.player.follow(chest);
      }
    },

    /**
     *
     */
    makePlayerAttack: function (mob) {
      this.createAttackLink(this.player, mob);
      this.client.sendAttack(mob);
    },

    setAnvilSuccess: function () {
      this.isAnvilFail = false;
      this.isAnvilSuccess = true;
      clearTimeout(this.anvilFailTimeout);
      clearTimeout(this.anvilSuccessTimeout);
      this.anvilSuccessTimeout = setTimeout(() => {
        this.isAnvilSuccess = false;
      }, 3000);
    },

    setAnvilFail: function () {
      this.isAnvilFail = true;
      this.isAnvilSuccess = false;
      clearTimeout(this.anvilFailTimeout);
      clearTimeout(this.anvilSuccessTimeout);
      this.anvilFailTimeout = setTimeout(() => {
        this.isAnvilFail = false;
      }, 3000);
    },

    /**
     *
     */
    makeNpcTalk: function (npc) {
      var msg;

      if (npc) {
        msg = npc.talk(this);
        this.previousClickPosition = {};
        if (msg) {
          this.createBubble(npc.id, msg);
          this.assignBubbleTo(npc);
          this.audioManager.playSound("npc");
        } else {
          this.destroyBubble(npc.id);
          this.audioManager.playSound("npc-end");
        }
        this.tryUnlockingAchievement("SMALL_TALK");

        if (npc.kind === Types.Entities.NYAN) {
          this.tryUnlockingAchievement("NYAN");
        } else if (npc.kind === Types.Entities.RICK) {
          this.tryUnlockingAchievement("RICKROLLD");
        } else if (npc.kind === Types.Entities.ANVIL) {
          this.app.openUpgrade();
        } else if (npc.kind === Types.Entities.SORCERER) {
          this.store.openStore();
        } else if (npc.kind === Types.Entities.STASH) {
          this.app.openStash();
        } else if (npc.kind === Types.Entities.WAYPOINTX || npc.kind === Types.Entities.WAYPOINTN) {
          const activeWaypoint = this.getWaypointFromGrid(npc.gridX, npc.gridY);
          this.app.openWaypoint(activeWaypoint);

          // Send enable request for disabled waypoint
          if (activeWaypoint && this.player.waypoints[activeWaypoint.id - 1] === 0) {
            this.player.waypoints[activeWaypoint.id - 1] = 1;
            this.activateWaypoint(activeWaypoint.id);
            this.client.sendWaypoint(activeWaypoint.id);
          }
        } else if (npc.kind === Types.Entities.SATOSHI) {
          this.tryUnlockingAchievement("SATOSHI");
        }
      }
    },

    getWaypointFromGrid: function (x, y) {
      return Types.waypoints.find(({ gridX, gridY }) => gridX === x && gridY === y);
    },

    /**
     * Loops through all the entities currently present in the game.
     * @param {Function} callback The function to call back (must accept one entity argument).
     */
    forEachEntity: function (callback) {
      _.each(this.entities, function (entity) {
        callback(entity);
      });
    },

    /**
     * Same as forEachEntity but only for instances of the Mob subclass.
     * @see forEachEntity
     */
    forEachMob: function (callback) {
      _.each(this.entities, function (entity) {
        if (entity instanceof Mob) {
          callback(entity);
        }
      });
    },

    /**
     * Loops through all entities visible by the camera and sorted by depth :
     * Lower 'y' value means higher depth.
     * Note: This is used by the Renderer to know in which order to render entities.
     */
    forEachVisibleEntityByDepth: function (callback) {
      var self = this,
        m = this.map;

      this.camera.forEachVisiblePosition(
        function (x, y) {
          if (!m.isOutOfBounds(x, y)) {
            if (self.renderingGrid[y][x]) {
              _.each(self.renderingGrid[y][x], function (entity) {
                callback(entity);
              });
            }
          }
        },
        this.renderer.mobile ? 0 : 2,
      );
    },

    /**
     *
     */
    forEachVisibleTileIndex: function (callback, extra) {
      var m = this.map;

      this.camera.forEachVisiblePosition(function (x, y) {
        if (!m.isOutOfBounds(x, y)) {
          callback(m.GridPositionToTileIndex(x, y) - 1);
        }
      }, extra);
    },

    /**
     *
     */
    forEachVisibleTile: function (callback, extra) {
      var self = this,
        m = this.map;

      if (m.isLoaded) {
        this.forEachVisibleTileIndex(function (tileIndex) {
          if (_.isArray(m.data[tileIndex])) {
            _.each(m.data[tileIndex], function (id) {
              callback(id - 1, tileIndex);
            });
          } else {
            if (_.isNaN(m.data[tileIndex] - 1)) {
              //throw Error("Tile number for index:"+tileIndex+" is NaN");
            } else {
              callback(m.data[tileIndex] - 1, tileIndex);
            }
          }
        }, extra);
      }
    },

    /**
     *
     */
    forEachAnimatedTile: function (callback) {
      if (this.animatedTiles) {
        _.each(this.animatedTiles, function (tile) {
          callback(tile);
        });
      }
    },

    /**
     * Returns the entity located at the given position on the world grid.
     * @returns {Entity} the entity located at (x, y) or null if there is none.
     */
    getEntityAt: function (x, y) {
      if (this.map.isOutOfBounds(x, y) || !this.entityGrid) {
        return null;
      }

      var entities = this.entityGrid[y][x],
        entity = null;
      if (_.size(entities) > 0) {
        entity = entities[_.keys(entities)[0]];
      } else {
        entity = this.getItemAt(x, y);
      }
      return entity;
    },

    getMobAt: function (x, y) {
      var entity = this.getEntityAt(x, y);
      if (entity && entity instanceof Mob) {
        return entity;
      }
      return null;
    },

    getPlayerAt: function (x, y) {
      var entity = this.getEntityAt(x, y);
      if (entity && entity instanceof Player && entity !== this.player && this.player.pvpFlag) {
        return entity;
      }
      return null;
    },

    getNpcAt: function (x, y) {
      var entity = this.getEntityAt(x, y);
      if (entity && entity instanceof Npc) {
        return entity;
      }
      return null;
    },

    getChestAt: function (x, y) {
      var entity = this.getEntityAt(x, y);
      if (entity && entity instanceof Chest) {
        return entity;
      }
      return null;
    },

    getItemAt: function (x, y) {
      if (this.map.isOutOfBounds(x, y) || !this.itemGrid) {
        return null;
      }
      var items = this.itemGrid[y][x],
        item = null;

      if (_.size(items) > 0) {
        // If there are potions/burgers stacked with equipment items on the same tile, always get expendable items first.
        _.each(items, function (i) {
          if (Types.isExpendableItem(i.kind)) {
            item = i;
          }
        });

        // Else, get the first item of the stack
        if (!item) {
          item = items[_.keys(items)[0]];
        }
      }
      return item;
    },

    /**
     * Returns true if an entity is located at the given position on the world grid.
     * @returns {Boolean} Whether an entity is at (x, y).
     */
    isEntityAt: function (x, y) {
      return !_.isNull(this.getEntityAt(x, y));
    },

    isMobAt: function (x, y) {
      return !_.isNull(this.getMobAt(x, y));
    },
    isPlayerAt: function (x, y) {
      return !_.isNull(this.getPlayerAt(x, y));
    },

    isItemAt: function (x, y) {
      return !_.isNull(this.getItemAt(x, y));
    },

    isNpcAt: function (x, y) {
      return !_.isNull(this.getNpcAt(x, y));
    },

    isChestAt: function (x, y) {
      return !_.isNull(this.getChestAt(x, y));
    },

    /**
     * Finds a path to a grid position for the specified character.
     * The path will pass through any entity present in the ignore list.
     */
    findPath: function (character, x, y, ignoreList) {
      var self = this,
        grid = this.pathingGrid,
        path = [],
        isPlayer = character === this.player;

      if (this.map.isColliding(x, y)) {
        return path;
      }

      if (this.pathfinder && character) {
        if (ignoreList) {
          _.each(ignoreList, function (entity) {
            self.pathfinder.ignoreEntity(entity);
          });
        }

        path = this.pathfinder.findPath(grid, character, x, y, false);

        if (ignoreList) {
          this.pathfinder.clearIgnoreList();
        }
      } else {
        log.error("Error while finding the path to " + x + ", " + y + " for " + character.id);
      }
      return path;
    },

    /**
     * Toggles the visibility of the pathing grid for debugging purposes.
     */
    togglePathingGrid: function () {
      if (this.debugPathing) {
        this.debugPathing = false;
      } else {
        this.debugPathing = true;
      }
    },

    /**
     * Toggles the visibility of the FPS counter and other debugging info.
     */
    toggleDebugInfo: function () {
      if (this.renderer && this.renderer.isDebugInfoVisible) {
        this.renderer.isDebugInfoVisible = false;
      } else {
        this.renderer.isDebugInfoVisible = true;
      }
    },

    /**
     *
     */
    movecursor: function () {
      var mouse = this.getMouseGridPosition(),
        x = mouse.x,
        y = mouse.y;

      this.cursorVisible = true;

      if (this.player && !this.renderer.mobile && !this.renderer.tablet) {
        this.hoveringCollidingTile = this.map.isColliding(x, y);
        this.hoveringPlateauTile = this.player.isOnPlateau ? !this.map.isPlateau(x, y) : this.map.isPlateau(x, y);
        this.hoveringMob = this.isMobAt(x, y);
        this.hoveringPlayer = this.isPlayerAt(x, y);
        this.hoveringItem = this.isItemAt(x, y);
        this.hoveringNpc = this.isNpcAt(x, y);
        this.hoveringOtherPlayer = this.isPlayerAt(x, y);
        this.hoveringChest = this.isChestAt(x, y);

        if (
          this.hoveringMob ||
          this.hoveringPlayer ||
          this.hoveringNpc ||
          this.hoveringChest ||
          this.hoveringOtherPlayer
        ) {
          var entity = this.getEntityAt(x, y);

          this.player.showTarget(entity);
          // supportsSilhouettes hides the players (render bug I'd guess)
          if (!entity.isHighlighted && this.renderer.supportsSilhouettes && !this.hoveringPlayer) {
            if (this.lastHovered) {
              this.lastHovered.setHighlight(false);
            }
            entity.setHighlight(true);
          }
          this.lastHovered = entity;
        } else if (this.lastHovered) {
          this.lastHovered.setHighlight(null);
          if (this.timeout === undefined && !this.player.hasTarget()) {
            var self = this;
            this.timeout = setTimeout(function () {
              $("#inspector").fadeOut("fast");
              $("#inspector .health").text("");
              self.player.inspecting = null;
            }, 2000);
            this.timeout = undefined;
          }
          this.lastHovered = null;
        }
      }
    },

    /**
     * Moves the player one space, if possible
     */
    keys: function (pos, orientation) {
      this.hoveringCollidingTile = false;
      this.hoveringPlateauTile = false;

      if ((pos.x === this.previousClickPosition.x && pos.y === this.previousClickPosition.y) || this.isZoning()) {
        return;
      } else {
        if (!this.player.disableKeyboardNpcTalk) this.previousClickPosition = pos;
      }

      if (!this.player.isMoving()) {
        this.cursorVisible = false;
        this.processInput(pos);
      }
    },

    click: function () {
      var pos = this.getMouseGridPosition();

      if (pos.x === this.previousClickPosition.x && pos.y === this.previousClickPosition.y) {
        return;
      } else {
        this.previousClickPosition = pos;
      }

      this.processInput(pos);
    },

    isCharacterZoning: false,

    /**
     * Processes game logic when the user triggers a click/touch event during the game.
     */
    processInput: function (pos) {
      var entity;

      if (
        this.started &&
        this.player &&
        !this.isZoning() &&
        !this.isZoningTile(this.player.nextGridX, this.player.nextGridY) &&
        !this.player.isDead &&
        !this.hoveringCollidingTile &&
        !this.hoveringPlateauTile
      ) {
        entity = this.getEntityAt(pos.x, pos.y);

        if (
          entity instanceof Mob ||
          (entity instanceof Player && entity !== this.player && this.player.pvpFlag && this.pvpFlag)
        ) {
          this.makePlayerAttack(entity);
        } else if (entity instanceof Item) {
          this.makePlayerGoToItem(entity);
        } else if (entity instanceof Npc) {
          if (this.player.isAdjacentNonDiagonal(entity) === false) {
            this.makePlayerTalkTo(entity);
          } else {
            if (!this.player.disableKeyboardNpcTalk) {
              this.makeNpcTalk(entity);

              if (this.player.moveUp || this.player.moveDown || this.player.moveLeft || this.player.moveRight)
                this.player.disableKeyboardNpcTalk = true;
            }
          }
        } else if (entity instanceof Chest) {
          this.makePlayerOpenChest(entity);
        } else {
          this.makePlayerGoTo(pos.x, pos.y);
        }
      }
    },

    isMobOnSameTile: function (mob, x, y) {
      var X = x || mob.gridX,
        Y = y || mob.gridY,
        list = this.entityGrid[Y][X],
        result = false;

      _.each(list, function (entity) {
        if (entity instanceof Mob && entity.id !== mob.id) {
          result = true;
        }
      });
      return result;
    },

    getFreeAdjacentNonDiagonalPosition: function (entity) {
      var self = this,
        result = null;

      entity.forEachAdjacentNonDiagonalPosition(function (x, y, orientation) {
        if (!result && !self.map.isColliding(x, y) && !self.isMobAt(x, y)) {
          result = { x: x, y: y, o: orientation };
        }
      });
      return result;
    },

    tryMovingToADifferentTile: function (character) {
      var attacker = character,
        target = character.target;

      if (attacker && target && target instanceof Player) {
        if (!target.isMoving() && attacker.getDistanceToEntity(target) === 0) {
          var pos;

          switch (target.orientation) {
            case Types.Orientations.UP:
              pos = {
                x: target.gridX,
                y: target.gridY - 1,
                o: target.orientation,
              };
              break;
            case Types.Orientations.DOWN:
              pos = {
                x: target.gridX,
                y: target.gridY + 1,
                o: target.orientation,
              };
              break;
            case Types.Orientations.LEFT:
              pos = {
                x: target.gridX - 1,
                y: target.gridY,
                o: target.orientation,
              };
              break;
            case Types.Orientations.RIGHT:
              pos = {
                x: target.gridX + 1,
                y: target.gridY,
                o: target.orientation,
              };
              break;
          }

          if (pos) {
            // @TODO Disengage attacker?

            attacker.previousTarget = target;
            attacker.disengage();
            attacker.idle();
            this.makeCharacterGoTo(attacker, pos.x, pos.y);
            target.adjacentTiles[pos.o] = true;

            return true;
          }
        }

        if (!target.isMoving() && attacker.isAdjacentNonDiagonal(target) && this.isMobOnSameTile(attacker)) {
          var pos = this.getFreeAdjacentNonDiagonalPosition(target);
          // avoid stacking mobs on the same tile next to a player
          // by making them go to adjacent tiles if they are available
          if (pos && !target.adjacentTiles[pos.o]) {
            if (this.player.target && attacker.id === this.player.target.id) {
              return false; // never unstack the player's target
            }

            attacker.previousTarget = target;
            attacker.disengage();
            attacker.idle();
            this.makeCharacterGoTo(attacker, pos.x, pos.y);
            target.adjacentTiles[pos.o] = true;

            return true;
          }
        }
      }
      return false;
    },

    /**
     *
     */
    onCharacterUpdate: function (character) {
      var time = this.currentTime,
        self = this;

      // If mob has finished moving to a different tile in order to avoid stacking, attack again from the new position.
      if (character.previousTarget && !character.isMoving() && character instanceof Mob) {
        var t = character.previousTarget;

        if (this.getEntityById(t.id)) {
          // does it still exist?
          character.previousTarget = null;
          this.createAttackLink(character, t);
          return;
        }
      }

      if (character.isAttacking() && (!character.previousTarget || character.id === this.playerId)) {
        if (character.kind === Types.Entities.NECROMANCER) {
          if (character.isRaising()) {
            if (character.canRaise(time)) {
              character.stop();
              character.raise();
            }
            return;
          }
        }

        var isMoving = this.tryMovingToADifferentTile(character); // Don't let multiple mobs stack on the same tile when attacking a player.
        if (character.canAttack(time)) {
          if (!isMoving) {
            // don't hit target if moving to a different tile.
            if (character.hasTarget() && character.getOrientationTo(character.target) !== character.orientation) {
              character.lookAtTarget();
            }

            character.hit();

            if (character.id === this.playerId) {
              this.client.sendHit(character.target);
            }

            if (character instanceof Player && this.camera.isVisible(character)) {
              this.audioManager.playSound("hit" + Math.floor(Math.random() * 2 + 1));
            }

            if (
              character.hasTarget() &&
              character.target.id === this.playerId &&
              this.player &&
              !this.player.invincible
            ) {
              this.client.sendHurt(character);
            }
          }
        } else {
          if (
            character.hasTarget() &&
            character.isDiagonallyAdjacent(character.target) &&
            character.target instanceof Player &&
            !character.target.isMoving()
          ) {
            character.follow(character.target);
          }
        }
      }
    },

    /**
     *
     */
    isZoningTile: function (x, y) {
      var c = this.camera;

      x = x - c.gridX;
      y = y - c.gridY;

      if (x === 0 || y === 0 || x === c.gridW - 1 || y === c.gridH - 1) {
        return true;
      }
      return false;
    },

    /**
     *
     */
    getZoningOrientation: function (x, y) {
      var orientation = "",
        c = this.camera;

      x = x - c.gridX;
      y = y - c.gridY;

      if (x === 0) {
        orientation = Types.Orientations.LEFT;
      } else if (y === 0) {
        orientation = Types.Orientations.UP;
      } else if (x === c.gridW - 1) {
        orientation = Types.Orientations.RIGHT;
      } else if (y === c.gridH - 1) {
        orientation = Types.Orientations.DOWN;
      }

      return orientation;
    },

    startZoningFrom: function (x, y) {
      this.zoningOrientation = this.getZoningOrientation(x, y);

      if (this.renderer.mobile || this.renderer.tablet) {
        var z = this.zoningOrientation,
          c = this.camera,
          ts = this.renderer.tilesize,
          x = c.x,
          y = c.y,
          xoffset = (c.gridW - 2) * ts,
          yoffset = (c.gridH - 2) * ts;

        if (z === Types.Orientations.LEFT || z === Types.Orientations.RIGHT) {
          x = z === Types.Orientations.LEFT ? c.x - xoffset : c.x + xoffset;
        } else if (z === Types.Orientations.UP || z === Types.Orientations.DOWN) {
          y = z === Types.Orientations.UP ? c.y - yoffset : c.y + yoffset;
        }
        c.setPosition(x, y);

        this.renderer.clearScreen(this.renderer.context);
        this.endZoning();

        // Force immediate drawing of all visible entities in the new zone
        this.forEachVisibleEntityByDepth(function (entity) {
          entity.setDirty();
        });
      } else {
        this.currentZoning = new Transition();
      }
      this.bubbleManager.clean();
      this.client.sendZone();
    },

    enqueueZoningFrom: function (x, y) {
      this.zoningQueue.push({ x: x, y: y });

      if (this.zoningQueue.length === 1) {
        this.startZoningFrom(x, y);
      }
    },

    endZoning: function () {
      this.currentZoning = null;
      this.isCharacterZoning = false;
      this.resetZone();
      this.zoningQueue.shift();

      if (this.zoningQueue.length > 0) {
        var pos = this.zoningQueue[0];
        this.startZoningFrom(pos.x, pos.y);
      }
    },

    isZoning: function () {
      return !_.isNull(this.currentZoning) || this.isCharacterZoning;
    },

    resetZone: function () {
      this.bubbleManager.clean();
      this.initAnimatedTiles();
      this.renderer.renderStaticCanvases();
    },

    resetCamera: function () {
      this.camera.focusEntity(this.player);
      this.resetZone();
    },

    say: function (message) {
      //#cli guilds
      var regexp = /^\/guild\ (invite|create|accept)\s+([^\s]*)|(guild:)\s*(.*)$|^\/guild\ (leave)$/i;
      var args = message.match(regexp);
      if (args != undefined) {
        switch (args[1]) {
          case "invite":
            if (this.player.hasGuild()) {
              this.client.sendGuildInvite(args[2]);
            } else {
              this.showNotification("Invite " + args[2] + " to where?");
            }
            break;
          case "create":
            this.client.sendNewGuild(args[2]);
            break;
          case undefined:
            if (args[5] === "leave") {
              this.client.sendLeaveGuild();
            } else if (this.player.hasGuild()) {
              this.client.talkToGuild(args[4]);
            } else {
              this.showNotification("You got no-one to talk to…");
            }
            break;
          case "accept":
            var status;
            if (args[2] === "yes") {
              status = this.player.checkInvite();
              if (status === false) {
                this.showNotification("You were not invited anyway…");
              } else if (status < 0) {
                this.showNotification("Sorry to say it's too late…");
                setTimeout(function () {
                  self.showNotification("Find someone and ask for another invite.");
                }, 2500);
              } else {
                this.client.sendGuildInviteReply(this.player.invite.guildId, true);
              }
            } else if (args[2] === "no") {
              status = this.player.checkInvite();
              if (status !== false) {
                this.client.sendGuildInviteReply(this.player.invite.guildId, false);
                this.player.deleteInvite();
              } else {
                this.showNotification("Whatever…");
              }
            } else {
              this.showNotification("“guild accept” is a YES or NO question!!");
            }
            break;
        }
      }
      this.client.sendChat(message);
    },

    createBubble: function (id, message) {
      this.bubbleManager.create(id, message, this.currentTime);
    },

    destroyBubble: function (id) {
      this.bubbleManager.destroyBubble(id);
    },

    assignBubbleTo: function (character) {
      var bubble = this.bubbleManager.getBubbleById(character.id);

      if (bubble) {
        var s = this.renderer.scale,
          t = 16 * s, // tile size
          x = (character.x - this.camera.x) * s,
          w = parseInt(bubble.element.css("width")) + 24,
          offset = w / 2 - t / 2,
          offsetY,
          y;

        if (character instanceof Npc) {
          offsetY = 0;
        } else {
          if (s === 2) {
            if (this.renderer.mobile) {
              offsetY = 0;
            } else {
              offsetY = 15;
            }
          } else {
            offsetY = 12;
          }
        }

        y = (character.y - this.camera.y) * s - t * 2 - offsetY;

        bubble.element.css("left", x - offset + "px");
        bubble.element.css("top", y + "px");
      }
    },

    respawn: function () {
      log.debug("Beginning respawn");

      this.entities = {};
      this.initEntityGrid();
      this.initPathingGrid();
      this.initRenderingGrid();

      this.player = new Warrior("player", this.username);
      this.player.account = this.useraccount;
      this.initPlayer();
      this.app.initTargetHud();

      this.started = true;
      this.client.enable();
      this.client.sendLogin(this.player);

      this.storage.incrementRevives();

      if (this.renderer.mobile || this.renderer.tablet) {
        this.renderer.clearScreen(this.renderer.context);
      }

      log.debug("Finished respawn");
    },

    onGameStart: function (callback) {
      this.gamestart_callback = callback;
    },

    onDisconnect: function (callback) {
      this.disconnect_callback = callback;
    },

    onPlayerDeath: function (callback) {
      this.playerdeath_callback = callback;
    },

    onGameCompleted: function (callback) {
      this.gamecompleted_callback = callback;
    },

    onBossCheckFailed: function (callback) {
      this.bosscheckfailed_callback = callback;
    },

    onUpdateTarget: function (callback) {
      this.updatetarget_callback = callback;
    },
    onPlayerExpChange: function (callback) {
      this.playerexp_callback = callback;
    },

    onPlayerHealthChange: function (callback) {
      this.playerhp_callback = callback;
    },

    onPlayerHurt: function (callback) {
      this.playerhurt_callback = callback;
    },

    onPlayerEquipmentChange: function (callback) {
      this.equipment_callback = callback;
    },

    onNbPlayersChange: function (callback) {
      this.nbplayers_callback = callback;
    },

    onChatMessage: function (callback) {
      this.chat_callback = callback;
    },

    onGuildPopulationChange: function (callback) {
      this.nbguildplayers_callback = callback;
    },

    onNotification: function (callback) {
      this.notification_callback = callback;
    },

    onPlayerInvincible: function (callback) {
      this.invincible_callback = callback;
    },

    resize: function () {
      var x = this.camera.x;
      var y = this.camera.y;
      var currentScale = this.renderer.scale;
      var newScale = this.renderer.getScaleFactor();

      this.renderer.rescale(newScale);
      this.camera = this.renderer.camera;
      this.camera.setPosition(x, y);

      this.renderer.renderStaticCanvases();
    },

    updateBars: function () {
      if (this.player && this.playerhp_callback) {
        this.playerhp_callback(this.player.hitPoints, this.player.maxHitPoints);
        $("#player-hp").text(this.player.maxHitPoints);
      }
    },
    updateDamage: function () {
      $("#player-damage").text(this.player.damage);
    },
    updateAbsorb: function () {
      $("#player-absorb").text(this.player.absorb);
    },
    updateExpBar: function () {
      if (this.player && this.playerexp_callback) {
        var expInThisLevel = this.player.experience - Types.expForLevel[this.player.level - 1];
        var expForLevelUp = Types.expForLevel[this.player.level] - Types.expForLevel[this.player.level - 1];
        this.playerexp_callback(expInThisLevel, expForLevelUp);

        $("#player-level").text(this.player.level);
      }
    },
    updateTarget: function (targetId, points, healthPoints, maxHp) {
      if (this.player.hasTarget() && this.updatetarget_callback) {
        var target = this.getEntityById(targetId);
        target.name = Types.getKindAsString(target.kind);
        target.points = points;
        target.healthPoints = healthPoints;
        target.maxHp = maxHp;
        this.updatetarget_callback(target);
      }
    },

    getDeadMobPosition: function (mobId) {
      var position;

      if (mobId in this.deathpositions) {
        position = this.deathpositions[mobId];
        delete this.deathpositions[mobId];
      }

      return position;
    },

    onAchievementUnlock: function (callback) {
      this.unlock_callback = callback;
    },

    tryUnlockingAchievement: function (name) {
      var achievement = null;
      var self = this;

      return new Promise(resolve => {
        if (name in this.achievements) {
          achievement = this.achievements[name];

          if (achievement.isCompleted() && self.storage.unlockAchievement(achievement.id)) {
            if (self.unlock_callback) {
              self.client.sendAchievement(achievement.id);
              self.unlock_callback(achievement.id, achievement.name, achievement.nano);
              self.audioManager.playSound("achievement");
              resolve();
            }
          }
        }
      });
    },

    showNotification: function (message, timeout) {
      if (this.notification_callback) {
        this.notification_callback(message, timeout);
      }
    },

    removeObsoleteEntities: function () {
      var nb = _.size(this.obsoleteEntities),
        self = this;

      if (nb > 0) {
        _.each(this.obsoleteEntities, function (entity) {
          if (entity.id != self.player.id) {
            // never remove yourself
            self.removeEntity(entity);
          }
        });
        log.debug(
          "Removed " +
            nb +
            " entities: " +
            _.map(
              _.reject(this.obsoleteEntities, function (id) {
                return id === self.player.id;
              }),
              "id",
            ),
        );
        this.obsoleteEntities = null;
      }
    },

    /**
     * Fake a mouse move event in order to update the cursor.
     *
     * For instance, to get rid of the sword cursor in case the mouse is still hovering over a dying mob.
     * Also useful when the mouse is hovering a tile where an item is appearing.
     */
    updateCursor: function () {
      if (!this.cursorVisible) var keepCursorHidden = true;

      this.movecursor();
      this.updateCursorLogic();

      if (keepCursorHidden) this.cursorVisible = false;
    },

    /**
     * Change player plateau mode when necessary
     */
    updatePlateauMode: function () {
      if (this.map.isPlateau(this.player.gridX, this.player.gridY)) {
        this.player.isOnPlateau = true;
      } else {
        this.player.isOnPlateau = false;
      }
    },

    updatePlayerCheckpoint: function () {
      var checkpoint = this.map.getCurrentCheckpoint(this.player);

      if (checkpoint) {
        var lastCheckpoint = this.player.lastCheckpoint;
        if (!lastCheckpoint || (lastCheckpoint && lastCheckpoint.id !== checkpoint.id)) {
          this.player.lastCheckpoint = checkpoint;
          this.client.sendCheck(checkpoint.id);
        }
      }
    },

    checkUndergroundAchievement: function () {
      var music = this.audioManager.getSurroundingMusic(this.player);

      if (music) {
        if (music.name === "cave") {
          this.tryUnlockingAchievement("UNDERGROUND");
        }
      }
    },

    makeAttackerFollow: function (attacker) {
      var target = attacker.target;

      if (attacker.isAdjacent(attacker.target)) {
        attacker.lookAtTarget();
      } else {
        attacker.follow(target);
      }
    },

    forEachEntityAround: function (x, y, r, callback) {
      for (var i = x - r, max_i = x + r; i <= max_i; i += 1) {
        for (var j = y - r, max_j = y + r; j <= max_j; j += 1) {
          if (!this.map.isOutOfBounds(i, j)) {
            _.each(this.renderingGrid[j][i], function (entity) {
              callback(entity);
            });
          }
        }
      }
    },

    checkOtherDirtyRects: function (r1, source, x, y) {
      var r = this.renderer;

      this.forEachEntityAround(x, y, 2, function (e2) {
        if (source && source.id && e2.id === source.id) {
          return;
        }
        if (!e2.isDirty) {
          var r2 = r.getEntityBoundingRect(e2);
          if (r.isIntersecting(r1, r2)) {
            e2.setDirty();
          }
        }
      });

      if (source && !source.hasOwnProperty("index")) {
        this.forEachAnimatedTile(function (tile) {
          if (!tile.isDirty) {
            var r2 = r.getTileBoundingRect(tile);
            if (r.isIntersecting(r1, r2)) {
              tile.isDirty = true;
            }
          }
        });
      }

      if (!this.drawTarget && this.selectedCellVisible) {
        var targetRect = r.getTargetBoundingRect();
        if (r.isIntersecting(r1, targetRect)) {
          this.drawTarget = true;
          this.renderer.targetRect = targetRect;
        }
      }
    },

    tryLootingItem: function (item) {
      try {
        this.player.loot(item);
        this.client.sendLoot(item); // Notify the server that this item has been looted
        this.removeItem(item);
        this.showNotification(item.getLootMessage());

        if (item.type === "armor") {
          this.tryUnlockingAchievement("FAT_LOOT");
        } else if (item.type === "weapon") {
          this.tryUnlockingAchievement("A_TRUE_WARRIOR");
        } else if (item.kind === Types.Entities.CAKE) {
          this.tryUnlockingAchievement("FOR_SCIENCE");
        } else if (item.kind === Types.Entities.FIREPOTION) {
          this.tryUnlockingAchievement("FOXY");
          this.audioManager.playSound("firefox");
        } else if (item.kind === Types.Entities.NANOPOTION) {
          this.app.updateNanoPotions(this.player.nanoPotions);
          if (this.player.nanoPotions >= 5) {
            this.tryUnlockingAchievement("NANO_POTIONS");
          }
        } else if (Types.Entities.Gems.includes(item.kind)) {
          this.app.updateGems(this.player.gems);
          if (!this.player.gems.some(found => !found)) {
            this.tryUnlockingAchievement("GEM_HUNTER");
          }
        } else if (Types.Entities.Artifact.includes(item.kind)) {
          this.app.updateArtifact(this.player.artifact);
          if (!this.player.artifact.some(found => !found)) {
            this.tryUnlockingAchievement("INDIANA_JONES");
          }
        } else if (item.kind === Types.Entities.SKELETONKEY) {
          this.tryUnlockingAchievement("SKELETON_KEY");
          this.player.skeletonKey = true;
        }

        if (Types.isHealingItem(item.kind)) {
          this.audioManager.playSound("heal");
        } else {
          this.audioManager.playSound("loot");
        }

        if (item.wasDropped && !_(item.playersInvolved).includes(this.playerId)) {
          this.tryUnlockingAchievement("NINJA_LOOT");
        }
      } catch (err) {
        if (err instanceof Exceptions.LootException) {
          this.showNotification(err.message);
          this.audioManager.playSound("noloot");
        } else {
          throw err;
        }
      }
    },
  });

  return Game;
});
