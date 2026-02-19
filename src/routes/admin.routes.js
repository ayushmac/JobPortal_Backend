import express from "express";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllJobs,
  updateAnyJob,
  deleteAnyJob,
  getAllApplications,
} from "../controllers/admin.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(protect, authorizeRoles("superadmin"));

router
  .route("/users")
  .get(getAllUsers)
  .post(createUser);

router
  .route("/users/:id")
  .put(updateUser)
  .delete(deleteUser);

router.get("/jobs", getAllJobs);
router.put("/jobs/:id", updateAnyJob);
router.delete("/jobs/:id", deleteAnyJob);

router.get("/applications", getAllApplications);

export default router;
