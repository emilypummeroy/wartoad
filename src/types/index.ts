// oxlint-disable-next-line typescript/no-unsafe-function-type
export type Read<T> = T extends Function
  ? T
  : {
      readonly [K in keyof T]: Read<T[K]>;
    };
