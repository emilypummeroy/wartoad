import { endPhase } from './end-phase';

describe(endPhase, () => {
  // Proconditions:
  // subphase = Idle
  //
  // Postconditions:
  // phase = after(old.phase)
  // old.phase = End -> player = after(old.player)
  // phase = Start -> draw(player)
  // phase = End & p of positions: cancapture(p) -> capture(p, player)
  //
  // invariants:
  // subphase !== Idle -> phase = Main
  //
  it('should have a test case', () => {});
});
