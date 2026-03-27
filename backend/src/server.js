import "dotenv/config";
import crypto from "node:crypto";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { MongoClient, ObjectId } from "mongodb";

const app = express();

const PORT = Number(process.env.PORT || 4000);
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL || "";
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || "cineverse";
const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION || "movies";
const ADMIN_USERNAME = String(process.env.ADMIN_USERNAME || "").trim();
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || "");
const ADMIN_TOKEN_SECRET = String(process.env.ADMIN_TOKEN_SECRET || "");
const TOKEN_TTL_MS = 1000 * 60 * 60 * 8;

if (!MONGODB_URI.startsWith("mongodb://") && !MONGODB_URI.startsWith("mongodb+srv://")) {
  throw new Error("Missing valid MongoDB URI. Set MONGODB_URI (or MONGODB_URL) in backend/.env");
}
if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
  throw new Error("Missing admin credentials. Set ADMIN_USERNAME and ADMIN_PASSWORD in backend/.env");
}
if (ADMIN_TOKEN_SECRET.length < 16) {
  throw new Error("ADMIN_TOKEN_SECRET is required and must be at least 16 characters.");
}

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Blocked by CORS policy."));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "100kb" }));

const client = new MongoClient(MONGODB_URI);
let moviesCollection;

const loginAttempts = new Map();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeMovie = (movie) => ({
  id: String(movie._id),
  title: movie.title || "",
  description: movie.description || "",
  category: movie.category || "General",
  year: movie.year || "",
  rating: movie.rating || "",
  posterUrl: movie.posterUrl || "",
  downloadUrl: movie.downloadUrl || "",
  quality: movie.quality || "HD",
  language: movie.language || "Multi-language",
  createdAt: movie.createdAt || "",
});

const buildMovieFilter = (search, category) => {
  const filter = {};
  if (search) {
    const regex = escapeRegex(search);
    filter.$or = [
      { title: { $regex: regex, $options: "i" } },
      { description: { $regex: regex, $options: "i" } },
    ];
  }
  if (category) {
    filter.category = { $regex: `^${escapeRegex(category)}$`, $options: "i" };
  }
  return filter;
};

const safeCompare = (a, b) => {
  const aBuffer = Buffer.from(String(a), "utf8");
  const bBuffer = Buffer.from(String(b), "utf8");
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
};

const base64UrlEncode = (value) => Buffer.from(value).toString("base64url");
const base64UrlDecode = (value) => Buffer.from(value, "base64url").toString("utf8");

const signTokenPart = (encodedPayload) =>
  crypto.createHmac("sha256", ADMIN_TOKEN_SECRET).update(encodedPayload).digest("base64url");

const createAdminToken = (username) => {
  const payload = {
    sub: username,
    role: "admin",
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signTokenPart(encodedPayload);
  return `${encodedPayload}.${signature}`;
};

const verifyAdminToken = (token) => {
  try {
    const [encodedPayload, signature] = String(token || "").split(".");
    if (!encodedPayload || !signature) return null;

    const expectedSignature = signTokenPart(encodedPayload);
    if (!safeCompare(signature, expectedSignature)) return null;

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload || payload.role !== "admin" || !payload.exp || Date.now() > Number(payload.exp)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

const getRequestIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || "unknown";
};

const checkLoginRateLimit = (ip) => {
  const now = Date.now();
  const maxAttempts = 5;
  const windowMs = 15 * 60 * 1000;
  const record = loginAttempts.get(ip);
  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 0, resetAt: now + windowMs });
    return null;
  }
  if (record.count >= maxAttempts) {
    return Math.ceil((record.resetAt - now) / 1000);
  }
  return null;
};

const registerFailedLogin = (ip) => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const record = loginAttempts.get(ip);
  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + windowMs });
    return;
  }
  record.count += 1;
};

const clearLoginRateLimit = (ip) => {
  loginAttempts.delete(ip);
};

const validateMoviePayload = (payload) => {
  const title = String(payload.title || "").trim();
  const description = String(payload.description || "").trim();
  const category = String(payload.category || "").trim();
  const rating = String(payload.rating || "").trim();
  const quality = String(payload.quality || "HD").trim() || "HD";
  const language = String(payload.language || "Multi-language").trim() || "Multi-language";
  const year = Number(payload.year);

  if (!title || title.length > 140) throw new Error("Invalid title.");
  if (!description || description.length > 1200) throw new Error("Invalid description.");
  if (!category || category.length > 80) throw new Error("Invalid category.");
  if (!rating || rating.length > 10) throw new Error("Invalid rating.");
  if (!Number.isInteger(year) || year < 1900 || year > 2100) throw new Error("Invalid year.");

  let posterUrl;
  let downloadUrl;
  try {
    posterUrl = new URL(String(payload.posterUrl || "").trim()).toString();
    downloadUrl = new URL(String(payload.downloadUrl || "").trim()).toString();
  } catch {
    throw new Error("Poster URL and download URL must be valid.");
  }

  if (!/^https?:\/\//i.test(posterUrl) || !/^https?:\/\//i.test(downloadUrl)) {
    throw new Error("Only http/https URLs are allowed.");
  }

  return {
    title,
    description,
    category,
    year,
    rating,
    posterUrl,
    downloadUrl,
    quality,
    language,
    createdAt: new Date().toISOString(),
  };
};

const requireAdmin = (req, res, next) => {
  const authHeader = String(req.headers.authorization || "");
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const payload = verifyAdminToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Unauthorized access." });
  }
  req.admin = payload;
  return next();
};

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "cineverse-api",
    mode: "public-fetch + private-admin",
    date: new Date().toISOString(),
  });
});

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "Cineverse backend is running.",
    endpoints: ["/api/health", "/api/movies", "/api/movies/:id", "/api/categories", "/api/admin/login", "/api/admin/movies"],
  });
});

app.post("/api/admin/login", (req, res) => {
  const ip = getRequestIp(req);
  const retryAfter = checkLoginRateLimit(ip);
  if (retryAfter) {
    return res.status(429).json({ error: `Too many login attempts. Try again in ${retryAfter}s.` });
  }

  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");

  const valid =
    safeCompare(username.toLowerCase(), ADMIN_USERNAME.toLowerCase()) && safeCompare(password, ADMIN_PASSWORD);

  if (!valid) {
    registerFailedLogin(ip);
    return res.status(401).json({ error: "Invalid admin credentials." });
  }

  clearLoginRateLimit(ip);
  const token = createAdminToken(ADMIN_USERNAME);
  res.setHeader("Cache-Control", "no-store");
  return res.json({
    token,
    expiresIn: Math.floor(TOKEN_TTL_MS / 1000),
  });
});

app.get("/api/admin/session", requireAdmin, (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/admin/movies", requireAdmin, async (req, res, next) => {
  try {
    const movie = validateMoviePayload(req.body || {});
    const result = await moviesCollection.insertOne(movie);
    res.status(201).json({
      movie: normalizeMovie({
        _id: result.insertedId,
        ...movie,
      }),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/movies", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(24, Math.max(1, Number(req.query.limit || 8)));
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();
    const skip = (page - 1) * limit;

    const filter = buildMovieFilter(search, category);
    const [total, docs] = await Promise.all([
      moviesCollection.countDocuments(filter),
      moviesCollection
        .find(filter, {
          projection: {
            title: 1,
            description: 1,
            category: 1,
            year: 1,
            rating: 1,
            posterUrl: 1,
            downloadUrl: 1,
            quality: 1,
            language: 1,
            createdAt: 1,
          },
        })
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
    ]);

    res.json({
      movies: docs.map(normalizeMovie),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/movies/:id", async (req, res, next) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid movie id." });
    }

    const movie = await moviesCollection.findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          title: 1,
          description: 1,
          category: 1,
          year: 1,
          rating: 1,
          posterUrl: 1,
          downloadUrl: 1,
          quality: 1,
          language: 1,
          createdAt: 1,
        },
      },
    );

    if (!movie) {
      return res.status(404).json({ error: "Movie not found." });
    }

    return res.json({ movie: normalizeMovie(movie) });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/categories", async (_req, res, next) => {
  try {
    const rawCategories = await moviesCollection.distinct("category", {
      category: { $exists: true, $type: "string", $ne: "" },
    });
    const categories = [...new Set(rawCategories.map((value) => String(value).trim()).filter(Boolean))];
    categories.sort((a, b) => a.localeCompare(b));
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.use((error, _req, res, _next) => {
  const isCors = error.message === "Blocked by CORS policy.";
  const isValidation = /invalid|must|required/i.test(error.message || "");
  const statusCode = isCors ? 403 : isValidation ? 400 : 500;

  res.status(statusCode).json({
    error: isCors
      ? error.message
      : statusCode === 400
        ? error.message
        : "Server error while processing request.",
  });
});

const start = async () => {
  await client.connect();
  moviesCollection = client.db(MONGODB_DATABASE).collection(MONGODB_COLLECTION);
  app.listen(PORT, () => {
    console.log(`Cineverse API running on http://127.0.0.1:${PORT}`);
  });
};

start().catch((error) => {
  console.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});
