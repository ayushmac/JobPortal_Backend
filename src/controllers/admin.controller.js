import bcrypt from "bcrypt";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

const parsePagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  return { page, limit, skip: (page - 1) * limit };
};

// GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { role, keyword } = req.query;

    const query = {};

    if (role) query.role = role;

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE USER
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "name, email, password and role are required" });
    }

    if (!["employer", "jobseeker", "superadmin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json(safeUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });

      if (existing) {
        return res.status(400).json({ message: "Email already exists" });
      }

      user.email = email;
    }

    if (name) user.name = name;

    if (role) {
      if (!["employer", "jobseeker", "superadmin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      user.role = role;
    }

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL JOBS
export const getAllJobs = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { location, keyword, employerId } = req.query;

    const query = {};

    if (location) query.location = { $regex: location, $options: "i" };
    if (employerId) query.employer = employerId;

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { company: { $regex: keyword, $options: "i" } },
      ];
    }

    const jobs = await Job.find(query)
      .populate("employer", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(query);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      jobs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE ANY JOB
export const updateAnyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const allowedFields = ["title", "description", "company", "location", "salary"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE ANY JOB
export const deleteAnyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    await job.deleteOne();

    res.json({ message: "Job deleted by admin" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL APPLICATIONS
export const getAllApplications = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status, jobId, applicantId } = req.query;

    const query = {};

    if (status) query.status = status;
    if (jobId) query.job = jobId;
    if (applicantId) query.applicant = applicantId;

    const applications = await Application.find(query)
      .populate("job", "title company")
      .populate("applicant", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(query);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      applications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
