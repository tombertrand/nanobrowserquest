import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";
import Entity from "./entity";
import Timer from "./timer";
import Transition from "./transition";

class Character extends Entity {
  nextGridX: number;
  nextGridY: number;
  orientation: any;
  atkSpeed: number;
  raiseSpeed: any;
  moveSpeed: number;
  walkSpeed: number;
  idleSpeed: number;
  movement: Transition;
  path: any;
  newDestination: any;
  adjacentTiles: {};
  target: any;
  unconfirmedTarget: any;
  attackers: {};
  hitPoints: number;
  maxHitPoints: number;
  isDead: boolean;
  raisingMode: boolean;
  attackingMode: boolean;
  followingMode: boolean;
  inspecting: any;
  isLevelup: boolean;
  auras: string[];
  currentAnimation: any;
  flipSpriteX: any;
  flipSpriteY: any;
  kind: any;
  aggroRange: any;
  destination: any;
  request_path_callback: any;
  id: any;
  start_pathing_callback: any;
  stop_pathing_callback: any;
  step: any;
  before_step_callback: any;
  interrupted: any;
  step_callback: any;
  gridX: any;
  gridY: any;
  raisingModeTimeout: any;
  aggro_callback: any;
  checkaggro_callback: any;
  death_callback: any;
  settarget_callback: any;
  removetarget_callback: any;
  attackCooldown: any;
  raiseCooldown: any;
  hasmoved_callback: any;
  sprite: any;
  hurting: any;
  normalSprite: any;
  isDying: any;
  previousTarget: any;
  atkRate: number;
  raiseRate: number;

  constructor(id, kind) {
    super(id, kind);

    // Position and orientation
    this.nextGridX = -1;
    this.nextGridY = -1;
    this.orientation = Types.Orientations.DOWN;

    // Speeds
    this.atkSpeed = 50;
    this.raiseSpeed = null;
    this.moveSpeed = 120;
    this.walkSpeed = 100;
    this.idleSpeed = 450;
    this.setAttackRate(800);

    // Pathing
    this.movement = new Transition();
    this.path = null;
    this.newDestination = null;
    this.adjacentTiles = {};

    // Combat
    this.target = null;
    this.unconfirmedTarget = null;
    this.attackers = {};

    // Health
    this.hitPoints = 0;
    this.maxHitPoints = 0;

    // Modes
    this.isDead = false;
    this.raisingMode = false;
    this.attackingMode = false;
    this.followingMode = false;

    this.inspecting = null;
    this.isLevelup = false;
    this.auras = [];
  }

  clean() {
    this.forEachAttacker(function (attacker) {
      attacker.disengage();
      attacker.idle();
    });
  }

  setMaxHitPoints(hp) {
    this.maxHitPoints = hp;
    this.hitPoints = hp;
  }

  setDefaultAnimation() {
    this.idle();
  }

  hasWeapon() {
    return false;
  }

  hasShadow() {
    return true;
  }

  setLevelup() {
    this.isLevelup = true;
    setTimeout(() => {
      this.isLevelup = false;
    }, 1500);
  }

  animate(animation, speed, count = 0, onEndCount?: () => void) {
    var oriented = ["atk", "walk", "idle", "raise"],
      o = this.orientation;

    if (!(this.currentAnimation && this.currentAnimation.name === "death")) {
      // don't change animation if the character is dying
      this.flipSpriteX = false;
      this.flipSpriteY = false;

      if (_.indexOf(oriented, animation) >= 0) {
        animation += "_" + (o === Types.Orientations.LEFT ? "right" : Types.getOrientationAsString(o));
        this.flipSpriteX = this.orientation === Types.Orientations.LEFT ? true : false;
      }

      this.setAnimation(animation, speed, count, onEndCount);
    }
  }

  turnTo(orientation) {
    this.orientation = orientation;
    // @NOTE Removing idle as it prevents the attack animation
    // this.idle();
  }

  setOrientation(orientation) {
    if (orientation) {
      this.orientation = orientation;
    }
  }

  idle(orientation?: any) {
    this.setOrientation(orientation);
    this.animate("idle", this.idleSpeed);
  }

  hit(orientation) {
    this.setOrientation(orientation);
    this.animate("atk", this.atkSpeed, 1);
  }

  walk(orientation) {
    this.setOrientation(orientation);
    this.animate("walk", this.walkSpeed);
  }

  raise(orientation) {
    this.setOrientation(orientation);
    this.animate("raise", this.raiseSpeed, 1);
  }

  moveTo_(x, y) {
    if (this.kind === Types.Entities.NECROMANCER) {
      if (this.isRaising()) {
        this.aggroRange = 10;
        return;
      }
    }

    this.destination = { gridX: x, gridY: y };
    this.adjacentTiles = {};

    if (this.isMoving()) {
      this.continueTo(x, y);
    } else {
      var path = this.requestPathfindingTo(x, y);

      this.followPath(path);
    }
  }

  requestPathfindingTo(x, y) {
    if (this.request_path_callback) {
      return this.request_path_callback(x, y);
    } else {
      console.error(this.id + " couldn't request pathfinding to " + x + ", " + y);
      return [];
    }
  }

  onRequestPath(callback) {
    this.request_path_callback = callback;
  }

  onStartPathing(callback) {
    this.start_pathing_callback = callback;
  }

  onStopPathing(callback) {
    this.stop_pathing_callback = callback;
  }

  followPath(path) {
    if (path.length > 1) {
      // Length of 1 means the player has clicked on himself
      this.path = path;
      this.step = 0;

      if (this.followingMode) {
        // following a character
        path.pop();
      }

      if (this.start_pathing_callback) {
        this.start_pathing_callback(path);
      }
      this.nextStep();
    }
  }

  continueTo(x, y) {
    this.newDestination = { x: x, y: y };
  }

  updateMovement() {
    var p = this.path;
    var i = this.step;

    if (p[i][0] < p[i - 1][0]) {
      this.walk(Types.Orientations.LEFT);
    }
    if (p[i][0] > p[i - 1][0]) {
      this.walk(Types.Orientations.RIGHT);
    }
    if (p[i][1] < p[i - 1][1]) {
      this.walk(Types.Orientations.UP);
    }
    if (p[i][1] > p[i - 1][1]) {
      this.walk(Types.Orientations.DOWN);
    }
  }

  updatePositionOnGrid() {
    this.setGridPosition(this.path[this.step][0], this.path[this.step][1]);
  }

  nextStep() {
    var stop = false,
      x,
      y,
      path;

    if (this.isMoving()) {
      if (this.before_step_callback) {
        this.before_step_callback();
      }

      this.updatePositionOnGrid();
      this.checkAggro();

      if (this.interrupted) {
        // if Character.stop() has been called
        stop = true;
        this.interrupted = false;
      } else {
        if (this.hasNextStep()) {
          this.nextGridX = this.path[this.step + 1][0];
          this.nextGridY = this.path[this.step + 1][1];
        }

        if (this.step_callback) {
          this.step_callback();
        }

        if (this.hasChangedItsPath()) {
          x = this.newDestination.x;
          y = this.newDestination.y;
          path = this.requestPathfindingTo(x, y);

          this.newDestination = null;
          if (path.length < 2) {
            stop = true;
          } else {
            this.followPath(path);
          }
        } else if (this.hasNextStep()) {
          this.step += 1;
          this.updateMovement();
        } else {
          stop = true;
        }
      }

      if (stop) {
        // Path is complete or has been interrupted
        this.path = null;

        if (this.kind !== Types.Entities.NECROMANCER) {
          this.idle();
        }

        if (this.stop_pathing_callback) {
          this.stop_pathing_callback({ x: this.gridX, y: this.gridY });
        }
      }
    }
  }

  onBeforeStep(callback) {
    this.before_step_callback = callback;
  }

  onStep(callback) {
    this.step_callback = callback;
  }

  isMoving() {
    return !(this.path === null);
  }

  setRaisingMode() {
    if (this.raisingModeTimeout) return;

    this.raisingMode = true;

    this.raisingModeTimeout = setTimeout(() => {
      this.raisingMode = false;
      this.raisingModeTimeout = null;
    }, this.raiseRate);
  }

  isRaising() {
    return this.raisingMode;
  }

  hasNextStep() {
    return this.path.length - 1 > this.step;
  }

  hasChangedItsPath() {
    return !(this.newDestination === null);
  }

  isNear(character, distance) {
    var dx,
      dy,
      near = false;

    dx = Math.abs(this.gridX - character.gridX);
    dy = Math.abs(this.gridY - character.gridY);

    if (dx <= distance && dy <= distance) {
      near = true;
    }
    return near;
  }

  onAggro(callback) {
    this.aggro_callback = callback;
  }

  onCheckAggro(callback) {
    this.checkaggro_callback = callback;
  }

  checkAggro() {
    if (this.checkaggro_callback) {
      this.checkaggro_callback();
    }
  }

  aggro(character) {
    if (this.aggro_callback) {
      this.aggro_callback(character);
    }
  }

  onDeath(callback) {
    this.death_callback = callback;
  }

  /**
   * Changes the character's orientation so that it is facing its target.
   */
  lookAtTarget() {
    if (this.target) {
      this.turnTo(this.getOrientationTo(this.target));
    }
  }

  /**
   *
   */
  go(x, y) {
    if (this.isAttacking()) {
      this.disengage();
    } else if (this.followingMode) {
      this.followingMode = false;
      this.target = null;
    }
    this.moveTo_(x, y);
  }

  /**
   * Makes the character follow another one.
   */
  follow(entity) {
    if (entity) {
      this.followingMode = true;
      this.moveTo_(entity.gridX, entity.gridY);
    }
  }

  /**
   * Stops a moving character.
   */
  stop() {
    if (this.isMoving()) {
      this.interrupted = true;
    }
  }

  /**
   * Makes the character attack another character. Same as Character.follow but with an auto-attacking behavior.
   * @see Character.follow
   */
  engage(character) {
    this.attackingMode = true;
    this.setTarget(character);
    this.follow(character);
  }

  disengage() {
    this.attackingMode = false;
    this.followingMode = false;
    this.removeTarget();
  }

  /**
   * Returns true if the character is currently attacking.
   */
  isAttacking() {
    return this.attackingMode;
  }

  /**
   * Gets the right orientation to face a target character from the current position.
   * Note:
   * In order to work properly, this method should be used in the following
   * situation :
   *    S
   *  S T S
   *    S
   * (where S is self, T is target character)
   *
   * @param {Character} character The character to face.
   * @returns {String} The orientation.
   */
  getOrientationTo(character) {
    if (this.gridX < character.gridX) {
      return Types.Orientations.RIGHT;
    } else if (this.gridX > character.gridX) {
      return Types.Orientations.LEFT;
    } else if (this.gridY > character.gridY) {
      return Types.Orientations.UP;
    } else {
      return Types.Orientations.DOWN;
    }
  }

  /**
   * Returns true if this character is currently attacked by a given character.
   * @param {Character} character The attacking character.
   * @returns {Boolean} Whether this is an attacker of this character.
   */
  isAttackedBy(character) {
    return character.id in this.attackers;
  }

  /**
   * Registers a character as a current attacker of this one.
   * @param {Character} character The attacking character.
   */
  addAttacker(character) {
    if (!this.isAttackedBy(character)) {
      this.attackers[character.id] = character;
    } else {
      console.error(this.id + " is already attacked by " + character.id);
    }
  }

  /**
   * Unregisters a character as a current attacker of this one.
   * @param {Character} character The attacking character.
   */
  removeAttacker(character) {
    if (this.isAttackedBy(character)) {
      delete this.attackers[character.id];
    } else {
      // console.error(this.id + " is not attacked by " + character.id);
    }
  }

  /**
   * Loops through all the characters currently attacking this one.
   * @param {Function} callback Function which must accept one character argument.
   */
  forEachAttacker(callback) {
    _.each(this.attackers, function (attacker) {
      // @TODO Figure out why entering though door, mob follow hater from hater perspective but is idle from the second player perspective
      callback(attacker);
    });
  }

  /**
   * Sets this character's attack target. It can only have one target at any time.
   * @param {Character} character The target character.
   */
  setTarget(character) {
    if (this.target !== character) {
      // If it's not already set as the target
      if (this.hasTarget()) {
        this.removeTarget(); // Cleanly remove the previous one
      }
      this.unconfirmedTarget = null;
      this.target = character;

      if (this.settarget_callback) {
        var targetName = Types.getKindAsString(character.kind);
        this.settarget_callback(character, targetName);
      }
    } else {
      console.debug(character.id + " is already the target of " + this.id);
    }
  }

  onSetTarget(callback) {
    this.settarget_callback = callback;
  }

  showTarget(character) {
    if (this.inspecting !== character) {
      this.inspecting = character;
      if (this.settarget_callback) {
        var targetName = Types.getKindAsString(character.kind);
        this.settarget_callback(character, targetName, true);
      }
    }
  }

  /**
   * Removes the current attack target.
   */
  removeTarget(withoutCallback?: boolean) {
    if (this.target) {
      if (this.target instanceof Character) {
        this.target.removeAttacker(this);
      }
      if (this.removetarget_callback && !withoutCallback) {
        this.removetarget_callback(this.target.id);
      }
      this.target = null;
    }
  }

  onRemoveTarget(callback) {
    this.removetarget_callback = callback;
  }

  /**
   * Returns true if this character has a current attack target.
   * @returns {Boolean} Whether this character has a target.
   */
  hasTarget() {
    return !(this.target === null);
  }

  /**
   * Marks this character as waiting to attack a target.
   * By sending an "attack" message, the server will later confirm (or not)
   * that this character is allowed to acquire this target.
   *
   * @param {Character} character The target character
   */
  waitToAttack(character) {
    this.unconfirmedTarget = character;
  }

  /**
   * Returns true if this character is currently waiting to attack the target character.
   * @param {Character} character The target character.
   * @returns {Boolean} Whether this character is waiting to attack.
   */
  isWaitingToAttack(character) {
    return this.unconfirmedTarget === character;
  }

  /**
   *
   */
  canAttack(time) {
    if (this.canReachTarget() && this.attackCooldown.isOver(time)) {
      return true;
    }
    return false;
  }

  canRaise(time) {
    if (this.raiseCooldown.isOver(time)) {
      // this.isAggressive = true;
      // this.aggroRange = 3;
      return true;
    }
    return false;
  }

  canReachTarget() {
    if (this.hasTarget() && this.isAdjacentNonDiagonal(this.target)) {
      return true;
    }
    return false;
  }

  /**
   *
   */
  die() {
    this.removeTarget();
    this.isDead = true;

    if (this.death_callback) {
      this.death_callback();
    }
  }

  onHasMoved(callback) {
    this.hasmoved_callback = callback;
  }

  hasMoved() {
    this.setDirty();
    if (this.hasmoved_callback) {
      this.hasmoved_callback(this);
    }
  }

  hurt() {
    this.stopHurting();
    // @NOTE directly go for the whiteSprite
    this.sprite = this.sprite.whiteSprite;
    this.hurting = setTimeout(this.stopHurting.bind(this), 75);
  }

  stopHurting() {
    this.sprite = this.normalSprite;
    clearTimeout(this.hurting);
  }

  setAttackRate(rate) {
    this.attackCooldown = new Timer(rate);
  }
}

export default Character;