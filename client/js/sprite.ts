import Animation from "./animation";
import sprites from "./sprites";

class Sprite {
  id;
  name;
  scale;
  filepath;
  animationData;
  width;
  height;
  isLoaded;
  offsetX = 0;
  offsetY = 0;
  image: any;

  onload_func;
  whiteSprite;
  silhouetteSprite;
  image7: any;
  image8: any;
  image9: any;
  imageunique: any;
  imagenano: any;
  imageban: any;

  constructor(name, scale) {
    this.name = name;
    this.scale = scale;
    this.isLoaded = false;
    this.offsetX = 0;
    this.offsetY = 0;

    if (!sprites[name]) {
      console.error(`Mising sprite: ${name}`);
    }

    this.loadJSON(sprites[name]);
  }

  loadJSON(data) {
    this.id = data.id;

    this.animationData = data.animations;
    this.width = data.width;
    this.height = data.height;
    this.offsetX = data.offset_x !== undefined ? data.offset_x : -16;
    this.offsetY = data.offset_y !== undefined ? data.offset_y : -16;

    this.load();
  }

  load() {
    var self = this;

    this.image = new Image();
    this.image.crossOrigin = "Anonymous";

    if (
      this.id === "item" ||
      this.id === "waypoint" ||
      this.id === "weapon" ||
      this.id === "armor" ||
      this.id === "shield" ||
      this.id === "npc" ||
      this.id === "npc2" ||
      this.id.startsWith("deathangel-spell") ||
      this.id.startsWith("mage") ||
      this.id.startsWith("mage-spell") ||
      this.id.startsWith("arrow") ||
      this.id.startsWith("skill-cast") ||
      this.id.startsWith("portal") ||
      this.id.startsWith("lever") ||
      this.id.startsWith("tomb") ||
      this.id.startsWith("trap") ||
      this.id.startsWith("anvil-") ||
      this.id.startsWith("rat") ||
      this.id.startsWith("spider") ||
      this.id.startsWith("skeletontemplar") ||
      this.id === "skeleton" ||
      this.id === "snake" ||
      this.id === "secretstairs" ||
      this.id === "secretstairup"
    ) {
      this.id = this.name;
    }

    this.image.src = "img/" + this.scale + "/" + this.id + ".png";

    if (this.name.startsWith("weapon-effect")) {
      this.image8 = new Image();
      this.image8.crossOrigin = "Anonymous";
      this.image8.src = "img/" + this.scale + "/" + this.id + "8" + ".png";
      this.image9 = new Image();
      this.image9.crossOrigin = "Anonymous";
      this.image9.src = "img/" + this.scale + "/" + this.id + "9" + ".png";
    } else if (
      [
        "hornedarmor",
        "frozenarmor",
        "diamondarmor",
        "emeraldarmor",
        "templararmor",
        "dragonarmor",
        "demonarmor",
        "mysticalarmor",
        "bloodarmor",
        "paladinarmor",
      ].includes(this.name)
    ) {
      this.imageunique = new Image();
      this.imageunique.crossOrigin = "Anonymous";
      this.imageunique.src = "img/" + this.scale + "/" + this.id + "unique" + ".png";
    } else if (this.name === "cape") {
      this.image7 = new Image();
      this.image7.crossOrigin = "Anonymous";
      this.image7.src = "img/" + this.scale + "/" + this.id + "7" + ".png";
    }

    this.image.onload = function () {
      self.isLoaded = true;

      if (self.onload_func) {
        self.onload_func();
      }
    };
  }

  createAnimations() {
    var animations: any = {};

    for (var name in this.animationData) {
      var a = this.animationData[name];
      animations[name] = new Animation(name, a.length, a.row, this.width, this.height);
    }

    return animations;
  }

  createHurtSprite() {
    var canvas = document.createElement("canvas");
    var ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
    var width = this.image.width;
    var height = this.image.height;
    var spriteData: any;
    var data;

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(this.image, 0, 0, width, height);

    try {
      spriteData = ctx.getImageData(0, 0, width, height);

      data = spriteData.data;

      for (var i = 0; i < data.length; i += 4) {
        data[i] = 255;
        data[i + 1] = data[i + 2] = 75;
      }

      ctx.putImageData(spriteData, 0, 0);

      this.whiteSprite = {
        image: canvas,
        isLoaded: true,
        offsetX: this.offsetX,
        offsetY: this.offsetY,
        width: this.width,
        height: this.height,
      };
    } catch (err) {
      console.error("Error getting image data for sprite : " + this.name);
    }
  }

  getHurtSprite() {
    return this.whiteSprite;
  }

  createSilhouette() {
    var canvas = document.createElement("canvas"),
      ctx = canvas.getContext("2d"),
      width = this.image.width,
      height = this.image.height,
      spriteData;

    canvas.width = width;
    canvas.height = height;

    try {
      ctx.drawImage(this.image, 0, 0, width, height);
      spriteData = ctx.getImageData(0, 0, width, height);

      var getIndex = function (x, y) {
        return (width * (y - 1) + x - 1) * 4;
      };

      var getPosition = function (i) {
        var x, y;

        i = i / 4 + 1;
        x = i % width;
        y = (i - x) / width + 1;

        return { x: x, y: y };
      };

      var hasAdjacentPixel = i => {
        var pos = getPosition(i);
        var hasPixel = false;

        if (pos.x < width && !isBlankPixel(getIndex(pos.x + 1, pos.y))) {
          hasPixel = true;
        } else if (pos.x > 1 && !isBlankPixel(getIndex(pos.x - 1, pos.y))) {
          hasPixel = true;
        } else if (pos.y < height && !isBlankPixel(getIndex(pos.x, pos.y + 1))) {
          hasPixel = true;
        } else if (pos.y > 1 && !isBlankPixel(getIndex(pos.x, pos.y - 1))) {
          hasPixel = true;
        }

        return hasPixel;
      };

      var isBlankPixel = (i: number) => {
        if (i < 0 || i >= spriteData.data.length) {
          return true;
        }

        return (
          (spriteData.data[i] === 0 &&
            spriteData.data[i + 1] === 0 &&
            spriteData.data[i + 2] === 0 &&
            spriteData.data[i + 3] === 0) ||
          spriteData.data[i + 3] === 150
        );
      };

      for (var i = 0; i < spriteData.data.length; i += 4) {
        if (isBlankPixel(i) && hasAdjacentPixel(i)) {
          spriteData.data[i] = spriteData.data[i + 1] = 255;
          spriteData.data[i + 2] = 150;
          spriteData.data[i + 3] = 150;
        }
      }

      ctx.putImageData(spriteData, 0, 0);

      this.silhouetteSprite = {
        image: canvas,
        isLoaded: true,
        offsetX: this.offsetX,
        offsetY: this.offsetY,
        width: this.width,
        height: this.height,
      };
    } catch (err) {
      this.silhouetteSprite = this;
    }
  }
}

export default Sprite;
