import { createApp } from "vue";
import router from "./router";
import App from "./App.vue";
import store from "./store";
import ForeksWebSDK from "foreks-sdk/web-sdk";
import { DefinitionLocale } from "foreks-sdk/commons/enums";
import "@/assets/style.css";

// initialize foreks web sdk and register to vue app
(async () => {
  // initialize foreks web sdk
  const foreksWebSDK: ForeksWebSDK = new ForeksWebSDK(
    "", // username
    "", // password
    "foreks", // company
    "server", // resource
    "wss://feed-ws-web.foreks.com/websocket", // wss address you can learn from your sales manager
    "foreks-sdk-example" // your application name
  );
  // initialize foreks web sdk
  await foreksWebSDK.initialize();
  // connect to socket
  await foreksWebSDK.connectToSocket();
  // set fx definitions
  await foreksWebSDK.definition.setDefinitionByDomain(
    "FX",
    DefinitionLocale.BIST
  );

  // create vue app
  const app = createApp(App);
  app.use(store).use(router).mount("#app");

  // register foreks web sdk to vue app
  app.config.globalProperties.$foreksWebSDK = foreksWebSDK;
})().catch((error) => {
  console.error(error);
});

// declare foreks web sdk to vue app
declare module "@vue/runtime-core" {
  export interface ComponentCustomProperties {
    $foreksWebSDK: ForeksWebSDK;
  }
}
