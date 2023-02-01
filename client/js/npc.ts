import { Types } from "../../shared/js/gametypes";
import Character from "./character";
import Game from "./game";

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
    "Roses are red, bans are yellow...",
    "I was deep into Terra, that's now out the window",
  ],

  carlosmatos: [
    "Hey hey hey!",
    "Wassa-wassa-wassa-wassup!",
    "My wife still doesn't even believe in me",
    "Let me tell you, I love, BITCONNEEeeeEECT!",
  ],

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
    'Want to report an issue? Check out <a target="_blank" href="https://github.com/running-coder/NanoBrowserQuest">NanoBrowserQuest repository on GitHub</a>',
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
        return game.player.level < 53;
      },
      text: ["You need to be lv.53 and above to access the Minotaur portal"],
    },
  ],
  portalstone: [""],
  portalcrypt: [""],
  portalruins: [""],
  magicstone: [""],
  blueflame: [""],
  altarchalice: [""],
  altarinfinitystone: [""],
  secretstairs: [""],
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
    "The sun statuette grants the power to see what is hidden to human eye.",
    "The unique artifact remains firmly in the hands of the blood guardian, protected for all eternity",
  ],

  tombcross: [
    "The moon statuette grants the power to travel through space and time.",
    "The unique artifact remains firmly in the hands of the blood guardian, protected for all eternity",
  ],
  tombskull: [
    "There is an ancient legend about a powerful grimoire, a book of magic and spells,<br/>that is said to be hidden beneath a tree deep in the heart of a dark forest.",
    "According to the legend, the grimoire holds the secrets to powerful magic,<br/>and those who can uncover it will gain immense power and knowledge.",
  ],
  lever: [""],
  leverwall: [""],
  grimoire: [
    "The grimoire contains secrets of life and death,<br/>and the power to control the fate of souls.",
    "It is said that whoever possesses the grimoire<br/>will have the power to control death itself.",
    "Many believe that the grimoire is not meant for mortals<br/>and those who try to obtain it will pay a high price.",
  ],
  alkor: [
    "I had procured a valuable NFT of a stone for $2.8 million<br/>but unfortunately, it has gone missing.",
    "If you could retrieve it for me, I would be most grateful<br/>and offer a suitable reward as a token of my appreciation.",
  ],
  olaf: [
    "These serpents have indulged in the remnants of a fallen dragon.",
    "If you could obtain a Dragon's Wing for me,<br/>I would be most obliged and offer a recompense as a gesture of gratitude.",
  ],
  tree: [""],
  trap: [""],
  trap2: [""],
  trap3: [""],
  statue: [""],

  coder: [
    "Hi! Do you know that you can also play Nano BrowserQuest on your tablet or mobile?",
    "That's the beauty of HTML5!",
    "Give it a try...",
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

  constructor(id, kind) {
    super(id, kind);
    this.itemKind = Types.getKindAsString(this.kind);
    this.type = "npc";

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
        if (NpcTalk[this.itemKind][i]["condition"](game)) {
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

  talk(game: Game) {
    var msg = "";

    if (this.selectTalk(game) || this.talkIndex > this.talkCount) {
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
