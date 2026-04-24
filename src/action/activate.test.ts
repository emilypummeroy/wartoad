import type { GameState } from '../state-types';
import { createUnit } from '../state-types/card';
import {
  activationOf,
  createStateWith,
  gameflowOf,
  pickedCardOf,
} from '../state/test-utils';
import { CardClass, UnitClass } from '../types/card';
import { Phase, Player, Subphase } from '../types/gameflow';
import type { Position } from '../types/position';
import { ALL_POSITIONS } from '../types/position.test-utils';
import { activate } from './activate';

const { North, South } = Player;
const { Idle, Upgrading, Deploying, Activating } = Subphase;
const { Start, Main, End } = Phase;
let key = 0;
describe(activate, () => {
  describe.for<Position>(ALL_POSITIONS)('with start position %s', xy => {
    // Preconditions:
    describe.for<[string, Player, Subphase, Phase, owner: Player]>([
      ['Need Idle', North, Upgrading, Main, North],
      ['Need Idle', North, Deploying, Main, North],
      ['Need Idle', North, Activating, Main, North],
      ['Need Idle', South, Upgrading, Main, South],
      ['Need Idle', South, Deploying, Main, South],
      ['Need Idle', South, Activating, Main, South],

      ['Need Main phase', North, Idle, Start, North],
      ['Need Main phase', North, Idle, End, North],
      ['Need Main phase', South, Idle, Start, South],
      ['Need Main phase', South, Idle, End, South],

      ['player must own unit', North, Idle, Main, South],
      ['player must own unit', South, Idle, Main, North],
    ])(
      'Precondition failed: %s | %s %s %s | %s owner',
      ([_, player, subphase, phase, owner]) => {
        const unit = createUnit({
          cardClass: UnitClass.Froglet,
          key: key++,
          owner,
        });
        const oldState = createStateWith({
          ...gameflowOf(player, subphase, phase),
          ...(subphase === Activating && activationOf(xy, unit)),
          ...(subphase === Upgrading && pickedCardOf(CardClass.LilyPad)),
          ...(subphase === Deploying && pickedCardOf(CardClass.LilyPad)),
        });

        it('should not change the state', () => {
          expect(activate(unit, xy)(oldState)).toStrictEqual(oldState);
        });
      },
    );

    // Preconditions met:
    // Idle & Main Phase & unit owner = player
    describe.for<[Player, number]>([
      [North, 1],
      [South, 2],
      [South, 3],
      [North, 4],
    ])(
      'Postconditions | Main Idle | owner = player = %s | key = %s',
      ([player, key]) => {
        // Parts of state changed by the action.
        const changedKeys: (keyof GameState)[] = ['flow', 'activation'];

        const unit = createUnit({
          cardClass: UnitClass.Froglet,
          key,
          owner: player,
        });
        const oldState = createStateWith({
          ...gameflowOf(player, Idle),
        });

        it('should set the start position of the activation state', () => {
          const newState = activate(unit, xy)(oldState);
          const got = newState.activation?.start;
          expect(got).toStrictEqual(xy);
        });

        it('should set the unit of the activation state', () => {
          const newState = activate(unit, xy)(oldState);
          const got = newState.activation?.unit;
          expect(got).toStrictEqual(unit);
        });

        it('should set subphase to Activating', () => {
          const newState = activate(unit, xy)(oldState);
          const got = newState.flow.subphase;
          expect(got).toStrictEqual(Activating);
        });

        it('should not change the phase and player', () => {
          const newState = activate(unit, xy)(oldState);
          const { phase, player } = newState.flow;
          expect(phase).toStrictEqual(Main);
          expect(player).toStrictEqual(player);
        });

        it('should not change the rest of state', () => {
          const newState = activate(unit, xy)(oldState);
          const { ...got }: Partial<GameState> = newState;
          const { ...want }: Partial<GameState> = oldState;
          for (const key of changedKeys) {
            delete got[key];
            delete want[key];
          }
          expect(got).toStrictEqual(want);
        });
      },
    );
  });
});
