'use strict';
// Bootstrap
export { bootstrap } from './bootstrap';

// Application
export { OctavoApplication, ApplicationConfig } from './application';

// Controller
export { ResourceController } from './controller';

// Annotations
export { Application } from './annotations/application';
export { Controller } from './annotations/controller';
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

// Errors
export * from './errors/http';

// Router
export {
  all,
  get,
  post,
  patch,
  del,
  scope,
  resource
} from './router';
