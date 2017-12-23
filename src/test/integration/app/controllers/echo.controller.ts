
'use strict';
/** Imports */
import { Controller, Body } from '../../../../';


@Controller()
export class EchoController {
  async echo(
    @Body() body: any
  ) {
    return body;
  }
}
