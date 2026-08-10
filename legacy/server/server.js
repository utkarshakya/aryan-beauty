import express from "express";
import cors from "cors";
import config from "./config/env.js";
import { connectMongoDB, connectRedis } from "./config/db.js";
import {
  authRoutes,
  serviceRoutes,
  appointmentRoutes,
  paymentRoutes,
  notificationRoutes,
} from "./routes/index.js";
import rateLimiter from "./middlewares/rateLimiter.js";

// Initialize Express
const app = express();

// Middleware

app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/notification", notificationRoutes);

// Test route
app.get("/", (req, res) => {
  res.status(200).send("Beauty Is Applied");
});

// Connect to Database and Start a Server
(async () => {
  try {
    await Promise.all([connectMongoDB(), connectRedis()]);
    app.listen(config.port || 3000, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
})();
