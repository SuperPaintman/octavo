'use strict';
/** Imports */
import { Type } from '../utils/type';
import {
  makeClassAnnotation,
  TypeOfInjection,
  ClassAnnotation
} from '../utils/metadata';
import { AnyTransform } from '../transformer';


export const Transformer = makeClassAnnotation<Type<AnyTransform>>(
  'Transformer',
  TypeOfInjection.Service
);
