import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";
import { randomInt } from "../../shared/js/utils";
import Entity from "./entity";
import Timer from "./timer";
import Transition from "./transition";

class Character extends Entity {
  nextGridX: number;
  nextGridY: number;
  orientation: number;
  capeOrientation: number;
  atkSpeed: number;
  raiseSpeed: number;
  raise2Speed: number;
  moveSpeed: number;
  walkSpeed: number;
  idleSpeed: number;
  originalAtkSpeed: number;
  originalMoveSpeed: number;
  originalWalkSpeed: number;
  originalIdleSpeed: number;
  movement: Transition;
  path: any;
  newDestination: any;
  adjacentTiles: {};
  target: any;
  skillTargetId: number;
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
  castSkill: number | null;
  skillAnimation: number;
  skillAnimationTimeout: NodeJS.Timeout;
  auras: Auras[];
  defenseSkillName: DefenseSkills;
  attackSkillName: AttackSkills;
  defenseSkillAnimationTimeout: any;
  currentAnimation: any;
  flipSpriteX: any;
  flipSpriteY: any;
  kind: any;
  aggroRange: number;
  castRange?: number;
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
  isFrozen: boolean;
  frozenTimeout: NodeJS.Timeout;
  isSlowed: boolean;
  slowedTimeout: NodeJS.Timeout;
  isPoisoned: boolean;
  poisonedTimeout: NodeJS.Timeout;
  resistances: { [key: string]: { display: string; percentage: number } };
  type: "mob" | "player" | "npc" | "spell" | "pet";
  curseId: number;
  cursedTimeout: NodeJS.Timeout;
  spawnCharacterCoords: { x: number; y: number };

  constructor(id, kind) {
    super(id, kind);

    // Position and orientation
    this.nextGridX = -1;
    this.nextGridY = -1;
    this.orientation = Types.Orientations.DOWN;

    // Speeds
    this.atkSpeed = Types.DEFAULT_ATTACK_ANIMATION_SPEED;
    this.raiseSpeed = null;
    this.moveSpeed = 120;
    this.walkSpeed = 100;
    this.idleSpeed = 450;
    this.setAttackRate(Types.DEFAULT_ATTACK_SPEED);

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

  setCastSkill(skill) {
    this.castSkill = skill;
    setTimeout(() => {
      this.castSkill = null;
    }, 850);
  }

  setSkillAnimation(skill) {
    this.skillAnimation = skill;
    clearTimeout(this.skillAnimationTimeout);
    this.skillAnimationTimeout = setTimeout(() => {
      this.skillAnimation = null;
    }, Types.attackSkillDurationMap[skill]());
  }

  resetDefenseSkillAnimation() {
    this.defenseSkillName = null;
    clearTimeout(this.defenseSkillAnimationTimeout);
  }

  // resetAttackSkillAnimation() {
  //   this.attackSkillName = null;
  //   clearTimeout(this.attackSkillAnimationTimeout);
  // }

  setDefenseSkillAnimation(skillName, delay = 0) {
    this.resetDefenseSkillAnimation();

    this.defenseSkillName = skillName;
    this.defenseSkillAnimationTimeout = setTimeout(() => {
      this.defenseSkillName = null;
    }, delay);
  }

  // setAttackSkillAnimation(skillName, delay = 0) {
  //   this.resetAttackSkillAnimation();

  //   this.attackSkillName = skillName;
  //   this.attackSkillAnimationTimeout = setTimeout(() => {
  //     this.attackSkillName = null;
  //   }, delay);
  // }

  animate(animation, speed, count = 0, onEndCount?: () => void) {
    var oriented = ["atk", "atk2", "walk", "idle", "raise", "raise2", "unraise", "sit", "liedown", "run", "dash"];

    if (!(this.currentAnimation && this.currentAnimation.name === "death")) {
      // don't change animation if the character is dying
      this.flipSpriteX = false;
      this.flipSpriteY = false;

      const orientationAsString = Types.getOrientationAsString(this.orientation);

      if (_.indexOf(oriented, animation) >= 0) {
        animation += `_${orientationAsString.replace("left", "right")}`;
        this.flipSpriteX = orientationAsString.includes("left") ? true : false;
      }

      if (this.kind === Types.Entities.WARRIOR) {
        // @NOTE Make sure the cape is always in sync with the animation
        this.capeOrientation = this.orientation;
      }

      if (this.kind === Types.Entities.DEATHBRINGER) {
        this.flipSpriteX = !this.flipSpriteX;
      }

      // @TODO Fox not ready for animation...
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

    // @NOTE Some characters has 2 attack animations
    let atkAnimation = "";
    if (this.kind === Types.Entities.SPIDERQUEEN) {
      atkAnimation = randomInt(0, 1) ? "2" : "";
    }

    this.animate(`atk${atkAnimation}`, this.atkSpeed, 1);
  }

  walk(orientation) {
    this.setOrientation(orientation);
    this.animate("walk", this.walkSpeed);
  }

  raise(orientation) {
    if (orientation) {
      this.setOrientation(orientation);
    } else {
      this.lookAtTarget();
    }

    this.animate("raise", this.raiseSpeed, 1);
  }

  raise2(orientation) {
    if (orientation) {
      this.setOrientation(orientation);
    } else {
      this.lookAtTarget();
    }

    this.animate("raise2", this.raise2Speed, 1);
  }

  unraise() {
    this.animate("unraise", this.raiseSpeed, 1);
  }

  sit() {
    this.animate("sit", this.idleSpeed, 1);
  }

  liedown() {
    this.animate("liedown", this.idleSpeed, 1);
  }

  run() {
    this.animate("run", this.idleSpeed);
  }

  dash() {
    this.animate("dash", this.idleSpeed);
  }

  moveTo_(x, y) {
    if (
      this.kind === Types.Entities.NECROMANCER ||
      this.kind === Types.Entities.DEATHANGEL ||
      this.kind === Types.Entities.DEATHBRINGER ||
      this.kind === Types.Entities.MAGE ||
      this.kind === Types.Entities.SHAMAN
    ) {
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
    if (this.raisingMode) return;
    if (path.length <= 1 || this.isFrozen) return;

    // Length of 1 means the player has clicked on himself
    this.path = path;
    this.step = 0;

    if (this.followingMode) {
      // following a character
      path.pop();
    }

    this.start_pathing_callback?.(path);

    this.nextStep();
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
    let stop = false;
    let x;
    let y;
    let path;

    if (this.isMoving()) {
      this.before_step_callback?.();

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

        this.step_callback?.();

        if (this.raisingMode || (this.castRange && this.path.length - this.step < this.castRange)) {
          if (!this.raisingMode) {
            this.setRaisingMode();
          }
          stop = true;
        } else if (this.hasChangedItsPath()) {
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

        this.idle();

        this.stop_pathing_callback?.({ x: this.gridX, y: this.gridY });
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

      // @NOTE Have the raiser re-engage with target once animation is done
      if (this.hasTarget()) {
        if (this.castRange && this.isCloseTo(this.target, this.castRange + 1)) {
          // Keep the position
          this.setRaisingMode();
        } else if (this.isCloseTo(this.target, this.aggroRange)) {
          this.engage(this.target);
        }
      }
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
    this.checkaggro_callback?.();
  }

  aggro(character) {
    this.aggro_callback?.(character);
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
      callback(attacker);
    });
  }

  /**
   * Sets this character's attack target. It can only have one target at any time.
   * @param {Character} character The target character.
   */
  setTarget(character) {
    if (this.target?.id !== character.id) {
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

  setSkillTargetId(mobId) {
    this.skillTargetId = mobId;
  }

  onSetTarget(callback) {
    this.settarget_callback = callback;
  }

  showTarget(character) {
    if (this.inspecting !== character) {
      this.inspecting = character;
      if (this.settarget_callback) {
        let targetName = Types.getKindAsString(character.kind);
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
    if (
      !this.isRaising() &&
      this.canReachTarget() &&
      this.attackCooldown.isOver(time, this.isSlowed) &&
      !this.isFrozen
    ) {
      return true;
    }
    return false;
  }

  canRaise(time) {
    if (this.raiseCooldown.isOver(time)) {
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

  die(attacker: { type: "mob" | "player" } = { type: null }) {
    this.removeTarget();

    this.isDead = true;

    this.death_callback?.(attacker?.type === "mob");
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

  setAttackSpeed(bonus: number) {
    const animationSpeed = Math.round(
      Types.DEFAULT_ATTACK_ANIMATION_SPEED -
        Types.DEFAULT_ATTACK_ANIMATION_SPEED * (Types.calculateAttackSpeed(bonus) / 100),
    );
    const attackSpeed = Math.round(
      Types.DEFAULT_ATTACK_SPEED - Types.DEFAULT_ATTACK_SPEED * (Types.calculateAttackSpeed(bonus) / 100),
    );

    this.atkSpeed = animationSpeed;
    this.setAttackRate(attackSpeed);
  }

  setAttackRate(rate) {
    this.attackCooldown = new Timer(rate);
  }

  setFrozen(duration: number) {
    this.isFrozen = true;
    this.stop();
    this.currentAnimation.pause();

    clearTimeout(this.frozenTimeout);

    this.frozenTimeout = setTimeout(() => {
      this.isFrozen = false;
      this.frozenTimeout = null;
      this.currentAnimation.play();
    }, duration);
  }

  setSlowed(duration: number) {
    this.isSlowed = true;

    // if it's defined it means the character is already slowed
    if (!this.originalAtkSpeed) {
      this.originalAtkSpeed = this.atkSpeed;
      this.originalMoveSpeed = this.moveSpeed;
      this.originalWalkSpeed = this.walkSpeed;
      this.originalIdleSpeed = this.idleSpeed;

      this.atkSpeed = this.atkSpeed * 3;
      this.moveSpeed = this.moveSpeed * 3;
      this.walkSpeed = this.walkSpeed * 3;
      this.idleSpeed = this.idleSpeed * 3;
    }

    clearTimeout(this.slowedTimeout);

    this.slowedTimeout = setTimeout(() => {
      this.isSlowed = false;
      this.slowedTimeout = null;

      this.atkSpeed = this.originalAtkSpeed;
      this.moveSpeed = this.originalMoveSpeed;
      this.walkSpeed = this.originalWalkSpeed;
      this.idleSpeed = this.originalIdleSpeed;

      this.originalAtkSpeed = null;
      this.originalMoveSpeed = null;
      this.originalWalkSpeed = null;
      this.originalIdleSpeed = null;
    }, duration);
  }

  setPoisoned(duration: number) {
    this.isPoisoned = true;

    clearTimeout(this.poisonedTimeout);

    this.poisonedTimeout = setTimeout(() => {
      this.isPoisoned = false;
      this.poisonedTimeout = null;
      // Add 500ms so the last tick happens while being green
    }, duration + 500);
  }

  setCursed(curseId: number, duration: number) {
    this.curseId = curseId;

    clearTimeout(this.cursedTimeout);
    this.cursedTimeout = setTimeout(() => {
      this.clearCursed();
    }, duration);
  }

  clearCursed() {
    clearTimeout(this.cursedTimeout);

    this.curseId = null;
    this.cursedTimeout = null;
  }
}

export default Character;
