'use strict';
/** Imports */
import { Formatter, ResponseFormatter } from '../../../..';

import * as yaml from 'js-yaml';


@Formatter({
  accepts: ['application/x-yaml'],
  type: 'application/x-yaml'
})
export class YamlFormatter implements ResponseFormatter {
  format(data: any) {
    return yaml.dump(data);
  }
}
