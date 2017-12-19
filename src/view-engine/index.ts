'use strict';
/** Interfaces */
export interface Data {
  [name: string]: any;
}


export interface ViewEngineRender {
  render(path: string, data?: Data): Promise<string>;
}
