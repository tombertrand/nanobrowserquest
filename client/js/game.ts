/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-shadow */
import * as Sentry from "@sentry/browser";
import CryptoJS from "crypto-js";
import * as _ from "lodash";

import { kinds, Types } from "../../shared/js/gametypes";
import { itemGoldMap, merchantItems } from "../../shared/js/gold";
import {
  DELETE_SLOT,
  INVENTORY_SLOT_COUNT,
  MERCHANT_SLOT_COUNT,
  MERCHANT_SLOT_RANGE,
  Slot,
  STASH_SLOT_COUNT,
  STASH_SLOT_PAGES,
  STASH_SLOT_PER_PAGE,
  STASH_SLOT_RANGE,
  TRADE_SLOT_COUNT,
  TRADE_SLOT_RANGE,
  UPGRADE_SLOT_COUNT,
  UPGRADE_SLOT_RANGE,
} from "../../shared/js/slots";
import {
  ACHIEVEMENT_CRYSTAL_INDEX,
  ACHIEVEMENT_HERO_INDEX,
  ACHIEVEMENT_NFT_INDEX,
  ACHIEVEMENT_WING_INDEX,
} from "../../shared/js/types/achievements";
import { AchievementName } from "../../shared/js/types/achievements";
import { expForLevel } from "../../shared/js/types/experience";
import { HASH_BAN_DELAY } from "../../shared/js/utils";
import { randomInt, toArray, toString, validateQuantity } from "../../shared/js/utils";
import { getAchievements } from "./achievements";
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
import Npc from "./npc";
import Pathfinder from "./pathfinder";
import Pet from "./pet";
import Player from "./player";
import Renderer from "./renderer";
import Spell from "./spell";
import Sprite from "./sprite";
import AnimatedTile from "./tile";
import Transition from "./transition";
import Updater from "./updater";
import Warrior from "./warrior";

import type App from "./app";

interface WorldPlayer {
  name: string;
  level: number;
  network: Network;
  hash: boolean;
  partyId?: number;
}

class Game {
  app: App;
  ready: boolean;
  started: boolean;
  isLoaded: boolean;
  hasNeverStarted: boolean;
  isUpgradeItemSent: boolean;
  anvilRecipe: Recipes;
  isAnvilSuccess: boolean;
  isAnvilFail: boolean;
  isAnvilTransmute: boolean;
  isAnvilRuneword: boolean;
  isAnvilChestblue: boolean;
  isAnvilChestgreen: boolean;
  isAnvilChestpurple: boolean;
  isAnvilChestdead: boolean;
  isAnvilChestred: boolean;
  anvilAnimationTimeout: any;
  cowPortalStart: boolean;
  cowLevelPortalCoords: { x: number; y: number } | null;
  minotaurPortalStart: boolean;
  minotaurLevelPortalCoords: { x: number; y: number };
  stonePortalStart: boolean;
  stoneLevelPortalCoords: { x: number; y: number };
  gatewayPortalStart: boolean;
  gatewayLevelPortalCoords: { x: number; y: number };
  deathAngelLevelPortalCoords: { x: number; y: number };
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
  currentCursor: any;
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
  hoveringPet: boolean;
  pvp: boolean;
  partyEnabled: boolean;
  tradeEnabled: boolean;
  debug: boolean;
  showEffects: boolean;
  hoveringPlayerPvP: boolean;
  hoveringMob: boolean;
  hoveringItem: boolean;
  hoveringCollidingTile: boolean;
  infoManager: InfoManager;
  currentZoning: Transition | null;
  cursors: {};
  sprites: any;
  currentTime: any;
  animatedTiles: any[] | null;
  highAnimatedTiles: any[] | null;
  debugPathing: boolean;
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
  resistanceAnimation: Animation;
  arcaneAnimation: Animation;
  anvilAnimation: Animation;
  defenseSkillAnimation: Animation;
  skillResistanceAnimation: Animation;
  attackSkillAnimation: Animation;
  skillCastAnimation: Animation;
  skillMagicAnimation: Animation;
  skillFlameAnimation: Animation;
  skillLightningAnimation: Animation;
  skillColdAnimation: Animation;
  skillPoisonAnimation: Animation;
  curseHealthAnimation: Animation;
  curseResistanceAnimation: Animation;
  weaponEffectAnimation: Animation;
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
  account: string;
  password: string;
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
  missingaccount_callback: any;
  account_callback: any;
  bosscheckfailed_callback: any;
  chat_callback: any;
  invinciblestart_callback: any;
  invinciblestop_callback: any;
  hoveringPlateauTile: any;
  hoveringOtherPlayer: any;
  lastHovered: any;
  zoningOrientation: any;
  updatetarget_callback: any;
  playerexp_callback: any;
  playerhp_callback: any;
  notification_callback: any;
  unlock_callback: any;
  slotToDelete?: number;
  confirmedSoldItemToMerchant: {
    fromSlot: number;
    toSlot: number;
    transferedQuantity?: number;
    confirmed: boolean;
  } | null;
  worldPlayers: WorldPlayer[];
  network: Network;
  explorer: Explorer;
  hoverSlotToDelete: number | null;
  isTeleporting: boolean;
  partyInvites: Partial<WorldPlayer>[];
  partyInvitees: string[];
  showAnvilOdds: boolean;
  showHealthAboveBars: boolean;
  currentStashPage: number;
  activatedMagicStones: number[];
  activatedBlueFlames: number[];
  isAltarChaliceActivated: boolean;
  altarChaliceNpcId: number;
  altarSoulStoneNpcId: number;
  treeNpcId: number;
  traps: { id: number; x: number; y: number }[];
  statues: { id: number; x: number; y: number }[];
  gatewayFxNpcId: number;
  goldBank: number;
  slotSockets: (number | string)[] | null;
  slotSocketCount: number | null;
  cursorOverSocket: number | null;
  isPanelOpened: boolean;
  isDragStarted: boolean;
  hashCheckInterval: any;
  admins: string[];
  onSendMoveItemTimeout: NodeJS.Timeout;

  expansion1: boolean;
  expansion2: boolean;

  constructor(app) {
    this.app = app;
    this.ready = false;
    this.started = false;
    this.isLoaded = false;
    this.hasNeverStarted = true;
    this.isUpgradeItemSent = false;
    this.anvilRecipe = null;
    this.isAnvilSuccess = false;
    this.isAnvilFail = false;
    this.isAnvilTransmute = false;
    this.isAnvilRuneword = false;
    this.isAnvilChestblue = false;
    this.isAnvilChestgreen = false;
    this.isAnvilChestpurple = false;
    this.isAnvilChestdead = false;
    this.isAnvilChestred = false;
    this.anvilAnimationTimeout = null;
    this.cowPortalStart = false;
    this.cowLevelPortalCoords = null;
    this.minotaurPortalStart = false;
    this.minotaurLevelPortalCoords = { x: 34, y: 498 };
    this.stonePortalStart = false;
    this.stoneLevelPortalCoords = { x: 97, y: 728 };
    this.gatewayPortalStart = false;
    this.gatewayLevelPortalCoords = { x: 13, y: 777 };
    this.deathAngelLevelPortalCoords = { x: 98, y: 764 };
    this.network = null;
    this.explorer = null;
    this.hoverSlotToDelete = null;
    this.isTeleporting = false;
    this.showAnvilOdds = false;
    this.showHealthAboveBars = false;
    this.confirmedSoldItemToMerchant = null;
    this.isPanelOpened = false;
    this.isDragStarted = false;
    this.hashCheckInterval = null;
    this.onSendMoveItemTimeout = null;

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
    this.resistanceAnimation = null;
    this.arcaneAnimation = null;
    this.anvilAnimation = null;
    this.defenseSkillAnimation = null;
    this.skillResistanceAnimation = null;
    this.skillCastAnimation = null;
    this.skillMagicAnimation = null;
    this.skillFlameAnimation = null;
    this.skillLightningAnimation = null;
    this.skillColdAnimation = null;
    this.skillPoisonAnimation = null;
    this.curseHealthAnimation = null;
    this.curseResistanceAnimation = null;
    this.weaponEffectAnimation = null;
    this.partyInvites = [];
    this.partyInvitees = [];
    this.expansion1 = false;
    this.expansion2 = false;

    // Player
    this.player = new Warrior("player", { name: "" });
    this.worldPlayers = [];
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
    this.currentStashPage = 0;

    this.cursorVisible = true;
    this.selectedX = 0;
    this.selectedY = 0;
    this.selectedCellVisible = false;
    this.targetColor = "rgba(255, 255, 255, 0.5)";
    this.targetCellVisible = true;
    this.hoveringTarget = false;
    this.hoveringPlayer = false;
    this.pvp = false;
    this.partyEnabled = false;
    this.tradeEnabled = false;
    this.hoveringPlayerPvP = false;
    this.showEffects = true;
    this.hoveringMob = false;
    this.hoveringItem = false;
    this.hoveringCollidingTile = false;

    this.activatedMagicStones = [];
    this.activatedBlueFlames = [];
    this.isAltarChaliceActivated = false;
    this.altarChaliceNpcId = null;
    this.altarSoulStoneNpcId = null;
    this.treeNpcId = null;
    this.traps = [];
    this.statues = [];
    this.gatewayFxNpcId = null;
    this.slotSockets = null;
    this.slotSocketCount = null;

    // combat
    // @ts-ignore
    this.infoManager = new InfoManager(this);

    // zoning
    this.currentZoning = null;
    this.cursors = {};
    this.sprites = {};

    // tile animation
    this.animatedTiles = null;
    this.highAnimatedTiles = null;

    // debug
    this.debugPathing = false;
    this.admins = [];
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

  setShowAnvilOdds(enabled) {
    this.showAnvilOdds = enabled;
  }

  setShowHealthAboveBars(enabled) {
    this.showHealthAboveBars = enabled;
  }

  loadMap() {
    this.map = new Map(!this.renderer.upscaledRendering, this);
  }

  initPlayer() {
    if (this.storage.hasAlreadyPlayed() && this.storage.data.player) {
      if (this.storage.data.player.armor && this.storage.data.player.weapon) {
        this.player.setSpriteName(this.storage.data.player.armor);
        this.player.setWeaponName(this.storage.data.player.weapon);
      }
    }
    this.player.setSprite(this.getSprite(this.player.getSpriteName()));
    this.player.idle();

    console.debug("Finished initPlayer");
  }

  initShadows() {
    this.shadows = {};
    this.shadows["small"] = this.getSprite("shadow16");
  }

  initCursors() {
    this.cursors["hand"] = this.getSprite("hand");
    this.cursors["attack"] = this.getSprite("attack");
    this.cursors["loot"] = this.getSprite("loot");
    this.cursors["target"] = this.getSprite("target");
    this.cursors["arrow"] = this.getSprite("arrow");
    this.cursors["talk"] = this.getSprite("talk");
    this.cursors["join"] = this.getSprite("talk");
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

    this.resistanceAnimation = new Animation("idle_down", 7, 0, 16, 8);
    this.resistanceAnimation.setSpeed(140);

    this.arcaneAnimation = new Animation("idle_down", 4, 0, 36, 15);
    this.arcaneAnimation.setSpeed(140);

    this.anvilAnimation = new Animation("idle_down", 4, 0, 15, 8);
    this.anvilAnimation.setSpeed(80);

    this.defenseSkillAnimation = new Animation("idle_down", 8, 0, 32, 32);
    this.defenseSkillAnimation.setSpeed(125);

    this.skillResistanceAnimation = new Animation("idle_down", 24, 0, 30, 36);
    this.skillResistanceAnimation.setSpeed(25);

    this.skillCastAnimation = new Animation("idle_down", 17 + 1, 0, 48, 48);
    this.skillCastAnimation.setSpeed(50);

    this.skillMagicAnimation = new Animation("idle_down", 12 + 1, 0, 64, 64);
    this.skillMagicAnimation.setSpeed(100);

    this.skillFlameAnimation = new Animation("idle_down", 12 + 1, 0, 34, 58);
    this.skillFlameAnimation.setSpeed(125);

    this.skillLightningAnimation = new Animation("idle_down", 8 + 1, 0, 28, 50);
    this.skillLightningAnimation.setSpeed(125);

    this.skillColdAnimation = new Animation("idle_down", 14 + 1, 0, 72, 72);
    this.skillColdAnimation.setSpeed(75);

    this.skillPoisonAnimation = new Animation("idle_down", 8 + 1, 0, 24, 60);
    this.skillPoisonAnimation.setSpeed(125);

    this.weaponEffectAnimation = new Animation("idle_down", 6, 0, 20, 20);
    this.weaponEffectAnimation.setSpeed(140);

    this.curseHealthAnimation = new Animation("idle_down", 17 + 1, 0, 20, 20);
    this.curseHealthAnimation.setSpeed(25);

    this.curseResistanceAnimation = new Animation("idle_down", 17 + 1, 0, 20, 20);
    this.curseResistanceAnimation.setSpeed(100);
  }

  initSettings(settings) {
    const { musicVolume = 0.6, soundVolume = 0.6 } = this.storage.data.settings;

    if (!this.storage.isMusicEnabled()) {
      this.audioManager.disableMusic();
    } else {
      $("#mute-music-checkbox").prop("checked", true);
      this.audioManager.updateMusicVolume(musicVolume);
    }

    if (!this.storage.isSoundEnabled()) {
      this.audioManager.disableSound();
    } else {
      $("#mute-sound-checkbox").prop("checked", true);
      this.audioManager.updateSoundVolume(soundVolume);
    }

    var handleMusic = $("#music-handle");
    $("#music-slider").slider({
      min: 0,
      max: 100,
      value: Math.round(musicVolume * 100),
      create: () => {
        handleMusic.text(`${Math.round(musicVolume * 100)}%`);
      },
      slide: (_event, ui) => {
        handleMusic.text(`${ui.value}%`);
        this.storage.setMusicVolume(ui.value / 100);
        this.audioManager.updateMusicVolume(ui.value / 100);
      },
    });

    var handleSound = $("#sound-handle");
    $("#sound-slider").slider({
      min: 0,
      max: 100,
      value: Math.round(soundVolume * 100),
      create: () => {
        handleSound.text(`${Math.round(soundVolume * 100)}%`);
      },
      slide: (_event, ui) => {
        handleSound.text(`${ui.value}%`);
        this.storage.setSoundVolume(ui.value / 100);
        this.audioManager.updateSoundVolume(ui.value / 100);
      },
    });

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

    this.showEffects = settings.effects;
    $("#effects-checkbox").prop("checked", settings.effects);

    this.pvp = settings.pvp;
    $("#pvp-checkbox").prop("checked", settings.pvp);

    this.partyEnabled = settings.partyEnabled;
    $("#party-checkbox").prop("checked", settings.partyEnabled);

    this.tradeEnabled = settings.tradeEnabled;
    $("#trade-checkbox").prop("checked", settings.tradeEnabled);

    this.debug = this.storage.debugEnabled();
    $("#debug-checkbox").prop("checked", this.debug);

    if (this.storage.showAnvilOddsEnabled()) {
      this.setShowAnvilOdds(true);
      $("#anvil-odds-checkbox").prop("checked", true);
    } else {
      this.setShowAnvilOdds(false);
    }

    if (this.storage.showHealthAboveBarsEnabled()) {
      this.setShowAnvilOdds(true);
      $("#health-above-bars-checkbox").prop("checked", true);
    } else {
      this.setShowAnvilOdds(false);
    }

    this.player.capeHue = settings.capeHue;
    var handleHue = $("#cape-hue-handle");
    $("#cape-hue-slider").slider({
      min: -180,
      max: 180,
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

    this.player.capeBrightness = settings.capeBrightness;
    var handleBrightness = $("#cape-brightness-handle");
    $("#cape-brightness-slider").slider({
      min: 0,
      max: 10,
      value: settings.capeBrightness,
      create: () => {
        handleBrightness.text(`${settings.capeBrightness}`);
      },
      slide: (_event, ui) => {
        handleBrightness.text(`${ui.value}`);
        this.player.setCapeBrightness(ui.value);
        this.updateCapePreview();
      },
      change: (_event, ui) => {
        this.client.sendSettings({ capeBrightness: ui.value });
      },
    });

    this.updateCapePreview();
  }

  updateCapePreview() {
    const hue = this.player.capeHue;
    const saturate = this.player.capeSaturate;
    const contrast = this.player.capeContrast;
    const brightness = this.player.capeBrightness;

    $("#settings-cape-preview").css(
      "filter",
      `hue-rotate(${hue}deg) saturate(${saturate}%) contrast(${contrast}%) brightness(${brightness})`,
    );
  }

  toggleCapeSliders(isEnabled) {
    $("#cape-hue-slider").slider(isEnabled ? "enable" : "disable");
    $("#cape-saturate-slider").slider(isEnabled ? "enable" : "disable");
    $("#cape-contrast-slider").slider(isEnabled ? "enable" : "disable");
    $("#cape-brightness-slider").slider(isEnabled ? "enable" : "disable");
  }

  initTooltips() {
    var self = this;

    $(document).tooltip({
      items: "[data-item]",
      track: true,
      // hide: 100000,
      position: { my: "left bottom-10", at: "left bottom", collision: "flipfit" },
      close: function () {
        self.hoverSlotToDelete = null;
        self.slotSockets = null;
        self.slotSocketCount = null;
      },
      content() {
        if (!self.player) return;

        const element = $(this);
        const item = element.attr("data-item");
        const level = parseInt(element.attr("data-level") || "1", 10);
        const rawBonus = toArray(element.attr("data-bonus"));
        const rawSkill = element.attr("data-skill") ? Number(element.attr("data-skill")) : null;
        const rawSocket = toArray(element.attr("data-socket"));
        const slot = parseInt(element.parent().attr("data-slot") || "0", 10);
        const isEquippedItemSlot = Object.values(Slot).includes(slot);
        const amount = parseInt(element.attr("data-amount") || "0", 10);

        self.slotSockets = rawSocket;
        self.slotSocketCount = rawSocket?.length;

        self.hoverSlotToDelete = slot;

        let setName = null;
        let setParts = [];
        let currentSet = null;
        let setBonus = [];

        if (isEquippedItemSlot) {
          currentSet = Types.kindAsStringToSet[item];

          const playerItems = self.player.getEquipment();

          if (currentSet) {
            setName = `* ${_.capitalize(currentSet)} Set *`;
            setParts = Types.setItemsNameMap[currentSet].map((description, index) => {
              let setPart = Types.setItems[currentSet][index];
              let isActive = false;
              if (typeof setPart === "string") {
                isActive = playerItems.includes(Types.setItems[currentSet][index]);
              } else if (Array.isArray(setPart)) {
                isActive = setPart.some(part => playerItems.includes(part));
              }

              return {
                description,
                isActive,
              };
            });

            if (self.player.setBonus[currentSet]) {
              let setPartCount = self.player.setBonus[currentSet];
              if (setPartCount === Types.setItems[currentSet].length) {
                setPartCount = Object.keys(Types.setBonus[currentSet]).length;
              }

              setBonus = Types.getSetBonus(currentSet, setPartCount);
            }
          }
        }

        let content = self.generateItemTooltipContent({
          element,
          item,
          level,
          rawBonus,
          rawSkill,
          rawSocket,
          playerBonus: self.player.bonus,
          amount,
          currentSet,
          setName,
          setParts,
          setBonus,
        });

        return content;
      },
    });
  }

  generateItemTooltipContent({
    isSocketItem = false,
    element = null,
    item,
    level,
    rawBonus,
    rawSkill,
    rawSocket,
    playerBonus,
    amount,
    currentSet,
    setName,
    setParts,
    setBonus,
  }) {
    const {
      name,
      isUnique,
      isRune,
      isRuneword,
      isJewel,
      isStone,
      isSuperior,
      itemClass,
      defense,
      damage,
      healthBonus,
      magicDamage,
      flameDamage,
      lightningDamage,
      pierceDamage,
      bonus = [],
      skill,
      requirement,
      description,
      partyBonus = [],
      runeBonus = [],
      runeRank,
      socket,
      goldAmount,
    } = Types.getItemDetails({
      item,
      level,
      rawBonus,
      rawSkill,
      rawSocket,
      playerBonus,
      amount,
    });

    const isQuantity = Types.isQuantity(item);

    const isConsumable = Types.isConsumable(item);

    const isLevelVisible =
      level &&
      !isRune &&
      !isJewel &&
      !isStone &&
      !Types.isSingle(item) &&
      !Types.isNotStackableItem(item) &&
      !isQuantity &&
      !isConsumable;
    const isMerchantVisible = $("#merchant").hasClass("visible");
    let buyOrSell = "";
    if (isMerchantVisible && element) {
      if (element.closest("#inventory")[0]) {
        buyOrSell = "Sell";
      } else if (element.closest("#merchant")[0]) {
        buyOrSell = "Buy";
      }
    }

    const itemName = Types.getDisplayName(item, false);
    const type = kinds[item][1];
    const isRing = Types.isRing(item);
    const isAmulet = Types.isAmulet(item);

    currentSet = _.has(Types.kindAsStringToSet, item) ? Types.kindAsStringToSet[item] : "";

    const setRingOrAmuletDisplay =
      (isRing || isAmulet || Types.isSuperUnique(item)) && currentSet ? `${_.capitalize(currentSet)} set ` : "";
    let itemDisplayName = Types.isSuperUnique(item) ? type : itemName;

    return `<div class="${bonus.length >= 8 && currentSet && setBonus.length ? "extended" : ""} ${
      isSocketItem ? "socket-item" : "item-tooltip-wrapper main-item"
    }">
        <div class="item-header">
          <div class="item-title${isUnique ? " unique" : ""}${isRune || isRuneword ? " rune" : ""}">
            ${isSuperior ? "Superior " : ""}
            ${name}${isLevelVisible ? ` (+${level})` : ""}${isJewel ? ` lv.${level}` : ""}
            ${runeRank ? ` (#${runeRank})` : ""}
            ${socket ? ` <span class="item-socket">(${socket})</span>` : ""}
          </div>
          ${
            itemClass
              ? `<div class="item-class">(${isUnique ? `Unique ` : ""}${
                  isRuneword ? `Runeword ${itemDisplayName}` : ""
                }${setRingOrAmuletDisplay}${!isRuneword ? itemDisplayName : ""} ${itemClass} class item)</div>`
              : ""
          }
          ${
            socket
              ? `<div class="socket-container">
              ${_.range(0, socket)
                .map(index => {
                  let image = "none";
                  let isUnique = false;
                  if (typeof rawSocket[index] === "number") {
                    const rune = Types.getRuneNameFromItem(rawSocket[index]);
                    image = rune ? `url(img/2/item-rune-${rune}.png)` : "none";
                  } else if (Types.isJewel(rawSocket[index])) {
                    const [, rawJewelLevel, jewelBonus] = (rawSocket[index] as unknown as string).split("|") || [];
                    const jewelLevel = parseInt(rawJewelLevel);
                    const imageIndex = Types.getJewelSkinIndex(jewelLevel);
                    isUnique = Types.isUnique("jewelskull", jewelBonus, jewelLevel);
                    image = `url(img/2/item-jewelskull${imageIndex}.png)`;
                  }
                  return `<div class="item-rune ${
                    isUnique ? "item-unique" : ""
                  }" style="background-image: ${image}; position: relative;"></div>`;
                })
                .join("")}</div>`
              : ""
          }
        </div>
        <div class="socket-item-container"></div>
        ${defense ? `<div class="item-description">Defense: ${defense}</div>` : ""}
        ${damage ? `<div class="item-description">Attack: ${damage}</div>` : ""}
        ${magicDamage ? `<div class="item-bonus">Magic damage: ${magicDamage}</div>` : ""}
        ${flameDamage ? `<div class="item-bonus">Flame damage: ${flameDamage}</div>` : ""}
        ${lightningDamage ? `<div class="item-bonus">Lightning damage: ${lightningDamage}</div>` : ""}
        ${pierceDamage ? `<div class="item-bonus">Pierce damage: ${pierceDamage}</div>` : ""}
        ${healthBonus ? `<div class="item-bonus">Health bonus: ${healthBonus}</div>` : ""}
        ${
          Array.isArray(bonus)
            ? bonus.map(({ description }) => `<div class="item-bonus">${description}</div>`).join("")
            : ""
        }
        ${skill ? `<div class="item-skill">${skill.description}</div>` : ""}
        ${
          runeBonus.length
            ? `<div>
            ${runeBonus.map(({ description }) => `<div class="item-set-bonus">${description}</div>`).join("")}
          </div>`
            : ""
        }
        ${
          description
            ? `<div class="item-description">${
                amount ? description.replace(":amount:", this.formatGold(amount)) : description
              }</div>`
            : ""
        }
        ${requirement ? `<div class="item-description">Required level: ${requirement}</div>` : ""}
        ${
          currentSet && setBonus.length
            ? `<div>
            ${
              currentSet && setBonus.length
                ? `<div class="item-set-description">${_.capitalize(currentSet)} set bonuses</div>`
                : ""
            }
            ${setBonus.map(({ description }) => `<div class="item-set-bonus">${description}</div>`).join("")}
            ${setName ? `<div class="item-set-name">${setName}</div>` : ""}
            ${setParts
              ?.map(
                ({ description, isActive }) =>
                  `<div class="item-set-part ${isActive ? "active" : ""}">${description}</div>`,
              )
              .join("")}
          </div>`
            : ""
        }
        ${
          partyBonus.length
            ? `<div>
            ${partyBonus.length ? `<div class="item-set-description">Party Bonuses</div>` : ""}
            ${partyBonus.map(({ description }) => `<div class="item-set-bonus">${description}</div>`).join("")}
          </div>`
            : ""
        }
        ${
          isMerchantVisible
            ? `<div class="gold-amount ${!goldAmount ? "none" : ""}">${
                goldAmount
                  ? `${buyOrSell} for ${this.formatGold(goldAmount)} gold${isQuantity ? " each" : ""}`
                  : "Cannot be sold to merchant"
              }</div>`
            : ""
        }
    </div>`.replace(/\n/, "");
  }

  initSendUpgradeItem() {
    var self = this;
    $("#upgrade-btn").on("click", function () {
      const item1 = self.player.upgrade[0]?.item;
      if (
        self.player.upgrade.length >= 2 ||
        (self.player.upgrade.length === 1 &&
          (Types.isChest(item1) || item1 === "cowkinghorn" || item1 === "petegg" || Types.isWeapon(item1))) ||
        Types.isConsumable(item1)
      ) {
        const hasItemInLastSlot = self.player.upgrade.some(({ slot }) => slot === 10);
        if (!self.isUpgradeItemSent && !hasItemInLastSlot) {
          self.client.sendUpgradeItem();
        }
        self.isUpgradeItemSent = true;
      }
    });
  }

  initUpgradeItemPreview() {
    var self = this;

    const previewSlot = $(`#upgrade .item-slot:eq(10)`);

    $("#upgrade-preview-btn").on("click", function () {
      let itemName;
      let itemLevel;
      let itemBonus;
      let itemSkill;
      let itemSkin;
      let itemSocket;
      let isItemUnique;
      let isUpgrade = false;

      self.player.upgrade.forEach(({ item, level: rawLevel, slot, bonus, skill, skin, socket, isUnique }) => {
        if (slot === 0) {
          itemName = item;
          itemLevel = Number(rawLevel);
          itemBonus = bonus;
          itemSkill = skill;
          itemSkin = skin;
          itemSocket = socket;
          isItemUnique = isUnique;
        } else if (item.startsWith("scrollupgrade")) {
          isUpgrade = true;
        }
      });
      const nextLevel = itemLevel + 1;

      if (isUpgrade && itemName && itemLevel) {
        if (previewSlot.is(":empty")) {
          previewSlot.append(
            self.createItemDiv({
              isUnique: isItemUnique,
              item: itemName,
              level: nextLevel,
              bonus: itemBonus,
              skill: itemSkill,
              skin: itemSkin,
              socket: itemSocket,
            }),
          );
        }
      }
    });
  }

  initDroppable() {
    var self = this;

    $(".item-droppable").droppable({
      greedy: true,
      over() {},
      out() {},
      drop(_event, ui) {
        const fromSlot = $(ui.draggable[0]).parent().data("slot");
        const toSlot = $(this).data("slot");

        clearTimeout(this.onSendMoveItemTimeout);
        this.onSendMoveItemTimeout = null;
        self.dropItem(fromSlot, toSlot);

        $(document).tooltip("enable");
      },
    });
  }

  dropItem(fromSlot, toSlot, transferedQuantity = null, confirmed = false) {
    if (fromSlot === toSlot || typeof fromSlot !== "number" || typeof toSlot !== "number") {
      return;
    }

    // @NOTE prevent sending too many msgs for duping items
    if (!this.onSendMoveItemTimeout) {
      this.onSendMoveItemTimeout = setTimeout(() => {
        this.onSendMoveItemTimeout = null;
      }, 850);
    } else {
      return;
    }

    const fromSlotEl = $(`[data-slot="${fromSlot}"]`);
    const fromItemEl = fromSlotEl.find(">div");
    const toSlotEl = $(`[data-slot="${toSlot}"]`);
    const toItemEl = toSlotEl.find(">div");
    const toItem = toItemEl.attr("data-item");
    const toLevel = toItemEl.attr("data-level");
    const item = fromItemEl.attr("data-item");
    const level = Number(fromItemEl.attr("data-level"));
    const quantity = Number(fromItemEl.attr("data-quantity")) || null;
    const bonus = toArray(fromItemEl.attr("data-bonus"));
    const socket = toArray(fromItemEl.attr("data-socket"));
    const skill = Number(fromItemEl.attr("data-skill")) || null;
    // const skin = Number(fromItemEl.attr("data-skin")) || null;

    // Condition for allowing partial quantity
    if (Types.isQuantity(item) && quantity > 1 && transferedQuantity === null && !toItem) {
      // Mandatory inventory from or to interaction
      if (
        (fromSlot < INVENTORY_SLOT_COUNT || toSlot < INVENTORY_SLOT_COUNT) &&
        ((fromSlot >= STASH_SLOT_RANGE && fromSlot < STASH_SLOT_RANGE + STASH_SLOT_COUNT) ||
          (toSlot >= STASH_SLOT_RANGE && toSlot < STASH_SLOT_RANGE + STASH_SLOT_COUNT) ||
          (fromSlot >= TRADE_SLOT_RANGE && fromSlot < TRADE_SLOT_RANGE + TRADE_SLOT_COUNT) ||
          (toSlot >= TRADE_SLOT_RANGE && toSlot < TRADE_SLOT_RANGE + TRADE_SLOT_COUNT) ||
          (toSlot >= MERCHANT_SLOT_RANGE && toSlot < MERCHANT_SLOT_RANGE + MERCHANT_SLOT_COUNT))
      ) {
        const isMerchantToSlot = toSlot >= MERCHANT_SLOT_RANGE && toSlot < MERCHANT_SLOT_RANGE + MERCHANT_SLOT_COUNT;

        const title = isMerchantToSlot ? "Choose quantity to sell" : null;

        this.openQuantityModal(
          { maxQuantity: quantity, quantity: isMerchantToSlot ? 1 : quantity, title },
          selectedQuantity => {
            clearTimeout(this.onSendMoveItemTimeout);
            this.onSendMoveItemTimeout = null;
            this.dropItem(fromSlot, toSlot, selectedQuantity);
          },
        );

        return;
      }
    }

    if (
      fromSlot >= MERCHANT_SLOT_RANGE &&
      fromSlot < MERCHANT_SLOT_RANGE + MERCHANT_SLOT_COUNT &&
      toSlot < INVENTORY_SLOT_COUNT
    ) {
      const { amount } = merchantItems[fromSlot - MERCHANT_SLOT_RANGE] || {};
      if (amount) {
        const maxQuantity = Math.floor(this.player.gold / amount);
        if (maxQuantity) {
          this.openQuantityModal({ maxQuantity, quantity: 1, title: "Choose quantity to buy" }, selectedQuantity => {
            this.client.sendBuyFromMerchant(fromSlot, toSlot, selectedQuantity);
          });
        }
      }
      return;
    }

    if (toItem) {
      if (
        Object.values(Slot).includes(fromSlot) &&
        (!toLevel || !Types.isCorrectTypeForSlot(fromSlot, toItem) || toLevel > this.player.level)
      ) {
        return;
      }
    }

    if (Object.values(Slot).includes(toSlot) && Types.getItemRequirement(item, level) > this.player.level) {
      return;
    }

    if (toSlot === -1) {
      if (
        !level ||
        level !== 1 ||
        Types.isPetItem(item) ||
        Types.isUnique(item, bonus) ||
        Types.isSuperior(bonus) ||
        (socket && socket.length >= 4) ||
        // Superior item delete confirm
        (Array.isArray(bonus) && bonus.includes(43))
      ) {
        $("#dialog-delete-item").dialog("open");
        this.slotToDelete = fromSlot;
        return;
      }
      fromItemEl.remove();
    } else if (toSlot >= MERCHANT_SLOT_RANGE && toSlot < MERCHANT_SLOT_RANGE + MERCHANT_SLOT_COUNT && !confirmed) {
      if (!level || level !== 1 || Types.isUnique(item, bonus) || (socket && socket.length >= 4)) {
        this.confirmedSoldItemToMerchant = { fromSlot, toSlot, transferedQuantity, confirmed: true };
        $("#dialog-merchant-item").dialog("open");
        return;
      }
    } else {
      toSlotEl.append(fromItemEl.detach());
      if (toItemEl.length) {
        fromSlotEl.append(toItemEl.detach());
      }
    }

    if (toSlot >= MERCHANT_SLOT_RANGE && toSlot < MERCHANT_SLOT_RANGE + MERCHANT_SLOT_COUNT) {
      if (fromSlot < INVENTORY_SLOT_COUNT) {
        if (!this.isPanelOpened) {
          this.client.sendBanPlayer("Player tried to sell item to Merchant.");
          return;
        }

        this.client.sendSellToMerchant(fromSlot, transferedQuantity || 1);
      }
      return;
    }
    this.client.sendMoveItem(fromSlot, toSlot, transferedQuantity);

    if (typeof level === "number") {
      if (toSlot === Slot.WEAPON) {
        this.player?.switchWeapon(item, level, bonus, socket, skill);
      } else if (toSlot === Slot.ARMOR) {
        this.player?.switchArmor(this.getSprite(item), level, bonus, socket);
      } else if (toSlot === Slot.HELM) {
        this.player?.switchHelm(item, level, bonus, socket);
      } else if (toSlot === Slot.CAPE) {
        this.player?.switchCape(item, level, bonus);
      } else if (toSlot === Slot.SHIELD) {
        this.player?.switchShield(item, level, bonus, socket, skill);
        this.setDefenseSkill(skill);
      }
    }

    const type = kinds[item][1];
    if (type === "helm" && $("#item-player .item-equip-helm").is(":empty")) {
      this.player.switchHelm("helmcloth", 1);
    } else if (type === "armor" && $("#item-player .item-equip-armor").is(":empty")) {
      this.player.switchArmor(this.getSprite("clotharmor"), 1);
    } else if (type === "weapon" && $("#item-player .item-equip-weapon").is(":empty")) {
      this.player.switchWeapon("dagger", 1);
    } else if (type === "cape" && $("#item-player .item-equip-cape").is(":empty")) {
      this.player.removeCape();
    } else if (type === "shield" && $("#item-player .item-equip-shield").is(":empty")) {
      this.player.removeShield();
    }
  }

  openQuantityModal(
    { maxQuantity, quantity, title }: { maxQuantity: number; quantity?: number; title?: string },
    submit,
  ) {
    $("#container").addClass("prevent-click");

    const prepareSubmit = () => {
      const quantity = parseInt($("#transfer-quantity").val() as string);
      if (validateQuantity(quantity) && quantity <= maxQuantity) {
        submit(quantity);
      }

      $("#container").removeClass("prevent-click");
      $("#dialog-quantity").dialog("close");
    };

    $("#dialog-quantity").dialog({
      dialogClass: "no-close",
      autoOpen: true,
      draggable: false,
      title: title || "Choose quantity to transfer",
      classes: {
        "ui-button": "btn",
      },
      buttons: [
        {
          text: "Cancel",
          class: "btn btn-default",
          click: function () {
            $(this).dialog("close");
            $("#container").removeClass("prevent-click");
          },
        },
        {
          text: "Ok",
          class: "btn",
          click: prepareSubmit,
        },
      ],
    });
    $("#dialog-quantity").html(
      `<div style="margin: 24px 0; text-align: center;">
        <input id="transfer-quantity" type="number" min="1" max="${maxQuantity}" style="width: 50%;font-family: 'GraphicPixel';" />
      </div>`,
    );

    $("#transfer-quantity")
      .on("input", event => {
        const inputValue = parseInt($(event.target).val() as string);
        if (inputValue && inputValue > maxQuantity) {
          $(event.target).val(maxQuantity);
        }
      })
      .on("keyup", function (e) {
        if (e.keyCode === Types.Keys.ENTER) {
          prepareSubmit();
        }
      })
      .val(quantity || maxQuantity)
      .trigger("focus")
      .trigger("select");

    // @ts-ignore
    $(".ui-button").removeClass("ui-button");
  }

  deleteItemFromSlot() {
    if (typeof this.slotToDelete !== "number") return;
    this.client.sendMoveItem(this.slotToDelete, -1);
    $(`[data-slot="${this.slotToDelete}"] >div`).remove();
    this.hoverSlotToDelete = null;
  }

  destroyDroppable() {
    $(".item-droppable.ui-droppable").droppable("destroy");
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
        self.isDragStarted = true;
        $(document).tooltip("disable");
        $(this).parent().addClass("ui-droppable-origin");

        const item = $(this).attr("data-item");
        const type = kinds[item][1];

        if (
          ["weapon", "helm", "armor", "belt", "cape", "shield", "chest", "ring", "amulet", "consumable"].includes(
            type,
          ) &&
          $(`.item-${type}`).is(":empty")
        ) {
          $(`.item-${type}`).addClass("item-droppable");
        } else if (Types.isScroll(item)) {
          $(".item-scroll").addClass("item-droppable");
        } else if (Types.isRune(item) || Types.isStone(item) || Types.isJewel(item)) {
          $(".item-recipe").addClass("item-droppable");
        } else if (Types.isBar(item)) {
          $(".item-trade").addClass("item-droppable");
        } else if (Types.isSingle(item)) {
          $(".item-single").addClass("item-droppable");
        } else if (Types.isPetItem(item)) {
          $(".item-pet").addClass("item-droppable");
          if (item === "petegg") {
            $(".item-equip-pet").removeClass("item-droppable");
          }
        }

        if ($("#merchant").hasClass("visible") && $(this).closest("#inventory")[0]) {
          if (itemGoldMap[item]) {
            $(".item-merchant-empty").addClass("item-droppable");
          }
        }

        // Simpler to remove it after the fact
        $(".item-not-droppable").removeClass("item-droppable");

        self.initDroppable();
      },
      stop() {
        self.destroyDroppable();

        $(".ui-droppable-origin").removeClass("ui-droppable-origin");
        $(
          ".item-weapon, .item-armor, .item-ring, .item-amulet, .item-belt, .item-shield, .item-helm, .item-cape, .item-pet, .item-chest, .item-scroll, .item-merchant",
        ).removeClass("item-droppable");
      },
    });
  }

  destroyDraggable() {
    if (this.isDragStarted) {
      $(".item-draggable.ui-draggable").draggable("destroy");
      this.isDragStarted = false;
    }
  }

  getIconPath(spriteName: string, level?: number, skin?: number) {
    const scale = this.renderer.getScaleFactor();

    let suffix = "";
    if (spriteName === "cape" && level >= 7) {
      suffix = "7";
    } else if (spriteName === "jewelskull" && level > 2) {
      suffix = Types.getJewelSkinIndex(level);
    } else if (skin) {
      suffix = `-${skin}`;
    }

    return `img/${scale}/item-${spriteName}${suffix}.png`;
  }

  initOtherPlayerEquipmentSlots(player) {
    const container = $("#item-otherplayer");

    container.find(".item-weapon-slot").html(`<div class="item-slot item-equip-weapon item-weapon"></div>`);
    container.find(".item-helm-slot").html(`<div class="item-slot item-equip-helm item-helm"></div>`);
    container.find(".item-armor-slot").html(`<div class="item-slot item-equip-armor item-armor"></div>`);
    container.find(".item-belt-slot").html(`<div class="item-slot item-equip-belt item-belt"></div>`);
    container.find(".item-cape-slot").html(`<div class="item-slot item-equip-cape item-cape"></div>`);
    container.find(".item-pet-slot").html(`<div class="item-slot item-equip-pet item-pet"></div>`);
    container.find(".item-shield-slot").html(`<div class="item-slot item-equip-shield item-shield"></div>`);
    container.find(".item-ring1-slot").html(`<div class="item-slot item-equip-ring item-ring item-ring1"></div>`);
    container.find(".item-ring2-slot").html(`<div class="item-slot item-equip-ring item-ring item-ring2"></div>`);
    container.find(".item-amulet-slot").html(`<div class="item-slot item-equip-amulet item-amulet"></div>`);

    this.populateEquipmentInSlots(player, container);
  }

  initPlayerEquipmentSlots() {
    const container = $("#item-player");

    container
      .find(".item-weapon-slot")
      .html(`<div class="item-slot item-equip-weapon item-weapon" data-slot="${Slot.WEAPON}"></div>`);
    container
      .find(".item-helm-slot")
      .html(`<div class="item-slot item-equip-helm item-helm" data-slot="${Slot.HELM}"></div>`);
    container
      .find(".item-armor-slot")
      .html(`<div class="item-slot item-equip-armor item-armor" data-slot="${Slot.ARMOR}"></div>`);
    container
      .find(".item-belt-slot")
      .html(`<div class="item-slot item-equip-belt item-belt" data-slot="${Slot.BELT}"></div>`);
    container
      .find(".item-cape-slot")
      .html(`<div class="item-slot item-equip-cape item-cape" data-slot="${Slot.CAPE}"></div>`);
    container
      .find(".item-pet-slot")
      .html(`<div class="item-slot item-equip-pet item-pet" data-slot="${Slot.PET}"></div>`);
    container
      .find(".item-shield-slot")
      .html(`<div class="item-slot item-equip-shield item-shield" data-slot="${Slot.SHIELD}"></div>`);
    container
      .find(".item-ring1-slot")
      .html(`<div class="item-slot item-equip-ring item-ring item-ring1" data-slot="${Slot.RING1}"></div>`);
    container
      .find(".item-ring2-slot")
      .html(`<div class="item-slot item-equip-ring item-ring item-ring2" data-slot="${Slot.RING2}"></div>`);
    container
      .find(".item-amulet-slot")
      .html(`<div class="item-slot item-equip-amulet item-amulet" data-slot="${Slot.AMULET}"></div>`);
    container
      .find(".item-delete-slot")
      .html(`<div class="item-slot item-droppable item-delete" data-slot="${DELETE_SLOT}"></div>`);

    this.populateEquipmentInSlots(this.player, container);
  }

  populateEquipmentInSlots(player, container) {
    if (player.weaponName !== "dagger") {
      const isUnique = Types.isUnique(player.weaponName, player.weaponBonus);
      const { runeword } = Types.getRunewordBonus({
        isUnique,
        socket: player.weaponSocket,
        type: "weapon",
      });

      container.find(".item-equip-weapon").html(
        $("<div />", {
          class: `item-draggable ${isUnique ? "item-unique" : ""} ${!!runeword ? "item-runeword" : ""}`,
          css: {
            "background-image": `url("${this.getIconPath(player.weaponName)}")`,
          },
          "data-item": player.weaponName,
          "data-level": player.weaponLevel,
          "data-bonus": toString(player.weaponBonus),
          "data-socket": toString(player.weaponSocket),
          "data-skill": player.attackSkill,
          click: event => {
            this.handleClick(event);
          },
        }),
      );
    }
    if (player.helmName !== "helmcloth") {
      const isUnique = Types.isUnique(player.helmName, player.helmBonus);
      const { runeword } = Types.getRunewordBonus({
        isUnique,
        socket: player.helmSocket,
        type: "helm",
      });

      container.find(".item-equip-helm").html(
        $("<div />", {
          class: `item-draggable ${isUnique ? "item-unique" : ""} ${!!runeword ? "item-runeword" : ""}`,
          css: {
            "background-image": `url("${this.getIconPath(player.helmName)}")`,
          },
          "data-item": player.helmName,
          "data-level": player.helmLevel,
          "data-bonus": toString(player.helmBonus),
          "data-socket": toString(player.helmSocket),
          click: event => {
            this.handleClick(event);
          },
        }),
      );
    }

    if (player.armorName !== "clotharmor") {
      const isUnique = Types.isUnique(player.armorName, player.armorBonus);
      const { runeword } = Types.getRunewordBonus({
        isUnique,
        socket: player.armorSocket,
        type: "armor",
      });

      container.find(".item-equip-armor").html(
        $("<div />", {
          class: `item-draggable ${isUnique ? "item-unique" : ""} ${!!runeword ? "item-runeword" : ""}`,
          css: {
            "background-image": `url("${this.getIconPath(player.armorName)}")`,
          },
          "data-item": player.armorName,
          "data-level": player.armorLevel,
          "data-bonus": toString(player.armorBonus),
          "data-socket": toString(player.armorSocket),
          click: event => {
            this.handleClick(event);
          },
        }),
      );
    }

    if (player.beltName) {
      container.find(".item-equip-belt").html(
        $("<div />", {
          class: `item-draggable ${Types.isUnique(player.beltName, player.beltBonus) ? "item-unique" : ""}`,
          css: {
            "background-image": `url("${this.getIconPath(player.beltName)}")`,
          },
          "data-item": player.beltName,
          "data-level": player.beltLevel,
          "data-bonus": toString(player.beltBonus),
          click: event => {
            this.handleClick(event);
          },
        }),
      );
    }

    if (player.cape) {
      container.find(".item-equip-cape").html(
        $("<div />", {
          class: `item-draggable ${Types.isUnique(player.cape, player.capeBonus) ? "item-unique" : ""}`,
          css: {
            "background-image": `url("${this.getIconPath(player.cape, player.capeLevel)}")`,
          },
          "data-item": player.cape,
          "data-level": player.capeLevel,
          "data-bonus": toString(player.capeBonus),
          click: event => {
            this.handleClick(event);
          },
        }),
      );
    }

    if (player.pet) {
      container.find(".item-equip-pet").html(
        $("<div />", {
          class: `item-draggable ${Types.isUnique(player.pet, player.petBonus) ? "item-unique" : ""}`,
          css: {
            "background-image": `url("${this.getIconPath(player.pet, player.petLevel, player.petSkin)}")`,
          },
          "data-item": player.pet,
          "data-level": player.petLevel,
          "data-bonus": toString(player.petBonus),
          "data-socket": toString(player.petSocket),
          click: event => {
            this.handleClick(event);
          },
        }),
      );
    }

    if (player.shieldName) {
      const isUnique = Types.isUnique(player.shieldName, player.shieldBonus);
      const { runeword } = Types.getRunewordBonus({
        isUnique,
        socket: player.shieldSocket,
        type: "shield",
      });

      container.find(".item-equip-shield").html(
        $("<div />", {
          class: `item-draggable ${isUnique ? "item-unique" : ""} ${!!runeword ? "item-runeword" : ""}`,
          css: {
            "background-image": `url("${this.getIconPath(player.shieldName)}")`,
          },
          "data-item": player.shieldName,
          "data-level": player.shieldLevel,
          "data-bonus": toString(player.shieldBonus),
          "data-socket": toString(player.shieldSocket),
          "data-skill": player.defenseSkill,
          click: event => {
            this.handleClick(event);
          },
        }),
      );
    }

    if (player.ring1Name) {
      container.find(".item-ring1").html(
        $("<div />", {
          class: `item-draggable ${Types.isUniqueRing(player.ring1Name, player.ring1Bonus) ? "item-unique" : ""}`,
          css: {
            "background-image": `url("${this.getIconPath(player.ring1Name)}")`,
          },
          "data-item": player.ring1Name,
          "data-level": player.ring1Level,
          "data-bonus": toString(player.ring1Bonus),
          click: event => {
            this.handleClick(event);
          },
        }),
      );
    }

    if (player.ring2Name) {
      container.find(".item-ring2").html(
        $("<div />", {
          class: `item-draggable ${Types.isUniqueRing(player.ring2Name, player.ring2Bonus) ? "item-unique" : ""}`,
          css: {
            "background-image": `url("${this.getIconPath(player.ring2Name)}")`,
          },
          "data-item": player.ring2Name,
          "data-level": player.ring2Level,
          "data-bonus": toString(player.ring2Bonus),
          click: event => {
            this.handleClick(event);
          },
        }),
      );
    }

    if (player.amuletName) {
      container.find(".item-equip-amulet").html(
        $("<div />", {
          class: `item-draggable ${Types.isUniqueAmulet(player.amuletName) ? "item-unique" : ""}`,
          css: {
            "background-image": `url("${this.getIconPath(player.amuletName)}")`,
          },
          "data-item": player.amuletName,
          "data-level": player.amuletLevel,
          "data-bonus": toString(player.amuletBonus),
          click: event => {
            this.handleClick(event);
          },
        }),
      );
    }
  }

  initInventory() {
    $("#item-inventory").empty();
    for (var i = 0; i < INVENTORY_SLOT_COUNT; i++) {
      $("#item-inventory").append(`<div class="item-slot item-inventory item-droppable" data-slot="${i}"></div>`);
    }
    this.initPlayerEquipmentSlots();

    this.updateInventory();
    this.updateRequirement();
  }

  updateInventory() {
    if ($("#inventory").hasClass("visible")) {
      $("#inventory .item-draggable.ui-draggable").draggable("destroy");
    }

    // @TODO instead of empty-ing, compare and replace
    $(".item-inventory").empty();

    this.player.inventory.forEach(({ slot, ...item }) => {
      $(`#item-inventory .item-slot:eq(${slot})`).append(this.createItemDiv(item));
    });

    if ($("#inventory").hasClass("visible")) {
      this.initDraggable();
    }

    this.updateRequirement();
  }

  initTeleportContextMenu() {
    return;
    const hasStoneTeleportInInventory = !!this.player.inventory.find(({ item }) => item === "stoneteleport");

    if ($("#party-player-list .player-name").data("contextMenu")) {
      $("#party-player-list .player-name").contextMenu("destroy");
    }
    $("#party-player-list")
      .off("click")
      .on("click", event => {
        $("#foreground").trigger(event);
      });

    $.contextMenu({
      selector: "#party-player-list .player-name",

      build: _event => {
        const playerId = Number($(_event.target).attr("data-player-id"));
        const playerName = String($(_event.target).text().trim());

        return playerId
          ? {
              callback: () => {
                if (hasStoneTeleportInInventory && !Object.keys(this.player.attackers).length) {
                  this.client.sendStoneTeleport(playerId);
                }
              },
              items: {
                player: {
                  name: hasStoneTeleportInInventory
                    ? `Teleport to ${playerName}`
                    : "you don't have Teleport stone in your inventory",
                  disabled: playerId === this.player.id || !hasStoneTeleportInInventory,
                },
              },
            }
          : null;
      },
    });
  }

  updateMerchant() {
    if ($("#merchant").hasClass("visible")) {
      $("#merchant .item-draggable.ui-draggable").draggable("destroy");
    }

    this.initMerchant();

    if ($("#merchant").hasClass("visible")) {
      this.initDraggable();
    }
  }

  updateStash() {
    if ($("#stash").hasClass("visible")) {
      $("#stash .item-draggable.ui-draggable").draggable("destroy");
    }

    // @TODO instead of empty-ing, compare and replace
    $(".item-stash").empty();

    this.player.stash.forEach(({ slot, ...item }) => {
      $(`#item-stash .item-slot:eq(${slot})`).append(this.createItemDiv(item));
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
      $("#upgrade-scroll").append(
        `<div class="item-slot item-scroll item-recipe item-single" data-slot="${UPGRADE_SLOT_RANGE + i}"></div>`,
      );
    }
    $("#upgrade-item")
      .empty()
      .append(
        `<div class="item-slot item-upgrade item-weapon item-armor item-ring item-amulet item-belt item-helm item-cape item-pet item-shield item-chest item-consumable" data-slot="${UPGRADE_SLOT_RANGE}"></div>`,
      );
    $("#upgrade-result")
      .empty()
      .append(`<div class="item-slot item-upgraded" data-slot="${UPGRADE_SLOT_RANGE + UPGRADE_SLOT_COUNT - 1}"></div>`);
  }

  initTrade() {
    $("#trade-player1-item").empty();
    $("#trade-player2-item").empty();

    for (var i = 0; i < 9; i++) {
      $("#trade-player1-item").append(
        `<div class="item-slot item-trade item-weapon item-armor item-ring item-amulet item-belt item-helm item-cape item-pet item-shield item-chest item-scroll item-recipe item-consumable" data-slot="${
          TRADE_SLOT_RANGE + i
        }"></div>`,
      );
      $("#trade-player2-item").append(`<div class="item-slot item-trade"></div>`);
    }
  }

  initMerchant() {
    $("#item-merchant").empty();

    for (var i = 0; i < MERCHANT_SLOT_COUNT; i++) {
      const slot = MERCHANT_SLOT_RANGE + i;

      $("#item-merchant").append(
        `<div class="item-slot item-merchant ${
          !merchantItems[i] ? "item-merchant-empty" : ""
        }" data-slot="${slot}"></div>`,
      );

      if (merchantItems[i]?.item) {
        $(`#item-merchant .item-slot:eq(${i})`).append(this.createItemDiv(merchantItems[i]));
      }
    }
  }

  updateTradePlayer1(isDraggable = true) {
    if ($("#trade").hasClass("visible")) {
      $("#trade-player1-item .item-draggable.ui-draggable").draggable("destroy");
    }

    $("#trade-player1-item .item-trade").empty();

    this.player.tradePlayer1.forEach(({ slot, ...item }) => {
      $(`#trade-player1-item .item-slot:eq(${slot})`).append(this.createItemDiv(item, { isDraggable }));
    });

    // @TODO Validate this class, unable to trade
    $("#trade-player1-item .item-trade").toggleClass("item-not-droppable", !isDraggable);

    if ($("#trade").hasClass("visible")) {
      this.initDraggable();
    }

    this.updateRequirement();
  }

  updateTradePlayer2() {
    $("#trade-player2-item .item-trade").empty();

    this.player.tradePlayer2.forEach(({ slot, ...item }) => {
      $(`#trade-player2-item .item-slot:eq(${slot})`).append(this.createItemDiv(item, { isDraggable: false }));
    });

    this.updateRequirement();
  }

  createItemDiv(
    {
      quantity,
      isUnique,
      item,
      level,
      bonus,
      socket,
      skill,
      skin,
      requirement,
      runeword,
      amount,
    }: {
      item: string;
      quantity?: number;
      isUnique?: boolean;
      level?: number;
      bonus?: string;
      skill?: any;
      skin?: any;
      socket?: string;
      requirement?: number;
      runeword?: string;
      amount?: number;
    },
    { isDraggable = true }: { isDraggable?: boolean } = {},
  ) {
    if (socket) {
      const socketRequirement = Types.getHighestSocketRequirement(JSON.parse(socket));
      if (socketRequirement > requirement) {
        requirement = socketRequirement;
      }
    }

    return $("<div />", {
      class: `${isDraggable ? "item-draggable" : "item-not-draggable"} ${quantity ? "item-quantity" : ""} ${
        isUnique ? "item-unique" : ""
      } ${runeword ? "item-runeword" : ""}`,
      css: {
        "background-image": `url("${this.getIconPath(item, level, skin)}")`,
        position: "relative",
      },
      "data-item": item,
      "data-level": level,
      ...(quantity ? { "data-quantity": quantity } : null),
      ...(bonus ? { "data-bonus": toString(bonus) } : null),
      ...(socket ? { "data-socket": toString(socket) } : null),
      ...(skill ? { "data-skill": skill } : null),
      ...(skin ? { "data-skin": skin } : null),
      ...(requirement ? { "data-requirement": requirement } : null),
      ...(amount ? { "data-amount": amount } : null),
      click: event => {
        this.handleClick(event);
      },
    });
  }

  handleClick(event) {
    if (!event.shiftKey) {
      return;
    }

    const slot = Number($(event.currentTarget).parent().attr("data-slot"));
    if (isNaN(slot)) return;

    const item = $(event.currentTarget).attr("data-item");
    if (!item) return;

    const type = kinds[item][1];
    if (!type) return;

    let destination;
    let isEquipItem = false;
    let isUnEquipItem = false;

    if (slot >= Slot.WEAPON && slot <= Slot.HELM) {
      destination = $("#inventory");
      isUnEquipItem = true;
    } else if (slot < INVENTORY_SLOT_COUNT || slot === UPGRADE_SLOT_RANGE + UPGRADE_SLOT_COUNT - 1) {
      if ($("#upgrade").hasClass("visible")) {
        destination = $("#upgrade");
      } else if ($("#stash").hasClass("visible")) {
        destination = $("#stash");
      } else if ($("#trade").hasClass("visible")) {
        destination = $("#trade");
      } else if ($("#merchant").hasClass("visible")) {
        if (itemGoldMap[item]) {
          destination = $("#merchant");
        }
      } else {
        destination = $("#inventory");
        isEquipItem = true;
      }
    } else if (slot >= STASH_SLOT_RANGE && slot < STASH_SLOT_RANGE + STASH_SLOT_COUNT) {
      if ($("#inventory").hasClass("visible")) {
        destination = $("#inventory");
      }
    }

    if (!destination) return;

    let matchType = type;
    if (Types.isRune(item) || Types.isStone(item) || Types.isJewel(item)) {
      matchType = "scroll";
    } else if (Types.isBar(item)) {
      matchType = "trade";
    } else if (Types.isSingle(item)) {
      matchType = "single";
    }

    let destinationSlot;
    if (isUnEquipItem) {
      destinationSlot = destination.find(`#item-inventory .item-droppable:empty`).first().attr("data-slot");
    } else if (isEquipItem) {
      destinationSlot =
        destination.find(`#item-player .item-${type}:empty`).first().attr("data-slot") ||
        destination.find(`#item-player .item-${type}`).first().attr("data-slot");
    } else {
      destinationSlot = destination
        .find(`.item-${matchType}:empty, .item-droppable:not(.item-delete):empty:visible, .item-merchant-empty:empty`)
        .first()
        .attr("data-slot");
    }

    if (!destinationSlot) return;
    this.dropItem(slot, Number(destinationSlot));
  }

  updateUpgrade({ luckySlot, isSuccess }) {
    if ($("#inventory").hasClass("visible")) {
      $("#upgrade .item-draggable.ui-draggable").draggable("destroy");
    }
    // $("#upgrade-info").text("").removeClass("warning");
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
    let itemName;
    let itemBonus;
    let actionText = "upgrade";
    let uniqueText = "";
    let runeUpgrade = "";
    let rune = "";

    let isJewel = false;
    let jewelRequirement;
    let nextLevelRequirement;

    let isRune = false;
    let nextLevel;
    let warningMessage = "";
    if (!this.player.upgrade.length) {
      return;
    }
    this.player.upgrade.forEach(({ item, level: rawLevel, quantity, slot, bonus, socket, skill, skin, isUnique }) => {
      if (slot === 0) {
        itemLevel = Number(rawLevel);
        nextLevel = itemLevel + 1;
      }

      isRune = Types.isRune(item);
      isJewel = Types.isJewel(item);
      jewelRequirement = isJewel ? Types.getJewelRequirement(bonus) : null;

      if (slot === 0 && itemLevel) {
        itemName = item;
        itemBonus = bonus;
        const successRates = Types.getUpgradeSuccessRates();
        successRate = successRates[itemLevel - 1];
      } else if (slot) {
        if (itemName && item.startsWith("scrolltransmute")) {
          const isBlessed = item.startsWith("scrolltransmuteblessed");
          const { transmuteSuccessRate, uniqueSuccessRate } =
            Types.getTransmuteSuccessRate(itemName, itemBonus, isBlessed) || {};

          if (item === "scrolltransmutepet") {
            successRate = 99;
            uniqueText = "";
          } else {
            successRate = transmuteSuccessRate || uniqueSuccessRate;
            uniqueText = uniqueSuccessRate === 100 ? "" : uniqueSuccessRate;
          }
          actionText = "transmute";
        } else if (itemLevel && (item.startsWith("scrollupgradeblessed") || item.startsWith("scrollupgradesacred"))) {
          const blessedRates = Types.getBlessedSuccessRateBonus();
          const blessedRate = blessedRates[itemLevel - 1];
          successRate += blessedRate;
        } else if (!itemName && Types.isRune(item)) {
          if (rune === "") {
            rune = item;
          } else if (rune !== item && !item.startsWith("scrollupgrade")) {
            rune = null;
          }
        } else if (!item.startsWith("scrollupgrade")) {
          successRate = null;
        }
        if (item.startsWith("scrollupgradeelement") || item.startsWith("scrollupgradeskillrandom")) {
          successRate = 99;
          uniqueText = "";
        }
      }
      if (item && Types.isEquipableItem(item)) {
        if (itemLevel) {
          nextLevelRequirement = Types.getItemRequirement(item, nextLevel);
          if (nextLevelRequirement > this.player.level) {
            warningMessage = `If upgraded,the item lvl requirement will be ${nextLevelRequirement}, you are lv. ${this.player.level}, you'll not be able to equip it`;
          }
        }
      } else if (isRune) {
        const rune = isRune ? Types.getRuneFromItem(item) : null;
        if (rune && rune.requirement > this.player.level) {
          warningMessage = `If the rune is placed in an item, lv. requirement will be ${rune.requirement}, you are lv.${this.player.level}, you'll not be able to equip it`;
        }
      } else if (isJewel) {
        if (jewelRequirement > this.player.level) {
          warningMessage = `If the jewel is placed in an item, lv. requirement will be ${jewelRequirement}, you are lv.${this.player.level}, you'll not be able to equip it`;
        }
      } else if (this.player.expansion2 && item === "expansion2voucher") {
        warningMessage = "You've already unlocked the Lost Temple expansion, the voucher will be rejected.";
      }

      $(`#upgrade .item-slot:eq(${slot})`)
        .removeClass("item-droppable")
        .append(this.createItemDiv({ quantity, isUnique, item, level: rawLevel, bonus, socket, skill, skin }));
    });

    if (rune) {
      const runeName = Types.getRuneNameFromItem(rune);
      const runeRank = Types.runeKind[runeName].rank;
      const runeClass = Types.getItemClass(rune);
      const nextRune = Types.RuneList[runeRank];
      if (nextRune) {
        runeUpgrade = `Combine ${runeRank < 18 ? 3 : 2} ${runeName.toUpperCase()} runes with a ${_.capitalize(
          runeClass,
        )} Upgrade Scroll to forge 1 ${nextRune.toUpperCase()} rune`;
      }
    }

    $("#upgrade-info")
      .html(
        warningMessage
          ? warningMessage
          : successRate
          ? `${successRate}% chance of successful ${actionText}${
              uniqueText ? `<br />${uniqueText}% chance to be unique` : ""
            }`
          : runeUpgrade || "&nbsp;",
      )
      .toggleClass("warning", !!warningMessage);

    if ($("#upgrade").hasClass("visible")) {
      this.initDraggable();
    }
  }

  initStash() {
    $("#item-stash").empty();

    let counter = STASH_SLOT_RANGE;

    for (var i = 0; i < STASH_SLOT_PAGES; i++) {
      $("#item-stash").append(
        `<div class="item-stash-page page-${i} ${i === this.currentStashPage ? "visible" : ""}"></div>`,
      );

      for (var ii = 0; ii < STASH_SLOT_PER_PAGE; ii++) {
        $(`#item-stash .item-stash-page.page-${i}`).append(
          `<div class="item-slot item-stash item-droppable" data-slot="${counter}"></div>`,
        );
        counter++;
      }
    }

    const togglePage = () => {
      $(".item-stash-page").removeClass("visible");
      $(`.item-stash-page.page-${this.currentStashPage}`).addClass("visible");
      $("#current-stash-page").text(this.currentStashPage + 1);

      previousButton.toggleClass("disabled btn-default", this.currentStashPage === 0);
      nextButton.toggleClass("disabled btn-default", this.currentStashPage >= STASH_SLOT_PAGES - 1);
    };

    const previousButton = $("#item-stash-previous-page");
    const nextButton = $("#item-stash-next-page");

    previousButton.off("click").on("click", () => {
      if (this.currentStashPage > 0) {
        this.currentStashPage--;
        togglePage();
      }
    });

    nextButton.off("click").on("click", () => {
      if (this.currentStashPage < STASH_SLOT_PAGES - 1) {
        this.currentStashPage++;
        togglePage();
      }
    });

    togglePage();

    // @TODO Bind prev/next buttons

    this.updateStash();
  }

  useSkill(slot) {
    if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") return;

    let mobId = 0;

    // No skill / timeout is not finished
    if (slot === 1) {
      const { x, y } = this.getMouseGridPosition();
      let entity =
        this.getEntityAt(x, y, Mob) ||
        this.getEntityAt(x, y, Npc) ||
        (this.pvp && this.getEntityAt(x, y, Player)) ||
        this.getNearestEntity();
      mobId = entity?.id;

      const isTree = mobId ? entity.kind === Types.Entities.TREE && this.player.attackSkill === 1 : false;

      // Can't cast on self
      if (
        !mobId ||
        mobId === this.player.id ||
        ((Types.isNpc(entity.kind) || !(entity instanceof Character)) && !isTree)
      )
        return;

      // Can't cast on other player if PvP is not enabled
      if (mobId && entity instanceof Player && (!entity.pvp || !this.pvp)) {
        let message = !entity.pvp
          ? "You can't attack a player that doesn't have PvP enabled."
          : "You need to enable PvP before you can attack another player.";

        this.chat_callback({
          message,
          type: "error",
        });
        return;
      }

      if (this.player.attackSkillTimeout || typeof this.player.attackSkill !== "number" || !mobId) {
        return;
      }

      this.player.setSkillTargetId(mobId);

      if (isTree) {
        this.tryUnlockingAchievement("ZELDA");
      }
    } else if (slot === 2 && (this.player.defenseSkillTimeout || typeof this.player.defenseSkill !== "number")) return;
    const isAttackSkill = slot === 1;
    const skillName = isAttackSkill
      ? Types.attackSkillTypeAnimationMap[this.player.attackSkill]
      : Types.defenseSkillTypeAnimationMap[this.player.defenseSkill];
    const originalTimeout = isAttackSkill
      ? Math.floor(Types.attackSkillDelay[this.player.attackSkill])
      : Math.floor(Types.defenseSkillDelay[this.player.defenseSkill]);
    const timeout = Math.round(
      originalTimeout - originalTimeout * (Types.calculateSkillTimeout(this.player.bonus.skillTimeout) / 100),
    );

    const skillSlot = $(`[data-skill-slot="${slot}"]`);
    skillSlot
      .addClass("disabled")
      .find(".skill-timeout")
      .addClass(`active ${skillName}`)
      .attr("style", `transition: width ${timeout / 1000}s linear;`);

    if (isAttackSkill) {
      // this.player.setAttackSkillAnimation(skillName, Types.attackSkillDurationMap[this.player.attackSkill]());
      this.player.attackSkillTimeout = setTimeout(() => {
        skillSlot.removeClass("disabled").find(".skill-timeout").attr("class", "skill-timeout").attr("style", "");
        if (this.player) {
          this.player.attackSkillTimeout = null;
        }
      }, timeout);
    } else {
      if (this.player.defenseSkill === 2) {
        this.skillResistanceAnimation.reset();
      } else {
        this.defenseSkillAnimation.reset();
      }
      this.player.setDefenseSkillAnimation(
        skillName,
        Types.defenseSkillDurationMap[this.player.defenseSkill](this.player.shieldLevel),
      );
      this.player.defenseSkillTimeout = setTimeout(() => {
        skillSlot.removeClass("disabled").find(".skill-timeout").attr("class", "skill-timeout").attr("style", "");
        this.player.defenseSkillTimeout = null;
      }, timeout);
    }

    this.audioManager.playSound(`skill-${skillName}`);
    this.client.sendSkill(slot, mobId);
  }

  setDefenseSkill(skill) {
    const skillName = Types.defenseSkillTypeAnimationMap[skill] || null;
    $("#skill-defense").attr("class", skillName ? `skill-${skillName}` : null);
  }

  setAttackSkill(skill) {
    const skillName = Types.attackSkillTypeAnimationMap[skill] || null;
    $("#skill-attack").attr("class", skillName ? `skill-${skillName}` : null);
  }

  initTransferGold() {
    $("#gold-stash").on("click", () => {
      const isStashTransfer = $("#stash").hasClass("visible");
      if (!isStashTransfer || !this.player.goldStash) return;

      this.openQuantityModal({ maxQuantity: this.player.goldStash }, gold => {
        if (!this.isPanelOpened) {
          this.client.sendBanPlayer("Player tried to transfer gold from Stash to Inventory.");
          return;
        }

        this.client.sendMoveGold(gold, "stash", "inventory");
      });
    });

    $("#gold-inventory").on("click", () => {
      const isStashTransfer = $("#stash").hasClass("visible");
      const isTradeTransfer = $("#trade").hasClass("visible");
      if ((!isStashTransfer && !isTradeTransfer) || !this.player.gold) return;

      this.openQuantityModal({ maxQuantity: this.player.gold }, gold => {
        if (isStashTransfer) {
          if (!this.isPanelOpened) {
            this.client.sendBanPlayer("Player tried to transfer gold from Inventory to Stash.");
            return;
          }

          this.client.sendMoveGold(gold, "inventory", "stash");
        } else if (isTradeTransfer) {
          this.client.sendMoveGold(gold, "inventory", "trade");
        }
      });
    });

    $("#gold-player1").on("click", () => {
      const isTradeTransfer = $("#trade").hasClass("visible");
      if (!isTradeTransfer || !this.player.goldTrade || $("#trade-player1-status-button").hasClass("disabled")) return;

      this.openQuantityModal({ maxQuantity: this.player.goldTrade }, gold => {
        this.client.sendMoveGold(gold, "trade", "inventory");
      });
    });
  }

  initAchievements() {
    var self = this;

    this.achievements = getAchievements(self.network);

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

    const totalPayout = unlockedAchievementIds.reduce((acc, id) => {
      const achievement: any = Object.values(self.achievements)[id - 1];
      acc += achievement?.[this.network] || 0;
      return acc;
    }, 0);

    this.app.initUnlockedAchievements(unlockedAchievementIds, totalPayout);
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

            if (!self.isPanelOpened) {
              self.client.sendBanPlayer("Player tried to teleport without opening the Waypoint panel.");
              return;
            }

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

  getSprite(name) {
    if (!this.sprites[name]) {
      this.loadSprite(name);
      this.sprites[name].onload_func = () => {
        if (name.endsWith("armor")) {
          this.sprites[name].createHurtSprite();
        }
      };
    }

    return this.sprites[name];
  }

  loadSprite(name) {
    if (this.renderer.upscaledRendering) {
      this.spritesets[0][name] = new Sprite(name, 1, this.network);
    } else {
      this.spritesets[1][name] = new Sprite(name, 2, this.network);
      if (!this.renderer.mobile && !this.renderer.tablet) {
        this.spritesets[2][name] = new Sprite(name, 3, this.network);
      }
    }
  }

  setSpriteScale(scale) {
    if (this.renderer.upscaledRendering) {
      this.sprites = this.spritesets[0];
    } else {
      this.sprites = this.spritesets[scale - 1];

      _.each(this.entities, (entity: Entity) => {
        entity.sprite = null;
        entity.setSprite(this.getSprite(entity.getSpriteName()));
      });
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
      if (this.hoveringPlayerPvP) {
        this.setCursor("attack");
      } else {
        this.setCursor("hand");
      }
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
        if (entity.isFading) {
          entity.fadeIn(this.currentTime);
        }
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
    let sprite;
    if (item.kind === Types.Entities.GOLD) {
      let suffix = "1";
      if (item.amount >= 100) {
        suffix = "3";
      } else if (item.amount >= 25) {
        suffix = "2";
      }
      sprite = this.getSprite(item.getSpriteName(suffix));
    } else {
      sprite = this.getSprite(item.getSpriteName());
    }

    item.setSprite(sprite);
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
    this.highAnimatedTiles = [];
    this.forEachVisibleTile(function (id, index) {
      if (m.isAnimatedTile(id)) {
        var tile = new AnimatedTile(
            id,
            m.getTileAnimationLength(id),
            m.getTileAnimationDelay(id),
            m.getTileAnimationSkip(id),
            index,
          ),
          pos = self.map.tileIndexToGridPosition(tile.index);

        tile.x = pos.x;
        tile.y = pos.y;

        if (m.isHighTile(id)) {
          self.highAnimatedTiles.push(tile);
        } else {
          self.animatedTiles.push(tile);
        }
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
        if (!(entity instanceof Player) && !(entity instanceof Pet)) {
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

        if (!(entity instanceof Player) && !(entity instanceof Pet) && !(entity instanceof Spell)) {
          this.pathingGrid[y][x] = 1;
        }

        // @NOTE: A few NPC takes 2 or more tiles
        if (
          entity.kind === Types.Entities.MAGICSTONE ||
          entity.kind === Types.Entities.ALTARCHALICE ||
          entity.kind === Types.Entities.ALTARSOULSTONE ||
          entity.kind === Types.Entities.TOMBDEATHANGEL ||
          entity.kind === Types.Entities.TOMBANGEL ||
          entity.kind === Types.Entities.TOMBCROSS ||
          entity.kind === Types.Entities.TOMBSKULL ||
          entity.kind === Types.Entities.GRIMOIRE ||
          entity.kind === Types.Entities.DOORDEATHANGEL
        ) {
          this.entityGrid[y][x + 1][entity.id] = entity;
          this.pathingGrid[y][x + 1] = 1;
        }
        if (entity.kind === Types.Entities.ALTARCHALICE || entity.kind === Types.Entities.ALTARSOULSTONE) {
          this.entityGrid[y][x + 2][entity.id] = entity;
          this.pathingGrid[y][x + 2] = 1;
        }

        if (entity.kind === Types.Entities.GRIMOIRE || entity.kind === Types.Entities.DOORDEATHANGEL) {
          this.entityGrid[y - 1][x][entity.id] = entity;
          this.entityGrid[y - 1][x + 1][entity.id] = entity;
          this.pathingGrid[y - 1][x] = 1;
          this.pathingGrid[y - 1][x + 1] = 1;
        }

        // @NOTE Draw a square to know if the player is standing on a trap & don't fill the pathing grid so player can walk on top
        if (
          entity.kind === Types.Entities.TRAP ||
          entity.kind === Types.Entities.TRAP2 ||
          entity.kind === Types.Entities.TRAP3 ||
          entity.kind === Types.Entities.BLUEFLAME
        ) {
          delete this.entityGrid[y][x][entity.id];
          this.pathingGrid[y][x] = 0;
        }
      }
      if (entity instanceof Item) {
        this.itemGrid[y][x][entity.id] = entity;
      }

      this.addToRenderingGrid(entity, x, y);
    }
  }

  setPlayerAccount({
    username,
    account,
    network,
    password,
  }: {
    username?: string;
    account: string;
    network: Network;
    password?: string;
  }) {
    if (username) {
      this.username = username;
    }

    this.account = account;
    this.network = network;
    this.explorer = network === "nano" ? "nanolooker" : "bananolooker";

    if (password) {
      this.password = password;
    }
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

  run() {
    var self = this;

    return new Promise(resolve => {
      if (self.isLoaded) {
        resolve(true);
        return;
      }

      this.loadSprites();

      this.setUpdater(new Updater(this));
      this.camera = this.renderer.camera;

      this.setSpriteScale(this.renderer.scale);

      var wait = setInterval(function () {
        if (self.map.isLoaded /* && self.spritesLoaded()*/) {
          self.ready = true;
          console.debug("Map loaded.");

          self.loadAudio();

          self.initMusicAreas();
          self.initCursors();
          self.initAnimations();
          self.initShadows();

          self.initEntityGrid();
          self.initItemGrid();
          self.initPathingGrid();
          self.initRenderingGrid();

          self.setPathfinder(new Pathfinder(self.map.width, self.map.height));
          self.setCursor("hand");

          clearInterval(wait);
          self.isLoaded = true;
          resolve(true);
        }
      }, 100);
    });
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

  startHashCheckInterval() {
    this.hashCheckInterval = window.setInterval(() => {
      const hash = CryptoJS.MD5(this.toString()).toString();

      this.client.sendHash(hash);
    }, HASH_BAN_DELAY / 2);
  }

  async connect(action, started_callback) {
    var self = this;

    await self.run();

    this.client = new GameClient(this.host, this.port);
    this.client.fail_callback = function ({ player, admin, error, reason, message, until, ip }) {
      started_callback({
        success: false,
        error,
        ip,
        player,
        admin,
        reason: reason,
        message,
        until,
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
      self.started = true;

      if (action === "create") {
        self.client.sendCreate({ name: self.username, account: self.account, password: self.password });
      } else {
        self.client.sendLogin({
          name: self.username,
          account: self.account,
          password: self.password,
        });
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
      account,
      x,
      y,
      hp,
      helm,
      armor,
      weapon,
      belt,
      cape,
      pet,
      shield,
      ring1,
      ring2,
      amulet,
      experience,
      gold,
      goldStash,
      coin,
      achievement,
      inventory,
      stash,
      hash,
      nanoPotions,
      gems,
      artifact,
      expansion1,
      expansion2,
      waypoints,
      depositAccount,
      auras,
      cowLevelPortalCoords,
      party,
      settings,
      network,
      isHurtByTrap,
      admins,
    }) {
      // @ts-ignore
      self.app.start();

      clearInterval(this.hashCheckInterval);
      self.startHashCheckInterval();

      Sentry.configureScope(scope => {
        // scope.setTag("name", name);
        scope.setUser({ username: name });
      });

      console.info("Received player ID from server : " + id);
      self.player.id = id;
      self.playerId = id;
      // Always accept name received from the server which will
      // sanitize and shorten names exceeding the allowed length.
      self.player.name = name;
      if (account) {
        self.account = account;
      }
      if (network) {
        self.network = network;
      }

      var [helm, helmLevel, helmBonus, helmSocket] = helm.split(":");
      var [armor, armorLevel, armorBonus, armorSocket] = armor.split(":");
      var [weapon, weaponLevel, weaponBonus, weaponSocket, attackSkill] = weapon.split(":");
      var [shield, shieldLevel, shieldBonus, shieldSocket, defenseSkill] = (shield || "").split(":");

      self.player.expansion1 = expansion1;
      self.player.expansion2 = expansion2;
      self.storage.setPlayerExpanson1(expansion1);
      self.storage.setPlayerExpanson2(expansion2);
      self.storage.setPlayerName(name);
      self.storage.setPlayerName(name);
      self.storage.setPlayerArmor(armor);
      self.storage.setPlayerWeapon(weapon);
      self.storage.setAchievement(achievement);

      self.player.setGridPosition(x, y);
      self.player.setMaxHitPoints(hp);
      self.player.setHelmName(helm);
      self.player.setHelmLevel(helmLevel);
      self.player.setHelmBonus(helmBonus);
      self.player.setHelmSocket(helmSocket);
      self.player.setArmorName(armor);
      self.player.setArmorLevel(armorLevel);
      self.player.setArmorBonus(armorBonus);
      self.player.setArmorSocket(armorSocket);
      self.player.setSpriteName(armor);
      self.player.setWeaponName(weapon);
      self.player.setWeaponLevel(weaponLevel);
      self.player.setWeaponBonus(weaponBonus);
      self.player.setWeaponSocket(weaponSocket);
      self.player.setBelt(belt);
      self.player.setCape(cape);
      self.player.setPet(pet);
      self.player.setShieldName(shield);
      self.player.setShieldLevel(shieldLevel);
      self.player.setShieldBonus(shieldBonus);
      self.player.setShieldSocket(shieldSocket);
      self.player.setDefenseSkill(defenseSkill);
      self.setDefenseSkill(defenseSkill);
      self.player.setAttackSkill(attackSkill);
      self.setAttackSkill(attackSkill);

      self.player.setRing1(ring1);
      self.player.setRing2(ring2);
      self.player.setAmulet(amulet);
      self.player.setAuras(auras);
      self.initPlayer();
      self.player.experience = experience;
      self.player.level = Types.getLevel(experience);
      self.player.setInventory(inventory);
      self.player.setStash(stash);

      self.setGold(gold);
      self.setGoldStash(goldStash);
      self.setGoldTrade(0);
      self.setCoin(coin);

      self.initSettings(settings);
      self.toggleCapeSliders(!!cape);
      self.updateBars();
      self.updateExpBar();
      self.resetCamera();
      self.updatePlateauMode();
      self.audioManager.updateMusic();
      self.initAchievements();
      self.initInventory();
      self.initUpgrade();
      self.initTrade();
      self.initMerchant();
      self.initStash();
      self.initTooltips();
      self.initSendUpgradeItem();
      self.initUpgradeItemPreview();
      self.initWaypoints(waypoints);
      self.initTransferGold();

      self.store.depositAccount = depositAccount;

      self.player.nanoPotions = nanoPotions;
      self.player.gems = gems;
      self.player.artifact = artifact;

      self.player.waypoints = waypoints;
      self.player.skeletonKey = !!achievement[26];
      self.cowLevelPortalCoords = cowLevelPortalCoords;
      self.admins = admins;

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
      self.app.initPlayerInfo();
      self.app.initNanoPotions();
      self.app.initTradePlayer1StatusButton();

      self.storage.initPlayer(name, account, expansion1, expansion2);
      self.renderer.loadPlayerImage();

      if (isHurtByTrap) {
        self.tryUnlockingAchievement("MISSTEP");
      }

      if (!self.storage.hasAlreadyPlayed() || self.player.level === 1) {
        self.showNotification(`Welcome to ${network === "nano" ? "Nano" : "Banano"} BrowserQuest!`);
        self.app.toggleInstructions();
      } else {
        self.showNotification("Welcome Back. You are level " + self.player.level + ".");
      }

      if (hash) {
        self.gamecompleted_callback({ hash, fightAgain: false });
      }

      // @NOTE possibly optimize this? sending request to move items to inventory
      self.client.sendMoveItemsToInventory("upgrade");
      // Inventory might be locked
      setTimeout(() => {
        self.client.sendMoveItemsToInventory("trade");
      }, 250);

      self.client.onAccount(function ({ account, network, depositAccount }) {
        self.store.depositAccount = depositAccount;
        self.setPlayerAccount({ account, network });

        self.app.initPlayerInfo();
      });

      self.player.onStartPathing(function (path) {
        var i = path.length - 1,
          x = path[i][0],
          y = path[i][1];

        if (self.player.isMovingToLoot()) {
          self.player.isLootMoving = false;
        } else if (!self.player.isAttacking()) {
          self.client.sendMove(x, y);
        }

        self.processPetInput();

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
        if (!self.player.isDead && !mob.isWaitingToAttack(self.player) && !self.player.isAttackedBy(mob)) {
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
        const { gridX, gridY } = self.player;

        const trap = self.getTrap(gridX, gridY);
        if (trap?.id) {
          const entity = self.getEntityById(trap?.id);

          if (entity?.isActivated) {
            if (!self.player.isHurtByTrap) {
              self.player.isHurtByTrap = true;

              self.client.sendHurtTrap(trap);
              setTimeout(() => {
                if (self.player) {
                  self.player.isHurtByTrap = false;
                }
              }, 3000);
            }
          } else {
            self.client.sendActivateTrap(trap?.id);
          }
        }
        const statues = self.getStatues(gridX, gridY);

        if (statues?.length) {
          statues.forEach(({ id }) => {
            const entity = self.getEntityById(id);

            if (entity && !entity.isActivated) {
              entity.isActivated = true;
              self.client.sendActivateStatue(id);
            }
          });
        }

        if (self.player.hasNextStep()) {
          self.registerEntityDualPosition(self.player);
        }

        if (self.isZoningTile(gridX, gridY)) {
          self.isCharacterZoning = true;
          self.enqueueZoningFrom(gridX, gridY);
        }

        self.player.forEachAttacker(self.makeAttackerFollow);

        var item = self.getItemAt(gridX, gridY);
        if (item instanceof Item) {
          self.tryLootingItem(item);
        }

        if ((gridX <= 85 && gridY <= 179 && gridY > 178) || (gridX <= 85 && gridY <= 266 && gridY > 265)) {
          self.tryUnlockingAchievement("INTO_THE_WILD");
        }

        if (gridX <= 85 && gridY <= 293 && gridY > 292) {
          self.tryUnlockingAchievement("AT_WORLDS_END");
        }

        if (gridX <= 85 && gridY <= 100 && gridY > 99) {
          self.tryUnlockingAchievement("NO_MANS_LAND");
        }

        if (gridX <= 85 && gridY <= 51 && gridY > 50) {
          self.tryUnlockingAchievement("HOT_SPOT");
        }

        if (gridX <= 27 && gridY <= 123 && gridY > 112) {
          self.tryUnlockingAchievement("TOMB_RAIDER");
        }

        if (gridY > 444) {
          self.tryUnlockingAchievement("FREEZING_LANDS");
        }

        if (gridY >= 350 && gridY <= 365 && gridX <= 80) {
          self.tryUnlockingAchievement("WALK_ON_WATER");
        }

        if (gridY >= 328 && gridY <= 332 && gridX >= 13 && gridX <= 23) {
          self.tryUnlockingAchievement("WEN");
        }

        // if (gridX >= 77 && gridX <= 83 && gridY >= 680 && gridY <= 684) {
        //   self.tryUnlockingAchievement("WOODLAND");
        // }

        self.updatePlayerCheckpoint();

        if (!self.player.isDead) {
          self.audioManager.updateMusic();
        }
      });

      self.player.onStopPathing(function ({
        x = 0,
        y = 0,
        playerId = 0,
        orientation = Types.Orientations.DOWN,
        confirmed,
        isWaypoint,
        isStoneTeleport = false,
        isTeleportSent = false,
      }) {
        // Start by unregistering the entity at its previous coords
        self.unregisterEntityPosition(self.player);
        if (isWaypoint || isStoneTeleport) {
          // Make sure the character is paused / halted when entering a waypoint, else the player goes invisible
          self.player.stop();
          self.player.nextStep();

          // Clear trap coords
          self.traps = [];
          self.statues = [];
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
        if ((!self.player.hasTarget() && isDoor) || isWaypoint || isStoneTeleport) {
          // Close all when teleporting
          self.app.hideWindows();
          let dest = isWaypoint || isStoneTeleport ? { x, y, orientation } : self.map.getDoorDestination(x, y);
          if (!confirmed && !isStoneTeleport) {
            if (x === 71 && y === 21 && dest.x === 155 && dest.y === 96 && self.player.level <= 24) {
              self.client.sendBossCheck(false);

              return;
            }

            let message = "";
            let levelRequirement = 1;
            let isDoorAccessDenied = false;

            const isTempleDoor = dest.x === 156 && dest.y === 778;
            const isAzraelDoor = dest.x === 98 && dest.y === 764;
            const isGatewayDoor = dest.x === 13 && dest.y === 777;
            const isNecromancerDoor = dest.x === 127 && dest.y === 324;

            if (isTempleDoor) {
              levelRequirement = 67;
              if (self.player.level < levelRequirement) {
                isDoorAccessDenied = true;
                message = `You need lv.${levelRequirement} or above to enter the temple.`;
              }
            }
            if (isAzraelDoor) {
              levelRequirement = 69;
              if (self.player.level < levelRequirement) {
                isDoorAccessDenied = true;
                message = `You need lv.${levelRequirement} or above to enter the temple.`;
              } else if (
                dest.x === self.deathAngelLevelPortalCoords.x &&
                dest.y === self.deathAngelLevelPortalCoords.y
              ) {
                self.client.sendTeleport(dest.x, dest.y, self.player.orientation);
                return;
              }
            } else if (isGatewayDoor) {
              levelRequirement = 68;
              if (self.player.level < levelRequirement) {
                isDoorAccessDenied = true;
                message = `You need lv.${levelRequirement} or above to enter the Gateway.`;
              }
            } else if (isNecromancerDoor) {
              levelRequirement = 43;
              if (self.player.level < levelRequirement) {
                isDoorAccessDenied = true;
                message = `You need lv${levelRequirement} or above to enter`;
              }
            }

            if (isDoorAccessDenied && message) {
              self.showNotification(message);
              self.audioManager.playSound("noloot", { force: true });
              return;
            }
          }

          var desty = dest.y;

          // @TODO Fix this...
          // if (self.renderer.mobile) {
          //push them off the door spot so they can use the
          //arrow keys and mouse to walk back in or out

          if (!isWaypoint) {
            if (dest.orientation === Types.Orientations.UP) {
              desty--;
            } else if (dest.orientation === Types.Orientations.DOWN) {
              desty++;
            }
          }
          // }

          self.player.setGridPosition(dest.x, desty);
          self.player.nextGridX = dest.x;
          self.player.nextGridY = desty;
          self.player.turnTo(dest.orientation);
          self.player.idle();

          if (!isTeleportSent) {
            if (isStoneTeleport && !confirmed) {
              self.client.sendStoneTeleport(playerId);
            } else {
              self.client.sendTeleport(dest.x, desty, self.player.orientation);
            }
          }

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
          if (x === 131 && y === 651) {
            self.tryUnlockingAchievement("WAY_OF_WATER");
          } else if (x === 43 && y === 579) {
            self.tryUnlockingAchievement("PHARAOH");
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

          if (dest.portal || isWaypoint || isStoneTeleport) {
            self.audioManager.playSound("teleport");
          }

          if (!self.player.isDead) {
            self.audioManager.updateMusic();
          }

          self.player.removeTarget();
          self.updateCursor();
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
        self.player.setSprite(self.getSprite("death"));
        self.player.animate("death", 120, 1, () => {
          console.info(self.playerId + " was removed");

          self.removeEntity(self.player);
          self.removeFromRenderingGrid(self.player, self.player.gridX, self.player.gridY);

          self.player = null;
          self.client.disable();

          window.setTimeout(function () {
            $("#respawn").removeClass("disabled");

            if (!$("body").hasClass("death")) {
              self.playerdeath_callback?.();
            }
          }, 1000);
        });

        clearInterval(self.player.defenseSkillTimeout);
        self.player.defenseSkillTimeout = null;
        $("#skill-defense").removeClass("disabled").find(".skill-timeout").attr("class", "skill-timeout");

        self.player.forEachAttacker(function (attacker) {
          attacker.disengage();

          self.player.removeAttacker(attacker);
        });

        self.audioManager.fadeOutCurrentMusic();
        self.audioManager.playSound("death");
      });

      self.player.onHasMoved(function (player) {
        self.assignBubbleTo(player);
      });

      self.player.onSwitchItem(() => {
        self.renderer.loadPlayerImage();
        self.equipment_callback?.();
      });

      self.player.onInvincibleStart(function () {
        self.invinciblestart_callback();
        self.player.switchArmor(self.getSprite("firefox"), 1);
      });

      self.player.onInvincibleStop(function () {
        self.invinciblestop_callback();
      });

      self.client.onSpawnItem(function (item, x, y) {
        self.addItem(item, x, y);
      });

      self.client.onSpawnChest(function (chest, x, y) {
        chest.setSprite(self.getSprite(chest.getSpriteName()));
        chest.setGridPosition(x, y);
        chest.setAnimation("idle_down", 150);
        self.addEntity(chest);

        chest.onOpen(function () {
          chest.stopBlinking();
          chest.setSprite(self.getSprite("death"));
          chest.setAnimation("death", 120, 1, function () {
            console.info(chest.id + " was removed");
            self.removeEntity(chest);
            self.removeFromRenderingGrid(chest, chest.gridX, chest.gridY);
            self.previousClickPosition = null;
          });
        });
      });

      self.client.onSpawnCharacter(function (data) {
        const {
          id,
          kind,
          isPet,
          name,
          x,
          y,
          targetId,
          orientation,
          resistances,
          element,
          enchants,
          isActivated,
          bonus,
          petId,
          ownerId,
          skin,
          level,
          settings,
        } = data;

        if (kind === Types.Entities.GATEWAYFX) {
          self.gatewayFxNpcId = id;
        }

        let entity = self.getEntityById(id);
        let isEntityExist = !!entity;

        if (!isEntityExist) {
          try {
            if (id !== self.playerId) {
              if (!isPet) {
                entity = EntityFactory.createEntity({ kind, id, name, resistances, petId });
              } else {
                const owner = self.getEntityById(ownerId);
                const name = ownerId ? `Pet of ${owner?.name}` : "";
                entity = EntityFactory.createEntity({ kind, id, name, resistances, ownerId, skin, level, bonus });

                if (owner) {
                  owner.petId = id;
                  owner.petEntity = entity;
                }
              }

              if (element) {
                entity.element = element;
              }
              if (enchants) {
                entity.enchants = enchants;

                if (enchants.includes("lightning")) {
                  if (!entity.auras.includes("thunderstorm")) {
                    entity.auras.push("thunderstorm");
                  }
                }
                if (enchants.includes("cold")) {
                  if (!entity.auras.includes("freeze")) {
                    entity.auras.push("freeze");
                  }
                }
              }
              if (bonus?.attackSpeed) {
                entity.setAttackSpeed(bonus?.attackSpeed);
              }
              if (entity instanceof Mob && enchants?.includes("fast")) {
                entity.setAttackSpeed(30);
              }

              if (entity.kind === Types.Entities.MAGE && element !== "spectral") {
                entity.setSprite(self.getSprite(entity.getSpriteName(element === "spectral" ? "" : element)));
              } else if (isPet) {
                entity.setSprite(self.getSprite(entity.getSpriteName(skin)));
              } else {
                entity.setSprite(self.getSprite(entity.getSpriteName()));
              }

              entity.setGridPosition(x, y);
              entity.setOrientation(orientation);

              if (entity.kind === Types.Entities.ZOMBIE) {
                entity.raise();

                // NOTE wait for the raise animation to complete before chasing players
                setTimeout(() => {
                  entity.aggroRange = 10;
                  entity.isAggressive = true;
                }, 1000);
              } else if (entity.kind === Types.Entities.PORTALCOW && entity.gridX === 43 && entity.gridY === 211) {
                if (self.cowPortalStart) {
                  self.audioManager.playSound("portal-open");

                  entity.animate("raise", 75, 1, () => {
                    entity.idle();
                  });
                } else {
                  entity.idle();
                }
              } else if (entity.kind === Types.Entities.PORTALMINOTAUR && entity.gridX === 40 && entity.gridY === 210) {
                if (self.minotaurPortalStart) {
                  self.audioManager.playSound("portal-open");

                  entity.animate("raise", 75, 1, () => {
                    entity.idle();
                  });
                } else {
                  entity.idle();
                }
              } else if (entity.kind === Types.Entities.PORTALSTONE && entity.gridX === 71 && entity.gridY === 643) {
                if (self.stonePortalStart) {
                  self.audioManager.playSound("portal-open");

                  entity.animate("raise", 75, 1, () => {
                    entity.idle();
                  });
                } else {
                  entity.idle();
                }
              } else if (entity.kind === Types.Entities.PORTALGATEWAY && entity.gridX === 97 && entity.gridY === 545) {
                if (self.gatewayPortalStart) {
                  setTimeout(() => {
                    self.audioManager.playSound("portal-open");
                    entity.animate("raise", 75, 1, () => {
                      entity.idle();
                    });
                  }, 1500);
                } else {
                  entity.idle();
                }
              } else if (entity.kind === Types.Entities.DOORDEATHANGEL) {
                entity.isActivated = isActivated;
                if (entity.isActivated) {
                  entity.walk();
                } else {
                  entity.idle();
                }
              } else if (entity.kind === Types.Entities.MAGICSTONE) {
                entity.isActivated = isActivated;
                if (entity.isActivated) {
                  entity.walk();
                } else {
                  entity.idle();
                }
              } else if (
                entity.kind === Types.Entities.LEVER ||
                entity.kind === Types.Entities.LEVER2 ||
                entity.kind === Types.Entities.LEVER3
              ) {
                entity.isActivated = isActivated;
                if (entity.isActivated) {
                  entity.walk();
                } else {
                  entity.idle();
                }
              } else if (entity.kind === Types.Entities.BLUEFLAME) {
                entity.isActivated = isActivated;
                entity.setVisible(isActivated);
                entity.idle();
              } else if (
                entity.kind === Types.Entities.ALTARCHALICE ||
                entity.kind === Types.Entities.ALTARSOULSTONE ||
                entity.kind === Types.Entities.HANDS
              ) {
                if (entity.kind === Types.Entities.ALTARCHALICE) {
                  self.altarChaliceNpcId = entity.id;
                } else if (entity.kind === Types.Entities.ALTARSOULSTONE) {
                  self.altarSoulStoneNpcId = entity.id;
                }

                entity.isActivated = isActivated;
                if (entity.isActivated) {
                  entity.walk();
                } else {
                  entity.idle();
                }
              } else {
                if (
                  entity.kind === Types.Entities.TRAP ||
                  entity.kind === Types.Entities.TRAP2 ||
                  entity.kind === Types.Entities.TRAP3
                ) {
                  if (!self.traps.find(trap => trap.id === entity.id)) {
                    self.traps.push({ id: entity.id, x: entity.gridX, y: entity.gridY });
                  }
                } else if (entity.kind === Types.Entities.STATUE || entity.kind === Types.Entities.STATUE2) {
                  if (!self.statues.find(statue => statue.id === entity.id)) {
                    self.statues.push({ id: entity.id, x: entity.gridX, y: entity.gridY });
                  }
                }

                entity.idle();
              }

              if (entity.kind === Types.Entities.SECRETSTAIRS) {
                self.audioManager.playSound("secret-found");
              }

              self.addEntity(entity);

              if (entity instanceof Player) {
                entity.setSettings(settings);
              }

              if (entity instanceof Character) {
                if (!(entity instanceof Npc)) {
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

                    if (entity.spawnCharacterCoords) {
                      entity.gridX = entity.spawnCharacterCoords.x;
                      entity.gridY = entity.spawnCharacterCoords.y;
                    }

                    self.registerEntityPosition(entity);

                    entity.spawnCharacterCoords = null;
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
                }

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

                  // Make sure the death animation happens, if the entity is currently pathing reset it
                  entity.aggroRange = 0;
                  entity.stop();
                  entity.isDying = true;

                  let speed = 120;

                  // Custom death animations
                  const hasCustomDeathAnimation = [
                    Types.Entities.RAT,
                    Types.Entities.RAT2,
                    Types.Entities.RAT3,
                    Types.Entities.GOLEM,
                    Types.Entities.GHOST,
                    Types.Entities.WORM,
                    Types.Entities.OCULOTHORAX,
                    Types.Entities.SKELETONBERSERKER,
                    Types.Entities.SKELETONARCHER,
                    Types.Entities.SPIDERQUEEN,
                    Types.Entities.BUTCHER,
                    Types.Entities.SHAMAN,
                    Types.Entities.WORM,
                    Types.Entities.DEATHBRINGER,
                    Types.Entities.DEATHANGEL,
                  ].includes(entity.kind);

                  if ([Types.Entities.SPIDERQUEEN, Types.Entities.DEATHANGEL].includes(entity.kind)) {
                    speed = 250;
                  }
                  if (!hasCustomDeathAnimation) {
                    entity.setSprite(self.getSprite("death"));
                  }

                  if (isPet) {
                    self.removeEntity(entity);
                  } else {
                    entity.animate("death", speed, 1, function () {
                      console.info(entity.id + " was removed");
                      self.removeEntity(entity);
                      self.removeFromRenderingGrid(entity, entity.gridX, entity.gridY);
                    });
                  }
                  entity.forEachAttacker(function (attacker) {
                    attacker.disengage();
                    self.player.removeAttacker(attacker);
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
                    if (entity.kind === Types.Entities.DEATHANGEL) {
                      self.audioManager.playSound("deathangel-death");
                    } else {
                      self.audioManager.playSound("kill" + Math.floor(Math.random() * 2 + 1));
                    }
                  }

                  self.updateCursor();
                });

                entity.onHasMoved(function (entity) {
                  self.assignBubbleTo(entity); // Make chat bubbles follow moving entities
                });
              }
            }
          } catch (err) {
            console.error(err);
          }
        } else {
          if (isPet) {
            self.unregisterEntityPosition(entity);

            console.debug("PET " + entity.id + " already exists. Don't respawn, only relocate.");
            entity.setGridPosition(x, y);
            self.registerEntityPosition(entity);

            entity.spawnCharacterCoords = { x, y };
          } else {
            console.debug("Entity " + entity.id + " already exists. Don't respawn only relocate.");
          }
        }

        if (entity instanceof Player || entity instanceof Mob) {
          entity.hitPoints = data.hitPoints;
          entity.maxHitPoints = data.maxHitPoints;
        }

        if (entity instanceof Player && entity.id !== self.player.id) {
          // @NOTE Manually update locally stored entity to prevent invisible unupdated coords entity
          // Before this the entities were not updated because they already existed
          // const currentEntity = self.getEntityById(entity.id);
          self.unregisterEntityPosition(entity);

          const {
            weapon: rawWeapon,
            helm: rawHelm,
            armor: rawArmor,
            amulet,
            ring1,
            ring2,
            belt,
            level,
            auras,
            partyId,
            cape,
            pet,
            shield,
            settings,
          } = data;

          const [helm, helmLevel, helmBonus, helmSocket] = rawHelm.split(":");
          const [armor, armorLevel, armorBonus, armorSocket] = rawArmor.split(":");
          const [weapon, weaponLevel, weaponBonus, weaponSocket, weaponSkill] = rawWeapon.split(":");

          entity.setWeaponName(weapon);
          entity.setWeaponLevel(weaponLevel);
          entity.setWeaponBonus(weaponBonus);
          entity.setWeaponSocket(weaponSocket);
          entity.setAttackSkill(weaponSkill);
          entity.setSpriteName(armor);
          entity.setArmorName(armor);
          entity.setArmorLevel(armorLevel);
          entity.setArmorBonus(armorBonus);
          entity.setArmorSocket(armorSocket);
          entity.setHelmName(helm);
          entity.setHelmLevel(helmLevel);
          entity.setHelmBonus(helmBonus);
          entity.setHelmSocket(helmSocket);
          entity.setBelt(belt);
          entity.setAmulet(amulet);
          entity.setRing1(ring1);
          entity.setRing2(ring2);
          entity.setAuras(auras);
          entity.setCape(cape);
          entity.setPet(pet);
          entity.setShield(shield);
          entity.setSettings(settings);
          entity.setPartyId(partyId);
          entity.setLevel(level);
          entity.setSprite(self.getSprite(entity.getSpriteName()));

          // @NOTE Teleport and onStopPathing re-writes the entity position
          // but this should be the source of truth and happend after

          entity.setGridPosition(x, y);
          entity.setOrientation(orientation);
          self.registerEntityPosition(entity);

          if (isEntityExist) {
            entity.spawnCharacterCoords = { x, y };
          }
        }

        if (entity instanceof Mob) {
          if (targetId) {
            var player = self.getEntityById(targetId);
            if (player) {
              self.createAttackLink(entity, player);
            }
          }
        }
      });

      self.client.onSpawnSpell(function (
        entity,
        x,
        y,
        orientation,
        originX,
        originY,
        element: Elements,
        casterId,
        targetId,
        isRaise2 = false,
      ) {
        const caster = self.getEntityById(casterId);
        if (!caster) return;

        if ([Types.Entities.MAGESPELL, Types.Entities.ARROW, Types.Entities.DEATHANGELSPELL].includes(entity.kind)) {
          entity.setSprite(
            self.getSprite(entity.getSpriteName(!element || ["spectral"].includes(element) ? "" : element)),
          );
        } else {
          entity.setSprite(self.getSprite(entity.getSpriteName()));
        }

        if (entity.kind === Types.Entities.DEATHBRINGERSPELL) {
          const target = self.getEntityById(targetId) || self.player;
          entity.setTarget(target);
          entity.setGridPosition(target.gridX, target.gridY);
        } else {
          entity.setGridPosition(caster.gridX, caster.gridY);
        }

        // @NOTE Adjustment so the spell is correctly aligned
        if (entity.kind === Types.Entities.MAGESPELL && !isRaise2) {
          entity.y = caster.y - 8;
        } else if (entity.kind === Types.Entities.STATUESPELL || entity.kind === Types.Entities.STATUE2SPELL) {
          entity.x = caster.x;
          entity.y = caster.y + 8;
        } else if (entity.kind === Types.Entities.ARROW) {
          entity.y = caster.y - 12;
          if (entity.x < self.player.x) {
            entity.x = caster.x + 16;
          } else if (entity.x > self.player.x) {
            entity.x = caster.x - 8;
          }
        }
        entity.setOrientation(orientation);

        if (entity.kind === Types.Entities.DEATHANGELSPELL || (entity.kind === Types.Entities.MAGESPELL && isRaise2)) {
          entity.setTarget({ x: (x + originX * 8) * 16, y: (y + originY * 8) * 16 });
        } else if ([Types.Entities.MAGESPELL, Types.Entities.ARROW].includes(entity.kind)) {
          const target = self.getEntityById(targetId) || self.player;
          entity.setTarget({ x: target.x, y: target.y });
        } else if (entity.kind === Types.Entities.STATUESPELL || entity.kind === Types.Entities.STATUE2SPELL) {
          entity.setTarget({ x: x * 16, y: (y + 16) * 16 });
        }

        if (entity.kind === Types.Entities.DEATHBRINGERSPELL) {
          entity.animate("idle", entity.idleSpeed, 1, () => entity.die());
        } else {
          entity.idle();
        }

        self.addEntity(entity);

        // Spell collision
        if (self.player.gridX === x && self.player.gridY === y) {
          self.makePlayerHurtFromSpell(entity);
        }

        entity.onDeath(function () {
          // @NOTE: The spell can not be dead from the other player's point of view
          // This forces the updater(c) to stop moving the spell
          entity.isDead = true;

          console.info(entity.id + " is dead");

          if (Types.Entities.DEATHBRINGERSPELL) {
            self.removeEntity(entity);
            self.removeFromRenderingGrid(entity, entity.gridX, entity.gridY);
            return;
          }

          let speed = 120;

          // Custom death animations
          const hasCustomDeathAnimation = [
            Types.Entities.DEATHANGELSPELL,
            Types.Entities.MAGESPELL,
            Types.Entities.STATUESPELL,
            Types.Entities.STATUE2SPELL,
          ].includes(entity.kind);

          if (!hasCustomDeathAnimation) {
            entity.setSprite(self.getSprite("death"));
          }

          entity.animate("death", speed, 1, function () {
            console.info(`${Types.getKindAsString(entity.kind)} (${entity.id}) was removed`);
            self.removeEntity(entity);
          });
        });
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
          } else if (entity instanceof Spell) {
            entity.death_callback?.();
          } else if (entity instanceof Pet) {
            entity.die();
          } else if (entity instanceof Character) {
            if (!(entity instanceof Mob)) {
              entity.forEachAttacker(function (attacker) {
                if (attacker.canReachTarget()) {
                  attacker.hit();
                }
              });
            }
            if (!entity.isDead) {
              entity.die();

              if (entity instanceof Player && entity.petId) {
                self.getEntityById(entity.petId)?.die();
              } else if (entity instanceof Pet) {
              }
            }
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
        self.partyInvites = [];
        self.partyInvitees = [];

        self.chat_callback({ message: "Party created!", type: "event" });
      });

      self.client.onPartyJoin(function (data) {
        const { partyId, partyLeader, members } = data;

        self.partyInvites = [];
        if (partyLeader.name === self.player.name) {
          self.partyInvitees = self.partyInvitees.filter(invitee => invitee !== data.playerName);
        }

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
        self.nbplayers_callback();
      });

      self.client.onPartyRefuse(function (data) {
        const { partyId } = data;

        self.partyInvites = self.partyInvites.filter(invites => invites.partyId !== partyId);

        self.nbplayers_callback();
      });

      self.client.onPartyInvite(function (data) {
        // Cannot be invited if already in a party
        if (self.player.partyId) return;

        const { partyId, partyLeader } = data;

        self.partyInvites.push({ name: partyLeader.name, partyId });

        if (!$("#party").hasClass("active")) {
          self.app.partyBlinkInterval = setInterval(() => {
            $("#party-button").toggleClass("blink");
          }, 500);
        }

        self.chat_callback({
          message: `${partyLeader.name} invite you to join the party. To accept open the party panel or type /party join ${partyId}`,
          type: "info",
        });
      });

      self.client.onPartyDeleteInvite(function (data) {
        // Cannot be invited if already in a party
        if (self.player.partyId) return;

        const { partyId } = data;

        self.partyInvites = self.partyInvites.filter(invites => invites.partyId !== partyId);
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
          self.partyInvites = [];
          self.partyInvitees = [];
        }
        // @NOTE add isNewLeader to determine when to display this?
        // if (self.player.name === partyLeader?.name) {
        //   message += ", you are now the party leader";
        // }
        self.chat_callback({ message, type: "info" });
        self.nbplayers_callback();
      });

      self.client.onPartyDisband(function () {
        self.partyInvites = [];
        self.partyInvitees = [];

        self.player.partyMembers?.forEach(({ id }) => {
          self.getEntityById(id)?.setPartyId(undefined);
        });

        self.player.setPartyId(undefined);
        self.player.setPartyLeader(undefined);
        self.player.setPartyMembers(undefined);

        self.chat_callback({ message: "Party was disbanded", type: "info" });
        self.nbplayers_callback();

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

      self.client.onSoulStone(function ({ kind, isUnique }) {
        let message = "";
        if (isUnique) {
          message = `${Types.itemUniqueMap[Types.getKindAsString(kind)][0]}`;
        } else {
          message = `${EntityFactory.builders[kind]().getLootMessage().replace("You pick up", "")}`;
        }
        message += " resided within the Soul Stone";

        self.chat_callback({ message, type: "loot" });
      });

      self.client.onTradeRequestSend(function (playerName) {
        self.chat_callback({ message: `Trade request sent to ${playerName}`, type: "event" });
      });

      self.client.onTradeRequestReceive(function (playerName) {
        $("#container").addClass("prevent-click");
        $("#dialog-trade-request").dialog({
          dialogClass: "no-close",
          autoOpen: true,
          draggable: false,
          title: "Trade request",
          text: "hello",
          classes: {
            "ui-button": "btn",
          },
          buttons: [
            {
              text: "Refuse",
              class: "btn btn-default",
              click: function () {
                self.client.sendTradeRequestRefuse(playerName);
                $(this).dialog("close");
                $("#container").removeClass("prevent-click");
              },
            },
            {
              text: "Accept",
              class: "btn",
              click: function () {
                self.client.sendTradeRequestAccept(playerName);
                $(this).dialog("close");
                $("#container").removeClass("prevent-click");
              },
            },
          ],
        });
        $("#dialog-trade-request").text(`${playerName} wants to start trading with you.`);
        // @ts-ignore
        $(".ui-button").removeClass("ui-button");
      });

      self.client.onTradeStart(function (players) {
        $("#trade-player1-status-button").removeClass("disabled");
        if ($("#dialog-trade-request").dialog("instance")) {
          $("#dialog-trade-request").dialog("close");
        }

        players.forEach(({ id }) => {
          if (self.entities[id].name === self.player.name) {
            $("#trade-player1-name").text(self.entities[id].name);
          } else {
            $("#trade-player2-name").text(self.entities[id].name);
          }
        });

        self.app.openTrade();
      });

      self.client.onTradeClose(function ({ playerName, isCompleted, isInventoryFull }) {
        let message = "";
        if (isCompleted) {
          message = "trade completed";
        } else if (isInventoryFull) {
          message = `${playerName === self.player.name ? "Your" : playerName} inventory doesn't have enough space`;
        } else {
          message = `${playerName === self.player.name ? "You" : playerName} closed the trade`;
          if (playerName === self.player.name) {
          }
        }

        self.app.closeTrade(isCompleted);
        self.player.tradePlayer1 = [];

        self.chat_callback({
          message,
          type: "info",
        });
      });

      self.client.onTradeInfo(function (message) {
        self.chat_callback({ message, type: "info" });
      });

      self.client.onTradeError(function (message) {
        self.chat_callback({ message, type: "error" });
      });

      self.client.onPlayer1MoveItem(function (items) {
        self.player.setTradePlayer1(items);
        self.updateTradePlayer1();
      });

      self.client.onPlayer2MoveItem(function (items) {
        self.player.setTradePlayer2(items);
        self.updateTradePlayer2();
      });

      self.client.onPlayer1Status(function (isAccepted) {
        $("#trade-player1-status").find(".btn").toggleClass("disabled", isAccepted);

        self.updateTradePlayer1(!isAccepted);
      });

      self.client.onPlayer2Status(function (isAccepted) {
        $("#trade-player2-status").text(isAccepted ? "Accepted" : "Waiting ...");
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
            }, 200); // delay to prevent other attacking mobs from ending up on the same tile as they walk towards each other.
          } else {
            self.createAttackLink(attacker, target);
          }
        }
      });

      self.client.onEntityRaise(function (mobId, targetId) {
        const mob = self.getEntityById(mobId);

        if (mob) {
          if (mob.kind === Types.Entities.DEATHANGEL) {
            mob.setRaisingMode();
            self.audioManager.playSound("deathangel-spell");
            if (targetId === self.playerId) {
              self.client.sendCastSpell(mob.id, mob.gridX, mob.gridY);
            }
          } else if (mob.kind === Types.Entities.DEATHBRINGER) {
            mob.setRaisingMode();
            // self.audioManager.playSound("deathangel-spell");
            if (targetId === self.playerId) {
              self.client.sendCastSpell(mob.id, mob.gridX, mob.gridY);
            }
          } else if (mob.kind === Types.Entities.NECROMANCER) {
            mob.setRaisingMode();
            self.audioManager.playSound("raise");
          } else if (mob.kind === Types.Entities.MAGICSTONE) {
            self.audioManager.playSound("magicstone");
            self.activatedMagicStones.push(mobId);

            mob.animate("raise", mob.raiseSpeed, 1, () => mob.walk());
          } else if (
            mob.kind === Types.Entities.LEVER ||
            mob.kind === Types.Entities.LEVER2 ||
            mob.kind === Types.Entities.LEVER3
          ) {
            if ([mob.kind === Types.Entities.LEVER, mob.kind === Types.Entities.LEVE2].includes(mob.kind)) {
              self.audioManager.playSound("lever");
            } else if (mob.kind === Types.Entities.LEVER3) {
              self.audioManager.playSound("lever3");
            }

            mob.animate("raise", mob.raiseSpeed, 1, () => mob.walk());
          } else if (mob.kind === Types.Entities.DOORDEATHANGEL) {
            mob.isActivated = true;
            mob.animate("raise", mob.raiseSpeed, 1, () => mob.walk());
          } else if (mob.kind === Types.Entities.BLUEFLAME) {
            self.activatedBlueFlames.push(mobId);

            mob.idle();
            mob.setVisible(true);
          } else if (mob.kind === Types.Entities.ALTARCHALICE) {
            self.isAltarChaliceActivated = true;

            mob.walk();
            // self.audioManager.playSound("secret-found");
          } else if (mob.kind === Types.Entities.ALTARSOULSTONE) {
            self.audioManager.playSound("magic-blast");
            setTimeout(() => {
              self.audioManager.playSound("stone-break");
            }, 400);

            mob.animate("walk", 100, 1, () => mob.idle());
          } else if (mob.kind === Types.Entities.HANDS) {
            mob.walk();

            if (self.gatewayFxNpcId) {
              const gatewayFx = self.getEntityById(self.gatewayFxNpcId);
              if (gatewayFx) {
                self.audioManager.playSound("powder", { delay: 0, volume: 0.25 });
                self.audioManager.playSound("static", { delay: 250 });

                gatewayFx.animate("raise", gatewayFx.raiseSpeed, 1, () => {
                  gatewayFx.idle();
                });
              }
            }
          } else if (mob.kind === Types.Entities.STATUE || mob.kind === Types.Entities.STATUE2) {
            if (mob.kind === Types.Entities.STATUE) {
              self.audioManager.playSound("fireball", { delay: 250 });
            } else if (mob.kind === Types.Entities.STATUE2) {
              self.audioManager.playSound("iceball", { delay: 250 });
            }

            mob.isActivated = true;
            mob.animate("raise", mob.raiseSpeed, 1, () => mob.idle());
          } else if ([Types.Entities.TRAP, Types.Entities.TRAP2, Types.Entities.TRAP3].includes(mob.kind)) {
            self.audioManager.playSound("trap");
            mob.raise();
            mob.isActivated = true;

            setTimeout(() => {
              const { gridX, gridY } = self.player;

              const trap = self.getTrap(gridX, gridY);
              if (trap?.id === mob.id) {
                if (!self.player.isHurtByTrap) {
                  self.player.isHurtByTrap = true;

                  self.client.sendHurtTrap(trap);
                  setTimeout(() => {
                    if (self.player) {
                      self.player.isHurtByTrap = false;
                    }
                  }, 3000);
                }
              }
            }, 150);

            setTimeout(() => {
              mob.walk();
              setTimeout(() => {
                mob.unraise();
                mob.isActivated = false;
                setTimeout(() => {
                  mob.idle();
                }, 300);
              }, 750);
            }, 675);
          }
        }
      });

      self.client.onEntityUnraise(function (mobId) {
        const mob = self.getEntityById(mobId);

        if (mob) {
          if (mob.kind === Types.Entities.MAGICSTONE) {
            self.activatedMagicStones = [];
            mob.idle();
          } else if (mob.kind === Types.Entities.LEVER || mob.kind === Types.Entities.LEVER2) {
            self.audioManager.playSound("lever");
            mob.animate("unraise", mob.raiseSpeed, 1, () => mob.idle());
          } else if (mob.kind === Types.Entities.BLUEFLAME) {
            self.activatedBlueFlames = [];
            mob.setVisible(false);
          } else if (mob.kind === Types.Entities.ALTARCHALICE) {
            self.isAltarChaliceActivated = false;
            mob.idle();
          } else if (mob.kind === Types.Entities.HANDS) {
            mob.idle();
          }
        }
      });

      self.client.onPlayerDamageMob(function ({ id, dmg, hp, maxHitPoints, isCritical, isBlocked }) {
        var mob = self.getEntityById(id);

        if (mob && (dmg || isBlocked)) {
          self.infoManager.addDamageInfo({
            value: dmg,
            x: mob.x,
            y: mob.y - 15,
            type: "inflicted",
            isCritical,
            isBlocked,
          });
        }

        if (self.player.hasTarget() || self.player.skillTargetId === id) {
          self.updateTarget(id, dmg, hp, maxHitPoints);
        }
      });

      self.client.onPlayerKillMob(function (data) {
        const { kind, level, playerExp, exp, isMiniBoss } = data;

        self.player.experience = playerExp;

        if (self.player.level !== level || playerExp === expForLevel[expForLevel.length - 1]) {
          self.player.level = level;

          if (level === 71) {
            self.tryUnlockingAchievement("GRAND_MASTER");
          }
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
          self.client.sendRequestPayout(Types.Entities.BOSS);
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
          self.tryUnlockingAchievement("BLACK_MAGIC");
        } else if (kind === Types.Entities.COW) {
          self.storage.incrementCowCount();
          self.tryUnlockingAchievement("HAMBURGER");
        } else if (kind === Types.Entities.COWKING) {
          self.tryUnlockingAchievement("COW_KING");
        } else if (kind === Types.Entities.RAT3) {
          self.storage.incrementRat3Count();
          self.tryUnlockingAchievement("ANTIDOTE");
        } else if (kind === Types.Entities.GOLEM) {
          self.storage.incrementGolemCount();
          self.tryUnlockingAchievement("UNBREAKABLE");
        } else if (kind === Types.Entities.OCULOTHORAX) {
          self.storage.incrementOculothoraxCount();
          self.tryUnlockingAchievement("CYCLOP");
        } else if (kind === Types.Entities.SKELETON4) {
          self.storage.incrementSkeleton4Count();
          self.tryUnlockingAchievement("TEMPLAR");
        } else if (kind === Types.Entities.GHOST) {
          self.storage.incrementGhostCount();
          self.tryUnlockingAchievement("BOO");
        } else if (kind === Types.Entities.SKELETONBERSERKER) {
          self.storage.incrementSkeletonBerserkerCount();
          self.tryUnlockingAchievement("VIKING");
        } else if (kind === Types.Entities.SKELETONARCHER) {
          self.storage.incrementSkeletonArcherCount();
          self.tryUnlockingAchievement("BULLSEYE");
        } else if (kind === Types.Entities.SPIDERQUEEN) {
          self.tryUnlockingAchievement("SPIDERQUEEN");
        } else if (kind === Types.Entities.BUTCHER) {
          self.tryUnlockingAchievement("BUTCHER");
        } else if (kind === Types.Entities.MAGE) {
          self.storage.incrementMageCount();
          self.tryUnlockingAchievement("ARCHMAGE");
        } else if (kind === Types.Entities.WRAITH2) {
          self.storage.incrementWraith2Count();
          self.tryUnlockingAchievement("SPECTRAL");
        } else if (kind === Types.Entities.SHAMAN) {
          self.tryUnlockingAchievement("SHAMAN");
        } else if (kind === Types.Entities.DEATHANGEL) {
          self.tryUnlockingAchievement("DEATHANGEL");
        }

        if (kind >= Types.Entities.RAT3 && isMiniBoss) {
          self.storage.incrementMiniBossCount();
          self.tryUnlockingAchievement("MINI_BOSS");
        }

        if (Math.floor((self.player.hitPoints * 100) / self.player.maxHitPoints) <= 1 && kind > Types.Entities.RAT2) {
          self.tryUnlockingAchievement("NOT_SAFU");
        }
      });

      self.client.onPlayerChangeHealth(function ({ points, dmg, isRegen, isHurt, isBlocked, attacker }) {
        const { player } = self;
        let diff;

        if (player && !player.isDead && !player.invincible) {
          diff = points - player.hitPoints;
          player.hitPoints = points;

          if (player.hitPoints <= 0) {
            player.die(attacker);
          }
          if (isHurt) {
            self.infoManager.addDamageInfo({ value: dmg, x: player.x, y: player.y - 15, type: "received", isBlocked });

            if (!isBlocked) {
              player.hurt();
              self.audioManager.playSound("hurt");
              self.storage.addDamage(dmg);
              self.tryUnlockingAchievement("MEATSHIELD");
              self?.playerhurt_callback();
            }
          } else if (!isRegen) {
            self.infoManager.addDamageInfo({ value: "+" + diff, x: player.x, y: player.y - 15, type: "healed" });
          }
          self.updateBars();
        }
      });

      self.client.onEntityChangeHealth(function ({ points, id }) {
        const entity = self.getEntityById(id);

        if (entity) {
          entity.hitPoints = points;
          if (self.lastHovered?.id === entity.id) {
            self.updateHoveredTarget(entity);
          }
        }
      });

      self.client.onPlayerChangeStats(function ({ maxHitPoints, ...bonus }) {
        if (self.player.maxHitPoints !== maxHitPoints || self.player.invincible) {
          self.player.maxHitPoints = maxHitPoints;
          self.player.hitPoints = maxHitPoints;

          self.updateBars();
        }

        self.player.bonus = bonus;

        $("#player-damage").text(bonus.damage);
        $("#player-attackDamage").text(bonus.attackDamage);
        $("#player-criticalHit").text(bonus.criticalHit);
        $("#player-magicDamage").text(bonus.magicDamage);
        $("#player-flameDamage").text(bonus.flameDamage);
        $("#player-lightningDamage").text(bonus.lightningDamage);
        $("#player-coldDamage").text(bonus.coldDamage);
        $("#player-poisonDamage").text(bonus.poisonDamage);
        $("#player-pierceDamage").text(bonus.pierceDamage);
        $("#player-defense").text(bonus.defense);
        $("#player-blockChance").text(bonus.blockChance);
        $("#player-absorbedDamage").text(bonus.absorbedDamage);
        $("#player-magicResistance").text(bonus.magicResistance);
        $("#player-flameResistance").text(bonus.flameResistance);
        $("#player-lightningResistance").text(bonus.lightningResistance);
        $("#player-coldResistance").text(bonus.coldResistance);
        $("#player-poisonResistance").text(bonus.poisonResistance);
        $("#player-magicFind").text(bonus.magicFind);
        $("#player-attackSpeed").text(bonus.attackSpeed);
        $("#player-exp").text(bonus.exp);
        $("#player-skillTimeout").text(bonus.skillTimeout);
        $("#player-freezeChance").text(bonus.freezeChance);
        $("#player-reduceFrozenChance").text(bonus.reduceFrozenChance);
        $("#player-extraGold").text(bonus.extraGold);
        $("#player-drainLife").text(bonus.drainLife);
        $("#player-regenerateHealth").text(bonus.regenerateHealth);

        self.player.setAttackSpeed(bonus.attackSpeed);
      });

      self.client.onPlayerSettings(function ({ playerId, settings }) {
        var player = self.getEntityById(playerId);
        if (!player) return;
        if (typeof settings.capeHue === "number") {
          player.capeHue = settings.capeHue;
        }
        if (typeof settings.capeSaturate === "number") {
          player.capeSaturate = settings.capeSaturate;
        }
        if (typeof settings.capeContrast === "number") {
          player.capeContrast = settings.capeContrast;
        }
        if (typeof settings.pvp === "boolean") {
          player.pvp = settings.pvp;
        }
        if (typeof settings.partyEnabled === "boolean") {
          player.partyEnabled = settings.partyEnabled;
        }
        if (typeof settings.tradeEnabled === "boolean") {
          player.tradeEnabled = settings.tradeEnabled;
        }
      });

      self.client.onSetBonus(function (bonus) {
        self.player.setBonus = bonus;
      });

      self.client.onPlayerEquipItem(function ({ id: playerId, kind, level, bonus, socket, skill, skin, type }) {
        var player = self.getEntityById(playerId);
        var name = Types.getKindAsString(kind);

        if (player) {
          if (type === "helm") {
            player?.switchHelm(name, level, toString(bonus), toString(socket));
          } else if (type === "armor") {
            player?.switchArmor(self.getSprite(name), level, toString(bonus), toString(socket));
          } else if (type === "weapon") {
            player?.switchWeapon(name, level, toString(bonus), toString(socket), skill);

            // Clear weapon when it's used as a quest item
            if (playerId === self.player?.id && name === "dagger") {
              $(".item-equip-weapon").empty();
            }

            if (playerId === self.player.id) {
              self.setAttackSkill(skill);
            }
          } else if (type === "cape") {
            if (!kind || !level || !bonus) {
              player.removeCape();
            } else {
              player.switchCape(name, level, toString(bonus));
            }

            if (playerId === self.player.id) {
              self.toggleCapeSliders(kind && level && bonus);
            }
          } else if (type === "pet") {
            if (!kind || !level || !bonus || !socket || !skin) {
              player.setPet(null);
            } else {
              player.setPet([name, level, toString(bonus), toString(socket), skin].filter(Boolean).join(":"));
            }
          } else if (type === "shield") {
            if (!kind || !level) {
              player.removeShield();
            } else {
              player.switchShield(name, level, toString(bonus), toString(socket), skill);
            }
            if (playerId === self.player.id) {
              self.setDefenseSkill(skill);
            }
          } else if (type === "belt") {
            player.setBelt([name, level, toString(bonus)].filter(Boolean).join(":"));
          } else if (type === "ring1") {
            player.setRing1([name, level, toString(bonus)].filter(Boolean).join(":"));
          } else if (type === "ring2") {
            player.setRing2([name, level, toString(bonus)].filter(Boolean).join(":"));
          } else if (type === "amulet") {
            player.setAmulet([name, level, toString(bonus)].filter(Boolean).join(":"));
          }

          // @NOTE only remove it for self
          if (player.id === self.player.id && !name) {
            $(`.item-equip-${type}`).empty();
          }
        }
      });

      self.client.onPlayerAuras(function (playerId, auras) {
        var player = self.getEntityById(playerId);
        if (player) {
          player.setAuras(auras);
        }
      });

      self.client.onPlayerSkill(function ({ id: playerId, skill: rawSkill }) {
        const player = self.getEntityById(playerId);
        const { skill, level, isAttackSkill, mobId } = rawSkill;

        if (player && (player.name === self.player.name || self.player.isNear(player, 16))) {
          if (isAttackSkill) {
            self.skillCastAnimation.reset();
            player.setCastSkill(skill);

            self.audioManager.playSound(`skill-${Types.skillToNameMap[skill]}`);

            const entity = self.getEntityById(mobId);
            if (entity) {
              self[`skill${_.capitalize(Types.skillToNameMap[skill])}Animation`].reset();
              entity.setSkillAnimation?.(skill);
            }
          } else {
            if (skill === 1) {
              player.clearCursed();
            }

            player.setDefenseSkillAnimation(
              Types.defenseSkillTypeAnimationMap[skill],
              Types.defenseSkillDurationMap[skill](level),
            );
          }
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

            // NOTE: If using teleport, have the pet to teleport as well
            const pet = entity.petId ? self.getEntityById(entity.petId) : null;
            if (pet) {
              self.makeCharacterTeleportTo(pet, x, y);
            }

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
        deductedGold,
      }: {
        entityId: number;
        name: string;
        message: string;
        type: ChatType;
        deductedGold: number;
      }) {
        $("#gold-death-wrapper").toggleClass("visible", !!deductedGold);
        $("#gold-death").text(deductedGold ? self.formatGold(deductedGold) : "");

        var entity = self.getEntityById(entityId);
        if (entity) {
          self.createBubble(entityId, message);
          self.assignBubbleTo(entity);
        }

        self.audioManager.playSound("chat");
        self.chat_callback({ entityId, name, message, type });
      });

      self.client.onPopulationChange(function (players, levelupPlayer) {
        self.worldPlayers = players;

        if (self.nbplayers_callback) {
          self.nbplayers_callback();
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
      self.client.onStoneTeleportCheck(function ({ x, y, confirmed, playerId }) {
        self.player.stop_pathing_callback({
          x,
          y,
          confirmed,
          isWaypoint: true,
          isTeleportSent: true,
          isStoneTeleport: true,
          playerId: playerId,
        });
      });
      self.client.onBossCheck(function (data) {
        const { status, message, hash, check } = data;

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
        } else if (status === "missing-account") {
          self.missingaccount_callback();
        } else if (status === "completed") {
          self.gamecompleted_callback({ hash, fightAgain: true, show: true });
        }
      });

      self.client.onDeathAngelCheck(function ({ x, y }) {
        self.player.stop_pathing_callback({ x, y, confirmed: true, isWaypoint: true, isTeleportSent: true });
      });

      self.client.onReceiveNotification(function (data: {
        message: string;
        hash?: string;
        achievement?: AchievementName;
      }) {
        const { message, hash, achievement } = data;

        if (hash) {
          self.gamecompleted_callback({ hash });
        }

        if (achievement) {
          self.tryUnlockingAchievement(achievement, false);
        }

        setTimeout(() => {
          self.showNotification(message);
        }, 250);
      });

      self.client.onReceiveInventory(function (data) {
        self.player.setInventory(data);
        self.updateInventory();

        self.initTeleportContextMenu();
      });

      self.client.onReceiveMerchantSell(function () {
        self.updateMerchant();
      });

      self.client.onReceiveMerchantLog(function ({ item: rawItem, quantity, amount, type }) {
        const verb = type === "buy" ? "bought" : "sold";

        if (type === "sell") {
          self.updateMerchant();
        }

        const delimiter = Types.isJewel(rawItem) ? "|" : ":";
        const [item] = rawItem.split(delimiter);

        let itemName = Types.getDisplayName(item);
        let message = itemName
          ? `You ${verb} ${quantity} ${itemName} for ${self.formatGold(amount)} gold`
          : `You ${verb} to merchant for ${self.formatGold(amount)} gold`;

        self.chat_callback({ message, type: "loot" });
      });

      self.client.onReceiveStash(function (data) {
        self.player.setStash(data);
        self.updateStash();
      });

      self.client.onReceiveUpgrade(function (
        data,
        meta: { luckySlot: number; isLucky7: boolean; isMagic8: boolean; isSuccess: boolean; recipe: Recipes },
      ) {
        const { luckySlot, isLucky7, isMagic8, isSuccess, recipe } = meta || {};

        self.isUpgradeItemSent = false;
        self.player.setUpgrade(data);

        if (data.length) self.updateUpgrade({ luckySlot, isSuccess });

        if (isLucky7) {
          self.tryUnlockingAchievement("LUCKY7");
        } else if (isMagic8) {
          // self.tryUnlockingAchievement("MAGIC8");
        } else if (recipe === "powderquantum") {
          self.tryUnlockingAchievement("ALCHEMIST");
        }
      });

      self.client.onReceiveAnvilUpgrade(function ({
        isSuccess,
        isTransmute,
        isRuneword,
        isChestblue,
        isChestgreen,
        isChestpurple,
        isChestdead,
        // @NOTE perhaps have a different animation for red chests (extra rare, next expansion?)
        // isChestred,
      }) {
        if (isSuccess) {
          self.setAnvilSuccess();
        } else if (isTransmute || isChestgreen) {
          self.setAnvilTransmute();
        } else if (isRuneword) {
          self.setAnvilRuneword();
        } else if (isChestblue) {
          self.setAnvilChestblue();
        } else if (isChestpurple) {
          self.setAnvilRecipe("chestpurple");
        } else if (isChestdead) {
          self.setAnvilRecipe("chestdead");
        } else {
          self.setAnvilFail();
        }
      });

      self.client.onReceiveAnvilOdds(function (message) {
        if (self.showAnvilOdds) {
          self.chat_callback({
            message,
            type: "info",
          });
        }
      });

      self.client.onReceiveAnvilRecipe(function (recipe: Recipes) {
        self.setAnvilRecipe(recipe);

        if (recipe === "cowLevel" || recipe === "minotaurLevel") {
          self.app.closeUpgrade();
        } else if (recipe === "powderquantum") {
          self.audioManager.playSound("powder");
        }
      });

      self.client.onReceiveStoreItems(function (items) {
        self.store.addStoreItems(items);
      });

      self.client.onReceivePurchaseCompleted(function (payment) {
        if (payment.id === Types.Store.EXPANSION1) {
          self.player.expansion1 = true;
        } else if (payment.id === Types.Store.EXPANSION2) {
          self.player.expansion2 = true;
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

      self.client.onReceiveLevelInProgress(function (levelClock, level: TimedLevel) {
        const selectedDate = new Date().valueOf() + levelClock * 1000;

        $("#countdown")
          .removeClass()
          .addClass(level)
          .countdown(selectedDate.toString())
          .on("update.countdown", function (event) {
            // @ts-ignore
            $(this).html(event.strftime("%M:%S"));
          })
          .on("finish.countdown", function () {
            $(this).html("Level closed.");

            setTimeout(() => {
              $(this).html("");
            }, 5000);
          });
      });

      self.client.onReceiveCowLevelEnd(function (isCompleted) {
        if (!$("#countdown").hasClass("cow")) return;

        $("#countdown").removeClass();
        $("#countdown").countdown(0);
        $("#countdown").countdown("remove");

        self.cowLevelPortalCoords = null;

        const teleportBackToTown = () => {
          if (self.player.gridY >= 464 && self.player.gridY <= 535) {
            const x = randomInt(40, 45);
            const y = randomInt(208, 213);

            self.player.stop_pathing_callback({ x, y, isWaypoint: true });

            if (isCompleted) {
              self.tryUnlockingAchievement("FARMER");
            }
          }
        };

        if (!self.isZoning()) {
          teleportBackToTown();
        } else {
          self.isTeleporting = true;

          // Prevent teleportation while player is zoning, see updateZoning() for timeout delay
          setTimeout(() => {
            teleportBackToTown();
            self.isTeleporting = false;
          }, 200);
        }
      });

      self.client.onReceiveMinotaurLevelStart(function () {
        self.minotaurPortalStart = true;
        setTimeout(() => {
          self.minotaurPortalStart = false;
        }, 1200);
      });

      self.client.onReceiveMinotaurLevelEnd(function () {
        if (!$("#countdown").hasClass("minotaur")) return;

        $("#countdown").countdown(0);
        $("#countdown").countdown("remove");

        if (self.player.gridY >= 464 && self.player.gridY <= 535) {
          const x = randomInt(40, 45);
          const y = randomInt(208, 213);

          self.player.stop_pathing_callback({ x, y, isWaypoint: true });
        }
      });

      self.client.onReceiveChaliceLevelStart(function () {
        // @NOTE TBD?
      });

      self.client.onReceiveChaliceLevelEnd(function (isCompleted) {
        if (!$("#countdown").hasClass("chalice")) return;

        $("#countdown").countdown(0);
        $("#countdown").countdown("remove");

        if (self.player.gridY >= 696 && self.player.gridY <= 733 && self.player.gridX <= 29) {
          const x = isCompleted ? randomInt(40, 46) : randomInt(7, 9);
          const y = isCompleted ? randomInt(581, 585) : randomInt(682, 684);

          self.player.stop_pathing_callback({ x, y, isWaypoint: true });
        }

        const entity = self.altarChaliceNpcId ? self.getEntityById(self.altarChaliceNpcId) : null;
        if (entity) {
          entity.isActivated = false;
          entity.idle();
        }
      });

      self.client.onReceiveTempleLevelStart(function () {
        // @NOTE TBD?
      });

      self.client.onReceiveTempleLevelEnd(function () {
        if (!$("#countdown").hasClass("temple")) return;

        $("#countdown").countdown(0);
        $("#countdown").countdown("remove");

        if (self.player.gridY >= 744 && self.player.gridX >= 84) {
          const x = randomInt(40, 46);
          const y = randomInt(581, 585);

          self.player.stop_pathing_callback({ x, y, isWaypoint: true });
        }

        // const entity = self.altarChaliceNpcId ? self.getEntityById(self.altarChaliceNpcId) : null;
        // if (entity) {
        //   entity.isActivated = false;
        //   entity.idle();
        // }
      });

      self.client.onReceiveStoneLevelStart(function () {
        self.stonePortalStart = true;
        setTimeout(() => {
          self.stonePortalStart = false;
        }, 1200);
      });

      self.client.onReceiveStoneLevelEnd(function () {
        if (!$("#countdown").hasClass("stone")) return;

        $("#countdown").countdown(0);
        $("#countdown").countdown("remove");

        if (
          self.player.gridY >= 696 &&
          self.player.gridY <= 733 &&
          self.player.gridX >= 85 &&
          self.player.gridX <= 112
        ) {
          const x = randomInt(66, 76);
          const y = randomInt(638, 645);

          self.player.stop_pathing_callback({ x, y, isWaypoint: true });
        }
      });

      self.client.onReceiveGatewayLevelStart(function () {
        self.gatewayPortalStart = true;
        setTimeout(() => {
          self.gatewayPortalStart = false;
        }, 1200);
      });

      self.client.onReceiveGatewayLevelEnd(function () {
        if (!$("#countdown").hasClass("gateway")) return;

        $("#countdown").countdown(0);
        $("#countdown").countdown("remove");

        if (self.player.gridY >= 744 && self.player.gridY <= 781 && self.player.gridX <= 29) {
          const x = randomInt(95, 100);
          const y = randomInt(543, 548);

          self.player.stop_pathing_callback({ x, y, isWaypoint: true });
        }
      });

      // self.client.onReceiveTreeLevelEnd(function () {
      //   const entity = self.treeNpcId ? self.getEntityById(self.treeNpcId) : null;
      //   if (entity) {
      //     entity.isActivated = false;
      //     entity.idle();
      //   }
      // });

      self.client.onFrozen(function (entityId, duration) {
        self.getEntityById(entityId)?.setFrozen(duration);
      });

      self.client.onSlowed(function (entityId, duration) {
        self.getEntityById(entityId)?.setSlowed(duration);
      });

      self.client.onPoisoned(function (entityId, duration) {
        self.getEntityById(entityId)?.setPoisoned(duration);
      });

      self.client.onCursed(function (entityId, curseId, duration) {
        if (entityId === self.player.id) {
          self.audioManager.playSound("curse");
        }

        self.getEntityById(entityId)?.setCursed(curseId, duration);
      });

      self.client.onTaunt(function (entityId) {
        const taunt = self.getEntityById(entityId)?.taunt;

        if (taunt) {
          self.audioManager.playSound(taunt);
        }
      });

      self.client.onReceiveGold(function (gold) {
        self.setGold(gold);
      });

      self.client.onReceiveGoldStash(function (gold) {
        self.setGoldStash(gold);
      });

      self.client.onReceiveGoldTrade(function (gold) {
        self.setGoldTrade(gold);
      });

      self.client.onReceiveGoldTrade2(function (gold) {
        self.setGoldTrade2(gold);
      });

      self.client.onReceiveGoldBank(function (gold) {
        const npc = self.getNpcAt(32, 208);
        self.makeNpcTalk(npc, { byPass: true, talkIndex: 0, gold });
      });

      self.client.onReceiveGoldBankWithdraw(function (gold) {
        const npc = self.getNpcAt(32, 208);
        npc.isTalkLocked = false;
        self.makeNpcTalk(npc, { byPass: true, talkIndex: gold ? 1 : 2, gold });
      });

      self.client.onReceiveCoin(function (coin) {
        self.setCoin(coin);
      });

      self.client.onDisconnected(function (message) {
        if (self.player) {
          self.player.die();
        }
        self.disconnect_callback?.(message);
      });

      self.gamestart_callback();

      if (self.hasNeverStarted) {
        self.start();
        started_callback({ success: true });
      }
    });
  }

  formatGold(gold) {
    return new Intl.NumberFormat("en-EN", {}).format(gold);
  }

  setGold(gold) {
    this.player.setGold(gold);

    $("#gold-inventory-amount").text(this.formatGold(gold));
  }

  setGoldStash(gold) {
    this.player.setGoldStash(gold);
    $("#gold-stash-amount").text(this.formatGold(gold));
  }

  setGoldTrade(gold) {
    this.player.setGoldTrade(gold);
    $("#gold-player1-amount").text(this.formatGold(gold));
  }

  setGoldTrade2(gold) {
    $("#gold-player2-amount").text(this.formatGold(gold));
  }

  setCoin(coin) {
    this.player.setCoin(coin);
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

    if (attacker.id !== this.playerId && !attacker.isDead) {
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

  makePlayerAttack(mob) {
    this.createAttackLink(this.player, mob);
    this.client.sendAttack(mob);
  }

  makePlayerHurtFromSpell(spell) {
    this.client.sendHurtSpell(spell);
  }

  resetAnvilAnimation() {
    this.anvilRecipe = null;
    this.isAnvilFail = false;
    this.isAnvilSuccess = false;
    this.isAnvilTransmute = false;
    this.isAnvilRuneword = false;
    this.isAnvilChestblue = false;
    this.isAnvilChestgreen = false;
    this.isAnvilChestpurple = false;
    this.isAnvilChestdead = false;
    this.isAnvilChestred = false;
    clearTimeout(this.anvilAnimationTimeout);
  }

  setAnvilSuccess() {
    this.resetAnvilAnimation();
    this.isAnvilSuccess = true;
    this.anvilAnimationTimeout = setTimeout(() => {
      this.isAnvilSuccess = false;
    }, 3000);
  }

  setAnvilFail() {
    this.resetAnvilAnimation();
    this.isAnvilFail = true;
    this.anvilAnimationTimeout = setTimeout(() => {
      this.isAnvilFail = false;
    }, 3000);
  }

  setAnvilRecipe(recipe: Recipes) {
    this.resetAnvilAnimation();
    this.anvilRecipe = recipe;
    this.anvilAnimationTimeout = setTimeout(() => {
      this.anvilRecipe = null;
    }, 3000);
  }

  setAnvilTransmute() {
    this.resetAnvilAnimation();
    this.isAnvilTransmute = true;
    this.anvilAnimationTimeout = setTimeout(() => {
      this.isAnvilTransmute = false;
    }, 3000);
  }

  setAnvilRuneword() {
    this.resetAnvilAnimation();
    this.isAnvilRuneword = true;
    this.anvilAnimationTimeout = setTimeout(() => {
      this.isAnvilRuneword = false;
    }, 3000);
  }

  setAnvilChestblue() {
    this.resetAnvilAnimation();
    this.isAnvilChestblue = true;
    this.anvilAnimationTimeout = setTimeout(() => {
      this.isAnvilChestblue = false;
    }, 3000);
  }

  /**
   *
   */
  makeNpcTalk(npc, { byPass, talkIndex, gold }: { byPass?: boolean; talkIndex?: number; gold?: number } = {}) {
    var msg;

    if (npc) {
      this.previousClickPosition = null;

      if (
        npc.kind === Types.Entities.TREE ||
        npc.kind === Types.Entities.STATUE ||
        npc.kind === Types.Entities.STATUE2 ||
        npc.kind === Types.Entities.TRAP ||
        npc.kind === Types.Entities.TRAP2 ||
        npc.kind === Types.Entities.TRAP3
      )
        return;

      if (
        ![
          // Types.Entities.ANVIL,
          // Types.Entities.STASH,
          // Types.Entities.WAYPOINTX,
          // Types.Entities.WAYPOINTN,
          // Types.Entities.WAYPOINTO,
          // Types.Entities.PORTALCOW,
          // Types.Entities.PORTALMINOTAUR,
          Types.Entities.MAGICSTONE,
          Types.Entities.BLUEFLAME,
          Types.Entities.ALTARCHALICE,
          Types.Entities.ALTARSOULSTONE,
          Types.Entities.LEVER,
          Types.Entities.LEVER2,
          Types.Entities.LEVER3,
          Types.Entities.STATUE,
          Types.Entities.STATUE2,
        ].includes(npc.kind)
      ) {
        if (npc.kind === Types.Entities.JANETYELLEN) {
          if (byPass) {
            msg = npc.talk(this, talkIndex).replace("{{gold}}", this.formatGold(gold));
          } else {
            const isIouExchange = this.player.inventory.some(
              ({ item }) => typeof item === "string" && item.startsWith("iou"),
            );
            if (!npc.isTalkLocked) {
              this.client.sendGoldBank(isIouExchange);
              if (isIouExchange) {
                npc.isTalkLocked = true;
              }
            }
            return;
          }
        } else {
          msg = npc.talk(this);
        }

        if (msg) {
          this.createBubble(npc.id, msg);
          this.assignBubbleTo(npc);
          this.audioManager.playSound("npc");
        } else {
          this.destroyBubble(npc.id);
          this.audioManager.playSound("npc-end");
        }
        this.tryUnlockingAchievement("SMALL_TALK");
      }

      if (npc.kind === Types.Entities.NYAN) {
        this.tryUnlockingAchievement("NYAN");
      } else if (npc.kind === Types.Entities.RICK) {
        this.tryUnlockingAchievement("RICKROLLD");
      } else if (npc.kind === Types.Entities.ANVIL) {
        this.app.openUpgrade();
      } else if (npc.kind === Types.Entities.MERCHANT) {
        this.app.openMerchant();
      } else if (npc.kind === Types.Entities.SORCERER) {
        this.store.openStore();
      } else if (npc.kind === Types.Entities.STASH) {
        this.app.openStash();
      } else if (
        npc.kind === Types.Entities.WAYPOINTX ||
        npc.kind === Types.Entities.WAYPOINTN ||
        npc.kind === Types.Entities.WAYPOINTO
      ) {
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
      } else if (npc.kind === Types.Entities.PORTALCOW) {
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
      } else if (npc.kind === Types.Entities.PORTALMINOTAUR) {
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
      } else if (npc.kind === Types.Entities.PORTALSTONE) {
        if (npc.gridX === 71 && npc.gridY === 643) {
          if (this.stoneLevelPortalCoords) {
            this.player.stop_pathing_callback({
              x: this.stoneLevelPortalCoords.x,
              y: this.stoneLevelPortalCoords.y,
              isWaypoint: true,
            });
          }
        } else {
          this.player.stop_pathing_callback({ x: 71, y: 643, isWaypoint: true });
        }
      } else if (npc.kind === Types.Entities.PORTALGATEWAY) {
        if (npc.gridX === 97 && npc.gridY === 545) {
          if (this.gatewayLevelPortalCoords) {
            this.tryUnlockingAchievement("STARGATE");

            this.player.stop_pathing_callback({
              x: this.gatewayLevelPortalCoords.x,
              y: this.gatewayLevelPortalCoords.y,
              isWaypoint: true,
            });
          }
        } else {
          this.player.stop_pathing_callback({ x: 97, y: 546, isWaypoint: true });
        }
      } else if (npc.kind === Types.Entities.DOORDEATHANGEL) {
        if (this.deathAngelLevelPortalCoords && npc.isActivated) {
          this.player.stop_pathing_callback({
            x: this.deathAngelLevelPortalCoords.x,
            y: this.deathAngelLevelPortalCoords.y,
            isWaypoint: true,
          });
        }
      } else if (npc.kind === Types.Entities.MAGICSTONE) {
        if (!npc.isActivated) {
          this.client.sendMagicStone(npc.id);
        }

        this.storage.activateMagicStone(npc.gridX);
        if (this.storage.hasAllMagicStones()) {
          this.tryUnlockingAchievement("STONEHENGE");
        }
      } else if (
        npc.kind === Types.Entities.LEVER ||
        npc.kind === Types.Entities.LEVER2 ||
        npc.kind === Types.Entities.LEVER3
      ) {
        if (!npc.isActivated) {
          this.client.sendLever(npc.id);
        }
      } else if (npc.kind === Types.Entities.ALTARCHALICE) {
        if (!npc.isActivated) {
          this.client.sendAltarChalice(npc.id);
        }
      } else if (npc.kind === Types.Entities.ALTARSOULSTONE) {
        if (!npc.isActivated) {
          if (this.player.inventory.some(({ item }) => typeof item === "string" && item.startsWith("soulstone"))) {
            if (this.player.inventory.length >= 24) {
              this.showNotification("Your inventory is full.");
              this.audioManager.playSound("noloot");
            } else {
              this.client.sendAltarSoulStone(npc.id);
            }
          }
        }
      } else if (npc.kind === Types.Entities.FOSSIL) {
        if (!npc.isActivated && this.player.weaponName === "pickaxe") {
          this.client.sendFossil(npc.id);
        }
      } else if (npc.kind === Types.Entities.OBELISK) {
        this.tryUnlockingAchievement("OBELISK");
      } else if (npc.kind === Types.Entities.HANDS) {
        if (!npc.isActivated) {
          this.client.sendHands(npc.id);
        }
      } else if (npc.kind === Types.Entities.SECRETSTAIRS) {
        if (npc.gridX === 8 && npc.gridY === 683) {
          // Chalice
          this.player.stop_pathing_callback({ x: 7, y: 727, isWaypoint: true });
          this.tryUnlockingAchievement("TOMB");
        } else if (npc.gridX === 19 && npc.gridY === 642) {
          // Tree
          this.player.stop_pathing_callback({ x: 43, y: 728, isWaypoint: true });
        } else if (npc.gridX === 159 && npc.gridY === 597) {
          // Fossil
          this.player.stop_pathing_callback({ x: 136, y: 750, isWaypoint: true });
        }
      } else if (npc.kind === Types.Entities.SECRETSTAIRS2) {
        if (npc.gridX === 149 && npc.gridY === 548) {
          // Left Templar
          this.player.stop_pathing_callback({ x: 127, y: 731, orientation: Types.Orientations.UP, isWaypoint: true });
        } else if (npc.gridX === 162 && npc.gridY === 548) {
          // Right Templar
          this.player.stop_pathing_callback({ x: 155, y: 731, orientation: Types.Orientations.UP, isWaypoint: true });
        }
      } else if (npc.kind === Types.Entities.SECRETSTAIRSUP) {
        if (npc.gridX === 5 && npc.gridY === 728) {
          // Chalice
          this.player.stop_pathing_callback({ x: 7, y: 683, isWaypoint: true });
        } else if (npc.gridX === 41 && npc.gridY === 729) {
          // Tree
          this.player.stop_pathing_callback({ x: 18, y: 642, isWaypoint: true });
        } else if (npc.gridX === 159 && npc.gridY === 778) {
          // Temple

          this.player.stop_pathing_callback({ x: 43, y: 582, isWaypoint: true });
        } else if (npc.gridX === 116 && npc.gridY === 751) {
          // Passage Left
          this.player.stop_pathing_callback({ x: 43, y: 545, isWaypoint: true });
        } else if (npc.gridX === 137 && npc.gridY === 751) {
          // Passage Right
          this.player.stop_pathing_callback({ x: 160, y: 597, isWaypoint: true });
        }
      } else if (npc.kind === Types.Entities.GRIMOIRE) {
        this.tryUnlockingAchievement("GRIMOIRE");
        npc.walk();
      } else if (npc.kind === Types.Entities.ALKOR) {
        const isFound = this.player.inventory.some(({ item }) => item === "nft");

        if (isFound && !this.storage.getAchievements()[ACHIEVEMENT_NFT_INDEX]) {
          this.tryUnlockingAchievement("NFT");
        }
      } else if (npc.kind === Types.Entities.OLAF) {
        const isFound = this.player.inventory.some(({ item }) => item === "wing");

        if (isFound && !this.storage.getAchievements()[ACHIEVEMENT_WING_INDEX]) {
          this.tryUnlockingAchievement("WING");
        }
      } else if (npc.kind === Types.Entities.VICTOR) {
        const isFound = this.player.inventory.some(({ item }) => item === "crystal");

        if (isFound && !this.storage.getAchievements()[ACHIEVEMENT_CRYSTAL_INDEX]) {
          this.tryUnlockingAchievement("CRYSTAL");
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

  getForEachVisibleEntityByDepth() {
    var self = this;
    var m = this.map;

    const entities = [];

    this.camera.forEachVisiblePosition(
      function (x, y) {
        if (!m.isOutOfBounds(x, y)) {
          if (self.renderingGrid[y][x]) {
            _.each(self.renderingGrid[y][x], function (entity) {
              if (
                entity.kind === Types.Entities.TRAP ||
                entity.kind === Types.Entities.TRAP2 ||
                entity.kind === Types.Entities.TRAP3 ||
                entity.kind === Types.Entities.FOSSIL
              ) {
                entities.unshift(entity);
              } else {
                entities.push(entity);
              }
            });
          }
        }
      },
      this.renderer.mobile ? 0 : 2,
    );

    return entities;
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

  forEachAnimatedTile(callback) {
    if (this.animatedTiles) {
      _.each(this.animatedTiles, function (tile) {
        callback(tile);
      });
    }
  }

  forEachHighAnimatedTile(callback) {
    if (this.highAnimatedTiles) {
      _.each(this.highAnimatedTiles, function (tile) {
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

    let entities = this.entityGrid[y][x];
    let entity = null;
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

  getAllEntitiesAt(x, y, instance = null) {
    if (this.map.isOutOfBounds(x, y) || !this.entityGrid) {
      return null;
    }

    let entities = this.entityGrid[y][x];
    if (_.size(entities) > 0) {
      entities = Object.values(entities);
      if (instance) {
        entities = entities.filter(entity => entity instanceof instance);
      }
    } else {
      entities = [];
    }

    return entities;
  }

  getPlayerAt(x, y) {
    var entity = this.getEntityAt(x, y, Player);
    if (entity && entity instanceof Player) {
      return entity;
    }
    return null;
  }

  getPetAt(x, y) {
    var entity = this.getEntityAt(x, y, Pet);
    if (entity && entity instanceof Pet) {
      return entity;
    }
    return null;
  }

  getMobAt(x, y) {
    var entity = this.getEntityAt(x, y, Mob);
    if (entity && entity instanceof Mob) {
      return entity;
    }
    return null;
  }

  getNpcAt(x, y) {
    var entity = this.getEntityAt(x, y, Npc);
    if (
      entity &&
      entity instanceof Npc &&
      entity.kind !== Types.Entities.TREE &&
      entity.kind !== Types.Entities.TRAP &&
      entity.kind !== Types.Entities.TRAP2 &&
      entity.kind !== Types.Entities.TRAP3
    ) {
      return entity;
    }
    return null;
  }

  getSpellAt(x, y) {
    var entity = this.getEntityAt(x, y, Spell);
    if (entity && entity instanceof Spell) {
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
    var items = this.itemGrid[y][x];
    var item = null;

    if (_.size(items) > 0) {
      // If there are potions/burgers stacked with equipment items on the same tile, always get expendable items first.
      _.each(items, i => {
        if (Types.isExpendableItem(i.kind)) {
          if (this.renderingGrid[y][x][i.id]) {
            item = i;
          } else {
            // Remove item from unreceived de-spawn message
            this.removeItem(i);
          }
        }
      });

      // Else, get the first item of the stack
      if (!item) {
        _.keys(items).forEach(entityId => {
          if (this.renderingGrid[y][x][entityId]) {
            item = items[entityId];
          } else {
            // Remove item from unreceived de-spawn message
            this.removeItem(items[entityId]);
          }
        });
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

  isPetAt(x, y) {
    return !_.isNull(this.getPetAt(x, y));
  }

  isItemAt(x, y) {
    return !_.isNull(this.getItemAt(x, y));
  }

  isNpcAt(x, y) {
    return !_.isNull(this.getNpcAt(x, y));
  }

  isSpellAt(x, y) {
    return !_.isNull(this.getSpellAt(x, y));
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
    this.debugPathing = !this.debugPathing;
  }

  /**
   *
   */
  movecursor() {
    var mouse = this.getMouseGridPosition(),
      x = mouse.x,
      y = mouse.y;

    this.cursorVisible = true;
    this.hoveringPlayerPvP = false;

    if (this.player && !this.renderer.mobile && !this.renderer.tablet) {
      // if (this.isSpellAt(x, y)) {
      //   return;
      // }

      this.hoveringCollidingTile = this.map.isColliding(x, y);
      this.hoveringPlateauTile = this.player.isOnPlateau ? !this.map.isPlateau(x, y) : this.map.isPlateau(x, y);
      this.hoveringMob = this.isMobAt(x, y);
      this.hoveringPlayer = this.isPlayerAt(x, y);
      this.hoveringPet = this.isPetAt(x, y);
      this.hoveringItem = this.isItemAt(x, y);
      this.hoveringNpc = this.isNpcAt(x, y);
      this.hoveringOtherPlayer = this.isPlayerAt(x, y);
      this.hoveringChest = this.isChestAt(x, y);

      if (
        this.hoveringMob ||
        this.hoveringPlayer ||
        this.hoveringPet ||
        this.hoveringNpc ||
        this.hoveringChest ||
        this.hoveringOtherPlayer ||
        this.player.target
      ) {
        var entity =
          this.hoveringMob ||
          this.hoveringPlayer ||
          this.hoveringPet ||
          this.hoveringNpc ||
          this.hoveringChest ||
          this.hoveringOtherPlayer
            ? this.getEntityAt(x, y)
            : this.player.target;

        if (this.hoveringPlayer && entity.id !== this.player.id && this.pvp) {
          this.hoveringPlayerPvP = entity.pvp;
        }

        this.player.showTarget(entity);
        // supportsSilhouettes hides the players (render bug I'd guess)
        if (!entity.isHighlighted && this.renderer.supportsSilhouettes && !this.hoveringPlayer) {
          if (this.lastHovered) {
            this.lastHovered.setHighlight(false);
          }
          entity.setHighlight(true);
        }
        this.lastHovered = entity;
      } else if (this.player.inspecting || this.lastHovered) {
        this.lastHovered?.setHighlight(null);

        this.onRemoveTarget();
        this.lastHovered = null;
      }
    }
  }

  onRemoveTarget = () => {
    $("#inspector").fadeOut("fast");
    $("#inspector .level").text("");
    $("#inspector .health").text("");
    if (this.player) {
      this.player.inspecting = null;
    }
  };

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
      this.client.connection.connected &&
      this.player &&
      !this.isTeleporting &&
      !this.isZoning() &&
      !this.isZoningTile(this.player.nextGridX, this.player.nextGridY) &&
      !this.player.isDead &&
      !this.hoveringCollidingTile &&
      !this.hoveringPlateauTile &&
      this.map.grid
    ) {
      entity = this.getMobAt(pos.x, pos.y) || this.getNpcAt(pos.x, pos.y) || this.getEntityAt(pos.x, pos.y);

      // @NOTE: For an unknown reason when a mob dies and is moving, it doesn't unregister its "1" on
      // the pathing grid so it's not possible to navigate to the coords anymore. Ths fix is to manually reset
      // to "0" the pathing map if there is no entity registered on the coords.
      if (
        (entity === null || entity instanceof Item) &&
        pos.x >= 0 &&
        pos.y >= 0 &&
        this.map.grid[pos.y][pos.x] !== 1
      ) {
        this.removeFromPathingGrid(pos.x, pos.y);
      }
      if (entity instanceof Mob || (this.pvp && entity instanceof Player && entity.pvp)) {
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

        if (this.isPanelOpened) {
          this.app.hideWindows();
        }
      }
    }
  }

  getNearestEntity() {
    const { gridX, gridY } = this.player;
    const maxDistance = 16;
    let nearestEntityDistance: number = maxDistance;
    let nearestEntity = null;

    for (let k in this.entities) {
      if (this.entities[k] instanceof Mob || (this.pvp && this.entities[k] instanceof Player && this.entities[k].pvp)) {
        const { gridX: mobGridX, gridY: mobGridY } = this.entities[k];
        const distance = Math.abs(gridX - mobGridX) + Math.abs(gridY - mobGridY);

        if (distance >= maxDistance || distance >= nearestEntityDistance) continue;

        nearestEntityDistance = distance;

        nearestEntity = this.entities[k];
      }
    }
    if (nearestEntity) {
      return nearestEntity;
    }
  }

  processPetInput() {
    if (this.player.petId) {
      const pet = this.getEntityById(this.player.petId);

      if (pet) {
        if (Array.isArray(this.player.path) && this.player.path.length) {
          const petDestination = this.player.path[this.player.path.length - 2];

          if (!Array.isArray(petDestination) || petDestination.length !== 2) return;
          if (pet.gridX !== petDestination[0] || pet.gridY !== petDestination[1]) {
            pet.spawnCharacterCoords = null;
            pet.go(...petDestination);
            this.client.sendMovePet(...petDestination);
          }
        }
      }
    }
  }

  getTrap(x, y) {
    if (!this.traps.length) return;
    // 1 right, 1 top
    return this.traps.find(trap => (trap.x - x === 0 || trap.x - x === -1) && (trap.y - y === 0 || trap.y - y === 1));
  }

  getStatues(x, y) {
    if (!this.statues.length) return;

    // 8 left, 8 right, 16 bottom
    return this.statues.filter(statue => Math.abs(statue.x - x) <= 8 && y - statue.y >= 0 && y - statue.y <= 16);
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
      if (
        character.kind === Types.Entities.NECROMANCER ||
        character.kind === Types.Entities.DEATHANGEL ||
        character.kind === Types.Entities.DEATHBRINGER ||
        character.kind === Types.Entities.MAGE ||
        character.kind === Types.Entities.SKELETONARCHER ||
        character.kind === Types.Entities.SHAMAN
      ) {
        if (character.isRaising()) {
          if (character.canRaise(time)) {
            character.stop();
            character.nextStep();

            let isRaise2 = false;
            if (character.kind === Types.Entities.SHAMAN && randomInt(1, 3) === 3) {
              character.raise2();
              isRaise2 = true;
            } else {
              character.raise();
            }

            if (
              [Types.Entities.MAGE, Types.Entities.SKELETONARCHER, Types.Entities.SHAMAN].includes(character.kind) &&
              character &&
              character.target &&
              this.player &&
              character.target.id === this.player.id
            ) {
              this.client.sendCastSpell(character.id, character.gridX, character.gridY, character.target.id, isRaise2);
            }
          }
          return;
        }
      }

      // Don't let multiple mobs stack on the same tile when attacking a player.
      var isMoving = this.tryMovingToADifferentTile(character);

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
            !this.player.invincible &&
            character.type !== "player"
          ) {
            setTimeout(() => {
              this.client.sendHurt(character);
            }, character.hurtDelay);
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
    // @NOTE: Prevent re-adding same x,y when player is chasing a mob multi-zone
    if (!this.zoningQueue.some(({ x: queueX, y: queueY }) => x === queueX && y === queueY)) {
      this.zoningQueue.push({ x: x, y: y });
    }

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
    const tradeRegexp = /^\/trade (.+)?/;

    if (message.startsWith("/party")) {
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
              this.client.sendPartyInvite(String(param));
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
    } else if (message.startsWith("/ban") && this.admins.includes(this.player.name)) {
      this.app.initBanDialog();
    } else if (message.startsWith("/trade")) {
      const args = message.match(tradeRegexp);
      const playerName = (args?.[1] || "").trim();
      let isPlayerFound = false;

      if (!playerName || playerName === this.player.name) {
        this.chat_callback({
          message: `Type a player name to trade with.`,
          type: "error",
        });
        return;
      }

      if (!this.storage.getAchievements()[ACHIEVEMENT_HERO_INDEX]) {
        this.chat_callback({
          message: `You must kill the Skeleton King before you can trade.`,
          type: "error",
        });
        return;
      }

      if (this.player.gridY < 195 || this.player.gridY > 250 || this.player.gridX > 90) {
        this.chat_callback({
          message: `You can only trade in town.`,
          type: "error",
        });
        return;
      }

      for (const i in this.entities) {
        if (this.entities[i].kind !== Types.Entities.WARRIOR) {
          continue;
        }

        if (this.entities[i].name === playerName) {
          isPlayerFound = true;
          if (
            Math.abs(this.entities[i].gridX - this.player.gridX) > 3 ||
            Math.abs(this.entities[i].gridY - this.player.gridY) > 3
          ) {
            this.chat_callback({
              message: `You can only trade with ${playerName} if the player is 3 or less tiles away.`,
              type: "error",
            });
          } else {
            this.client.sendTradeRequest(playerName);
          }

          break;
        }
      }

      if (playerName && !isPlayerFound) {
        this.chat_callback({
          message: `${playerName} is not online.`,
          type: "error",
        });
      }

      return;
    } else if (message.startsWith("/town")) {
      // Prevent sending the message to teleport back to town
      if (Object.keys(this.player.attackers).length || (this.player.gridY >= 195 && this.player.gridY <= 259)) {
        return;
      }

      const x = randomInt(33, 39);
      const y = randomInt(208, 211);

      this.player.stop_pathing_callback({ x, y, isWaypoint: true });
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
      var s = this.renderer.scale;
      var t = 16 * s;

      var x = (character.x - this.camera.x) * s;
      var w = parseInt(bubble.element.css("width")) + 24;
      var offsetX = w / 2 - t / 2;
      var offsetY;
      var y;

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

      if (character.kind === Types.Entities.GRIMOIRE) {
        offsetX -= 8 * s;
        offsetY += 22 * s;
      }

      y = (character.y - this.camera.y) * s - t * 2 - offsetY;

      bubble.element.css("left", x - offsetX + "px");
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
    this.client.sendLogin({ name: this.username, account: this.account, password: this.password });

    this.storage.incrementRevives();

    if (this.renderer.mobile || this.renderer.tablet) {
      this.renderer.clearScreen(this.renderer.context);
    }

    console.debug("Finished respawn");

    $("#parchment").removeClass("death");
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

  onMissingAccount(callback) {
    this.missingaccount_callback = callback;
  }

  onAccount(callback) {
    this.account_callback = callback;
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

  onPlayerStartInvincible(callback) {
    this.invinciblestart_callback = callback;
  }

  onPlayerStopInvincible(callback) {
    this.invinciblestop_callback = callback;
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

  updateExpBar() {
    if (this.player && this.playerexp_callback) {
      var expInThisLevel = this.player.experience - Types.expForLevel[this.player.level - 1];
      var expForLevelUp = Types.expForLevel[this.player.level] - Types.expForLevel[this.player.level - 1];
      this.playerexp_callback(expInThisLevel, expForLevelUp);

      $("#player-level").text(this.player.level);
    }
  }

  updateTarget(targetId, dmg, hitPoints, maxHitPoints) {
    if ((this.player.hasTarget() || this.player.skillTargetId === targetId) && this.updatetarget_callback) {
      const target = this.getEntityById(targetId);

      if (!target) return;

      target.points = dmg;
      target.hitPoints = hitPoints;
      target.maxHitPoints = maxHitPoints;
      this.updatetarget_callback(target);
    }
  }

  updateHoveredTarget(target) {
    this.updatetarget_callback(target);
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

  tryUnlockingAchievement(name: AchievementName, send = true) {
    var achievement = null;
    var self = this;

    return new Promise<void>(resolve => {
      if (name in this.achievements) {
        achievement = this.achievements[name];

        if (achievement.isCompleted() && self.storage.unlockAchievement(achievement.id)) {
          if (self.unlock_callback) {
            if (send) {
              self.client.sendAchievement(achievement.id);
            }
            self.unlock_callback(achievement.id, achievement.name, achievement[self.network || "nano"]);
            self.audioManager.playSound("achievement");
            resolve();
          }
        }
      }
    });
  }

  showNotification(message, timeout = 3500) {
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
      this.player.loot(item, this.storage.getAchievements());
      this.client.sendLoot(item); // Notify the server that this item has been looted
      this.removeItem(item);

      if (!this.player.partyId) {
        const params: { amount?: number } = {};
        if (item.kind === Types.Entities.GOLD) {
          if (this.player?.bonus?.extraGold) {
            params.amount = Math.floor((this.player.bonus.extraGold / 100) * item.amount + item.amount);
          }
        }

        if (item.kind !== Types.Entities.SOULSTONE) {
          this.showNotification(item.getLootMessage(params));
        }
      }

      if (item.type === "armor") {
        this.tryUnlockingAchievement("FAT_LOOT");
      } else if (item.type === "weapon") {
        this.tryUnlockingAchievement("A_TRUE_WARRIOR");
      } else if (item.kind === Types.Entities.CAKE) {
        this.tryUnlockingAchievement("FOR_SCIENCE");
      } else if (item.kind === Types.Entities.FIREFOXPOTION) {
        this.tryUnlockingAchievement("FOXY");
        this.audioManager.playSound("firefox");
      } else if (item.kind === Types.Entities.NANOPOTION || item.kind === Types.Entities.BANANOPOTION) {
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
      } else if (item.kind === Types.Entities.STONEHERO) {
        this.tryUnlockingAchievement("EMBLEM");
      } else if (item.kind === Types.Entities.SOULSTONE) {
        this.tryUnlockingAchievement("SOULSTONE");
      } else if (item.kind === Types.Entities.CHALICE) {
        this.tryUnlockingAchievement("CRUISADE");
      } else if (Types.isRune(item.kind)) {
        const rune = Types.getRuneFromItem(item.itemKind);
        if (rune.rank >= 25) {
          this.tryUnlockingAchievement("RUNOLOGUE");
        }
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
