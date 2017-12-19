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
export interface FormatterOptions {
  accepts: string[];
  type:    string;
}

export interface FormatterAnnotation {
  (options: FormatterOptions): ClassAnnotation<Type<ResponseFormatter>>;
}


export const getFormatter = makeMetadataGetter<FormatterOptions | undefined>(METADATA_FORMATTER, () => undefined);
export const setFormatter = makeMetadataSetter<FormatterOptions>(METADATA_FORMATTER);


export const Formatter: FormatterAnnotation = makeClassAnnotation<Type<ResponseFormatter>>(
  'Formatter',
  TypeOfInjection.Service,
  (options: FormatterOptions) => (Target) => {
    const { accepts, type } = options;

    setFormatter({ accepts, type }, Target);
  }
);
