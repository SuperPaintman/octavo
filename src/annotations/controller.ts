'use strict';
/** Imports */
import { Type } from '../utils/type';
import {
  makeClassAnnotation,
  TypeOfInjection,
  ClassAnnotation
} from '../utils/metadata';


export interface ControllerOptions {
  /**
   * @todo(SuperPaintman):
   *    Maybe add "stateless" option for controllers.
   *
   *    For example, in this case, we will be able to set context-based
   *    properties to controller's instance.
   *
   *    ```ts
   *    @Controller({ singleton: false })
   *    export class UsersController implements ResourceController {
   *      private name: string;
   *
   *      async show() {
   *        await this._loadUserName();
   *
   *        return {
   *          name: this.name
   *        };
   *      }
   *
   *      private async _loadUserName(): Promise<void> {
   *        this.name = 'SuperPaintman';
   *      }
   *    }
   *    ```
   *
   *    But I don't think that it is so necessary.
   */
  // singleton: boolean;
}

export interface ControllerAnnotation {
  // (obj?: ControllerOptions): ClassAnnotation<any>;
  (): ClassAnnotation<any>;
}

export const Controller: ControllerAnnotation = makeClassAnnotation<Type<any>>(
  'Controller',
  TypeOfInjection.Service
);
