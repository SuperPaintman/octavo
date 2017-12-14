'use strict';

export interface ControllerHandler {
  (...args: any[]): Promise<any>;
}

export abstract class ResourceController {
  /**
   * `GET /users`
   *
   * * Default HTTP method: `GET`
   * * Default status: `200`
   */
  index?:   ControllerHandler;

  /**
   * `GET /users/new`
   *
   * * Default HTTP method: `GET`
   * * Default status: `200`
   */
  new?:     ControllerHandler;

  /**
   * `GET /users/:id`
   *
   * * Default HTTP method: `GET`
   * * Default status: `200`
   */
  show?:    ControllerHandler;

  /**
   * `POST /users`
   *
   * * Default HTTP method: `POST`
   * * Default status: `201`
   */
  create?:  ControllerHandler;

  /**
   * `GET /users/:id/edit`
   *
   * * Default HTTP method: `GET`
   * * Default status: `200`
   */
  edit?:    ControllerHandler;

  /**
   * `PATCH /users/:id`
   *
   * * Default HTTP method: `PATCH`
   * * Default status: `200`
   */
  update?:  ControllerHandler;

  /**
   * `DELETE /users/:id`
   *
   * * Default HTTP method: `DELETE`
   * * Default status: `200`
   */
  destroy?: ControllerHandler;
}
