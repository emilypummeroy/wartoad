import { data } from '../state';
import { distanceBetween, type Position } from '../types/position';

export const commitActivation = (target: Position) =>
  data(({ get, set, make }) => {
    const didMeetPreconditions =
      !!get.activation && distanceBetween(get.activation.start, target) <= 1;
    if (!didMeetPreconditions) return get.out;

    const { start, unit } = get.activation;
    return start === target
      ? // TODO 14: It should exhaust the unit if moving in place.
        make.idle().get.out
      : set.leaf
          .at(start)
          .update(({ units }) => ({
            units: units.filter(({ key }) => key !== unit.key),
          }))
          .set.leaf.at(target)
          // TODO 14: It should exhaust the unit if on a new leaf.
          .update(({ units }) => ({ units: [...units, unit] }))
          .make.idle().get.out;
  });
