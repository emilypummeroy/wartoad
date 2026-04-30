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
type Preconditions = [Player, Phase, owner?: Player, isExhausted?: boolean];

const it_should_not_change_state_with_failed_precondition =
  (xy: Position) =>
  ([player, phase, owner = player, isExhausted = false]: Preconditions) => {
    let unit = createUnit({
      cardClass: UnitClass.Froglet,
      key: key++,
      owner,
    });
    unit = {
      ...unit,
      isExhausted,
    };
    const oldState = createStateWith({
      ...gameflowOf(player, phase),
      ...phaseStateOf(player, phase),
    });

    it('should not change the state', () => {
      expect(activate(unit, xy)(oldState)).toStrictEqual(oldState);
    });
  };

describe(activate, () => {
  describe.for<Position>(ALL_POSITIONS)('with start position %s', xy => {
    // Preconditions:
    describe.for<Preconditions>([
      [North, Upgrading],
      [North, Deploying],
      [North, Activating],
      [South, Upgrading],
      [South, Deploying],
      [South, Activating],
      [North, Start],
      [North, End],
      [South, Start],
      [South, End],
    ])(
      'Precondition (Main phase) failed: | %s %s | %s owner',
      it_should_not_change_state_with_failed_precondition(xy),
    );

    describe.for<Preconditions>([
      [North, Main, South],
      [South, Main, North],
    ])(
      'Precondition (turn player owns unit) failed: | %s %s | %s owner',
      it_should_not_change_state_with_failed_precondition(xy),
    );

    describe.for<Preconditions>([
      [North, Main, North, true],
      [South, Main, South, true],
    ])(
      'Precondition (unit not exhausted) failed: | %s %s | %s owner',
      it_should_not_change_state_with_failed_precondition(xy),
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
