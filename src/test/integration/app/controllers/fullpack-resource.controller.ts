
'use strict';
/** Imports */
import {
  Controller,
  ResourceController,
  Inject,
  Body,
  Params,
  Request,
  Response,
  o,
  string,
  number
} from '../../../../';

import { BookModel } from '../models/book.model';

import { BookIsNotFound } from '../errors/book-not-found.error';


@Controller()
export class FullpackResourceController implements ResourceController {
  async index() {
    return 'List of resource';
  }

  async new() {
    return 'Form for new resouce instance';
  }

  async show() {
    return 'Show single respurce';
  }

  async create() {
    return 'Create new respurce';
  }

  async edit() {
    return 'Form for editing respurce';
  }

  async update() {
    return 'Update respurce';
  }

  async destroy() {
    return 'Destroy respurce';
  }
}
