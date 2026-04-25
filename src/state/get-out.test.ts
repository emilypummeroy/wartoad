import { HOME, setPondStateAt } from '../state-types/pond';
import { TEST_PONDS_BY_KEY, TestPondKey } from '../state-types/pond.test-utils';
import { CardClass } from '../types/card';
import { Phase, Player, Subphase } from '../types/gameflow';
import { gameData } from './get-out';
import {
  activationOf,
  createStateWith,
  gameflowOf,
  pickedCardOf,
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

      it('should throw when subphase is Idle but pickedCard is present', () => {
        const state = createStateWith({
          pond,
          ...gameflowOf(undefined, Subphase.Idle),
          ...pickedCardOf(CardClass.Froglet),
        });
        expect(() => gameData(state)).toThrow();
      });

      it('should throw when subphase is Activating but pickedCard is present', () => {
        const state = createStateWith({
          pond,
          ...gameflowOf(undefined, Subphase.Activating),
          ...pickedCardOf(CardClass.Froglet),
          ...activationOf({ x: 2, y: 2 }),
        });
        expect(() => gameData(state)).toThrow();
      });

      it.for([Subphase.Upgrading, Subphase.Deploying])(
        'should throw when subphase is %s but pickedCard is missing',
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
            ...activationOf({ x: 1, y: 1 }),
          });
          expect(() => gameData(state)).toThrow();
        },
      );

      it('should throw when subphase is Activating but activation state is missing', () => {
        const state = createStateWith({
          pond,
          ...gameflowOf(undefined, Subphase.Activating),
        });
        expect(() => gameData(state)).toThrow();
      });

      it.for<[Phase, Subphase]>([
        [Phase.Start, Subphase.Upgrading],
        [Phase.Start, Subphase.Deploying],
        [Phase.End, Subphase.Upgrading],
        [Phase.End, Subphase.Deploying],
      ])(
        'should throw when phase is Start but subphase is %s',
        ([phase, subphase]) => {
          const state = createStateWith({
            pond,
            ...gameflowOf(undefined, subphase, phase),
            ...pickedCardOf(CardClass.Froglet),
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
            ...activationOf({ x: 0, y: 3 }),
          });
          expect(() => gameData(state)).toThrow();
        },
      );
    },
  );
});
