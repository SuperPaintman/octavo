
'use strict';
/** Imports */
import { Logger, Service } from '../../../../';


@Service()
export class SilentLogger extends Logger {
  fatal(message: string)    { return; }
  error(message: string)    { return; }
  warn(message: string)     { return; }
  info(message: string)     { return; }
  verbose(message: string)  { return; }
  debug(message: string)    { return; }
  trace(message: string)    { return; }
  scope(name: string)       { return this; }
  context(data: any)        { return this; }
}
