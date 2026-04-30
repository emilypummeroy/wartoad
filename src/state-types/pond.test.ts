import { CardClass } from '../types/card';
import { Player } from '../types/gameflow';
import type { Position } from '../types/position';
import { asPosition } from '../types/position.test-utils';
import { createUnit } from './card';
import {
  isPondState,
  LEAF_COUNT_PER_ROW,
  ROW_COUNT,
  setPondStateAt,
  type PondState,
  type PondLeafState,
  getPondStateAt,
  setPondStateAtEach,
} from './pond';
import {
  TestPondKey,
  TEST_PONDS_BY_KEY,
  TestLeafKey,
  TEST_LEAVES_BY_KEY,
} from './pond.test-utils';

const {
  NORTH_LEAF,
  NORTH_LEAF_WITH_UNIT,
  NORTH_LEAF_OTHER_UNIT,
  NORTH_LILYPAD,
  NORTH_LILYPAD_UNITS,
  SOUTH_LEAF,
  SOUTH_LEAF_WITH_UNIT,
  SOUTH_LEAF_OTHER_UNIT,
  SOUTH_LILYPAD,
  SOUTH_LILYPAD_UNITS,
} = TestLeafKey;
const { INITIAL_POND, ANOTHER_POND, FULL_POND, UNITS_POND } = TestPondKey;

const SOUTH_UNIT = createUnit({
  cardClass: CardClass.Froglet,
  key: 76,
  owner: Player.South,
});
const NORTH_UNIT = createUnit({
  cardClass: CardClass.Froglet,
  key: 77,
  owner: Player.North,
});
const addSouthUnit = (old: PondLeafState) => ({
  units: [...old.units, SOUTH_UNIT],
});
const addNorthUnit = (old: PondLeafState) => ({
  units: [...old.units, NORTH_UNIT],
});
const upgrade = (old: PondLeafState) => ({ ...old, isUpgraded: true });
const unupgrade = (old: PondLeafState) => ({ ...old, isUpgraded: false });
const upgradeAndSetUnits = (_: PondLeafState) => ({
  isUpgraded: true,
  units: [NORTH_UNIT, SOUTH_UNIT],
});
const removeUnits = () => ({
  units: [],
});

// This file has some of the most important functions in the app
// and the tests run fast, so we produce a huge number of test cases.
const describeForAllPositions = (block: (_: Position) => void) =>
  describe.for<Position>([
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 0, y: 3 },
    { x: 0, y: 4 },
    { x: 0, y: 5 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 2 },
    { x: 1, y: 3 },
    { x: 1, y: 4 },
    { x: 1, y: 5 },
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 2, y: 2 },
    { x: 2, y: 3 },
    { x: 2, y: 4 },
    { x: 2, y: 5 },
  ])('when called for %s', block);

const itShouldNotChangeOtherZones = (
  pond: PondState,
  valueToSet:
    | Partial<PondLeafState>
    | ((old: PondLeafState) => Partial<PondLeafState>),
  { x, y }: Position,
) =>
  it('should not change other zones', () => {
    const newPond = setPondStateAt(pond, { x, y }, valueToSet);

    for (let yy = 0; yy < ROW_COUNT; yy += 1) {
      if (yy === y) continue;
      for (let xx = 0; xx < LEAF_COUNT_PER_ROW; xx += 1) {
        if (xx === x) continue;
        const position = asPosition({ x: xx, y: yy });
        const newValue = getPondStateAt(newPond, position);
        const oldValue = getPondStateAt(pond, position);
        expect(newValue).toBe(newPond[yy][xx]);
        expect(oldValue).toBe(pond[yy][xx]);
        expect(newValue).toBe(oldValue);
      }
    }
  });

describe('the PondState type functions', () => {
  type Updater = (old: PondLeafState) => Partial<PondLeafState>;
  describe(setPondStateAtEach, () => {
    describe.for<[TestPondKey, string, string, Updater, Updater]>([
      [
        INITIAL_POND,
        'addNorthUnit',
        'addSouthUnit',
        addNorthUnit,
        addSouthUnit,
      ],
      [ANOTHER_POND, 'addSouthUnit', 'unupgrade', addSouthUnit, unupgrade],
      [FULL_POND, 'unupgrade', 'addNorthUnit', unupgrade, addNorthUnit],
      [
        INITIAL_POND,
        'unupgrade',
        'upgradeAndSetUnits',
        upgradeAndSetUnits,
        unupgrade,
      ],
      [FULL_POND, 'unupgrade', 'upgrade', unupgrade, upgrade],
      [UNITS_POND, 'addNorthUnit', 'removeUnits', addNorthUnit, removeUnits],
    ])(
      'with known PondState: %s | updater functions: %s and %s',
      ([pondKey, , _, first, second]) => {
        const pond = TEST_PONDS_BY_KEY[pondKey];
        describeForAllPositions(({ x, y }) => {
          describe('if both updates are for the same position', () => {
            it('should not change other zones', () => {
              const newPond = setPondStateAtEach(
                pond,
                [{ x, y }, first],
                [{ x, y }, second],
              );

              for (let yy = 0; yy < ROW_COUNT; yy += 1) {
                if (yy === y) continue;
                for (let xx = 0; xx < LEAF_COUNT_PER_ROW; xx += 1) {
                  if (xx === x) continue;
                  const position = asPosition({ x: xx, y: yy });
                  const newValue = getPondStateAt(newPond, position);
                  const oldValue = getPondStateAt(pond, position);
                  expect(newValue).toBe(newPond[yy][xx]);
                  expect(oldValue).toBe(pond[yy][xx]);
                  expect(newValue).toBe(oldValue);
                }
              }
            });

            it(`should set the value at x=${x}, y=${y}`, () => {
              const newPond = setPondStateAtEach(
                pond,
                [{ x, y }, first],
                [{ x, y }, second],
              );
              const newValue = getPondStateAt(newPond, { x, y });
              expect(newValue).toBe(newPond[y][x]);
              const wantMiddle = { ...pond[y][x], ...first(pond[y][x]) };
              const want = { ...wantMiddle, ...second(wantMiddle) };
              expect(newValue).toStrictEqual(want);
            });

            it(`should produce a result verified by ${isPondState.name}`, () => {
              const newPond = setPondStateAtEach(
                pond,
                [{ x, y }, first],
                [{ x, y }, second],
              );
              expect(isPondState(newPond)).toBe(true);
            });
          });

          const { x: x2, y: y2 } = asPosition({
            x: (x + 1) % 3,
            y: (y + 2) % 5,
          });
          describe(`applying to a second position { x: ${x2} y: ${y2} }`, () => {
            it(`should set the value at x1=${x}, y1=${y}`, () => {
              const newPond = setPondStateAtEach(
                pond,
                [{ x, y }, first],
                [{ x: x2, y: y2 }, second],
              );
              const newValue = getPondStateAt(newPond, { x, y });
              expect(newValue).toBe(newPond[y][x]);
              expect(newValue).toStrictEqual({
                ...pond[y][x],
                ...first(pond[y][x]),
              });
            });

            it(`should set the value at x2=${x2}, y2=${y2}`, () => {
              const newPond = setPondStateAtEach(
                pond,
                [{ x, y }, first],
                [{ x: x2, y: y2 }, second],
              );
              const newValue = getPondStateAt(newPond, { x: x2, y: y2 });
              expect(newValue).toBe(newPond[y2][x2]);
              expect(newValue).toStrictEqual({
                ...pond[y2][x2],
                ...second(pond[y2][x2]),
              });
            });

            it(`should produce a result verified by ${isPondState.name}`, () => {
              const newPond = setPondStateAtEach(
                pond,
                [{ x, y }, first],
                [{ x: x2, y: y2 }, second],
              );
              expect(isPondState(newPond)).toBe(true);
            });

            it('should not change other zones', () => {
              const newPond = setPondStateAtEach(
                pond,
                [{ x, y }, first],
                [{ x: x2, y: y2 }, second],
              );

              for (let yy = 0; yy < ROW_COUNT; yy += 1) {
                for (let xx = 0; xx < LEAF_COUNT_PER_ROW; xx += 1) {
                  if (xx === x && yy === y) continue;
                  if (xx === x2 && yy === y2) continue;
                  const position = asPosition({ x: xx, y: yy });
                  const newValue = getPondStateAt(newPond, position);
                  const oldValue = getPondStateAt(pond, position);
                  expect(newValue).toBe(newPond[yy][xx]);
                  expect(oldValue).toBe(pond[yy][xx]);
                  expect(newValue).toBe(oldValue);
                }
              }
            });
          });
        });
      },
    );
  });

  describe(`${setPondStateAt.name} and ${getPondStateAt.name}`, () => {
    describe.for<
      [TestPondKey, string, (old: PondLeafState) => Partial<PondLeafState>]
    >([
      [INITIAL_POND, 'addNorthUnit', addNorthUnit],
      [ANOTHER_POND, 'addSouthUnit', addSouthUnit],
      [FULL_POND, 'unupgrade', unupgrade],
      [INITIAL_POND, 'upgradeAndAddUnit', upgradeAndSetUnits],
      [INITIAL_POND, 'upgrade', upgrade],
      [UNITS_POND, 'removeUnits', removeUnits],
    ])(
      'with known PondState: %s | updater function: %s',
      ([pondKey, updaterName, updater]) => {
        const pond = TEST_PONDS_BY_KEY[pondKey];
        describeForAllPositions(({ x, y }) => {
          itShouldNotChangeOtherZones(pond, updater, { x, y });

          it(`should set the value at x=${x}, y=${y} to ${updaterName}`, () => {
            const newPond = setPondStateAt(pond, { x, y }, updater);
            const newValue = getPondStateAt(newPond, { x, y });
            expect(newValue).toBe(newPond[y][x]);
            expect(newValue).toStrictEqual({
              ...pond[y][x],
              ...updater(pond[y][x]),
            });
          });

          it(`should produce a result verified by ${isPondState.name}`, () => {
            const newPond = setPondStateAt(pond, { x, y }, updater);
            expect(isPondState(newPond)).toBe(true);
          });
        });
      },
    );

    describe.for<[TestPondKey, TestLeafKey]>([
      [INITIAL_POND, NORTH_LEAF],
      [INITIAL_POND, SOUTH_LEAF],
      [UNITS_POND, NORTH_LILYPAD],
      [UNITS_POND, SOUTH_LILYPAD],
      [ANOTHER_POND, NORTH_LEAF_WITH_UNIT],
      [ANOTHER_POND, SOUTH_LEAF_WITH_UNIT],
      [FULL_POND, NORTH_LEAF_OTHER_UNIT],
      [FULL_POND, SOUTH_LEAF_OTHER_UNIT],
      [INITIAL_POND, NORTH_LILYPAD_UNITS],
      [INITIAL_POND, SOUTH_LILYPAD_UNITS],
    ])(
      'with known PondState: %s | new value: %s',
      ([pondKey, newValueName]) => {
        const valueToSet = TEST_LEAVES_BY_KEY[newValueName];
        const pond = TEST_PONDS_BY_KEY[pondKey];
        if (!isPondState(pond)) {
          expect.unreachable();
          return;
        }
        pond satisfies PondState;

        describeForAllPositions(({ x, y }) => {
          itShouldNotChangeOtherZones(pond, valueToSet, { x, y });

          it(`should set the value at x=${x}, y=${y} to ${newValueName}`, () => {
            const newPond = setPondStateAt(pond, { x, y }, valueToSet);
            const newValue = getPondStateAt(newPond, { x, y });
            expect(newValue).toBe(newPond[y][x]);
            expect(newValue).toStrictEqual(valueToSet);
          });

          it(`should produce a result verified by ${isPondState.name}`, () => {
            const newPond = setPondStateAt(pond, { x, y }, valueToSet);
            expect(isPondState(newPond)).toBe(true);
          });

          describe.for(
            // oxlint-disable-next-line typescript/no-unsafe-type-assertion
            Object.keys(valueToSet) as (keyof PondLeafState)[],
          )('when called with partial state: %s', key => {
            it(`should set zone.${key} at x=${x}, y=${y} to ${newValueName}.${key} `, () => {
              const newPond = setPondStateAt(
                pond,
                { x, y },
                { [key]: valueToSet[key] },
              );
              const newValue = getPondStateAt(newPond, { x, y });
              expect(newValue).toBe(newPond[y][x]);
              expect(newValue[key]).toStrictEqual(valueToSet[key]);
            });

            it(`should set not change other properties besides ${key} at x=${x}, y=${y}`, () => {
              const { [key]: _, ...oldZone } = pond[y][x];
              const newPond = setPondStateAt(
                pond,
                { x, y },
                { [key]: valueToSet[key] },
              );
              const { [key]: __, ...newValue } = newPond[y][x];
              expect(newValue).toStrictEqual(oldZone);
            });
          });
        });
      },
    );
  });

  describe(isPondState, () => {
    describe.for<TestPondKey>([
      INITIAL_POND,
      ANOTHER_POND,
      FULL_POND,
      UNITS_POND,
    ])('with known GridState: %s', pondKey => {
      const array: ReadonlyArray<ReadonlyArray<PondLeafState>> =
        TEST_PONDS_BY_KEY[pondKey];
      it(`should verify the pond`, () => {
        expect(isPondState(array)).toBe(true);
        if (isPondState(array)) {
          array satisfies PondState;
        } else expect.unreachable();
      });

      it(`should verify the pond reversed`, () => {
        const reversed = array.toReversed();
        expect(isPondState(reversed)).toBe(true);
        if (isPondState(reversed)) {
          reversed satisfies PondState;
        } else expect.unreachable();
      });

      it(`should verify the pond with rows reversed`, () => {
        const reversed = array.map(x => x.toReversed());
        expect(isPondState(reversed)).toBe(true);
        if (isPondState(reversed)) {
          reversed satisfies PondState;
        } else expect.unreachable();
      });

      const PRIME = 83;

      it(`should verify the pond shuffled`, () => {
        const shuffled = array.map((_, i) => array[(i * PRIME) % array.length]);
        expect(isPondState(shuffled)).toBe(true);
        if (isPondState(shuffled)) {
          shuffled satisfies PondState;
        } else expect.unreachable();
      });

      it(`should verify the pond with rows shuffled`, () => {
        const shuffled = array.map(row =>
          row.map((_, i) => row[(i * PRIME) % row.length]),
        );
        expect(isPondState(shuffled)).toBe(true);
        if (isPondState(shuffled)) {
          shuffled satisfies PondState;
        } else expect.unreachable();
      });

      it(`should not verify the pond with an extra row`, () => {
        expect(isPondState([...array, array[0]])).toBe(false);
      });

      it(`should not verify the pond with an extra value in a row`, () => {
        for (let i = 0; i < array.length; i += 1) {
          expect(
            isPondState([
              ...array.slice(0, i),
              [...array[i], TEST_LEAVES_BY_KEY.NORTH_LEAF],
              ...array.slice(i + 1),
            ]),
          ).toBe(false);
          expect(
            isPondState([
              ...array.slice(0, i),
              [...array[i], TEST_LEAVES_BY_KEY.SOUTH_LEAF],
              ...array.slice(i + 1),
            ]),
          ).toBe(false);
        }
      });
    });
  });
});
