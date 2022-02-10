export interface Game {
  renderer: { mobile: any; tablet: any };
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
  chat_callback: (arg0: null, arg1: null, arg2: string, arg3: string) => void;
  player: {
    name: any;
    moveLeft: boolean;
    disableKeyboardNpcTalk: boolean;
    moveRight: boolean;
    moveUp: boolean;
    moveDown: boolean;
    gridX: any;
    gridY: any;
    attackers: any;
    hitPoints: number;
    maxHitPoints: number;
    inventory: { [x: string]: any };
    inventoryCount: { [x: string]: number };
  };
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
  onPlayerInvincible: (arg0: () => void) => void;
  onChatMessage: (arg0: (entityId: any, name: any, message: any, type: any) => void) => void;
  storage: { data: { player: { name: any } } };
  onNbPlayersChange: (arg0: (worldPlayers: any, totalPlayers: any, players: any) => void) => void;
  onGuildPopulationChange: (arg0: (guildName: any, guildPopulation: any) => void) => void;
  onAchievementUnlock: (arg0: (id: any, name: any, nano: any) => void) => void;
  onNotification: (arg0: any) => void;
  click: () => void;
  pvpFlag: boolean;
  started: any;
  audioManager: { playSound: (arg0: string) => void };
  respawn: () => void;
  movecursor: () => void;
  makePlayerAttackNext: () => void;
  say: (arg0: any) => void;
  hpGuide: number;
  healShortCut: number;
  eat: (arg0: any) => void;
}
