import { BodyData, NeedleHttpVerbs, NeedleOptions, NeedleResponse } from 'needle';

export type NeedleConstructor = (method: NeedleHttpVerbs, url: string, data?: BodyData, options?: NeedleOptions) => Promise<NeedleResponse>;
