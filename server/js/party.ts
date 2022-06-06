import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";
import Messages from "./message";
import { Sentry } from "./sentry";

import type Player from "./player";
import type World from "./worldserver";

interface Member {
  id: number;
  name: string;
}

export const MAX_PARTY_MEMBERS = 6;

// 1 player = 100% of mob exp
// 2 players = 65% of mob exp
// 3 players = 50% of mob exp
// 4 players = 40% of mob exp
// 5 players = 30% of mob exp
// 6 players = 25% of mob exp
const expPerPlayerMap = [100, 65, 50, 40, 30, 25];

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
    if (this.members.length === MAX_PARTY_MEMBERS) {
      player.send(new Messages.Party(Types.Messages.PARTY_ACTIONS.ERROR, "The party is full").serialize());
      return;
    } else if (this.members.length > MAX_PARTY_MEMBERS) {
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
    this.members.push({ id: player.id, name: player.name });
    player.setPartyId(this.id);

    this.server.pushToParty(
      this,
      new Messages.Party(Types.Messages.PARTY_ACTIONS.JOIN, [
        { playerName: player.name, members: this.members, partyId: this.id, partyLeader: this.partyLeader },
      ]),
    );

    this.deleteInvite(player);
    this.updatePartyBonus();
  }

  invite(player: Player) {
    this.sentInvites[player.id] = new Date().valueOf();
    this.server.pushToPlayer(
      player,
      new Messages.Party(Types.Messages.PARTY_ACTIONS.INVITE, [{ partyId: this.id, partyLeader: this.partyLeader }]),
    );
  }

  deleteInvite(player) {
    delete this.sentInvites[player.id];
  }

  refuse(player) {
    this.deleteInvite(player);

    this.server.pushToPlayer(player, new Messages.Party(Types.Messages.PARTY_ACTIONS.REFUSE, [{ partyId: this.id }]));
  }

  updatePartyBonus() {
    this.forEachMember(({ id }) => {
      const player = this.server.getEntityById(id);

      if (player) {
        player.calculatePartyBonus();
        player.sendPlayerStats();
      } else {
        Sentry.captureException(new Error("Missing entity ID in party"), {
          extra: {
            id,
          },
        });
      }
    });
  }

  shareExp(mob) {
    const baseExp = Types.getMobExp(mob.kind);
    const expPerPlayer = (baseExp * expPerPlayerMap[this.members.length]) / 100;

    this.forEachMember(({ id }) => {
      const player = this.server.getEntityById(id);

      if (!player) return;

      const x = Math.abs(player.x - mob.x);
      const y = Math.abs(player.y - mob.y);

      if (x <= 50 && y <= 50) {
        this.server.incrementExp(player, mob, expPerPlayer);
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
    if (!this.members.length || !this.members?.[0]?.id) return;

    _.each(this.members, iterator);
  }

  memberNames() {
    return _.map(this.members, function (name) {
      return name;
    });
  }
}

export default Party;
