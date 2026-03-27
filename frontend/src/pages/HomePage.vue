<template>
  <section class="mx-auto w-full max-w-7xl px-4 pb-14 pt-8">
    <div class="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
      <div class="glass-panel premium-shadow fade-in-up rounded-3xl p-6 md:p-9">
        <p class="section-caption">Cinematic Premium Hub</p>
        <h2 class="brand-title mt-2 text-5xl leading-none text-orange-400 sm:text-6xl md:text-7xl">
          Download Blockbusters In Style
        </h2>
        <p class="mt-4 max-w-2xl text-base leading-relaxed text-slate-200 md:text-lg">
          Discover quality movie cards, rich detail pages, and fast downloads in one polished experience built for
          film lovers.
        </p>

        <div class="mt-6 flex flex-wrap gap-3">
          <v-btn color="primary" size="large" class="rounded-xl px-6" @click="scrollToMovies">
            Explore Movies
          </v-btn>
          <v-btn to="/categories" variant="outlined" size="large" class="rounded-xl px-6 text-slate-100">
            Browse Genres
          </v-btn>
        </div>

        <div class="mt-8 grid gap-3 sm:grid-cols-3">
          <div class="kpi-tile">
            <p class="kpi-value">{{ pagination.total || 0 }}+</p>
            <p class="kpi-label">Movies Listed</p>
          </div>
          <div class="kpi-tile">
            <p class="kpi-value">{{ categories.length }}</p>
            <p class="kpi-label">Categories</p>
          </div>
          <div class="kpi-tile">
            <p class="kpi-value">24/7</p>
            <p class="kpi-label">Availability</p>
          </div>
        </div>
      </div>

      <div class="grid gap-3">
        <div
          v-for="(item, index) in spotlightMovies"
          :key="item.id || index"
          class="glass-panel rounded-2xl p-4 transition duration-300 hover:border-orange-400/60"
        >
          <p class="text-xs uppercase tracking-[0.18em] text-cyan-300">Spotlight {{ index + 1 }}</p>
          <h3 class="mt-1 line-clamp-2 text-base font-semibold text-slate-100">{{ item.title }}</h3>
          <p class="mt-1 line-clamp-2 text-sm text-slate-300">{{ item.description }}</p>
          <div class="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>{{ item.category }}</span>
            <span>{{ item.year }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 rounded-3xl border border-slate-700/70 bg-slate-900/70 p-5 md:p-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="section-caption">Quick Filters</p>
          <h3 class="section-title mt-1">Find Your Mood In Seconds</h3>
        </div>
        <p class="text-sm text-slate-300">Showing page {{ currentPage }} of {{ pagination.totalPages || 1 }}</p>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <v-chip
          :color="activeCategory ? 'default' : 'primary'"
          :variant="activeCategory ? 'outlined' : 'flat'"
          @click="setCategory('')"
        >
          All
        </v-chip>
        <v-chip
          v-for="category in categories"
          :key="category"
          :color="activeCategory === category ? 'primary' : 'default'"
          :variant="activeCategory === category ? 'flat' : 'outlined'"
          @click="setCategory(category)"
        >
          {{ category }}
        </v-chip>
      </div>
    </div>

    <div class="mt-8" id="movies-grid">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h3 class="section-title">Latest Drops</h3>
        <p class="text-sm text-slate-400">Click any card to open full details and download options.</p>
      </div>

      <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

      <div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <v-skeleton-loader v-for="i in 8" :key="i" type="card" class="rounded-2xl" />
      </div>

      <div v-else-if="movies.length" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MovieCard
          v-for="movie in movies"
          :key="movie.id"
          :movie="movie"
          :show-download-button="false"
          @open="openMovieDetails"
        />
      </div>

      <v-alert v-else type="info" variant="tonal">No movies found for this filter.</v-alert>

      <div class="mt-8 flex justify-center">
        <v-pagination
          :model-value="currentPage"
          :length="pagination.totalPages || 1"
          rounded="circle"
          color="primary"
          @update:model-value="onPageChange"
        />
      </div>
    </div>

    <div class="mt-12 grid gap-4 lg:grid-cols-3">
      <div
        v-for="panel in premiumPanels"
        :key="panel.title"
        class="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-5 md:p-6"
      >
        <p class="text-xs uppercase tracking-[0.2em] text-cyan-300">{{ panel.kicker }}</p>
        <h4 class="mt-2 text-xl font-semibold text-slate-100">{{ panel.title }}</h4>
        <p class="mt-2 text-sm leading-relaxed text-slate-300">{{ panel.description }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchCategories, fetchMovies } from "../api/client";
import MovieCard from "../components/MovieCard.vue";

const route = useRoute();
const router = useRouter();
const movies = ref([]);
const categories = ref([]);
const loading = ref(false);
const error = ref("");
const pagination = ref({ total: 0, page: 1, limit: 8, totalPages: 1 });

const premiumPanels = [
  {
    kicker: "Curated Picks",
    title: "Weekend Marathon Packs",
    description: "Action, thriller, drama, and sci-fi picks arranged for binge sessions with one-click discovery.",
  },
  {
    kicker: "Fast Discovery",
    title: "Search-First Experience",
    description: "Type movie name or genre and jump straight into cards with clear quality and language tags.",
  },
  {
    kicker: "Premium Layout",
    title: "Designed For Mobile + Desktop",
    description: "Balanced spacing, clear typography, and responsive content blocks tuned for every screen size.",
  },
];

const currentPage = computed(() => Number(route.query.page || 1));
const activeSearch = computed(() => route.query.q || "");
const activeCategory = computed(() => route.query.category || "");
const spotlightMovies = computed(() => movies.value.slice(0, 3));

const loadMovies = async () => {
  loading.value = true;
  error.value = "";
  try {
    const data = await fetchMovies({
      page: currentPage.value,
      limit: 8,
      search: activeSearch.value || undefined,
      category: activeCategory.value || undefined,
    });
    movies.value = data.movies || [];
    pagination.value = data.pagination || pagination.value;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const loadCategories = async () => {
  try {
    categories.value = await fetchCategories();
  } catch (err) {
    error.value = err.message;
  }
};

const onPageChange = async (newPage) => {
  await router.push({
    path: "/",
    query: {
      ...route.query,
      page: newPage,
    },
  });
};

const setCategory = async (category) => {
  const query = {
    ...route.query,
    page: 1,
  };
  if (category) {
    query.category = category;
  } else {
    delete query.category;
  }
  await router.push({ path: "/", query });
};

const openMovieDetails = async (movieId) => {
  if (!movieId) return;
  await router.push({ name: "movie-details", params: { id: movieId } });
};

const scrollToMovies = () => {
  const target = document.getElementById("movies-grid");
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

watch(
  () => route.query,
  async () => {
    await loadMovies();
  },
);

onMounted(async () => {
  await Promise.all([loadMovies(), loadCategories()]);
});
</script>
