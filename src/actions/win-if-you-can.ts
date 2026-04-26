import { data } from '../state';
import { HOME } from '../state-types/pond';
import { Phase, PLAYER_AFTER } from '../types/gameflow';

export const winIfYouCan = () =>
  data(({ get, make }) => {
    const opponentHome = get.leaf.at(HOME[PLAYER_AFTER[get.player]]);
    const didMeetPreconditions =
      get.phase === Phase.End &&
      opponentHome.units.length > 0 &&
      opponentHome.units.every(u => u.owner === get.player);
    if (!didMeetPreconditions) return get.out;

    return make.winner(get.player).get.out;
  });
