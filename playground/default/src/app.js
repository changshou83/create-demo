// import { getURLHash } from './js/helpers.js';
// import { Store } from './js/store.js';

// const Data = new Store('data-storage');

// const App = {
//   $: {}, // 存放DOM元素
//   urlHash: getURLHash(),
//   init() {
//     Data.addEventListener('save', App.render);
//     window.addEventListener('hashchange', () => {
//       App.urlHash = getURLHash();
//       App.render();
//     });
//     App.render();
//   },
//   render() {},
// };

// App.init();

document.querySelector('#app').innerHTML = `
  <h1>Hello JavaScript!</h1>
`;
