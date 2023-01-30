import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";

class FormatChecker {
  formats: any[];

  constructor() {
    this.formats = [];
    (this.formats[Types.Messages.CREATE] = ["s", "s"]),
      (this.formats[Types.Messages.LOGIN] = ["s", "s", "s"]),
      (this.formats[Types.Messages.MOVE] = ["n", "n"]),
      (this.formats[Types.Messages.LOOTMOVE] = ["n", "n", "n"]),
      (this.formats[Types.Messages.AGGRO] = ["n"]),
      (this.formats[Types.Messages.ATTACK] = ["n"]),
      (this.formats[Types.Messages.HIT] = ["n"]),
      (this.formats[Types.Messages.HURT] = ["n"]),
      (this.formats[Types.Messages.HURT_SPELL] = ["n"]),
      (this.formats[Types.Messages.HURT_TRAP] = ["n"]),
      (this.formats[Types.Messages.CAST_SPELL] = ["n", "n", "n"]),
      (this.formats[Types.Messages.CHAT] = ["s"]),
      (this.formats[Types.Messages.LOOT] = ["n"]),
      (this.formats[Types.Messages.TELEPORT] = ["n", "n"]),
      (this.formats[Types.Messages.ZONE] = []),
      (this.formats[Types.Messages.OPEN] = ["n"]),
      (this.formats[Types.Messages.CHECK] = ["n"]),
      (this.formats[Types.Messages.ACHIEVEMENT] = ["n", "s"]),
      (this.formats[Types.Messages.WAYPOINT] = ["n", "s"]),
      (this.formats[Types.Messages.BOSS_CHECK] = ["b"]),
      (this.formats[Types.Messages.BAN_PLAYER] = ["s"]),
      (this.formats[Types.Messages.SKILL] = ["n", "n"]),
      (this.formats[Types.Messages.REQUEST_PAYOUT] = ["n"]),
      (this.formats[Types.Messages.MOVE_ITEM] = ["n", "n", "a"]),
      (this.formats[Types.Messages.MOVE_ITEMS_TO_INVENTORY] = ["s"]),
      (this.formats[Types.Messages.UPGRADE_ITEM] = []),
      (this.formats[Types.Messages.PURCHASE_CREATE] = ["n", "s"]),
      (this.formats[Types.Messages.PURCHASE_CANCEL] = ["s"]),
      (this.formats[Types.Messages.MAGICSTONE] = ["n"]),
      (this.formats[Types.Messages.LEVER] = ["n"]),
      (this.formats[Types.Messages.ALTARCHALICE] = ["n"]),
      (this.formats[Types.Messages.ALTARINFINITYSTONE] = ["n"]),
      (this.formats[Types.Messages.TRAP] = ["n"]),
      (this.formats[Types.Messages.STATUE] = ["n"]),
      (this.formats[Types.Messages.STORE_ITEMS] = []);
  }

  check(msg) {
    if (!msg?.slice) {
      return false;
    }

    var message = msg.slice(0);
    var type = message[0];
    var format = this.formats[type];

    message.shift();

    if (format) {
      if (message.length !== format.length) {
        return false;
      }
      for (var i = 0, n = message.length; i < n; i += 1) {
        if (format[i] === "n" && !_.isNumber(message[i])) {
          return false;
        }
        if (format[i] === "s" && !_.isString(message[i])) {
          return false;
        }
        if (format[i] === "b" && !_.isBoolean(message[i])) {
          return false;
        }
      }
      return true;
    } else if (type === Types.Messages.WHO) {
      // WHO messages have a variable amount of params, all of which must be numbers.
      return (
        message.length > 0 &&
        _.every(message, function (param) {
          return _.isNumber(param);
        })
      );
    } else if (type === Types.Messages.LOGIN) {
      return (
        _.isString(message[0]) &&
        _.isString(message[1]) &&
        (message.length == 2 || (_.isString(message[2]) && message.length === 3))
      );
    } else if (type === Types.Messages.PARTY) {
      if (message[0] === Types.Messages.PARTY_ACTIONS.CREATE) {
        return true;
      } else if (message[0] === Types.Messages.PARTY_ACTIONS.JOIN) {
        return message.length === 2 && _.isNumber(message[1]);
      } else if (message[0] === Types.Messages.PARTY_ACTIONS.REFUSE) {
        return message.length === 2 && _.isNumber(message[1]);
      } else if (message[0] === Types.Messages.PARTY_ACTIONS.INVITE) {
        return message.length === 2 && _.isString(message[1]);
      } else if (message[0] === Types.Messages.PARTY_ACTIONS.LEAVE) {
        return message.length === 1;
      } else if (message[0] === Types.Messages.PARTY_ACTIONS.REMOVE) {
        return message.length === 2 && _.isString(message[1]);
      } else if (message[0] === Types.Messages.PARTY_ACTIONS.DISBAND) {
        return message.length === 1;
      } else if (message[0] === Types.Messages.PARTY_ACTIONS.INFO) {
        return message.length === 2 && _.isString(message[1]);
      } else if (message[0] === Types.Messages.PARTY_ACTIONS.ERROR) {
        return message.length === 2 && _.isString(message[1]);
      }
    } else if (type === Types.Messages.TRADE) {
      if (message[0] === Types.Messages.TRADE_ACTIONS.REQUEST_SEND) {
        return message.length === 2 && _.isString(message[1]);
      } else if (message[0] === Types.Messages.TRADE_ACTIONS.REQUEST_ACCEPT) {
        return message.length === 2 && _.isString(message[1]);
      } else if (message[0] === Types.Messages.TRADE_ACTIONS.REQUEST_REFUSE) {
        return message.length === 2 && _.isString(message[1]);
      } else if (message[0] === Types.Messages.TRADE_ACTIONS.PLAYER1_STATUS) {
        return message.length === 2 && _.isBoolean(message[1]);
      } else if (message[0] === Types.Messages.TRADE_ACTIONS.CLOSE) {
        return true;
      }
    } else if (
      type === Types.Messages.ACHIEVEMENT ||
      type === Types.Messages.WAYPOINT ||
      type === Types.Messages.PURCHASE_CREATE
    ) {
      return message.length === 2 && _.isNumber(message[0]) && _.isString(message[1]);
    } else if (type === Types.Messages.BAN_PLAYER) {
      return message.length === 1 && _.isString(message[0]);
    } else if (type === Types.Messages.BOSS_CHECK) {
      return message.length === 1 && _.isString(message[0]);
    } else if (type === Types.Messages.MOVE_ITEMS_TO_INVENTORY) {
      return message.length === 1 && _.isString(message[0]);
    } else if ([Types.Messages.UPGRADE_ITEM, Types.Messages.STORE_ITEMS].includes(type)) {
      return message.length === 0;
    } else if (type === Types.Messages.MOVE_ITEM) {
      return (
        message.length === 3 &&
        _.isNumber(message[0]) &&
        _.isNumber(message[1] && (message[2] === null || _.isNumber(message[2])))
      );
    } else if (type === Types.Messages.REQUEST_PAYOUT) {
      return message.length === 1 && _.isNumber(message[0]);
    } else if (type === Types.Messages.PURCHASE_CANCEL) {
      return message.length === 1 && _.isString(message[0]);
    } else if (type === Types.Messages.SETTINGS) {
      return message.length === 1 && typeof message[0] === "object";
    } else if (type === Types.Messages.SKILL) {
      return message.length === 2 && _.isNumber(message[0]) && _.isNumber(message[1]);
    } else if (
      type === Types.Messages.MAGICSTONE ||
      type === Types.Messages.LEVER ||
      type === Types.Messages.ALTARCHALICE ||
      type === Types.Messages.ALTARINFINITYSTONE
    ) {
      return message.length === 1 && _.isNumber(message[0]);
    } else {
      console.error("Unknown message type: " + type);
      return false;
    }
  }
}

export default FormatChecker;
