<template>
  <footer class="mt-12 border-t border-slate-800/80 bg-slate-950/80 px-4 py-10 text-slate-300">
    <div class="mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
      <div>
        <p class="brand-title text-4xl leading-none text-orange-400">Cineverse</p>
        <p class="mt-3 max-w-md text-sm text-slate-300">
          Premium-style movie browsing experience with fast search, curated genres, and direct detail pages.
        </p>
      </div>

      <div>
        <p class="text-xs uppercase tracking-[0.25em] text-cyan-300">Navigation</p>
        <div class="mt-3 flex flex-col gap-2 text-sm">
          <RouterLink to="/" class="text-slate-300 no-underline hover:text-orange-300">Home</RouterLink>
          <RouterLink to="/categories" class="text-slate-300 no-underline hover:text-orange-300">Categories</RouterLink>
          <RouterLink to="/about" class="text-slate-300 no-underline hover:text-orange-300">About</RouterLink>
          <RouterLink to="/contact" class="text-slate-300 no-underline hover:text-orange-300">Contact</RouterLink>
        </div>
      </div>

      <div>
        <p class="text-xs uppercase tracking-[0.25em] text-cyan-300">Support</p>
        <p class="mt-3 text-sm text-slate-300">support@cineverse.site</p>
        <p class="text-sm text-slate-400">@cineverse_support</p>
      </div>
    </div>

    <div class="mx-auto mt-8 w-full max-w-7xl border-t border-slate-800/90 pt-4 text-xs text-slate-500">
      Cineverse 2026. Built with Vue, Vuetify, Tailwind, Node, and MongoDB.
    </div>
  </footer>
</template>
