import { noop } from '.';
import { _, counter } from './test-utils';

describe(noop, () => {
  it('should not throw any errors', () => {
    expect(() => {
      noop();
      noop(_);
      noop(0);
      noop('ieacntiea');
      noop({});
      noop([0, 'ieacntieant']);
    }).not.toThrow();
  });
});

describe(counter, () => {
  it('should return increasing unique values', () => {
    const a = counter();
    const b = counter();
    const c = counter();
    const d = counter();
    const e = counter();

    expect(e).toBeGreaterThan(d);
    expect(d).toBeGreaterThan(c);
    expect(c).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(a);
  });

  it('should return the same sequence with each reset', () => {
    counter.reset();
    const a = [counter(), counter(), counter(), counter()];
    counter.reset();
    const b = [counter(), counter(), counter(), counter()];
    expect(b).toStrictEqual(a);
  });
});
