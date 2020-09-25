export interface ScrapingParams {
  body: string,
  selectorString: string,
  url: string,
  excludeURL: RegExp,
  regexp?: RegExp,
  urlCore: string;
  urlScrapContext?: string;
  limit: number;
}
