export interface App {
  config: { dev: { host: string; port: number; dispatcher: boolean }; build: any; local: any };
  initAchievementList(achievements: any);
  initUnlockedAchievements(unlockedAchievementIds: any, totalNano: any);
  closeWaypoint();
  updateNanoPotions(nanoPotions: any);
  updateGems(gems: any);
  updateArtifact(artifact: any);
  closeUpgrade();
  openUpgrade();
  openStash();
  openWaypoint(activeWaypoint: any);
  center: () => void;
  toggleScrollContent: (arg0: string) => void;
  showChat: () => void;
  hideChat: () => void;
  hideWindows: () => void;
  toggleAchievements: () => void;
  blinkInterval: NodeJS.Timeout;
  toggleCompleted: () => void;
  toggleAbout: () => void;
  toggleSettings: () => void;
  togglePopulationInfo: () => void;
  togglePlayerInfo: () => void;
  toggleInventory: () => void;
  animateParchment: (arg0: string, arg1: string) => void;
  storage: { clear: () => void; data: any };
  clearValidationErrors: () => void;
  toggleButton: () => void;
  currentPage: number;
  resetMessagesPosition: { bind: (arg0: any) => any };
  openPopup: (arg0: string, arg1: any) => void;
  tryStartingGame: () => void;
  resizeUi: { bind: (arg0: any) => any };
  store: any;
  setGame: (arg0: any) => void;
  isDesktop: any;
  supportsWorkers: any;
  initEquipmentIcons: () => void;
  unlockAchievement: (arg0: any, arg1: any, arg2: any) => void;
  showMessage: any;
  initHealthBar: () => void;
  initTargetHud: () => void;
  initExpBar: () => void;
  initPlayerInfo: () => void;
  setMouseCoordinates: (arg0: any) => void;
  closeInGameScroll: (arg0: string) => void;
  toggleMute: () => void;
  toggleEntityName: () => void;
  toggleDamageInfo: () => void;
  loginFormActive: () => any;
  createNewCharacterFormActive: () => any;
  updatePartyMembers: (members: any[]) => any;
  updatePartyHealthBar: (members: any[]) => any;
  removePartyHealthBar: () => any;
}
