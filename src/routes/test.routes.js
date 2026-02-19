import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/protected", protect, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});

router.get(
  "/admin-only",
  protect,
  authorizeRoles("superadmin"),
  (req, res) => {
    res.json({ message: "Welcome Super Admin" });
  }
);

export default router;
