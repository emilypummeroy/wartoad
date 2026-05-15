import { data } from '@/state';
import { HOME } from '@/state-types/pond';
import { Phase, PLAYER_AFTER, type Player } from '@/types/gameflow';

export const winIfYouCan = (you: Player) =>
  data(({ get, make }) => {
    const opponentHome = get.leaf.at(HOME[PLAYER_AFTER[you]]);
    const didMeetPreconditions =
      get.phase === Phase.End &&
      opponentHome.units.length > 0 &&
      opponentHome.units.every(u => u.owner === you);
    if (!didMeetPreconditions) return get.out;

    return make.winner(you).get.out;
  });
