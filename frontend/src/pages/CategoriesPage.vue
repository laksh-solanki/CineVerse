<template>
  <section class="mx-auto w-full max-w-7xl px-4 pb-14 pt-8">
    <div class="glass-panel premium-shadow rounded-3xl p-6 md:p-8">
      <p class="section-caption">Genre Library</p>
      <h2 class="brand-title mt-2 text-5xl leading-none text-orange-400 md:text-6xl">Categories</h2>
      <p class="mt-3 max-w-3xl text-slate-200">
        Switch genres and instantly browse matching cards. Click any card to open full details and download options.
      </p>

      <div class="mt-5 flex flex-wrap gap-2">
        <v-chip
          v-for="category in categories"
          :key="category"
          :color="selectedCategory === category ? 'primary' : 'default'"
          :variant="selectedCategory === category ? 'flat' : 'outlined'"
          @click="selectCategory(category)"
        >
          {{ category }}
        </v-chip>
      </div>
    </div>

    <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-cyan-300">Selected Genre</p>
        <h3 class="text-2xl font-semibold text-slate-100">{{ selectedCategory || "None" }}</h3>
      </div>
      <p class="text-sm text-slate-300">Page {{ page }} of {{ pagination.totalPages || 1 }}</p>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4 mt-4">{{ error }}</v-alert>

    <div v-if="loading" class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <v-skeleton-loader v-for="i in 8" :key="i" type="card" />
    </div>

    <div v-else-if="movies.length" class="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <MovieCard v-for="movie in movies" :key="movie.id" :movie="movie" @open="openMovieDetails" />
    </div>

    <v-alert v-else class="mt-4" type="info" variant="tonal">No movies available in this category.</v-alert>

    <div class="mt-8 flex justify-center">
      <v-pagination
        v-model="page"
        :length="pagination.totalPages || 1"
        color="primary"
        rounded="circle"
        @update:model-value="loadByPage"
      />
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { fetchCategories, fetchMovies } from "../api/client";
import MovieCard from "../components/MovieCard.vue";

const router = useRouter();
const categories = ref([]);
const selectedCategory = ref("");
const movies = ref([]);
const loading = ref(false);
const error = ref("");
const page = ref(1);
const pagination = ref({ totalPages: 1 });

const selectCategory = async (category) => {
  selectedCategory.value = String(category || "").trim();
  page.value = 1;
  await loadMovies();
};

const loadByPage = async (currentPage) => {
  page.value = currentPage;
  await loadMovies();
};

const loadMovies = async () => {
  if (!selectedCategory.value) {
    movies.value = [];
    return;
  }
  loading.value = true;
  error.value = "";
  try {
    const data = await fetchMovies({
      category: selectedCategory.value,
      page: page.value,
      limit: 8,
    });
    movies.value = data.movies || [];
    pagination.value = data.pagination || pagination.value;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const openMovieDetails = async (movieId) => {
  if (!movieId) return;
  await router.push({ name: "movie-details", params: { id: movieId } });
};

onMounted(async () => {
  try {
    const fetchedCategories = await fetchCategories();
    categories.value = fetchedCategories.map((value) => String(value || "").trim()).filter(Boolean);
    selectedCategory.value = categories.value[0] || "";
    await loadMovies();
  } catch (err) {
    error.value = err.message;
  }
});
</script>
