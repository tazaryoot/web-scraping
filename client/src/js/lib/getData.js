/*jshint esversion: 6 */

export default function getData(url) {
  return fetch(url)
  .then(response => {
    if(response.ok) {
      return response.json();
    }
    throw new Error('Network response was not ok.');
  })
  .catch(error => {
      console.error(`Fetch Error = \n ${error}`);
  });
}
