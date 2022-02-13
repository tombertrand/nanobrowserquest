import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";
import Messages from "./message";
import {} from "./utils";

class Guild {
  members: {};
  sentInvites: {};
  id: any;
  name: any;
  server: any;

  constructor(id, name, server) {
    this.members = {}; //playerid:playername
    this.sentInvites = {}; //time
    this.id = id;
    this.name = name;
    this.server = server;
    //TODO have a history variable to advise users of what happened while they were offline ? wait for DB…
    //with DB also update structure to make members permanent
  }

  addMember(player, reply) {
    if (typeof this.members[player.id] !== "undefined") {
      console.error("Add to guild: player conflict (" + player.id + " already exists)");
      this.deleteInvite(player.id);
      return false;
    } else {
      //When guildRules is created, use here (or in invite)
      var proceed = true;
      if (typeof reply !== "undefined") {
        proceed = this.checkInvite(player) && reply;
        if (reply === false) {
          this.server.pushToGuild(
            this,
            new Messages.Guild(Types.Messages.GUILDACTION.JOIN, [player.name, false]),
            player,
          );
          this.deleteInvite(player.id);
          return false;
        }
      }
      if (proceed) {
        this.members[player.id] = player.name;
        player.setGuildId(this.id);
        this.server.pushToGuild(
          this,
          new Messages.Guild(Types.Messages.GUILDACTION.POPULATION, [this.name, this.onlineMemberCount()]),
        );
        if (typeof reply !== "undefined") {
          this.server.pushToGuild(
            this,
            new Messages.Guild(Types.Messages.GUILDACTION.JOIN, [player.name, player.id, this.id, this.name]),
          );
          this.deleteInvite(player.id);
        }
      }
      return player.id;
    }
  }

  invite(invitee, invitor) {
    if (typeof this.members[invitee.id] !== "undefined") {
      this.server.pushToPlayer(invitor, new Messages.GuildError(Types.Messages.GUILDERRORTYPE.BADINVITE, invitee.name));
    } else {
      this.sentInvites[invitee.id] = new Date().valueOf();
      this.server.pushToPlayer(
        invitee,
        new Messages.Guild(Types.Messages.GUILDACTION.INVITE, [this.id, this.name, invitor.name]),
      );
    }
  }

  deleteInvite(inviteeId) {
    delete this.sentInvites[inviteeId];
  }

  checkInvite(invitee) {
    var now = new Date().valueOf(),
      self = this;
    _.each(this.sentInvites, function (time, id) {
      if (now - time > 600000) {
        var belated = self.server.getEntityById(id);
        self.deleteInvite(id);
        self.server.pushToGuild(self, new Messages.Guild(Types.Messages.GUILDACTION.JOIN, belated.name), belated);
      }
    });
    return typeof this.sentInvites[invitee.id] !== "undefined";
  }

  removeMember(player) {
    if (typeof this.members[player.id] !== undefined) {
      delete this.members[player.id];
      this.server.pushToGuild(
        this,
        new Messages.Guild(Types.Messages.GUILDACTION.POPULATION, [this.name, this.onlineMemberCount()]),
      );
      return true;
    } else {
      console.error("Remove from guild: player conflict (" + player.id + " does not exist)");
      return false;
    }
  }

  forEachMember(iterator) {
    _.each(this.members, iterator);
  }

  memberNames() {
    return _.map(this.members, function (name) {
      return name;
    });
  }

  onlineMemberCount() {
    return _.size(this.members);
  }
}

export default Guild;
