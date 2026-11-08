

import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";

const port = Number(process.env.PORT ?? 4000);

async function startServer(): Promise<void> {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid TCP port");
  }

  await connectDatabase();

  const server = app.listen(port, () => {
    console.log(
      `Finance Data Portal API listening on port ${port}`
    );
  });

  const shutdown = (signal: string) => {
    console.log(`${signal} received. Shutting down...`);

    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startServer().catch((error: unknown) => {
  console.error("Failed to start Finance Data Portal API:", error);
  process.exitCode = 1;
});
