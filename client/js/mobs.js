define(["mob", "timer"], function (Mob, Timer) {
  var Mobs = {
    Rat: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.RAT);
        this.moveSpeed = 350;
        this.idleSpeed = 700;
        this.shadowOffsetY = -2;
        this.isAggressive = false;
      },
    }),

    Skeleton: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.SKELETON);
        this.moveSpeed = 350;
        this.atkSpeed = 100;
        this.idleSpeed = 800;
        this.shadowOffsetY = 1;
        this.setAttackRate(1300);
      },
    }),

    Skeleton2: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.SKELETON2);
        this.moveSpeed = 200;
        this.atkSpeed = 100;
        this.idleSpeed = 800;
        this.walkSpeed = 200;
        this.shadowOffsetY = 1;
        this.setAttackRate(1300);
      },
    }),

    Spectre: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.SPECTRE);
        this.moveSpeed = 150;
        this.atkSpeed = 50;
        this.idleSpeed = 200;
        this.walkSpeed = 200;
        this.shadowOffsetY = 1;
        this.setAttackRate(900);
      },
    }),

    Goblin: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.GOBLIN);
        this.moveSpeed = 150;
        this.atkSpeed = 60;
        this.idleSpeed = 600;
        this.setAttackRate(700);
      },
    }),

    Ogre: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.OGRE);
        this.moveSpeed = 300;
        this.atkSpeed = 100;
        this.idleSpeed = 600;
      },
    }),

    Crab: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.CRAB);
        this.moveSpeed = 200;
        this.atkSpeed = 40;
        this.idleSpeed = 500;
      },
    }),

    Snake: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.SNAKE);
        this.moveSpeed = 200;
        this.atkSpeed = 40;
        this.idleSpeed = 250;
        this.walkSpeed = 100;
        this.shadowOffsetY = -4;
      },
    }),

    Eye: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.EYE);
        this.moveSpeed = 200;
        this.atkSpeed = 40;
        this.idleSpeed = 50;
      },
    }),

    Bat: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.BAT);
        this.moveSpeed = 120;
        this.atkSpeed = 90;
        this.idleSpeed = 90;
        this.walkSpeed = 85;
        this.isAggressive = false;
      },
    }),

    Wizard: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.WIZARD);
        this.moveSpeed = 200;
        this.atkSpeed = 100;
        this.idleSpeed = 150;
      },
    }),

    Deathknight: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.DEATHKNIGHT);
        this.atkSpeed = 50;
        this.moveSpeed = 220;
        this.walkSpeed = 100;
        this.idleSpeed = 450;
        this.setAttackRate(800);
        this.aggroRange = 3;
      },

      idle: function (orientation) {
        if (!this.hasTarget()) {
          this._super(Types.Orientations.DOWN);
        } else {
          this._super(orientation);
        }
      },
    }),

    Boss: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.BOSS);
        this.moveSpeed = 300;
        this.atkSpeed = 50;
        this.idleSpeed = 400;
        this.atkRate = 2000;
        this.attackCooldown = new Timer(this.atkRate);
        this.aggroRange = 3;
      },

      idle: function (orientation) {
        if (!this.hasTarget()) {
          this._super(Types.Orientations.DOWN);
        } else {
          this._super(orientation);
        }
      },
    }),

    Rat2: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.RAT2);
        this.moveSpeed = 350;
        this.idleSpeed = 700;
        this.shadowOffsetY = -2;
        this.isAggressive = false;
      },
    }),

    Bat2: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.BAT2);
        this.moveSpeed = 120;
        this.atkSpeed = 90;
        this.idleSpeed = 90;
        this.walkSpeed = 85;
        this.isAggressive = false;
      },
    }),

    Goblin2: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.GOBLIN2);
        this.moveSpeed = 150;
        this.atkSpeed = 60;
        this.idleSpeed = 600;
        this.setAttackRate(700);
      },
    }),

    Yeti: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.YETI);
        this.moveSpeed = 300;
        this.atkSpeed = 100;
        this.idleSpeed = 600;
      },
    }),

    Werewolf: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.WEREWOLF);
        this.moveSpeed = 200;
        this.atkSpeed = 80;
        this.idleSpeed = 600;
      },
    }),

    Skeleton3: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.SKELETON3);
        this.moveSpeed = 200;
        this.atkSpeed = 100;
        this.idleSpeed = 800;
        this.walkSpeed = 200;
        this.shadowOffsetY = 1;
        this.aggroRange = 2;
        this.setAttackRate(1300);
      },
    }),

    SkeletonLeader: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.SKELETONLEADER);
        this.moveSpeed = 300;
        this.atkSpeed = 50;
        this.idleSpeed = 400;
        this.atkRate = 2000;
        this.attackCooldown = new Timer(this.atkRate);
        this.aggroRange = 3;
      },

      idle: function (orientation) {
        if (!this.hasTarget()) {
          this._super(Types.Orientations.DOWN);
        } else {
          this._super(orientation);
        }
      },
    }),

    Snake2: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.SNAKE2);
        this.moveSpeed = 200;
        this.atkSpeed = 40;
        this.idleSpeed = 250;
        this.walkSpeed = 100;
        this.shadowOffsetY = -4;
      },
    }),

    Wraith: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.WRAITH);
        this.atkSpeed = 50;
        this.moveSpeed = 220;
        this.walkSpeed = 100;
        this.idleSpeed = 450;
        this.setAttackRate(800);
        this.aggroRange = 3;
      },
    }),

    Zombie: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.ZOMBIE);
        this.atkSpeed = 50;
        this.raiseSpeed = 250;
        this.moveSpeed = 220;
        this.walkSpeed = 100;
        this.idleSpeed = 450;
        this.setAttackRate(800);
        this.isAggressive = false;
      },

      idle: function (orientation) {
        if (!this.hasTarget()) {
          this._super(Types.Orientations.DOWN);
        } else {
          this._super(orientation);
        }
      },
    }),

    Necromancer: Mob.extend({
      init: function (id) {
        this._super(id, Types.Entities.NECROMANCER);
        this.moveSpeed = 300;
        this.atkSpeed = 100;
        this.raiseSpeed = 250;
        this.idleSpeed = 400;
        this.atkRate = 2000;
        this.raiseRate = 2000;
        this.attackCooldown = new Timer(this.atkRate);
        this.raiseCooldown = new Timer(this.raiseRate);
        this.aggroRange = 3;
      },

      idle: function (orientation) {
        if (!this.hasTarget()) {
          this._super(Types.Orientations.DOWN);
        } else {
          this._super(orientation);
        }
      },
    }),
  };

  return Mobs;
});
