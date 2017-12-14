'use strict';
/** Imports */
import * as _ from 'lodash';

import { Scope } from './scope';
import { Type } from '../utils/type';
import {
  ResourceController,
  ControllerHandler
} from '../controller';


/** Interfaces */
export type Resource<T> = {
  [key in keyof ResourceController]: keyof T & ControllerHandler;
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

function register<T>(
  method:     string,
  status:     number,
  path:       string,
  Controller: Type<T>,
  key:        keyof T & ControllerHandler
): Scope {
  const parentScope = _stack.getParentScope();
  const s = _stack.open(path);

  s.setHandler(method, status, Controller, key);

  _stack.close(s);
  parentScope.addChild(s);

  return s;
}

function createMethod(
  method: string,
  status: number = 200
) {
  return function httpMethod<T>(
    path:       string,
    Controller: Type<T>,
    key:        keyof T & ControllerHandler
  ): Scope {
    return register(method, status, path, Controller, key);
  };
}


export const all    = createMethod('all');
export const get    = createMethod('get');
export const post   = createMethod('post');
export const patch  = createMethod('patch');
export const del    = createMethod('delete');

export function scope(path: string, fn: () => void): Scope {
  const parentScope = _stack.getParentScope();
  const s = _stack.open(path);

  fn();

  _stack.close(s);
  parentScope.addChild(s);

  return s;
}

export function resource<T>(
  path:       string,
  Controller: Type<T>,
  methods?:   Resource<T>
) {
  const resourceMethods: Resource<any> = methods !== undefined
                                       ? methods
                                       : DEFAULT_METHODS;

  scope(path, () => {
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
