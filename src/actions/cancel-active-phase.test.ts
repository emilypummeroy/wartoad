import { createStateWith, gameflowOf, phaseStateOf } from '@/state/test-utils';
import { Phase, Player } from '@/types/gameflow';
import { partial } from '@/types/test-utils';

import { cancelActivePhase } from './cancel-active-phase';

const { North, South } = Player;
const { Start, End, GameOver, Upgrading, Deploying, Activating, Main } = Phase;

describe(cancelActivePhase, () => {
  // Preconditions
  describe.for<[Player, Phase]>([
    [North, Start],
    [North, Main],
    [North, End],
    [North, GameOver],
    [South, Start],
    [South, Main],
    [South, End],
    [South, GameOver],
  ])('Precondition failed: need an active phase | %s %s', ([player, phase]) => {
    const before = createStateWith({
      ...gameflowOf(player, phase),
      ...phaseStateOf(player, phase),
    });

    it('should return the input unchanged', () => {
      const after = cancelActivePhase()(before);
      expect(after).toBe(before);
    });
  });

  // Postconditions
  describe.for<[Player, Phase]>([
    [North, Upgrading],
    [North, Deploying],
    [North, Activating],
    [South, Upgrading],
    [South, Deploying],
    [South, Activating],
  ])('Postconditions | %s %s', ([player, phase]) => {
    const before = createStateWith({
      ...gameflowOf(player, phase),
      ...phaseStateOf(player, phase),
    });

    // > phase := Main
    it('should set the phase to Main', () => {
      const after = cancelActivePhase()(before);
      expect(after.flow.phase).toBe(Main);
    });

    it('should not change the rest of flow', () => {
      const { ...got } = partial(cancelActivePhase()(before).flow);
      const { ...want } = partial(before.flow);
      delete got.phase;
      delete want.phase;
      expect(got).toStrictEqual(want);
    });

    it('should not change the rest of state', () => {
      const { ...got } = partial(cancelActivePhase()(before));
      const { ...want } = partial(before);
      delete got.flow;
      delete want.flow;
      delete got.activation;
      delete want.activation;
      delete got.deployment;
      delete want.deployment;
      delete got.upgrade;
      delete want.upgrade;
      expect(got).toStrictEqual(want);
    });
  });
});
