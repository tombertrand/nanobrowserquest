import * as _ from "lodash";

import Area from "./area";
import Detect from "./detect";

import type Game from "./game";

class AudioManager {
  isMusicEnabled: boolean;
  musicVolume: number;
  isSoundEnabled: boolean;
  soundVolume: number;
  extension: string;
  sounds: any;
  game: Game;
  currentMusic: any;
  areas: any[];
  musicNames: any[];
  soundNames: string[];

  constructor(game) {
    var self = this;

    this.isMusicEnabled = true;
    this.musicVolume = 0.7;
    this.isSoundEnabled = true;
    this.soundVolume = 0.7;

    this.extension = Detect.canPlayMP3() ? "mp3" : "ogg";
    this.sounds = {};
    this.game = game;
    this.currentMusic = null;
    this.areas = [];
    this.musicNames = [
      "village",
      "beach",
      "forest",
      "cave",
      "desert",
      "lavaland",
      "boss",
      "freezingland",
      "icewalk",
      "skeletoncommander",
      "necromancer",
      "cowlevel",
    ];
    this.soundNames = [
      "loot",
      "hit1",
      "hit2",
      "hurt",
      "heal",
      "chat",
      "revive",
      "death",
      "firefox",
      "achievement",
      "levelup",
      "kill1",
      "kill2",
      "noloot",
      "teleport",
      "chest",
      "npc",
      "npc-end",
      "raise",
      "deathangel-death",
      "deathangel-spell",
      "portal-open",
      "skill-heal",
      "skill-defense",
      "skill-resistances",
      "skill-magic",
      "skill-flame",
      "skill-lightning",
      "skill-cold",
      "skill-poison",
      "curse-prevent-regenerate-health",
      "magicstone",
      "secret-found",
      "stone-break",
      "lever",
      "lever3",
      "fireball",
      "iceball",
      "trap",
      "powder",
      "fresh-meat",
      "magic-blast",
      "static",
    ];

    const loadSoundFiles = () => {
      console.info("Loading sound files...");
      _.each(self.soundNames, function (name) {
        self.loadSound(name, () => {});
      });
    };

    if (!(Detect.isSafari() && Detect.isWindows())) {
      loadSoundFiles();
    } else {
      this.isMusicEnabled = false; // Disable audio on Safari Windows
      this.isSoundEnabled = false; // Disable audio on Safari Windows
    }
  }

  updateMusicVolume(volume) {
    if (typeof volume !== "number" || volume > 1 || volume < 0) {
      volume = 0.7;
    }

    this.musicVolume = volume;

    const music = this.getSurroundingMusic(this.game.player);
    if (music?.sound) {
      music.sound.volume = this.musicVolume;
    }
  }

  updateSoundVolume(volume) {
    if (typeof volume !== "number" || volume > 1 || volume < 0) {
      volume = 0.7;
    }

    this.soundVolume = volume;
  }

  disableMusic() {
    this.isMusicEnabled = false;
    if (this.currentMusic) {
      this.resetMusic(this.currentMusic);
    }
  }

  enableMusic() {
    this.isMusicEnabled = true;
    if (this.currentMusic) {
      this.currentMusic = null;
    }
    this.updateMusic();
  }

  disableSound() {
    this.isSoundEnabled = false;
  }

  enableSound() {
    this.isSoundEnabled = true;
  }

  load(basePath, name, loaded_callback, channels) {
    var path = basePath + name + "." + this.extension;
    var sound = document.createElement("audio");

    loaded_callback?.();

    sound.addEventListener(
      "error",
      () => {
        console.error("Error: " + path + " could not be loaded.");
        this.sounds[name] = null;
      },
      false,
    );

    sound.preload = "auto";
    // sound.autobuffer = true;
    sound.src = path;
    sound.load();

    this.sounds[name] = [sound];
    _.times(channels - 1, () => {
      this.sounds[name].push(sound.cloneNode(true));
    });
  }

  loadSound(name, handleLoaded) {
    this.load("audio/sounds/", name, handleLoaded, 4);
  }

  loadMusic(name, handleLoaded?: () => void) {
    this.load("audio/music/", name, handleLoaded, 1);

    var music = this.sounds[name][0];
    music.loop = true;
    music.addEventListener(
      "ended",
      function () {
        music.play();
      },
      false,
    );
  }

  getSound(name) {
    if (!this.sounds[name]) {
      return null;
    }

    return this.sounds[name].find(sound => sound.ended || sound.paused);
  }

  playSound(name, delay = 0, volume?: number) {
    var sound = this.isSoundEnabled && this.getSound(name);
    if (sound) {
      sound.volume = this.soundVolume ? volume || this.soundVolume : 0;
      setTimeout(() => {
        sound.play();
      }, delay);
    }
  }

  addArea(x, y, width, height, musicName) {
    var area = new Area(x, y, width, height);
    area.musicName = musicName;
    this.areas.push(area);
  }

  getSurroundingMusic(entity) {
    var music: any = null;
    var area = _.find(this.areas, function (area) {
      return area.contains(entity);
    });

    if (area) {
      if (!this.sounds[area.musicName]) {
        this.loadMusic(area.musicName);
      } else {
        music = { sound: this.getSound(area.musicName), name: area.musicName };
      }
    }
    return music;
  }

  updateMusic() {
    if (this.isMusicEnabled) {
      var music = this.getSurroundingMusic(this.game.player);

      if (music) {
        if (!this.isCurrentMusic(music)) {
          if (this.currentMusic) {
            this.fadeOutCurrentMusic();
          }
          this.playMusic(music);
        }
      } else {
        this.fadeOutCurrentMusic();
      }
    }
  }

  isCurrentMusic(music) {
    return this.currentMusic && music.name === this.currentMusic.name;
  }

  playMusic(music) {
    if (this.isMusicEnabled && music?.sound) {
      if (music.sound.fadingOut) {
        this.fadeInMusic(music);
      } else {
        music.sound.volume = this.musicVolume;
        music.sound.play();
      }
      this.currentMusic = music;
    }
  }

  resetMusic(music) {
    if (music && music.sound && music.sound.readyState > 0) {
      music.sound.pause();
      music.sound.currentTime = 0;
    }
  }

  fadeOutMusic(music, ended_callback) {
    var self = this;
    if (music && !music.sound.fadingOut) {
      this.clearFadeIn(music);
      music.sound.fadingOut = setInterval(function () {
        var step = 0.02,
          volume = music.sound.volume - step;

        if (self.isMusicEnabled && volume >= step) {
          music.sound.volume = volume;
        } else {
          music.sound.volume = 0;
          self.clearFadeOut(music);
          ended_callback(music);
        }
      }, 50);
    }
  }

  fadeInMusic(music) {
    var self = this;
    if (music && !music.sound.fadingIn) {
      this.clearFadeOut(music);
      music.sound.fadingIn = setInterval(function () {
        var step = 0.01;
        var volume = music.sound.volume + step;

        if (self.isMusicEnabled && volume < this.musicVolume - step) {
          music.sound.volume = volume;
        } else {
          music.sound.volume = self.musicVolume;
          self.clearFadeIn(music);
        }
      }, 30);
    }
  }

  clearFadeOut(music) {
    if (music.sound.fadingOut) {
      clearInterval(music.sound.fadingOut);
      music.sound.fadingOut = null;
    }
  }

  clearFadeIn(music) {
    if (music.sound.fadingIn) {
      clearInterval(music.sound.fadingIn);
      music.sound.fadingIn = null;
    }
  }

  fadeOutCurrentMusic() {
    var self = this;
    if (this.currentMusic) {
      this.fadeOutMusic(this.currentMusic, function (music) {
        self.resetMusic(music);
      });
      this.currentMusic = null;
    }
  }
}

export default AudioManager;
