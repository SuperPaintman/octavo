
'use strict';
/** Imports */
import { Controller } from '../../../../';


@Controller()
export class PingController {
  async index() {
    return { ping: 'pong' };
  }
}
