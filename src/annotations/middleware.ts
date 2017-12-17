'use strict';
/** Imports */
import { Type } from '../utils/type';
import {
  makeClassAnnotation,
  TypeOfInjection,
  ClassAnnotation
} from '../utils/metadata';
import {
  MiddlewareExec
} from '../middleware';


export const Middleware = makeClassAnnotation<Type<MiddlewareExec>>(
  'Middleware',
  TypeOfInjection.Service
);
