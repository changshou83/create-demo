export const addEvent = (
  el: HTMLElement,
  selector: string,
  event: string,
  handler: (e: Event) => void
) => {
  el.querySelector(selector).addEventListener(event, e => handler(e));
};

export const getURLHash = () => document.location.hash.replace(/^#\//, '');
