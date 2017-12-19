'use strict';

/**
 * @todo(SuperPaintman):
 *    It's a bad name for interface, I think. Change it, maybe.
 */

export abstract class ErrorInterceptorHandler {
  check?(err: Error): boolean;

  abstract handle(err: Error): Promise<never | void>;

  report?(err: Error): Promise<void> | void;
}
