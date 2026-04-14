import { fireEvent, render, screen, within } from '@testing-library/react';

import { App } from './App';
import { Position } from './Grid';
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
    homeRow: (player: Player) => getThe.nthRow(Position.HOME[player].y),
    nthRow: (n: number) => withinThe.playArea().getAllByRole('row')[n],
    homeLeafDropzone: (player: Player) =>
      withinThe.homeRow(player).getByRole('button', {
        name: `Place on ${player} Home Lily Pad`,
      }),
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
    leavesControlledBy: (player: Player) =>
      withinThe.playArea().getAllByRole('gridcell', {
        name: `${player} controlled leaf`,
      }),
    leafDropzonesControlledBy: (player: Player) =>
      withinThe.playArea().getAllByRole('gridcell', {
        name: `Place on ${player} controlled leaf`,
      }),
    homeRowDropzones: (player: Player) =>
      withinThe.homeRow(player).getAllByRole('button', {
        name: `Place on ${player} controlled leaf`,
      }),
    lilyPadDropzones: () =>
      withinThe.playArea().getAllByRole('button', {
        name: /(owned)|(Home) LillyPad/,
      }),
  };

  const getFirst = {
    leafDropzoneControlledBy: (player: Player) =>
      getAll.leafDropzonesControlledBy(player)[0],
    handCardNamed: (player: Player, name: string) =>
      getAll.handCardsNamed(player, name)[0],
    lilyPadDropzone: () => getAll.lilyPadDropzones()[0],
    leafControlledBy: (player: Player) => getAll.leavesControlledBy(player)[0],
  };

  const queryAll = {
    clickableHandCards: (player: Player) =>
      withinThe.hand(player).queryAllByRole('button'),
    ownedCardsNamed: (player: Player, name: string) =>
      withinThe.playArea().queryAllByRole('region', {
        name: `${player} owned ${name}`,
      }),
  };

  const queryA = {
    pickedCardDisplay: () =>
      screen.queryByRole('region', { name: `Picked card` }),
    phaseIndicator: (player: Player, phase: Phase) =>
      withinThe
        .header()
        .queryByRole('region', { name: `${player}: ${phase} phase` }),
    controlledLeafDropzone: (player: Player) =>
      withinThe.playArea().queryByRole('button', {
        name: `Place on ${player} controlled leaf`,
      }),
    nthRowDropzone: (n: number) =>
      withinThe.nthRow(n).queryByRole('button', { name: /Place on/ }),
    lilyPadDropzone: () =>
      withinThe.playArea().queryByRole('button', {
        name: /(owned)|(Home) LillyPad/,
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
    homeRow: (player: Player) => within(getThe.homeRow(player)),
    nthRow: (n: number) => within(getThe.nthRow(n)),
  };

  const advanceToPhase = (player: Player, phase: Phase) => {
    for (let i = 0; i < MANY; i += 1) {
      if (queryA.phaseIndicator(player, phase)) break;
      fireEvent.click(screen.getByText('Next phase'));
    }
    expect(getThe.phaseIndicator(player, phase)).toBeVisible();
  };

  describe('Hands', () => {
    describe('Picked Card', () => {
      describe.for<[Player, cardName: string]>([
        [North, 'Lily Pad'],
        [North, 'Froglet'],
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
            expect(queryA.pickedCardDisplay()).not.toBeInTheDocument();
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

      it(`should gain a Froglet during the first ${player} Start phase`, () => {
        advanceToPhase(player, Main);
        const initialFrogletCount = getAll.handCardsNamed(
          player,
          'Froglet',
        ).length;
        const initialCardCount = getAll.handCards(player).length;

        advanceToPhase(opponent, End);
        expect(getAll.handCards(player).length).toBe(initialCardCount);

        advanceToPhase(player, Main);
        expect(getAll.handCardsNamed(player, 'Froglet')).toHaveLength(
          initialFrogletCount + 1,
        );
      });

      it.for(['Lily Pad', 'Froglet'])(
        `should allow a %s to be picked during the ${player} Main phase`,
        name => {
          advanceToPhase(player, Main);
          fireEvent.click(getFirst.handCardNamed(player, name));
          expect(getThe.pickedCardDisplay()).toBeVisible();
          expect(getThe.pickedCardNamed(name)).toBeVisible();
        },
      );

      // TODO 8: Unskip when the correct card is removed from the hand
      it.skip.for(['Lily Pad', 'Froglet'])(
        `should lose a %s when played by ${player}`,
        name => {
          advanceToPhase(player, Main);
          const initialHandSize = getAll.handCardsNamed(player, name).length;

          fireEvent.click(getFirst.handCardNamed(player, name));
          fireEvent.click(getFirst.leafDropzoneControlledBy(player));
          expect(getAll.handCardsNamed(player, name)).toHaveLength(
            initialHandSize - 1,
          );
        },
      );
    });
  });

  describe('Play area', () => {
    describe.for<Player>([North, South])(
      'after picking a Lily Pad from the %s hand',
      player => {
        const opponent = player === North ? South : North;

        beforeEach(() => {
          advanceToPhase(player, Main);
          fireEvent.click(getFirst.handCardNamed(player, 'Lily Pad'));
        });

        const STARTING_UNUPGRADED_LEAVES = 8;
        it.for([
          0,
          STARTING_UNUPGRADED_LEAVES / 2,
          STARTING_UNUPGRADED_LEAVES - 1,
        ])(
          `should allow ${player} to upgrade their %sth unupgraded leaf by clicking on it`,
          leafIndex => {
            const initialLilyPadCount = queryAll.ownedCardsNamed(
              player,
              'Lily Pad',
            ).length;

            fireEvent.click(
              getAll.leafDropzonesControlledBy(player)[leafIndex],
            );

            expect(getAll.ownedCardsNamed(player, 'Lily Pad')).toHaveLength(
              initialLilyPadCount + 1,
            );
          },
        );

        it(`should not allow ${player} to play a Lily Pad on an a ${opponent} leaf`, () => {
          const initialLilyPadCount = queryAll.ownedCardsNamed(
            player,
            'Lily Pad',
          ).length;

          expect(
            queryA.controlledLeafDropzone(opponent),
          ).not.toBeInTheDocument();

          fireEvent.click(getFirst.leafControlledBy(opponent));

          expect(queryAll.ownedCardsNamed(player, 'Lily Pad')).toHaveLength(
            initialLilyPadCount,
          );
        });

        it(`should not allow ${player} to play a Lily Pad on an an upgraded leaf`, () => {
          expect(queryA.lilyPadDropzone()).not.toBeInTheDocument();
        });
      },
    );

    describe.for<Player>([North, South])(
      'after picking a Froglet from the %s hand',
      player => {
        const opponent = player === North ? South : North;

        beforeEach(() => {
          advanceToPhase(player, Main);
          fireEvent.click(getFirst.handCardNamed(player, 'Froglet'));
        });

        const LEFT = 0;
        const RIGHT = 2;
        // TODO 8: Unskip when training dropzones work
        it.skip.for([LEFT, RIGHT])(
          `should allow ${player} to train a Froglet on their %sth leaf in the back row`,
          leafIndex => {
            const initialFrogletCount = queryAll.ownedCardsNamed(
              player,
              'Froglet',
            ).length;

            fireEvent.click(getAll.homeRowDropzones(player)[leafIndex]);

            expect(getAll.ownedCardsNamed(player, 'Froglet')).toHaveLength(
              initialFrogletCount + 1,
            );
          },
        );

        // TODO 8: Unskip when training dropzones work
        it.skip(`should allow ${player} to train a Froglet on their Home Lily Pad`, () => {
          const initialFrogletCount = queryAll.ownedCardsNamed(
            player,
            'Froglet',
          ).length;

          fireEvent.click(getThe.homeLeafDropzone(player));

          expect(getAll.ownedCardsNamed(player, 'Froglet')).toHaveLength(
            initialFrogletCount + 1,
          );
        });

        // TODO 8: Unskip when training dropzones work
        it.skip.for([1, 2])(
          `should not allow ${player} to play the Froglet on an a forward leaf`,
          offset => {
            const targetRow =
              player === North
                ? Position.HOME[North].y + offset
                : Position.HOME[South].y - offset;
            expect(queryA.nthRowDropzone(targetRow)).not.toBeInTheDocument();
          },
        );

        it(`should not allow ${player} to play the Froglet on an a ${opponent} leaf`, () => {
          expect(
            queryA.controlledLeafDropzone(opponent),
          ).not.toBeInTheDocument();
        });
      },
    );
  });
});
