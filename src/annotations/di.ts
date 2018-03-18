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
  Injection
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
      ctrInjections.push(new Injection());
    }

    const type = token !== undefined
               ? token
               : getDesignParamTypes(Target)[index];

    const injection = ctrInjections[index] !== undefined
                    ? ctrInjections[index]
                    : new Injection();

    injection.type = type;

    ctrInjections[index] = injection;

    setConstructorInjections(ctrInjections, Target);
  };
}

export function InjectProperty(token?: any): PropertyAnnotation {
  return function decorator(target, key) {
    const propInjections = getPropertyInjections(target.constructor);

    const type = token !== undefined
               ? token
               : getDesignType(target, key);

    const injection = propInjections.has(key)
                    ? propInjections.get(key)!
                    : new Injection();

    injection.type = type;

    propInjections.set(key, injection);

    setPropertyInjections(propInjections, target.constructor);
  };
}

export function Optional() {
  return function decorator(...args: any[]) {
    if (args[2] === undefined) {
      return OptionalProperty().apply(null, args);
    } else {
      return OptionalParam().apply(null, args);
    }
  };
}

export function OptionalParam(): ConstructorParameterAnnotation {
  return function decorator(Target, key, index) {
    if (key !== undefined) {
      throw new Error(`Cannot inject not into ${stringify(Target)} constructor`);
    }

    const ctrInjections = getConstructorInjections(Target);

    while (ctrInjections.length < index) {
      ctrInjections.push(new Injection());
    }

    const injection = ctrInjections[index] !== undefined
                    ? ctrInjections[index]
                    : new Injection();

    injection.isOptional = true;

    ctrInjections[index] = injection;

    setConstructorInjections(ctrInjections, Target);
  };
}

export function OptionalProperty(): PropertyAnnotation {
  return function decorator(target, key) {
    const propInjections = getPropertyInjections(target.constructor);

    const injection = propInjections.has(key)
                    ? propInjections.get(key)!
                    : new Injection();

    injection.isOptional = true;

    propInjections.set(key, injection);

    setPropertyInjections(propInjections, target.constructor);
  };
}
