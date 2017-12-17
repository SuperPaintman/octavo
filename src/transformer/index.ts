'use strict';
/** Imports */
import { HttpError } from '../errors/http';


export interface SuccessTransform {
  success(data: any): any;
}

export interface ErrorTransform {
  error(err: HttpError): any;
}

export interface Transform extends SuccessTransform, ErrorTransform { }

export type AnyTransform =
  | SuccessTransform
  | ErrorTransform
  | Transform
  ;
