'use strict';
/** Imports */
import { Type } from '../utils/type';
import {
  makeClassAnnotation,
  TypeOfInjection,
  ClassAnnotation
} from '../utils/metadata';
import {
  PolicyExec
} from '../policy';


export const Policy = makeClassAnnotation<Type<PolicyExec>>(
  'Policy',
  TypeOfInjection.Service
);
