'use strict';
/** Imports */
import { Type } from './type';
import { ProviderType } from '../annotations/di';

/**
 * This function always returns `null`. Please use it only for type inference.
 *
 * @see https://github.com/Microsoft/TypeScript/issues/6606
 *
 * @template T
 * @param {Type<ProviderType<T>>} Class
 * @returns {null}
 */
export function provideOf<T>(Class: Type<ProviderType<T>>): T {
  return null!;
}

/**
 * This function always returns `null`. Please use it only for type inference.
 *
 * @see https://github.com/Microsoft/TypeScript/issues/6606
 *
 * @template T
 * @param {(...args: any[]) => T} fn
 * @returns {T}
 */
export function returnOf<T>(fn: (...args: any[]) => T): T {
  return null!;
}
