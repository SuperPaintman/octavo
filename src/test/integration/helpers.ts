'use strict';
/** Imports */
import { join } from 'path';

import * as request from 'supertest-as-promised';
import * as _ from 'lodash';

import { Kernel } from '../../kernel';

export * from '../helpers';


/** Interfaces */
export type Agent = request.SuperTest<request.Test>;


/** Constants */
const APP_PATH = join(__dirname, './app');


/** Helpers */
export const isAppPath = (parh: string) => parh.startsWith(APP_PATH);

export async function makeAgent() {
  const TestApplication = require('./app').default;

  const app = new Kernel(TestApplication);

  await app.configure();
  await app.boot();

  return request.agent(app.server);
}


/** Hooks */
// Clean up the test application's cached modules
beforeEach(() => {
  const paths = _.keys(require.cache)
    .filter(isAppPath);

  _.forEach(paths, (path) => {
    delete require.cache[path];
  });
});
