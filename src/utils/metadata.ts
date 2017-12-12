'use strict';
/** Imports */
import 'reflect-metadata';

import * as _ from 'lodash';

import { Type } from './type';
import { stringify } from './stringify';

import {
  METADATA_DESIGN_PARAM_TYPES,
  METADATA_DESIGN_TYPE,
  METADATA_ANNOTATION_NAME,
  METADATA_INJECTION_TYPE,
  METADATA_CONSTRUCTOR_INJECTIONS,
  METADATA_PROPERTY_INJECTIONS
} from '../constants/metadata';


/** Interfaces */
export interface ClassAnnotation<T extends Type<any>> {
  (Target: T): void;
}

export interface PropertyAnnotation {
  <T extends object>(target: T, key: string | symbol): void;
}

export interface MethodAnnotation {
  <T extends object, TDescriptor>(target: T, key: string | symbol, descriptor: TypedPropertyDescriptor<TDescriptor>): void;
}

export interface ConstructorParameterAnnotation {
  <T extends Type<any>>(Target: T, key: undefined, index: number): void;
}

export interface MethodParameterAnnotation {
  <T extends object>(target: T, key: string | symbol, index: number): void;
}

export type ParameterAnnotation =
  | ConstructorParameterAnnotation
  | MethodParameterAnnotation
  ;


/** Helpers */
export const MISSED_INJECTION = {};

export enum TypeOfInjection {
  Service  = 'Service',
  Factory  = 'Factory',
  Provider = 'Provider'
}

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

export const getAnnotationName = makeMetadataGetter<string | undefined>(METADATA_ANNOTATION_NAME, () => undefined);
export const setAnnotationName = makeMetadataSetter<string>(METADATA_ANNOTATION_NAME);

export const getInjectionType = makeMetadataGetter<TypeOfInjection | undefined>(METADATA_INJECTION_TYPE, () => undefined);
export const setInjectionType = makeMetadataSetter<TypeOfInjection>(METADATA_INJECTION_TYPE);

export const getConstructorInjections = makeMetadataGetter<any[]>(METADATA_CONSTRUCTOR_INJECTIONS, () => []);
export const setConstructorInjections = makeMetadataSetter<any[]>(METADATA_CONSTRUCTOR_INJECTIONS);

export const getPropertyInjections = makeMetadataGetter<object>(METADATA_PROPERTY_INJECTIONS, () => ({}));
export const setPropertyInjections = makeMetadataSetter<object>(METADATA_PROPERTY_INJECTIONS);


export function makeClassAnnotation<T extends Type<any>>(
  name: string,
  type: TypeOfInjection,
  extension?: (this: null, ...args: any[]) => (Target: T) => void
) {
  return <() => ClassAnnotation<T>>function Annotation(...args: any[]): ClassAnnotation<T> {
    return function annotation(Target: T) {
      const oldName = getAnnotationName(Target);

      if (oldName !== undefined) {
        throw new Error(`Cannot apply @${name}(), @${oldName}() already applied`);
      }

      setAnnotationName(name, Target);

      const ctrInjections = getConstructorInjections(Target);

      while (ctrInjections.length < Target.length) {
        ctrInjections.push(MISSED_INJECTION);
      }

      for (const [index, injection] of _.entries(ctrInjections)) {
        if (injection === MISSED_INJECTION) {
          throw new Error(`Missed annotation for ${index} param in ${stringify(Target)} constructor`);
        }
      }

      setConstructorInjections(ctrInjections, Target);
      setInjectionType(type, Target);

      if (extension !== undefined) {
        extension.apply(null, args)(Target);
      }
    };
  };
}
