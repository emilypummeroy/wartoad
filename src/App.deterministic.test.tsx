import { fireEvent, render, screen, within } from '@testing-library/react';

import { App } from './App';
import { Phase, Player } from './PhaseTracker';

const MANY = 15;

const { Start, Main, End } = Phase;
const { North, South } = Player;

describe('the dom test environment', () => {
  it('should have a defined document', () => {
    expectTypeOf(document).not.toBeUndefined();
  });
});

describe(`${App.name} Deterministic`, () => {
  beforeEach(() => render(<App isDeterministic />));

  const getThe = {
    header: () => screen.getByRole('banner'),
    main: () => screen.getByRole('main'),
    southHand: () => getThe.hand(South),
    northHand: () => getThe.hand(North),
    hand: (player: Player) =>
      screen.getByRole('region', { name: `${player} hand` }),
    pickedCardDisplay: () =>
      screen.getByRole('region', { name: `Picked card` }),
    pickedCardNamed: (name: string) =>
      withinThe
        .pickedCardDisplay()
        .getByRole('region', { name: `Card face of ${name}` }),
    playArea: () => withinThe.main().getByRole('grid'),
    phaseIndicator: (player: Player, phase: Phase) =>
      withinThe
        .header()
        .getByRole('region', { name: `${player}: ${phase} phase` }),
  };

  const getAll = {
    handCards: (player: Player) =>
      withinThe.hand(player).getAllByRole('region'),
    clickableHandCards: (player: Player) =>
      withinThe.hand(player).getAllByRole('button'),
    visibleHandCards: (player: Player) =>
      withinThe.hand(player).getAllByRole('region', { name: /Card face/ }),
    hiddenHandCards: (player: Player) =>
      withinThe.hand(player).getAllByRole('region', { name: 'Card back' }),
    handCardsNamed: (player: Player, name: string) =>
      withinThe
        .hand(player)
        .getAllByRole('region', { name: `Card face of ${name}` }),
    ownedCardsNamed: (player: Player, name: string) =>
      withinThe.playArea().getAllByRole('region', {
        name: `${player} owned ${name}`,
      }),
    leafDropzonesControlledBy: (player: Player) =>
      withinThe.playArea().getAllByRole('gridcell', {
        name: `Place on ${player} controlled leaf`,
      }),
  };

  const getFirst = {
    leafDropzoneControlledBy: (player: Player) =>
      getAll.leafDropzonesControlledBy(player)[0],
    handCardNamed: (player: Player, name: string) =>
      getAll.handCardsNamed(player, name)[0],
  };

  const queryAll = {
    clickableHandCards: (player: Player) =>
      withinThe.hand(player).queryAllByRole('button'),
    ownedLilyPads: (player: Player) =>
      withinThe.playArea().queryAllByRole('region', {
        name: `${player} owned Lily Pad`,
      }),
  };

  const queryThe = {
    pickedCardDisplay: () =>
      screen.queryByRole('region', { name: `Picked card` }),
    phaseIndicator: (player: Player, phase: Phase) =>
      withinThe
        .header()
        .queryByRole('region', { name: `${player}: ${phase} phase` }),
    controlledEmptyFieldDropzone: (player: Player) =>
      withinThe.playArea().queryByRole('button', {
        name: `Place on ${player} controlled leaf`,
      }),
  };

  const withinThe = {
    header: () => within(getThe.header()),
    main: () => within(getThe.main()),
    southHand: () => withinThe.hand(South),
    northHand: () => withinThe.hand(North),
    hand: (player: Player) => within(getThe.hand(player)),
    pickedCardDisplay: () => within(getThe.pickedCardDisplay()),
    playArea: () => within(getThe.playArea()),
  };

  const advanceToPhase = (player: Player, phase: Phase) => {
    for (let i = 0; i < MANY; i += 1) {
      if (queryThe.phaseIndicator(player, phase)) break;
      fireEvent.click(screen.getByText('Next phase'));
    }
    expect(getThe.phaseIndicator(player, phase)).toBeVisible();
  };

  describe('Hands', () => {
    describe('Picked Card', () => {
      describe.for<[Player, cardName: string]>([
        [North, 'Lily Pad'],
        // TODO [North, 'Froglet'],
        [South, 'Lily Pad'],
        [South, 'Froglet'],
      ])(
        'after %s picks a %s from their hand during their Main phase',
        ([player, cardName]) => {
          it(`should show the ${cardName} only until it is placed`, () => {
            advanceToPhase(player, Main);
            fireEvent.click(getFirst.handCardNamed(player, cardName));

            expect(getThe.pickedCardDisplay()).toBeVisible();
            expect(getThe.pickedCardNamed(cardName)).toBeVisible();

            fireEvent.click(getFirst.leafDropzoneControlledBy(player));
            expect(queryThe.pickedCardDisplay()).not.toBeInTheDocument();
          });
        },
      );
    });

    describe.for([North, South])('%s hand', player => {
      const opponent = player === North ? South : North;

      it(`should show Lily Pads and Froglets during the ${player} turn`, () => {
        advanceToPhase(player, Start);
        const cards = getAll.handCards(player);
        expect(cards).not.toHaveLength(0);
        for (const c of cards)
          expect(c).toHaveAccessibleName(/Card face of (Lily Pad)|(Froglet)/);
      });

      // TODO
      it.skip(`should gain a Froglet during the first ${player} Start phase`, () => {
        advanceToPhase(opponent, End);
        const initialCount = getAll.handCardsNamed(player, 'Froglet').length;

        advanceToPhase(player, Main);
        expect(getAll.handCardsNamed(player, 'Froglet')).toHaveLength(
          initialCount + 1,
        );
      });

      it.for(['Lily Pad', 'Froglet'])(
        `should allow a %s to be picked during the ${player} Main phase`,
        (name, { skip }) => {
          skip(player === North && name === 'Froglet'); // TODO
          advanceToPhase(player, Main);
          fireEvent.click(getFirst.handCardNamed(player, name));
          expect(getThe.pickedCardDisplay()).toBeVisible();
          expect(getThe.pickedCardNamed(name)).toBeVisible();
        },
      );

      it.for([
        'Lily Pad',
        // TODO 'Froglet'
      ])(`should lose a %s when played by ${player}`, (name, { skip }) => {
        skip(player === North && name === 'Froglet'); // TODO
        advanceToPhase(player, Main);
        const initialHandSize = getAll.handCardsNamed(player, name).length;

        fireEvent.click(getFirst.handCardNamed(player, name));
        fireEvent.click(getFirst.leafDropzoneControlledBy(player));
        expect(getAll.handCardsNamed(player, name)).toHaveLength(
          initialHandSize - 1,
        );
      });
    });
  });

  describe('Play area', () => {
    const FIELD_COUNT_PER_PLAYER = 8;
    describe.for<[Player, number[]]>([
      [North, [0, FIELD_COUNT_PER_PLAYER - 2]],
      [South, [1, FIELD_COUNT_PER_PLAYER - 1]],
    ])(
      'after picking a Lily Pad from the %s hand',
      ([player, leavesToUpgrade]) => {
        const opponent = player === North ? South : North;

        beforeEach(() => {
          advanceToPhase(player, Main);
          fireEvent.click(getFirst.handCardNamed(player, 'Lily Pad'));
        });

        it.for(leavesToUpgrade)(
          `should allow ${player} to upgrade their %sth unupgraded leaf by clicking on it`,
          leafIndex => {
            const initialLilyPadCount = queryAll.ownedLilyPads(player).length;
            fireEvent.click(
              getAll.leafDropzonesControlledBy(player)[leafIndex],
            );

            expect(getAll.ownedCardsNamed(player, 'Lily Pad')).toHaveLength(
              initialLilyPadCount + 1,
            );
          },
        );

        it(`should not allow ${player} to play a card on an a ${opponent} leaf`, () => {
          expect(
            queryThe.controlledEmptyFieldDropzone(opponent),
          ).not.toBeInTheDocument();
        });
      },
    );
  });
});
