import express from "express";
import {
  createJob,
  getJobs,
  getEmployerJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/job.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", getJobs);
router.get("/mine", protect, authorizeRoles("employer"), getEmployerJobs);
router.get("/:id", getJobById);

router.post("/", protect, authorizeRoles("employer"), createJob);
router.put("/:id", protect, authorizeRoles("employer"), updateJob);
router.delete("/:id", protect, deleteJob);

export default router;
