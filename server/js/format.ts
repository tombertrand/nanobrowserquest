import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";

class FormatChecker {
  formats: any[];

  constructor() {
    this.formats = [];
    (this.formats[Types.Messages.CREATE] = ["s", "s", "s"]),
      (this.formats[Types.Messages.LOGIN] = ["s", "s", "s"]),
      (this.formats[Types.Messages.MOVE] = ["n", "n"]),
      (this.formats[Types.Messages.MOVE_PET] = ["n", "n"]),
      (this.formats[Types.Messages.LOOTMOVE] = ["n", "n", "n"]),
      (this.formats[Types.Messages.AGGRO] = ["n"]),
      (this.formats[Types.Messages.ATTACK] = ["n"]),
      (this.formats[Types.Messages.HIT] = ["n"]),
      (this.formats[Types.Messages.HURT] = ["n"]),
      (this.formats[Types.Messages.HURT_SPELL] = ["n"]),
      (this.formats[Types.Messages.HURT_TRAP] = ["n"]),
      (this.formats[Types.Messages.CAST_SPELL] = ["n", "n", "n", "n", "b"]),
      (this.formats[Types.Messages.CHAT] = ["s"]),
      (this.formats[Types.Messages.ACCOUNT] = ["s"]),
      (this.formats[Types.Messages.LOOT] = ["n"]),
      (this.formats[Types.Messages.TELEPORT] = ["n", "n", "n"]),
      (this.formats[Types.Messages.ZONE] = []),
      (this.formats[Types.Messages.OPEN] = ["n"]),
      (this.formats[Types.Messages.CHECK] = ["n"]),
      (this.formats[Types.Messages.ACHIEVEMENT] = ["n", "s"]),
      (this.formats[Types.Messages.WAYPOINT] = ["n", "s"]),
      (this.formats[Types.Messages.BOSS_CHECK] = ["b"]),
      (this.formats[Types.Messages.BAN_PLAYER] = ["s"]),
      (this.formats[Types.Messages.HASH] = ["s"]),
      (this.formats[Types.Messages.SKILL] = ["n", "n"]),
      (this.formats[Types.Messages.FROZEN] = ["n", "n"]),
      (this.formats[Types.Messages.MOVE] = ["n", "n"]),
      (this.formats[Types.Messages.REQUEST_PAYOUT] = ["n"]),
      (this.formats[Types.Messages.MOVE_ITEM] = ["n", "n", "a"]),
      (this.formats[Types.Messages.MOVE_ITEMS_TO_INVENTORY] = ["s"]),
      (this.formats[Types.Messages.UPGRADE_ITEM] = []),
      (this.formats[Types.Messages.PURCHASE_CREATE] = ["n", "s"]),
      (this.formats[Types.Messages.PURCHASE_CANCEL] = []),
      (this.formats[Types.Messages.MAGICSTONE] = ["n"]),
      (this.formats[Types.Messages.LEVER] = ["n"]),
      (this.formats[Types.Messages.ALTARCHALICE] = ["n"]),
      (this.formats[Types.Messages.ALTARSOULSTONE] = ["n"]),
      (this.formats[Types.Messages.HANDS] = ["n"]),
      (this.formats[Types.Messages.TRAP] = ["n"]),
      (this.formats[Types.Messages.STATUE] = ["n"]),
      (this.formats[Types.Messages.FOSSIL] = []),
      (this.formats[Types.Messages.GOLD.MOVE] = ["n", "s", "s"]),
      (this.formats[Types.Messages.GOLD.BANK] = ["b"]),
      (this.formats[Types.Messages.MERCHANT.BUY] = ["n", "n", "n"]),
      (this.formats[Types.Messages.MERCHANT.SELL] = ["n", "n"]),
      (this.formats[Types.Messages.STORE_ITEMS] = []);
    this.formats[Types.Messages.STONETELEPORT] = ["n"];
  }

  check(json) {
    const { action, message, params } = json;
    const { message: messageId } = message;

    if (!action && action !== 0) {
      return false;
    }

    const filteredParams = params.reduce((acc, value) => {
      if (value !== null) {
        acc.push(value);
      }
      return acc;
    }, []);

    var format = this.formats[action];

    if (format) {
      for (var i = 0, n = format.length; i < n; i += 1) {
        if (format[i] === "n" && !_.isNumber(params[i])) {
          return false;
        }
        if (format[i] === "s" && !_.isString(params[i])) {
          return false;
        }
        if (format[i] === "b" && !_.isBoolean(params[i])) {
          return false;
        }
      }
      return true;
    } else if (action === Types.Messages.WHO) {
      // WHO messages have a variable amount of params, all of which must be numbers.
      return (
        params[0].length > 0 &&
        _.every(params[0], function (param) {
          return _.isNumber(param);
        })
      );
    } else if (action === Types.Messages.LOGIN) {
      return (
        _.isString(action) &&
        _.isString(message) &&
        (filteredParams.length == 2 || (_.isString(message[2]) && filteredParams.length === 3))
      );
    } else if (action === Types.Messages.PARTY) {
      if (messageId === Types.Messages.PARTY_ACTIONS.CREATE) {
        // console.log("!!!!!!!messageIdz
        return filteredParams.length === 1 && _.isNumber(filteredParams[0]);
      } else if (messageId === Types.Messages.PARTY_ACTIONS.JOIN) {
        return filteredParams.length === 2 && _.isNumber(messageId);
      } else if (messageId === Types.Messages.PARTY_ACTIONS.REFUSE) {
        return filteredParams.length === 2 && _.isNumber(messageId);
      } else if (messageId === Types.Messages.PARTY_ACTIONS.INVITE) {
        return filteredParams.length === 2 && _.isNumber(messageId);
      } else if (messageId === Types.Messages.PARTY_ACTIONS.LEAVE) {
        return filteredParams.length === 1;
      } else if (action === Types.Messages.PARTY_ACTIONS.REMOVE) {
        return filteredParams.length === 2 && _.isNumber(messageId);
      } else if (messageId === Types.Messages.PARTY_ACTIONS.DISBAND) {
        return filteredParams.length === 1;
      } else if (messageId === Types.Messages.PARTY_ACTIONS.INFO) {
        return filteredParams.length === 2 && _.isNumber(messageId);
      } else if (messageId === Types.Messages.PARTY_ACTIONS.ERROR) {
        return filteredParams.length === 2 && _.isNumber(messageId);
      }
    } else if (action === Types.Messages.TRADE) {
      if (messageId === Types.Messages.TRADE_ACTIONS.REQUEST_SEND) {
        return filteredParams.length === 2 && _.isString(filteredParams[1]);
      } else if (messageId === Types.Messages.TRADE_ACTIONS.REQUEST_ACCEPT) {
        return filteredParams.length === 2 && _.isNumber(messageId) && _.isString(filteredParams[1]);
      } else if (messageId === Types.Messages.TRADE_ACTIONS.REQUEST_REFUSE) {
        return filteredParams.length === 2 && _.isNumber(messageId);
      } else if (messageId === Types.Messages.TRADE_ACTIONS.PLAYER1_STATUS) {
        return filteredParams.length === 2 && _.isBoolean(filteredParams[1]);
      } else if (messageId === Types.Messages.TRADE_ACTIONS.CLOSE) {
        return true;
      }
    } else if (
      action === Types.Messages.ACHIEVEMENT ||
      action === Types.Messages.WAYPOINT ||
      action === Types.Messages.PURCHASE_CREATE
    ) {
      return filteredParams.length === 2 && _.isNumber(action) && _.isString(message);
    } else if (action === Types.Messages.BAN_PLAYER) {
      return filteredParams.length === 1 && _.isString(action);
    } else if (action === Types.Messages.BOSS_CHECK) {
      return filteredParams.length === 1 && _.isString(action);
    } else if (action === Types.Messages.MOVE_ITEMS_TO_INVENTORY) {
      return filteredParams.length === 1 && _.isString(action);
    } else if ([Types.Messages.UPGRADE_ITEM, Types.Messages.STORE_ITEMS].includes(action)) {
      return filteredParams.length === 0;
    } else if (action === Types.Messages.MOVE_ITEM) {
      return (
        filteredParams.length === 3 &&
        _.isNumber(action) &&
        _.isNumber(message && (message[2] === null || _.isNumber(message[2])))
      );
    } else if (action === Types.Messages.REQUEST_PAYOUT) {
      return filteredParams.length === 1 && _.isNumber(action);
    } else if (action === Types.Messages.SETTINGS) {
      return true;
    } else if (action === Types.Messages.SKILL) {
      return filteredParams.length === 2 && _.isNumber(action) && _.isNumber(message);
    } else if (
      action === Types.Messages.MAGICSTONE ||
      action === Types.Messages.LEVER ||
      action === Types.Messages.ALTARCHALICE ||
      action === Types.Messages.ALTARSOULSTONE ||
      action === Types.Messages.HANDS
    ) {
      return filteredParams.length === 1 && _.isNumber(action);
    } else if (action === Types.Messages.MANUAL_BAN_PLAYER) {
      return true;
    } else {
      console.error("Unknown message type: ");
      return false;
    }
  }
}

export default FormatChecker;
