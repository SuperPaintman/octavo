'use strict';
/** Imports */
import { Type } from '../utils/type';
import { stringify } from '../utils/stringify';
import {
  ClassAnnotation,
  ConstructorParameterAnnotation,
  PropertyAnnotation,
  makeClassAnnotation,
  TypeOfInjection,
  getConstructorInjections,
  getDesignParamTypes,
  setConstructorInjections,
  getDesignType,
  getPropertyInjections,
  setPropertyInjections,
  MISSED_INJECTION
} from '../utils/metadata';


/** Helpers */
export abstract class ServiceType {

}

export abstract class FactoryType {

}

export abstract class ProviderType<T = any> {
  abstract provide(): T;
}


export const Service  = makeClassAnnotation<Type<ServiceType>>(
  'Service',
  TypeOfInjection.Service
);
export const Factory  = makeClassAnnotation<Type<FactoryType>>(
  'Factory',
  TypeOfInjection.Factory
);
export const Provider = makeClassAnnotation<Type<ProviderType>>(
  'Provider',
  TypeOfInjection.Provider
);


export function Inject(token?: any) {
  return function decorator(...args: any[]) {
    if (args[2] === undefined) {
      return InjectProperty(token).apply(null, args);
    } else {
      return InjectParam(token).apply(null, args);
    }
  };
}

export function InjectParam(token?: any): ConstructorParameterAnnotation {
  return function decorator(Target, key, index) {
    if (key !== undefined) {
      throw new Error(`Cannot inject not into ${stringify(Target)} constructor`);
    }

    const ctrInjections = getConstructorInjections(Target);

    while (ctrInjections.length < index) {
      ctrInjections.push(MISSED_INJECTION);
    }

    const type = token !== undefined
               ? token
               : getDesignParamTypes(Target)[index];

    ctrInjections[index] = type;

    setConstructorInjections(ctrInjections, Target);
  };
}

export function InjectProperty(token?: any): PropertyAnnotation {
  return function decorator(target, key) {
    const propInjections = getPropertyInjections(target.constructor);

    const type = token !== undefined
               ? token
               : getDesignType(target, key);

    (propInjections as any)[key] = type;

    setPropertyInjections(propInjections, target.constructor);
  };
}
