import { Types } from "../../shared/js/gametypes";
import Player from "./player";

class Warrior extends Player {
  moveUp: any;
  moveDown: any;
  moveLeft: any;
  moveRight: any;
  disableKeyboardNpcTalk: any;
  experience: any;
  dirtyRect: any;
  defense: any;
  isOnPlateau: any;
  lastCheckpoint: any;

  constructor(id, name) {
    super(id, name, "", Types.Entities.WARRIOR, undefined);
  }
}

export default Warrior;