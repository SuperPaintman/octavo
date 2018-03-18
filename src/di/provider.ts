'use strict';
/** Imports */
import { InjectionToken } from './injection-token';
import { Type } from '../utils/type';
import {
  ServiceType,
  FactoryType,
  ProviderType
} from '../annotations/di';

export interface OverrideRawProvider {
  use: any;
  insteadOf: InjectionToken<any>;
}

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
  | OverrideRawProvider
  | OverrideServiceProvider
  | OverrideFactoryProvider
  | OverrideProviderProvider
  ;

export type Provider =
  | OverrideProvider
  | Type<any>;
