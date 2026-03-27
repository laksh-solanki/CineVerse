<template>
  <v-card
    class="group relative h-full cursor-pointer overflow-hidden rounded-3xl border border-slate-700/70 bg-slate-900/80 transition duration-300 hover:-translate-y-1 hover:border-orange-400/70 premium-shadow"
    @click="openDetails"
  >
    <v-img :src="movie.posterUrl" :alt="movie.title" cover height="290" class="rounded-b-none">
      <div class="absolute inset-x-0 top-0 flex items-center justify-between p-3">
        <v-chip size="small" color="secondary" variant="flat">IMDB {{ movie.rating || "N/A" }}</v-chip>
        <v-chip size="small" color="primary" variant="tonal">{{ movie.quality || "HD" }}</v-chip>
      </div>
      <div class="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/95 to-transparent" />
    </v-img>

    <v-card-text class="flex h-[228px] flex-col gap-3 p-4 md:p-5">
      <div>
        <h3 class="line-clamp-2 text-lg font-semibold text-slate-100">{{ movie.title }}</h3>
        <p class="mt-1 text-xs uppercase tracking-[0.16em] text-cyan-300">{{ movie.category }} • {{ movie.year }}</p>
      </div>

      <p class="line-clamp-3 text-sm leading-relaxed text-slate-300">{{ movie.description }}</p>

      <div class="mt-auto flex items-center justify-between gap-2">
        <p class="line-clamp-1 text-xs uppercase tracking-[0.14em] text-slate-400">{{ movie.language || "Multi-language" }}</p>
        <v-btn
          v-if="showDownloadButton"
          :href="movie.downloadUrl"
          target="_blank"
          rel="noopener noreferrer"
          size="small"
          color="primary"
          variant="flat"
          class="rounded-xl"
          @click.stop
        >
          Download
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
const props = defineProps({
  movie: {
    type: Object,
    required: true,
  },
  showDownloadButton: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["open"]);

const openDetails = () => {
  emit("open", props.movie.id);
};
</script>
