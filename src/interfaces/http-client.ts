import Buffer from "buffer";
import { IncomingMessage } from 'http';

import { FunctionType } from './function-type';

export type HttpClientBodyData = Buffer | NodeJS.ReadableStream | string | null;
export type HttpClientMethod = 'get' | 'delete' | 'patch' | 'post' | 'put'


export interface HttpClient {
  get(url: string, data?: HttpClientBodyData, options?: Record<string, string>, callback?: FunctionType): Promise<IncomingMessage>;

  post(url: string, data?: HttpClientBodyData, options?: Record<string, string>, callback?: FunctionType): Promise<IncomingMessage>;

  request(method: HttpClientMethod, url: string, data?: HttpClientBodyData, options?: Record<string, string>, callback?: FunctionType): Promise<IncomingMessage>
}
