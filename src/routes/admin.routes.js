import express from "express";
import {
  getAllUsers,
  deleteUser,
  getAllJobs,
  deleteAnyJob,
  getAllApplications,
} from "../controllers/admin.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(protect, authorizeRoles("superadmin"));

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

router.get("/jobs", getAllJobs);
router.delete("/jobs/:id", deleteAnyJob);

router.get("/applications", getAllApplications);

export default router;
