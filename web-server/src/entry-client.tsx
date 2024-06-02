import { StartClient, mount } from "@solidjs/start/client";
const app = document.getElementById("app");
if (app != null) {
  mount(() => <StartClient />, app);
}
