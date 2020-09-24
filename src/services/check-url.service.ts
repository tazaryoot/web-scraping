import 'reflect-metadata';
import { injectable } from 'inversify';

import { CheckUrl } from '../interfaces/check-url';


@injectable()
export class CheckUrlService implements CheckUrl {
  check(targetUrl: string, urlCore: string, urlScrapContext = '/'): boolean {
    const normalizeCoreUrl = urlCore.endsWith('/') ? urlCore.substr(1) : urlCore;
    let normalizeUrlScrapContext = urlScrapContext.endsWith('/') ? urlScrapContext : `${urlScrapContext}/`;
    normalizeUrlScrapContext = normalizeUrlScrapContext.startsWith('/') ? normalizeUrlScrapContext : `/${normalizeUrlScrapContext}`;

    const result = targetUrl.startsWith(`${normalizeCoreUrl}${normalizeUrlScrapContext}`) || targetUrl.startsWith(normalizeUrlScrapContext);

    return targetUrl.startsWith(`${normalizeCoreUrl}${normalizeUrlScrapContext}`) || targetUrl.startsWith(normalizeUrlScrapContext);
  }
}
