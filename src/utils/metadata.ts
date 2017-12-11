'use strict';
/** Imports */
import 'reflect-metadata';

import * as _ from 'lodash';

import { Type } from './type';

import {
  METADATA_DESIGN_PARAM_TYPES,
  METADATA_DESIGN_TYPE
} from '../constants/metadata';


/** Helpers */
function getOwnMetadata(key: string | symbol, target: object): any;
function getOwnMetadata(key: string | symbol, target: object, propertyKey: string | symbol): any;
function getOwnMetadata(key: string | symbol, target: object, propertyKey?: string | symbol): any {
  if (!(Reflect && Reflect.getOwnMetadata)) {
    throw new Error('reflect-metadata shim is required');
  }

  // if (!_.isObject(target)) {
  //   throw new TypeError();
  // }
  //
  // if (propertyKey !== undefined) {
  //   return (target as any)[propertyKey][key];
  // }
  //
  // return (target as any)[key];

  return propertyKey !== undefined
       ? Reflect.getOwnMetadata(key, target, propertyKey)
       : Reflect.getOwnMetadata(key, target);
};

function defineMetadata(key: string | symbol, value: any, target: object): void;
function defineMetadata(key: string | symbol, value: any, target: object, propertyKey: string | symbol): void;
function defineMetadata(key: string | symbol, value: any, target: object, propertyKey?: string | symbol): void {
  if (!(Reflect && Reflect.defineMetadata)) {
    throw new Error('reflect-metadata shim is required');
  }

  // if (!_.isObject(target)) {
  //   throw new TypeError();
  // }
  //
  // return Object.defineProperty(target, key, {
  //   configurable: true,
  //   enumerable: false,
  //   writable: true,
  //   value
  // });

  return propertyKey !== undefined
       ? Reflect.defineMetadata(key, value, target, propertyKey)
       : Reflect.defineMetadata(key, value, target);
};


export function makeMetadataGetter<T extends any>(key: string | symbol, defaultValue: () => T) {
  return function getter<TTarget extends Type<any> | object>(target: TTarget, propertyKey?: string | symbol): T {
    const result = propertyKey !== undefined
                 ? getOwnMetadata(key, target, propertyKey)
                 : getOwnMetadata(key, target);

    if (result !== undefined) {
      return result;
    }

    return defaultValue();
  };
}

export function makeMetadataSetter<T extends any>(key: string | symbol) {
  return function setter<TTarget extends Type<any> | object>(value: T, target: TTarget, propertyKey?: string | symbol): void {
    if (propertyKey !== undefined) {
      defineMetadata(key, value, target, propertyKey);
    } else {
      defineMetadata(key, value, target);
    }
  };
}

export const getDesignParamTypes = makeMetadataGetter<any[]>(METADATA_DESIGN_PARAM_TYPES, () => []);
// export const setMetadataDesignParamTypes

export const getDesignType = makeMetadataGetter(METADATA_DESIGN_TYPE, () => undefined);
// export const setMetadataDesignType
