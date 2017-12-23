
'use strict';
/** Imports */
import { Controller } from '../../../../';


@Controller()
export class BrokenController {
  async brokenMethod() {
    throw new Error('Why not throw an error? :)');
  }
}
