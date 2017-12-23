'use strict';
/** Imports */
import * as _ from 'lodash';

import { Factory } from '../../../..';


const books: BookModel[] = [];


@Factory()
export class BookModel {
  public id?: number;
  public name?: string;
  public author?: string;
  public year?: number;

  constructor(values: {
    name:   string,
    author: string,
    year:   number
  }) {
    _.merge(this, values);
  }

  save(): Promise<this> {
    this.id = this.id || books.length;
    books[this.id] = this;

    return Promise.resolve(this);
  }

  toJSON() {
    return _.pick(this, [
      'id',
      'name',
      'author',
      'year'
    ]);
  }

  static findOne(id: number): Promise<BookModel | null> {
    return Promise.resolve(books[id] || null);
  }

  static findAll(): Promise<BookModel[]> {
    return Promise.resolve(books);
  }
}
