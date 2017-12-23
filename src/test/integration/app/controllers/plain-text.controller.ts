
'use strict';
/** Imports */
import { Controller } from '../../../../';


@Controller()
export class PlainTextController {
  async index() {
    return 'It is a plane text';
  }
}
