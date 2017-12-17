'use strict';
/** Imports */
import { BadRequest } from './http';


export class ValidationError extends BadRequest {
  constructor(/* errors: ValidationErrorItem[] = [] */) {
    super('Validation Error');
  }
}
