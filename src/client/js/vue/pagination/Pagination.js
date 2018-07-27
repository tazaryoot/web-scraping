/*jshint esversion: 6 */

export default {
    name: 'pagination',
    prop: ['start', 'step'],
    methods: {
      next: function() {
        console.log('next');
      },
      previous: function() {
        console.log('previous');
      }
    }
}
