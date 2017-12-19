'use strict';
/** Imports */
import { join, resolve, dirname, basename, extname } from 'path';

import { ViewEngineRender, Data } from '.';
import { isFileSync } from '../utils/is-file-sync';


export class ViewRenderer {
  public path:   string | null = null;
  public engine: ViewEngineRender;

  constructor(
    public  name:   string,
    private _root:  string[],
    engines:        { [ext: string]: ViewEngineRender }
  ) {
    const ext = extname(name);

    if (ext !== '') {
      this.engine = engines[ext];
      this.path = this._lookup(name, ext);
      return;
    }


    const exts = Object.keys(engines);

    for (let i = exts.length - 1; i >= 0; i--) {
      const ext = exts[i];

      this.path = this._lookup(name, ext);

      if (this.path === null) {
        continue;
      }

      this.engine = engines[ext];
      break;
    }
  }

  render(data: Data): Promise<string> {
    return this.engine.render(this.path!, data);
  }

  private _lookup(name: string, ext: string): string | null {
    for (const root of this._root) {
      // resolve the path
      const loc = resolve(root, name);
      const dir = dirname(loc);
      const file = basename(loc);

      // resolve the file
      const path = this._resolve(dir, file, ext);

      if (path === null) {
        continue;
      }

      return path;
    }

    return null;
  }

  private _resolve(dir: string, file: string, ext: string): string | null {
    let path: string;

    // <path>
    path = join(dir, file);
    if (isFileSync(path)) { return path; }

    // <path>.<ext>
    path = join(dir, `${file}${ext}`);
    if (isFileSync(path)) { return path; }

    // <path>/index.<ext>
    path = join(dir, basename(file, ext), `index${ext}`);
    if (isFileSync(path)) { return path; }

    return null;
  }
}
