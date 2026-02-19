import express from "express";
import {
  getAdminStats,
  getEmployerStats,
  getJobseekerStats,
} from "../controllers/dashboard.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/admin",
  protect,
  authorizeRoles("superadmin"),
  getAdminStats
);

router.get(
  "/employer",
  protect,
  authorizeRoles("employer"),
  getEmployerStats
);

router.get(
  "/jobseeker",
  protect,
  authorizeRoles("jobseeker"),
  getJobseekerStats
);

export default router;
