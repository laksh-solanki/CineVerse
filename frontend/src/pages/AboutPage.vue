<template>
  <section class="mx-auto w-full max-w-6xl px-4 pb-14 pt-8">
    <div class="glass-panel premium-shadow rounded-3xl p-7 md:p-10">
      <p class="section-caption">About Cineverse</p>
      <h2 class="brand-title mt-2 text-5xl leading-none text-orange-400 md:text-6xl">Cinema Without Clutter</h2>
      <p class="mt-4 max-w-3xl text-base leading-relaxed text-slate-200 md:text-lg">
        Cineverse is built to feel premium while staying simple: clean movie cards, direct detail pages, smart filtering,
        and fast access to download links.
      </p>
    </div>

    <div class="mt-7 grid gap-4 md:grid-cols-3">
      <div class="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-5">
        <p class="text-xs uppercase tracking-[0.18em] text-cyan-300">Experience</p>
        <h3 class="mt-2 text-xl font-semibold text-slate-100">Premium Interface</h3>
        <p class="mt-2 text-sm leading-relaxed text-slate-300">
          Bold typography, cinematic surfaces, and focused content blocks designed for movie-first navigation.
        </p>
      </div>
      <div class="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-5">
        <p class="text-xs uppercase tracking-[0.18em] text-cyan-300">Performance</p>
        <h3 class="mt-2 text-xl font-semibold text-slate-100">Fast Browsing Flow</h3>
        <p class="mt-2 text-sm leading-relaxed text-slate-300">
          Quick search, compact filters, and paginated listing to keep browsing responsive on all screens.
        </p>
      </div>
      <div class="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-5">
        <p class="text-xs uppercase tracking-[0.18em] text-cyan-300">Control</p>
        <h3 class="mt-2 text-xl font-semibold text-slate-100">Private Admin Access</h3>
        <p class="mt-2 text-sm leading-relaxed text-slate-300">
          Protected admin panel allows trusted access for adding movies while keeping public pages login-free.
        </p>
      </div>
    </div>

    <div class="mt-7 rounded-3xl border border-slate-700/70 bg-slate-900/60 p-6 md:p-8">
      <h3 class="text-2xl font-semibold text-slate-100">Stack</h3>
      <div class="mt-4 flex flex-wrap gap-2">
        <v-chip color="primary" variant="tonal">Vue 3</v-chip>
        <v-chip color="secondary" variant="tonal">Vuetify</v-chip>
        <v-chip color="info" variant="tonal">Tailwind CSS</v-chip>
        <v-chip color="success" variant="tonal">Express</v-chip>
        <v-chip color="warning" variant="tonal">MongoDB</v-chip>
      </div>
    </div>
  </section>
</template>
