import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";
import Camera from "./camera";
import Character from "./character";
import Detect from "./detect";
import Item from "./item";
import Player from "./player";
import Timer from "./timer";

import type Game from "./game";

class Renderer {
  game: Game;
  context: any;
  background: any;
  foreground: any;
  canvas: any;
  backcanvas: any;
  forecanvas: any;
  tilesize: number;
  upscaledRendering: boolean;
  supportsSilhouettes: any;
  lastTime: Date;
  frameCount: number;
  maxFPS: any;
  FPS: any;
  realFPS: number;
  isDebugInfoVisible: boolean;
  animatedTileCount: number;
  highAnimatedTileCount: number;
  highTileCount: number;
  tablet: any;
  fixFlickeringTimer: Timer;
  brightnessMap: { 7: number; 8: number; 9: number; 10: number };
  tileset: any;
  mobile: boolean;
  scale: any;
  camera: Camera;
  lastTargetPos: { x: any; y: any };
  targetRect: {};
  isDrawEntityName: boolean;

  constructor(game, canvas, background, foreground) {
    this.game = game;
    this.context = canvas && canvas.getContext ? canvas.getContext("2d") : null;
    this.background = background && background.getContext ? background.getContext("2d") : null;
    this.foreground = foreground && foreground.getContext ? foreground.getContext("2d") : null;

    this.canvas = canvas;
    this.backcanvas = background;
    this.forecanvas = foreground;

    this.initFPS();
    this.tilesize = 16;

    this.isDrawEntityName = true;

    this.upscaledRendering = true;
    this.supportsSilhouettes = this.upscaledRendering;

    this.rescale();

    this.lastTime = new Date();
    this.frameCount = 0;
    this.maxFPS = this.FPS;
    this.realFPS = 0;
    //Turn on or off Debuginfo (FPS Counter)
    this.isDebugInfoVisible = false;

    this.animatedTileCount = 0;
    this.highAnimatedTileCount = 0;
    this.highTileCount = 0;

    this.tablet = Detect.isTablet(window.innerWidth);

    this.fixFlickeringTimer = new Timer(100);

    this.brightnessMap = {
      7: 125,
      8: 160,
      9: 200,
      10: 250,
    };
  }

  getWidth() {
    return this.canvas.width;
  }

  getHeight() {
    return this.canvas.height;
  }

  setTileset(tileset) {
    this.tileset = tileset;
  }

  getScaleFactor() {
    var w = window.innerWidth; //* window.devicePixelRatio >= 2 ? 2 : 1,
    var h = window.innerHeight; // * window.devicePixelRatio >= 2 ? 2 : 1,
    var scale;

    this.mobile = false;

    // @TODO Adjust scale on mobile & tablet
    if (w <= 1000) {
      scale = 2;
      this.mobile = true;
    } else if (w <= 1500 || h <= 870) {
      scale = 2;
    } else {
      scale = 3;
    }

    return scale;
  }

  rescale() {
    this.scale = this.getScaleFactor();

    this.createCamera();

    this.context.imageSmoothingEnabled = false;
    this.background.imageSmoothingEnabled = false;
    this.foreground.imageSmoothingEnabled = false;

    this.initFont();
    this.initFPS();

    if (this.game.renderer) {
      this.game.setSpriteScale(this.scale);
    }
  }

  createCamera() {
    this.camera = new Camera(this);
    this.camera.rescale();

    this.canvas.width = this.camera.gridW * this.tilesize * this.scale;
    this.canvas.height = this.camera.gridH * this.tilesize * this.scale;
    console.debug("#entities set to " + this.canvas.width + " x " + this.canvas.height);

    this.backcanvas.width = this.canvas.width;
    this.backcanvas.height = this.canvas.height;
    console.debug("#background set to " + this.backcanvas.width + " x " + this.backcanvas.height);

    this.forecanvas.width = this.canvas.width;
    this.forecanvas.height = this.canvas.height;
    console.debug("#foreground set to " + this.forecanvas.width + " x " + this.forecanvas.height);

    //   if (this.scale === 2) {
    //     this.context.scale(0.75, 0.75);
    //     this.background.scale(0.5, 0.75);
    //     this.foreground.scale(0.75, 0.75);
    //   }
  }

  initFPS() {
    this.FPS = this.mobile ? 50 : 50;
  }

  initFont() {
    var fontsize;

    switch (this.scale) {
      case 1:
        fontsize = 10;
        break;
      case 2:
        fontsize = Detect.isWindows() ? 10 : 13;
        break;
      case 3:
        fontsize = 20;
    }
    this.setFontSize(fontsize);
  }

  setFontSize(size) {
    var font = size + "px GraphicPixel";

    this.context.font = font;
    this.background.font = font;
  }

  drawText(text, x, y, centered, color?: string, strokeColor?: string) {
    var ctx = this.context;
    var strokeSize;

    switch (this.scale) {
      case 1:
        strokeSize = 3;
        break;
      case 2:
        strokeSize = 3;
        break;
      case 3:
        strokeSize = 5;
    }

    if (text && x && y) {
      ctx.save();
      if (centered) {
        ctx.textAlign = "center";
      }
      ctx.strokeStyle = strokeColor || "#373737";
      ctx.lineWidth = strokeSize;
      ctx.strokeText(text, x, y);
      ctx.fillStyle = color || "white";
      ctx.fillText(text, x, y);
      ctx.restore();
    }
  }

  drawCellRect(x, y, color) {
    this.context.save();
    this.context.lineWidth = 2 * this.scale;
    this.context.strokeStyle = color;
    this.context.translate(x + 2, y + 2);
    this.context.strokeRect(0, 0, this.tilesize * this.scale - 4, this.tilesize * this.scale - 4);
    this.context.restore();
  }

  drawRectStroke(x, y, width, height, color) {
    this.context.fillStyle = color;
    this.context.fillRect(x, y, this.tilesize * this.scale * width, this.tilesize * this.scale * height);
    this.context.fill();
    this.context.lineWidth = 5;
    this.context.strokeStyle = "black";
    this.context.strokeRect(x, y, this.tilesize * this.scale * width, this.tilesize * this.scale * height);
  }

  drawRect(x, y, width, height, color) {
    this.context.fillStyle = color;
    this.context.fillRect(x, y, this.tilesize * this.scale * width, this.tilesize * this.scale * height);
  }

  drawCellHighlight(x, y, color) {
    var s = this.scale,
      ts = this.tilesize,
      tx = x * ts * s,
      ty = y * ts * s;

    this.drawCellRect(tx, ty, color);
  }

  drawTargetCell() {
    var mouse = this.game.getMouseGridPosition();

    if (this.game.targetCellVisible && !(mouse.x === this.game.selectedX && mouse.y === this.game.selectedY)) {
      this.drawCellHighlight(mouse.x, mouse.y, this.game.targetColor);
    }
  }

  drawAttackTargetCell() {
    var mouse = this.game.getMouseGridPosition(),
      entity = this.game.getEntityAt(mouse.x, mouse.y),
      s = this.scale;

    if (entity) {
      this.drawCellRect(entity.x * s, entity.y * s, "rgba(255, 0, 0, 0.5)");
    }
  }

  drawOccupiedCells() {
    var positions = this.game.entityGrid;

    if (positions) {
      for (var i = 0; i < positions.length; i += 1) {
        for (var j = 0; j < positions[i].length; j += 1) {
          if (!_.isNull(positions[i][j])) {
            this.drawCellHighlight(i, j, "rgba(50, 50, 255, 0.5)");
          }
        }
      }
    }
  }

  drawPathingCells() {
    var grid = this.game.pathingGrid;

    if (grid && this.game.debugPathing) {
      for (var y = 0; y < grid.length; y += 1) {
        for (var x = 0; x < grid[y].length; x += 1) {
          if (grid[y][x] === 1 && this.game.camera.isVisiblePosition(x, y)) {
            this.drawCellHighlight(x, y, "rgba(50, 50, 255, 0.5)");
          }
        }
      }
    }
  }

  drawSelectedCell() {
    var sprite = this.game.cursors["target"],
      anim = this.game.targetAnimation,
      os = this.upscaledRendering ? 1 : this.scale,
      ds = this.upscaledRendering ? this.scale : 1;

    if (this.game.selectedCellVisible) {
      if (this.mobile || this.tablet) {
        if (this.game.drawTarget) {
          var x: number = this.game.selectedX;
          var y: number = this.game.selectedY;

          this.drawCellHighlight(this.game.selectedX, this.game.selectedY, "rgb(51, 255, 0)");
          this.lastTargetPos = { x: x, y: y };
          this.game.drawTarget = false;
        }
      } else {
        if (sprite?.width && anim) {
          var frame = anim.currentFrame,
            s = this.scale,
            x = frame.x * os,
            y = frame.y * os,
            w = sprite.width * os,
            h = sprite.height * os,
            ts = 16,
            dx = this.game.selectedX * ts * s,
            dy = this.game.selectedY * ts * s,
            dw = w * ds,
            dh = h * ds;

          this.context.save();
          this.context.translate(dx, dy);
          this.context.drawImage(sprite.image, x, y, w, h, 0, 0, dw, dh);
          this.context.restore();
        }
      }
    }
  }

  clearScaledRect(ctx, x, y, w, h) {
    var s = this.scale;

    ctx.clearRect(x * s, y * s, w * s, h * s);
  }

  drawCursor() {
    var mx = this.game.mouse.x,
      my = this.game.mouse.y,
      s = this.scale,
      os = this.upscaledRendering ? 1 : this.scale;

    this.context.save();
    if (this.game.currentCursor && this.game.currentCursor.isLoaded) {
      this.context.drawImage(this.game.currentCursor.image, 0, 0, 14 * os, 14 * os, mx, my, 14 * s, 14 * s);
    }
    this.context.restore();
  }

  drawScaledImage(ctx, image, x, y, w, h, dx, dy) {
    var s = this.upscaledRendering ? 1 : this.scale;
    _.each(arguments, function (arg) {
      if (_.isUndefined(arg) || _.isNaN(arg) || _.isNull(arg) || arg < 0) {
        console.error("x:" + x + " y:" + y + " w:" + w + " h:" + h + " dx:" + dx + " dy:" + dy);
        throw Error("A problem occured when trying to draw on the canvas");
      }
    });
    ctx.drawImage(image, x * s, y * s, w * s, h * s, dx * this.scale, dy * this.scale, w * this.scale, h * this.scale);
  }

  drawTile(ctx, tileid, cellid) {
    var s = this.upscaledRendering ? 1 : this.scale;
    if (tileid !== -1) {
      // -1 when tile is empty in Tiled. Don't attempt to draw it.
      const tileset = this.getTileset(tileid);

      if (!tileset) {
        // @TODO why is sometimes tileset not found? (walk up the woodland WP)
        console.log("~~~~tileid", tileid);
        return;
      }

      if (!tileset.image) {
        tileset.image = this.game.map._loadTileset(`img/1/${tileset.name}.png`);
      } else {
        this.drawScaledImage(
          ctx,
          tileset.image,
          getX(tileid - tileset.firstgid + 2, tileset.columns / s) * this.tilesize,
          Math.floor((tileid - tileset.firstgid + 1) / (tileset.columns / s)) * this.tilesize,
          this.tilesize,
          this.tilesize,
          getX(cellid + 1, this.game.map.width) * this.tilesize,
          Math.floor(cellid / this.game.map.width) * this.tilesize,
        );
      }
    }
  }

  getTileset(tileId) {
    return this.game.map.tilesets.find(
      ({ firstgid, tilecount }) => tileId >= firstgid && tileId <= firstgid + tilecount,
    );
  }

  clearTile(ctx, gridW, cellid) {
    var s = this.scale,
      ts = this.tilesize,
      x = getX(cellid + 1, gridW) * ts * s,
      y = Math.floor(cellid / gridW) * ts * s,
      w = ts * s,
      h = w;

    ctx.clearRect(x, y, h, w);
  }

  calculateBrightnessPerLevel(level) {
    const factor = (level - 6) * 25;
    const milliseconds = Math.floor(this.game.currentTime / 100);
    const ms = milliseconds % 10;
    const isEven = (Math.floor(milliseconds / 10) % 10) % 2;
    let brightness = this.brightnessMap[level];

    if (isEven) {
      if (ms <= 2) {
        brightness = brightness - Math.floor(factor * 1);
      } else if (ms === 3) {
        brightness = brightness - Math.floor(factor * 0.9);
      } else if (ms === 4) {
        brightness = brightness - Math.floor(factor * 0.75);
      } else if (ms === 5) {
        brightness = brightness - Math.floor(factor * 0.6);
      } else if (ms === 6) {
        brightness = brightness - Math.floor(factor * 0.45);
      } else if (ms === 7) {
        brightness = brightness - Math.floor(factor * 0.3);
      } else if (ms === 8) {
        brightness = brightness - Math.floor(factor * 0.15);
      } else if (ms === 9) {
        brightness = brightness - Math.floor(factor * 0);
      }
    } else {
      if (ms === 0) {
        brightness = brightness - Math.floor(factor * 0);
      } else if (ms === 1) {
        brightness = brightness - Math.floor(factor * 0.15);
      } else if (ms === 2) {
        brightness = brightness - Math.floor(factor * 0.3);
      } else if (ms === 3) {
        brightness = brightness - Math.floor(factor * 0.45);
      } else if (ms === 4) {
        brightness = brightness - Math.floor(factor * 0.6);
      } else if (ms === 5) {
        brightness = brightness - Math.floor(factor * 0.75);
      } else if (ms === 6) {
        brightness = brightness - Math.floor(factor * 0.9);
      } else if (ms >= 7) {
        brightness = brightness - Math.floor(factor * 1);
      }
    }

    return brightness;
  }

  drawCape(entity) {
    if (!entity.cape) return;

    var sprite = this.game.getSprite("cape");
    var anim = entity.currentAnimation;

    var spriteImage = sprite.image;
    if (entity.capeLevel >= 7) {
      spriteImage = sprite.image7;
    }

    if (sprite?.width && anim) {
      var os = this.upscaledRendering ? 1 : this.scale;
      var ds = this.upscaledRendering ? this.scale : 1;

      var frame = anim.currentFrame,
        s = this.scale,
        x = frame.x * os,
        y = frame.y * os,
        w = sprite.width * os,
        h = sprite.height * os,
        ox = sprite.offsetX * s,
        oy = sprite.offsetY * s,
        dw = w * ds,
        dh = h * ds;

      // @NOTE To be researched https://codepen.io/sosuke/pen/Pjoqqp
      // this.context.filter = "sepia(50%)";
      // this.context.fillStyle = "hsl(" + 360 * Math.random() + ",100%,50%)";
      // this.context.fillStyle = "hsl(-121, 100%, 50%)";

      let filter = "";
      if (typeof entity.capeHue === "number") {
        filter += ` hue-rotate(${entity.capeHue}deg)`;
      }
      if (typeof entity.capeSaturate === "number") {
        filter += ` saturate(${entity.capeSaturate}%)`;
      }
      if (typeof entity.capeContrast === "number") {
        filter += ` contrast(${entity.capeContrast}%)`;
      }
      if (typeof entity.capeBrightness === "number") {
        filter += ` brightness(${entity.capeBrightness})`;
      }
      this.context.filter = filter;
      this.context.drawImage(spriteImage, x, y, w, h, ox, oy, dw, dh);
      this.context.filter = "none";
    }
  }

  drawShield(entity) {
    if (!entity.shieldName) return;

    var sprite = this.game.getSprite(entity.shieldName);
    var anim = entity.currentAnimation;
    var spriteImage = sprite.image;

    let isFilterApplied = false;

    if (sprite?.width && anim) {
      var os = this.upscaledRendering ? 1 : this.scale;
      var ds = this.upscaledRendering ? this.scale : 1;

      var frame = anim.currentFrame,
        s = this.scale,
        x = frame.x * os,
        y = frame.y * os,
        w = sprite.width * os,
        h = sprite.height * os,
        ox = sprite.offsetX * s,
        oy = sprite.offsetY * s,
        dw = w * ds,
        dh = h * ds;

      if (entity.shieldLevel >= 7) {
        isFilterApplied = true;

        const brightness = this.calculateBrightnessPerLevel(entity.shieldLevel);
        this.context.filter = `brightness(${brightness}%)`;
      }

      this.context.drawImage(spriteImage, x, y, w, h, ox, oy, dw, dh);

      if (isFilterApplied) {
        this.context.filter = "brightness(100%)";
      }
    }
  }

  drawHelm(entity) {
    var sprite = this.game.getSprite(entity.helmName);
    var anim = entity.currentAnimation;
    var spriteImage = sprite.image;

    if (sprite?.width && anim) {
      var os = this.upscaledRendering ? 1 : this.scale;
      var ds = this.upscaledRendering ? this.scale : 1;

      var frame = anim.currentFrame,
        s = this.scale,
        x = frame.x * os,
        y = frame.y * os,
        w = sprite.width * os,
        h = sprite.height * os,
        ox = sprite.offsetX * s,
        oy = sprite.offsetY * s,
        dw = w * ds,
        dh = h * ds;

      this.context.filter = "";
      if (entity.helmLevel >= 7) {
        const brightness = this.calculateBrightnessPerLevel(entity.helmLevel);
        this.context.filter += `brightness(${brightness}%) `;
      }

      if (entity.isFrozen || entity.isSlowed) {
        this.context.filter = "sepia(100%) hue-rotate(190deg) saturate(500%)";
      } else {
        if (entity.type === "mob" && Types.isMiniBoss(entity)) {
          this.context.filter = "grayscale(100%) sepia(100%) saturate(150%) hue-rotate(260deg)";
        } else if (entity.isPoisoned && !Types.isBoss(entity.kind)) {
          this.context.filter = "grayscale(100%) sepia(100%) hue-rotate(90deg)";
        }
      }

      if (
        [
          "helmhorned",
          "helmfrozen",
          "helmdiamond",
          "helmemerald",
          "helmexecutioner",
          "helmtemplar",
          "helmdragon",
          "helmmoon",
          "helmdemon",
          "helmmystical",
          "helmimmortal",
          // "helmpaladin",
        ].includes(sprite.name) &&
        entity.helmBonus?.length
      ) {
        spriteImage = sprite.imageunique;
      }

      this.context.drawImage(spriteImage, x, y, w, h, ox, oy, dw, dh);
      this.context.filter = "none";
    }
  }

  setDrawEntityName(isDrawEntityName: boolean) {
    this.isDrawEntityName = isDrawEntityName;
  }

  drawEntity(entity) {
    var sprite = entity.sprite,
      shadow = this.game.shadows["small"],
      anim = entity.currentAnimation,
      os = this.upscaledRendering ? 1 : this.scale,
      ds = this.upscaledRendering ? this.scale : 1;

    if (anim && sprite?.width) {
      var frame = anim.currentFrame,
        s = this.scale,
        x = frame.x * os,
        y = frame.y * os,
        w = sprite.width * os,
        h = sprite.height * os,
        ox = sprite.offsetX * s,
        oy = sprite.offsetY * s,
        dx = entity.x * s,
        dy = entity.y * s,
        dw = w * ds,
        dh = h * ds;

      if (entity.isFading) {
        this.context.save();
        this.context.globalAlpha = entity.fadingAlpha;
      }

      // @NOTE Why is the entity name persisting?
      if (this.isDrawEntityName && !this.mobile && !this.tablet) {
        this.drawEntityName(entity);
      }

      this.context.save();
      if (entity.flipSpriteX) {
        this.context.translate(dx + this.tilesize * s, dy);
        this.context.scale(-1, 1);
      } else if (entity.flipSpriteY) {
        this.context.translate(dx, dy + dh);
        this.context.scale(1, -1);
      } else {
        this.context.translate(dx, dy);
      }

      // Rotate using the entity's angle.
      if (entity.angled) {
        this.context.translate(8, 8);
        this.context.rotate(entity.getAngle());
      }

      if (entity.isVisible()) {
        if (entity.hasShadow()) {
          this.context.drawImage(
            shadow.image,
            0,
            0,
            shadow.width * os,
            shadow.height * os,
            0,
            entity.shadowOffsetY * ds,
            shadow.width * os * ds,
            shadow.height * os * ds,
          );
        }

        // @NOTE Drawing auras first (under the character)
        if (entity instanceof Character && entity.auras.length) {
          entity.auras.forEach(aura => {
            var sprite = null;
            var anim = null;
            if (aura === "drainlife") {
              sprite = this.game.getSprite("aura-drainlife");
              anim = this.game.drainLifeAnimation;
            } else if (aura === "thunderstorm") {
              sprite = this.game.getSprite("aura-thunderstorm");
              anim = this.game.thunderstormAnimation;
            } else if (aura === "highhealth") {
              sprite = this.game.getSprite("aura-highhealth");
              anim = this.game.highHealthAnimation;
            } else if (aura === "freeze") {
              sprite = this.game.getSprite("aura-freeze");
              anim = this.game.freezeAnimation;
            } else if (aura === "lowerresistance") {
              sprite = this.game.getSprite("aura-lowerresistance");
              anim = this.game.resistanceAnimation;
            } else if (aura === "arcane") {
              sprite = this.game.getSprite("aura-arcane");
              anim = this.game.arcaneAnimation;
            }

            if (sprite?.width && anim) {
              var os = this.upscaledRendering ? 1 : this.scale;
              var ds = this.upscaledRendering ? this.scale : 1;

              var frame = anim.currentFrame,
                x = frame.x * os,
                y = frame.y * os,
                w = sprite.width * os,
                h = sprite.height * os,
                dw = w * ds,
                dh = h * ds,
                ox = sprite.offsetX * s,
                oy = sprite.offsetY * s;

              this.context.drawImage(sprite.image, x, y, w, h, ox, oy, dw, dh);
            }
          });
        }

        let isFilterApplied = false;
        let spriteImage = sprite.image;

        if (entity instanceof Player) {
          if (entity.capeOrientation !== Types.Orientations.UP) {
            this.drawCape(entity);
          }
          if (entity.capeOrientation === Types.Orientations.UP) {
            this.drawShield(entity);
            this.drawHelm(entity);
          }

          if (sprite.name === entity.armorName && entity.armorLevel >= 7) {
            isFilterApplied = true;

            const brightness = this.calculateBrightnessPerLevel(entity.armorLevel);
            this.context.filter = `brightness(${brightness}%)`;
          }
        }

        // else if (entity.kind === Types.Entities.GUARD && this.game?.network === "nano") {
        //   sprite["image"].src = sprite["image"].src.replace("guard.png", "guardbanano.png");
        // }
        //  else if (entity.kind === Types.Entities.GUARD) {
        //   spriteImage = sprite[`image${this.game.network}`];
        // }

        if (entity.isFrozen || entity.isSlowed) {
          this.context.filter = "sepia(100%) hue-rotate(190deg) saturate(500%)";
        } else {
          if (entity.type === "mob" && Types.isMiniBoss(entity)) {
            this.context.filter = "grayscale(100%) sepia(100%) saturate(150%) hue-rotate(260deg)";
          } else if (entity.isPoisoned && !Types.isBoss(entity.kind)) {
            this.context.filter = "grayscale(100%) sepia(100%) hue-rotate(90deg)";
          }
        }

        this.context.drawImage(spriteImage, x, y, w, h, ox, oy, dw, dh);
        this.context.filter = "none";

        if (isFilterApplied) {
          this.context.filter = "brightness(100%)";
        }

        if (entity instanceof Player) {
          if (entity.capeOrientation === Types.Orientations.UP) {
            this.drawCape(entity);
          }
          if (entity.capeOrientation !== Types.Orientations.UP) {
            this.drawHelm(entity);
            this.drawShield(entity);
          }
        }

        if (entity instanceof Item && entity.kind !== Types.Entities.CAKE) {
          var sparks = this.game.getSprite("sparks"),
            // @ts-ignore
            anim = this.game.sparksAnimation,
            frame = anim.currentFrame,
            sx = sparks.width * frame.index * os,
            sy = sparks.height * anim.row * os,
            sw = sparks.width * os,
            sh = sparks.width * os;

          this.context.drawImage(
            sparks.image,
            sx,
            sy,
            sw,
            sh,
            sparks.offsetX * s,
            sparks.offsetY * s,
            sw * ds,
            sh * ds,
          );
        }
      }

      if (entity instanceof Player && !entity.isDead && entity.hasWeapon()) {
        var weapon = this.game.getSprite(entity.getWeaponName());

        if (weapon?.width) {
          var weaponAnimData = weapon.animationData[anim.name];
          var index = frame.index < weaponAnimData.length ? frame.index : frame.index % weaponAnimData.length;
          var wx = weapon.width * index * os;
          var wy = weapon.height * anim.row * os;
          var ww = weapon.width * os;
          var wh = weapon.height * os;

          let isFilterApplied = false;
          if (entity.weaponLevel >= 7) {
            isFilterApplied = true;

            const brightness = this.calculateBrightnessPerLevel(entity.weaponLevel);
            this.context.filter = `brightness(${brightness}%)`;
          }

          this.context.drawImage(
            weapon.image,
            wx,
            wy,
            ww,
            wh,
            weapon.offsetX * s,
            weapon.offsetY * s,
            ww * ds,
            wh * ds,
          );

          if (isFilterApplied) {
            this.context.filter = "brightness(100%)";
          }

          if (typeof entity.weaponLevel === "number" && entity.weaponLevel >= 7) {
            // @TODO configure the weapon element
            let effect = "magic";
            if (entity.isWeaponUnique) {
              effect = "flame";
            } else if (entity.weaponRuneword) {
              effect = "cold";
            }

            var sprite = this.game.getSprite(`weapon-effect-${effect}`);
            // @ts-ignore
            var anim = this.game.weaponEffectAnimation;

            var image = "";
            if (entity.weaponLevel === 8) {
              image = "8";
            } else if (entity.weaponLevel >= 9) {
              image = "9";
            }

            if (sprite?.width && anim) {
              var frame = anim.currentFrame,
                s = this.scale,
                x = frame.x * os,
                y = frame.y * os,
                w = sprite.width * os,
                h = sprite.height * os,
                ts = 20,
                dx = -12 * s,
                dy = -4 * s,
                dw = w * ds,
                dh = h * ds;

              this.context.save();

              if (entity.capeOrientation === Types.Orientations.UP) {
                (dy = -12 * s), (dx = 10 * s);
                this.context.scale(1, -1);
              } else if (entity.capeOrientation === Types.Orientations.LEFT) {
                dx = 8 * s;
                (dy = -12 * s), this.context.scale(1, -1);
              } else if (entity.capeOrientation === Types.Orientations.RIGHT) {
                dx = 8 * s;
                (dy = -12 * s), this.context.scale(1, -1);
              }

              this.context.drawImage(sprite[`image${image}`], x, y, w, h, dx, dy, dw, dh);
              this.context.restore();
            }
          }
        }
      }

      if (entity instanceof Character && entity.sprite.name === "anvil") {
        var sprite = null;
        var spriteName = null;
        // @ts-ignore
        var anim = this.game.anvilAnimation;

        if (this.game.anvilRecipe || this.game.isAnvilChestpurple) {
          if (this.game.anvilRecipe === "powderquantum") {
            spriteName = "anvil-powder";
          } else {
            spriteName = "anvil-recipe";
          }
        } else if (this.game.isAnvilSuccess) {
          spriteName = "anvil-success";
        } else if (this.game.isAnvilFail || this.game.isAnvilChestred) {
          spriteName = "anvil-fail";
        } else if (this.game.isAnvilTransmute || this.game.isAnvilChestgreen) {
          spriteName = "anvil-transmute";
        } else if (this.game.isAnvilChestblue || this.game.isAnvilRuneword) {
          spriteName = "anvil-chestblue";
        }

        if (spriteName) {
          sprite = this.game.getSprite(spriteName);
        }

        if (sprite?.width && anim) {
          var os = this.upscaledRendering ? 1 : this.scale;
          var ds = this.upscaledRendering ? this.scale : 1;

          var { x: entityX, y: entityY } = entity;

          var frame = anim.currentFrame,
            s = this.scale,
            x = frame.x * os,
            y = frame.y * os,
            w = sprite.width * os,
            h = sprite.height * os,
            ts = -12,
            dx = entityX * s,
            dy = entityY * s,
            dw = w * ds,
            dh = h * ds;

          this.context.translate(0, ts * -ds);
          this.context.drawImage(sprite.image, x, y, w, h, 0, 0, dw, dh);
        }
      }

      if (entity instanceof Character && entity.isLevelup) {
        var sprite = this.game.getSprite("levelup");
        // @ts-ignore
        var anim = this.game.levelupAnimation;

        if (sprite?.width && anim) {
          var os = this.upscaledRendering ? 1 : this.scale;
          var ds = this.upscaledRendering ? this.scale : 1;
          var { x: entityX, y: entityY } = entity;

          var frame = anim.currentFrame,
            s = this.scale,
            x = frame.x * os,
            y = frame.y * os,
            w = sprite.width * os,
            h = sprite.height * os,
            ts = 16,
            dx = entityX * s,
            dy = entityY * s,
            dw = w * ds,
            dh = h * ds;

          this.context.translate(0, ts * -ds);
          this.context.drawImage(sprite.image, x, y, w, h, 0, 0, dw, dh);
          this.context.translate(0, ts * ds);
        }
      }

      if (entity instanceof Player && entity.defenseSkillName) {
        var sprite = this.game.getSprite(`skill-${entity.defenseSkillName}`);
        // @ts-ignore
        var anim =
          entity.defenseSkillName === "resistances"
            ? this.game.skillResistanceAnimation
            : this.game.defenseSkillAnimation;

        if (sprite?.width && anim) {
          var os = this.upscaledRendering ? 1 : this.scale;
          var ds = this.upscaledRendering ? this.scale : 1;
          // @ts-ignore
          var { x: entityX, y: entityY } = entity;

          var frame = anim.currentFrame,
            s = this.scale,
            x = frame.x * os,
            y = frame.y * os,
            w = sprite.width * os,
            h = sprite.height * os,
            ts = 16,
            dx = entityX * s,
            dy = entityY * s,
            dw = w * ds,
            dh = h * ds,
            ox = sprite.offsetX * s,
            oy = sprite.offsetY * s;

          this.context.drawImage(sprite.image, x, y, w, h, ox, oy, dw, dh);
        }
      }

      if (entity instanceof Player && typeof entity.castSkill === "number") {
        const skillName: SkillElement = Types.skillToNameMap[entity.castSkill];

        // Default sprite for lightning & cold cast
        var sprite =
          skillName === "cold" || skillName === "lightning"
            ? this.game.getSprite("skill-cast")
            : this.game.getSprite(`skill-cast-${Types.skillToNameMap[entity.castSkill]}`);
        // @ts-ignore
        var anim = this.game.skillCastAnimation;

        if (sprite?.width && anim) {
          var os = this.upscaledRendering ? 1 : this.scale;
          var ds = this.upscaledRendering ? this.scale : 1;
          // @ts-ignore
          var { x: entityX, y: entityY } = entity;

          var frame = anim.currentFrame,
            s = this.scale,
            x = frame.x * os,
            y = frame.y * os,
            w = sprite.width * os,
            h = sprite.height * os,
            ts = 16,
            dx = entityX * s,
            dy = entityY * s,
            dw = w * ds,
            dh = h * ds,
            ox = sprite.offsetX * s,
            oy = sprite.offsetY * s;

          this.context.drawImage(sprite.image, x, y, w, h, ox, oy, dw, dh);
        }
      }

      if (entity instanceof Player && typeof entity.curseId === "number") {
        var sprite;
        var anim;

        switch (entity.curseId) {
          case 0:
            sprite = this.game.getSprite("curse-health");
            anim = this.game.curseHealthAnimation;
            break;
          case 1: {
            sprite = this.game.getSprite("curse-resistance");
            anim = this.game.curseResistanceAnimation;
            break;
          }
        }

        if (sprite?.width && anim) {
          var os = this.upscaledRendering ? 1 : this.scale;
          var ds = this.upscaledRendering ? this.scale : 1;
          // @ts-ignore
          var { x: entityX, y: entityY } = entity;

          var frame = anim.currentFrame,
            s = this.scale,
            x = frame.x * os,
            y = frame.y * os,
            w = sprite.width * os,
            h = sprite.height * os,
            ts = 16,
            dx = entityX * s,
            dy = entityY * s,
            dw = w * ds,
            dh = h * ds,
            ox = sprite.offsetX * s,
            oy = sprite.offsetY * s;

          this.context.drawImage(sprite.image, x, y, w, h, ox, oy, dw, dh);
        }
      }

      if (entity instanceof Character && typeof entity.skillAnimation === "number") {
        var sprite = this.game.getSprite(`skill-${Types.skillToNameMap[entity.skillAnimation]}`);
        var anim = this.game[`skill${_.capitalize(Types.skillToNameMap[entity.skillAnimation])}Animation`];

        if (sprite?.width && anim) {
          var os = this.upscaledRendering ? 1 : this.scale;
          var ds = this.upscaledRendering ? this.scale : 1;
          // @ts-ignore
          var { x: entityX, y: entityY } = entity;

          var frame = anim.currentFrame,
            s = this.scale,
            x = frame.x * os,
            y = frame.y * os,
            w = sprite.width * os,
            h = sprite.height * os,
            ts = 16,
            dx = entityX * s,
            dy = entityY * s,
            dw = w * ds,
            dh = h * ds,
            ox = sprite.offsetX * s,
            oy = sprite.offsetY * s;

          this.context.drawImage(sprite.image, x, y, w, h, ox, oy, dw, dh);
        }
      }

      this.context.restore();

      if (entity.isFading) {
        this.context.restore();
      }
    }
  }

  drawEntities(dirtyOnly?: boolean) {
    var self = this;

    const entities = this.game.getForEachVisibleEntityByDepth();

    entities.forEach(entity => {
      if (entity.isLoaded) {
        if (dirtyOnly) {
          if (entity.isDirty) {
            self.drawEntity(entity);

            entity.isDirty = false;
            entity.oldDirtyRect = entity.dirtyRect;
            entity.dirtyRect = null;
          }
        } else {
          self.drawEntity(entity);
        }
      }
    });
  }

  drawDirtyEntities() {
    this.drawEntities(true);
  }

  clearDirtyRect(r) {
    this.context.clearRect(r.x, r.y, r.w, r.h);
  }

  clearDirtyRects() {
    var self = this;
    var count = 0;

    this.game.forEachVisibleEntityByDepth(function (entity) {
      if (entity.isDirty && entity.oldDirtyRect) {
        self.clearDirtyRect(entity.oldDirtyRect);
        count += 1;
      }
    });

    const animatedTileCallback = function (tile) {
      if (tile.isDirty) {
        self.clearDirtyRect(tile.dirtyRect);
        count += 1;
      }
    };

    this.game.forEachAnimatedTile(animatedTileCallback);
    this.game.forEachHighAnimatedTile(animatedTileCallback);

    if (this.game.clearTarget && this.lastTargetPos) {
      var last = this.lastTargetPos;
      var rect = this.getTargetBoundingRect(last.x, last.y);

      this.clearDirtyRect(rect);
      this.game.clearTarget = false;
      count += 1;
    }

    if (count > 0) {
      //console.debug("count:"+count);
    }
  }

  getEntityBoundingRect(entity) {
    var rect: any = {},
      s = this.scale,
      spr;

    if (entity instanceof Player && entity.hasWeapon()) {
      var weapon = this.game.getSprite(entity.getWeaponName());
      spr = weapon;
    } else {
      spr = entity.sprite;
    }

    if (spr) {
      rect.x = (entity.x + spr.offsetX - this.camera.x) * s;
      rect.y = (entity.y + spr.offsetY - this.camera.y) * s;
      rect.w = spr.width * s;
      rect.h = spr.height * s;
      rect.left = rect.x;
      rect.right = rect.x + rect.w;
      rect.top = rect.y;
      rect.bottom = rect.y + rect.h;
    }
    return rect;
  }

  getTileBoundingRect(tile) {
    var rect: any = {},
      gridW = this.game.map.width,
      s = this.scale,
      ts = this.tilesize,
      cellid = tile.index;

    rect.x = (getX(cellid + 1, gridW) * ts - this.camera.x) * s;
    rect.y = (Math.floor(cellid / gridW) * ts - this.camera.y) * s;
    rect.w = ts * s;
    rect.h = ts * s;
    rect.left = rect.x;
    rect.right = rect.x + rect.w;
    rect.top = rect.y;
    rect.bottom = rect.y + rect.h;

    return rect;
  }

  getTargetBoundingRect(x?: number, y?: number) {
    var rect: any = {},
      s = this.scale,
      ts = this.tilesize,
      tx = x || this.game.selectedX,
      ty = y || this.game.selectedY;

    rect.x = (tx * ts - this.camera.x) * s;
    rect.y = (ty * ts - this.camera.y) * s;
    rect.w = ts * s;
    rect.h = ts * s;
    rect.left = rect.x;
    rect.right = rect.x + rect.w;
    rect.top = rect.y;
    rect.bottom = rect.y + rect.h;

    return rect;
  }

  isIntersecting(rect1, rect2) {
    return !(
      rect2.left > rect1.right ||
      rect2.right < rect1.left ||
      rect2.top > rect1.bottom ||
      rect2.bottom < rect1.top
    );
  }

  drawEntityName(entity) {
    this.context.save();
    if (entity.name && entity instanceof Player) {
      const isSelf = entity.id === this.game.playerId;

      let color = isSelf ? "#fcda5c" : "white";
      if (!isSelf && entity?.partyId && this.game.player?.partyId === entity?.partyId) {
        color = "#35ee35";
      }

      // var name = entity.level ? "lv." + entity.level + " " + entity.name : entity.name;

      let entityName = "";
      if (this.game.player?.partyLeader?.id === entity.id) {
        entityName += "[P] ";
      }

      entityName += entity.name;

      this.drawText(entityName, (entity.x + 8) * this.scale, (entity.y + entity.nameOffsetY) * this.scale, true, color);
    }
    this.context.restore();
  }

  drawTerrain() {
    this.game.forEachVisibleTile((id, index) => {
      if (!this.game.map.isHighTile(id) && !this.game.map.isAnimatedTile(id)) {
        // Don't draw unnecessary tiles
        this.drawTile(this.background, id, index); // self.tileset, tilesetWidth, m.width, index);
      }
    }, 1);
  }

  drawAnimatedTiles(dirtyOnly?: boolean) {
    this.animatedTileCount = 0;
    this.game.forEachAnimatedTile(tile => {
      if (dirtyOnly) {
        if (tile.isDirty) {
          this.drawTile(this.context, tile.id, tile.index);
          tile.isDirty = false;
        }
      } else {
        this.drawTile(this.context, tile.id, tile.index);
        this.animatedTileCount += 1;
      }
    });
  }

  drawDirtyAnimatedTiles() {
    this.drawAnimatedTiles(true);
  }

  drawHighAnimatedTiles(dirtyOnly?: boolean) {
    this.highAnimatedTileCount = 0;
    this.game.forEachHighAnimatedTile(tile => {
      if (dirtyOnly) {
        if (tile.isDirty) {
          this.drawTile(this.context, tile.id, tile.index);
          tile.isDirty = false;
        }
      } else {
        this.drawTile(this.context, tile.id, tile.index);
        this.highAnimatedTileCount += 1;
      }
    });
  }

  drawHighTiles(ctx) {
    this.highTileCount = 0;
    this.game.forEachVisibleTile((id, index) => {
      if (this.game.map.isHighTile(id) && !this.game.map.isAnimatedTile(id)) {
        this.drawTile(ctx, id, index);
        this.highTileCount += 1;
      }
    }, 1);
  }

  drawBackground(ctx, color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawFPS() {
    var nowTime = new Date(),
      diffTime = nowTime.getTime() - this.lastTime.getTime();

    if (diffTime >= 1000) {
      this.realFPS = this.frameCount;
      this.frameCount = 0;
      this.lastTime = nowTime;
    }
    this.frameCount++;

    //this.drawText("FPS: " + this.realFPS + " / " + this.maxFPS, 30, 30, false);
    this.drawText("FPS: " + this.realFPS, 30, 30, false);
  }

  drawDebugInfo() {
    if (this.isDebugInfoVisible) {
      this.drawFPS();
      // this.drawText("A: " + this.animatedTileCount, 100, 30, false);
      // this.drawText("H: " + this.highTileCount, 140, 30, false);
    }
  }

  drawCombatInfo() {
    var self = this;

    switch (this.scale) {
      case 2:
        this.setFontSize(20);
        break;
      case 3:
        this.setFontSize(30);
        break;
    }
    this.game.infoManager.forEachInfo(function (info) {
      self.context.save();
      self.context.globalAlpha = info.opacity;
      self.drawText(
        info.value,
        (info.x + 8) * self.scale,
        Math.floor(info.y * self.scale),
        true,
        info.fillColor,
        info.strokeColor,
      );
      self.context.restore();
    });
    this.initFont();
  }

  setCameraView(ctx) {
    ctx.translate(-this.camera.x * this.scale, -this.camera.y * this.scale);
  }

  clearScreen(ctx) {
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  loadPlayerImage() {
    const hasShield = this.game.player.shieldName;
    const hasCape = this.game.player.cape;
    const totalCount = 3 + (hasShield ? 1 : 0) + (hasCape ? 1 : 0);
    let currentCount = 0;

    const helmSprite = this.game.getSprite(this.game.player.getHelmName());
    const weaponSprite = this.game.getSprite(this.game.player.getWeaponName());
    const armorSprite = this.game.player.getArmorSprite();

    let shieldSprite;
    let capeSprite;

    if (this.game.player.shieldName) {
      shieldSprite = this.game.getSprite(this.game.player.shieldName);
    }
    if (this.game.player.cape) {
      capeSprite = this.game.getSprite("cape");
    }

    if (helmSprite?.image?.width) {
      currentCount += 1;
    }
    if (weaponSprite?.image?.width) {
      currentCount += 1;
    }
    if (armorSprite?.image?.width) {
      currentCount += 1;
    }
    if (hasShield && shieldSprite?.image?.width) {
      currentCount += 1;
    }
    if (hasCape && capeSprite?.image?.width) {
      currentCount += 1;
    }

    if (totalCount === currentCount) {
      this.getPlayerImage({ weaponSprite, helmSprite, armorSprite, shieldSprite, capeSprite });
    } else {
      setTimeout(() => this.loadPlayerImage(), 250);
    }
  }

  getPlayerImage({ weaponSprite, helmSprite, armorSprite, shieldSprite, capeSprite }) {
    var canvas = document.createElement("canvas"),
      ctx = canvas.getContext("2d"),
      os = this.upscaledRendering ? 1 : this.scale,
      // sprite = this.game.player.getArmorSprite(),
      spriteAnim = armorSprite.animationData["idle_down"],
      // character
      // cape
      // helm
      row = spriteAnim.row,
      w = armorSprite.width * os,
      h = armorSprite.height * os,
      y = row * h,
      // weapon
      ww = weaponSprite.width * os,
      wh = weaponSprite.height * os,
      wy = wh * row,
      offsetX = (weaponSprite.offsetX - armorSprite.offsetX) * os + 2,
      offsetY = (weaponSprite.offsetY - armorSprite.offsetY) * os + 2,
      // shadow
      shadow = this.game.shadows["small"],
      sw = shadow.width * os,
      sh = shadow.height * os,
      ox = -armorSprite.offsetX * os + 2,
      oy = -armorSprite.offsetY * os + 4;

    canvas.width = w;
    canvas.height = h;

    let helmImage = helmSprite.image;
    if (
      [
        "helmhorned",
        "helmfrozen",
        "helmdiamond",
        "helmemerald",
        "helmexecutioner",
        "helmtemplar",
        "helmdragon",
        "helmmoon",
        "helmdemon",
        "helmmystical",
        "helmimmortal",
        // "helmpaladin",
      ].includes(this.game.player.helmName) &&
      this.game.player.helmBonus?.length
    ) {
      helmImage = helmSprite.imageunique;
    }

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(shadow.image, 0, 0, sw, sh, ox, oy, sw, sh);
    if (this.game.player.cape) {
      var capeImage = capeSprite.image;
      if (this.game.player.capeLevel >= 7) {
        capeImage = capeSprite.image7;
      }
      ctx.drawImage(capeImage, 0, y, w, h, 2, 2, w, h);
    }
    ctx.drawImage(armorSprite.image, 0, y, w, h, 2, 2, w, h);
    ctx.drawImage(helmImage, 0, y, w, h, 2, 2, w, h);
    if (this.game.player.shieldName) {
      ctx.drawImage(shieldSprite.image, 0, y, w, h, 2, 2, w, h);
    }
    ctx.drawImage(weaponSprite.image, 0, wy, ww, wh, offsetX, offsetY, ww, wh);

    this.game.storage.savePlayer(canvas.toDataURL("image/png"));
  }

  renderStaticCanvases() {
    this.background.save();
    this.setCameraView(this.background);
    this.drawTerrain();
    this.background.restore();

    if (this.mobile || this.tablet) {
      this.clearScreen(this.foreground);
      this.foreground.save();
      this.setCameraView(this.foreground);
      this.drawHighTiles(this.foreground);
      this.foreground.restore();
    }
  }

  renderFrame() {
    if (this.mobile || this.tablet) {
      this.renderFrameMobile();
    } else {
      this.renderFrameDesktop();
    }
  }

  renderFrameDesktop() {
    this.clearScreen(this.context);

    this.context.save();
    this.setCameraView(this.context);
    this.drawAnimatedTiles();

    if (this.game.started && this.game.cursorVisible) {
      this.drawSelectedCell();
      this.drawTargetCell();
    }

    //this.drawOccupiedCells();
    this.drawPathingCells();
    this.drawEntities();
    this.drawCombatInfo();
    this.drawHighTiles(this.context);
    this.drawHighAnimatedTiles();
    this.context.restore();

    // Overlay UI elements
    if (this.game.cursorVisible) this.drawCursor();

    this.drawDebugInfo();
  }

  renderFrameMobile() {
    this.clearDirtyRects();
    this.preventFlickeringBug();

    this.context.save();
    this.setCameraView(this.context);

    this.drawDirtyAnimatedTiles();
    this.drawSelectedCell();
    this.drawDirtyEntities();
    this.context.restore();
  }

  preventFlickeringBug() {
    if (this.fixFlickeringTimer.isOver(this.game.currentTime)) {
      this.background.fillRect(0, 0, 0, 0);
      this.context.fillRect(0, 0, 0, 0);
      this.foreground.fillRect(0, 0, 0, 0);
    }
  }
}

var getX = function (id, w) {
  if (id == 0) {
    return 0;
  }
  return id % w == 0 ? w - 1 : (id % w) - 1;
};

export default Renderer;
