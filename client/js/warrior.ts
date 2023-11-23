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
  petEntity?: any;

  constructor(id, { name, petId }: { name: string; petId?: number; bonus?: any }) {
    super(id, name, "", Types.Entities.WARRIOR);
    // console.log("~~~bonus", bonus);
    this.petId = petId;
  }
}

export default Warrior;
