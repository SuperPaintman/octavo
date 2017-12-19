'use strict';
/** Imports */
import { Type } from '../utils/type';
import {
  makeClassAnnotation,
  TypeOfInjection,
  ClassAnnotation
} from '../utils/metadata';
import {
  ErrorInterceptorHandler
} from '../error-interceptor';


export const ErrorInterceptor = makeClassAnnotation<Type<ErrorInterceptorHandler>>(
  'ErrorInterceptor',
  TypeOfInjection.Service
);
