import 'reflect-metadata';
import { injectable } from 'inversify';
import { IncomingMessage } from 'http';

import { FunctionType } from '../interfaces/function-type';
import { HttpClient, HttpClientBodyData, HttpClientMethod } from '../interfaces/http-client';


// eslint-disable-next-line @typescript-eslint/no-var-requires
const needle = require('needle');


@injectable()
export class HttpClientNeedleService implements HttpClient {
  get(url: string, data?: HttpClientBodyData, options?: Record<string, string>, callback?: FunctionType): Promise<IncomingMessage> {

    return needle('get', url, data, options, callback) as Promise<IncomingMessage>;
  }


  post(url: string, data?: HttpClientBodyData, options?: Record<string, string>, callback?: FunctionType): Promise<IncomingMessage> {

    return needle('post', url, data, options, callback) as Promise<IncomingMessage>;
  }


  request(method: HttpClientMethod, url: string, data?: HttpClientBodyData, options?: Record<string, string>, callback?: FunctionType): Promise<IncomingMessage> {

    return needle(method, url, data, options, callback) as Promise<IncomingMessage>;
  }

}
