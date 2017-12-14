'use strict';
/** Imports */
import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyParser from 'koa-bodyparser';
import * as session from 'koa-session';
import * as _ from 'lodash';

import { Injector } from '../di/injector';
import { Logger } from '../services/logger';
import { Type } from '../utils/type';
import {
  OctavoApplication,
  ApplicationConfig
} from '../application';
import {
  Scope,
  Handler
} from '../router/scope';
import {
  getProviders
} from '../annotations/application';
import {
  HttpError,
  InternalServerError,
  NotFound
} from '../errors/http';
import * as HTTP_ERRORS from '../errors/http';


export class Kernel {
  private _app: OctavoApplication;
  private _koa = new Koa();
  private _defaultInjector = new Injector([
    Logger
  ]);
  private _injector: Injector;
  private _logger: Logger;

  // Config
  private _port = 3000;
  private _showPoweredBy = true;
  private _router?: Router;

  constructor(
    Application: Type<OctavoApplication>
  ) {
    const providers = getProviders(Application);

    // Init injector
    this._injector = new Injector(providers, this._defaultInjector);

    // Init logger
    this._logger = this._injector.get(Logger).scope('Kernel');

    // Init app
    this._app = this._injector.load(Application).get(Application);
  }

  async configure(): Promise<void> {
    this._logger.debug('Application is configuring');

    if (this._app.configure !== undefined) {
      await this._app.configure(this._makeConfigurator());
    }

    this._koa.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        const error: HttpError = err instanceof HttpError
                               ? err
                               : new InternalServerError();

        ctx.status = error.status;
        ctx.body = error.message;
      }
    });

    /**
     * @todo(SuperPaintman):
     *    Make the body parser optional, only when it is really necessary.
     *    For example, when `@Request({ body: o({}) })` is used.
     */
    this._koa.use(bodyParser());

    this._koa.use(session({
      key: 'octavo:sess'
    }, this._koa));


    if (this._showPoweredBy) {
      this._koa.use(async (ctx, next) => {
        ctx.set('X-Powered-By', 'Octavo');

        await next();
      });
    }

    /**
     * Status fixer. It's necessary, because without it status stays
     * `404`, `405` or `501`, before the error handler intercepts it.
     */
    this._koa.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        ctx.status = err instanceof HttpError
                   ? err.status
                   : 500;

        throw err;
      }
    });

    /**
     * Error Converter
     */
    this._koa.use(async (ctx, next) => {
      await next();

      if (ctx.status < 400) {
        return; // It's ok
      }

      /**
       * @todo(SuperPaintman):
       *    Maybe add using `ctx.message` instead of default error messages.
       */

      switch (ctx.status) {
        // 4xx
        case 400: throw new HTTP_ERRORS.BadRequest();
        case 401: throw new HTTP_ERRORS.Unauthorized();
        case 402: throw new HTTP_ERRORS.PaymentRequired();
        case 403: throw new HTTP_ERRORS.Forbidden();
        case 404: throw new HTTP_ERRORS.NotFound();
        case 405: throw new HTTP_ERRORS.MethodNotAllowed();
        case 406: throw new HTTP_ERRORS.NotAcceptable();
        case 407: throw new HTTP_ERRORS.ProxyAuthenticationRequired();
        case 408: throw new HTTP_ERRORS.RequestTimeout();
        case 409: throw new HTTP_ERRORS.Conflict();
        case 410: throw new HTTP_ERRORS.Gone();
        case 411: throw new HTTP_ERRORS.LengthRequired();
        case 412: throw new HTTP_ERRORS.PreconditionFailed();
        case 413: throw new HTTP_ERRORS.RequestEntityTooLarge();
        case 414: throw new HTTP_ERRORS.RequestUriTooLarge();
        case 415: throw new HTTP_ERRORS.UnsupportedMediaType();
        case 416: throw new HTTP_ERRORS.RequestedRangeNotSatisfiable();
        case 417: throw new HTTP_ERRORS.ExpectationFailed();
        case 422: throw new HTTP_ERRORS.UnprocessableEntity();
        case 423: throw new HTTP_ERRORS.Locked();
        case 424: throw new HTTP_ERRORS.FailedDependency();
        case 425: throw new HTTP_ERRORS.UnorderedCollection();
        case 426: throw new HTTP_ERRORS.UpgradeRequired();
        case 428: throw new HTTP_ERRORS.PreconditionRequired();
        case 429: throw new HTTP_ERRORS.TooManyRequests();
        case 431: throw new HTTP_ERRORS.RequestHeaderFieldsTooLarge();
        case 449: throw new HTTP_ERRORS.RetryWith();
        case 451: throw new HTTP_ERRORS.UnavailableForLegalReasons();

        // 5xx
        case 500: throw new HTTP_ERRORS.InternalServerError();
        case 501: throw new HTTP_ERRORS.NotImplemented();
        case 502: throw new HTTP_ERRORS.BadGateway();
        case 503: throw new HTTP_ERRORS.ServiceUnavailable();
        case 504: throw new HTTP_ERRORS.GatewayTimeout();
        case 505: throw new HTTP_ERRORS.HttpVersionNotSupported();
        case 506: throw new HTTP_ERRORS.VariantAlsoNegotiates();
        case 507: throw new HTTP_ERRORS.InsufficientStorage();
        case 508: throw new HTTP_ERRORS.LoopDetected();
        case 509: throw new HTTP_ERRORS.BandwidthLimitExceeded();
        case 510: throw new HTTP_ERRORS.NotExtended();
        case 511: throw new HTTP_ERRORS.NetworkAuthenticationRequired();

        // Default
        default: throw new Error(`Unexpected status: ${ctx.status}`);
      }
    });

    if (this._router !== undefined) {
      this._koa
        .use(this._router.routes())
        .use(this._router.allowedMethods())
        ;
    }

    this._logger.debug('Application has been configured');
  }

  async boot(): Promise<void> {
    this._logger.debug('Application is booting');

    if (this._app.boot !== undefined) {
      await this._app.boot();
    }

    this._logger.debug('Application has been booted');
  }

  async start(): Promise<void> {
    const port = this._port;

    this._logger.debug('Application is starting');

    await new Promise((resolve, reject) => {
      this._koa.listen(port, resolve);
    });

    this._logger.debug('Application has been started');

    this._logger.info(`Application is listening on port ${port}`);
  }

  private _makeConfigurator(): ApplicationConfig {
    const kernel = this;

    // "Why closure?". Because kernel is super-secret at the moment :)
    return {
      routes(obj: Scope): Promise<void> {
        kernel._initRouter(obj);

        return Promise.resolve();
      },

      poweredBy(show: boolean) {
        kernel._showPoweredBy = show;
      },

      port(num: number) {
        kernel._port = num;
      }
    };
  }

  private _initRouter(scope: Scope) {
    this._router = this._scopeToRouter(scope);
  }

  private _scopeToRouter(scope: Scope): Router {
    const { path, stack, handler } = scope;

    const router = new Router();

    if (handler !== undefined) {
      this._addHandler(router, path, handler);
    }

    if (stack.length === 0) {
      return router;
    }

    _.forEach(stack, (childScope) => {
      const childRouter = this._scopeToRouter(childScope);

      router
        .use(path, childRouter.routes())
        .use(path, childRouter.allowedMethods())
        ;
    });

    return router;
  }

  private _addHandler<T>(
    router:  Router,
    path:    string,
    handler: Handler<T>
  ) {
    const { method, status, Controller, key } = handler;

    /**
     * @todo(SuperPaintman):
     *    Replace multi-loading with one-time loading, because now
     *    it loads multi-time.
     */
    const controller = this._injector.load(Controller).get(Controller);


    router.register(path, [method], async (ctx, next) => {
      const data = await controller[key]();

      ctx.body = data;
    });
  }
}
