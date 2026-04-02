import {
  styleForHandSize,
  INITIAL_HAND_CARD_COUNT,
  BIG_HAND_CARD_COUNT,
} from './Hand';

const MANY = 15;

describe(styleForHandSize, () => {
  it('should return an empty string for card counts', () => {
    for (let i = 0; i <= INITIAL_HAND_CARD_COUNT; i += 1) {
      expect(styleForHandSize(i)).toBe('');
    }
  });

  it("should return 'compact' for medium card counts", () => {
    for (
      let i = INITIAL_HAND_CARD_COUNT + 1;
      i <= BIG_HAND_CARD_COUNT;
      i += 1
    ) {
      expect(styleForHandSize(i)).toBe('compact');
    }
  });

  it("should return 'super-compact' for large card counts", () => {
    for (
      let i = BIG_HAND_CARD_COUNT + 1;
      i < BIG_HAND_CARD_COUNT + MANY;
      i += 1
    ) {
      expect(styleForHandSize(i)).toBe('super-compact');
    }
  });
});
