import express from "express";
import {
  applyJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus,
} from "../controllers/application.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { uploadResume } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post(
  "/apply/:jobId",
  protect,
  authorizeRoles("jobseeker"),
  uploadResume.single("resume"),
  applyJob
);

router.get(
  "/my",
  protect,
  authorizeRoles("jobseeker"),
  getMyApplications
);

router.get(
  "/job/:jobId",
  protect,
  authorizeRoles("employer"),
  getApplicantsForJob
);

router.put(
  "/:id/status",
  protect,
  authorizeRoles("employer"),
  updateApplicationStatus
);

export default router;
