'use strict';

/**
 * @todo(SuperPaintman):
 *    Perhaps it is better to make `success` and `error` formatters separately,
 *    like:
 *
 *    ```ts
 *    export interface ResponseFormatter {
 *      success(data: any): string;
 *      error(err: any): string;
 *    }
 *    ```
 *
 */

export interface ResponseFormatter {
  format(data: any): string;
}

