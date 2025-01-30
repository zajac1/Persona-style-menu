import App from "./components/App.svelte";
import { mount } from "svelte";

const app = mount(App, {
  target: document.querySelector("#app"),
});

export default app;
