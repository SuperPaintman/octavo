'use strict';

export function tolerantPromise<T>(
  promise: Promise<T>
): Promise<
  | { error: null; result: T; }
  | { error: any;  result: null; }
> {
  return promise
    .then((result: T) => ({ result, error: null }))
    .catch((error: any) => ({ result: null, error }));
}
