class Tile {}

class AnimatedTile extends Tile {
  startId: any;
  id: any;
  length: any;
  speed: any;
  skip?: number;
  index: any;
  lastTime: number;
  x: number;
  y: number;

  constructor(id, length, speed, skip = 1, index) {
    super();
    this.startId = id;
    this.id = id;
    this.length = length;
    this.speed = speed;
    this.skip = skip;
    this.index = index;
    this.lastTime = 0;
  }

  tick() {
    if (this.id - this.startId < this.length * this.skip - this.skip) {
      this.id += this.skip;
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
