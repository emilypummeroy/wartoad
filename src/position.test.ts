// oxlint-disable no-magic-numbers
import { positionsAreEqual, type Position } from './position';

const ALL_POSITIONS: Position[] = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 2, y: 1 },
  { x: 0, y: 2 },
  { x: 1, y: 2 },
  { x: 2, y: 2 },
  { x: 0, y: 3 },
  { x: 1, y: 3 },
  { x: 2, y: 3 },
  { x: 0, y: 4 },
  { x: 1, y: 4 },
  { x: 2, y: 4 },
  { x: 0, y: 5 },
  { x: 1, y: 5 },
  { x: 2, y: 5 },
];

const SOUTH_POSITIONS: Position[] = [
  { x: 0, y: 3 },
  { x: 1, y: 3 },
  { x: 2, y: 3 },
  { x: 0, y: 4 },
  { x: 1, y: 4 },
  { x: 2, y: 4 },
  { x: 0, y: 5 },
  { x: 1, y: 5 },
  { x: 2, y: 5 },
];

const CENTRE_POSITIONS: Position[] = [
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 1, y: 2 },
  { x: 1, y: 3 },
  { x: 1, y: 4 },
  { x: 1, y: 5 },
];

const SOUTH_CENTRE_POSITIONS: Position[] = [
  { x: 1, y: 3 },
  { x: 1, y: 4 },
  { x: 1, y: 5 },
];

describe(positionsAreEqual, () => {
  describe.for(ALL_POSITIONS)('for position %s', ({ x, y }) => {
    it('should return true for an identical position', () => {
      expect(positionsAreEqual({ x, y }, { x, y })).toBe(true);
    });
  });

  describe.for(SOUTH_POSITIONS)('for south half position %s', ({ x, y }) => {
    it('should return false for the opposite position', () => {
      expect(positionsAreEqual({ x, y }, { x: 2 - x, y: 5 - y })).toBe(false);
      expect(positionsAreEqual({ x: 2 - x, y: 5 - y }, { x, y })).toBe(false);
    });
  });

  describe.for(CENTRE_POSITIONS)('for centre file position %s', ({ x, y }) => {
    it('should return false for the left neighbour', () => {
      expect(positionsAreEqual({ x, y }, { x: x - 1, y })).toBe(false);
      expect(positionsAreEqual({ x: x - 1, y }, { x, y })).toBe(false);
    });

    it('should return false for the right neighbour', () => {
      expect(positionsAreEqual({ x, y }, { x: x + 1, y })).toBe(false);
      expect(positionsAreEqual({ x: x + 1, y }, { x, y })).toBe(false);
    });

    it('should return false for the north neighbour', ({ skip }) => {
      skip(y === 0);
      expect(positionsAreEqual({ x, y }, { x, y: y - 1 })).toBe(false);
      expect(positionsAreEqual({ x, y: y - 1 }, { x, y })).toBe(false);
    });

    it('should return false for the south neighbour', ({ skip }) => {
      skip(y === 5);
      expect(positionsAreEqual({ x, y }, { x, y: y + 1 })).toBe(false);
      expect(positionsAreEqual({ x, y: y + 1 }, { x, y })).toBe(false);
    });

    it.for<[x: number, y: number]>([
      [-1, 1],
      [-1, -1],
      [0, 2],
      [0, -2],
      [1, 1],
      [1, -1],
    ])(
      'should return false for the second degree neighbour offset by x:%s y:%s',
      ([xx, yy], { skip }) => {
        skip(y + yy > 5 || y + yy < 0);
        expect(positionsAreEqual({ x, y }, { x: x + xx, y: y + yy })).toBe(
          false,
        );
      },
    );

    it.for<[x: number, y: number]>([
      [-1, 2],
      [-1, -2],
      [0, 3],
      [0, -3],
      [1, 2],
      [1, -2],
    ])(
      'should return false for the third degree neighbour offset by x:%s y:%s',
      ([xx, yy], { skip }) => {
        skip(y + yy > 5 || y + yy < 0);
        expect(positionsAreEqual({ x, y }, { x: x + xx, y: y + yy })).toBe(
          false,
        );
      },
    );
  });

  describe.for(SOUTH_CENTRE_POSITIONS)(
    'for south half centre file position %s',
    ({ x, y }) => {
      it.for<[x: number, y: number]>([
        [-1, -3],
        [0, -4],
        [1, -3],
      ])(
        'should return false for the fourth degree neighbour offset by x:%s y:%s',
        ([xx, yy], { skip }) => {
          skip(y + yy > 5 || y + yy < 0);
          expect(positionsAreEqual({ x, y }, { x: x + xx, y: y + yy })).toBe(
            false,
          );
        },
      );

      it.for<[x: number, y: number]>([
        [-1, -4],
        // Skip [0, -5], covered by opposites case
        [1, -4],
      ])(
        'should return false for the fifth degree neighbour offset by x:%s y:%s',
        ([xx, yy], { skip }) => {
          skip(x + xx > 2 || x + xx < 0 || y + yy > 5 || y + yy < 0);
          expect(positionsAreEqual({ x, y }, { x: x + xx, y: y + yy })).toBe(
            false,
          );
        },
      );
    },
  );

  it.for([
    [0, 0, 1, 5],
    [0, 0, 2, 4],
    [1, 0, 2, 5],
    [1, 0, 0, 5],
    [2, 0, 1, 5],
    [2, 0, 0, 4],

    [0, 1, 2, 5],
    [2, 1, 0, 5],
  ])(
    'should return false for the sixth degree neighbours %s and %s',
    ([x1, y1, x2, y2]) => {
      expect(positionsAreEqual({ x: x1, y: y1 }, { x: x2, y: y2 })).toBe(false);
    },
  );

  // Seventh degree neighbours covered by opposite cases;
});
