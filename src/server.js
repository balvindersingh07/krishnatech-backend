// backend/src/server.js
require("dotenv").config();
const http = require("http");
const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 8080;

async function bootstrap() {
  try {
    await connectDB();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`✅ Backend running on http://localhost:${PORT}`);
    });

    const shutdown = (sig) => {
      console.log(`\n${sig} received. Shutting down...`);
      server.close(() => {
        console.log("✅ Server closed.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("❌ Bootstrap failed:", err?.message || err);
    process.exit(1);
  }
}

bootstrap();