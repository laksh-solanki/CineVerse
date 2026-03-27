<template>
  <v-app>
    <div class="app-bg min-h-screen">
      <AppHeader />
      <v-main>
        <router-view />
      </v-main>
      <SiteFooter />
    </div>
  </v-app>
</template>

<script setup>
import AppHeader from "./components/AppHeader.vue";
import SiteFooter from "./components/SiteFooter.vue";
</script>
