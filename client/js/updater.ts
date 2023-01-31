import { Types } from "../../shared/js/gametypes";
import Character from "./character";
import Game from "./game";
import Spell from "./spell";
import Timer from "./timer";

class Updater {
  game: Game;
  playerAggroTimer: Timer;
  isFading: boolean;

  constructor(game: Game) {
    this.game = game;
    this.playerAggroTimer = new Timer(1000);
    this.isFading = false;
  }

  update() {
    this.updateZoning();
    this.updateCharacters();
    this.updatePlayerAggro();
    this.updateTransitions();
    this.updateAnimations();
    this.updateAnimatedTiles();
    this.updateHighAnimatedTiles();
    this.updateChatBubbles();
    this.updateInfos();
    this.updateKeyboardMovement();
  }

  updateCharacters() {
    var self = this;

    this.game.forEachEntity(function (entity) {
      var isCharacter = entity instanceof Character;

      if (entity.isLoaded) {
        if (isCharacter) {
          self.updateCharacter(entity);
          self.game.onCharacterUpdate(entity);
        }
        if (entity.isFading) {
          self.updateEntityFading(entity);
        }
      }
    });
  }

  updatePlayerAggro() {
    const t = this.game.currentTime;
    const player = this.game.player;

    // Check player aggro every 1s when not moving nor attacking
    if (player && !player.isMoving() && !player.isDead && this.playerAggroTimer.isOver(t)) {
      player.checkAggro();
    }
  }

  updateEntityFading(entity) {
    if (entity && entity.isFading) {
      var duration = 1000;
      var t = this.game.currentTime;
      var dt = t - entity.startFadingTime;

      if (dt > duration) {
        this.isFading = false;
        entity.fadingAlpha = 1;
      } else {
        entity.fadingAlpha = dt / duration;
      }
    }
  }

  updateTransitions() {
    var self = this,
      m = null,
      z = this.game.currentZoning;

    this.game.forEachEntity(function (entity) {
      if (!entity || !entity.movement) return;

      m = entity.movement;
      if (m) {
        if (m.inProgress) {
          m.step(self.game.currentTime);
        }
      }
    });

    if (z) {
      if (z.inProgress) {
        z.step(this.game.currentTime);
      }
    }
  }

  updateZoning() {
    var g = this.game,
      c = g.camera,
      z = g.currentZoning,
      ts = 16,
      // @NOTE Unfortunately unable to fix the camera transition when multiple queues when the speed is greater than 350ms
      speed = 180;

    var endValue;
    var offset;

    if (z && z.inProgress === false) {
      var orientation = this.game.zoningOrientation,
        startValue = (endValue = offset = 0),
        updateFunc = null,
        endFunc = null;

      if (orientation === Types.Orientations.LEFT || orientation === Types.Orientations.RIGHT) {
        offset = (c.gridW - 2) * ts;
        startValue = orientation === Types.Orientations.LEFT ? c.x - ts : c.x + ts;
        endValue = orientation === Types.Orientations.LEFT ? c.x - offset : c.x + offset;
        updateFunc = function (x) {
          c.setPosition(x, c.y);
          g.initAnimatedTiles();
          g.renderer.renderStaticCanvases();
        };
        endFunc = function () {
          c.setPosition(z.endValue, c.y);
          g.endZoning();
        };
      } else if (orientation === Types.Orientations.UP || orientation === Types.Orientations.DOWN) {
        offset = (c.gridH - 2) * ts;
        startValue = orientation === Types.Orientations.UP ? c.y - ts : c.y + ts;
        endValue = orientation === Types.Orientations.UP ? c.y - offset : c.y + offset;
        updateFunc = function (y) {
          c.setPosition(c.x, y);
          g.initAnimatedTiles();
          g.renderer.renderStaticCanvases();
        };
        endFunc = function () {
          c.setPosition(c.x, z.endValue);
          g.endZoning();
        };
      }

      z.start(this.game.currentTime, updateFunc, endFunc, startValue, endValue, speed);
    }
  }

  updateCharacter(c) {
    // Estimate of the movement distance for one update
    var tick = Math.round(16 / Math.round(c.moveSpeed / (1000 / this.game.renderer.FPS)));

    // Handle spell instances separately.
    // https://github.com/Kaetram/Kaetram-Open/blob/b8b5e156aff5fb7e8b3da780122aa734bb95a8a9/packages/client/src/entity/objects/projectile.ts
    if (c instanceof Spell && c.target) {
      let mDistance = c.moveSpeed * c.getTimeDiff(),
        dx = c.target.x - c.x, // delta x current position to target
        dy = c.target.y - c.y, // delta y current position to target
        tDistance = Math.sqrt(dx * dx + dy * dy), // pythagorean theorem uwu
        amount = mDistance / tDistance;

      if (amount > 1) amount = 1;

      if (!c.isDead) {
        // Increment the projectile's position.
        c.x += dx * amount;
        c.y += dy * amount;
      }

      if (!c.isDead && this.game.player) {
        const isPlayerHit = Math.abs(this.game.player.x - c.x) <= 8 && Math.abs(this.game.player.y - c.y) <= 8;
        const isGridOrAnyPlayerHit = !isPlayerHit
          ? this.game.pathingGrid[Math.round(c.y / 16)][Math.round(c.x / 16)] &&
            (this.game.isPlayerAt(Math.round(c.x / 16), Math.round(c.y / 16)) ||
              !this.game.getEntityAt(Math.round(c.x / 16), Math.round(c.y / 16))?.id)
          : // this.game.getEntityAt(Math.round(c.x / 16), Math.round(c.y / 16))?.id !== c.casterId
            false;

        if (isPlayerHit) {
          this.game.makePlayerHurtFromSpell(c);
        }
        if (isPlayerHit || isGridOrAnyPlayerHit || tDistance < 1) {
          c.die();
        }
      }

      c.lastUpdate = this.game.currentTime;

      return;
    }

    if (c.isMoving() && c.movement.inProgress === false) {
      if (c.orientation === Types.Orientations.LEFT) {
        c.movement.start(
          this.game.currentTime,
          function (x) {
            c.x = x;
            c.hasMoved();
          },
          function () {
            c.x = c.movement.endValue;
            c.hasMoved();
            c.nextStep();
          },
          c.x - tick,
          c.x - 16,
          c.moveSpeed,
        );
      } else if (c.orientation === Types.Orientations.RIGHT) {
        c.movement.start(
          this.game.currentTime,
          function (x) {
            c.x = x;
            c.hasMoved();
          },
          function () {
            c.x = c.movement.endValue;
            c.hasMoved();
            c.nextStep();
          },
          c.x + tick,
          c.x + 16,
          c.moveSpeed,
        );
      } else if (c.orientation === Types.Orientations.UP) {
        c.movement.start(
          this.game.currentTime,
          function (y) {
            c.y = y;
            c.hasMoved();
          },
          function () {
            c.y = c.movement.endValue;
            c.hasMoved();
            c.nextStep();
          },
          c.y - tick,
          c.y - 16,
          c.moveSpeed,
        );
      } else if (c.orientation === Types.Orientations.DOWN) {
        c.movement.start(
          this.game.currentTime,
          function (y) {
            c.y = y;
            c.hasMoved();
          },
          function () {
            c.y = c.movement.endValue;
            c.hasMoved();
            c.nextStep();
          },
          c.y + tick,
          c.y + 16,
          c.moveSpeed,
        );
      } else if (c.orientation === Types.Orientations.DOWN_LEFT) {
        c.movement.start(
          this.game.currentTime,
          function (x, y) {
            c.x = x;
            c.y = y;
            c.hasMoved();
          },
          function () {
            c.x = c.movement.endValue;
            c.y = c.movement.endValue1;
            c.hasMoved();
            c.nextStep();
          },
          c.x - tick,
          c.x - 16,
          c.moveSpeed,
          c.y + tick,
          c.y + 16,
        );
      } else if (c.orientation === Types.Orientations.DOWN_RIGHT) {
        c.movement.start(
          this.game.currentTime,
          function (x, y) {
            c.x = x;
            c.y = y;
            c.hasMoved();
          },
          function () {
            c.x = c.movement.endValue;
            c.y = c.movement.endValue1;
            c.hasMoved();
            c.nextStep();
          },
          c.x + tick,
          c.x + 16,
          c.moveSpeed,
          c.y + tick,
          c.y + 16,
        );
      } else if (c.orientation === Types.Orientations.UP_LEFT) {
        c.movement.start(
          this.game.currentTime,
          function (x, y) {
            c.x = x;
            c.y = y;
            c.hasMoved();
          },
          function () {
            c.x = c.movement.endValue;
            c.y = c.movement.endValue1;
            c.hasMoved();
            c.nextStep();
          },
          c.x - tick,
          c.x - 16,
          c.moveSpeed,
          c.y - tick,
          c.y - 16,
        );
      } else if (c.orientation === Types.Orientations.UP_RIGHT) {
        c.movement.start(
          this.game.currentTime,
          function (x, y) {
            c.x = x;
            c.y = y;
            c.hasMoved();
          },
          function () {
            c.x = c.movement.endValue;
            c.y = c.movement.endValue1;
            c.hasMoved();
            c.nextStep();
          },
          c.x + tick,
          c.x + 16,
          c.moveSpeed,
          c.y - tick,
          c.y - 16,
        );
      }
    }
  }

  updateKeyboardMovement() {
    if (!this.game.player || this.game.player.isMoving()) return;

    var game = this.game;
    var player = this.game.player;

    var pos = {
      x: player.gridX,
      y: player.gridY,
    };

    if (player.moveUp) {
      pos.y -= 1;
      game.keys(pos);
    } else if (player.moveDown) {
      pos.y += 1;
      game.keys(pos);
    } else if (player.moveRight) {
      pos.x += 1;
      game.keys(pos);
    } else if (player.moveLeft) {
      pos.x -= 1;
      game.keys(pos);
    }
  }

  updateAnimations() {
    var t = this.game.currentTime;

    this.game.forEachEntity(function (entity) {
      var anim = entity.currentAnimation;

      if (anim) {
        if (anim.update(t)) {
          entity.setDirty();
        }
      }
    });

    this.game.sparksAnimation?.update(t);
    this.game.targetAnimation?.update(t);
    this.game.levelupAnimation?.update(t);
    this.game.drainLifeAnimation?.update(t);
    this.game.thunderstormAnimation?.update(t);
    this.game.highHealthAnimation?.update(t);
    this.game.freezeAnimation?.update(t);
    this.game.anvilAnimation?.update(t);
    this.game.defenseSkillAnimation?.update(t);
    this.game.skillResistanceAnimation?.update(t);
    this.game.skillCastAnimation?.update(t);
    this.game.skillMagicAnimation?.update(t);
    this.game.skillFlameAnimation?.update(t);
    this.game.skillLightningAnimation?.update(t);
    this.game.skillColdAnimation?.update(t);
    this.game.skillPoisonAnimation?.update(t);
    this.game.cursePreventRegenerateHealthAnimation?.update(t);
    this.game.weaponEffectAnimation?.update(t);
  }

  updateAnimatedTiles(isHighTile = false) {
    var self = this;
    var t = this.game.currentTime;

    const callback = function (tile) {
      if (tile.animate(t)) {
        tile.isDirty = true;
        tile.dirtyRect = self.game.renderer.getTileBoundingRect(tile);

        if (self.game.renderer.mobile || self.game.renderer.tablet) {
          self.game.checkOtherDirtyRects(tile.dirtyRect, tile, tile.x, tile.y);
        }
      }
    };

    if (isHighTile) {
      this.game.forEachHighAnimatedTile(callback);
    } else {
      this.game.forEachAnimatedTile(callback);
    }
  }

  updateHighAnimatedTiles() {
    this.updateAnimatedTiles(true);
  }

  updateChatBubbles() {
    var t = this.game.currentTime;

    this.game.bubbleManager.update(t);
  }

  updateInfos() {
    var t = this.game.currentTime;

    this.game.infoManager.update(t);
  }
}

export default Updater;
