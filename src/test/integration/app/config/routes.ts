'use strict';
import {
  Scope,
  scope,
  get,
  post,
  resource
} from '../../../../';

import { PingController } from '../controllers/ping.controller';
import { EchoController } from '../controllers/echo.controller';
import { PlainTextController } from '../controllers/plain-text.controller';
import { BrokenController } from '../controllers/broken.controller';
import { FullpackResourceController } from '../controllers/fullpack-resource.controller';
import { BooksController } from '../controllers/books.controller';

import { ApiV1Transformer } from '../transformers/api-v1.transformer';

export default scope('/', () => {
  scope('/pure', () => {
    get('/ping', PingController, 'index');

    get('/plain-text', PlainTextController, 'index');

    post('/echo', EchoController, 'echo');

    resource('/fullpack', FullpackResourceController);

    resource('/books', BooksController);

    get('/broken', BrokenController, 'brokenMethod');
  });

  scope('/transformer', {
    transformer: ApiV1Transformer
  }, () => {
    get('/ping', PingController, 'index');

    post('/echo', EchoController, 'echo');

    get('/broken', BrokenController, 'brokenMethod');
  });
});
