'use strict';
/** Imports */
import * as _ from 'lodash';

import { Type } from '../utils/type';
import { stringify } from '../utils/stringify';
import {
  TypeOfInjection,
  ServiceType,
  FactoryType,
  ProviderType,
  getInjectionType,
  getConstructorInjections,
  getPropertyInjections
} from '../annotations/di';


/** Interfaces */
export type StaticProvider = any;


class Record<T> {
  isResolved: boolean = false;

  private _value: T;

  constructor(
    private _resolver: () => T
  ) { }

  resolve(): T {
    if (!this.isResolved) {
      this._value = this._resolver();
      this.isResolved = true;
    }

    return this._value;
  }
}


class NullInjector implements AbstractInjector {
  get(token: any): any {
    throw new Error(`No provider for ${stringify(token)}!`);
  }
}

export abstract class AbstractInjector {
  static NULL: AbstractInjector = new NullInjector();

  abstract get(token: any): any;
}


export class Injector implements AbstractInjector {
  private _records = new Map<any, Record<any>>();

  constructor(
    Providers:       StaticProvider[]
    // readonly parent: AbstractInjector = AbstractInjector.NULL
  ) {
    this._initialLoad(Providers);
  }

  // get<T extends ServiceType>(token: Type<T>): T;
  // get<T>(token: Type<T>): T | Type<T>;
  get<T extends ServiceType>(token: Type<T>): T;
  get<T extends FactoryType>(token: Type<T>): Type<T>;
  get<T>(token: Type<ProviderType<T>>): T;
  get(token: any): any {
    const record = this._records.get(token);

    if (record !== undefined) {
      return record.resolve();
    }

    /**
     * @todo(SuperPaintman):
     *    now, there is no need for a hierarchical DI.
     *    Maybe add it in the future.
     */
    // const parentValue = this.parent.get(token);
    //
    // if (parentValue !== undefined) {
    //   return parentValue;
    // }

    throw new Error(`No provider for ${stringify(token)}!`);
  }

  load(Provider: StaticProvider): this {
    const type = getInjectionType(Provider);

    if (type === undefined) {
      throw new Error(`Missed required annotation on ${stringify(Provider)} provider`);
    }

    switch (type) {
      case TypeOfInjection.Service:  return this._loadService(Provider);
      case TypeOfInjection.Factory:  return this._loadFactory(Provider);
      case TypeOfInjection.Provider: return this._loadProvider(Provider);
      default: throw new Error(`Undefined provider type: ${type}`);
    }
  }

  private _initialLoad(Providers: StaticProvider[]): void {
    for (const provider of Providers) {
      this.load(provider);
    }
  }

  private _loadService(Provider: StaticProvider): this {
    const constructorInjections = getConstructorInjections(Provider);
    const propertyInjections = getPropertyInjections(Provider);

    const record = new Record(() => {
      const args = constructorInjections.map((dep) => this.get(dep));

      const value = new Provider(...args);

      _.forEach(propertyInjections, (dep, key) => {
        value[key] = this.get(dep);
      });

      return value;
    });

    this._records.set(Provider, record);

    return this;
  }

  private _loadFactory(Provider: StaticProvider): this {
    const propertyInjections = getPropertyInjections(Provider);

    const record = new Record(() => {
      _.forEach(propertyInjections, (dep, key) => {
        Provider.prototype[key] = this.get(dep);
      });

      /**
       * @todo(SuperPaintman):
       *    mayby it isn't a good practice to override a prototype properties.
       *
       *    For example, we can override the `__proto__` property, or wrap
       *    passed provider in mixin.
       */
      // const Factory = function Factory() { }
      //
      // _.forEach(propertyInjections, (dep, key) => {
      //   Factory.prototype[key] = this.get(dep);
      // });
      //
      // const oldProto = Provider.prototype.__proto__;
      // Provider.prototype.__proto__ = Factory.prototype;
      // Factory.prototype.__proto__ = oldProto;

      return Provider;
    });

    this._records.set(Provider, record);

    return this;
  }

  private _loadProvider(Provider: StaticProvider): this {
    const constructorInjections = getConstructorInjections(Provider);
    const propertyInjections = getPropertyInjections(Provider);

    const record = new Record(() => {
      const args = constructorInjections.map((dep) => this.get(dep));

      const provider = new Provider(...args);

      const value = provider.provide();

      return value;
    });

    this._records.set(Provider, record);

    return this;
  }
}
