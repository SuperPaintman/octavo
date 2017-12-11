'use strict';
/** Imports */
import { Type } from '../utils/type';
import {
  makeMetadataGetter,
  makeMetadataSetter,
  getDesignParamTypes,
  getDesignType
} from '../utils/metadata';

import {
  METADATA_INJECTION_TYPE,
  METADATA_CONSTRUCTOR_INJECTIONS,
  METADATA_PROPERTY_INJECTIONS
} from '../constants/metadata';


/** Helpers */
export const getInjectionType = makeMetadataGetter<TypeOfInjection | undefined>(METADATA_INJECTION_TYPE, () => undefined);
export const setInjectionType = makeMetadataSetter<TypeOfInjection>(METADATA_INJECTION_TYPE);

export const getConstructorInjections = makeMetadataGetter<any[]>(METADATA_CONSTRUCTOR_INJECTIONS, () => []);
export const setConstructorInjections = makeMetadataSetter<any[]>(METADATA_CONSTRUCTOR_INJECTIONS);

export const getPropertyInjections = makeMetadataGetter<object>(METADATA_PROPERTY_INJECTIONS, () => ({}));
export const setPropertyInjections = makeMetadataSetter<object>(METADATA_PROPERTY_INJECTIONS);


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
      const oldType = getInjectionType(Target);

      if (oldType) {
        throw new Error(`Cannot apply @${type}(), @${oldType}() already applied`);
      }

      const ctrInjections = getConstructorInjections(Target);

      while (ctrInjections.length < Target.length) {
        ctrInjections.push(null);
      }

      setConstructorInjections(ctrInjections, Target);
      setInjectionType(type, Target);
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

    const ctrInjections = getConstructorInjections(Target);


    const type = token !== undefined
               ? token
               : getDesignParamTypes(Target)[index];

    ctrInjections[index] = type;

    setConstructorInjections(ctrInjections, Target);
  };
}

export function InjectProperty(token?: any): PropertyDecorator {
  return function decorator(Target: Type<any>, key: string | symbol) {
    const propInjections = getPropertyInjections(Target.constructor);

    const type = token !== undefined
               ? token
               : getDesignType(Target, key);

      (propInjections as any)[key] = type;

    setPropertyInjections(propInjections, Target.constructor);
  };
}
