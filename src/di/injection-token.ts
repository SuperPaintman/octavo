'use strict';

export class InjectionToken<T> {
  constructor(private _desc: string) { }

  toString(): string {
    return `InjectionToken ${this._desc}`;
  }
}
