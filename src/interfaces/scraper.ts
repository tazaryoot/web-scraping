import { ScrapingParams } from './scraping-params';

export interface Scraper {
  start(params: ScrapingParams): void;
}
