'use strict';
/** Interfaces */
export interface Data {
  [name: string]: any;
}


export interface ViewEngineRender {
  readonly ext: string;

  render(path: string, data?: Data): Promise<string>;
}
