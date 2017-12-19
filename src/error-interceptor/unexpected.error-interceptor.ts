'use strict';
/** Imports */
import { Inject } from '../annotations/di';
import { ErrorInterceptor } from '../annotations/error-interceptor';
import { InternalServerError } from '../errors/http';
import { ErrorInterceptorHandler } from '../error-interceptor';
import { Logger } from '../services/logger';


@ErrorInterceptor()
export class UnexpectedErrorInterceptor implements ErrorInterceptorHandler {
  private logger: Logger;

  constructor(
    @Inject() logger: Logger
  ) {
    this.logger = logger.scope(UnexpectedErrorInterceptor.name);
  }

  async handle() {
    throw new InternalServerError();
  }

  report(err: Error) {
    const message = err.stack !== undefined
                  ? err.stack
                  : err.toString();

    this.logger.fatal(message);
  }
}
