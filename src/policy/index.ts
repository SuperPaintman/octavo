'use strict';

export interface PolicyExec {
  exec(...args: any[]): Promise<void>;
}

