import { data } from '../state';
import { distanceBetween, type Position } from '../types/position';

export const commitActivation = (target: Position) =>
  data(({ get, set }) => {
    const didMeetPreconditions =
      !!get.activation && distanceBetween(get.activation.start, target) <= 1;
    if (!didMeetPreconditions) return get.out;

    const { start, unit } = get.activation;
    const exhaustedUnit = {
      ...unit,
      values: { ...unit.values, isExhausted: true },
    };
    return set.leaf
      .at(start)
      .update(({ units }) => ({
        units: units.filter(({ key }) => key !== unit.key),
      }))
      .set.leaf.at(target)
      .update(({ units }) => ({ units: [...units, exhaustedUnit] }))
      .make.idle().get.out;
  });
