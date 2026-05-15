import { Player } from '@/types/gameflow';

import { getPondStateAt, HOME } from './pond';
import {
  ANOTHER_POND,
  ANOTHER_POND_POSITIONS,
  TestPondKey,
} from './pond.test-utils';

describe.for([Player.North, Player.South])(
  `Test positions for %s in ${TestPondKey.ANOTHER_POND}`,
  player => {
    const anotherPond = ANOTHER_POND;
    it.for<keyof (typeof ANOTHER_POND_POSITIONS)[Player]>([
      'LeafHomeRow',
      'LeafEdge',
      'UpgradedEdge',
      'LeafMiddle',
      'UpgradedMiddle',
    ])(`should have ${player}.%s controlled by ${player}`, key => {
      const position = ANOTHER_POND_POSITIONS[player][key];
      expect(getPondStateAt(anotherPond, position).controller).toBe(player);
    });

    it(`should have all ${player}.LeafHomeRow unupgraded`, () => {
      const position = ANOTHER_POND_POSITIONS[player].LeafHomeRow;
      expect(getPondStateAt(anotherPond, position).leaf).toBeUndefined();
    });

    it(`should have ${player}.LeafHomeRow unupgraded`, () => {
      const position = ANOTHER_POND_POSITIONS[player].LeafHomeRow;
      expect(getPondStateAt(anotherPond, position).leaf).not.toBeDefined();
    });

    it(`should have ${player}.LeafHomeRow be on the home row and not Home`, () => {
      const { x, y } = ANOTHER_POND_POSITIONS[player].LeafHomeRow;
      expect(x).not.toBe(1);
      expect(y).toBe(HOME[player].y);
    });

    it(`should have ${player}.LeafEdge be unupgraded`, () => {
      const position = ANOTHER_POND_POSITIONS[player].LeafEdge;
      expect(getPondStateAt(anotherPond, position).leaf).not.toBeDefined();
    });

    it(`should have ${player}.LeafEdge be on the edge and not the home row`, () => {
      const { x, y } = ANOTHER_POND_POSITIONS[player].LeafEdge;
      expect(x).not.toBe(1);
      expect(y).not.toBe(HOME[player].y);
    });

    it(`should have ${player}.UpgradedEdge be upgraded`, () => {
      const position = ANOTHER_POND_POSITIONS[player].UpgradedEdge;
      expect(getPondStateAt(anotherPond, position).leaf).toBeDefined();
    });

    it(`should have ${player}.UpgradedEdge be on the edge and not the home row`, () => {
      const { x, y } = ANOTHER_POND_POSITIONS[player].UpgradedEdge;
      expect(x).not.toBe(1);
      expect(y).not.toBe(HOME[player].y);
    });

    it(`should have ${player}.LeafMiddle be unupgraded`, () => {
      const position = ANOTHER_POND_POSITIONS[player].LeafMiddle;
      expect(getPondStateAt(anotherPond, position).leaf).not.toBeDefined();
    });

    it(`should have ${player}.LeafMiddle be on the edge and not the home row`, () => {
      const { x, y } = ANOTHER_POND_POSITIONS[player].LeafMiddle;
      expect(x).toBe(1);
      expect(y).not.toBe(HOME[player].y);
    });

    it(`should have ${player}.UpgradedMiddle be upgraded`, () => {
      const position = ANOTHER_POND_POSITIONS[player].UpgradedMiddle;
      expect(getPondStateAt(anotherPond, position).leaf).toBeDefined();
    });

    it(`should have ${player}.UpgradedMiddle be on the edge and not the home row`, () => {
      const { x, y } = ANOTHER_POND_POSITIONS[player].UpgradedMiddle;
      expect(x).toBe(1);
      expect(y).not.toBe(HOME[player].y);
    });
  },
);
