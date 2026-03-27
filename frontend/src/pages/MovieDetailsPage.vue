<template>
  <section class="mx-auto w-full max-w-6xl px-4 pb-14 pt-8">
    <v-btn variant="text" color="primary" class="mb-4" @click="goBack">
      <v-icon start icon="mdi-arrow-left" />
      Back
    </v-btn>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

    <div v-if="loading" class="grid gap-6 md:grid-cols-[320px_1fr]">
      <v-skeleton-loader type="image" class="h-[460px] rounded-2xl" />
      <v-skeleton-loader type="article" />
    </div>

    <div
      v-else-if="movie"
      class="grid gap-6 rounded-3xl border border-slate-700/70 bg-slate-900/80 p-5 premium-shadow md:grid-cols-[320px_1fr] md:p-8"
    >
      <v-img
        :src="movie.posterUrl"
        :alt="movie.title"
        cover
        height="470"
        class="rounded-2xl border border-slate-700/60 md:sticky md:top-24"
      />

      <div class="flex flex-col">
        <p class="section-caption">Movie Details</p>
        <h1 class="brand-title mt-1 text-5xl leading-none text-orange-400 md:text-6xl">{{ movie.title }}</h1>

        <div class="mt-4 flex flex-wrap gap-2">
          <v-chip size="small" color="primary" variant="tonal">{{ movie.category }}</v-chip>
          <v-chip size="small" color="secondary" variant="flat">IMDB {{ movie.rating || "N/A" }}</v-chip>
          <v-chip size="small" color="info" variant="tonal">{{ movie.year }}</v-chip>
          <v-chip size="small" color="success" variant="tonal">{{ movie.quality || "HD" }}</v-chip>
          <v-chip size="small" color="warning" variant="tonal">{{ movie.language || "Multi-language" }}</v-chip>
        </div>

        <p class="mt-5 text-base leading-relaxed text-slate-200">{{ movie.description }}</p>

        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <div class="rounded-xl border border-slate-700/60 bg-slate-950/50 p-4">
            <p class="text-xs uppercase tracking-[0.16em] text-cyan-300">Video Quality</p>
            <p class="mt-1 text-sm text-slate-200">{{ movie.quality || "HD" }}</p>
          </div>
          <div class="rounded-xl border border-slate-700/60 bg-slate-950/50 p-4">
            <p class="text-xs uppercase tracking-[0.16em] text-cyan-300">Languages</p>
            <p class="mt-1 text-sm text-slate-200">{{ movie.language || "Multi-language" }}</p>
          </div>
        </div>

        <div class="mt-7 grid gap-3 sm:grid-cols-3">
          <v-btn
            :href="getQualityDownloadUrl('480')"
            target="_blank"
            rel="noopener noreferrer"
            color="secondary"
            variant="outlined"
            size="large"
            class="rounded-xl px-6"
          >
            Download 480p
          </v-btn>
          <v-btn
            :href="getQualityDownloadUrl('720')"
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
            size="large"
            class="rounded-xl px-6"
          >
            Download 720p
          </v-btn>
          <v-btn
            :href="getQualityDownloadUrl('1080')"
            target="_blank"
            rel="noopener noreferrer"
            color="success"
            variant="flat"
            size="large"
            class="rounded-xl px-6"
          >
            Download 1080p
          </v-btn>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchMovieById } from "../api/client";

const route = useRoute();
const router = useRouter();
const movie = ref(null);
const loading = ref(false);
const error = ref("");

const loadMovie = async () => {
  const movieId = String(route.params.id || "").trim();
  if (!movieId) {
    error.value = "Invalid movie id.";
    return;
  }

  loading.value = true;
  error.value = "";
  movie.value = null;
  try {
    movie.value = await fetchMovieById(movieId);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.back();
};

const getQualityDownloadUrl = (quality) => {
  const key = `downloadUrl${quality}`;
  const direct = movie.value?.[key];
  if (direct) return direct;

  const base = String(movie.value?.downloadUrl || "").trim();
  if (!base) return "#";
  try {
    const url = new URL(base);
    url.searchParams.set("quality", `${quality}p`);
    return url.toString();
  } catch {
    return base;
  }
};

watch(
  () => route.params.id,
  async () => {
    await loadMovie();
  },
);

onMounted(async () => {
  await loadMovie();
});
</script>
