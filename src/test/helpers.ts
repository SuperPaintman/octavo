'use strict';
/** Imports */
import 'source-map-support/register';

process.env.NODE_ENV = 'test';

import { inspect } from 'util';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

const { color } = require('mocha/lib/reporters/base');


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



chai.use(chaiAsPromised);

export const { expect } = chai;


