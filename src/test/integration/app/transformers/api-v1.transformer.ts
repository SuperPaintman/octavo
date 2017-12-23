'use strict';
/** Imports */
import {
  Transformer,
  Transform,
  HttpError
} from '../../../..';


@Transformer()
export class ApiV1Transformer implements Transform {
  // @Transform(o({
  //   status: string(),
  //   data:   $slot()
  // }))
  success(data: any) {
    return {
      status: 'success',
      data
    };
  }

  // @Transform(o({
  //   status: string(),
  //   error: o({
  //     name:    string(),
  //     message: string()
  //   })
  // }))
  error(err: HttpError) {
    return {
      status: 'error',
      error: {
        name:    err.name,
        message: err.message
      }
    };
  }
}
