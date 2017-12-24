'use strict';
/** Imports */
import { Schema, SchemaDetailsObject } from '../schema';
import { Type } from '../utils/type';
import {
  makeMetadataGetter,
  makeMetadataSetter,
  ClassAnnotation,
  MethodAnnotation
} from '../utils/metadata';

import {
  METADATA_DESCRIPTION
} from '../constants/metadata';


/** Interfaces */
export interface ViewMetadata {
  name: string;
}


/** Helpers */
export const getDescription = makeMetadataGetter<string | undefined>(METADATA_DESCRIPTION, () => undefined);
export const setDescription = makeMetadataSetter<string>(METADATA_DESCRIPTION);


export function Description(str: string) {
  return MethodDescription(str);

  // return function annotation(...args: any[]) {
  //   if (args.length === 1) {
  //     return ClassDescription(str).apply(null, args);
  //   } else {
  //     return MethodDescription(str).apply(null, args);
  //   }
  // };
}

// export function ClassDescription(str: string): ClassAnnotation<Type<any>> {
//   return function annotation(Target) {
//     setDescription(str, Target);
//   };
// }

export function MethodDescription(str: string): MethodAnnotation {
  return function annotation(target, key) {
    setDescription(str, target.constructor, key);
  };
}
