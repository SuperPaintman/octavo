'use strict';
/** Imports */
import * as _   from 'lodash';
import * as Joi from 'joi';


/** Interfaces */
export interface SchemaDetailsCommonOptions {
  optional?: boolean;
}


export interface SchemaDetailsObjectOptions extends SchemaDetailsCommonOptions {
  keys?: SchemaDetailsObjectKeys;
}

export interface SchemaDetailsArrayOptions extends SchemaDetailsCommonOptions {
  items?: SchemaDetailsArrayItems;
}

export interface SchemaDetailsStringOptions extends SchemaDetailsCommonOptions {
  default?: string;
}

export interface SchemaDetailsNumberOptions extends SchemaDetailsCommonOptions {
  default?: number;
}

export interface SchemaDetailsBooleanOptions extends SchemaDetailsCommonOptions {
  default?: boolean;
}

export type SchemaDetailsOptions =
  & SchemaDetailsObjectOptions
  & SchemaDetailsArrayOptions
  & SchemaDetailsStringOptions
  & SchemaDetailsNumberOptions
  & SchemaDetailsBooleanOptions
  ;

export interface SchemaDetailsObjectKeys {
  [key: string]: SchemaDetails | SchemaSlot;
}

export type SchemaDetailsArrayItems = Array<SchemaDetails | SchemaSlot>;


export abstract class SchemaDetails {
  readonly optional: boolean;

  constructor(options: SchemaDetailsCommonOptions = {}) {
    const {
      optional = false
    } = options;

    this.optional = optional;
  }
}

export class SchemaDetailsObject extends SchemaDetails {
  readonly keys?: SchemaDetailsObjectKeys;

  constructor(options: SchemaDetailsObjectOptions = {}) {
    super(options);

    const {
      keys
    } = options;

    this.keys = keys;
  }
}

export class SchemaDetailsArray extends SchemaDetails {
  readonly items?: SchemaDetailsArrayItems;

  constructor(options: SchemaDetailsArrayOptions = {}) {
    super(options);

    const {
      items
    } = options;

    this.items = items;
  }
}

export class SchemaDetailsString extends SchemaDetails {
  readonly default?: string;

  constructor(options: SchemaDetailsStringOptions = {}) {
    super(options);

    const {
      default: defaultValue
    } = options;

    this.default = defaultValue;
  }
}

export class SchemaDetailsNumber extends SchemaDetails {
  readonly default?: number;

  constructor(options: SchemaDetailsNumberOptions = {}) {
    super(options);

    const {
      default: defaultValue
    } = options;

    this.default = defaultValue;
  }
}

export class SchemaDetailsBoolean extends SchemaDetails {
  readonly default?: boolean;

  constructor(options: SchemaDetailsBooleanOptions = {}) {
    super(options);

    const {
      default: defaultValue
    } = options;

    this.default = defaultValue;
  }
}

export class SchemaSlot { }


export function o(keys: SchemaDetailsObjectKeys): SchemaDetailsObject;
export function o(items: SchemaDetailsArrayItems): SchemaDetailsArray;
export function o(keysOrItems: SchemaDetailsObjectKeys | SchemaDetailsArrayItems): SchemaDetailsObject | SchemaDetailsArray {
  if (_.isArray(keysOrItems)) {
    return array({ items: keysOrItems });
  } else {
    return object({ keys: keysOrItems });
  }
}


const _object  = (options: SchemaDetailsObjectOptions = {})  => new SchemaDetailsObject(options);
const _array   = (options: SchemaDetailsArrayOptions = {})   => new SchemaDetailsArray(options);
const _string  = (options: SchemaDetailsStringOptions = {})  => new SchemaDetailsString(options);
const _number  = (options: SchemaDetailsNumberOptions = {})  => new SchemaDetailsNumber(options);
const _boolean = (options: SchemaDetailsBooleanOptions = {}) => new SchemaDetailsBoolean(options);
const _$slot   = () => new SchemaSlot();

export const object  = _object;
export const array   = _array;
export const string  = _string;
export const number  = _number;
export const boolean = _boolean;
export const $slot   = _$slot;

/**
 * @todo(SuperPaintman):
 *    "There should be one-- and preferably only one --obvious way to do it."
 *                                                              Zen of Python
 *
 *    Buy, maybe it's a good idea. But not now.
 */
// export namespace o {
//   export const object  = _object;
//   export const array   = _array;
//   export const string  = _string;
//   export const number  = _number;
//   export const boolean = _boolean;
//   export const $slot   = _$slot;
// }

export class Schema {
  private _joiSchema: Joi.Schema = this._schemaToJoi(this._schema);
  private readonly _joivalidateOptions: Joi.ValidationOptions = {
    presence:      'required',
    convert:       true,
    abortEarly:    false,
    stripUnknown: {
      objects: true
    }
  };

  constructor(
    private _schema: SchemaDetails
  ) { }

  validate<T>(val: T): Promise<T> {
    return new Promise((resolve, reject) => {
      Joi.validate(val, this._joiSchema, this._joivalidateOptions, (err, result) => {
        err ? reject(this._formatJoiError(err)) : resolve(result);
      });
    });
  }

  validateSync<T>(val: T): T {
    const { value, error } = Joi.validate(val, this._joiSchema, this._joivalidateOptions);

    if (error !== null) {
      throw this._formatJoiError(error);
    }

    return value;
  }

  private _schemaToJoi(schema: SchemaDetails | SchemaSlot): Joi.Schema {
    switch (true) {
      case (schema instanceof SchemaDetails): return this._schemaDetailToJoi(schema as SchemaDetails);
      case (schema instanceof SchemaSlot):    return Joi.any();
      default: throw new Error('Unknown type of schema');
    }
  }

  private _schemaDetailToJoi(schema: SchemaDetails): Joi.Schema {
    let s = this._typeToJoi(schema);

    if (schema.optional === true) {
      s = s.optional();
    }

    switch (true) {
      case (schema instanceof SchemaDetailsObject):  return this._schemaDetailObjectToJoi(s as any, schema);
      case (schema instanceof SchemaDetailsArray):   return this._schemaDetailArrayToJoi(s as any, schema);
      case (schema instanceof SchemaDetailsString):  return this._schemaDetailStringToJoi(s as any, schema);
      case (schema instanceof SchemaDetailsNumber):  return this._schemaDetailNumberToJoi(s as any, schema);
      case (schema instanceof SchemaDetailsBoolean): return this._schemaDetailBooleanToJoi(s as any, schema);
      default: throw new Error('Unknown type of schema');
    }
  }

  private _schemaDetailObjectToJoi(s: Joi.ObjectSchema, schema: SchemaDetailsObject): Joi.ObjectSchema {
    if (schema.keys !== undefined) {
      s = s.keys(_.mapValues(schema.keys, (s) => this._schemaToJoi(s)));
    }

    return s;
  }

  private _schemaDetailArrayToJoi(s: Joi.ArraySchema, schema: SchemaDetailsArray): Joi.ArraySchema {
    if (schema.items !== undefined) {
      s = s.items(_.map(schema.items, (s) => this._schemaToJoi(s)));
    }

    return s;
  }

  private _schemaDetailStringToJoi(s: Joi.StringSchema, schema: SchemaDetailsString): Joi.StringSchema {
    if (schema.default !== undefined) {
      s = s.default(schema.default);
    }

    return s;
  }

  private _schemaDetailNumberToJoi(s: Joi.NumberSchema, schema: SchemaDetailsNumber): Joi.NumberSchema {
    if (schema.default !== undefined) {
      s = s.default(schema.default);
    }

    return s;
  }

  private _schemaDetailBooleanToJoi(s: Joi.BooleanSchema, schema: SchemaDetailsBoolean): Joi.BooleanSchema {
    if (schema.default !== undefined) {
      s = s.default(schema.default);
    }

    return s;
  }

  private _typeToJoi(schema: SchemaDetails): Joi.Schema {
    switch (true) {
      case (schema instanceof SchemaDetailsObject):  return Joi.object();
      case (schema instanceof SchemaDetailsArray):   return Joi.array();
      case (schema instanceof SchemaDetailsString):  return Joi.string();
      case (schema instanceof SchemaDetailsNumber):  return Joi.number();
      case (schema instanceof SchemaDetailsBoolean): return Joi.boolean();
      default: throw new Error('Unknown schema type');
    }
  }

  private _formatJoiError(err: Joi.ValidationError): Error {
    /**
     * @todo(SuperPaintman)
     *    Add the `err` transformation to get rid of Joi vendor lock.
     */
    return new Error(err.message);
  }
}
