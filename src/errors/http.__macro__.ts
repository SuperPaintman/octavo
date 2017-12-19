'use strict';
/**
 * @macro
 * module.exports.httpStatuses = require('%http-statuses');
 */

/** Imports */
import { ExtendableError } from './extendable-error';


/** Types */
/** @unpack
{{#each httpStatuses as |statuses group|}}
export type HttpStatusCodes{{group}} =
{{#each statuses}}
  | {{this.status}}
{{/each}}
  ;
{{/each}}
export type HttpStatusCodes =
{{#each httpStatuses}}
  | HttpStatusCodes{{@key}}
{{/each}}
  ;
*/
/** @remove */
export type HttpStatusCodes = number;
/** /remove */

/** Core */
export abstract class HttpError extends ExtendableError {
  status: HttpStatusCodes;

  constructor(message: string, status: HttpStatusCodes) {
    if (status < 100 || status >= 600) {
      throw new RangeError('Status codes must be in range 1xx-5xx');
    }

    super(message);

    this.status = status;
  }

  get type(): string {
    return this.constructor.name;
  }
}


/** Classes */
export abstract class ClientError extends HttpError {
  constructor(message: string, status: /** @unpack HttpStatusCodes4xx *//** @remove */number/** /remove */) {
    if (status < 400 || status >= 500) {
      throw new RangeError('Status codes must be 4xx');
    }

    super(message, status);
  }
}

export abstract class ServerError extends HttpError {
  constructor(message: string, status: /** @unpack HttpStatusCodes5xx *//** @remove */number/** /remove */) {
    if (status < 500 || status >= 600) {
      throw new RangeError('Status codes must be 5xx');
    }

    super(message, status);
  }
}


/** Standart */
/** 4xx */
/** @unpack {{#each httpStatuses.4xx}} */
/**
 * {{status}} HTTP status - {{message}}
 *
 * @see https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#{{status}}
 */
export class /** @unpack {{pascalCase message}} *//** @remove */NamedClientError/** /remove */ extends ClientError {
  /**
   * @param {string} [message='{{message}}']
   */
  constructor(message: string = '{{message}}') {
    super(message, /** @unpack {{status}} *//** @remove */400/** /remove */);
  }
}

/** @unpack {{/each}} */

/** 5xx */
/** @unpack {{#each httpStatuses.5xx}} */
/**
 * {{status}} HTTP status - {{message}}
 *
 * @see https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#{{status}}
 */
export class /** @unpack {{pascalCase message}} *//** @remove */NamedServerError/** /remove */ extends ServerError {
  /**
   * @param {string} [message='{{message}}']
   */
  constructor(message: string = '{{message}}') {
    super(message, /** @unpack {{status}} *//** @remove */500/** /remove */);
  }
}

/** @unpack {{/each}} */
