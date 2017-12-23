'use strict';
/** Imports */
import * as _ from 'lodash';

import { Scope } from './scope';
import { Type } from '../utils/type';
import {
  ResourceController,
  ControllerHandler
} from '../controller';
import { MiddlewareExec } from '../middleware';
import { PolicyExec } from '../policy';
import { ResponseFormatter } from '../formatter';
import { AnyTransform } from '../transformer';
import { ErrorInterceptorHandler } from '../error-interceptor';


/** Interfaces */
export type Resource<T> = {
  [key in keyof ResourceController]: keyof T; // & ControllerHandler;
}

export interface ScopeOptions {
  errorInterceptors?: Type<ErrorInterceptorHandler>[];
  transformer?: Type<AnyTransform>;
  formatters?: Type<ResponseFormatter>[];
  middlewares?: Type<MiddlewareExec>[];
  policies?: Type<PolicyExec>[];
}

export interface HttpMethod {
  <T>(
    path:       string,
    Controller: Type<T>,
    key:        keyof T // & ControllerHandler
  ): Scope;
  <T>(
    path:       string,
    options:    ScopeOptions,
    Controller: Type<T>,
    key:        keyof T // & ControllerHandler
  ): Scope;
}


/** Helpers */
const DEFAULT_METHODS = <Resource<any>>{
  index:   'index',
  new:     'new',
  show:    'show',
  create:  'create',
  edit:    'edit',
  update:  'update',
  destroy: 'destroy'
};

class Stack {
  private _stack: Scope[] = [];

  getParentScope(): Scope {
    if (this._stack.length > 0) {
      return this._stack[this._stack.length - 1];
    }

    return new Scope('/');
  }

  open(path: string): Scope {
    const scope = new Scope(path);

    this._stack.push(scope);

    return scope;
  }

  close(scope: Scope): void {
    if (!this._isLastScope(scope)) {
      throw new Error('This is not a last scope');
    }

    this._stack.pop();
  }

  private _isLastScope(scope: Scope): boolean {
    if (this._stack.length === 0) {
      return false;
    }

    const lastScope = this._stack[this._stack.length - 1];

    return scope === lastScope;
  }
}

let _stack = new Stack();

function applyScopeOptions(
  scope:   Scope,
  options: ScopeOptions
): void {
  if (options.transformer !== undefined) {
    scope.setTransformer(options.transformer);
  }

  if (options.errorInterceptors !== undefined && options.errorInterceptors.length > 0) {
    _.forEach(options.errorInterceptors, (errorInterceptor) => {
      scope.addErrorInterceptor(errorInterceptor);
    });
  }

  if (options.formatters !== undefined && options.formatters.length > 0) {
    _.forEach(options.formatters, (formatter) => {
      scope.addFormatter(formatter);
    });
  }

  if (options.middlewares !== undefined && options.middlewares.length > 0) {
    _.forEach(options.middlewares, (middleware) => {
      scope.addMiddleware(middleware);
    });
  }

  if (options.policies !== undefined && options.policies.length > 0) {
    _.forEach(options.policies, (policy) => {
      scope.addPolicy(policy);
    });
  }
}

function register<T>(
  method:     string,
  status:     number,
  path:       string,
  Controller: Type<T>,
  key:        keyof T & ControllerHandler,
  options:    ScopeOptions = {}
): Scope {
  const parentScope = _stack.getParentScope();
  const s = _stack.open(path);

  applyScopeOptions(s, options);

  s.setHandler(method, status, Controller, key);

  _stack.close(s);
  parentScope.addChild(s);

  return s;
}

export function createMethod(
  method: string,
  status: number = 200
): HttpMethod {
  return function httpMethod<T>(path: string, ...args: any[]): Scope {
    let options:    ScopeOptions = {};
    let Controller: Type<T>;
    let key:        keyof T & ControllerHandler;

    if (args.length === 3) {
      [options, Controller, key] = args;
    } else {
      [Controller, key] = args;
    }

    return register(method, status, path, Controller, key, options);
  };
}


export const all    = createMethod('all');
export const get    = createMethod('get');
export const post   = createMethod('post');
export const patch  = createMethod('patch');
export const del    = createMethod('delete');

export function scope(path: string, fn: () => void): Scope;
export function scope(path: string, options: ScopeOptions, fn: () => void): Scope;
export function scope(path: string, ...args: any[]): Scope {
  let fn: () => void;
  let options: ScopeOptions = {};

  if (args.length === 2) {
    [options, fn] = args;
  } else {
    [fn] = args;
  }

  const parentScope = _stack.getParentScope();
  const s = _stack.open(path);

  applyScopeOptions(s, options);

  fn();

  _stack.close(s);
  parentScope.addChild(s);

  return s;
}

export function resource<T>(
  path:       string,
  Controller: Type<T>,
  methods?:   Resource<T>
): Scope;
export function resource<T>(
  path:       string,
  options:    ScopeOptions,
  Controller: Type<T>,
  methods?:   Resource<T>
): Scope;
export function resource<T>(
  path:       string,
  ...args:    any[]
): Scope {
  let options:    ScopeOptions = {};
  let Controller: Type<T>;
  let methods:    Resource<T> | undefined;

  if (_.isFunction(args[1])) {
    [options, Controller, methods] = args;
  } else {
    [Controller, methods] = args;
  }

  const resourceMethods: Resource<any> = methods !== undefined
                                       ? methods
                                       : DEFAULT_METHODS;

  return scope(path, options, () => {
    _.forEach(resourceMethods, (key, method) => {
      if (Controller.prototype[method] === undefined) {
        return;
      }

      switch (method) {
        case 'index':   return register('get',   200, '/',         Controller, key as any);
        case 'new':     return register('get',   200, '/new',      Controller, key as any);
        case 'show':    return register('get',   200, '/:id',      Controller, key as any);
        case 'create':  return register('post',  201, '/',         Controller, key as any);
        case 'edit':    return register('get',   200, '/:id/edit', Controller, key as any);
        case 'update':  return register('patch', 200, '/:id',      Controller, key as any);
        case 'destroy': return register('del',   200, '/:id',      Controller, key as any);
        default: throw new Error(`Unexpected resource method: ${method}`);
      }
    });
  });
}
