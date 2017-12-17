'use strict';
/** Imports */
import { Type } from '../utils/type';
import { stringify } from '../utils/stringify';
import {
  makeMetadataGetter,
  makeMetadataSetter,
  MethodParameterAnnotation,
  MISSED_INJECTION
} from '../utils/metadata';

import {
  METADATA_CONTEXTUAL_INJECTIONS
} from '../constants/metadata';

export interface NextFn {
  (): Promise<void>;
}


/** Interfaces */
export interface ContextualInjection {
  name: string;
  type: TypeOfContextualInjection;
  args: any[];
}

export interface ParamsAnnotation {
  (name?: string): MethodParameterAnnotation;
}

export interface BodyAnnotation {
  (name?: string): MethodParameterAnnotation;
}

export interface HeadersAnnotation {
  (name?: string): MethodParameterAnnotation;
}


/** Helpers */
export enum TypeOfContextualInjection {
  Next    = 'Next',
  Context = 'Context',
  Params  = 'Params',
  Body    = 'Body',
  Headers = 'Headers'
}

export const getContextualInjections = makeMetadataGetter<ContextualInjection[]>(METADATA_CONTEXTUAL_INJECTIONS, () => []);
export const setContextualInjections = makeMetadataSetter<ContextualInjection[]>(METADATA_CONTEXTUAL_INJECTIONS);

function makeContextualInjection(
  name: string,
  type: TypeOfContextualInjection,
) {
  return <() => MethodParameterAnnotation>function Annotation(...args: any[]): MethodParameterAnnotation {
    return function annotation(target, key, index) {
      if (key === undefined) {
        throw new Error(`Cannot inject into ${stringify(target.constructor)} constructor`);
      }

      const ctxInjections = getContextualInjections(target.constructor, key);

      // while (ctxInjections.length < index) {
      //   ctxInjections.push(MISSED_INJECTION);
      // }

      const oldInjection = ctxInjections[index];
      if (oldInjection !== undefined) {
        throw new Error(`Cannot apply @${name}(), @${oldInjection.name}() already applied`);
      }

      ctxInjections[index] = {
        name,
        type,
        args
      };

      setContextualInjections(ctxInjections, target.constructor, key);
    }
  };
}

export const Context = makeContextualInjection(
  'Context',
  TypeOfContextualInjection.Context
);

export const Next = makeContextualInjection(
  'Next',
  TypeOfContextualInjection.Next
);

export const Params: ParamsAnnotation = makeContextualInjection(
  'Params',
  TypeOfContextualInjection.Params
);

export const Body: BodyAnnotation = makeContextualInjection(
  'Body',
  TypeOfContextualInjection.Body
);

export const Headers: HeadersAnnotation = makeContextualInjection(
  'Headers',
  TypeOfContextualInjection.Headers
);
