import { fireEvent, render, screen, within } from '@testing-library/react';

import { App, INITIAL_HAND_CARD_COUNT } from './App';
import { ROW_COUNT } from './Grid';
import { Phase, Player } from './PhaseTracker';

const FEW = 3;
const MANY = 15;

const { Start, Main, End } = Phase;
const { North, South } = Player;

describe('the dom test environment', () => {
  it('should have a defined document', () => {
    expectTypeOf(document).not.toBeUndefined();
  });
});

describe(App, () => {
  beforeEach(() => render(<App />));

  const getThe = {
    header: () => screen.getByRole('banner'),
    main: () => screen.getByRole('main'),
    southHand: () => getThe.hand(South),
    northHand: () => getThe.hand(North),
    hand: (player: Player) =>
      screen.getByRole('region', { name: `${player} hand` }),
    pickedCardDisplay: () =>
      screen.getByRole('region', { name: `Picked card` }),
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
      withinThe.hand(player).getAllByRole('region', { name: 'Lily Pad' }),
    hiddenHandCards: (player: Player) =>
      withinThe.hand(player).getAllByRole('region', { name: 'Facedown card' }),
    ownedGreenFields: (player: Player) =>
      withinThe.playArea().getAllByRole('region', {
        name: `${player} owned Lily Pad`,
      }),
    controlledEmptyFieldDropzone: (player: Player) =>
      withinThe.playArea().getAllByRole('button', {
        name: `Place on ${player} controlled leaf`,
      }),
  };

  const queryAll = {
    clickableHandCards: (player: Player) =>
      withinThe.hand(player).queryAllByRole('button'),
    ownedGreenFields: (player: Player) =>
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

  describe('Header', () => {
    it('should have the wartoad heading', () => {
      const heading = screen.getByRole('heading', { level: 1 });
      const banner = screen.getByRole('banner');
      expect(heading).toHaveTextContent('Wartoad');
      expect(banner).toContainElement(heading);
    });

    it('should have the Phase indicator after the heading', () => {
      const indicator = getThe.phaseIndicator(South, Main);
      expect(indicator).toHaveTextContent('South: Main phase');
      expect(screen.getByRole('banner')).toContainElement(indicator);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(indicator).toAppearAfter(heading);
    });

    describe('Phase indicatar', () => {
      it('should start in the South Main phase', () => {
        expect(getThe.phaseIndicator(South, Main)).toBeVisible();
        expect(screen.queryByLabelText('End Phase')).not.toBeInTheDocument();
      });

      it.for([North, South])(
        'should not advance to the %s End phase when the button is clicked while placing a card',
        player => {
          advanceToPhase(player, Main);
          fireEvent.click(getAll.clickableHandCards(player)[5]);
          fireEvent.click(screen.getByText('Next phase'));

          expect(getThe.phaseIndicator(player, Main)).toBeVisible();
          expect(queryThe.phaseIndicator(player, End)).not.toBeInTheDocument();
        },
      );

      it('should cycle between all turns and phases as the button is clicked', () => {
        for (let x = 0; x < FEW; x += 1) {
          expect(getThe.phaseIndicator(South, Main)).toBeVisible();
          fireEvent.click(screen.getByText('Next phase'));
          expect(getThe.phaseIndicator(South, End)).toBeVisible();
          fireEvent.click(screen.getByText('Next phase'));
          expect(getThe.phaseIndicator(North, Start)).toBeVisible();
          fireEvent.click(screen.getByText('Next phase'));
          expect(getThe.phaseIndicator(North, Main)).toBeVisible();
          fireEvent.click(screen.getByText('Next phase'));
          expect(getThe.phaseIndicator(North, End)).toBeVisible();
          fireEvent.click(screen.getByText('Next phase'));
          expect(getThe.phaseIndicator(South, Start)).toBeVisible();
          fireEvent.click(screen.getByText('Next phase'));
        }
      });
    });
  });

  describe('Hands', () => {
    it('should have the North Hand and South hand in that order before the Play area', () => {
      const south = getThe.southHand();
      const north = getThe.northHand();
      const playArea = getThe.playArea();
      expect(north).toAppearBefore(south);
      expect(south).toAppearBefore(playArea);
    });

    describe('Picked Card', () => {
      it('should not appear before picking a card', () => {
        expect(queryThe.pickedCardDisplay()).not.toBeInTheDocument();
      });

      describe.for([North, South])(
        'after %s picks a card from their hand during their Main phase',
        player => {
          it(`should show the card only until it is placed`, () => {
            advanceToPhase(player, Main);
            fireEvent.click(getAll.clickableHandCards(player)[2]);

            expect(getThe.pickedCardDisplay()).toBeVisible();
            expect(
              withinThe.pickedCardDisplay().getByRole('region', {
                name: 'Lily Pad',
              }),
            ).toBeVisible();

            fireEvent.click(
              withinThe.playArea().getAllByRole('button', {
                name: new RegExp(`${player} controlled`),
              })[3],
            );
            expect(queryThe.pickedCardDisplay()).not.toBeInTheDocument();
          });
        },
      );
    });

    describe.for([North, South])('%s hand', player => {
      const opponent = player === North ? South : North;

      it('should start with 7 cards', () => {
        expect(getAll.handCards(player)).toHaveLength(INITIAL_HAND_CARD_COUNT);
      });

      it(`should be visible during the ${player} turn`, () => {
        advanceToPhase(player, Start);
        const cards = getAll.handCards(player);
        expect(cards).not.toHaveLength(0);
        for (const c of cards) expect(c).toHaveAccessibleName('Lily Pad');
        expect(getAll.visibleHandCards(player)).toHaveLength(cards.length);
      });

      it(`should show card backs during the ${opponent} turn`, () => {
        advanceToPhase(opponent, Start);
        const cards = getAll.handCards(player);
        expect(cards).not.toHaveLength(0);
        for (const c of cards) expect(c).toHaveAccessibleName('Facedown card');
        expect(getAll.hiddenHandCards(player)).toHaveLength(cards.length);
      });

      it(`should gain an extra card during the ${player} Start phase`, () => {
        advanceToPhase(opponent, End);
        const initialCount = getAll.handCards(player).length;

        advanceToPhase(player, Main);
        expect(getAll.handCards(player)).toHaveLength(initialCount + 1);
      });

      it(`should allow a card to be picked during the ${player} Main phase`, () => {
        advanceToPhase(player, Main);
        fireEvent.click(getAll.clickableHandCards(player)[2]);
        expect(getThe.pickedCardDisplay()).toBeVisible();
      });

      it('should not allow a card to be picked during other phases and turns', () => {
        {
          advanceToPhase(player, End);
          const clickableCards = queryAll.clickableHandCards(player);
          if (clickableCards.length > 0) fireEvent.click(clickableCards[0]);
          expect(queryThe.pickedCardDisplay()).not.toBeInTheDocument();
        }
        {
          advanceToPhase(opponent, Main);
          const clickableCards = queryAll.clickableHandCards(player);
          if (clickableCards.length > 0) fireEvent.click(clickableCards[0]);
          expect(queryThe.pickedCardDisplay()).not.toBeInTheDocument();
        }
      });

      it(`should lose a card when ${player} plays a card`, () => {
        advanceToPhase(player, Main);
        const initialHandSize = getAll.handCards(player).length;

        fireEvent.click(getAll.clickableHandCards(player)[2]);
        fireEvent.click(
          withinThe.playArea().getAllByRole('button', {
            name: `Place on ${player} controlled leaf`,
          })[0],
        );

        expect(getAll.handCards(player)).toHaveLength(initialHandSize - 1);
      });
    });
  });

  describe('Play area', () => {
    it('should be in the main content area', () => {
      expect(withinThe.main().getByRole('grid')).toBeVisible();
    });

    const FIELD_COUNT_PER_PLAYER = 8;
    describe.for<[Player, number[]]>([
      [North, [0, FIELD_COUNT_PER_PLAYER - 2]],
      [South, [1, FIELD_COUNT_PER_PLAYER - 1]],
    ])('after picking a card from the %s hand', ([player, leavesToUpgrade]) => {
      const opponent = player === North ? South : North;

      beforeEach(() => {
        advanceToPhase(player, Main);
        fireEvent.click(getAll.clickableHandCards(player)[0]);
      });

      it.for(leavesToUpgrade)(
        `should allow ${player} to upgrade their %sth unupgraded leaf by clicking on it`,
        leafIndex => {
          const initialGreenFieldCount =
            queryAll.ownedGreenFields(player).length;
          fireEvent.click(
            getAll.controlledEmptyFieldDropzone(player)[leafIndex],
          );

          expect(getAll.ownedGreenFields(player)).toHaveLength(
            initialGreenFieldCount + 1,
          );
        },
      );

      it(`should not allow ${player} to play a card on an a ${opponent} leaf`, () => {
        expect(
          queryThe.controlledEmptyFieldDropzone(opponent),
        ).not.toBeInTheDocument();
      });
    });

    describe('The initial placement of leaves', () => {
      it('should have 18 leaves in 6 rows of 3', () => {
        const rows = withinThe.playArea().getAllByRole('row');
        expect(rows).toHaveLength(6);
        for (const row of rows) {
          const leaves = within(row).getAllByRole('gridcell');
          expect(leaves).toHaveLength(3);
          for (const leaf of leaves) {
            expect(leaf).toBeVisible();
          }
        }
      });

      it('should have north leaves in the top 3 rows', () => {
        const northRows = withinThe.playArea().getAllByRole('row').slice(0, 3);
        for (const row of northRows) {
          for (const zone of within(row).getAllByRole('gridcell')) {
            const card = within(zone).getByRole('region');
            expect(card).toHaveAccessibleName(
              /North (controlled)|(owned)|(Home)/,
            );
          }
        }
      });

      it('should have south leaves in the bottom 3 rows', () => {
        const southRows = withinThe.playArea().getAllByRole('row').slice(3);
        for (const row of southRows) {
          for (const zone of within(row).getAllByRole('gridcell')) {
            const card = within(zone).getByRole('region');
            expect(card).toHaveAccessibleName(
              /South (controlled)|(owned)|(Home)/,
            );
          }
        }
      });

      it('should have the north home leaf', () => {
        const [_, homeZone] = within(
          withinThe.playArea().getAllByRole('row')[0],
        ).getAllByRole('gridcell');
        expect(within(homeZone).getByRole('region')).toHaveAccessibleName(
          'North Home Lily Pad',
        );
      });

      it('should have the south home leaf', () => {
        const [_, homeZone] = within(
          withinThe.playArea().getAllByRole('row')[ROW_COUNT - 1],
        ).getAllByRole('gridcell');
        expect(within(homeZone).getByRole('region')).toHaveAccessibleName(
          'South Home Lily Pad',
        );
      });
    });
  });
});
