import { randomInt } from "./utils";

class Checkpoint {
  id: any;
  x: any;
  y: any;
  width: any;
  height: any;

  constructor(id, x, y, width, height) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  getRandomPosition() {
    var pos: any = {};

    pos.x = this.x + randomInt(0, this.width - 1);
    pos.y = this.y + randomInt(0, this.height - 1);
    return pos;
  }
}

export default Checkpoint;
