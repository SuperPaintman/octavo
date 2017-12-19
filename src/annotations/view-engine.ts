'use strict';
/** Imports */
import { Type } from '../utils/type';
import {
  makeClassAnnotation,
  TypeOfInjection,
  ClassAnnotation
} from '../utils/metadata';
import {
  ViewEngineRender
} from '../view-engine';


export const ViewEngine = makeClassAnnotation<Type<ViewEngineRender>>(
  'ViewEngine',
  TypeOfInjection.Service
);
