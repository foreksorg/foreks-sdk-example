import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/live-socket-test",
    name: "live-socket-test",
    component: () => import("../views/LiveSocketTest.vue"),
  },
  {
    path: "/economic-calendar",
    name: "economic-calendar",
    component: () => import("../views/EconomicCalendar.vue"),
  },
  {
    path: "/news",
    name: "news",
    component: () => import("../views/News.vue"),
  },
  {
    path: "/symbol-list",
    name: "symbol-list",
    component: () => import("../views/SymbolList.vue"),
  },
  {
    path: "/symbol-detail/:id",
    name: "symbol-detail",
    component: () => import("../views/SymbolDetail.vue"),
  },
  {
    path: "/indicator",
    name: "indicator",
    component: () => import("../views/Indicator.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
