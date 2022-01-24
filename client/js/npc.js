define(["character"], function (Character) {
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
      "Hop over the Nano discord and get engaged with the community!",
    ],

    villager: [
      "Howdy stranger. Do you like poetry?",
      "Roses are red, violets are blue...",
      "I like hunting rats, and so do you...",
      "The rats are dead, now what to do?",
      "To be honest, I have no clue.",
      "Maybe the forest, could interest you...",
      "or instead, cook a rat stew.",
    ],

    carlosmatos: [
      "Hey hey hey!",
      "Wassa-wassa-wassa-wassup!",
      "My wife still doesn't even believe in me",
      "Let me tell you, I love, BITCONNECT!",
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
          "The orange one will turn you into a firefox and make you invincible...",
          "But it only lasts for a short while.",
          "So make good use of it!",
          "Now if you'll excuse me, I need to get back to my experiments...",
        ],
      },
      {
        condition: function (game) {
          return game.player.invincible;
        },
        text: [
          "Did you not listen to what I said?!!",
          "the famous fire-potion only lasts a few seconds",
          "You shouldn't be wasting them talking to me…",
        ],
      },
      {
        condition: function (game) {
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
    stash: [""],

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

  var Npc = Character.extend({
    init: function (id, kind) {
      this._super(id, kind, 1);
      this.itemKind = Types.getKindAsString(this.kind);
      if (typeof NpcTalk[this.itemKind][0] === "string") {
        this.discourse = -1;
        this.talkCount = NpcTalk[this.itemKind].length;
      } else {
        this.discourse = 0;
        this.talkCount = NpcTalk[this.itemKind][this.discourse]["text"].length;
      }
      this.talkIndex = 0;
    },

    selectTalk: function (game) {
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
    },

    talk: function (game) {
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
    },
  });

  return Npc;
});
