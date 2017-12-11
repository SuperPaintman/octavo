'use strict';
// Annotations
export { Service, Factory, Provider, Inject } from './annotations/di';

// DI
export { Injector } from './di/injector';

// Schema
export {
  o,
  object,
  array,
  string,
  number,
  boolean,
  $slot
} from './schema';
