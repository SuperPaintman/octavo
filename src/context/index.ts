'use strict';
/** Imports */
import * as Koa from 'koa';


/** Interfaces */
export interface CookieSetOption {
  maxAge?:      number;
  expires?:     Date;
  path?:        string;
  domain?:      string;
  secure?:      boolean;
  secureProxy?: boolean;
  httpOnly?:    boolean;
  sameSite?:    'strict' | 'lax' | boolean;
  signed?:      boolean;
  overwrite?:   boolean;
}


export abstract class CommonContext {
  constructor(
    protected _koaCtx: Koa.Context
  ) { }

  get method(): string {
    return this._koaCtx.method;
  }

  get url(): string {
    return this._koaCtx.url;
  }

  // get status(): number {
  //   return this._koaCtx.status;
  // }
}


export class MiddlewareContext extends CommonContext {
  setHeader(field: string, val: string): void {
    this._koaCtx.set(field, val);
  }

  setCookie(name: string, value?: string, opts?: CookieSetOption): void {
    this._koaCtx.cookies.set(name, value, opts);
  }
}

export class PolicyContext extends CommonContext {

}

export class ControllerContext extends CommonContext {

}

export class StateContext extends CommonContext {

}
