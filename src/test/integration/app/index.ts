
'use strict';
/** Imports */
import {
  Application,
  OctavoApplication,
  ApplicationConfig,
  Logger
} from '../../../';

import { SilentLogger } from './services/silent-logger.service';

import { BookModel } from './models/book.model';

import routes from './config/routes';


@Application({
  providers: [
    { use: SilentLogger, insteadOf: Logger },
    BookModel
  ]
})
export default class MainApplication implements OctavoApplication {
  async configure(config: ApplicationConfig) {
    await config.routes(routes);
  }
}
