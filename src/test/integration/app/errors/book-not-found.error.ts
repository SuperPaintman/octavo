'use strict';
/** Imports */
import { NotFound } from '../../../..';

export class BookIsNotFound extends NotFound {
  constructor(message = 'Book Is Not Found') {
    super(message);
  }
}
