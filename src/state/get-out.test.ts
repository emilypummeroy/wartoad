import { HOME, setPondStateAt } from '../state-types/pond';
import { TEST_PONDS_BY_KEY, TestPondKey } from '../state-types/pond.test-utils';
import { Phase, Player, PLAYER_AFTER, Subphase } from '../types/gameflow';
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
            pond: setPondStateAt(pond, HOME[player], {
              isUpgraded: false,
            }),
          });
          expect(() => gameData(state)).toThrow();
        },
      );

      it.for([Subphase.Upgrading, Subphase.Deploying, Subphase.Activating])(
        'should throw when subphase is %s but subphase state is missing',
        subphase => {
          const state = createStateWith({
            pond,
            ...gameflowOf(undefined, subphase),
          });
          expect(() => gameData(state)).toThrow();
        },
      );

      it.for([Subphase.Idle, Subphase.Upgrading, Subphase.Deploying])(
        'should throw when subphase is %s but activation state is present',
        subphase => {
          const state = createStateWith({
            pond,
            ...gameflowOf(undefined, subphase),
            ...activationOf(Player.North),
          });
          expect(() => gameData(state)).toThrow();
        },
      );

      it.for([Subphase.Idle, Subphase.Activating, Subphase.Deploying])(
        'should throw when subphase is %s but upgrade state is present',
        subphase => {
          const state = createStateWith({
            pond,
            ...gameflowOf(undefined, subphase),
            ...upgradeOf(Player.North),
          });
          expect(() => gameData(state)).toThrow();
        },
      );

      it.for([Subphase.Idle, Subphase.Activating, Subphase.Upgrading])(
        'should throw when subphase is %s but deployment state is present',
        subphase => {
          const state = createStateWith({
            pond,
            ...gameflowOf(undefined, subphase),
            ...deploymentOf(Player.North),
          });
          expect(() => gameData(state)).toThrow();
        },
      );

      it.for<
        [
          Phase,
          Subphase,
          upgrader?: Player,
          deployer?: Player,
          activater?: Player,
        ]
      >([
        [Phase.Start, Subphase.Upgrading, Player.North, _, _],
        [Phase.Start, Subphase.Deploying, _, Player.South, _],
        [Phase.Start, Subphase.Activating, _, _, Player.North],
        [Phase.End, Subphase.Upgrading, Player.South, _, _],
        [Phase.End, Subphase.Deploying, _, Player.North],
        [Phase.End, Subphase.Activating, _, _, Player.South],
      ])(
        'should throw when phase is Start but subphase is %s',
        ([phase, subphase, upgrader, deployer, activater]) => {
          const state = createStateWith({
            pond,
            ...gameflowOf(undefined, subphase, phase),
            ...upgradeOf(upgrader),
            ...deploymentOf(deployer),
            ...activationOf(activater),
          });
          expect(() => gameData(state)).toThrow();
        },
      );

      it.for([Phase.Start, Phase.End])(
        'should throw when phase is %s but subphase is Activating',
        phase => {
          const state = createStateWith({
            pond,
            ...gameflowOf(undefined, Subphase.Activating, phase),
            ...activationOf(Player.South),
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
            ...gameflowOf(undefined, undefined, phase),
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
            ...gameflowOf(undefined, undefined, Phase.GameOver),
            winner,
          });
          expect(() => gameData(state)).toThrow();
        },
      );

      it.for<Player>([Player.North, Player.South])(
        'should throw %s has captured opponent Home but is not the winner',
        winner => {
          const opponentHome = HOME[PLAYER_AFTER[winner]];
          const state = createStateWith({
            pond: setPondStateAt(pond, opponentHome, { controller: winner }),
            ...gameflowOf(undefined, undefined, Phase.GameOver),
          });
          expect(() => gameData(state)).toThrow();
        },
      );
    },
  );
});
