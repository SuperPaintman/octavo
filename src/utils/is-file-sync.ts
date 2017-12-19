'use strict';
/** Imports */
import * as fs from 'fs';


export function isFileSync(path: string): boolean {
  try {
    const stat = fs.statSync(path);

    return stat.isFile();
  } catch (e) {
    return false;
  }
}
