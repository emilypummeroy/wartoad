import { data } from '@/state';
import { createDeckActions } from '@/types/deck';
import { Phase } from '@/types/gameflow';

export const finishStartPhase = () =>
  data(({ get, ...data }) => {
    const deck = createDeckActions(get.deck.of(get.player));
    const drawnCard = deck.draw();
    const didMeetPreconditions = get.phase === Phase.Start && !!drawnCard;
    if (!didMeetPreconditions) return get.out;

    return (
      data.set.hand
        .of(get.player)
        .update(cards => [...cards, drawnCard])
        .set.deck.of(get.player)
        .to(deck.resultingDeck)
        // TODO 23: Add funds per leaf
        .set.funds.of(get.player)
        .to(5)
        .make.mainPhase().get.out
    );
  });
