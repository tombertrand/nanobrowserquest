import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";
import Messages from "./message";

import type Player from "./player";
import type World from "./worldserver";

interface Member {
  id: number;
  name: string;
}

const MAX_MEMBERS = 4;

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
    this.lootMemberIndex = -1;

    this.addMember(player);
  }

  getNextLootMemberId() {
    if (this.lootMemberIndex + 1 >= this.members.length) {
      this.lootMemberIndex = 0;
    } else {
      this.lootMemberIndex += 1;
    }

    return this.members[this.lootMemberIndex].id;
  }

  addMember(player: Player) {
    if (this.members.length === MAX_MEMBERS) {
      player.send(new Messages.Party(Types.Messages.PARTY_ACTIONS.ERROR, "The party is full").serialize());
      return;
    } else if (this.members.length > MAX_MEMBERS) {
      this.server.databaseHandler.logEvent({ event: "addMember - disband", memberLength: this.members.length });
      this.disband();
      return;
    }
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
    this.updatePartyBonus();
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

  updatePartyBonus() {
    this.forEachMember(({ id }) => {
      const player = this.server.getEntityById(id);

      if (player) {
        player.calculatePartyBonus();
        player.sendPlayerStats();
      }
    });
  }

  removeMember(player) {
    const playerIndex = this.members.findIndex(({ id }) => player.id === id);

    if (playerIndex >= 0) {
      this.members.splice(playerIndex, 1);
      player.partyId = undefined;

      if (playerIndex === 0 && this.members.length) {
        // Party leader should always be index 0 so the first player who was invited gets the role
        this.partyLeader = this.members[0];
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

      this.updatePartyBonus();

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
    this.forEachMember(({ id }) => {
      const player = this.server.getEntityById(id);

      if (player) {
        this.server.pushToPlayer(player, new Messages.Party(Types.Messages.PARTY_ACTIONS.DISBAND));
        player.setPartyId(undefined);
      }
    });

    this.updatePartyBonus();

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
