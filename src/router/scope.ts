'use strict';
/** Imports */
import { Type } from '../utils/type';
import { ControllerHandler } from '../controller';
import { MiddlewareExec } from '../middleware';
import { PolicyExec } from '../policy';
import { ResponseFormatter } from '../formatter';
import { AnyTransform } from '../transformer';
import { ErrorInterceptorHandler } from '../error-interceptor';


/* Interfaces */
export interface Handler<T> {
  method:     string;
  status:     number;
  Controller: Type<T>;
  key:        keyof T & ControllerHandler
}


/** Helpers */
function normalizePath(path: string): string {
  if (path === '/') {
    return '/';
  }

  let normalPath = path;

  if (normalPath.startsWith('/')) {
    normalPath = normalPath.slice(1);
  }

  if (!normalPath.endsWith('/')) {
    normalPath += '/';
  }

  return normalPath;
}


export class Scope {
  path:              string;
  handler?:          Handler<any>;
  errorInterceptors: Type<ErrorInterceptorHandler>[] = [];
  Transformer?:      Type<AnyTransform>;
  formatters:        Type<ResponseFormatter>[]       = [];
  middlewares:       Type<MiddlewareExec>[]          = [];
  policies:          Type<PolicyExec>[]              = [];
  stack:             Scope[]                         = [];

  constructor(
    path: string
  ) {
    this.path = normalizePath(path);
  }

  setHandler<T>(
    method:     string,
    status:     number,
    Controller: Type<T>,
    key:        keyof T & ControllerHandler
  ): this {
    this.handler = {
      method,
      status,
      Controller,
      key
    };

    return this;
  }

  setTransformer<T extends AnyTransform>(
    Transformer: Type<T>
  ): this {
    this.Transformer = Transformer;

    return this;
  }

  addErrorInterceptor<T extends ErrorInterceptorHandler>(
    ErrorInterceptor: Type<T>
  ) {
    this.errorInterceptors.push(ErrorInterceptor);

    return this;
  }

  addFormatter<T extends ResponseFormatter>(
    Formatter: Type<T>
  ): this {
    this.formatters.push(Formatter);

    return this;
  }

  addMiddleware<T extends MiddlewareExec>(
    Middleware: Type<T>
  ): this {
    this.middlewares.push(Middleware);

    return this;
  }

  addPolicy<T extends PolicyExec>(
    Policy: Type<T>
  ): this {
    this.policies.push(Policy);

    return this;
  }

  addChild(scope: Scope): this {
    this.stack.push(scope);

    return this;
  }
}
