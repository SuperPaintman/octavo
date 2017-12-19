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
  ViewEngineRender
} from '../view-engine';
import {
  METADATA_VIEW_ENGINE
} from '../constants/metadata';


/** Interfaces */
export interface ViewEngineMetadata {
  ext: string;
}

export interface ViewEngineOptions {
  ext: string;
}

export interface ViewEngineAnnotation {
  (options: ViewEngineOptions): ClassAnnotation<Type<ViewEngineRender>>;
}


export const getViewEngine = makeMetadataGetter<ViewEngineMetadata | undefined>(METADATA_VIEW_ENGINE, () => undefined);
export const setViewEngine = makeMetadataSetter<ViewEngineMetadata>(METADATA_VIEW_ENGINE);


export const ViewEngine: ViewEngineAnnotation = makeClassAnnotation<Type<ViewEngineRender>>(
  'ViewEngine',
  TypeOfInjection.Service,
  (options: ViewEngineOptions) => (Target) => {
    const { ext } = options;

    setViewEngine({ ext }, Target);
  }
);
