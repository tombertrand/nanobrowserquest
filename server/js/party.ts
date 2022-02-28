import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";
import Messages from "./message";

import type Player from "./player";
import type World from "./worldserver";

interface Member {
  id: number;
  name: string;
}

// @TODO CAP IT!
// const MAX_MEMBERS = 4;

class Party {
  members: Member[] = [];
  sentInvites: { [key: number]: number };
  id: number;
  partyLeader: { id: number; name: string };
  server: World;
  lootMemberIndex: number;

  constructor(id, player, server) {
    this.members = [];
    this.sentInvites = {
      [player.id]: Date.now(),
    };
    this.id = id;
    this.server = server;
    this.partyLeader = {
      id: player.id,
      name: player.name,
    };
    this.lootMemberIndex = 0;

    this.addMember(player);
  }

  addMember(player: Player) {
    if (!this.sentInvites[player.id]) {
      player.send(
        new Messages.Party(
          Types.Messages.PARTY_ACTIONS.ERROR,
          "No invite was sent. Ask the party leader for an invite",
        ).serialize(),
      );
      return;
    }

    console.log(`addMember: ${player.name}`);
    this.members.push({ id: player.id, name: player.name });
    player.setPartyId(this.id);

    this.server.pushToParty(
      this,
      new Messages.Party(Types.Messages.PARTY_ACTIONS.JOIN, [
        { playerName: player.name, members: this.members, partyId: this.id, partyLeader: this.partyLeader },
      ]),
    );

    this.deleteInvite(player.id);
  }

  invite(player: Player) {
    this.sentInvites[player.id] = new Date().valueOf();
    this.server.pushToPlayer(
      player,
      new Messages.Party(Types.Messages.PARTY_ACTIONS.INVITE, [{ partyId: this.id, partyLeader: this.partyLeader }]),
    );
  }

  deleteInvite(playerId) {
    delete this.sentInvites[playerId];
  }

  checkInvite(_invitee) {
    // var now = new Date().valueOf();
    // var self = this;
    // _.each(this.sentInvites, function (time, id) {
    //   if (now - time > 600000) {
    //     var belated = self.server.getEntityById(id);
    //     self.deleteInvite(id);
    //     self.server.pushToParty(self, new Messages.Party(Types.Messages.PARTY.JOIN, belated.name), belated);
    //   }
    // });
    // return typeof this.sentInvites[invitee.id] !== "undefined";
  }

  removeMember(player) {
    const playerIndex = this.members.findIndex(({ id }) => player.id === id);

    if (playerIndex >= 0) {
      this.members.splice(playerIndex, 1);
      player.partyId = undefined;

      if (playerIndex === 0 && this.members.length) {
        // Party leader should always be index 0 so the first player who was invited gets the role
        this.partyLeader = this.members[0];

        // this.server.pushToParty(
        //   this,
        //   new Messages.Party(Types.Messages.PARTY.LEADER, { partyLeader: this.partyLeader }),
        //   player,
        // );
      }

      this.server.pushToParty(
        this,
        new Messages.Party(Types.Messages.PARTY_ACTIONS.LEAVE, {
          partyId: this.id,
          partyLeader: this.partyLeader,
          members: this.members,
          playerName: player.name,
        }),
      );

      player.send(new Messages.Party(Types.Messages.PARTY_ACTIONS.LEAVE, { playerName: player.name }).serialize());

      if (!this.members.length) {
        delete this.server.parties[this.id];
      }
    } else {
      player.send(
        new Messages.Party(Types.Messages.PARTY_ACTIONS.ERROR, `Player ${player.name} is not in the party`).serialize(),
      );
    }
  }

  disband() {
    this.forEachMember((player: Player) => {
      this.server.pushToPlayer(player, new Messages.Party(Types.Messages.PARTY_ACTIONS.DISBAND));
      player.partyId = undefined;
    });

    delete this.server.parties[this.id];
  }

  forEachMember(iterator) {
    _.each(this.members, iterator);
  }

  memberNames() {
    return _.map(this.members, function (name) {
      return name;
    });
  }
}

export default Party;
