const config = {
  urlCore: '',
  urlMap: '',
  scrappingModulePath: '',
  excludeURL: /http|-de|-en|javascript:|\/f\/|mailto:|tel:|\/#/,
  resultPath: './build/client/app/assets/',
  exportSettings: {
    fields: ['page', 'title', { label: 'tag', value: 'tags.name' }, { label: 'text', value: 'tags.list.text' }],
    unwind: ['tags', 'tags.list'],
    delimiter: ';',
  },
};

module.exports = config;
