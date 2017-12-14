'use strict';
/** Import */
import { Scope } from '../router/scope';


export interface ApplicationConfig {
  routes(obj: Scope): Promise<void>;

  port(num: number): void;

  poweredBy(show: boolean): void;

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
