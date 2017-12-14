'use strict';
/** Imports */
import { Type } from '../utils/type';
import { ControllerHandler } from '../controller';


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
  path:     string;
  handler?: Handler<any>;
  stack:    Scope[]        = [];

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

  addChild(scope: Scope): this {
    this.stack.push(scope);

    return this;
  }
}
