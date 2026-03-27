<template>
  <section class="mx-auto w-full max-w-4xl px-4 pb-14 pt-8">
    <div class="rounded-3xl border border-slate-700/80 bg-slate-900/85 p-6 md:p-8">
      <h2 class="brand-title text-5xl text-orange-400">Admin Panel</h2>
      <p class="mb-6 text-slate-300">Private admin area for publishing movie cards.</p>

      <v-alert v-if="message" :type="messageType" variant="tonal" class="mb-4">{{ message }}</v-alert>

      <v-form v-if="!token" @submit.prevent="handleLogin">
        <div class="grid gap-4 md:grid-cols-2">
          <v-text-field v-model="loginForm.username" label="Admin Username" variant="outlined" required />
          <v-text-field
            v-model="loginForm.password"
            label="Admin Password"
            variant="outlined"
            type="password"
            autocomplete="current-password"
            required
          />
        </div>
        <v-btn :loading="loading" color="primary" type="submit">Secure Login</v-btn>
      </v-form>

      <div v-else>
        <div class="mb-4 flex justify-between gap-3">
          <p class="text-sm text-cyan-300">Authenticated as admin.</p>
          <v-btn size="small" color="error" variant="outlined" @click="logout">Logout</v-btn>
        </div>

        <v-form @submit.prevent="submitMovie">
          <div class="grid gap-4 md:grid-cols-2">
            <v-text-field v-model="movieForm.title" label="Title" variant="outlined" required />
            <v-text-field v-model="movieForm.category" label="Category" variant="outlined" required />
            <v-text-field v-model="movieForm.year" label="Year" type="number" variant="outlined" required />
            <v-text-field v-model="movieForm.rating" label="Rating (e.g. 8.1)" variant="outlined" required />
            <v-text-field v-model="movieForm.quality" label="Quality (1080p, 4K)" variant="outlined" required />
            <v-text-field v-model="movieForm.language" label="Language" variant="outlined" required />
            <v-text-field v-model="movieForm.posterUrl" label="Poster URL" variant="outlined" required />
            <v-text-field v-model="movieForm.downloadUrl" label="Download URL" variant="outlined" required />
          </div>
          <v-textarea v-model="movieForm.description" label="Description" variant="outlined" rows="4" required />
          <v-btn :loading="loading" color="primary" type="submit">Add Movie</v-btn>
        </v-form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { adminLogin, createMovie, verifyAdminSession } from "../api/client";

const token = ref(sessionStorage.getItem("cineverse_admin_token") || "");
const loading = ref(false);
const message = ref("");
const messageType = ref("info");

const loginForm = reactive({
  username: "",
  password: "",
});

const initialMovieForm = () => ({
  title: "",
  description: "",
  category: "",
  year: new Date().getFullYear(),
  rating: "",
  posterUrl: "",
  downloadUrl: "",
  quality: "1080p",
  language: "English",
});

const movieForm = reactive(initialMovieForm());

const setMessage = (type, text) => {
  messageType.value = type;
  message.value = text;
};

const resetMovieForm = () => {
  Object.assign(movieForm, initialMovieForm());
};

const logout = () => {
  token.value = "";
  sessionStorage.removeItem("cineverse_admin_token");
  setMessage("info", "Logged out.");
};

const validateStoredSession = async () => {
  if (!token.value) return;
  try {
    await verifyAdminSession(token.value);
  } catch {
    logout();
  }
};

const handleLogin = async () => {
  loading.value = true;
  try {
    const data = await adminLogin(loginForm);
    token.value = data.token;
    sessionStorage.setItem("cineverse_admin_token", token.value);
    loginForm.password = "";
    setMessage("success", "Admin access granted.");
  } catch (err) {
    setMessage("error", err.message);
  } finally {
    loading.value = false;
  }
};

const submitMovie = async () => {
  loading.value = true;
  try {
    await createMovie(
      {
        ...movieForm,
        year: Number(movieForm.year),
      },
      token.value,
    );
    setMessage("success", "Movie added successfully.");
    resetMovieForm();
  } catch (err) {
    if (/unauthorized/i.test(err.message)) {
      logout();
      setMessage("error", "Session expired. Please login again.");
    } else {
      setMessage("error", err.message);
    }
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await validateStoredSession();
});
</script>
