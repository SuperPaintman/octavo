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

import { TestHeaderMiddleware } from '../middlewares/test-header.middleware';
import { AfterResponseMiddleware } from '../middlewares/after-response.middleware';

import { ApiV1Transformer } from '../transformers/api-v1.transformer';

import { MySuperTurboJsonFormatter } from '../formatters/json.formatter';
import { YamlFormatter } from '../formatters/yaml.formatter';


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

  scope('/formatter', {
    formatters: [
      YamlFormatter
    ]
  }, () => {
    get('/ping', PingController, 'index');

    post('/echo', EchoController, 'echo');

    get('/broken', BrokenController, 'brokenMethod');
  });

  scope('/overridden-json-formatter', {
    formatters: [
      MySuperTurboJsonFormatter
    ]
  }, () => {
    get('/ping', PingController, 'index');
  });

  scope('/middleware', {
    middlewares: [
      TestHeaderMiddleware
    ]
  }, () => {
    get('/ping', PingController, 'index');

    post('/echo', EchoController, 'echo');

    get('/broken', BrokenController, 'brokenMethod');
  });

  scope('/middleware-after-response', {
    middlewares: [
      AfterResponseMiddleware
    ]
  }, () => {
    get('/ping', PingController, 'index');

    post('/echo', EchoController, 'echo');

    get('/broken', BrokenController, 'brokenMethod');
  });
});
