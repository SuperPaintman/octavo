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

  it('should throws an error if at least one of the items is invalid', async () => {
    const schema = new Schema(array({
      items: [
        number()
      ]
    }));

    /**
     * @todo(SuperPaintman):
     *    Add the exact error message
     */
    expect(schema.validate([1, 'e', 3, 't']))
      .to.rejectedWith(Error);
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
