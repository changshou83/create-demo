// import { getURLHash } from './ts/helpers';
// import { Store } from './ts/store';

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

const app = document.querySelector('#app') as HTMLElement;
app.innerHTML = `
  <h1>Hello TypeScript!</h1>
`;
