import Emitter from "component-emitter";
import CryptoJS from "crypto-js";

import { Messages } from "./messages";

const key = 133;

class Encoder {
  encode(packet) {
    // return [this.cryptr.encrypt(JSON.stringify(packet))];
    return [CryptoJS.AES.encrypt(JSON.stringify(packet), `@todo-define-secret${key}`).toString()];
  }
}

class Decoder extends Emitter {
  /**
   * Receive a chunk (string or buffer) and optionally emit a "decoded" event with the reconstructed packet
   */
  add(chunk) {
    const bytes = CryptoJS.AES.decrypt(chunk, `@todo-define-secret${key}`);
    const packet = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    if (this.isPacketValid(packet)) {
      this.emit("decoded", packet);
    } else {
      this.emit("decoded", {
        type: 2,
        data: ["message", [Messages.BAN_PLAYER]],
        options: { compress: true },
        nsp: "/",
      });
    }
  }
  isPacketValid({ type, data, nsp, id }) {
    const isNamespaceValid = typeof nsp === "string";
    const isAckIdValid = id === undefined || Number.isInteger(id);
    if (!isNamespaceValid || !isAckIdValid) {
      return false;
    }
    switch (type) {
      case 0: // CONNECT
        return data === undefined || typeof data === "object";
      case 1: // DISCONNECT
        return data === undefined;
      case 2: // EVENT
        return Array.isArray(data) && data.length > 0;
      case 3: // ACK
        return Array.isArray(data);
      case 4: // CONNECT_ERROR
        return typeof data === "object";
      default:
        return false;
    }
  }
  /**
   * Clean up internal buffers
   */
  destroy() {}
}

export default { Encoder, Decoder };
