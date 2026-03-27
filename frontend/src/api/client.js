import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
});

const mapError = (error, fallback) =>
  error?.response?.data?.error || error?.message || fallback;

export const fetchMovies = async (params = {}) => {
  try {
    const { data } = await api.get("/movies", { params });
    return data;
  } catch (error) {
    throw new Error(mapError(error, "Unable to fetch movies."));
  }
};

export const fetchMovieById = async (id) => {
  try {
    const { data } = await api.get(`/movies/${id}`);
    return data.movie;
  } catch (error) {
    throw new Error(mapError(error, "Unable to fetch movie details."));
  }
};

export const fetchCategories = async () => {
  try {
    const { data } = await api.get("/categories");
    return data.categories || [];
  } catch (error) {
    throw new Error(mapError(error, "Unable to fetch categories."));
  }
};

export const adminLogin = async (payload) => {
  try {
    const { data } = await api.post("/admin/login", payload);
    return data;
  } catch (error) {
    throw new Error(mapError(error, "Login failed."));
  }
};

export const verifyAdminSession = async (token) => {
  try {
    const { data } = await api.get("/admin/session", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    throw new Error(mapError(error, "Session expired."));
  }
};

export const createMovie = async (payload, token) => {
  try {
    const { data } = await api.post("/admin/movies", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    throw new Error(mapError(error, "Unable to create movie."));
  }
};

export default api;
