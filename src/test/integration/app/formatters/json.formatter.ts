'use strict';
/** Imports */
import { Formatter, ResponseFormatter } from '../../../..';


@Formatter({
  accepts: ['application/json'],
  type: 'application/json'
})
export class MySuperTurboJsonFormatter implements ResponseFormatter {
  format(data: any) {
    return JSON.stringify(data, null, '\t\t\t\t');
  }
}
