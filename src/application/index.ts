'use strict';
/** Import */
import { Type } from '../utils/type';
import { Scope } from '../router/scope';
import { ViewEngineRender } from '../view-engine';


export interface ApplicationConfig {
  routes(obj: Scope): Promise<void>;

  port(num: number): void;

  poweredBy(show: boolean): void;

  views(root: string | string []): void;

  viewCache(cache: boolean): void;

  viewEngine(Engine: Type<ViewEngineRender>): void;
  viewEngine(ext: string, Engine: Type<ViewEngineRender>): void;

  /**
   * @todo(SuperPaintman):
   *    Add:
   *      * trustProxy(boolean)
   *      * views(string)
   *      * caseSensitiveRouting(boolean)
   */
}


export abstract class OctavoApplication {
  configure?(config: ApplicationConfig): Promise<void>;

  boot?(): Promise<void>;
}
