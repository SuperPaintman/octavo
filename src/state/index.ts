'use strict';

/**
 * @todo(SuperPaintman):
 *    Add event hooks like:
 *      * onSuccess
 *      * onError
 *      * onSocketClose
 */

export interface ResolveState<T> {
  resolve(...args: any[]): Promise<T>;
}
