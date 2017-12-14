'use strict';
/** Imports */
import { Type } from '../utils/type';
import {
  makeMetadataGetter,
  makeMetadataSetter,
  makeClassAnnotation,
  TypeOfInjection,
  ClassAnnotation
} from '../utils/metadata';
import {
  OctavoApplication
} from '../application';
import {
  Provider
} from '../di/provider';
import {
  METADATA_PROVIDERS
} from '../constants/metadata';


/** Interfaces */
export interface ApplicationOptions<T> {
  providers?: Provider[];
}

export interface ApplicationAnnotation<T> {
  (options: ApplicationOptions<T>): ClassAnnotation<Type<OctavoApplication>>;
}


export const getProviders = makeMetadataGetter<Provider[]>(METADATA_PROVIDERS, () => []);
export const setProviders = makeMetadataSetter<Provider[]>(METADATA_PROVIDERS);


export const Application: ApplicationAnnotation<any> = makeClassAnnotation<Type<OctavoApplication>>(
  'Application',
  TypeOfInjection.Service,
  (options: ApplicationOptions<any>) => (Target) => {
    const { providers } = options;

    if (providers !== undefined) {
      setProviders([
        ...getProviders(Target),
        ...providers
      ], Target);
    }
  }
);
