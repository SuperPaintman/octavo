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
  METADATA_REQUEST
} from '../constants/metadata';


/** Interfaces */
export interface RequestMetadata {
  body?:         Schema;
  params?:       Schema;
  headers?:      Schema;
  query?:        Schema;
}

export interface RequestOptions {
  body?:         SchemaDetailsObject;
  params?:       SchemaDetailsObject;
  headers?:      SchemaDetailsObject;
  query?:        SchemaDetailsObject;
}


/** Helpers */
export const getRequest = makeMetadataGetter<RequestMetadata>(METADATA_REQUEST, () => ({}));
export const setRequest = makeMetadataSetter<RequestMetadata>(METADATA_REQUEST);


export function Request(options: RequestOptions): MethodAnnotation {
  const { body, params, headers, query } = options;

  return function annotation(target, key) {
    const request: RequestMetadata = { };

    if (body !== undefined) {
      request.body = new Schema(body);
    }

    if (params !== undefined) {
      request.params = new Schema(params);
    }

    if (headers !== undefined) {
      request.headers = new Schema(headers);
    }

    if (query !== undefined) {
      request.query = new Schema(query);
    }

    setRequest(request, target.constructor, key);
  };
}
