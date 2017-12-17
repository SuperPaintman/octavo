'use strict';

/**
 * @todo(SuperPaintman):
 *    It's a bad name for interface, I think. Change it, maybe.
 */

export interface MiddlewareExec {
  exec(...args: any[]): Promise<void>;
}
