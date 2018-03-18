'use strict';
/** Imports */
import * as _ from 'lodash';

import { ExtendableError } from './extendable-error';


export enum SchemaValidationErrorItemConstraintType {
  TYPE = 'type',
  REQUIRED = 'required',
  OTHER = 'other'
}

export class SchemaValidationErrorItem {
  constructor(
    public readonly target: object,
    public readonly value: any,
    public readonly path: string,
    public readonly constraints: {
      [type in SchemaValidationErrorItemConstraintType]?: string;
    } = { }
  ) { }

  // get message(): string {
  //   return `"${this.path}" ${_.toArray(this.constraints).join(', ')}`;
  // }

  toJSON() {
    return {
      target: this.target,
      value: this.value,
      path: this.path,
      // message: this.message,
      constraints: this.constraints
    };
  }
}

export class SchemaValidationError extends ExtendableError {
  constructor(
    public readonly errors: SchemaValidationErrorItem[] = []
  ) {
    super('Validation error');
  }
}
