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
import { tolerantPromise } from '../utils/tolerant-promise';
import {
  OctavoApplication,
  ApplicationConfig
} from '../application';
import {
  Scope,
  Handler
} from '../router/scope';
import {
  ControllerContext,
  MiddlewareContext,
  PolicyContext,
  StateContext
} from '../context';
import {
  Schema
} from '../schema';
import {
  getProviders
} from '../annotations/application';
import {
  ContextualInjection,
  TypeOfContextualInjection,
  getContextualInjections
} from '../annotations/contextual';
import {
  getRequest
} from '../annotations/request';
import {
  getResponse
} from '../annotations/response';
import {
  FormatterOptions,
  getFormatter
} from '../annotations/formatter';
import { MiddlewareExec } from '../middleware';
import { PolicyExec } from '../policy';
import { ResponseFormatter } from '../formatter';
import { Transform, AnyTransform } from '../transformer';
import { ResolveState } from '../state';
import {
  ErrorInterceptorHandler
} from '../error-interceptor';
import {
  HttpError,
  InternalServerError,
  NotFound
} from '../errors/http';
import {
  ValidationError
} from '../errors/validation';
import * as HTTP_ERRORS from '../errors/http';


/** Interfaces */
export interface ContextFormatter {
  formatter: ResponseFormatter;
  accepts:   string[];
  type:      string;
}

export interface KoaOctavo {
  resolvedStates:    Map<Type<ResolveState<any>>, any>;
  formatters:        ContextFormatter[];
  transformer:       AnyTransform | null;
  errorInterceptors: ErrorInterceptorHandler[];
}

declare module 'koa' {
  interface Context {
    $octavo: KoaOctavo;
  }
}


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
      this._extendKoaContext(ctx);
      await next();
    });

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
     * Formatter
     */
    this._koa.use(async (ctx, next) => {
      await next();

      const { formatters } = ctx.$octavo;

      // Backwards, because formatters are add by append
      for (let i = formatters.length - 1; i >= 0; i--) {
        const { formatter, accepts, type } = formatters[i];

        if (!ctx.accepts(accepts)) {
          continue;
        }

        ctx.type = type;
        ctx.body = formatter.format(ctx.body);
        return;
      }

      /**
       * @todo(SuperPaintman):
       *    Add support for `Not Acceptable` error, if the formatter isn't
       *    found.
       */
      // throw new NotAcceptable();
    });

    /**
     * Transformer
     */
    this._koa.use(async (ctx, next) => {
      try {
        await next();

        if (ctx.$octavo.transformer === null) {
          return;
        }

        if ((ctx.$octavo.transformer as Transform).success === undefined) {
          return;
        }

        ctx.body = (ctx.$octavo.transformer as Transform).success(ctx.body);
      } catch (err) {
        if (ctx.$octavo.transformer === null) {
          ctx.body = err.message; // throw err;
          return;
        }

        if ((ctx.$octavo.transformer as Transform).error === undefined) {
          ctx.body = err.message; // throw err;
          return;
        }

        ctx.body = (ctx.$octavo.transformer as Transform).error(err);
      }
    });

    /**
     * Final error interceptor, because user's intercepter can throws an JS
     * error.
     *
     * Also it sets status.
     */
    this._koa.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        if (err instanceof HttpError) {
          ctx.status = err.status;
          throw err;
        }

        ctx.status = 500;
        throw new InternalServerError();
      }
    });

    /**
     * ErrorInterceptor
     */
    this._koa.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        if (err instanceof HttpError) {
          throw err;
        }

        const { errorInterceptors } = ctx.$octavo;

        // Backwards, because interceptors are add by `.push()`
        for (let i = errorInterceptors.length - 1; i >= 0; i--) {
          const errorInterceptor = errorInterceptors[i];


          const isIt = errorInterceptor.check !== undefined
                    && errorInterceptor.check(err)
                    || true

          if (!isIt) {
            continue;
          }

          if (errorInterceptor.report !== undefined) {
            await errorInterceptor.report(err);
          }

          await errorInterceptor.handle(err);
          return;
        }

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

  private _extendKoaContext(context: Koa.Context): void {
    const value: KoaOctavo = {
      resolvedStates:    new Map(),
      formatters:        [],
      transformer:       null,
      errorInterceptors: []
    };

    Object.defineProperties(context, {
      $octavo: {
        value
      }
    });
  }

  private _initRouter(scope: Scope) {
    this._router = this._scopeToRouter(scope);
  }

  private _scopeToRouter(scope: Scope): Router {
    const { path, stack, handler, middlewares, policies, formatters, Transformer, errorInterceptors } = scope;

    const router = new Router();

    if (errorInterceptors.length > 0) {
      this._addErrorInterceptors(router, path, errorInterceptors);
    }

    if (formatters.length > 0) {
      this._addFormatters(router, path, formatters);
    }

    if (Transformer !== undefined) {
      this._addTransformer(router, path, Transformer);
    }

    if (middlewares.length > 0) {
      _.forEach(middlewares, (Middleware) => {
        this._addMiddleware(router, path, Middleware);
      });
    }

    if (policies.length > 0) {
      _.forEach(policies, (policy) => {
        this._addPolicy(router, path, policy);
      });
    }

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
    const ctxInjections = getContextualInjections(Controller, key);
    const {
      body:    reqBodySchema,
      params:  reqParamsSchema,
      headers: reqHeadersSchema,
      query:   reqQuerySchema
    } = getRequest(Controller, key);
    const {
      body:    resBodySchema,
      headers: resHeadersSchema
    } = getResponse(Controller, key);


    router.register(path, [method], async (ctx, next) => {
      const {
        body,
        headers,
        params
      } = await this._validateRequest(
        ctx,
        reqBodySchema,
        reqParamsSchema,
        reqHeadersSchema,
        reqQuerySchema
      );

      const args = await this._resolveControllerContextualInjections(
        ctxInjections,
        ctx,
        body,
        headers,
        params
      );

      const data = await controller[key](...args);

      ctx.body = await this._validateResponseBody(data, resBodySchema);
    });
  }

  private _addMiddleware<T extends MiddlewareExec>(
    router:     Router,
    path:       string,
    Middleware: Type<T>
  ) {
    const middleware = this._injector.load(Middleware).get(Middleware);
    const ctxInjections = getContextualInjections(Middleware, 'exec');

    const hasNext = _.includes(
      ctxInjections.map((it) => it.type),
      TypeOfContextualInjection.Next
    );


    router.use(path, async (ctx, next) => {
      const args = await this._resolveMiddlewareContextualInjections(
        ctxInjections,
        ctx,
        () => Promise.resolve(next()) // next
      );

      await middleware.exec(...args);

      if (!hasNext) {
        await next();
      }
    });
  }

  private _addPolicy<T extends PolicyExec>(
    router: Router,
    path:   string,
    Policy: Type<T>
  ) {
    const policy = this._injector.load(Policy).get(Policy);
    const ctxInjections = getContextualInjections(Policy, 'exec');


    router.use(path, async (ctx, next) => {
      const args = await this._resolvePolicyContextualInjections(
        ctxInjections,
        ctx
      );

      await policy.exec(...args);

      await next();
    });
  }

  private _resolveControllerContextualInjections(
    injections: ContextualInjection[],
    ctx:        Koa.Context,
    body:       any,
    headers:    any,
    params:     any
  ): Promise<any[]> {
    return Promise.all(_.map(injections, ({ type, args }) => {
      switch (type) {
        // @Body()
        case TypeOfContextualInjection.Body:
          return this._resolveRequestBody(body, args[0]);

        // @Headers()
        case TypeOfContextualInjection.Headers:
          return this._resolveRequestHeaders(headers, args[0]);

        // @Params()
        case TypeOfContextualInjection.Params:
          return this._resolveRequestParams(params, args[0]);

        // @Context()
        case TypeOfContextualInjection.Context:
          return new ControllerContext(ctx);

        // @InjectState()
        case TypeOfContextualInjection.InjectState:
          return this._resolveRequestState(ctx, args[0]);

        default:
          throw new Error(`Unexpected contextual injection type: ${type}`);
      }
    }));
  }

  private _resolveMiddlewareContextualInjections(
    injections: ContextualInjection[],
    ctx:        Koa.Context,
    next:       any
  ): Promise<any[]> {
    return Promise.all(_.map(injections, ({ type, args }) => {
      switch (type) {
        // @Context()
        case TypeOfContextualInjection.Context:
          return new MiddlewareContext(ctx);

        // @Next()
        case TypeOfContextualInjection.Next:
          return next;

        // @InjectState()
        case TypeOfContextualInjection.InjectState:
          return this._resolveRequestState(ctx, args[0]);

        default:
          throw new Error(`Unexpected contextual injection type: ${type}`);
      }
    }));
  }

  private _resolvePolicyContextualInjections(
    injections: ContextualInjection[],
    ctx:        Koa.Context,
  ): Promise<any[]> {
    return Promise.all(_.map(injections, ({ type, args }) => {
      switch (type) {
        // @Context()
        case TypeOfContextualInjection.Context:
          return new PolicyContext(ctx);

        // @InjectState()
        case TypeOfContextualInjection.InjectState:
          return this._resolveRequestState(ctx, args[0]);

        default:
          throw new Error(`Unexpected contextual injection type: ${type}`);
      }
    }));
  }

  private _resolveStateContextualInjections(
    injections: ContextualInjection[],
    ctx:        Koa.Context,
    headers:    any
  ): Promise<any[]> {
    return Promise.all(_.map(injections, ({ type, args }) => {
      switch (type) {
        // @Context()
        case TypeOfContextualInjection.Context:
          return new StateContext(ctx);

        // @Headers()
        case TypeOfContextualInjection.Headers:
          return this._resolveRequestHeaders(headers, args[0]);

        // @InjectState()
        case TypeOfContextualInjection.InjectState:
          return this._resolveRequestState(ctx, args[0]);

        default:
          throw new Error(`Unexpected contextual injection type: ${type}`);
      }
    }));
  }

  private _resolveRequestBody(
    body:       any,
    property?:  string | symbol
  ) {
    return property === undefined
         ? body
         : body[property];
  }

  private _resolveRequestHeaders(
    headers:    any,
    property?:  string | symbol
  ) {
    return property === undefined
         ? headers
         : headers[property];
  }

  private _resolveRequestParams(
    params:     any,
    property?:  string | symbol
  ) {
    return property === undefined
         ? params
         : params[property];
  }

  private async _resolveRequestState<T>(
    ctx:   Koa.Context,
    Token: Type<ResolveState<T>>
  ): Promise<T> {
    if (ctx.$octavo.resolvedStates.has(Token)) {
      return ctx.$octavo.resolvedStates.get(Token);
    }

    /**
     * @todo(SuperPaintman):
     *    Move initialization of `state` to outside of resolver.
     *    But, it works and maybe it isn't so necessary.
     */

    const ctxInjections = getContextualInjections(Token, 'resolve');
    const state = this._injector.get(Token);

    const args = await this._resolveStateContextualInjections(
      ctxInjections,
      ctx,
      ctx.headers
    );

    const val = await state.resolve(...args);

    ctx.$octavo.resolvedStates.set(Token, val);

    return val;
  }

  private async _validateRequest(
    ctx:            Koa.Context,
    bodySchema?:    Schema,
    paramsSchema?:  Schema,
    headersSchema?: Schema,
    querySchema?:   Schema
  ): Promise<{
    body:    any;
    params:  any;
    headers: any;
    query:   any;
  }> {
    const [
      body,
      params,
      headers,
      query
    ] = await Promise.all([
      tolerantPromise(this._validateRequestBody(ctx.request.body, bodySchema)),
      tolerantPromise(this._validateRequestParams(ctx.params, paramsSchema)),
      tolerantPromise(this._validateRequestHeaders(ctx.request.headers, headersSchema)),
      tolerantPromise(this._validateRequestQuery(ctx.request.query, querySchema))
    ]);

    /**
     * @todo(SuperPaintman):
     *    Add merging errors into one BFE (Big Fluffy Error) :)
     */
    if (
      headers.error   !== null
      || params.error !== null
      || query.error  !== null
      || body.error   !== null
    ) {
      throw new ValidationError();
    }

    return {
      body:    body.result,
      params:  params.result,
      headers: headers.result,
      query:   query.result
    };
  }

  private _validateRequestBody(obj: any, schema?: Schema) {
    return this._validateRequestSchema(obj, schema);
  }

  private _validateRequestParams(obj: any, schema?: Schema) {
    return this._validateRequestSchema(obj, schema);
  }

  private _validateRequestHeaders(obj: any, schema?: Schema) {
    return this._validateRequestSchema(obj, schema);
  }

  private _validateRequestQuery(obj: any, schema?: Schema) {
    return this._validateRequestSchema(obj, schema);
  }

  private _validateRequestSchema(obj: any, schema?: Schema) {
    return schema === undefined
         ? Promise.resolve(obj)
         : schema.validate(obj);
  }

  private _validateResponseBody(obj: any, schema?: Schema) {
    if (schema === undefined) {
      return Promise.resolve(obj);
    }

    return schema.validate(obj)
      .catch((err) => {
        /**
         * @todo(SuperPaintman):
         *    Change this error. It should be an internal error for developers
         *    and admins.
         */
        throw new Error('Invalid response body');
      });
  }

  private _addTransformer<T extends AnyTransform>(
    router:      Router,
    path:        string,
    Transformer: Type<T>
  ) {
    const transformer = this._injector.load(Transformer).get(Transformer);


    router.use(path, async (ctx, next) => {
      ctx.$octavo.transformer = transformer;

      await next();
    });
  }

  private _addFormatters<T extends ResponseFormatter>(
    router:      Router,
    path:        string,
    Formatters:  Type<T>[]
  ) {
    const formatters = Formatters.map((Formatter) => Object.assign(getFormatter(Formatter), {
      formatter: this._injector.load(Formatter).get(Formatter)
    }));

    router.use(path, async (ctx, next) => {
      ctx.$octavo.formatters = ctx.$octavo.formatters.concat(formatters);

      await next();
    });
  }

  private _addErrorInterceptors<T extends ErrorInterceptorHandler>(
    router:           Router,
    path:             string,
    ErrorInterceptors: Type<T>[]
  ) {
    const errorInterceptors = ErrorInterceptors.map((ErrorInterceptor) => (
      this._injector.load(ErrorInterceptor).get(ErrorInterceptor)
    ));


    router.use(path, async (ctx, next) => {
      ctx.$octavo.errorInterceptors = ctx.$octavo.errorInterceptors.concat(errorInterceptors);

      await next();
    });
  }
}
