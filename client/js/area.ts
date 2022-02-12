class Area {
  x: number;
  y: number;
  width: number;
  height: number;
  musicName: string = "";
  id: number;

  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  contains(entity) {
    if (entity) {
      return (
        entity.gridX >= this.x &&
        entity.gridY >= this.y &&
        entity.gridX < this.x + this.width &&
        entity.gridY < this.y + this.height
      );
    } else {
      return false;
    }
  }
}

export default Area;
