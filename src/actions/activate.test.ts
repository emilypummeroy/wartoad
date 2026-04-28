import type { GameState } from '../state-types';
import { createUnit } from '../state-types/card';
import { createStateWith, gameflowOf, phaseStateOf } from '../state/test-utils';
import { UnitClass } from '../types/card';
import { Phase, Player } from '../types/gameflow';
import type { Position } from '../types/position';
import { ALL_POSITIONS } from '../types/position.test-utils';
import { activate } from './activate';

const { North, South } = Player;
const { Upgrading, Deploying, Activating, Start, Main, End } = Phase;
let key = 0;
describe(activate, () => {
  describe.for<Position>(ALL_POSITIONS)('with start position %s', xy => {
    // Preconditions:
    describe.for<[string, Player, Phase, owner: Player]>([
      ['Need Idle', North, Upgrading, North],
      ['Need Idle', North, Deploying, North],
      ['Need Idle', North, Activating, North],
      ['Need Idle', South, Upgrading, South],
      ['Need Idle', South, Deploying, South],
      ['Need Idle', South, Activating, South],

      ['Need Main phase', North, Start, North],
      ['Need Main phase', North, End, North],
      ['Need Main phase', South, Start, South],
      ['Need Main phase', South, End, South],

      ['player must own unit', North, Main, South],
      ['player must own unit', South, Main, North],
    ])(
      'Precondition failed: %s | %s %s | %s owner',
      ([_, player, phase, owner]) => {
        const unit = createUnit({
          cardClass: UnitClass.Froglet,
          key: key++,
          owner,
        });
        const oldState = createStateWith({
          ...gameflowOf(player, phase),
          ...phaseStateOf(player, phase),
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
      'Postconditions | Main | owner = player = %s | key = %s',
      ([player, key]) => {
        // Parts of state changed by the action.
        const changedKeys: (keyof GameState)[] = ['flow', 'activation'];

        const unit = createUnit({
          cardClass: UnitClass.Froglet,
          key,
          owner: player,
        });
        const oldState = createStateWith({
          ...gameflowOf(player, Main),
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

        it('should set phase to Activating', () => {
          const newState = activate(unit, xy)(oldState);
          const got = newState.flow.phase;
          expect(got).toStrictEqual(Activating);
        });

        it('should not change the player', () => {
          const newState = activate(unit, xy)(oldState);
          const got = newState.flow.player;
          expect(got).toStrictEqual(player);
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
