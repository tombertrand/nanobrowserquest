/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-shadow */
import * as _ from "lodash";

import { kinds, Types } from "../../shared/js/gametypes";
import Animation from "./animation";
import AudioManager from "./audio";
import BubbleManager from "./bubble";
import Character from "./character";
import Chest from "./chest";
import Entity from "./entity";
import EntityFactory from "./entityfactory";
import Exceptions from "./exceptions";
import GameClient from "./gameclient";
import InfoManager from "./infomanager";
import Item from "./item";
import Map from "./map";
import Mob from "./mob";
import Mobs from "./mobs";
import Npc from "./npc";
import Pathfinder from "./pathfinder";
import Player from "./player";
import Renderer from "./renderer";
import Sprite from "./sprite";
import AnimatedTile from "./tile";
import Transition from "./transition";
import { App as AppType } from "./types/app";
import Updater from "./updater";
import { randomRange } from "./utils";
import Warrior from "./warrior";

import type { ChatType } from "../../server/js/types";

class Game {
  app: AppType;
  ready: boolean;
  started: boolean;
  hasNeverStarted: boolean;
  isUpgradeItemSent: boolean;
  isAnvilSuccess: boolean;
  anvilSuccessTimeout: any;
  anvilRecipeTimeout: any;
  isAnvilFail: boolean;
  anvilFailTimeout: any;
  cowPortalStart: boolean;
  cowLevelPortalCoords: { x: number; y: number } | null;
  minotaurPortalStart: boolean;
  minotaurLevelPortalCoords: { x: number; y: number };
  renderer: Renderer;
  updater: Updater;
  pathfinder: Pathfinder;
  chatinput: null;
  bubbleManager: BubbleManager;
  audioManager: AudioManager;
  player: Warrior;
  entities: {};
  deathpositions: {};
  entityGrid: any;
  pathingGrid: any;
  renderingGrid: any;
  itemGrid: any;
  currentCursor: null;
  mouse: { x: number; y: number };
  zoningQueue: any[];
  previousClickPosition: { x: number; y: number };
  cursorVisible: boolean;
  selectedX: number;
  selectedY: number;
  selectedCellVisible: boolean;
  targetColor: string;
  targetCellVisible: boolean;
  hoveringTarget: boolean;
  hoveringPlayer: boolean;
  hoveringMob: boolean;
  hoveringItem: boolean;
  hoveringCollidingTile: boolean;
  infoManager: InfoManager;
  currentZoning: Transition | null;
  cursors: {};
  sprites: {};
  currentTime: any;
  animatedTiles: any;
  debugPathing: boolean;
  pvpFlag: boolean;
  spriteNames: string[];
  storage: any;
  store: any;
  map: Map;
  shadows: any;
  targetAnimation: Animation;
  sparksAnimation: Animation;
  levelupAnimation: Animation;
  drainLifeAnimation: Animation;
  thunderstormAnimation: Animation;
  highHealthAnimation: Animation;
  freezeAnimation: Animation;
  anvilRecipeAnimation: Animation;
  anvilSuccessAnimation: Animation;
  anvilFailAnimation: Animation;
  client: any;
  achievements: any;
  spritesets: any;
  currentCursorOrientation: any;
  hoveringNpc: any;
  hoveringChest: any;
  camera: any;
  host: any;
  port: any;
  username: any;
  account: any;
  isStopped: any;
  obsoleteEntities: any[];
  playerId: any;
  drawTarget: any;
  clearTarget: any;
  equipment_callback: any;
  playerhurt_callback: any;
  nbplayers_callback: any;
  disconnect_callback: any;
  gamestart_callback: any;
  playerdeath_callback: any;
  gamecompleted_callback: any;
  bosscheckfailed_callback: any;
  chat_callback: any;
  invincible_callback: any;
  isAnvilRecipe: any;
  hoveringPlateauTile: any;
  hoveringOtherPlayer: any;
  lastHovered: any;
  timeout: any;
  zoningOrientation: any;
  updatetarget_callback: any;
  playerexp_callback: any;
  playerhp_callback: any;
  notification_callback: any;
  unlock_callback: any;
  slotToDelete?: number;

  constructor(app) {
    this.app = app;
    this.ready = false;
    this.started = false;
    this.hasNeverStarted = true;
    this.isUpgradeItemSent = false;
    this.isAnvilSuccess = false;
    this.anvilSuccessTimeout = null;
    this.isAnvilFail = false;
    this.anvilFailTimeout = null;
    this.cowPortalStart = false;
    this.cowLevelPortalCoords = null;
    this.minotaurPortalStart = false;
    this.minotaurLevelPortalCoords = { x: 34, y: 498 };

    this.renderer = null;
    this.updater = null;
    this.pathfinder = null;
    this.chatinput = null;
    this.bubbleManager = null;
    this.audioManager = null;
    this.targetAnimation = null;
    this.sparksAnimation = null;
    this.levelupAnimation = null;
    this.drainLifeAnimation = null;
    this.thunderstormAnimation = null;
    this.highHealthAnimation = null;
    this.freezeAnimation = null;
    this.anvilRecipeAnimation = null;
    this.anvilSuccessAnimation = null;
    this.anvilFailAnimation = null;

    // Player
    this.player = new Warrior("player", "");
    // this.player.moveUp = false;
    // this.player.moveDown = false;
    // this.player.moveLeft = false;
    // this.player.moveRight = false;
    // this.player.disableKeyboardNpcTalk = false;

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
    this.previousClickPosition = null;

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
    // @ts-ignore
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
      "aura-drainlife",
      "aura-thunderstorm",
      "aura-highhealth",
      "aura-freeze",
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
      "skeletoncommander",
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
      "cow",
      "cowking",
      "minotaur",
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
      "anvil-recipe",
      "anvil-success",
      "anvil-fail",
      "waypointx",
      "waypointn",
      "stash",
      "cowportal",
      "minotaurportal",
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
      "hornedarmor",
      "frozenarmor",
      "diamondarmor",
      "spikearmor",
      "firefox",
      "death",
      "dagger",
      "axe",
      "blueaxe",
      "bluemorningstar",
      "chest",
      "wirtleg",
      "sword",
      "redsword",
      "bluesword",
      "goldensword",
      "frozensword",
      "diamondsword",
      "minotauraxe",
      "cape",
      "item-sword",
      "item-axe",
      "item-blueaxe",
      "item-bluemorningstar",
      "item-redsword",
      "item-bluesword",
      "item-goldensword",
      "item-frozensword",
      "item-diamondsword",
      "item-minotauraxe",
      "item-leatherarmor",
      "item-mailarmor",
      "item-platearmor",
      "item-redarmor",
      "item-goldenarmor",
      "item-bluearmor",
      "item-hornedarmor",
      "item-frozenarmor",
      "item-diamondarmor",
      "item-spikearmor",
      "item-beltleather",
      "item-beltplated",
      "item-beltfrozen",
      "item-beltdiamond",
      "item-beltminotaur",
      "item-cape",
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
      "item-ringnecromancer",
      "item-ringraistone",
      "item-ringfountain",
      "item-ringminotaur",
      "item-amuletsilver",
      "item-amuletgold",
      "item-amuletcow",
      "item-chestblue",
      "item-scrollupgradelow",
      "item-scrollupgrademedium",
      "item-scrollupgradehigh",
      "item-scrollupgradeblessed",
      "item-skeletonkey",
      "item-raiblockstl",
      "item-raiblockstr",
      "item-raiblocksbl",
      "item-raiblocksbr",
      "item-wirtleg",
      "item-skeletonkingcage",
      "item-necromancerheart",
      "item-cowkinghorn",
      "item-cake",
      "item-burger",
      "morningstar",
      "item-morningstar",
      "item-firepotion",
    ];
  }

  setup($bubbleContainer, canvas, background, foreground, input) {
    this.setBubbleManager(new BubbleManager($bubbleContainer));
    this.setRenderer(new Renderer(this, canvas, background, foreground));
    this.setChatInput(input);
  }

  setStorage(storage) {
    this.storage = storage;
  }

  setStore(store) {
    this.store = store;
  }

  setRenderer(renderer) {
    this.renderer = renderer;
  }

  setUpdater(updater) {
    this.updater = updater;
  }

  setPathfinder(pathfinder) {
    this.pathfinder = pathfinder;
  }

  setChatInput(element) {
    this.chatinput = element;
  }

  setBubbleManager(bubbleManager) {
    this.bubbleManager = bubbleManager;
  }

  loadMap() {
    var self = this;

    // @ts-ignore
    this.map = new Map(!this.renderer.upscaledRendering, this);

    this.map.ready(function () {
      console.info("Map loaded.");
      var tilesetIndex = self.renderer.upscaledRendering ? 0 : self.renderer.scale - 1;
      self.renderer.setTileset(self.map.tilesets[tilesetIndex]);
    });
  }

  initPlayer() {
    if (this.storage.hasAlreadyPlayed() && this.storage.data.player) {
      if (this.storage.data.player.armor && this.storage.data.player.weapon) {
        this.player.setSpriteName(this.storage.data.player.armor);
        this.player.setWeaponName(this.storage.data.player.weapon);
      }
    }
    this.player.setSprite(this.sprites[this.player.getSpriteName()]);
    this.player.idle();

    console.debug("Finished initPlayer");
  }

  initShadows() {
    this.shadows = {};
    this.shadows["small"] = this.sprites["shadow16"];
  }

  initCursors() {
    this.cursors["hand"] = this.sprites["hand"];
    this.cursors["attack"] = this.sprites["attack"];
    this.cursors["loot"] = this.sprites["loot"];
    this.cursors["target"] = this.sprites["target"];
    this.cursors["arrow"] = this.sprites["arrow"];
    this.cursors["talk"] = this.sprites["talk"];
    this.cursors["join"] = this.sprites["talk"];
  }

  initAnimations() {
    this.targetAnimation = new Animation("idle_down", 4, 0, 16, 16);
    this.targetAnimation.setSpeed(50);

    this.sparksAnimation = new Animation("idle_down", 6, 0, 16, 16);
    this.sparksAnimation.setSpeed(120);

    this.levelupAnimation = new Animation("idle_down", 4, 0, 16, 16);
    this.levelupAnimation.setSpeed(50);

    this.drainLifeAnimation = new Animation("idle_down", 5, 0, 16, 8);
    this.drainLifeAnimation.setSpeed(200);

    this.thunderstormAnimation = new Animation("idle_down", 6, 0, 16, 8);
    this.thunderstormAnimation.setSpeed(200);

    this.highHealthAnimation = new Animation("idle_down", 6, 0, 16, 8);
    this.highHealthAnimation.setSpeed(140);

    this.freezeAnimation = new Animation("idle_down", 8, 0, 16, 8);
    this.freezeAnimation.setSpeed(140);

    this.anvilRecipeAnimation = new Animation("idle_down", 4, 0, 15, 8);
    this.anvilRecipeAnimation.setSpeed(80);

    this.anvilSuccessAnimation = new Animation("idle_down", 4, 0, 15, 8);
    this.anvilSuccessAnimation.setSpeed(80);

    this.anvilFailAnimation = new Animation("idle_down", 4, 0, 15, 8);
    this.anvilFailAnimation.setSpeed(80);
  }

  initHurtSprites() {
    var self = this;

    Types.forEachArmorKind(function (kind, kindName) {
      self.sprites[kindName].createHurtSprite();
    });
  }

  initSilhouettes() {
    var self = this;

    Types.forEachMobOrNpcKind(function (kind, kindName) {
      self.sprites[kindName].createSilhouette();
    });
    self.sprites["chest"].createSilhouette();
    self.sprites["item-cake"].createSilhouette();
  }

  initSettings(settings) {
    if (!this.storage.isAudioEnabled()) {
      this.audioManager.disableAudio();
    } else {
      $("#mute-checkbox").prop("checked", true);
    }

    if (this.storage.showEntityNameEnabled()) {
      this.renderer.setDrawEntityName(true);
      $("#entity-name-checkbox").prop("checked", true);
    } else {
      this.renderer.setDrawEntityName(false);
    }

    if (this.storage.showDamageInfoEnabled()) {
      this.infoManager.setShowDamageInfo(true);
      $("#damage-info-checkbox").prop("checked", true);
    } else {
      this.infoManager.setShowDamageInfo(false);
    }

    this.player.capeHue = settings.capeHue;
    var handleHue = $("#cape-hue-handle");
    $("#cape-hue-slider").slider({
      min: 0,
      max: 360,
      value: settings.capeHue,
      create: () => {
        handleHue.text(settings.capeHue);
      },
      slide: (_event, ui) => {
        handleHue.text(ui.value);
        this.player.setCapeHue(ui.value);
        this.updateCapePreview();
      },
      change: (_event, ui) => {
        this.client.sendSettings({ capeHue: ui.value });
      },
    });

    this.player.capeSaturate = settings.capeSaturate;
    var handleSaturate = $("#cape-saturate-handle");
    $("#cape-saturate-slider").slider({
      min: 0,
      max: 400,
      value: settings.capeSaturate,
      create: () => {
        handleSaturate.text(`${settings.capeSaturate}%`);
      },
      slide: (_event, ui) => {
        handleSaturate.text(`${ui.value}%`);
        this.player.setCapeSaturate(ui.value);
        this.updateCapePreview();
      },
      change: (_event, ui) => {
        this.client.sendSettings({ capeSaturate: ui.value });
      },
    });

    this.player.capeContrast = settings.capeContrast;
    var handleContrast = $("#cape-contrast-handle");
    $("#cape-contrast-slider").slider({
      min: 0,
      max: 300,
      value: settings.capeContrast,
      create: () => {
        handleContrast.text(`${settings.capeContrast}%`);
      },
      slide: (_event, ui) => {
        handleContrast.text(`${ui.value}%`);
        this.player.setCapeContrast(ui.value);
        this.updateCapePreview();
      },
      change: (_event, ui) => {
        this.client.sendSettings({ capeContrast: ui.value });
      },
    });

    this.updateCapePreview();
  }

  updateCapePreview() {
    // @NOTE Adjustment because css filters and canvas filters are not the same
    const saturate = this.player.capeSaturate + 40 > 100 ? this.player.capeSaturate + 40 : 100;
    const contrast = this.player.capeContrast + 40 > 100 ? this.player.capeContrast + 40 : 100;

    $("#settings-cape-preview").css(
      "filter",
      `hue-rotate(${this.player.capeHue}deg) saturate(${saturate}%) contrast(${contrast}%)`,
    );
  }

  initTooltips() {
    var self = this;

    $(document).tooltip({
      items: "[data-item]",
      track: true,
      // hide: 1000000,
      position: { my: "left bottom-10", at: "left bottom", collision: "flipfit" },
      content() {
        const element = $(this);
        const item = element.attr("data-item");
        const level = element.attr("data-level");
        const rawBonus = element.attr("data-bonus") ? JSON.parse(element.attr("data-bonus")) : undefined;
        const slot = parseInt(element.parent().attr("data-slot") || "0", 10);

        let rawSetBonus = null;
        if (
          self.player.set &&
          Object.values(Types.Slot).includes(slot) &&
          Types.setItems[self.player.set]?.includes(item)
        ) {
          rawSetBonus = self.player.setBonus;
        }

        const {
          name,
          isUnique,
          itemClass,
          defense,
          damage,
          healthBonus,
          magicDamage,
          flameDamage,
          lightningDamage,
          pierceArmor,
          bonus = [],
          requirement,
          description,
          setBonus = [],
          partyBonus = [],
        } = Types.getItemDetails(item, level, rawBonus, rawSetBonus);

        return `<div>
            <div class="item-title${isUnique ? " unique" : ""}">${name}${level ? `(+${level})` : ""} </div>
            ${itemClass ? `<div class="item-class">(${isUnique ? "Unique " : ""}${itemClass} class item)</div>` : ""}
            ${defense ? `<div class="item-description">Defense: ${defense}</div>` : ""}
            ${damage ? `<div class="item-description">Attack: ${damage}</div>` : ""}
            ${magicDamage ? `<div class="item-bonus">Magic damage: ${magicDamage}</div>` : ""}
            ${flameDamage ? `<div class="item-bonus">Flame damage: ${flameDamage}</div>` : ""}
            ${lightningDamage ? `<div class="item-bonus">Lightning damage: ${lightningDamage}</div>` : ""}
            ${pierceArmor ? `<div class="item-bonus">Armor Piercing: ${pierceArmor}</div>` : ""}
            ${healthBonus ? `<div class="item-bonus">Health bonus: ${healthBonus}</div>` : ""}
            ${bonus.map(({ description }) => `<div class="item-bonus">${description}</div>`).join("")}
            ${requirement ? `<div class="item-description">Required level: ${requirement}</div>` : ""}
            ${description ? `<div class="item-description">${description}</div>` : ""}
            ${setBonus.length ? `<div class="item-set-description">${self.player.set} Set Bonuses</div>` : ""}
            ${setBonus.map(({ description }) => `<div class="item-set-bonus">${description}</div>`).join("")}
            ${partyBonus.length ? `<div class="item-set-description">Party Bonuses</div>` : ""}
            ${partyBonus.map(({ description }) => `<div class="item-set-bonus">${description}</div>`).join("")}
          </div>`;
      },
    });
  }

  initSendUpgradeItem() {
    var self = this;
    $("#upgrade-btn").on("click", function () {
      if (
        self.player.upgrade.length >= 2 ||
        (self.player.upgrade.length === 1 && Types.isChest(self.player.upgrade[0]?.item))
      ) {
        if (!self.isUpgradeItemSent) {
          self.client.sendUpgradeItem();
        }
        self.isUpgradeItemSent = true;
      }
    });
  }

  initUpgradeItemPreview() {
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
                "background-image": `url("${self.getIconPath(item, parseInt(level) + 1)}")`,
              },
              "data-item": item,
              "data-level": level ? parseInt(level) + 1 : "",
              "data-bonus": bonus,
            }),
          );
        }
      });
    });
  }

  initDroppable() {
    var self = this;

    $(".item-droppable").droppable({
      greedy: true,
      over() {},
      out() {},
      drop(event, ui) {
        const fromItemEl = $(ui.draggable[0]);
        const fromItemElParent = fromItemEl.parent();
        const fromSlot = fromItemElParent.data("slot");
        const toSlot = $(this).data("slot");
        const toItemEl = $(this).find("> div");

        if (fromSlot === toSlot) {
          return;
        }

        const item = fromItemEl.attr("data-item");
        const level = parseInt(fromItemEl.attr("data-level"));
        const rawBonus = fromItemEl.attr("data-bonus");
        let bonus: number[];
        if (rawBonus) {
          try {
            bonus = JSON.parse(rawBonus) as number[];
          } catch (err) {
            // Silence error
          }
        }

        const toItem = toItemEl.attr("data-item");
        const toLevel = toItemEl.attr("data-level");

        if (toItem) {
          if (
            Object.values(Types.Slot).includes(fromSlot) &&
            (!toLevel || !Types.isCorrectTypeForSlot(fromSlot, toItem) || toLevel > self.player.level)
          ) {
            return;
          }
        }

        if (Object.values(Types.Slot).includes(toSlot) && Types.getItemRequirement(item, level) > self.player.level) {
          return;
        }

        if (toSlot === -1) {
          if (!level || level !== 1) {
            $("#dialog-delete-item").dialog("open");
            self.slotToDelete = fromSlot;
            return;
          }
          fromItemEl.remove();
        } else {
          $(this).append(fromItemEl.detach());
          if (toItemEl.length) {
            $(fromItemElParent).append(toItemEl.detach());
          }
        }

        self.client.sendMoveItem(fromSlot, toSlot);

        if (typeof level === "number") {
          if (toSlot === Types.Slot.WEAPON) {
            self.player.switchWeapon(item, level, bonus);
          } else if (toSlot === Types.Slot.ARMOR) {
            self.player.switchArmor(self.sprites[item], level, bonus);
          } else if (toSlot === Types.Slot.CAPE) {
            self.player.switchCape(item, level, bonus);
          }
        }

        const type = kinds[item][1];
        if (type === "armor" && $(".item-equip-armor").is(":empty")) {
          self.player.switchArmor(self.sprites["clotharmor"], 1);
        } else if (type === "weapon" && $(".item-equip-weapon").is(":empty")) {
          self.player.switchWeapon("dagger", 1);
        } else if (type === "cape" && $(".item-equip-cape").is(":empty")) {
          self.player.removeCape();
        }
      },
    });
  }

  deleteItemFromSlot() {
    if (typeof this.slotToDelete !== "number") return;
    this.client.sendMoveItem(this.slotToDelete, -1);
  }

  destroyDroppable() {
    $(".item-not-draggable").remove();
    $(".item-droppable").droppable("destroy");
  }

  initDraggable() {
    var self = this;

    $(".item-draggable:not(.item-faded)").draggable({
      zIndex: 100,
      revertDuration: 0,
      revert: true,
      containment: "#canvasborder",
      drag() {},
      start() {
        $(this).parent().addClass("ui-droppable-origin");

        const item = $(this).attr("data-item");
        const type = kinds[item][1];

        if (
          ["weapon", "armor", "belt", "cape", "chest", "ring", "amulet"].includes(type) &&
          $(`.item-${type}`).is(":empty")
        ) {
          $(`.item-${type}`).addClass("item-droppable");
        } else if (Types.isScroll(item)) {
          $(".item-scroll").addClass("item-droppable");
        } else if (Types.isSingle(item)) {
          $(".item-recipe").addClass("item-droppable");
        }

        self.initDroppable();
      },
      stop() {
        self.destroyDroppable();

        $(".ui-droppable-origin").removeClass("ui-droppable-origin");
        $(
          ".item-weapon, .item-armor, .item-ring, .item-amulet, .item-belt, .item-cape, .item-chest .item-scroll",
        ).removeClass("item-droppable");
      },
    });
  }

  destroyDraggable() {
    $(".item-draggable.ui-draggable").draggable("destroy");
  }

  getIconPath(spriteName: string, level?: string | number) {
    const scale = this.renderer.getScaleFactor();

    let suffix = "";
    if (spriteName === "cape" && parseInt(level as string, 10) >= 7) {
      suffix = "7";
    }

    return `img/${scale}/item-${spriteName}${suffix}.png`;
  }

  initInventory() {
    $("#item-inventory").empty();
    for (var i = 0; i < 24; i++) {
      $("#item-inventory").append(`<div class="item-slot item-inventory item-droppable" data-slot="${i}"></div>`);
    }

    $("#item-weapon").empty().append('<div class="item-slot item-equip-weapon item-weapon" data-slot="100"></div>');
    $("#item-armor").empty().append('<div class="item-slot item-equip-armor item-armor" data-slot="101"></div>');
    $("#item-belt").empty().append('<div class="item-slot item-equip-belt item-belt" data-slot="102"></div>');
    $("#item-cape").empty().append('<div class="item-slot item-equip-cape item-cape" data-slot="106"></div>');
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
          "data-bonus": this.player.weaponBonus,
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
          "data-bonus": this.player.armorBonus,
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
          "data-bonus": this.player.beltBonus,
        }),
      );
    }

    if (this.player.cape) {
      $(".item-equip-cape").append(
        $("<div />", {
          class: "item-draggable",
          css: {
            "background-image": `url("${this.getIconPath(this.player.cape, this.player.capeLevel)}")`,
          },
          "data-item": this.player.cape,
          "data-level": this.player.capeLevel,
          "data-bonus": this.player.capeBonus,
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
  }

  updateInventory() {
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
            "background-image": `url("${this.getIconPath(item, level)}")`,
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
  }

  updateStash() {
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
            "background-image": `url("${this.getIconPath(item, level)}")`,
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
  }

  updateRequirement() {
    var self = this;

    $("[data-requirement]").each(function () {
      const requirement = $(this).data("requirement");

      let backgroundColor = "inherit";
      if (requirement > self.player.level) {
        backgroundColor = "rgba(158, 0, 0, 0.5)";
      }
      $(this).css("background-color", backgroundColor);
    });
  }

  initUpgrade() {
    $("#upgrade-scroll").empty();
    for (var i = 1; i < 10; i++) {
      $("#upgrade-scroll").append(`<div class="item-slot item-scroll item-recipe" data-slot="${200 + i}"></div>`);
    }
    $("#upgrade-item")
      .empty()
      .append(
        '<div class="item-slot item-upgrade item-upgrade-weapon item-upgrade-armor item-weapon item-armor item-ring item-amulet item-belt item-cape item-chest" data-slot="200"></div>',
      );
    $("#upgrade-result").empty().append('<div class="item-slot item-upgraded" data-slot="210"></div>');
  }

  updateUpgrade({ luckySlot, isSuccess }) {
    if ($("#inventory").hasClass("visible")) {
      this.destroyDraggable();
    }

    $(".item-upgrade").empty();
    $(".item-upgraded").empty();

    $("#upgrade .item-slot").removeClass("item-upgrade-success-slot item-upgrade-fail-slot");
    if (luckySlot) {
      $(`#upgrade .item-slot:eq(${luckySlot})`).addClass("item-upgrade-success-slot");
      $(".item-scroll").find("> div").addClass("item-faded");
    } else {
      $(".item-scroll").empty();
    }

    if (isSuccess) {
      $("#upgrade-result .item-slot").addClass("item-upgrade-success-slot");
    } else if (isSuccess === false) {
      $("#upgrade-result .item-slot").addClass("item-upgrade-fail-slot");
    }

    let successRate;
    let itemLevel;

    this.player.upgrade.forEach(({ item, level, quantity, slot, bonus }) => {
      if (slot === 0 && level) {
        itemLevel = level;
        const successRates = Types.getUpgradeSuccessRates();
        successRate = successRates[parseInt(level) - 1];
      } else if (slot) {
        if (!item.startsWith("scrollupgrade")) {
          successRate = null;
        } else if (itemLevel && item.startsWith("scrollupgradeblessed")) {
          const blessedRates = Types.getBlessedSuccessRateBonus();
          const blessedRate = blessedRates[parseInt(itemLevel) - 1];
          successRate += blessedRate;
        }
      }

      $(`#upgrade .item-slot:eq(${slot})`)
        .removeClass("item-droppable")
        .append(
          $("<div />", {
            class: `item-draggable ${quantity ? "item-quantity" : ""}`,
            css: {
              "background-image": `url("${this.getIconPath(item, level)}")`,
            },
            "data-item": item,
            "data-level": level,
            "data-quantity": quantity,
            "data-bonus": bonus,
          }),
        );
    });

    $("#upgrade-info").html(successRate ? `${successRate}% chance of successful upgrade` : "&nbsp;");

    if ($("#upgrade").hasClass("visible")) {
      this.initDraggable();
    }
  }

  initStash() {
    $("#item-stash").empty();
    for (var i = 0; i < 48; i++) {
      $("#item-stash").append(`<div class="item-slot item-stash item-droppable" data-slot="${i + 300}"></div>`);
    }

    this.updateStash();
  }

  initAchievements() {
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
        isCompleted() {
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
        isCompleted() {
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
        isCompleted() {
          return self.storage.getTotalKills() >= 50;
        },
        nano: 4,
      },
      STILL_ALIVE: {
        id: 14,
        name: "Still Alive",
        desc: "Revive your character five times",
        isCompleted() {
          return self.storage.getTotalRevives() >= 5;
        },
        nano: 5,
      },
      MEATSHIELD: {
        id: 15,
        name: "Meatshield",
        desc: "Take 5,000 points of damage",
        isCompleted() {
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
        desc: "Kill 15 spectres",
        isCompleted() {
          return self.storage.getSpectreCount() >= 15;
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
        desc: "Defeat 25 Werewolves",
        hidden: false,
        nano: 15,
        isCompleted() {
          return self.storage.getWerewolfCount() >= 25;
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
        desc: "Defeat 25 Yetis",
        hidden: false,
        nano: 15,
        isCompleted() {
          return self.storage.getYetiCount() >= 25;
        },
      },
      RIP: {
        id: 33,
        name: "R.I.P.",
        desc: "Defeat 50 Skeleton Guards",
        hidden: false,
        nano: 25,
        isCompleted() {
          return self.storage.getSkeleton3Count() >= 50;
        },
      },
      DEAD_NEVER_DIE: {
        id: 34,
        name: "What is dead may never die",
        desc: "Defeat the Skeleton Commander",
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
        desc: "Kill 50 Wraiths",
        hidden: false,
        nano: 25,
        isCompleted() {
          return self.storage.getWraithCount() >= 50;
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
      SECRET_LEVEL: {
        id: 41,
        name: "Leap of faith",
        desc: "Jump into the void",
        hidden: false,
      },
      COW_KING: {
        id: 42,
        name: "I'm the Butcher",
        desc: "Defeat the Cow King",
        hidden: true,
      },
      FRESH_MEAT: {
        id: 43,
        name: "Fresh Meat",
        desc: "Kill 500 cows",
        hidden: true,
        isCompleted() {
          return self.storage.getCowCount() >= 500;
        },
      },
      FARMER: {
        id: 44,
        name: "Pro Farmer",
        desc: "Kill every monster in the secret level",
        hidden: true,
      },
      // MAGIC8: {
      //   id: 44,
      //   name: "Magic 8",
      //   desc: "Upgrade a high class item to +8",
      //   hidden: true,
      // },
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
      const achievement: any = Object.values(self.achievements)[id - 1];
      acc += achievement && achievement.nano ? achievement.nano : 0;
      return acc;
    }, 0);

    this.app.initUnlockedAchievements(unlockedAchievementIds, totalNano);
  }

  getAchievementById(id) {
    var found = null;
    _.each(this.achievements, function (achievement) {
      if (achievement.id === parseInt(id)) {
        found = achievement;
      }
    });
    return found;
  }

  initWaypoints(waypoints) {
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
          click(e) {
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
              $("#foreground").off(".waypoint");
            }
          },
        }).appendTo("#waypoint-list");
      });
    }
  }

  activateWaypoint(id) {
    $(`#waypoint-${id}`).removeClass("disabled locked").addClass("active");
  }

  loadSprite(name) {
    if (this.renderer.upscaledRendering) {
      this.spritesets[0][name] = new Sprite(name, 1);
    } else {
      this.spritesets[1][name] = new Sprite(name, 2);
      if (!this.renderer.mobile && !this.renderer.tablet) {
        this.spritesets[2][name] = new Sprite(name, 3);
      }
    }
  }

  setSpriteScale(scale) {
    var self = this;

    if (this.renderer.upscaledRendering) {
      this.sprites = this.spritesets[0];
    } else {
      this.sprites = this.spritesets[scale - 1];

      _.each(this.entities, function (entity: Entity) {
        entity.sprite = null;
        entity.setSprite(self.sprites[entity.getSpriteName()]);
      });
      this.initHurtSprites();
      this.initShadows();
      this.initCursors();
    }
  }

  loadSprites() {
    console.info("Loading sprites...");
    this.spritesets = [];
    this.spritesets[0] = {};
    this.spritesets[1] = {};
    this.spritesets[2] = {};
    _.map(this.spriteNames, this.loadSprite.bind(this));
  }

  spritesLoaded() {
    if (
      _.some(this.sprites, function (sprite: any) {
        return !sprite.isLoaded;
      })
    ) {
      return false;
    }
    return true;
  }

  setCursor(name, orientation = Types.Orientations.DOWN) {
    if (name in this.cursors) {
      this.currentCursor = this.cursors[name];
      this.currentCursorOrientation = orientation;
    } else {
      console.error("Unknown cursor name :" + name);
    }
  }

  updateCursorLogic() {
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
  }

  focusPlayer() {
    this.renderer.camera.lookAt(this.player);
  }

  addEntity(entity) {
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
      console.error("This entity already exists : " + entity.id + " (" + entity.kind + ")");
    }
  }

  removeEntity(entity) {
    if (entity.id in this.entities) {
      this.unregisterEntityPosition(entity);
      delete this.entities[entity.id];
    } else {
      console.error("Cannot remove entity. Unknown ID : " + entity.id);
    }
  }

  addItem(item, x, y) {
    item.setSprite(this.sprites[item.getSpriteName()]);
    item.setGridPosition(x, y);
    item.setAnimation("idle", 150);
    this.addEntity(item);
  }

  removeItem(item) {
    if (item) {
      this.removeFromItemGrid(item, item.gridX, item.gridY);
      this.removeFromRenderingGrid(item, item.gridX, item.gridY);
      delete this.entities[item.id];
    } else {
      console.error("Cannot remove item. Unknown ID : " + item.id);
    }
  }

  initPathingGrid() {
    this.pathingGrid = [];
    for (var i = 0; i < this.map.height; i += 1) {
      this.pathingGrid[i] = [];
      for (var j = 0; j < this.map.width; j += 1) {
        this.pathingGrid[i][j] = this.map.grid[i][j];
      }
    }
    console.info("Initialized the pathing grid with static colliding cells.");
  }

  initEntityGrid() {
    this.entityGrid = [];
    for (var i = 0; i < this.map.height; i += 1) {
      this.entityGrid[i] = [];
      for (var j = 0; j < this.map.width; j += 1) {
        this.entityGrid[i][j] = {};
      }
    }
    console.info("Initialized the entity grid.");
  }

  initRenderingGrid() {
    this.renderingGrid = [];
    for (var i = 0; i < this.map.height; i += 1) {
      this.renderingGrid[i] = [];
      for (var j = 0; j < this.map.width; j += 1) {
        this.renderingGrid[i][j] = {};
      }
    }
    console.info("Initialized the rendering grid.");
  }

  initItemGrid() {
    this.itemGrid = [];
    for (var i = 0; i < this.map.height; i += 1) {
      this.itemGrid[i] = [];
      for (var j = 0; j < this.map.width; j += 1) {
        this.itemGrid[i][j] = {};
      }
    }
    console.info("Initialized the item grid.");
  }

  /**
   *
   */
  initAnimatedTiles() {
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
    //console.info("Initialized animated tiles.");
  }

  addToRenderingGrid(entity, x, y) {
    if (!this.map.isOutOfBounds(x, y)) {
      this.renderingGrid[y][x][entity.id] = entity;
    }
  }

  removeFromRenderingGrid(entity, x, y) {
    if (entity && this.renderingGrid[y][x] && entity.id in this.renderingGrid[y][x]) {
      delete this.renderingGrid[y][x][entity.id];
    }
  }

  removeFromEntityGrid(entity, x, y) {
    if (this.entityGrid[y][x][entity.id]) {
      delete this.entityGrid[y][x][entity.id];
    }
  }

  removeFromItemGrid(item, x, y) {
    if (item && this.itemGrid[y][x][item.id]) {
      delete this.itemGrid[y][x][item.id];
    }
  }

  removeFromPathingGrid(x, y) {
    this.pathingGrid[y][x] = 0;
  }

  /**
   * Registers the entity at two adjacent positions on the grid at the same time.
   * This situation is temporary and should only occur when the entity is moving.
   * This is useful for the hit testing algorithm used when hovering entities with the mouse cursor.
   *
   * @param {Entity} entity The moving entity
   */
  registerEntityDualPosition(entity) {
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
  }

  /**
   * Clears the position(s) of this entity in the entity grid.
   *
   * @param {Entity} entity The moving entity
   */
  unregisterEntityPosition(entity) {
    if (entity) {
      this.removeFromEntityGrid(entity, entity.gridX, entity.gridY);
      this.removeFromPathingGrid(entity.gridX, entity.gridY);
      this.removeFromRenderingGrid(entity, entity.gridX, entity.gridY);

      if (entity.nextGridX >= 0 && entity.nextGridY >= 0) {
        this.removeFromEntityGrid(entity, entity.nextGridX, entity.nextGridY);
        this.removeFromPathingGrid(entity.nextGridX, entity.nextGridY);
      }
    }
  }

  registerEntityPosition(entity) {
    var x = entity.gridX;
    var y = entity.gridY;

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
  }

  setPlayerAccount(username, account) {
    this.username = username;
    this.account = account;
  }

  setServerOptions(host, port) {
    this.host = host;
    this.port = port;
  }

  loadAudio() {
    this.audioManager = new AudioManager(this);
  }

  initMusicAreas() {
    var self = this;

    _.each(this.map.musicAreas, function (area) {
      self.audioManager.addArea(area.x, area.y, area.w, area.h, area.id);
    });
  }

  run(action, started_callback) {
    var self = this;

    this.loadSprites();
    // @ts-ignore
    this.setUpdater(new Updater(this));
    this.camera = this.renderer.camera;

    this.setSpriteScale(this.renderer.scale);

    var wait = setInterval(function () {
      if (self.map.isLoaded && self.spritesLoaded()) {
        self.ready = true;
        console.debug("All sprites loaded.");

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
  }

  tick() {
    this.currentTime = new Date().getTime();

    if (this.started) {
      this.updateCursorLogic();
      this.updater.update();
      this.renderer.renderFrame();
    }

    if (!this.isStopped) {
      window.requestAnimFrame(this.tick.bind(this));
    }
  }

  start() {
    this.tick();
    this.hasNeverStarted = false;
    console.info("Game loop started.");
  }

  stop() {
    console.info("Game stopped.");
    this.isStopped = true;
  }

  entityIdExists(id) {
    return id in this.entities;
  }

  getEntityById(id) {
    if (id in this.entities) {
      return this.entities[id];
    } else {
      // console.error("Unknown entity id : " + id, true);
    }
  }

  connect(action, started_callback) {
    var self = this;

    this.client = new GameClient(this.host, this.port);
    this.client.fail_callback = function (reason) {
      started_callback({
        success: false,
        reason: reason,
      });
      self.started = false;
    };

    this.client.connect(false);

    this.client.onDispatched(function (host, port) {
      console.debug("Dispatched to game server " + host + ":" + port);

      self.client.host = host;
      self.client.port = port;
      self.client.connect(); // connect to actual game server
    });

    this.client.onConnected(function () {
      console.info("Starting client/server handshake");

      self.player.name = self.username;
      self.player.account = self.account;
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

      self.obsoleteEntities = _.reject(self.entities, function (entity: Entity) {
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
      cape,
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
      auras,
      cowLevelPortalCoords,
      party,
      settings,
    }) {
      console.info("Received player ID from server : " + id);
      self.player.id = id;
      self.playerId = id;
      // Always accept name received from the server which will
      // sanitize and shorten names exceeding the allowed length.
      self.player.name = name;

      var [armor, armorLevel, armorBonus] = armor.split(":");
      var [weapon, weaponLevel, weaponBonus] = weapon.split(":");

      self.storage.setPlayerName(name);
      self.storage.setPlayerArmor(armor);
      self.storage.setPlayerWeapon(weapon);
      self.storage.setAchievement(achievement);

      self.player.setGridPosition(x, y);
      self.player.setMaxHitPoints(hp);
      self.player.setArmorName(armor);
      self.player.setArmorLevel(armorLevel);
      self.player.setArmorBonus(armorBonus);
      self.player.setSpriteName(armor);
      self.player.setWeaponName(weapon);
      self.player.setWeaponLevel(weaponLevel);
      self.player.setWeaponBonus(weaponBonus);
      self.player.setBelt(belt);
      self.player.setCape(cape);

      self.player.setRing1(ring1);
      self.player.setRing2(ring2);
      self.player.setAmulet(amulet);
      self.player.setAuras(auras);
      self.initPlayer();
      self.player.experience = experience;
      self.player.level = Types.getLevel(experience);
      self.player.setInventory(inventory);
      self.player.setStash(stash);

      self.initSettings(settings);
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
      self.cowLevelPortalCoords = cowLevelPortalCoords;

      if (party) {
        const { partyId, partyLeader, members } = party;

        self.player.setPartyId(partyId);
        self.player.setPartyLeader(partyLeader);
        self.player.setPartyMembers(members);
      }

      self.addEntity(self.player);
      self.player.dirtyRect = self.renderer.getEntityBoundingRect(self.player);

      setTimeout(function () {
        self.tryUnlockingAchievement("STILL_ALIVE");
      }, 1500);

      self.app.updateNanoPotions(nanoPotions);
      self.app.updateGems(gems);
      self.app.updateArtifact(artifact);

      self.storage.initPlayer(self.player.name, self.player.account);
      self.storage.savePlayer(self.renderer.getPlayerImage(), self.player.getSpriteName(), self.player.getWeaponName());

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
          console.debug("Blocked by " + blockingEntity.id);
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
        // Start by unregistering the entity at its previous coords
        self.unregisterEntityPosition(self.player);

        if (isWaypoint) {
          // Make sure the character is paused / halted when entering a waypoint, else the player goes invisible
          self.player.stop();
          self.player.nextStep();
        }

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
          // Close all when teleporting
          self.app.hideWindows();

          var dest = isWaypoint ? { x, y, orientation: Types.Orientations.DOWN } : self.map.getDoorDestination(x, y);
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
          self.player.idle();
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
            // skip playing the chest open sound if the SKELETON_KEY quest is not completed
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
        console.info(self.playerId + " is dead");

        self.player.stopBlinking();
        self.player.setSprite(self.sprites["death"]);
        self.player.animate("death", 120, 1, () => {
          console.info(self.playerId + " was removed");

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

      self.player.onSwitchItem(function () {
        self.storage.savePlayer(
          self.renderer.getPlayerImage(),
          self.player.getArmorName(),
          self.player.getWeaponName(),
        );
        if (self.equipment_callback) {
          self.equipment_callback();
        }
      });

      self.player.onInvincible(function () {
        self.invincible_callback();
        self.player.switchArmor(self.sprites["firefox"], 1);
      });

      self.client.onSpawnItem(function (item, x, y) {
        self.addItem(item, x, y);
      });

      self.client.onSpawnChest(function (chest, x, y) {
        chest.setSprite(self.sprites[chest.getSpriteName()]);
        chest.setGridPosition(x, y);
        chest.setAnimation("idle_down", 150);
        self.addEntity(chest);

        chest.onOpen(function () {
          chest.stopBlinking();
          chest.setSprite(self.sprites["death"]);
          chest.setAnimation("death", 120, 1, function () {
            console.info(chest.id + " was removed");
            self.removeEntity(chest);
            self.removeFromRenderingGrid(chest, chest.gridX, chest.gridY);
            self.previousClickPosition = null;
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

                // NOTE wait for the raise animation to complete before chasing players
                setTimeout(() => {
                  entity.aggroRange = 10;
                  entity.isAggressive = true;
                }, 1000);
              } else if (entity.kind === Types.Entities.COWPORTAL && entity.gridX === 43 && entity.gridY === 211) {
                if (self.cowPortalStart) {
                  entity.raise();
                  entity.currentAnimation.setSpeed(75);

                  setTimeout(() => {
                    entity.idle();
                    entity.currentAnimation.setSpeed(150);
                  }, 1200);
                } else {
                  entity.idle();
                }
              } else if (entity.kind === Types.Entities.MINOTAURPORTAL && entity.gridX === 40 && entity.gridY === 210) {
                if (self.minotaurPortalStart) {
                  entity.raise();
                  entity.currentAnimation.setSpeed(75);

                  setTimeout(() => {
                    entity.idle();
                    entity.currentAnimation.setSpeed(150);
                  }, 1200);
                } else {
                  entity.idle();
                }
              } else {
                entity.idle();
              }

              self.addEntity(entity);

              // console.debug(
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

                entity.onStopPathing(function () {
                  self.unregisterEntityPosition(entity);

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
                  console.info(entity.id + " is dead");

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
                    console.info(entity.id + " was removed");

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
            console.error(err);
          }
        } else {
          if (entity instanceof Player) {
            // @NOTE Manually update locally stored entity to prevent invisible unupdated coords entity
            // Before this the entities were not updated because they already existed
            const currentEntity = self.getEntityById(entity.id);
            self.unregisterEntityPosition(currentEntity);

            currentEntity.setWeaponName(entity.weaponName);
            currentEntity.setWeaponLevel(entity.weaponLevel);
            currentEntity.setWeaponBonus(entity.weaponBonus);
            currentEntity.setSpriteName(entity.armorName);
            currentEntity.setArmorName(entity.armorName);
            currentEntity.setArmorLevel(entity.armorLevel);
            currentEntity.setArmorBonus(entity.armorBonus);
            currentEntity.setAuras(entity.auras);
            if (!entity.cape || !entity.capeLevel || !entity.capeBonus) {
              currentEntity.removeCape();
            } else {
              currentEntity.setCape(`${entity.cape}:${entity.capeLevel}:${entity.capeBonus}`);
            }

            currentEntity.setSprite(self.sprites[entity.getSpriteName()]);
            currentEntity.setGridPosition(x, y);

            self.registerEntityPosition(currentEntity);
          } else {
            console.debug("Character " + entity.id + " already exists. Don't respawn.");
          }
        }
      });

      self.client.onDespawnEntity(function (entityId) {
        var entity = self.getEntityById(entityId);

        if (entity) {
          console.info("Despawning " + Types.getKindAsString(entity.kind) + " (" + entity.id + ")");

          // Instead of checking the absolute position, give a 1 tile buffer range for clearing the position
          // This is an attempt at solving the issue where after a monster death the player could not attack
          // in the same direction if the mob has moved before the attack and the wrong pos are then recorded
          if (self.previousClickPosition) {
            const isNear =
              Math.abs(entity.gridX - self.previousClickPosition.x) <= 1 &&
              Math.abs(entity.gridY - self.previousClickPosition.y) <= 1;
            if (isNear) {
              self.previousClickPosition = null;
            }
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

      self.client.onPartyCreate(function () {
        self.chat_callback({ message: "Party created!", type: "event" });
      });

      self.client.onPartyJoin(function (data) {
        const { partyId, partyLeader, members } = data;

        self.player.setPartyId(partyId);
        self.player.setPartyLeader(partyLeader);
        self.player.setPartyMembers(members);

        members?.forEach(({ id }) => {
          self.getEntityById(id)?.setPartyId(partyId);
        });

        let message = "Party joined";
        if (data.playerName !== self.player.name) {
          message = `${data.playerName} joined the party`;
        } else if (members.length === 1 && partyLeader.name === self.player.name) {
          message = `Party created, you are the party leader`;
        }

        self.app.updatePartyMembers(members);

        self.chat_callback({ message, type: "info" });
      });

      self.client.onPartyInvite(function (data) {
        const { partyId, partyLeader } = data;

        self.chat_callback({
          message: `${partyLeader.name} invite you to join the party. To accept type /party join ${partyId}`,
          type: "info",
        });

        // @TODO: Update healthbars
      });

      self.client.onPartyLeave(function (data) {
        const { partyId, partyLeader, members, playerName } = data;

        // Leaving player will update it's entity list
        if (!partyId) {
          self.player.partyMembers?.forEach(({ id }) => {
            self.getEntityById(id)?.setPartyId(partyId);
          });
        } else {
          // When a player in the party left, diff the member list and remove the partyId of the leaving player
          _.differenceWith(self.player.partyMembers, members, _.isEqual)?.forEach(({ id }) => {
            self.getEntityById(id)?.setPartyId(undefined);
          });
        }

        self.player.setPartyId(partyId);
        self.player.setPartyLeader(partyLeader);
        self.player.setPartyMembers(members);

        let message = "You left the party";
        if (playerName !== self.player.name) {
          message = `${playerName} left the party`;
          self.app.updatePartyMembers(members);
        } else {
          self.app.removePartyHealthBar();
        }
        // @NOTE add isNewLeader to determine when to display this?
        // if (self.player.name === partyLeader?.name) {
        //   message += ", you are now the party leader";
        // }
        self.chat_callback({ message, type: "info" });
      });

      self.client.onPartyDisband(function () {
        self.player.partyMembers?.forEach(({ id }) => {
          self.getEntityById(id)?.setPartyId(undefined);
        });

        self.player.setPartyId(undefined);
        self.player.setPartyLeader(undefined);
        self.player.setPartyMembers(undefined);

        self.chat_callback({ message: "Party was disbaned", type: "info" });

        self.app.removePartyHealthBar();
      });

      self.client.onPartyInfo(function (message) {
        self.chat_callback({ message, type: "info" });
      });

      self.client.onPartyError(function (message) {
        self.chat_callback({ message, type: "error" });
      });

      self.client.onPartyLoot(function ({ playerName, kind, isUnique }) {
        let message = "";
        if (isUnique) {
          message = `${playerName} received the ${Types.itemUniqueMap[Types.getKindAsString(kind)][0]}`;
        } else {
          message = `${playerName} received ${EntityFactory.builders[kind]()
            .getLootMessage()
            .replace("You pick up", "")}`;
        }

        self.chat_callback({ message, type: "loot" });
      });

      self.client.onPartyHealth(function (member) {
        self.app.updatePartyHealthBar(member);
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
          console.debug("Entity was destroyed: " + entity.id);
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
          console.debug(attacker.id + " attacks " + target.id);

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
        } else if (kind === Types.Entities.SKELETONCOMMANDER) {
          self.tryUnlockingAchievement("DEAD_NEVER_DIE");
        } else if (kind === Types.Entities.NECROMANCER) {
          self.tryUnlockingAchievement("BLACK_MAGIC").then(() => {
            self.client.sendRequestPayout(Types.Entities.NECROMANCER);
          });
        } else if (kind === Types.Entities.COW) {
          self.storage.incrementCowCount();
          self.tryUnlockingAchievement("FRESH_MEAT");
        } else if (kind === Types.Entities.COWKING) {
          self.tryUnlockingAchievement("COW_KING");
        } else if (kind === Types.Entities.MINOTAUR) {
          self.tryUnlockingAchievement("MINOTAUR");
        }

        if (Math.floor((self.player.hitPoints * 100) / self.player.maxHitPoints) <= 1 && kind > Types.Entities.RAT2) {
          self.tryUnlockingAchievement("NOT_SAFU");
        }
      });

      self.client.onPlayerChangeHealth(function ({ health, isRegen, isHurt }) {
        var player = self.player;
        var diff;

        if (player && !player.isDead && !player.invincible) {
          diff = health - player.hitPoints;
          player.hitPoints = health;

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

      self.client.onPlayerChangeStats(function ({ maxHitPoints, damage, defense, absorb }) {
        if (self.player.maxHitPoints !== maxHitPoints || self.player.invincible) {
          self.player.maxHitPoints = maxHitPoints;
          self.player.hitPoints = maxHitPoints;

          self.updateBars();
        }
        if (self.player.damage !== damage) {
          self.player.damage = damage;
          self.updateDamage();
        }
        if (self.player.defense !== defense) {
          self.player.defense = defense;
          self.updateDefense();
        }
        if (self.player.absorb !== absorb) {
          self.player.absorb = absorb;
          self.updateAbsorb();
        }
      });

      self.client.onPlayerSettings(function ({ playerId, settings }) {
        var player = self.getEntityById(playerId);
        if (typeof settings.capeHue === "number") {
          player.capeHue = settings.capeHue;
        }
        if (typeof settings.capeSaturate === "number") {
          player.capeSaturate = settings.capeSaturate;
        }
        if (typeof settings.capeContrast === "number") {
          player.capeContrast = settings.capeContrast;
        }
      });

      self.client.onSetBonus(function (bonus, set) {
        self.player.setBonus = bonus;
        self.player.set = set;
      });

      self.client.onPlayerEquipItem(function ({ id: playerId, kind, level, bonus, type }) {
        var player = self.getEntityById(playerId);
        var name = Types.getKindAsString(kind);

        if (player) {
          if (type === "armor") {
            player.setArmorName(name);
            player.setArmorLevel(level);
            player.setArmorBonus(bonus);
            player.setSprite(self.sprites[name]);
          } else if (type === "weapon") {
            player.setWeaponName(name);
            player.setWeaponLevel(level);
            player.setWeaponBonus(bonus);
          } else if (type === "cape") {
            if (!kind || !level || !bonus) {
              player.removeCape();
            } else {
              player.setCape(`${name}:${level}:${bonus}`);
            }
          }
        }
      });

      self.client.onPlayerAuras(function (playerId, auras) {
        var player = self.getEntityById(playerId);
        if (player) {
          player.setAuras(auras);
        }
      });

      self.client.onPlayerTeleport(function (id, x, y) {
        var entity = null;
        var currentOrientation;

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

      self.client.onChatMessage(function ({
        entityId,
        name,
        message,
        type,
      }: {
        entityId: number;
        name: string;
        message: string;
        type: ChatType;
      }) {
        var entity = self.getEntityById(entityId);
        if (entity) {
          self.createBubble(entityId, message);
          self.assignBubbleTo(entity);
        }

        self.audioManager.playSound("chat");
        self.chat_callback({ entityId, name, message, type });
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

      self.client.onBossCheck(function (data) {
        const { status, message, hash, hash1, check } = data;

        if (status === "ok") {
          const position = parseInt(check[check.length - 1]);
          if (check[position] != position) {
            self.client.sendBanPlayer("Invalid check position");
          } else {
            // let s = check;
            // s = s.slice(0, position) + s.slice(position + 1, s.length - 1);
            // s = parseInt(s);

            // const now = Date.now();
            // const absS = Math.abs(s - now);
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
          self.showNotification(message);
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

      self.client.onReceiveUpgrade(function (data, meta) {
        const { luckySlot, isLucky7, isMagic8, isSuccess } = meta || {};

        self.isUpgradeItemSent = false;
        self.player.setUpgrade(data);
        self.updateUpgrade({ luckySlot, isSuccess });

        if (isLucky7) {
          self.tryUnlockingAchievement("LUCKY7");
        } else if (isMagic8) {
          // @NOTE Note ready yet, maybe later
          // self.tryUnlockingAchievement("MAGIC8");
        }
      });

      self.client.onReceiveAnvilUpgrade(function (isSuccess) {
        if (isSuccess) {
          self.setAnvilSuccess();
        } else {
          self.setAnvilFail();
        }
      });

      self.client.onReceiveAnvilRecipe(function (recipe) {
        self.setAnvilRecipe();

        if (recipe === "cowLevel" || recipe === "minotaurLevel") {
          self.app.closeUpgrade();
          self.audioManager.playSound("portal-open");
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

      self.client.onReceiveCowLevelStart(function ({ x, y }) {
        self.cowLevelPortalCoords = {
          x,
          y,
        };

        self.cowPortalStart = true;
        setTimeout(() => {
          self.cowPortalStart = false;
        }, 1200);
      });

      self.client.onReceiveCowLevelInProgress(function (cowLevelClock) {
        var selectedDate = new Date().valueOf() + cowLevelClock * 1000;

        if (!self.player.expansion1 || self.player.level < 45) {
          self.client.sendBanPlayer("Entered CowLevel without expansion or lower than lv.45");
        }

        $("#countdown")
          .countdown(selectedDate.toString())
          .on("update.countdown", function (event) {
            // @ts-ignore
            $(this).html(event.strftime("%M:%S"));
          })
          .on("finish.countdown", function () {
            $(this).html("Portal to the secret level closed.");

            setTimeout(() => {
              $(this).html("");
            }, 5000);
          });
      });

      self.client.onReceiveCowLevelEnd(function (isCompleted) {
        $("#countdown").countdown(0);
        $("#countdown").countdown("remove");

        self.cowLevelPortalCoords = null;

        if (self.player.gridY >= 464 && self.player.gridY <= 535) {
          const x = Math.ceil(randomRange(40, 45));
          const y = Math.ceil(randomRange(208, 213));

          // self.player.idle();
          self.player.stop_pathing_callback({ x, y, isWaypoint: true });
          // }, 100);

          if (isCompleted) {
            self.tryUnlockingAchievement("FARMER");
          }
        }
      });

      self.client.onReceiveMinotaurLevelStart(function () {
        self.minotaurPortalStart = true;
        setTimeout(() => {
          self.minotaurPortalStart = false;
        }, 1200);
      });

      self.client.onReceiveMinotaurLevelInProgress(function (minotaurLevelClock) {
        var selectedDate = new Date().valueOf() + minotaurLevelClock * 1000;

        if (!self.player.expansion1 || self.player.level < 54) {
          self.client.sendBanPlayer("Entered MinotaurLevel without expansion or lower than lv.54");
        }

        $("#countdown")
          .countdown(selectedDate.toString())
          .on("update.countdown", function (event) {
            // @ts-ignore
            $(this).html(event.strftime("%M:%S"));
          })
          .on("finish.countdown", function () {
            $(this).html("Portal to the secret level closed.");

            setTimeout(() => {
              $(this).html("");
            }, 5000);
          });
      });

      self.client.onReceiveMinotaurLevelEnd(function () {
        $("#countdown").countdown(0);
        $("#countdown").countdown("remove");

        if (self.player.gridY >= 464 && self.player.gridY <= 535) {
          const x = Math.ceil(randomRange(40, 45));
          const y = Math.ceil(randomRange(208, 213));

          self.player.stop_pathing_callback({ x, y, isWaypoint: true });
        }
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
  }

  /**
   * Links two entities in an attacker<-->target relationship.
   * This is just a utility method to wrap a set of instructions.
   *
   * @param {Entity} attacker The attacker entity
   * @param {Entity} target The target entity
   */
  createAttackLink(attacker, target) {
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
  }

  /**
   * Converts the current mouse position on the screen to world grid coordinates.
   * @returns {Object} An object containing x and y properties.
   */
  getMouseGridPosition() {
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
  }

  /**
   * Moves a character to a given location on the world grid.
   *
   * @param {Number} x The x coordinate of the target location.
   * @param {Number} y The y coordinate of the target location.
   */
  makeCharacterGoTo(character, x, y) {
    if (!this.map.isOutOfBounds(x, y)) {
      character.go(x, y);
    }
  }

  /**
   *
   */
  makeCharacterTeleportTo(character, x, y) {
    if (!this.map.isOutOfBounds(x, y)) {
      this.unregisterEntityPosition(character);

      character.setGridPosition(x, y);

      this.registerEntityPosition(character);
      this.assignBubbleTo(character);
    } else {
      console.debug("Teleport out of bounds: " + x + ", " + y);
    }
  }

  /**
   *
   */
  makePlayerAttackNext() {
    const pos = {
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
  }

  /**
   *
   */
  makePlayerAttackTo(pos) {
    const entity = this.getEntityAt(pos.x, pos.y);
    if (entity instanceof Mob) {
      this.makePlayerAttack(entity);
    }
  }

  /**
   * Moves the current player to a given target location.
   * @see makeCharacterGoTo
   */
  makePlayerGoTo(x, y) {
    this.makeCharacterGoTo(this.player, x, y);
  }

  /**
   * Moves the current player towards a specific item.
   * @see makeCharacterGoTo
   */
  makePlayerGoToItem(item) {
    if (item) {
      this.player.isLootMoving = true;
      this.makePlayerGoTo(item.gridX, item.gridY);
      this.client.sendLootMove(item, item.gridX, item.gridY);
    }
  }

  /**
   *
   */
  makePlayerTalkTo(npc) {
    if (npc) {
      this.player.setTarget(npc);
      this.player.follow(npc);
    }
  }

  makePlayerOpenChest(chest) {
    if (chest) {
      this.player.setTarget(chest);
      this.player.follow(chest);
    }
  }

  /**
   *
   */
  makePlayerAttack(mob) {
    this.createAttackLink(this.player, mob);
    this.client.sendAttack(mob);
  }

  setAnvilRecipe() {
    this.isAnvilFail = false;
    this.isAnvilSuccess = false;
    this.isAnvilRecipe = true;
    clearTimeout(this.anvilFailTimeout);
    clearTimeout(this.anvilSuccessTimeout);
    clearTimeout(this.anvilRecipeTimeout);
    this.anvilRecipeTimeout = setTimeout(() => {
      this.isAnvilRecipe = false;
    }, 3000);
  }

  setAnvilSuccess() {
    this.isAnvilFail = false;
    this.isAnvilSuccess = true;
    this.isAnvilRecipe = false;
    clearTimeout(this.anvilFailTimeout);
    clearTimeout(this.anvilSuccessTimeout);
    clearTimeout(this.anvilRecipeTimeout);
    this.anvilSuccessTimeout = setTimeout(() => {
      this.isAnvilSuccess = false;
    }, 3000);
  }

  setAnvilFail() {
    this.isAnvilFail = true;
    this.isAnvilSuccess = false;
    this.isAnvilRecipe = false;
    clearTimeout(this.anvilFailTimeout);
    clearTimeout(this.anvilSuccessTimeout);
    clearTimeout(this.anvilRecipeTimeout);
    this.anvilFailTimeout = setTimeout(() => {
      this.isAnvilFail = false;
    }, 3000);
  }

  /**
   *
   */
  makeNpcTalk(npc) {
    var msg;

    if (npc) {
      msg = npc.talk(this);
      this.previousClickPosition = null;
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
      } else if (npc.kind === Types.Entities.COWPORTAL) {
        if (this.player.level >= 45) {
          if (npc.gridX === 43 && npc.gridY === 211) {
            if (this.cowLevelPortalCoords) {
              this.tryUnlockingAchievement("SECRET_LEVEL");

              this.player.stop_pathing_callback({
                x: this.cowLevelPortalCoords.x,
                y: this.cowLevelPortalCoords.y,
                isWaypoint: true,
              });
            }
          } else {
            this.player.stop_pathing_callback({ x: 43, y: 212, isWaypoint: true });
          }
        }
      } else if (npc.kind === Types.Entities.MINOTAURPORTAL) {
        if (this.player.level >= 50) {
          if (npc.gridX === 40 && npc.gridY === 210) {
            if (this.minotaurLevelPortalCoords) {
              this.player.stop_pathing_callback({
                x: this.minotaurLevelPortalCoords.x,
                y: this.minotaurLevelPortalCoords.y,
                isWaypoint: true,
              });
            }
          } else {
            this.player.stop_pathing_callback({ x: 40, y: 211, isWaypoint: true });
          }
        }
      }
    }
  }

  getWaypointFromGrid(x, y) {
    return Types.waypoints.find(({ gridX, gridY }) => gridX === x && gridY === y);
  }

  /**
   * Loops through all the entities currently present in the game.
   * @param {Function} callback The function to call back (must accept one entity argument).
   */
  forEachEntity(callback) {
    _.each(this.entities, function (entity) {
      callback(entity);
    });
  }

  /**
   * Same as forEachEntity but only for instances of the Mob subclass.
   * @see forEachEntity
   */
  forEachMob(callback) {
    _.each(this.entities, function (entity: Entity) {
      if (entity instanceof Mob) {
        callback(entity);
      }
    });
  }

  /**
   * Loops through all entities visible by the camera and sorted by depth :
   * Lower 'y' value means higher depth.
   * Note: This is used by the Renderer to know in which order to render entities.
   */
  forEachVisibleEntityByDepth(callback) {
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
  }

  /**
   *
   */
  forEachVisibleTileIndex(callback, extra) {
    var m = this.map;

    this.camera.forEachVisiblePosition(function (x, y) {
      if (!m.isOutOfBounds(x, y)) {
        callback(m.GridPositionToTileIndex(x, y) - 1);
      }
    }, extra);
  }

  forEachVisibleTile(callback, extra) {
    var m = this.map;

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
  }

  forEachAnimatedTile(callback) {
    if (this.animatedTiles) {
      _.each(this.animatedTiles, function (tile) {
        callback(tile);
      });
    }
  }

  /**
   * Returns the entity located at the given position on the world grid.
   * @returns {Entity} the entity located at (x, y) or null if there is none.
   */
  getEntityAt(x, y, instance = null) {
    if (this.map.isOutOfBounds(x, y) || !this.entityGrid) {
      return null;
    }

    var entities = this.entityGrid[y][x];
    var entity = null;
    if (_.size(entities) > 0) {
      if (instance) {
        entity = Object.values(entities).find(entity => entity instanceof instance);
      } else {
        entity = entities[_.keys(entities)[0]];
      }
    } else {
      entity = this.getItemAt(x, y);
    }

    return entity;
  }

  getMobAt(x, y) {
    var entity = this.getEntityAt(x, y, Mob);
    if (entity && entity instanceof Mob) {
      return entity;
    }
    return null;
  }

  getPlayerAt(x, y) {
    var entity = this.getEntityAt(x, y, Player);
    if (entity && entity instanceof Player && entity !== this.player && this.player.pvpFlag) {
      return entity;
    }
    return null;
  }

  getNpcAt(x, y) {
    var entity = this.getEntityAt(x, y, Npc);
    if (entity && entity instanceof Npc) {
      return entity;
    }
    return null;
  }

  getChestAt(x, y) {
    var entity = this.getEntityAt(x, y, Chest);
    if (entity && entity instanceof Chest) {
      return entity;
    }
    return null;
  }

  getItemAt(x, y) {
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
  }

  /**
   * Returns true if an entity is located at the given position on the world grid.
   * @returns {Boolean} Whether an entity is at (x, y).
   */
  isEntityAt(x, y) {
    return !_.isNull(this.getEntityAt(x, y));
  }

  isMobAt(x, y) {
    return !_.isNull(this.getMobAt(x, y));
  }

  isPlayerAt(x, y) {
    return !_.isNull(this.getPlayerAt(x, y));
  }

  isItemAt(x, y) {
    return !_.isNull(this.getItemAt(x, y));
  }

  isNpcAt(x, y) {
    return !_.isNull(this.getNpcAt(x, y));
  }

  isChestAt(x, y) {
    return !_.isNull(this.getChestAt(x, y));
  }

  /**
   * Finds a path to a grid position for the specified character.
   * The path will pass through any entity present in the ignore list.
   */
  findPath(character, x, y, ignoreList) {
    var self = this,
      grid = this.pathingGrid,
      path = [];

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
      console.error("Error while finding the path to " + x + ", " + y + " for " + character.id);
    }
    return path;
  }

  /**
   * Toggles the visibility of the pathing grid for debugging purposes.
   */
  togglePathingGrid() {
    if (this.debugPathing) {
      this.debugPathing = false;
    } else {
      this.debugPathing = true;
    }
  }

  /**
   * Toggles the visibility of the FPS counter and other debugging info.
   */
  toggleDebugInfo() {
    if (this.renderer && this.renderer.isDebugInfoVisible) {
      this.renderer.isDebugInfoVisible = false;
    } else {
      this.renderer.isDebugInfoVisible = true;
    }
  }

  /**
   *
   */
  movecursor() {
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
          this.onRemoveTarget();
        }
        this.lastHovered = null;
      }
    }
  }

  onRemoveTarget = _.debounce(() => {
    $("#inspector").fadeOut("fast");
    $("#inspector .level").text("");
    $("#inspector .health").text("");
    if (this.player) {
      this.player.inspecting = null;
    }
  }, 2000);

  /**
   * Moves the player one space, if possible
   */
  keys(pos) {
    this.hoveringCollidingTile = false;
    this.hoveringPlateauTile = false;

    if ((pos.x === this.previousClickPosition?.x && pos.y === this.previousClickPosition?.y) || this.isZoning()) {
      return;
    } else {
      if (!this.player.disableKeyboardNpcTalk) this.previousClickPosition = pos;
    }

    if (!this.player.isMoving()) {
      this.cursorVisible = false;
      this.processInput(pos);
    }
  }

  click() {
    var pos = this.getMouseGridPosition();

    if (pos.x === this.previousClickPosition?.x && pos.y === this.previousClickPosition?.y) {
      return;
    } else {
      this.previousClickPosition = pos;
    }

    this.processInput(pos);
  }

  isCharacterZoning = false;

  /**
   * Processes game logic when the user triggers a click/touch event during the game.
   */
  processInput(pos) {
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

      // @NOTE: For an unknown reason when a mob dies and it's moving, it doesn't unregister it's "1" on
      // the pathing grid so it's not possible to navigate to the coords anymore. Ths fix is to manually reset
      // to "0" the pathing map if there is no entity registered on the coords.
      if ((entity === null || entity instanceof Item) && this.map.grid[pos.y][pos.x] !== 1) {
        this.removeFromPathingGrid(pos.x, pos.y);
      }

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

            if (this.player.moveUp || this.player.moveDown || this.player.moveLeft || this.player.moveRight) {
              this.player.disableKeyboardNpcTalk = true;
            }
          }
        }
      } else if (entity instanceof Chest) {
        this.makePlayerOpenChest(entity);
      } else {
        this.makePlayerGoTo(pos.x, pos.y);
      }
    }
  }

  isMobOnSameTile(mob, x?: number, y?: number) {
    var X = x || mob.gridX;
    var Y = y || mob.gridY;
    var list = this.entityGrid[Y][X];
    var result = false;

    _.each(list, function (entity) {
      if (entity instanceof Mob && entity.id !== mob.id) {
        result = true;
      }
    });
    return result;
  }

  getFreeAdjacentNonDiagonalPosition(entity) {
    var self = this,
      result = null;

    entity.forEachAdjacentNonDiagonalPosition(function (x, y, orientation) {
      if (!result && !self.map.isColliding(x, y) && !self.isMobAt(x, y)) {
        result = { x: x, y: y, o: orientation };
      }
    });
    return result;
  }

  tryMovingToADifferentTile(character) {
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
          if (this.player && this.player.target && attacker.id === this.player.target.id) {
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
  }

  /**
   *
   */
  onCharacterUpdate(character) {
    var time = this.currentTime;

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
  }

  /**
   *
   */
  isZoningTile(x, y) {
    var c = this.camera;

    x = x - c.gridX;
    y = y - c.gridY;

    if (x === 0 || y === 0 || x === c.gridW - 1 || y === c.gridH - 1) {
      return true;
    }
    return false;
  }

  /**
   *
   */
  getZoningOrientation(x, y) {
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
  }

  startZoningFrom(x, y) {
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
  }

  enqueueZoningFrom(x, y) {
    this.zoningQueue.push({ x: x, y: y });

    if (this.zoningQueue.length === 1) {
      this.startZoningFrom(x, y);
    }
  }

  endZoning() {
    this.currentZoning = null;
    this.isCharacterZoning = false;
    this.resetZone();
    this.zoningQueue.shift();

    if (this.zoningQueue.length > 0) {
      var pos = this.zoningQueue[0];
      this.startZoningFrom(pos.x, pos.y);
    }
  }

  isZoning() {
    return !_.isNull(this.currentZoning) || this.isCharacterZoning;
  }

  resetZone() {
    this.bubbleManager.clean();
    this.initAnimatedTiles();
    this.renderer.renderStaticCanvases();
  }

  resetCamera() {
    this.camera.focusEntity(this.player);
    this.resetZone();
  }

  say(message) {
    const partyRegexp = /^\/party (create|join|invite|leave|remove|disband|leader)(.+)?/;
    const args = message.match(partyRegexp);

    if (args) {
      const action = args[1];
      const param = (args[2] || "").trim();

      switch (action) {
        case "create":
          this.client.sendPartyCreate();
          break;
        case "join":
          if (param) {
            this.client.sendPartyJoin(parseInt(param, 10));
          } else {
            this.chat_callback({ message: "You must specify the party id you want to join", type: "error" });
          }
          break;
        case "invite":
          if (param) {
            this.client.sendPartyInvite(param);
          } else {
            this.chat_callback({
              message: "You must specify the player you want to invite to the party",
              type: "error",
            });
          }
          break;
        case "leave":
          if (this.player.partyId) {
            this.client.sendPartyLeave();
          } else {
            this.chat_callback({
              message: "You are not in a party",
              type: "error",
            });
          }
          break;
        case "remove":
          if (param) {
            this.client.sendPartyRemove(param);
          } else {
            this.chat_callback({
              message: "You must specify the player name you want to remove from the party",
              type: "error",
            });
          }
          break;
        case "disband":
          if (!this.player.partyLeader?.id) {
            this.chat_callback({
              message: "You are not in a party",
              type: "error",
            });
          } else if (this.player.partyLeader?.id === this.player.id) {
            this.client.sendPartyDisband(param);
          } else {
            this.chat_callback({
              message: "Only the party leader can disband the party",
              type: "error",
            });
          }
          break;
        case "leader":
          if (!this.player.partyLeader?.id) {
            this.chat_callback({
              message: "You are not in a party",
              type: "error",
            });
          } else if (this.player.partyLeader?.id === this.player.id) {
            // @TODO!
            // this.client.sendPartyLeader(param);
          } else {
            this.chat_callback({
              message: "Only the party leader can assign another player as the party leader",
              type: "error",
            });
          }
          break;
        default:
          this.chat_callback({
            message: "invalid /party command",
            type: "error",
          });
      }

      return;
    }

    this.client.sendChat(message);
  }

  createBubble(id, message) {
    this.bubbleManager.create(id, message, this.currentTime);
  }

  destroyBubble(id) {
    this.bubbleManager.destroyBubble(id);
  }

  assignBubbleTo(character) {
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
  }

  respawn() {
    console.debug("Beginning respawn");

    this.entities = {};
    this.initEntityGrid();
    this.initPathingGrid();
    this.initRenderingGrid();

    this.player = new Warrior("player", this.username);
    this.player.account = this.account;

    // this.initPlayer();
    this.app.initTargetHud();

    this.started = true;
    this.client.enable();
    this.client.sendLogin(this.player);

    this.storage.incrementRevives();

    if (this.renderer.mobile || this.renderer.tablet) {
      this.renderer.clearScreen(this.renderer.context);
    }

    console.debug("Finished respawn");
  }

  onGameStart(callback) {
    this.gamestart_callback = callback;
  }

  onDisconnect(callback) {
    this.disconnect_callback = callback;
  }

  onPlayerDeath(callback) {
    this.playerdeath_callback = callback;
  }

  onGameCompleted(callback) {
    this.gamecompleted_callback = callback;
  }

  onBossCheckFailed(callback) {
    this.bosscheckfailed_callback = callback;
  }

  onUpdateTarget(callback) {
    this.updatetarget_callback = callback;
  }

  onPlayerExpChange(callback) {
    this.playerexp_callback = callback;
  }

  onPlayerHealthChange(callback) {
    this.playerhp_callback = callback;
  }

  onPlayerHurt(callback) {
    this.playerhurt_callback = callback;
  }

  onPlayerEquipmentChange(callback) {
    this.equipment_callback = callback;
  }

  onNbPlayersChange(callback) {
    this.nbplayers_callback = callback;
  }

  onChatMessage(callback) {
    this.chat_callback = callback;
  }

  onNotification(callback) {
    this.notification_callback = callback;
  }

  onPlayerInvincible(callback) {
    this.invincible_callback = callback;
  }

  resize() {
    var x = this.camera.x;
    var y = this.camera.y;

    this.renderer.rescale();
    this.camera = this.renderer.camera;
    this.camera.setPosition(x, y);

    this.renderer.renderStaticCanvases();
  }

  updateBars() {
    if (this.player && this.playerhp_callback) {
      this.playerhp_callback(this.player.hitPoints, this.player.maxHitPoints);
      $("#player-hp").text(this.player.maxHitPoints);
    }
  }

  updateDamage() {
    $("#player-damage").text(this.player.damage);
  }

  updateDefense() {
    $("#player-defense").text(this.player.defense);
  }

  updateAbsorb() {
    $("#player-absorb").text(this.player.absorb);
  }

  updateExpBar() {
    if (this.player && this.playerexp_callback) {
      var expInThisLevel = this.player.experience - Types.expForLevel[this.player.level - 1];
      var expForLevelUp = Types.expForLevel[this.player.level] - Types.expForLevel[this.player.level - 1];
      this.playerexp_callback(expInThisLevel, expForLevelUp);

      $("#player-level").text(this.player.level);
    }
  }

  updateTarget(targetId, points, healthPoints, maxHp) {
    if (this.player.hasTarget() && this.updatetarget_callback) {
      var target = this.getEntityById(targetId);
      target.name = Types.getKindAsString(target.kind);
      target.points = points;
      target.healthPoints = healthPoints;
      target.maxHp = maxHp;
      this.updatetarget_callback(target);
    }
  }

  getDeadMobPosition(mobId) {
    var position;

    if (mobId in this.deathpositions) {
      position = this.deathpositions[mobId];
      delete this.deathpositions[mobId];
    }

    return position;
  }

  onAchievementUnlock(callback) {
    this.unlock_callback = callback;
  }

  tryUnlockingAchievement(name) {
    var achievement = null;
    var self = this;

    return new Promise<void>(resolve => {
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
  }

  showNotification(message, timeout = 3000) {
    if (this.notification_callback) {
      this.notification_callback(message, timeout);
    }
  }

  removeObsoleteEntities() {
    var nb = _.size(this.obsoleteEntities),
      self = this;

    if (nb > 0) {
      _.each(this.obsoleteEntities, function (entity) {
        if (entity.id != self.player.id) {
          // never remove yourself
          self.removeEntity(entity);
        }
      });
      console.debug(
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
  }

  /**
   * Fake a mouse move event in order to update the cursor.
   *
   * For instance, to get rid of the sword cursor in case the mouse is still hovering over a dying mob.
   * Also useful when the mouse is hovering a tile where an item is appearing.
   */
  updateCursor() {
    if (!this.cursorVisible) var keepCursorHidden = true;

    this.movecursor();
    this.updateCursorLogic();

    if (keepCursorHidden) this.cursorVisible = false;
  }

  /**
   * Change player plateau mode when necessary
   */
  updatePlateauMode() {
    if (this.map.isPlateau(this.player.gridX, this.player.gridY)) {
      this.player.isOnPlateau = true;
    } else {
      this.player.isOnPlateau = false;
    }
  }

  updatePlayerCheckpoint() {
    var checkpoint = this.map.getCurrentCheckpoint(this.player);

    if (checkpoint) {
      var lastCheckpoint = this.player.lastCheckpoint;
      if (!lastCheckpoint || (lastCheckpoint && lastCheckpoint.id !== checkpoint.id)) {
        this.player.lastCheckpoint = checkpoint;
        this.client.sendCheck(checkpoint.id);
      }
    }
  }

  checkUndergroundAchievement() {
    var music = this.audioManager.getSurroundingMusic(this.player);

    if (music) {
      if (music.name === "cave") {
        this.tryUnlockingAchievement("UNDERGROUND");
      }
    }
  }

  makeAttackerFollow(attacker) {
    var target = attacker.target;

    if (attacker.isAdjacent(attacker.target)) {
      attacker.lookAtTarget();
    } else {
      attacker.follow(target);
    }
  }

  forEachEntityAround(x, y, r, callback) {
    for (var i = x - r, max_i = x + r; i <= max_i; i += 1) {
      for (var j = y - r, max_j = y + r; j <= max_j; j += 1) {
        if (!this.map.isOutOfBounds(i, j)) {
          _.each(this.renderingGrid[j][i], function (entity) {
            callback(entity);
          });
        }
      }
    }
  }

  checkOtherDirtyRects(r1, source, x, y) {
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
  }

  tryLootingItem(item) {
    try {
      this.player.loot(item);
      this.client.sendLoot(item); // Notify the server that this item has been looted
      this.removeItem(item);

      if (!this.player.partyId) {
        this.showNotification(item.getLootMessage());
      }

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

      if (item.wasDropped && !item.playersInvolved.includes(this.playerId)) {
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
  }
}

export default Game;
