// oxlint-disable-next-line typescript/no-unsafe-function-type
export type Read<T extends unknown[]> = {
  readonly [K in keyof T]: T[K];
};
