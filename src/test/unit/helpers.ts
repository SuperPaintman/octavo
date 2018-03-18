'use strict';
/** Imports */
import * as chai from 'chai';

import {
  SchemaValidationError,
  SchemaValidationErrorItem,
  SchemaValidationErrorItemConstraintType
} from '../../errors/schema';

export * from '../helpers';

/** Interfaces */
export interface ShortErrorsTuple extends Array<any> {
  // value
  0: any;

  // path
  1: string;

  // constraints
  2: {
    [type in SchemaValidationErrorItemConstraintType]?: string;
  };

  // length: 3;
}

declare global {
  namespace Chai {
    interface Assertion {
      validationError(
        target: any,
        errors: ShortErrorsTuple[]
      ): Assertion;
    }
  }
}


/** Chai */
chai.use(function superagent({ assert, Assertion }, utils) {
  Assertion.addMethod('validationError', <Chai.Assertion['validationError']>function validationError(this: any, target, errors) {
    const err = this._obj;

    assert.instanceOf(err, SchemaValidationError);
    assert.equal(err.message, 'Validation error');
    assert.deepStrictEqual(err.errors, errors.map((it) => (
      new SchemaValidationErrorItem(target, it[0], it[1], it[2])
    )));
  });
});
