class Tile {}

class AnimatedTile extends Tile {
  startId: any;
  id: any;
  length: any;
  speed: any;
  index: any;
  lastTime: number;
  x: number;
  y: number;

  constructor(id, length, speed, index) {
    super();
    this.startId = id;
    this.id = id;
    this.length = length;
    this.speed = speed;
    this.index = index;
    this.lastTime = 0;
  }

  tick() {
    if (this.id - this.startId < this.length - 1) {
      this.id += 1;
    } else {
      this.id = this.startId;
    }
  }

  animate(time) {
    if (time - this.lastTime > this.speed) {
      this.tick();
      this.lastTime = time;
      return true;
    } else {
      return false;
    }
  }
}

export default AnimatedTile;
