import type { GameState } from '../state-types';
import { draw } from '../state-types/card.test-utils';
import { generateDeck, INITIAL_DECK_SIZE } from '../state-types/deck';
import {
  createStateWith,
  deckOf,
  gameflowOf,
  phaseStateOf,
  winningPondOf,
} from '../state/test-utils';
import { CardClass, CardKey } from '../types/card';
import { Phase, Player, PLAYER_AFTER } from '../types/gameflow';
import { _, counter, partial } from '../types/test-utils';
import { finishStartPhase } from './finish-start-phase';

const { North, South } = Player;
const { Froglet, LilyPad, OldLeaf } = CardKey;
const { Upgrading, Deploying, Activating, Start, Main, End, GameOver } = Phase;

type Preconditions = [Player, Phase, winner?: Player, deckSize?: number];
type Inputs = [Player, draw: CardKey, deck: number];

describe(finishStartPhase, () => {
  // Preconditions:
  describe.for<Preconditions>([
    // < phase = Start
    [North, Main],
    [North, End],
    [North, Upgrading],
    [North, Deploying],
    [North, Activating],
    [North, GameOver, North],
    [North, GameOver, South],
    [South, Main],
    [South, End],
    [South, Upgrading],
    [South, Deploying],
    [South, Activating],
    [North, GameOver, North],
    [North, GameOver, South],

    // < deck is not empty
    [North, Start, _, 0],
    [South, Start, _, 0],
  ])(
    'Precondition failed: need Main phase Idle | %s %s | winner %s',
    ([player, phase, winner, deckSize = INITIAL_DECK_SIZE]) => {
      it('should not change state', () => {
        const before = createStateWith({
          ...gameflowOf(player, phase),
          ...phaseStateOf(player, phase),
          ...winningPondOf(winner),
          ...deckOf(player, deckSize),
        });
        expect(finishStartPhase()(before)).toStrictEqual(before);
      });
    },
  );

  // Postconditions:
  describe.for<Inputs>([
    [North, Froglet, 1],
    [North, LilyPad, 1],
    [North, OldLeaf, 1],
    [South, Froglet, 1],
    [South, LilyPad, 1],
    [South, OldLeaf, 1],
    [North, Froglet, 2],
    [North, LilyPad, 3],
    [North, OldLeaf, INITIAL_DECK_SIZE],
    [South, Froglet, 2],
    [South, LilyPad, 3],
    [South, OldLeaf, INITIAL_DECK_SIZE],
  ])(
    'Postconditions | %s | drawing %s | with %s extra cards in deck',
    ([player, cardKey, deckSize]) => {
      const cardClass = CardClass[cardKey];
      const card = draw(cardClass)(player);
      const restOfDeck = generateDeck(player, counter).slice(0, deckSize);
      const before = createStateWith({
        ...deckOf(player, [card, ...restOfDeck]),
        ...gameflowOf(player, Start),
      });
      const opponent = PLAYER_AFTER[player];

      // > old.phase = Start -> phase = Main
      it('should go to the Main phase', () => {
        const after = finishStartPhase()(before);
        expect(after.flow.phase).toBe(Main);
      });

      // > old.phase = Start -> player unchanged
      it('should not change the player', () => {
        const after = finishStartPhase()(before);
        expect(after.flow.player).toBe(player);
      });

      // > old.phase = Start -> draw to player hand
      it(`should add a ${cardKey} to the ${player} hand`, () => {
        const after = finishStartPhase()(before);
        const beforeHand =
          player === North ? before.northHand : before.southHand;
        const afterHand = player === North ? after.northHand : after.southHand;
        expect(afterHand).toHaveLength(beforeHand.length + 1);
        expect(afterHand).toStrictEqual([...beforeHand, card]);
      });

      // > old.phase = Start -> draw from player deck
      it(`should remove the top card from the ${player} deck`, () => {
        const after = finishStartPhase()(before);
        const gotDeck = player === North ? after.northDeck : after.southDeck;
        expect(gotDeck).toStrictEqual(restOfDeck);
      });

      // TODO 23: Use actual income from leaves
      // > player funds set to 5
      it(`should increase ${player} funds`, () => {
        const after = finishStartPhase()(before);
        const afterFunds =
          player === North ? after.northFunds : after.southFunds;
        expect(afterFunds).toStrictEqual(5);
      });

      // > opponent hand unchanged
      it(`should not change the ${opponent} hand`, () => {
        const after = finishStartPhase()(before);
        const beforeHand =
          player === South ? before.northHand : before.southHand;
        const afterHand = player === South ? after.northHand : after.southHand;
        expect(afterHand).toStrictEqual(beforeHand);
      });

      // > opponent funds unchanged
      it(`should not change the ${opponent} funds`, () => {
        const after = finishStartPhase()(before);
        const beforeFunds =
          player === South ? before.northFunds : before.southFunds;
        const afterFunds =
          player === South ? after.northFunds : after.southFunds;
        expect(afterFunds).toStrictEqual(beforeFunds);
      });

      const deleteHandFundsDeck = (full: GameState) => {
        const { ...state } = partial(full);
        if (player === North) {
          delete state.northHand;
          delete state.northFunds;
          delete state.northDeck;
        } else {
          delete state.southHand;
          delete state.southFunds;
          delete state.southDeck;
        }
        return state;
      };

      it('should not change the rest of the state', () => {
        const after = finishStartPhase()(before);
        const want = deleteHandFundsDeck(before);
        const got = deleteHandFundsDeck(after);
        delete want.flow;
        delete got.flow;
        expect(got).toStrictEqual(want);
      });

      it('should not change the rest of the flow state', () => {
        const after = finishStartPhase()(before);
        const { ...want } = partial(before.flow);
        const { ...got } = partial(after.flow);
        delete want.phase;
        delete got.phase;
        expect(got).toStrictEqual(want);
      });
    },
  );
});
