'use strict';
/** Imports */
import { Middleware, MiddlewareExec, MiddlewareContext, Context, Next, NextFn } from '../../../..';


@Middleware()
export class AfterResponseMiddleware implements MiddlewareExec {
  async exec(
    @Next()    next: NextFn,
    @Context() ctx:  MiddlewareContext
  ) {
    try {
      await next();
      ctx.setHeader('After-Response', `${ctx.method}:${ctx.url}:success:${ctx.status}`);
    } catch (err) {
      ctx.setHeader('After-Response', `${ctx.method}:${ctx.url}:error:${ctx.status}`);
      throw err;
    }
  }
}
