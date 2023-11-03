import { Types } from "../../shared/js/gametypes";
import {
  ACHIEVEMENT_CRYSTAL_INDEX,
  ACHIEVEMENT_NFT_INDEX,
  ACHIEVEMENT_WING_INDEX,
} from "../../shared/js/types/achievements";
import Character from "./character";

import type Game from "./game";

var NpcTalk = {
  guard: [
    "You can upgrade your items at the Anvil in town.",
    "Use the same scroll class as the item class you are upgrading.",
    "Careful, upgrading items gets more difficult as it's getting more powerful.",
    "Good luck.",
  ],

  king: [
    "Hi, I'm the King",
    "I run this place",
    "Like a boss",
    "I talk to people",
    "Like a boss",
    "I wear a crown",
    "Like a boss",
    "I do nothing all day",
    "Like a boss",
    "Now leave me alone",
    "Like a boss",
  ],

  villagegirl: [
    "Hi there, adventurer!",
    "How do you like this game?",
    "Make sure to share it with your friends and play it as many time as you like.",
    "Hop over the NanoBrowserQuest discord and get engaged with the community!",
  ],

  villager: [
    "Howdy stranger. Do you like poetry?",
    "In the digital realm, a hero strides, Running Coder by name",
    "A tightrope walk of deadlines, where time's an unyielding flame",
    "In pixels and algorithms, he fights the bugs' cruel reign",
    "Defying odds and exploits, never succumbing to pain.",

    "With a keyboard as his weapon and code as his might",
    "He battles on, day and night, in the relentless fight",
    "Not just glitches and errors, but physical woes too",
    "Yet he presses on, resolute, with a spirit so true",

    "For in the heart of this coder, determination finds its space",
    "Defeating all obstacles, leaving a trail of grace",
    "Salute to this legend, his strength and sheer might",
  ],

  carlosmatos: [
    "Hey hey hey!",
    "Wassa-wassa-wassa-wassup!",
    "My wife still doesn't even believe in me",
    "Let me tell you, I love, BITCONNEEeeeEECT!",
  ],

  janetyellen: [
    "The bank is now hodling <strong>{{gold}}</string> gold!",
    "The bank has exchanged your IOU for <strong>{{gold}}</string> gold!",
    "The bank doesn't have anymore gold,<br/>don't worry we'll simply print more shortly.",
  ],
  merchant: ["Hi there, adventurer! Looking for a trade?"],

  satoshi: [
    "This is not what I have envisionned for Bitcoin when I created it",
    "It was supposed to be the solution of a broken banking system",
    "But is is now an environmental disaster",
    "If only there was an environmental friendly, peer to peer, feeless and instant crypto ...",
    "Do I know Colin? Of course! He's my nephew.",
  ],

  agent: [
    "Do not try to bend the sword",
    "That's impossible",
    "Instead, only try to realize the truth...",
    "There is no sword.",
  ],

  rick: [
    "We're no strangers to love",
    "You know the rules and so do I",
    "A full commitment's what I'm thinking of",
    "You wouldn't get this from any other guy",
    "I just wanna tell you how I'm feeling",
    "Gotta make you understand",
    "Never gonna give you up",
    "Never gonna let you down",
    "Never gonna run around and desert you",
    "Never gonna make you cry",
    "Never gonna say goodbye",
    "Never gonna tell a lie and hurt you",
  ],

  scientist: [
    {
      text: [
        //default
        "Greetings.",
        "I am the inventor of these two potions.",
        "The red one will replenish your health points...",
        "The green one will turn you into a firefox and make you invincible...",
        "But it only lasts for a short while.",
        "So make good use of it!",
        "Now if you'll excuse me, I need to get back to my experiments...",
      ],
    },
    {
      condition(game: any) {
        return game.player.invincible;
      },
      text: [
        "Did you not listen to what I said?!!",
        "the famous fire-potion only lasts a few seconds",
        "You shouldn't be wasting them talking to me…",
      ],
    },
    {
      condition(game: any) {
        return game.player.getSpriteName() == "firefox" && !game.player.invincible;
      },
      text: [
        "Ha ha ha, *name*",
        "All that glitters is not gold…",
        "-sigh-",
        "Did you really think you could abuse me with your disguise?",
        "I conceived that f…, that potion.",
        "Better not use your outfit as a deterrent,",
        "The goons you'll meet will attack you whatever you look like.",
      ],
    },
  ],

  nyan: [
    "nyan nyan nyan nyan nyan",
    "nyan nyan nyan nyan nyan nyan nyan",
    "nyan nyan nyan nyan nyan nyan",
    "nyan nyan nyan nyan nyan nyan nyan nyan",
  ],

  forestnpc: ["lorem ipsum dolor sit amet", "consectetur adipisicing elit, sed do eiusmod tempor"],

  lavanpc: ["I took an arrow to the knee", "I can't feel my leg anymore", "Help me"],

  priest: [
    "Oh, hello, young man.",
    "Wisdom is everything, so I'll share a few guidelines with you.",
    "You are free to go wherever you like in this world",
    "but beware of the many foes that await you.",
    "You can find many weapons and armors by killing enemies.",
    "The tougher the enemy, the higher the potential rewards.",
    "You can also unlock achievements by exploring and hunting.",
    "Click on the small cup icon to see a list of all the achievements.",
    "Please stay a while and enjoy the many surprises of Nano BrowserQuest",
    "Farewell, young friend.",
  ],

  sorcerer: [
    "Have you heard of the Necromancer?",
    "He was banned from the Guardian order because he practiced forbidden magic.",
    "Only the bravest of warriors would dare to confront him.",
  ],

  octocat: [
    "Welcome to Nano BrowserQuest!",
    "Want to report an issue? Log into Discord and report it in the #bug channel",
    'Want to see the source code? Check out <a target="_blank" href="https://github.com/browserquest/BrowserQuest">BrowserQuest repository on GitHub</a>',
  ],

  anvil: [
    "Drop an item in the left slot and<br/>choose a middle slot for your upgrade scroll",
    "Keep a backup item in case the one<br/>you attempt to upgrade gets destroyed",
    "If the upgrade succeed it will<br/>be placed in the slot on the right",
    "Upgrading an item becomes increasingly difficult",
  ],

  waypointx: [""],
  waypointn: [""],
  waypointo: [""],
  stash: [""],
  portalcow: [
    {
      condition(game: any) {
        return game.player.level < 45;
      },
      text: ["You need to be lv.45 and above to access the secret level"],
    },
  ],
  portalminotaur: [
    {
      condition(game: any) {
        return game.player.level < 50;
      },
      text: ["You need to be lv.50 and above to access the Minotaur portal"],
    },
  ],
  portalstone: [""],
  portalgateway: [""],
  gatewayfx: [""],
  gate: [""],
  magicstone: [""],
  blueflame: [""],
  altarchalice: [""],
  altarsoulstone: [""],
  secretstairs: [""],
  secretstairs2: [""],
  secretstairsup: [""],
  tombdeathangel: [
    "There was a powerful death angel named Azrael<br/>who ruled over the souls of the deceased.",
    "Azrael was feared and respected by all, for it was said that those who<br/>angered him would suffer an eternity of torment in the underworld.",
    "But there was one place that even Azrael dared not enter: the Lost Temple.",
    "It was said that the temple held ancient secrets<br/>and power that could threaten even Azrael's rule.",
    "The temple was hidden deep in a treacherous jungle,<br/>guarded by deadly beasts and cursed by dark magic.",
    "Many brave souls had attempted to find the temple and unlock its secrets,<br/>but none had ever returned...",
  ],
  tombangel: [
    "The quantum powder can be crafted from the remains of valourous enemies.",
    "It grants the power to travel through space and time",
  ],
  tombcross: ["This tomb is linked to the blood guardians,<br/>activating the mechanism will reveal the entrance."],
  tombskull: [
    "There is an ancient legend about a powerful grimoire, a book of magic and spells,<br/>that is said to be hidden beneath a tree deep in the heart of a dark forest.",
    "According to the legend, the grimoire holds the secrets to powerful magic,<br/>and those who can uncover it will gain immense power and knowledge.",
    "Only a raging blaze will let the worthy pass through the entrance in search of the lost grimoire",
  ],
  lever: [""],
  lever2: [""],
  lever3: [""],
  grimoire: [
    "The grimoire contains secrets of life and death,<br/>and the power to control the fate of souls.",
    "It is said that whoever possesses the grimoire<br/>will have the power to control death itself.",
    "Many believe that the grimoire is not meant for mortals<br/>and those who try to obtain it will pay a high price.",
  ],
  fossil: ["Here lies the remains of a fallen Bitcoin maximalist.<br/>It shall not rise again."],
  panelskeletonkey: ["This route will lead you to the Skeleton Key."],
  obelisk: [
    "Legend says that the obelisk holds the secret to immortality.",
    "The runes on the obelisk contain the key to unlocking this secret",
  ],
  hands: [
    {
      condition(_game, isActivated) {
        return !isActivated;
      },
      text: [
        "These hands appear to be linked with the gateway,<br/>as if an inseparable part of its ancient structure.",
        "The mechanism of the Gateway requires<br/>a specific powder to initiate.",
      ],
    },
    {
      condition(_game, isActivated) {
        return isActivated;
      },
      text: ["The gateway is opened"],
    },
  ],
  alkor: [
    {
      condition(game: any) {
        return !game.storage.getAchievements()[ACHIEVEMENT_NFT_INDEX];
      },
      text: [
        "I had procured a valuable NFT of a stone for $2.8 million<br/>but unfortunately, it has gone missing.",
        "If you could retrieve it for me, I would be most grateful<br/>and offer a suitable reward as a token of my appreciation.",
      ],
    },
    {
      condition(game: any) {
        return !!game.storage.getAchievements()[ACHIEVEMENT_NFT_INDEX];
      },
      text: [
        "Thought my JPEG was lost forever.",
        "Do you have an interest in magic?",
        "Ancient legends describe a tome of magic hidden beneath the woodland.",
        "That's the extent of my knowledge,<br/>best of luck on your journey.",
      ],
    },
  ],
  olaf: [
    {
      condition(game: any) {
        return !game.storage.getAchievements()[ACHIEVEMENT_WING_INDEX];
      },
      text: [
        "These serpents have indulged in the remnants of a fallen dragon.",
        "If you bring me back a Dragon's Wing,<br/>I would be most obliged and offer a recompense as a gesture of gratitude.",
      ],
    },
    {
      condition(game: any) {
        return !!game.storage.getAchievements()[ACHIEVEMENT_WING_INDEX];
      },
      text: ["Well done warrior, I've granted you your reward!"],
    },
  ],
  victor: [
    {
      condition(game: any) {
        return !game.storage.getAchievements()[ACHIEVEMENT_CRYSTAL_INDEX];
      },
      text: [
        "An ancient and powerful crystal, known for its<br/>immense magical power, has been stolen by evil forces.",
        "The theft was orchestrated by a group of dark shamans,<br/>who seek to use the crystal's power to spread their evil reign.",
        "They have taken the crystal deep within a dangerous and treacherous dungeon.",
        "If you retrieve the Crystal for me, I would be greatly<br/>appreciative and provide a reward as a sign of my gratitude.",
      ],
    },
    {
      condition(game: any) {
        return !!game.storage.getAchievements()[ACHIEVEMENT_CRYSTAL_INDEX];
      },
      text: ["Well done warrior, I've granted you your reward!"],
    },
  ],
  fox: ["What did the fox say?"],
  tree: [""],
  trap: [""],
  trap2: [""],
  trap3: [""],
  doordeathangel: [""],
  statue: [""],
  statue2: [""],

  coder: [
   "Hi! Welcome to NanoBrowserQuest",
   "Make sure you join the Discord server!",

  ],

  beachnpc: [
    "Don't mind me, I'm just here on vacation.",
    "I have to say...",
    "These giant crabs are somewhat annoying.",
    "Could you please get rid of them for me?",
  ],

  desertnpc: [
    "One does not simply walk into these mountains...",
    "An ancient undead lord is said to dwell here.",
    "Nobody knows exactly what he looks like...",
    "...for none has lived to tell the tale.",
    "It's not too late to turn around and go home, kid.",
  ],

  othernpc: ["lorem ipsum", "lorem ipsum"],
};

class Npc extends Character {
  discourse: number;
  talkCount: number;
  itemKind: any;
  talkIndex: number;
  kind: number;
  isActivated?: boolean;
  isTalkLocked?: boolean;

  constructor(id, kind) {
    super(id, kind);
    this.itemKind = Types.getKindAsString(this.kind);
    this.type = "npc";
    this.isTalkLocked = false;

    if (typeof NpcTalk[this.itemKind][0] === "string") {
      this.discourse = -1;
      this.talkCount = NpcTalk[this.itemKind].length;
    } else {
      this.discourse = 0;
      this.talkCount = NpcTalk[this.itemKind][this.discourse]["text"].length;
    }
    this.talkIndex = 0;
  }

  selectTalk(game: Game) {
    var change = false;
    if (this.discourse != -1) {
      var found = false;
      for (var i = 1; !found && i < NpcTalk[this.itemKind].length; i++) {
        if (NpcTalk[this.itemKind][i]["condition"](game, this.isActivated)) {
          if (this.discourse != i) {
            change = true;
            this.discourse = i;
            this.talkCount = NpcTalk[this.itemKind][this.discourse]["text"].length;
          }
          found = true;
        }
      }
      if (!found) {
        if (this.discourse != 0) {
          change = true;
          this.discourse = 0;
          this.talkCount = NpcTalk[this.itemKind][this.discourse]["text"].length;
        }
      }
    }
    return change;
  }

  talk(game: Game, talkIndex) {
    var msg = "";

    if (typeof talkIndex !== "undefined") {
      this.talkIndex = talkIndex;
    } else if (this.selectTalk(game) || this.talkIndex > this.talkCount) {
      this.talkIndex = 0;
    }
    if (this.talkIndex < this.talkCount) {
      if (this.discourse == -1) {
        msg = NpcTalk[this.itemKind][this.talkIndex];
      } else {
        msg = NpcTalk[this.itemKind][this.discourse]["text"][this.talkIndex];
      }
    }
    this.talkIndex += 1;

    return msg.replace("*name*", game.player.name);
  }
}

export default Npc;
