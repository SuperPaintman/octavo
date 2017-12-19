'use strict';
/** Imports */
import * as fs from 'fs';

import { ViewEngineRender, Data } from '.';
import { ViewEngine } from '../annotations/view-engine';


@ViewEngine()
export class HtmlViewEngine implements ViewEngineRender {
  get ext() { return '.html'; }

  render(path: string, data: Data) {
    return new Promise<string>((resolve, reject) => {
      fs.readFile(path, 'utf-8', (err, data) => {
        err !== null ? reject(err) : resolve(data);
      });
    });
  }
}
