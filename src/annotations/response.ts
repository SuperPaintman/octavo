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
  METADATA_RESPONSE
} from '../constants/metadata';


/** Interfaces */
export interface ResponseMetadata {
  body?:         Schema;
  headers?:      Schema;
}

export interface ResponseOptions {
  body?:         SchemaDetailsObject;
  headers?:      SchemaDetailsObject;
}


/** Helpers */
export const getResponse = makeMetadataGetter<ResponseMetadata>(METADATA_RESPONSE, () => ({}));
export const setResponse = makeMetadataSetter<ResponseMetadata>(METADATA_RESPONSE);


export function Response(options: ResponseOptions): MethodAnnotation {
  const { body, headers } = options;

  return function annotation(target, key) {
    const response: ResponseMetadata = { };

    if (body !== undefined) {
      response.body = new Schema(body);
    }

    if (headers !== undefined) {
      response.headers = new Schema(headers);
    }

    setResponse(response, target.constructor, key);
  };
}
