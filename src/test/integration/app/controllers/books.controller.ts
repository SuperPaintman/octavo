
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
export class BooksController implements ResourceController {
  constructor(
    @Inject(BookModel) private Book: typeof BookModel
  ) { }

  @Response({
    body: o([
      o({
        id:     number(),
        author: string(),
        name:   string()
      })
    ])
  })
  async index() {
    return (await this.Book.findAll()).map((it) => it.toJSON());
  }

  @Request({
    params: o({
      id: number()
    })
  })
  async show(
    @Params('id') id: number
  ) {
    const book = await this.Book.findOne(id);

    if (book === null) {
      throw new BookIsNotFound();
    }

    return book.toJSON();
  }

  @Request({
    body: o({
      author: string(),
      name:   string(),
      year:   number()
    })
  })
  async create(
    @Body() body: any
  ) {
    const book = new this.Book(body);

    await book.save();

    return book.toJSON();
  }
}
