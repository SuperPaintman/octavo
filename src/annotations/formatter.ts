'use strict';
/** Imports */
import { Type } from '../utils/type';
import {
  makeMetadataGetter,
  makeMetadataSetter,
  makeClassAnnotation,
  TypeOfInjection,
  ClassAnnotation
} from '../utils/metadata';
import {
  ResponseFormatter
} from '../formatter';
import {
  METADATA_FORMATTER
} from '../constants/metadata';


/** Interfaces */
export interface FormatterMetadata {
  accepts: string[];
  type:    string;
}

export interface FormatterOptions {
  accepts: string[];
  type:    string;
}

export interface FormatterAnnotation {
  (options: FormatterOptions): ClassAnnotation<Type<ResponseFormatter>>;
}


export const getFormatter = makeMetadataGetter<FormatterMetadata | undefined>(METADATA_FORMATTER, () => undefined);
export const setFormatter = makeMetadataSetter<FormatterMetadata>(METADATA_FORMATTER);


export const Formatter: FormatterAnnotation = makeClassAnnotation<Type<ResponseFormatter>>(
  'Formatter',
  TypeOfInjection.Service,
  (options: FormatterOptions) => (Target) => {
    const { accepts, type } = options;

    setFormatter({ accepts, type }, Target);
  }
);
