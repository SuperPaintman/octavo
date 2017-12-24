'use strict';
/** Imports */
import 'source-map-support/register';

process.env.NODE_ENV = 'test';

import { inspect } from 'util';

import * as _ from 'lodash';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { Response } from 'supertest-as-promised';
import * as superagent from 'superagent';
import * as mime from 'mime-types';

const { Response: SuperagentResponse } = require('superagent');
const { color } = require('mocha/lib/reporters/base');



/** Interfaces */
declare global {
  namespace Chai {
    interface Assertion {
      status(value: number): Assertion;
      contentType(value: string): Assertion;
      body(value: any): Assertion;
      header(name: string, value: string): Assertion;
    }
  }
}

/** Init */
let haveUnhandledRejection = false;
process.on('unhandledRejection', (err, p) => {
  haveUnhandledRejection = true;

  console.error(color('fail', 'Unhandled Rejection: ' + inspect(err)));

  throw err;
});

process.on('exit', (code) => {
  if (code === 0 && haveUnhandledRejection) {
    process.exit(1);
  }
});


/** Chai */
chai.use(chaiAsPromised);

chai.use(function superagent({ assert, Assertion }, utils) {
  const assertIsResponse = (response: any) => {
    assert.instanceOf(response, SuperagentResponse);
  };

  Assertion.addMethod('status', <Chai.Assertion['status']>function status(this: any, expectedStatusCode) {
    const response: Response = this._obj;
    assertIsResponse(response);

    const statusCode = response.status;

    this.assert(
      statusCode === expectedStatusCode,
      'expected Response to have status code #{exp} but got #{act}',
      'expected Response to not have status code #{act}',
      expectedStatusCode,
      statusCode
    );
  });

  Assertion.addMethod('contentType', <Chai.Assertion['contentType']>function status(this: any, expectedContentType) {
    const response: Response = this._obj;
    assertIsResponse(response);

    const contentType = response.header['content-type'];

    this.assert(
      contentType === mime.contentType(expectedContentType),
      'expected Response to have content type #{exp} but got #{act}',
      'expected Response to not have content type #{act}',
      expectedContentType,
      contentType
    );
  });

  Assertion.addMethod('body', <Chai.Assertion['body']>function status(this: any, expectedBody) {
    const response: Response = this._obj;
    assertIsResponse(response);

    if (_.isObject(expectedBody)) {
      assert.deepEqual(response.body, expectedBody);
    } else {
      assert.equal(response.text, expectedBody);
    }
  });

  Assertion.addMethod('header', <Chai.Assertion['header']>function status(this: any, expectedName, expectedValue) {
    const response: Response = this._obj;
    assertIsResponse(response);

    const headerName = expectedName.toLowerCase();

    assert.property(response.header, headerName);

    const header = response.header[headerName];

    this.assert(
      header === expectedValue,
      `expected Response to have '${expectedName}' header with value #{exp} but got #{act}`,
      `expected Response to not '${expectedName}' header with value #{act}`,
      expectedValue,
      header
    );
  });

});


export const { expect } = chai;


