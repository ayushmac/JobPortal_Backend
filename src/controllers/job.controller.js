import Job from "../models/Job.js";
import { createJobSchema } from "../validators/job.schema.js";

const parsePagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  return { page, limit, skip: (page - 1) * limit };
};

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
    const { page, limit, skip } = parsePagination(req.query);
    const { location, keyword, company, minSalary, maxSalary } = req.query;

    const query = {};

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (company) {
      query.company = { $regex: company, $options: "i" };
    }

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    if (minSalary || maxSalary) {
      query.salary = {};
      if (minSalary) query.salary.$gte = Number(minSalary);
      if (maxSalary) query.salary.$lte = Number(maxSalary);
    }

    const jobs = await Job.find(query)
      .populate("employer", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(query);

    res.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      jobs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET EMPLOYER JOBS (Employer dashboard)
export const getEmployerJobs = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { keyword, location } = req.query;

    const query = { employer: req.user._id };

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { company: { $regex: keyword, $options: "i" } },
      ];
    }

    const jobs = await Job.find(query)
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
