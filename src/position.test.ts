// oxlint-disable no-magic-numbers
import { distanceBetween, positionsAreEqual, type Position } from './position';

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
    it.for([{ x: 2 - x, y: 5 - y }])(
      'should return false for the opposite position %s',
      opposite => {
        expect(positionsAreEqual({ x, y }, opposite)).toBe(false);
        expect(positionsAreEqual(opposite, { x, y })).toBe(false);
      },
    );
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
        const position = { x, y };
        const other = { x: x + xx, y: y + yy };
        expect(positionsAreEqual(position, other)).toBe(false);
        expect(positionsAreEqual(other, position)).toBe(false);
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
        const position = { x, y };
        const other = { x: x + xx, y: y + yy };
        expect(positionsAreEqual(position, other)).toBe(false);
        expect(positionsAreEqual(other, position)).toBe(false);
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
          const position = { x, y };
          const other = { x: x + xx, y: y + yy };
          expect(positionsAreEqual(position, other)).toBe(false);
          expect(positionsAreEqual(other, position)).toBe(false);
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
          const position = { x, y };
          const other = { x: x + xx, y: y + yy };
          expect(positionsAreEqual(position, other)).toBe(false);
          expect(positionsAreEqual(other, position)).toBe(false);
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
      expect(positionsAreEqual({ x: x2, y: y2 }, { x: x1, y: y1 })).toBe(false);
    },
  );

  // Seventh degree neighbours covered by opposite cases;
});

describe(distanceBetween, () => {
  describe.for(ALL_POSITIONS)('for position %s', ({ x, y }) => {
    it('should return 0 for an identical position', () => {
      expect(distanceBetween({ x, y }, { x, y })).toBe(0);
    });
  });

  describe.for(SOUTH_POSITIONS)('for south half position %s', ({ x, y }) => {
    // Let c be distance from centre, { x: 1, y: 2.5 }.
    // Let d be distance between opposites.
    // d = 2 * c
    //   = 2 * (|x - 1| + |y - 2.5|)
    //   = 2 * (|x - 1| + y - 2.5) -- since y > 2.5 for south positions
    //   = |2x - 2| + 2y - 5
    const d = Math.abs(2 * x - 2) + 2 * y - 5;
    it.for<[number, Position]>([[d, { x: 2 - x, y: 5 - y }]])(
      'should return %s for the opposite position %s',
      ([d, opposite]) => {
        expect(distanceBetween({ x, y }, opposite)).toBe(d);
        expect(distanceBetween(opposite, { x, y })).toBe(d);
      },
    );
  });

  describe.for(CENTRE_POSITIONS)('for centre file position %s', ({ x, y }) => {
    it('should return 1 for the left neighbour', () => {
      expect(distanceBetween({ x, y }, { x: x - 1, y })).toBe(1);
      expect(distanceBetween({ x: x - 1, y }, { x, y })).toBe(1);
    });

    it('should return 1 for the right neighbour', () => {
      expect(distanceBetween({ x, y }, { x: x + 1, y })).toBe(1);
      expect(distanceBetween({ x: x + 1, y }, { x, y })).toBe(1);
    });

    it('should return 1 for the north neighbour', ({ skip }) => {
      skip(y === 0);
      expect(distanceBetween({ x, y }, { x, y: y - 1 })).toBe(1);
      expect(distanceBetween({ x, y: y - 1 }, { x, y })).toBe(1);
    });

    it('should return 1 for the south neighbour', ({ skip }) => {
      skip(y === 5);
      expect(distanceBetween({ x, y }, { x, y: y + 1 })).toBe(1);
      expect(distanceBetween({ x, y: y + 1 }, { x, y })).toBe(1);
    });

    it.for<[x: number, y: number]>([
      [-1, 1],
      [-1, -1],
      [0, 2],
      [0, -2],
      [1, 1],
      [1, -1],
    ])(
      'should return 2 for the second degree neighbour offset by x:%s y:%s',
      ([xx, yy], { skip }) => {
        skip(y + yy > 5 || y + yy < 0);
        const position = { x, y };
        const other = { x: x + xx, y: y + yy };
        expect(distanceBetween(position, other)).toBe(2);
        expect(distanceBetween(other, position)).toBe(2);
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
      'should return 3 for the third degree neighbour offset by x:%s y:%s',
      ([xx, yy], { skip }) => {
        skip(y + yy > 5 || y + yy < 0);
        const position = { x, y };
        const other = { x: x + xx, y: y + yy };
        expect(distanceBetween(position, other)).toBe(3);
        expect(distanceBetween(other, position)).toBe(3);
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
        'should return 4 for the fourth degree neighbour offset by x:%s y:%s',
        ([xx, yy], { skip }) => {
          skip(y + yy > 5 || y + yy < 0);
          const position = { x, y };
          const other = { x: x + xx, y: y + yy };
          expect(distanceBetween(position, other)).toBe(4);
          expect(distanceBetween(other, position)).toBe(4);
        },
      );

      it.for<[x: number, y: number]>([
        [-1, -4],
        // Skip [0, -5], covered by opposites case
        [1, -4],
      ])(
        'should return 5 for the fifth degree neighbour offset by x:%s y:%s',
        ([xx, yy], { skip }) => {
          skip(x + xx > 2 || x + xx < 0 || y + yy > 5 || y + yy < 0);
          const position = { x, y };
          const other = { x: x + xx, y: y + yy };
          expect(distanceBetween(position, other)).toBe(5);
          expect(distanceBetween(other, position)).toBe(5);
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
    'should return 6 for the sixth degree neighbours %s and %s',
    ([x1, y1, x2, y2]) => {
      expect(distanceBetween({ x: x1, y: y1 }, { x: x2, y: y2 })).toBe(6);
      expect(distanceBetween({ x: x1, y: y1 }, { x: x2, y: y2 })).toBe(6);
    },
  );

  // Seventh degree neighbours covered by opposite cases;
});
