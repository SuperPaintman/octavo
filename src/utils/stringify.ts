'use strict';
/** Imports */
import * as _ from 'lodash';


export function stringify(token: any): string {
  if (typeof token === 'string') {
    return token;
  }

  if (token instanceof Array) {
    return `[${token.map(stringify).join(', ')}]`;
  }

  if (token === null || token === undefined) {
    return '' + token;
  }

  if (_.isFunction(token)) {
    return '' + token.name;
  }

  return '' + token;
}
