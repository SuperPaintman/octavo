'use strict';
/** Imports */
import { EOL } from 'os';
import { inspect } from 'util'

import * as dateformat from 'dateformat';
import chalk, { Chalk } from 'chalk';

import { Service } from '../annotations/di';


export type LoggerLevel = string;
export type LoggerMeta = { [key: string]: any };
export type Colors =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'gray'
  ;

const COLOR_SCOPE = 'blue';

const INDENT      = '    ';
const DATE_FORMAT = 'mm.dd HH:MM:ss';


@Service()
export class Logger {
  /**
   * @todo(SuperPaintman):
   *    Move these properties to constructor DI.
   */
  private _stdout = process.stdout;
  private _stderr = process.stderr;

  private _scope?: string = 'core';
  private _context?: LoggerMeta;


  fatal(message: string) {
    return this._log('fatal', 'red', this._stderr, message);
  }

  error(message: string) {
    return this._log('error', 'red', this._stderr, message);
  }

  warn(message: string) {
    return this._log('warn', 'cyan', this._stdout, message);
  }

  info(message: string) {
    return this._log('info', 'gray', this._stdout, message);
  }

  verbose(message: string) {
    return this._log('verbose', 'yellow', this._stdout, message);
  }

  debug(message: string) {
    return this._log('debug', 'gray', this._stdout, message);
  }

  trace(message: string) {
    return this._log('trace', 'magenta', this._stdout, message);
  }

  scope(name: string) {
    const logger = this._clone();
    logger._scope = name;
    return logger;
  }

  context(data: LoggerMeta) {
    const logger = this._clone();
    logger._context = data;
    return logger;
  }

  private _log(
    level: LoggerLevel,
    color: Colors,
    stream: NodeJS.WriteStream,
    message: string
  ): void {
    stream.write(this._formatMessage(level, color, message) + EOL);
  }

  private _formatMessage(
    level: LoggerLevel,
    color: Colors,
    message: string
  ): string {
    let msg = '';

    msg += this._colorize('gray', '[');
    msg += this._getTimestamp();
    msg += this._colorize('gray', '] ');

    msg += this._colorize(color, level);

    if (this._scope !== undefined) {
      msg += `(${this._colorize(COLOR_SCOPE, this._scope)})`;
    }

    msg += ': ';
    msg += message;

    if (this._context !== undefined) {
      msg += '\n';
      msg += this._prettyObject(this._context);
    }

    return msg;
  }

  private _getTimestamp() {
    return dateformat(new Date(), DATE_FORMAT);
  }

  private _colorize(color: Colors, str: string) {
    return chalk[color](str);
  }

  private _prettyObject(obj: object): string {
    return this._indent(inspect(obj, {
      colors:         true,
      breakLength:    1,
      maxArrayLength: null,
      depth:          null,
      showHidden:     true
    }));
  }

  private _indent(str: string): string {
    return INDENT + str.split('\n').join('\n' + INDENT);
  }

  private _clone(): Logger {
    const logger = new Logger();

    if (this._scope !== undefined) {
      logger._scope = this._scope;
    }

    if (this._context !== undefined) {
      logger._context = this._context;
    }

    return logger;
  }
}
