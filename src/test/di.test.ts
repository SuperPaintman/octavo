'use strict';
/** Imports */
import { expect } from './helpers';

import { Service, Factory, Provider, Inject } from '../annotations/di';
import { Injector } from '../di/injector';


describe('Injector', () => {
  it('should works', () => {
    new Injector([]);
  });

  it('should override the provider if it is passed several times');

  it('should throws an error if dependency did not annotate with @Inject()', () => {
    @Service()
    class Engine { }

    expect(() => {
      @Service()
      class Car {
        constructor(
          public engine: Engine
        ) { }
      }
    }).to.throw(Error, 'Missed annotation for 0 param in Car constructor');
  });

  describe('#get()', () => {
    it('should works', () => {
      @Service()
      class Utils { }

      const injector = new Injector([
        Utils
      ]);

      injector.get(Utils);
    });

    it('should throws an error if provider is not defined', () => {
      @Service()
      class Utils { }

      const injector = new Injector([]);

      expect(() => injector.get(Utils))
        .to.throw(Error, 'No provider for Utils');
    });

    it('should throws an error if provider is not annotated', () => {
      expect(() => {
        class Utils { }

        const injector = new Injector([
          Utils
        ]);
      }).to.throw(Error, 'Missed required annotation on Utils provider');
    });

    it('should works irrespective of the dependency definitions order', () => {
      @Service()
      class Fuel { }

      @Service()
      class Engine {
        constructor(
          @Inject() public fuel: Fuel
        ) { }
      }

      @Service()
      class Car {
        constructor(
          @Inject() public engine: Engine
        ) { }
      }

      const injector = new Injector([
        Car,
        Fuel,
        Engine
      ]);

      const car = injector.get(Car);

      expect(car).to.be.a.instanceOf(Car);
      expect(car.engine).to.be.a.instanceOf(Engine);
      expect(car.engine.fuel).to.be.a.instanceOf(Fuel);
    });
  });

  describe('#load()', () => {
    it('should works');
  });

  describe('@Inject()', () => {
    it('should resolves constructor DI', () => {
      @Service()
      class Fuel { }

      @Service()
      class Engine {
        constructor(
          @Inject() public fuel: Fuel
        ) { }

        go() {
          return 'Vrooom!';
        }
      }

      @Service()
      class Car {
        constructor(
          @Inject() public engine: Engine
        ) { }

        drive() {
          return this.engine.go();
        }
      }

      const injector = new Injector([
        Fuel,
        Engine,
        Car
      ]);

      const car = injector.get(Car);

      expect(car).to.be.a.instanceOf(Car);
      expect(car.engine).to.be.a.instanceOf(Engine);
      expect(car.engine.fuel).to.be.a.instanceOf(Fuel);
      expect(car.drive()).to.be.equals('Vrooom!');
    });

    it('should resolve property DI', () => {
      @Service()
      class Fuel { }

      @Service()
      class Engine {
        @Inject() public fuel: Fuel;

        go() {
          return 'Vroom Vroom Vroooooom!';
        }
      }

      @Service()
      class Car {
        @Inject() public engine: Engine;

        drive() {
          return this.engine.go();
        }
      }

      const injector = new Injector([
        Fuel,
        Engine,
        Car
      ]);

      const car = injector.get(Car);

      expect(car).to.be.a.instanceOf(Car);
      expect(car.engine).to.be.a.instanceOf(Engine);
      expect(car.engine.fuel).to.be.a.instanceOf(Fuel);
      expect(car.drive()).to.be.equals('Vroom Vroom Vroooooom!');
    });

    it('should resolve constructor DI and property DI both', () => {
      @Service()
      class Fuel { }

      @Service()
      class Engine {
        @Inject() public fuel: Fuel;

        go() {
          return 'Vroom Vroom Vroooooom!';
        }
      }

      @Service()
      class Wheels {
        readonly count = 4;
      }

      @Service()
      class Car {
        @Inject() public wheels: Wheels;

        constructor(
          @Inject() public engine: Engine
        ) { }

        drive() {
          return this.engine.go();
        }
      }

      const injector = new Injector([
        Fuel,
        Engine,
        Wheels,
        Car
      ]);

      const car = injector.get(Car);

      expect(car).to.be.a.instanceOf(Car);
      expect(car.engine).to.be.a.instanceOf(Engine);
      expect(car.wheels).to.be.a.instanceOf(Wheels);
      expect(car.engine.fuel).to.be.a.instanceOf(Fuel);
      expect(car.drive()).to.be.equals('Vroom Vroom Vroooooom!');
    });

    it('should throws an error if injection is defined');

    it('should supports inject custom token');
  });

  describe('@Service()', () => {
    it('should returns a instance on service', () => {
      @Service()
      class Utils { }

      const injector = new Injector([
        Utils
      ]);

      const utils = injector.get(Utils);

      expect(utils).to.be.a.instanceOf(Utils);
    });

    it('service should be a singleton', () => {
      @Service()
      class Stateful {
        state = 0;

        inc() {
          this.state++;

          return this;
        }
      }

      const injector = new Injector([
        Stateful
      ]);

      const stateful1 = injector.get(Stateful);

      stateful1
        .inc()
        .inc()
        .inc()
        .inc();

      const stateful2 = injector.get(Stateful);

      expect(stateful2.state).to.be.equals(4);
    });

    it('should resolves service only once', () => {
      let i = 0;

      @Service()
      class Utils {
        constructor() {
          i++;
        }
      }

      const injector = new Injector([
        Utils
      ]);

      expect(i).to.be.equals(0);

      injector.get(Utils);
      injector.get(Utils);
      injector.get(Utils);
      injector.get(Utils);
      injector.get(Utils);

      expect(i).to.be.equals(1);
    });

    it('should resolves only after the "#get()" call', () => {
      let initialized = false;

      @Service()
      class Utils {
        constructor() {
          initialized = true;
        }
      }

      const injector = new Injector([
        Utils
      ]);

      expect(initialized).to.be.false;

      injector.get(Utils);

      expect(initialized).to.be.true;
    });
  });

  describe('@Factory()', () => {
    it('should returns a extended constructor', () => {
      @Factory()
      class UserModel { }

      const injector = new Injector([
        UserModel
      ]);

      const User = injector.get(UserModel);

      expect(User).to.be.equals(UserModel);
    });
  });

  describe('@Provider()', () => {
    it('should returns a providable thing', () => {
      @Provider()
      class LeetProvider {
        provide() {
          return 1337;
        }
      }

      const injector = new Injector([
        LeetProvider
      ]);

      const leet = injector.get(LeetProvider);

      expect(leet).to.be.equals(1337);
    });
  });
});
