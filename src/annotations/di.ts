'use strict';
/** Imports */
import 'reflect-metadata';

import { Type } from '../utils/type';

import {
  METADATA_DESIGN_PARAM_TYPES,
  METADATA_DESIGN_TYPE,
  METADATA_INJECTION_TYPE,
  METADATA_CONSTRUCTOR_INJECTIONS,
  METADATA_PROPERTY_INJECTIONS
} from '../constants/metadata';


export enum TypeOfInjection {
  Service  = 'Service',
  Factory  = 'Factory',
  Provider = 'Provider'
}


export abstract class ServiceType {

}

export abstract class FactoryType {

}

export abstract class ProviderType<T = any> {
  abstract provide(): T;
}


function makeClassAnnotation<T>(type: TypeOfInjection) {
  return function Annotation() {
    return function annotation(Target: Type<T>) {
      const oldType = Reflect.getOwnMetadata(METADATA_INJECTION_TYPE, Target);

      if (oldType) {
        throw new Error(`Cannot apply @${type}(), @${oldType}() already applied`);
      }

      const ctrInjections = Reflect.getOwnMetadata(METADATA_CONSTRUCTOR_INJECTIONS, Target) || [];

      while (ctrInjections.length < Target.length) {
        ctrInjections.push(null);
      }

      Reflect.defineMetadata(METADATA_CONSTRUCTOR_INJECTIONS, ctrInjections, Target);

      Reflect.defineMetadata(METADATA_INJECTION_TYPE, type, Target);
    };
  };
}

export const Service  = makeClassAnnotation<ServiceType>(TypeOfInjection.Service);
export const Factory  = makeClassAnnotation<FactoryType>(TypeOfInjection.Factory);
export const Provider = makeClassAnnotation<ProviderType>(TypeOfInjection.Provider);


export function Inject(token?: any) {
  return function decorator(...args: any[]) {
    if (args[2] === undefined) {
      return InjectProperty(token).apply(null, args);
    } else {
      return InjectParam(token).apply(null, args);
    }
  };
}

export function InjectParam(token?: any) {
  return function decorator(Target: Type<any>, key: string | symbol, index: number) {
    if (key !== undefined) {
      throw new Error(`Cannot inject not into ${Target.name}#constructor()`)
    }

    const ctrInjections = Reflect.getOwnMetadata(METADATA_CONSTRUCTOR_INJECTIONS, Target) || [];

    if (token !== undefined) {
      ctrInjections[index] = token;
    } else {
      const types = Reflect.getOwnMetadata(METADATA_DESIGN_PARAM_TYPES, Target) || [];

      ctrInjections[index] = types[index];
    }

    Reflect.defineMetadata(METADATA_CONSTRUCTOR_INJECTIONS, ctrInjections, Target);
  };
}

export function InjectProperty(token?: any): PropertyDecorator {
  return function decorator(Target: Type<any>, key: string | symbol) {
    const propInjections = Reflect.getOwnMetadata(METADATA_PROPERTY_INJECTIONS, Target.constructor) || {};

    if (token !== undefined) {
      propInjections[key] = token;
    } else {
      const type = Reflect.getMetadata(METADATA_DESIGN_TYPE, Target, key);

      propInjections[key] = type;
    }

    Reflect.defineMetadata(METADATA_PROPERTY_INJECTIONS, propInjections, Target.constructor);
  };
}
