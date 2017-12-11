'use strict';
/**
 * This is a correct TS fork of `es6-error`.
 *
 * @see https://github.com/bjyoungblood/es6-error
 *
 * @todo(SuperPaintman):
 *    Move it to separate module.
 */

/** Imports */
import { Type } from '../utils/type';


/** Helpers */
function extendableBuiltin<T>(Class: Type<T>): Type<T> {
  function ExtendableBuiltin(this: any) {
    Class.apply(this, arguments);
  }

  ExtendableBuiltin.prototype = Object.create(Class.prototype, {
    constructor: {
      value:        Class,
      enumerable:   false,
      writable:     true,
      configurable: true
    }
  });

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ExtendableBuiltin, Class);
  } else {
    (ExtendableBuiltin as any).__proto__ = Class;
  }

  return ExtendableBuiltin as any;
}


export class ExtendableError extends extendableBuiltin(Error) {
  constructor(message = '') {
    super(message);

    Object.defineProperty(this, 'message', {
      configurable: true,
      enumerable:   false,
      value:        message,
      writable:     true
    });

    Object.defineProperty(this, 'name', {
      configurable: true,
      enumerable:   false,
      value:        this.constructor.name,
      writable:     true
    });

    if (Error.hasOwnProperty('captureStackTrace')) {
      Error.captureStackTrace(this, this.constructor);
      return;
    }

    Object.defineProperty(this, 'stack', {
      configurable: true,
      enumerable:   false,
      value:        new Error(message).stack,
      writable:     true
    });
  }
}
