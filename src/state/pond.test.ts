import { CardClass } from '../types/card';
import { Player } from '../types/gameflow';
import { createUnit } from './card';
import {
  LEAF,
  INITIAL_POND,
  isPondState,
  LEAF_COUNT_PER_ROW,
  ROW_COUNT,
  setPondStateAt,
  UPGRADED,
  type PondState,
  type LeafState,
  getPondStateAt,
  HOME,
} from './pond';
import {
  ANOTHER_POND,
  EMPTY_POND,
  FULL_POND,
  LEAF_WITH_UNIT,
  LEAF_OTHER_UNIT,
  LEAF_WITH_UNITS,
  UNITS_POND,
  UPGRADED_UNITS,
  UPGRADED_OTHER_UNITS,
  TestPondKey,
  ANOTHER_POND_POSITIONS as POSITIONS,
} from './pond.test-utils';

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
  ...old,
  units: [...old.units, SOUTH_UNIT],
});
const addNorthUnit = (old: LeafState) => ({
  ...old,
  units: [...old.units, NORTH_UNIT],
});
const upgrade = (old: LeafState) => ({ ...old, isUpgraded: true });
const unupgrade = (old: LeafState) => ({ ...old, isUpgraded: false });
const upgradeAndSetUnits = (_: LeafState) => ({
  isUpgraded: true,
  units: [NORTH_UNIT, SOUTH_UNIT],
});
const removeUnits = (old: LeafState) => ({
  ...old,
  units: [],
});

// This one of the most important single functions in the app
// and the tests run fast, so we produce a huge number of test cases.
const describeForAllPositions = (block: (_: [x: number, y: number]) => void) =>
  describe.for<[number, number]>([
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [0, 5],
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
    [2, 5],
  ])('when called for x=%s and y=%s', block);

const itShouldNotChangeOtherZones = (
  pond: PondState,
  valueToSet: Partial<LeafState> | ((old: LeafState) => LeafState),
  [x, y]: [number, number],
) =>
  it('should not change other zones', () => {
    const newPond = setPondStateAt(pond, { x, y }, valueToSet);

    for (let yy = 0; yy < ROW_COUNT; yy += 1) {
      if (yy === y) continue;
      for (let xx = 0; xx < LEAF_COUNT_PER_ROW; xx += 1) {
        if (xx === x) continue;
        const position = { x: xx, y: yy };
        const newValue = getPondStateAt(newPond, position);
        const oldValue = getPondStateAt(pond, position);
        expect(newValue).toBe(newPond[yy][xx]);
        expect(oldValue).toBe(pond[yy][xx]);
        expect(newValue).toBe(oldValue);
      }
    }
  });

describe('the PondState type functions', () => {
  describe(`${setPondStateAt.name} and ${getPondStateAt.name}`, () => {
    describe.for<[string, string, PondState, (old: LeafState) => LeafState]>([
      ['INITIAL_POND', 'addNorthUnit', INITIAL_POND, addNorthUnit],
      ['ANOTHER_POND', 'addSouthUnit', ANOTHER_POND, addSouthUnit],
      ['FULL_POND', 'unupgrade', FULL_POND, unupgrade],
      ['EMPTY_POND', 'upgradeAndAddUnit', EMPTY_POND, upgradeAndSetUnits],
      ['EMPTY_POND', 'upgrade', EMPTY_POND, upgrade],
      ['UNITS_POND', 'removeUnits', UNITS_POND, removeUnits],
    ])(
      'with known PondState: %s | updater function: %s',
      ([_, updaterName, pond, updater]) => {
        describeForAllPositions(([x, y]) => {
          itShouldNotChangeOtherZones(pond, updater, [x, y]);

          it(`should set the value at x=${x}, y=${y} to ${updaterName}`, () => {
            const newPond = setPondStateAt(pond, { x, y }, updater);
            const newValue = getPondStateAt(newPond, { x, y });
            expect(newValue).toBe(newPond[y][x]);
            expect(newValue).toStrictEqual(updater(pond[y][x]));
          });

          it(`should produce a result verified by ${isPondState.name}`, () => {
            const newPond = setPondStateAt(pond, { x, y }, updater);
            expect(isPondState(newPond)).toBe(true);
          });
        });
      },
    );

    describe.for<[string, string, PondState, LeafState]>([
      ['INITIAL_POND', 'LEAF', INITIAL_POND, LEAF],
      ['INITIAL_POND', 'LEAF_WITH_UNIT', INITIAL_POND, LEAF_WITH_UNIT],
      ['INITIAL_POND', 'UPGRADED', INITIAL_POND, UPGRADED],
      ['ANOTHER_POND', 'LEAF_WITH_UNIT', ANOTHER_POND, LEAF_WITH_UNIT],
      ['FULL_POND', 'LEAF_WITH_UNITS', FULL_POND, LEAF_WITH_UNITS],
      ['FULL_POND', 'LEAF_OTHER_UNIT', FULL_POND, LEAF_OTHER_UNIT],
      ['EMPTY_POND', 'UPGRADED_UNITS', EMPTY_POND, UPGRADED_UNITS],
      ['EMPTY_POND', 'UPGRADED_OTHER_UNITS', EMPTY_POND, UPGRADED_OTHER_UNITS],
      ['POND_UNITS', 'LEAF_UNITS', UNITS_POND, LEAF],
      ['POND_UNITS', 'UPGRADED', UNITS_POND, UPGRADED],
    ])(
      'with known PondState: %s | new value: %s',
      ([_, newValueName, pond, valueToSet]) => {
        if (!isPondState(pond)) {
          expect.unreachable();
          return;
        }
        pond satisfies PondState;

        describeForAllPositions(([x, y]) => {
          itShouldNotChangeOtherZones(pond, valueToSet, [x, y]);

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
    describe.for<[string, ReadonlyArray<ReadonlyArray<LeafState>>]>([
      ['INITIAL_POND', INITIAL_POND],
      ['ANOTHER_POND', ANOTHER_POND],
      ['FULL_POND', FULL_POND],
      ['EMPTY_POND', EMPTY_POND],
      ['POND_UNITS', UNITS_POND],
    ])('with known GridState: %s', ([name, array]) => {
      it(`should verify ${name}`, () => {
        expect(isPondState(array)).toBe(true);
        if (isPondState(array)) {
          array satisfies PondState;
        } else expect.unreachable();
      });

      it(`should verify ${name} reversed`, () => {
        const reversed = array.toReversed();
        expect(isPondState(reversed)).toBe(true);
        if (isPondState(reversed)) {
          reversed satisfies PondState;
        } else expect.unreachable();
      });

      it(`should verify ${name} with rows reversed`, () => {
        const reversed = array.map(x => x.toReversed());
        expect(isPondState(reversed)).toBe(true);
        if (isPondState(reversed)) {
          reversed satisfies PondState;
        } else expect.unreachable();
      });

      const PRIME = 83;

      it(`should verify ${name} shuffled`, () => {
        const shuffled = array.map((_, i) => array[(i * PRIME) % array.length]);
        expect(isPondState(shuffled)).toBe(true);
        if (isPondState(shuffled)) {
          shuffled satisfies PondState;
        } else expect.unreachable();
      });

      it(`should verify ${name} with rows shuffled`, () => {
        const shuffled = array.map(row =>
          row.map((_, i) => row[(i * PRIME) % row.length]),
        );
        expect(isPondState(shuffled)).toBe(true);
        if (isPondState(shuffled)) {
          shuffled satisfies PondState;
        } else expect.unreachable();
      });

      it(`should not verify ${name} with an extra row`, () => {
        expect(isPondState([...array, INITIAL_POND[0]])).toBe(false);
      });

      it(`should not verify ${name} with an extra value in a row`, () => {
        for (let i = 0; i < array.length; i += 1) {
          expect(
            isPondState([
              ...array.slice(0, i),
              [...array[i], LEAF],
              ...array.slice(i + 1),
            ]),
          ).toBe(false);
        }
      });
    });
  });
});

describe(TestPondKey.ANOTHER_POND, () => {
  it.for([Player.North, Player.South])(
    'should have %s.LeafHomeRow unupgraded',
    player => {
      const position = POSITIONS[player].LeafHomeRow;
      expect(getPondStateAt(ANOTHER_POND, position).isUpgraded).toBe(false);
    },
  );

  it.for([Player.North, Player.South])(
    'should have %s.LeafHomeRow be on the home row and not Home',
    player => {
      const { x, y } = POSITIONS[player].LeafHomeRow;
      expect(x).not.toBe(1);
      expect(y).toBe(HOME[player].y);
    },
  );

  it.for([Player.North, Player.South])(
    'should have %s.LeafEdge be unupgraded',
    player => {
      const position = POSITIONS[player].LeafEdge;
      expect(getPondStateAt(ANOTHER_POND, position).isUpgraded).toBe(false);
    },
  );

  it.for([Player.North, Player.South])(
    'should have %s.LeafEdge be on the edge and not the home row',
    player => {
      const { x, y } = POSITIONS[player].LeafEdge;
      expect(x).not.toBe(1);
      expect(y).not.toBe(HOME[player].y);
    },
  );

  it.for([Player.North, Player.South])(
    'should have %s.UpgradedEdge be unupgraded',
    player => {
      const position = POSITIONS[player].UpgradedEdge;
      expect(getPondStateAt(ANOTHER_POND, position).isUpgraded).toBe(true);
    },
  );

  it.for([Player.North, Player.South])(
    'should have %s.UpgradedEdge be on the edge and not the home row',
    player => {
      const { x, y } = POSITIONS[player].UpgradedEdge;
      expect(x).not.toBe(1);
      expect(y).not.toBe(HOME[player].y);
    },
  );

  it.for([Player.North, Player.South])(
    'should have %s.LeafMiddle be unupgraded',
    player => {
      const position = POSITIONS[player].LeafMiddle;
      expect(getPondStateAt(ANOTHER_POND, position).isUpgraded).toBe(false);
    },
  );

  it.for([Player.North, Player.South])(
    'should have %s.LeafMiddle be on the edge and not the home row',
    player => {
      const { x, y } = POSITIONS[player].LeafMiddle;
      expect(x).toBe(1);
      expect(y).not.toBe(HOME[player].y);
    },
  );

  it.for([Player.North, Player.South])(
    'should have %s.UpgradedMiddle be unupgraded',
    player => {
      const position = POSITIONS[player].UpgradedMiddle;
      expect(getPondStateAt(ANOTHER_POND, position).isUpgraded).toBe(true);
    },
  );

  it.for([Player.North, Player.South])(
    'should have %s.UpgradedMiddle be on the edge and not the home row',
    player => {
      const { x, y } = POSITIONS[player].UpgradedMiddle;
      expect(x).toBe(1);
      expect(y).not.toBe(HOME[player].y);
    },
  );
});
