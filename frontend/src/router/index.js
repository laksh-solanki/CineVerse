import { createRouter, createWebHistory } from "vue-router";

import HomePage from "../pages/HomePage.vue";
import CategoriesPage from "../pages/CategoriesPage.vue";
import AboutPage from "../pages/AboutPage.vue";
import ContactPage from "../pages/ContactPage.vue";
import AdminPage from "../pages/AdminPage.vue";
import MovieDetailsPage from "../pages/MovieDetailsPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: HomePage },
    { path: "/categories", name: "categories", component: CategoriesPage },
    { path: "/movie/:id", name: "movie-details", component: MovieDetailsPage },
    { path: "/about", name: "about", component: AboutPage },
    { path: "/contact", name: "contact", component: ContactPage },
    { path: "/admin-cineverse-control-9271", name: "admin", component: AdminPage },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
