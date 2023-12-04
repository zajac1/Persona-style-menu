export default function () {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  HTMLElement.prototype.on = function (...args) {
    this.addEventListener(...args);
    return this;
  };
  HTMLElement.prototype.off = function (...args) {
    this.removeEventListener(...args);
    return this;
  };
  HTMLElement.prototype.$ = $;
  HTMLElement.prototype.$$ = $$;

  return { $, $$ };
}
