'use strict';
/** Imports */
import { Type } from '../utils/type';
import {
  ServiceType,
  FactoryType,
  ProviderType
} from '../annotations/di';


export interface OverrideServiceProvider {
  use: Type<ServiceType>;
  insteadOf: Type<ServiceType>;
}

export interface OverrideFactoryProvider {
  use: Type<FactoryType>;
  insteadOf: Type<FactoryType>;
}

export interface OverrideProviderProvider {
  use: Type<ProviderType>;
  insteadOf: Type<ProviderType>;
}

export type OverrideProvider =
  | OverrideServiceProvider
  | OverrideFactoryProvider
  | OverrideProviderProvider
  ;

export type Provider =
  | OverrideProvider
  | Type<any>;
