import { screen, within } from '@testing-library/react';

import { HOME } from './state/pond';
import type { UnitClass } from './types/card';
import { Player, type Phase } from './types/gameflow';

export const getThe = {
  get header() {
    return screen.getByRole('banner');
  },
  get main() {
    return screen.getByRole('main');
  },
  hand(player: Player) {
    return screen.getByRole('region', { name: `${player} hand` });
  },
  get pickedCardDisplay() {
    return screen.getByRole('region', { name: `Picked card` });
  },
  pickedCardNamed(name: string) {
    return withinThe.pickedCardDisplay.getByRole('region', { name });
  },
  get playArea() {
    return withinThe.main.getByRole('grid');
  },
  homeRow(player: Player) {
    return getThe.nthRank(HOME[player].y);
  },
  nthRank(n: number) {
    return withinThe.playArea.getAllByRole('row')[n];
  },
  nthRankFor(player: Player, n: number) {
    return withinThe.playArea.getAllByRole('row')[
      player === Player.North ? n : 5 - n
    ];
  },
  nthRankDropzoneFor(player: Player, n: number) {
    return withinThe.nthRankFor(player, n).getByRole('button');
  },
  nthRankUnitControlledBy(player: Player, n: number) {
    return withinThe.nthRankFor(player, n).getByRole('img', {
      name: `${player} unit`,
    });
  },
  homeLeafDropzone(player: Player) {
    return withinThe.homeRow(player).getByRole('button', {
      name: new RegExp(`(Upgrade|Deploy on) ${player} Home Lily Pad`),
    });
  },
  phaseIndicator(player: Player, phase: Phase) {
    return withinThe.header.getByRole('region', {
      name: `${player}: ${phase} phase`,
    });
  },
};

export const getAll = {
  handCards(player: Player) {
    return withinThe.hand(player).getAllByRole('region');
  },
  handCardsNamed(player: Player, name: string) {
    return withinThe.hand(player).getAllByRole('region', { name });
  },
  controlledCardsNamed(player: Player, name: string) {
    return withinThe.playArea.getAllByRole('region', {
      name: `${player} controlled ${name}`,
    });
  },
  unitsControlledBy(player: Player) {
    return withinThe.playArea.getAllByRole('img', { name: `${player} unit` });
  },
  leavesControlledBy(player: Player) {
    return withinThe.playArea.getAllByRole('gridcell', {
      name: `${player} controlled leaf`,
    });
  },
  basicDropzonesControlledBy(player: Player) {
    return withinThe.playArea.getAllByRole('button', {
      name: new RegExp(`(Upgrade|Deploy on|Move to) ${player} controlled leaf`),
    });
  },
  homeRowDropzones(player: Player) {
    return withinThe.homeRow(player).getAllByRole('button', {
      name: new RegExp(`(Upgrade|Deploy on) ${player} (controlled|Home)`),
    });
  },
  cardsControlledByWithName(player: Player, name: string) {
    return withinThe.playArea.getAllByRole('region', {
      name: new RegExp(`${player} (controlled|Home) ${name}`),
    });
  },
  unitsControlledByOfClass(player: Player, cardClass: UnitClass) {
    return withinThe.playArea.getAllByRole('region', {
      name: new RegExp(`${player} unit ${cardClass.name}`),
    });
  },
};

export const getFirst = {
  basicDropzoneControlledBy(player: Player) {
    return getAll.basicDropzonesControlledBy(player)[0];
  },
  handCardNamed(player: Player, name: string) {
    return getAll.handCardsNamed(player, name)[0];
  },
  leafControlledBy(player: Player) {
    return getAll.leavesControlledBy(player)[0];
  },
  cardsControlledByWithName(player: Player, name: string) {
    return getAll.cardsControlledByWithName(player, name)[0];
  },
  unitControlledByOfClass(player: Player, cardClass: UnitClass) {
    return getAll.unitsControlledByOfClass(player, cardClass)[0];
  },
};

export const queryAll = {
  cardsControlledByWithName(player: Player, name: string) {
    return withinThe.playArea.queryAllByRole('region', {
      name: `${player} controlled ${name}`,
    });
  },
  unitsControlledBy(player: Player) {
    return withinThe.playArea.queryAllByRole('img', { name: `${player} unit` });
  },
};

export const queryA = {
  get pickedCardDisplay() {
    return screen.queryByRole('region', { name: `Picked card` });
  },
  phaseIndicator(player: Player, phase: Phase) {
    return withinThe.header.queryByRole('region', {
      name: `${player}: ${phase} phase`,
    });
  },
  upgradeDropzoneControlledBy(player: Player) {
    return withinThe.playArea.queryByRole('button', {
      name: `Upgrade ${player} controlled leaf`,
    });
  },
  nthRankDropzone(n: number) {
    return withinThe.nthRank(n).queryByRole('button');
  },
  nthRankUnitControlledBy(player: Player, n: number) {
    return withinThe
      .nthRankFor(player, n)
      .queryByRole('img', { name: `${player} unit` });
  },
  upgradeDropzoneOnLeafNamed(name: string) {
    return withinThe.playArea.queryByRole('button', {
      name: new RegExp(`(controlled|Home) ${name}`),
    });
  },
};

export const withinThe = {
  get header() {
    return within(getThe.header);
  },
  get main() {
    return within(getThe.main);
  },
  hand(player: Player) {
    return within(getThe.hand(player));
  },
  get pickedCardDisplay() {
    return within(getThe.pickedCardDisplay);
  },
  get playArea() {
    return within(getThe.playArea);
  },
  homeRow(player: Player) {
    return within(getThe.homeRow(player));
  },
  nthRank(n: number) {
    return within(getThe.nthRank(n));
  },
  nthRankFor(player: Player, n: number) {
    return within(getThe.nthRankFor(player, n));
  },
};
