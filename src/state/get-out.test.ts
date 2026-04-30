import { HOME, setPondStateAt } from '../state-types/pond';
import { TEST_PONDS_BY_KEY, TestPondKey } from '../state-types/pond.test-utils';
import { Phase, Player, PLAYER_AFTER } from '../types/gameflow';
import { _ } from '../types/test-utils';
import { gameData } from './get-out';
import {
  activationOf,
  createStateWith,
  deploymentOf,
  gameflowOf,
  upgradeOf,
} from './test-utils';

describe(gameData, () => {
  describe.for(Object.values<TestPondKey>(TestPondKey))(
    'For pond state %s:',
    pondKey => {
      const pond = TEST_PONDS_BY_KEY[pondKey];

      it('should not throw for default test data', () => {
        const state = createStateWith({ pond });
        expect(() => gameData(state)).not.toThrow();
      });

      it.for([Player.North, Player.South])(
        'should throw when %s home is unupgraded',
        player => {
          const state = createStateWith({
            pond: setPondStateAt(pond, HOME[player], { leaf: undefined }),
          });
          expect(() => gameData(state)).toThrow();
        },
      );

      it.for([Phase.Upgrading, Phase.Deploying, Phase.Activating])(
        'should throw when phase is %s but phase state is missing',
        phase => {
          const state = createStateWith({
            pond,
            ...gameflowOf(undefined, phase),
          });
          expect(() => gameData(state)).toThrow();
        },
      );

      it.for([
        Phase.Start,
        Phase.End,
        Phase.GameOver,
        Phase.Main,
        Phase.Deploying,
        Phase.Activating,
      ])(
        'should throw when phase is %s but upgrade state is present',
        phase => {
          const state = createStateWith({
            pond,
            ...gameflowOf(undefined, phase),
            ...upgradeOf(Player.North),
          });
          expect(() => gameData(state)).toThrow();
        },
      );

      it.for([
        Phase.Start,
        Phase.End,
        Phase.GameOver,
        Phase.Main,
        Phase.Activating,
        Phase.Upgrading,
      ])(
        'should throw when phase is %s but deployment state is present',
        phase => {
          const state = createStateWith({
            pond,
            ...gameflowOf(undefined, phase),
            ...deploymentOf(Player.North),
          });
          expect(() => gameData(state)).toThrow();
        },
      );

      it.for([
        Phase.Start,
        Phase.End,
        Phase.GameOver,
        Phase.Main,
        Phase.Deploying,
        Phase.Upgrading,
      ])(
        'should throw when phase is %s but activation state is present',
        phase => {
          const state = createStateWith({
            pond,
            ...gameflowOf(undefined, phase),
            ...activationOf(Player.North),
          });
          expect(() => gameData(state)).toThrow();
        },
      );

      it.for<[Player | undefined, Phase]>([
        [Player.North, Phase.Start],
        [Player.North, Phase.Main],
        [Player.North, Phase.End],
        [Player.South, Phase.Start],
        [Player.South, Phase.Main],
        [Player.South, Phase.End],
        [undefined, Phase.GameOver],
        [undefined, Phase.GameOver],
      ])(
        'should throw when winner is %s but phase is %s',
        ([winner, phase]) => {
          const state = createStateWith({
            pond,
            ...gameflowOf(undefined, phase),
            winner,
          });
          expect(() => gameData(state)).toThrow();
        },
      );

      it.for<Player>([Player.North, Player.South])(
        'should throw when winner is %s but has not captured opponent Home',
        winner => {
          const state = createStateWith({
            pond,
            ...gameflowOf(undefined, Phase.GameOver),
            winner,
          });
          expect(() => gameData(state)).toThrow();
        },
      );

      it.for<Player>([Player.North, Player.South])(
        'should throw when %s has captured opponent Home but is not the winner',
        winner => {
          const opponentHome = HOME[PLAYER_AFTER[winner]];
          const state = createStateWith({
            pond: setPondStateAt(pond, opponentHome, { controller: winner }),
            ...gameflowOf(undefined, Phase.GameOver),
          });
          expect(() => gameData(state)).toThrow();
        },
      );
    },
  );
});
