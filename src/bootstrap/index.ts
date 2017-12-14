'use strict';
/** Imports */
import { Type } from '../utils/type';
import { OctavoApplication } from '../application';
import { Kernel } from '../kernel';


export async function bootstrap(Application: Type<OctavoApplication>): Promise<void> {
  const app = new Kernel(Application);

  await app.configure();
  await app.boot();
  await app.start();
};
