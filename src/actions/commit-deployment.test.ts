import type { GameState } from '../state-types';
import { createUnit } from '../state-types/card';
import { makeHand } from '../state-types/deck.test-utils';
import {
  getPondStateAt,
  LEAF_COUNT_PER_ROW,
  ROW_COUNT,
  setPondStateAt,
} from '../state-types/pond';
import { INITIAL_POND } from '../state-types/pond.test-utils';
import {
  createStateWith,
  deploymentOf,
  gameflowOf,
  phaseStateOf,
} from '../state/test-utils';
import { CardClass } from '../types/card';
import { Phase, Player, PLAYER_AFTER } from '../types/gameflow';
import type { Position } from '../types/position';
import { counter } from '../types/test-utils';
import { commitDeployment } from './commit-deployment';

const { North, South } = Player;
const { Upgrading, Deploying, Activating, Start, Main, End } = Phase;

type Input = [target: Position, Player, targetUnits: number];
type Preconditions = [Position, Player, Phase];

describe(commitDeployment, () => {
  describe.for<Preconditions>([
    // < Deploying
    [{ x: 1, y: 0 }, North, Main],
    [{ x: 2, y: 5 }, South, Activating],
    [{ x: 1, y: 0 }, North, Upgrading],
    [{ x: 0, y: 5 }, South, End],
    [{ x: 2, y: 0 }, North, Start],
  ])('Precondition failed: Need Deploying | target: %s | flow: %s %s', input =>
    it_should_return_state_unchanged(input),
  );

  describe.for<Preconditions>([
    // < Target on home row
    [{ x: 1, y: 5 }, North, Deploying],
    [{ x: 0, y: 1 }, North, Deploying],
    [{ x: 2, y: 0 }, South, Deploying],
    [{ x: 1, y: 4 }, South, Deploying],
  ])(
    'Precondition failed: Target not in Home row | target: %s | flow: %s %s',
    input => it_should_return_state_unchanged(input),
  );

  const it_should_return_state_unchanged = ([
    target,
    player,
    phase,
  ]: Preconditions) => {
    it('should return the input unchanged', () => {
      const old = createStateWith({
        ...gameflowOf(player, phase),
        ...phaseStateOf(player, phase),
      });
      const got = commitDeployment(target)(old);
      expect(got).toStrictEqual(old);
    });
  };

  describe.for<Input>([
    [{ x: 0, y: 0 }, North, 0],
    [{ x: 1, y: 0 }, North, 2],
    [{ x: 2, y: 0 }, North, 1],
    [{ x: 1, y: 0 }, North, 3],
    [{ x: 2, y: 5 }, South, 1],
    [{ x: 2, y: 5 }, South, 1],
    [{ x: 0, y: 5 }, South, 0],
    [{ x: 0, y: 5 }, South, 2],
  ])(
    `Postconditions: target = %s | %s turn player and card owner | %s units at target`,
    input => {
      const [target, player, targetCount] = input;
      const unit = createUnit({
        cardClass: CardClass.Froglet,
        owner: player,
        key: counter(),
      });
      const targetUnits = Array.from({ length: targetCount }, () =>
        createUnit({
          cardClass: CardClass.Froglet,
          owner: player,
          key: counter(),
        }),
      );
      const restOfHand = makeHand(player, 5);
      const playerHand =
        player === North ? [...restOfHand, unit] : [unit, ...restOfHand];

      const before = createStateWith({
        ...deploymentOf(player, unit),
        ...gameflowOf(player, Deploying),
        ...(player === North
          ? { northHand: playerHand }
          : { southHand: playerHand }),
        pond: setPondStateAt(INITIAL_POND, target, { units: targetUnits }),
      });

      it('should add the card to the target position', () => {
        const after = commitDeployment(target)(before);
        const got = getPondStateAt(after.pond, target).units;
        const beforeTarget = getPondStateAt(before.pond, target);
        for (const card of beforeTarget.units) expect(got).toContain(card);
        expect(got).toContain(unit);
      });

      it('should unset the deployment', () => {
        const result = commitDeployment(target)(before);
        expect(result.deployment).toBeUndefined();
      });

      it(`should remove the card from the ${player} hand`, () => {
        const after = commitDeployment(target)(before);
        const got = player === North ? after.northHand : after.southHand;
        for (const card of restOfHand) expect(got).toContain(card);
        expect(got).not.toContain(unit);
      });

      const opponent = PLAYER_AFTER[player];
      it(`should not change the ${opponent} hand`, () => {
        const after = commitDeployment(target)(before);
        const got = opponent === North ? after.northHand : after.southHand;
        const want = opponent === North ? before.northHand : before.southHand;
        expect(got).toStrictEqual(want);
      });

      it('should set phase to Main', () => {
        const result = commitDeployment(target)(before);
        expect(result.flow.phase).toBe(Main);
      });

      it_should_not_affect_anything_else(target, before);
    },
  );

  const it_should_not_affect_anything_else = (
    target: Position,
    before: GameState,
  ) => {
    // Parts of state changed by the action.
    it('should not affect the rest of gameflow state', () => {
      const after = commitDeployment(target)(before);
      let got = {};
      let want = {};
      {
        const { phase: __, ...rest } = after.flow;
        got = rest;
      }
      {
        const { phase: __, ...rest } = before.flow;
        want = rest;
      }
      expect(got).toStrictEqual(want);
    });

    it('should not affect any other positions', () => {
      const after = commitDeployment(target)(before);
      // Excluding rows/leaves by spreading shenanigans isn't
      // worth it, it's more annoying than just iterating.
      for (let x = 0; x < LEAF_COUNT_PER_ROW; x += 1) {
        for (let y = 0; y < ROW_COUNT; y += 1) {
          assert(x === 0 || x === 1 || x === 2);
          assert(
            y === 0 || y === 1 || y === 2 || y === 3 || y === 4 || y === 5,
          );
          if (x === target.x && y === target.y) continue;
          const want = getPondStateAt(before.pond, { x, y });
          const got = getPondStateAt(after.pond, { x, y });
          expect(got, `${x}-${y}`).toStrictEqual(want);
        }
      }
    });

    it(`should not affect the rest of the leaf at the target`, () => {
      const after = commitDeployment(target)(before);
      const { units: _, ...got } = getPondStateAt(after.pond, target);
      const { units: __, ...want } = getPondStateAt(before.pond, target);
      expect(got).toStrictEqual(want);
    });

    it('should not affect the rest of game state', () => {
      const after = commitDeployment(target)(before);
      let got = {};
      let want = {};
      {
        const {
          flow: _,
          pond: __,
          deployment: ___,
          northHand: ____,
          southHand: _____,
          ...rest
        } = after;
        got = rest;
      }
      {
        const {
          flow: _,
          pond: __,
          deployment: ___,
          northHand: ____,
          southHand: _____,
          ...rest
        } = after;
        want = rest;
      }
      expect(got).toStrictEqual(want);
    });
  };
});
