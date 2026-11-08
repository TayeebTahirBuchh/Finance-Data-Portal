
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import session from "express-session";
import MongoStore from "connect-mongo";

import authRoutes from "./routes/auth.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js";

const app = express();

const mongoUri = process.env.MONGODB_URI;
const sessionSecret = process.env.SESSION_SECRET;
const isProduction = process.env.NODE_ENV === "production";

if (!mongoUri) {
  throw new Error("MONGODB_URI is not configured");
}

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error("SESSION_SECRET must contain at least 32 characters");
}

if (isProduction) {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN
      ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
      : false,
    credentials: true,
  })
);

app.use(express.json({ limit: "100kb" }));

app.use(
  session({
    name: "fdp.sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
    mongoUrl: mongoUri,
    collectionName: "sessions",
    ttl: 7 * 24 * 60 * 60,
}),
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "finance-data-portal-api",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);

app.use((_req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});
app.use("/api/workspaces", workspaceRoutes);

export default app;
