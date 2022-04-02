import type { ChatType } from "../../../server/js/types";
import type Player from "../player";
import type Renderer from "../renderer";

export interface Game {
  forEachEntity(arg0: (entity: any) => void);
  onCharacterUpdate(entity: any);
  currentTime: any;
  currentZoning: any;
  camera: any;
  zoningOrientation: any;
  initAnimatedTiles();
  endZoning();
  keys(pos: { x: any; y: any }, UP: any);
  sparksAnimation: any;
  targetAnimation: any;
  levelupAnimation: any;
  drainLifeAnimation: any;
  thunderstormAnimation: any;
  highHealthAnimation: any;
  freezeAnimation: any;
  anvilRecipeAnimation: any;
  anvilSuccessAnimation: any;
  anvilFailAnimation: any;
  forEachAnimatedTile(arg0: (tile: any) => void);
  checkOtherDirtyRects(dirtyRect: any, tile: any, x: any, y: any);
  bubbleManager: any;
  infoManager: any;
  renderer: Renderer;
  setup: (
    arg0: string,
    arg1: HTMLElement | null,
    arg2: HTMLElement | null,
    arg3: HTMLElement | null,
    arg4: HTMLElement | null,
  ) => void;
  setStorage: (arg0: { clear: () => void; data: any }) => void;
  setStore: (arg0: any) => void;
  loadMap: () => void;
  onGameStart: (arg0: () => void) => void;
  chat_callback: (arg0: { entityId?: number; name?: string; message: string; type?: ChatType }) => void;
  player: Player;
  onDisconnect: (arg0: (message: any) => void) => void;
  onPlayerDeath: (arg0: () => void) => void;
  onGameCompleted: (
    arg0: ({
      hash,
      hash1,
      fightAgain,
      show,
    }: {
      hash: any;
      hash1: any;
      fightAgain: any;
      show?: boolean | undefined;
    }) => void,
  ) => void;
  client: { sendBossCheck: (arg0: boolean) => void };
  onBossCheckFailed: (arg0: (message: any) => void) => void;
  onPlayerEquipmentChange: (arg0: () => void) => void;
  deleteItemFromSlot: () => void;
  onPlayerInvincible: (arg0: () => void) => void;
  onChatMessage: (arg0: (entityId: any, name: any, message: any, type: any) => void) => void;
  storage: { data: { player: { name: any } } };
  onNbPlayersChange: (arg0: (worldPlayers: any, totalPlayers: any, players: any) => void) => void;
  onAchievementUnlock: (arg0: (id: any, name: any, nano: any) => void) => void;
  onNotification: (arg0: any) => void;
  click: () => void;
  pvpFlag: boolean;
  started: boolean;
  audioManager: { playSound: (arg0: string) => void };
  respawn: () => void;
  movecursor: () => void;
  makePlayerAttackNext: () => void;
  say: (arg0: any) => void;
  hpGuide: number;
  healShortCut: number;
  eat: (arg0: any) => void;
}
