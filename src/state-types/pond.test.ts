import { CardClass } from '../types/card';
import { Player } from '../types/gameflow';
import type { Position } from '../types/position';
import { asPosition } from '../types/position.test-utils';
import { createUnit } from './card';
import {
  NORTH_LEAF,
  isPondState,
  LEAF_COUNT_PER_ROW,
  ROW_COUNT,
  setPondStateAt,
  NORTH_UPGRADED,
  type PondState,
  type LeafState,
  getPondStateAt,
  HOME,
  SOUTH_LEAF,
  setPondStateAtEach,
} from './pond';
import {
  NORTH_LEAF_WITH_UNIT,
  NORTH_LEAF_OTHER_UNIT,
  NORTH_LEAF_WITH_UNITS,
  NORTH_UPGRADED_UNITS,
  NORTH_UPGRADED_OTHER_UNIT,
  TestPondKey,
  ANOTHER_POND_POSITIONS as POSITIONS,
  TEST_PONDS_BY_KEY,
} from './pond.test-utils';

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
const addSouthUnit = (old: LeafState) => ({
  units: [...old.units, SOUTH_UNIT],
});
const addNorthUnit = (old: LeafState) => ({
  units: [...old.units, NORTH_UNIT],
});
const upgrade = (old: LeafState) => ({ ...old, isUpgraded: true });
const unupgrade = (old: LeafState) => ({ ...old, isUpgraded: false });
const upgradeAndSetUnits = (_: LeafState) => ({
  isUpgraded: true,
  units: [NORTH_UNIT, SOUTH_UNIT],
});
const removeUnits = () => ({
  units: [],
});

// This one of the most important single functions in the app
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
  valueToSet: Partial<LeafState> | ((old: LeafState) => Partial<LeafState>),
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
  type Updater = (old: LeafState) => Partial<LeafState>;
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
    describe.for<[TestPondKey, string, (old: LeafState) => Partial<LeafState>]>(
      [
        [INITIAL_POND, 'addNorthUnit', addNorthUnit],
        [ANOTHER_POND, 'addSouthUnit', addSouthUnit],
        [FULL_POND, 'unupgrade', unupgrade],
        [INITIAL_POND, 'upgradeAndAddUnit', upgradeAndSetUnits],
        [INITIAL_POND, 'upgrade', upgrade],
        [UNITS_POND, 'removeUnits', removeUnits],
      ],
    )(
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

    // TODO 11: Replace with keys
    describe.for<[TestPondKey, string, LeafState]>([
      [INITIAL_POND, 'NORTH_LEAF', NORTH_LEAF],
      [INITIAL_POND, 'NORTH_LEAF_WITH_UNIT', NORTH_LEAF_WITH_UNIT],
      [INITIAL_POND, 'NORTH_UPGRADED', NORTH_UPGRADED],
      [ANOTHER_POND, 'NORTH_LEAF_WITH_UNIT', NORTH_LEAF_WITH_UNIT],
      [FULL_POND, 'NORTH_LEAF_WITH_UNITS', NORTH_LEAF_WITH_UNITS],
      [FULL_POND, 'NORTH_LEAF_OTHER_UNIT', NORTH_LEAF_OTHER_UNIT],
      [INITIAL_POND, 'NORTH_UPGRADED_UNITS', NORTH_UPGRADED_UNITS],
      [INITIAL_POND, 'NORTH_UPGRADED_OTHER_UNIT', NORTH_UPGRADED_OTHER_UNIT],
      [UNITS_POND, 'NORTH_LEAF', NORTH_LEAF],
      [UNITS_POND, 'NORTH_UPGRADED', NORTH_UPGRADED],
    ])(
      'with known PondState: %s | new value: %s',
      ([pondKey, newValueName, valueToSet]) => {
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
            Object.keys(valueToSet) as (keyof LeafState)[],
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
      const array: ReadonlyArray<ReadonlyArray<LeafState>> =
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
              [...array[i], NORTH_LEAF],
              ...array.slice(i + 1),
            ]),
          ).toBe(false);
          expect(
            isPondState([
              ...array.slice(0, i),
              [...array[i], SOUTH_LEAF],
              ...array.slice(i + 1),
            ]),
          ).toBe(false);
        }
      });
    });
  });
});

describe.for([Player.North, Player.South])(
  `Test positions for %s in ${ANOTHER_POND}`,
  player => {
    const anotherPond = TEST_PONDS_BY_KEY[ANOTHER_POND];
    it.for<keyof (typeof POSITIONS)[Player]>([
      'LeafHomeRow',
      'LeafEdge',
      'UpgradedEdge',
      'LeafMiddle',
      'UpgradedMiddle',
    ])(`should have ${player}.%s controlled by ${player}`, key => {
      const position = POSITIONS[player][key];
      expect(getPondStateAt(anotherPond, position).controller).toBe(player);
    });

    it(`should have all ${player}.LeafHomeRow unupgraded`, () => {
      const position = POSITIONS[player].LeafHomeRow;
      expect(getPondStateAt(anotherPond, position).isUpgraded).toBe(false);
    });

    it(`should have ${player}.LeafHomeRow unupgraded`, () => {
      const position = POSITIONS[player].LeafHomeRow;
      expect(getPondStateAt(anotherPond, position).isUpgraded).toBe(false);
    });

    it(`should have ${player}.LeafHomeRow be on the home row and not Home`, () => {
      const { x, y } = POSITIONS[player].LeafHomeRow;
      expect(x).not.toBe(1);
      expect(y).toBe(HOME[player].y);
    });

    it(`should have ${player}.LeafEdge be unupgraded`, () => {
      const position = POSITIONS[player].LeafEdge;
      expect(getPondStateAt(anotherPond, position).isUpgraded).toBe(false);
    });

    it(`should have ${player}.LeafEdge be on the edge and not the home row`, () => {
      const { x, y } = POSITIONS[player].LeafEdge;
      expect(x).not.toBe(1);
      expect(y).not.toBe(HOME[player].y);
    });

    it(`should have ${player}.UpgradedEdge be unupgraded`, () => {
      const position = POSITIONS[player].UpgradedEdge;
      expect(getPondStateAt(anotherPond, position).isUpgraded).toBe(true);
    });

    it(`should have ${player}.UpgradedEdge be on the edge and not the home row`, () => {
      const { x, y } = POSITIONS[player].UpgradedEdge;
      expect(x).not.toBe(1);
      expect(y).not.toBe(HOME[player].y);
    });

    it(`should have ${player}.LeafMiddle be unupgraded`, () => {
      const position = POSITIONS[player].LeafMiddle;
      expect(getPondStateAt(anotherPond, position).isUpgraded).toBe(false);
    });

    it(`should have ${player}.LeafMiddle be on the edge and not the home row`, () => {
      const { x, y } = POSITIONS[player].LeafMiddle;
      expect(x).toBe(1);
      expect(y).not.toBe(HOME[player].y);
    });

    it(`should have ${player}.UpgradedMiddle be unupgraded`, () => {
      const position = POSITIONS[player].UpgradedMiddle;
      expect(getPondStateAt(anotherPond, position).isUpgraded).toBe(true);
    });

    it(`should have ${player}.UpgradedMiddle be on the edge and not the home row`, () => {
      const { x, y } = POSITIONS[player].UpgradedMiddle;
      expect(x).toBe(1);
      expect(y).not.toBe(HOME[player].y);
    });
  },
);
