'use strict';
/** Imports */
import { ResponseFormatter } from '.';
import { Formatter } from '../annotations/formatter';


@Formatter({
  accepts: ['application/json'],
  type: 'application/json'
})
export class JSONFormatter implements ResponseFormatter {
  format(data: any) {
    return JSON.stringify(data);
  }
}
