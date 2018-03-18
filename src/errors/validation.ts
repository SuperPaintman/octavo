'use strict';
/** Imports */
import * as _ from 'lodash';

import { BadRequest } from './http';
import { SchemaValidationError, SchemaValidationErrorItem } from './schema';


/** Interfaces */
export enum ValidationErrorLocation {
  BODY    = 'body',
  PARAMS  = 'params',
  HEADERS = 'headers',
  QUERY   = 'query'
}

export class ValidationErrorItem {
  constructor(
    public readonly target:      SchemaValidationErrorItem['target'],
    public readonly value:       SchemaValidationErrorItem['value'],
    public readonly path:        SchemaValidationErrorItem['path'],
    public readonly constraints: SchemaValidationErrorItem['constraints'],
    public readonly location:    ValidationErrorLocation
  ) { }

  get message(): string {
    return `"${this.path}" ${_.toArray(this.constraints).join(', ')}`;
  }

  toJSON() {
    return {
      location: this.location,
      target: this.target,
      value: this.value,
      path: this.path,
      message: this.message,
      constraints: this.constraints
    };
  }
}

export class ValidationError extends BadRequest {
  constructor(
    public readonly errors: ValidationErrorItem[]
  ) {
    super('Validation Error');
  }

  static fromSchemaValidationErrors(
    bodyErr:    SchemaValidationError | null,
    paramsErr:  SchemaValidationError | null,
    headersErr: SchemaValidationError | null,
    queryErr:   SchemaValidationError | null
  ): ValidationError {
    const length = (bodyErr    !== null ? bodyErr.errors.length    : 0)
                 + (paramsErr  !== null ? paramsErr.errors.length  : 0)
                 + (headersErr !== null ? headersErr.errors.length : 0)
                 + (queryErr   !== null ? queryErr.errors.length   : 0);


    const errors: ValidationErrorItem[] = new Array(length);

    let i = 0;
    _.forEach<[SchemaValidationError | null, ValidationErrorLocation]>([
      [bodyErr,    ValidationErrorLocation.BODY],
      [paramsErr,  ValidationErrorLocation.PARAMS],
      [queryErr,   ValidationErrorLocation.QUERY],
      [headersErr, ValidationErrorLocation.HEADERS]
    ], ([err, location]) => {
      if (err === null) {
        return;
      }

      for (let j = 0, jj = err.errors.length; j < jj; j++, i++) {
        errors[i] = this._transformErr(err.errors[j], location);
      }
    });

    return new ValidationError(errors);
  }

  private static _transformErr(
    err: SchemaValidationErrorItem,
    location: ValidationErrorLocation
  ): ValidationErrorItem {
    return new ValidationErrorItem(
      err.target,
      err.value,
      err.path,
      err.constraints,
      location
    );
  }
}
