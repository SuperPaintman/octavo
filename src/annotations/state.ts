'use strict';
/** Imports */
import { Type } from '../utils/type';
import {
  makeClassAnnotation,
  TypeOfInjection,
  ClassAnnotation
} from '../utils/metadata';
import {
  ResolveState
} from '../state';


export const State = makeClassAnnotation<Type<ResolveState<any>>>(
  'State',
  TypeOfInjection.Service
);
