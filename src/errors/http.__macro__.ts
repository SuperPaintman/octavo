'use strict';
/**
 * @macro
 * module.exports.httpStatuses = {
 *   '1xx': [
 *     { status: 100, message: 'Continue' },
 *     { status: 101, message: 'Switching Protocols' },
 *     { status: 102, message: 'Processing' }
 *   ],
 *   '2xx': [
 *     { status: 200, message: 'OK' },
 *     { status: 201, message: 'Created' },
 *     { status: 202, message: 'Accepted' },
 *     { status: 203, message: 'Non-Authoritative Information' },
 *     { status: 204, message: 'No Content' },
 *     { status: 205, message: 'Reset Content' },
 *     { status: 206, message: 'Partial Content' },
 *     { status: 207, message: 'Multi-Status' },
 *     { status: 226, message: 'IM Used' }
 *   ],
 *   '3xx': [
 *     { status: 300, message: 'Multiple Choices' },
 *     { status: 301, message: 'Moved Permanently' },
 *     { status: 302, message: 'Found' },
 *     { status: 303, message: 'See Other' },
 *     { status: 304, message: 'Not Modified' },
 *     { status: 305, message: 'Use Proxy' },
 *     { status: 307, message: 'Temporary Redirect' }
 *   ],
 *   '4xx': [
 *     { status: 400, message: 'Bad Request' },
 *     { status: 401, message: 'Unauthorized' },
 *     { status: 402, message: 'Payment Required' },
 *     { status: 403, message: 'Forbidden' },
 *     { status: 404, message: 'Not Found' },
 *     { status: 405, message: 'Method Not Allowed' },
 *     { status: 406, message: 'Not Acceptable' },
 *     { status: 407, message: 'Proxy Authentication Required' },
 *     { status: 408, message: 'Request Timeout' },
 *     { status: 409, message: 'Conflict' },
 *     { status: 410, message: 'Gone' },
 *     { status: 411, message: 'Length Required' },
 *     { status: 412, message: 'Precondition Failed' },
 *     { status: 413, message: 'Request Entity Too Large' },
 *     { status: 414, message: 'Request-URI Too Large' },
 *     { status: 415, message: 'Unsupported Media Type' },
 *     { status: 416, message: 'Requested Range Not Satisfiable' },
 *     { status: 417, message: 'Expectation Failed' },
 *     { status: 422, message: 'Unprocessable Entity' },
 *     { status: 423, message: 'Locked' },
 *     { status: 424, message: 'Failed Dependency' },
 *     { status: 425, message: 'Unordered Collection' },
 *     { status: 426, message: 'Upgrade Required' },
 *     { status: 428, message: 'Precondition Required' },
 *     { status: 429, message: 'Too Many Requests' },
 *     { status: 431, message: 'Request Header Fields Too Large' },
 *     { status: 449, message: 'Retry With' },
 *     { status: 451, message: 'Unavailable For Legal Reasons' }
 *   ],
 *   '5xx': [
 *     { status: 500, message: 'Internal Server Error' },
 *     { status: 501, message: 'Not Implemented' },
 *     { status: 502, message: 'Bad Gateway' },
 *     { status: 503, message: 'Service Unavailable' },
 *     { status: 504, message: 'Gateway Timeout' },
 *     { status: 505, message: 'HTTP Version Not Supported' },
 *     { status: 506, message: 'Variant Also Negotiates' },
 *     { status: 507, message: 'Insufficient Storage' },
 *     { status: 508, message: 'Loop Detected' },
 *     { status: 509, message: 'Bandwidth Limit Exceeded' },
 *     { status: 510, message: 'Not Extended' },
 *     { status: 511, message: 'Network Authentication Required' }
 *   ]
 * };
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
