'use strict';
/** Imports */
import * as _ from 'lodash';

import { Provider, OverrideProvider } from './provider';
import { Type } from '../utils/type';
import { stringify } from '../utils/stringify';
import {
  TypeOfInjection,
  getInjectionType,
  getConstructorInjections,
  getPropertyInjections
} from '../utils/metadata';
import {
  ServiceType,
  FactoryType,
  ProviderType
} from '../annotations/di';


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
    providers:       Provider[]
    // readonly parent: AbstractInjector = AbstractInjector.NULL
  ) {
    this._initialLoad(providers);
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

  load(provider: Provider): this {
    if (_.isFunction(provider)) {
      return this._loadType(provider as any, provider as any);
    } else {
      return this._loadOverride(provider as any);
    }
  }

  private _initialLoad(providers: Provider[]): void {
    for (const provider of providers) {
      this.load(provider);
    }
  }

  private _loadOverride(obj: OverrideProvider): this {
    return this._loadType(obj.use, obj.insteadOf);
  }

  private _loadType(Provider: Type<any>, token: Type<any>): this {
    const type = getInjectionType(Provider);
    const typeOfToken = getInjectionType(token);

    if (type === undefined) {
      throw new Error(`Missed required annotation on ${stringify(Provider)} provider`);
    }

    if (typeOfToken === undefined) {
      throw new Error(`Missed required annotation on overloaded ${stringify(token)} provider`);
    }

    switch (type) {
      case TypeOfInjection.Service:  return this._loadService(Provider, token);
      case TypeOfInjection.Factory:  return this._loadFactory(Provider, token);
      case TypeOfInjection.Provider: return this._loadProvider(Provider, token);
      default: throw new Error(`Undefined provider type: ${type}`);
    }
  }

  private _loadService(Class: Type<any>, token: Type<any>): this {
    const constructorInjections = getConstructorInjections(Class);
    const propertyInjections = getPropertyInjections(Class);

    const record = new Record(() => {
      const args = constructorInjections.map((dep) => this.get(dep));

      const value = new Class(...args);

      _.forEach(propertyInjections, (dep, key) => {
        value[key] = this.get(dep);
      });

      return value;
    });

    this._records.set(token, record);

    return this;
  }

  private _loadFactory(Class: Type<any>, token: Type<any>): this {
    const propertyInjections = getPropertyInjections(Class);

    const record = new Record(() => {
      _.forEach(propertyInjections, (dep, key) => {
        Class.prototype[key] = this.get(dep);
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

      return Class;
    });

    this._records.set(token, record);

    return this;
  }

  private _loadProvider(Class: Type<any>, token: Type<any>): this {
    const constructorInjections = getConstructorInjections(Class);
    const propertyInjections = getPropertyInjections(Class);

    const record = new Record(() => {
      const args = constructorInjections.map((dep) => this.get(dep));

      const provider = new Class(...args);

      const value = provider.provide();

      return value;
    });

    this._records.set(token, record);

    return this;
  }
}
