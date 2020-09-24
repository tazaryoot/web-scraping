import 'reflect-metadata';
import { injectable } from 'inversify';

import { ExtendedResponse } from '../interfaces/extended-response';
import { FunctionType } from '../interfaces/function-type';
import { HttpClient, HttpClientBodyData, HttpClientMethod } from '../interfaces/http-client';


// eslint-disable-next-line @typescript-eslint/no-var-requires
const needle = require('needle');


@injectable()
export class HttpClientNeedleService implements HttpClient {
  get(url: string, data?: HttpClientBodyData, options?: Record<string, string>, callback?: FunctionType): Promise<ExtendedResponse> {

    return needle('get', url, data, options, callback) as Promise<ExtendedResponse>;
  }


  post(url: string, data?: HttpClientBodyData, options?: Record<string, string>, callback?: FunctionType): Promise<ExtendedResponse> {

    return needle('post', url, data, options, callback) as Promise<ExtendedResponse>;
  }


  request(method: HttpClientMethod, url: string, data?: HttpClientBodyData, options?: Record<string, string>, callback?: FunctionType): Promise<ExtendedResponse> {

    return needle(method, url, data, options, callback) as Promise<ExtendedResponse>;
  }

}
