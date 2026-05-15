import { leafTutor } from '@/state-types/deck.test-utils';
import { HOME, setPondStateAt } from '@/state-types/pond';
import { TEST_PONDS_BY_KEY, TestPondKey } from '@/state-types/pond.test-utils';
import { CardClass, type LeafClass } from '@/types/card';
import { Phase, Player, PLAYER_AFTER } from '@/types/gameflow';
import type { Position } from '@/types/position';
import { _ } from '@/types/test-utils';

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

      it.for<[Player, Position, LeafClass]>([
        [Player.North, { x: 0, y: 0 }, CardClass.OldLeaf],
        [Player.South, { x: 0, y: 0 }, CardClass.OldLeaf],
        [Player.North, { x: 1, y: 0 }, CardClass.OldLeaf],
        [Player.South, { x: 1, y: 0 }, CardClass.OldLeaf],
        [Player.North, { x: 2, y: 0 }, CardClass.LilyPad],
        [Player.South, { x: 2, y: 0 }, CardClass.LilyPad],
        [Player.North, { x: 0, y: 1 }, CardClass.LilyPad],
        [Player.South, { x: 0, y: 1 }, CardClass.LilyPad],
        [Player.North, { x: 1, y: 1 }, CardClass.OldLeaf],
        [Player.South, { x: 1, y: 1 }, CardClass.OldLeaf],
        [Player.North, { x: 2, y: 1 }, CardClass.OldLeaf],
        [Player.South, { x: 2, y: 1 }, CardClass.OldLeaf],
        [Player.North, { x: 0, y: 2 }, CardClass.LilyPad],
        [Player.South, { x: 0, y: 2 }, CardClass.LilyPad],
        [Player.North, { x: 1, y: 2 }, CardClass.LilyPad],
        [Player.South, { x: 1, y: 2 }, CardClass.LilyPad],
        [Player.North, { x: 2, y: 2 }, CardClass.OldLeaf],
        [Player.South, { x: 2, y: 2 }, CardClass.OldLeaf],
        [Player.North, { x: 0, y: 3 }, CardClass.OldLeaf],
        [Player.South, { x: 0, y: 3 }, CardClass.OldLeaf],
        [Player.North, { x: 1, y: 3 }, CardClass.LilyPad],
        [Player.South, { x: 1, y: 3 }, CardClass.LilyPad],
        [Player.North, { x: 2, y: 3 }, CardClass.LilyPad],
        [Player.South, { x: 2, y: 3 }, CardClass.LilyPad],
        [Player.North, { x: 0, y: 4 }, CardClass.OldLeaf],
        [Player.South, { x: 0, y: 4 }, CardClass.OldLeaf],
        [Player.North, { x: 1, y: 4 }, CardClass.OldLeaf],
        [Player.South, { x: 1, y: 4 }, CardClass.OldLeaf],
        [Player.North, { x: 2, y: 4 }, CardClass.LilyPad],
        [Player.South, { x: 2, y: 4 }, CardClass.LilyPad],
        [Player.North, { x: 0, y: 5 }, CardClass.LilyPad],
        [Player.South, { x: 0, y: 5 }, CardClass.LilyPad],
        [Player.North, { x: 1, y: 5 }, CardClass.OldLeaf],
        [Player.South, { x: 1, y: 5 }, CardClass.OldLeaf],
        [Player.North, { x: 2, y: 5 }, CardClass.OldLeaf],
        [Player.South, { x: 2, y: 5 }, CardClass.OldLeaf],
      ])(
        "should throw when %s controls %s but doesn't own the %s leaf",
        ([player, xy, leafClass]) => {
          const opponent = PLAYER_AFTER[player];
          const state = createStateWith({
            pond: setPondStateAt(pond, xy, {
              leaf: leafTutor(opponent)(leafClass),
              controller: player,
            }),
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
