import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// routes
import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";
import jobRoutes from "./routes/job.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

// error middleware
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// global middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(cookieParser());


// routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);

// health route
app.get("/", (req, res) => {
  res.json({ message: "Job Portal API running (ESM)" });
});

// error handler (ALWAYS LAST)
app.use(errorHandler);

export default app;
