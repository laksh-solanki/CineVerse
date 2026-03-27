<template>
  <v-app-bar elevation="0" class="border-b border-slate-700/50 bg-slate-950/80 backdrop-blur-lg">
    <div class="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 md:gap-4">
      <RouterLink to="/" class="group flex items-center gap-2 no-underline">
        <span class="brand-title text-3xl leading-none text-orange-400 transition group-hover:text-orange-300">Cineverse</span>
        <span class="hidden rounded-full border border-cyan-400/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-300 sm:inline-flex">
          Premium
        </span>
      </RouterLink>

      <nav class="ml-1 hidden items-center gap-1 lg:flex">
        <v-btn
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          variant="text"
          class="rounded-xl px-3 text-capitalize text-slate-100"
        >
          {{ item.label }}
        </v-btn>
      </nav>

      <v-spacer />

      <v-form class="hidden w-full max-w-xs md:block lg:max-w-sm" @submit.prevent="submitSearch">
        <v-text-field
          v-model="searchInput"
          density="comfortable"
          hide-details
          prepend-inner-icon="mdi-magnify"
          placeholder="Search titles, genres..."
          variant="outlined"
          class="cine-search"
        />
      </v-form>

      <v-btn icon="mdi-magnify" variant="text" class="md:hidden" @click="mobileSearchOpen = !mobileSearchOpen" />
      <v-btn icon="mdi-menu" variant="text" class="lg:hidden" @click="drawer = !drawer" />
    </div>
  </v-app-bar>

  <div v-if="mobileSearchOpen" class="border-b border-slate-800/80 bg-slate-950/90 px-4 py-3 md:hidden">
    <v-form @submit.prevent="submitSearch">
      <v-text-field
        v-model="searchInput"
        density="comfortable"
        hide-details
        prepend-inner-icon="mdi-magnify"
        placeholder="Search titles, genres..."
        variant="outlined"
        class="cine-search"
      />
    </v-form>
  </div>

  <v-navigation-drawer v-model="drawer" location="right" temporary class="lg:hidden">
    <v-list density="compact" class="pt-3">
      <v-list-item
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :title="item.label"
        @click="drawer = false"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const drawer = ref(false);
const mobileSearchOpen = ref(false);
const route = useRoute();
const router = useRouter();
const searchInput = ref(route.query.q || "");

const navItems = [
  { label: "Home", to: "/" },
  { label: "Categories", to: "/categories" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

watch(
  () => route.query.q,
  (value) => {
    searchInput.value = value || "";
  },
);

const submitSearch = async () => {
  const q = searchInput.value.trim();
  mobileSearchOpen.value = false;
  await router.push({
    path: "/",
    query: {
      ...(q ? { q } : {}),
      page: 1,
    },
  });
};
</script>

<style scoped>
.cine-search :deep(.v-field) {
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.72);
}

.cine-search :deep(input) {
  color: #f8fafc;
}
</style>
