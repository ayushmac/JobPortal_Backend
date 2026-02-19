import Job from "../models/Job.js";
import { createJobSchema } from "../validators/job.schema.js";


// CREATE JOB (Employer only)
export const createJob = async (req, res) => {
  try {
    const parsed = createJobSchema.parse(req.body);

    const job = await Job.create({
      ...parsed,
      employer: req.user._id,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// GET ALL JOBS (Public with pagination + filtering)
export const getJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, location, keyword } = req.query;

    const query = {};

    if (location) {
      query.location = location;
    }

    if (keyword) {
      query.title = { $regex: keyword, $options: "i" };
    }

    const jobs = await Job.find(query)
      .populate("employer", "name email")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      jobs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET SINGLE JOB
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "employer",
      "name email"
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// UPDATE JOB (Owner only)
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(job, req.body);

    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// DELETE JOB (Owner or Superadmin)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (
      job.employer.toString() !== req.user._id.toString() &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await job.deleteOne();

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
