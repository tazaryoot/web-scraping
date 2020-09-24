import { IncomingMessage } from 'http';

export interface ExtendedResponse extends IncomingMessage {
  body: string;
}
