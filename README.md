Web Scraping
=============

## Usage
 
```sh
npm start [ options... ]
```
## Options


```-s, --selector```
строка css-селектор, для поиска элементов;

```-r, --regex```
регулярное выражения для уточнения поиска

```-e, --exporting```
экспорт найденных элементов в csv файл;

**Пример запроса**

```--selector .zopa,#made_in,#sitemap_cont```
  
## Configuration

##### `urlCore`
указывается адрес сайта;
 
##### `urlMap`
указывается адрес карты сайта (не обязательно);

##### `excludeURL`
регулярка для фильтра ненужных страниц (не обязательно);

##### `resultPath`
путь, по которому будет сохранен результат (не обязательно);

##### `exportSettings`
экспорт делается бибилотекой [json2csv](https://www.npmjs.com/package/json2csv), поэтому настройки смотреть нужно там
 
 ```typescript
 type Config = {
   urlCore: string,
   urlMap?: string,
   excludeURL?: RegExp,
   resultPath?: string,
   exportSettings: object,
 };
 ```
