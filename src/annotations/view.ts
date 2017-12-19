'use strict';
/** Imports */
import { Schema, SchemaDetailsObject } from '../schema';
import { Type } from '../utils/type';
import {
  makeMetadataGetter,
  makeMetadataSetter,
  MethodAnnotation
} from '../utils/metadata';

import {
  METADATA_VIEW
} from '../constants/metadata';


/** Interfaces */
export interface ViewMetadata {
  name: string;
}


/** Helpers */
export const getView = makeMetadataGetter<ViewMetadata | undefined>(METADATA_VIEW, () => undefined);
export const setView = makeMetadataSetter<ViewMetadata>(METADATA_VIEW);


export function View(name: string): MethodAnnotation {
  return function annotation(target, key) {
    setView({
      name
    }, target.constructor, key);
  };
}
