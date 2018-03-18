'use strict';
/** Imports */
import { expect } from './helpers';

import {
  o,
  object,
  array,
  string,
  number,
  boolean,
  $slot,
  Schema
} from '../../schema';


describe('Schema', () => {
  it('should works', () => {
    new Schema(o({}));
  });

  describe('#validate()', () => {
    it('should works', async () => {
      const schema = new Schema(o({
        name: string()
      }));

      const value = await schema.validate({
        name: 'Aleksandr'
      });

      expect(value.name).to.be.equal('Aleksandr');
    });
  });

  describe('#validateSync()', () => {
    it('should works', () => {
      const schema = new Schema(o({
        name: string()
      }));

      const value = schema.validateSync({
        name: 'Aleksandr'
      });

      expect(value.name).to.be.equal('Aleksandr');
    });
  });

  describe('Validation', () => {
    it('should throw an SchemaValidationError even with deep targets', async () => {
      const schema = new Schema(o({
        deep: o([
          o({
            deep: o({
              a: o({
                stringItem: string(),
                numberItem: number(),
              })
            })
          })
        ]),
        booleanItem: boolean()
      }));

      const target = {
        deep: [
          {
            deep: {
              a: {
                numberItem: 1337
              }
            }
          },
          {
            deep: { }
          },
          {
            deep: {
              a: {
                stringItem: 'hello',
                numberItem: []
              }
            }
          }
        ],
        booleanItem: '!!!'
      };

      const err = await expect(schema.validate(target)).to.rejected;
      expect(err).to.be.validationError(target, [
        [undefined, '.deep[0].deep.a.stringItem', { required: 'is required' }],
        [undefined, '.deep[1].deep.a',            { required: 'is required' }],
        [[],        '.deep[2].deep.a.numberItem', { type: 'must be a number' }],
        ['!!!',     '.booleanItem',               { type: 'must be a boolean' }]
      ]);
    });
  });
});

describe('o()', () => {
  it('should works with object', async () => {
    const schema = new Schema(o({
      name: string()
    }));

    const value = await schema.validate({
      name: 'Aleksandr'
    });

    expect(value.name).to.be.equal('Aleksandr');
  });

  it('should works with array', async () => {
    const schema = new Schema(o([
      number()
    ]));

    const value = await schema.validate([1, 3, 3, 7]);

    expect(value).to.be.deep.equal([1, 3, 3, 7]);
  });
});

describe('object()', () => {
  it('should works', async () => {
    const schema = new Schema(object({
      keys: {
        name: string()
      }
    }));

    const value = await schema.validate({
      name: 'Aleksandr'
    });

    expect(value.name).to.be.equal('Aleksandr');
  });

  it('should strip unknown keys', async () => {
    const schema = new Schema(object({
      keys: {
        name: string()
      }
    }));

    const value = await schema.validate({
      name: 'Aleksandr',
      isAdmin: true,
      hackTheServer: 1337
    });

    expect(value).to.be.deep.equal({
      name: 'Aleksandr'
    });
  });
});

describe('array()', () => {
  it('should works', async () => {
    const schema = new Schema(array({
      items: [
        number()
      ]
    }));

    const value = await schema.validate([1, 3, 3, 7]);

    expect(value).to.be.deep.equal([1, 3, 3, 7]);
  });

  it('should throws a SchemaValidationError if at least one of the items is invalid', async () => {
    const schema = new Schema(array({
      items: [
        number()
      ]
    }));

    const target = [1, 'e', 3, 't'];

    const err = await expect(schema.validate(target)).to.rejected;
    expect(err).to.be.validationError(target, [
      ['e', '[1]', { type: 'must be a number' }],
      ['t', '[3]', { type: 'must be a number' }]
    ]);
  });
});

describe('string()', () => {
  it('should works', async () => {
    const schema = new Schema(string());

    const value = await schema.validate('Aleksandr');

    expect(value).to.be.equal('Aleksandr');
  });
});

describe('number()', () => {
  it('should works', async () => {
    const schema = new Schema(number());

    const value = await schema.validate(1337);

    expect(value).to.be.equal(1337);
  });
});

describe('boolean()', () => {
  it('should works', async () => {
    const schema = new Schema(boolean());

    const value = await schema.validate(true);

    expect(value).to.be.equal(true);
  });
});

describe('$slot()', () => {
  it('should works');
});
