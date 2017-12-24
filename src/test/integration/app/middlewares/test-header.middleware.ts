'use strict';
/** Imports */
import { Middleware, MiddlewareExec, MiddlewareContext, Context } from '../../../..';


@Middleware()
export class TestHeaderMiddleware implements MiddlewareExec {
  async exec(
    @Context() ctx: MiddlewareContext
  ) {
    ctx.setHeader('Test-Header', 'Hello There');
  }
}
