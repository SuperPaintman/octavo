'use strict';
/**
 * @macro
 * module.exports.httpMethods = require('%http-methods');
 */

/** Imports */
import { createMethod, HttpMethod } from '.';


/** @unpack
{{#each httpMethods}}
export const {{this.name}} = createMethod('{{this.method}}');
{{/each}}
*/
