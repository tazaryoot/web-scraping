Web Scraping
=============

##Usage
 
```sh
npm start [ options... ]
```
##Options


#####`-s, --selector` 
строка css-селектор, для поиска элементов;
#####`-r, --regex`
регулярное выражения для уточнения поиска
#####`-e, --exporting`
экспорт найденных элементов в csv файл;
  
##Configuration

#####`urlCore`
указывается адрес сайта;
 
#####`urlMap`
указывается адрес карты сайта (не обязательно);

#####`scrapingModulePath`
указывается функция, котрая будет искать требуемой на переданных ей страницах;

#####`excludeURL`
регулярка для фильтра ненужных страниц (не обязательно);

#####`resultPath`
путь, по которому будет сохранен результат (не обязательно);

#####`exportSettings`
экспорт делается бибилотекой [json2csv](https://www.npmjs.com/package/json2csv), поэтому настройки смотреть нужно там
 
 ```json
 const config = {
   urlCore: string,
   urlMap?: string,
   scrapingModulePath: string,
   excludeURL?: regex,
   resultPath?: string,
   exportSettings: object,
 };
 ```
