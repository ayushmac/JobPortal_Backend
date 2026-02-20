import Application from "../models/Application.js";
import Job from "../models/Job.js";
import mongoose from "mongoose";

const parsePagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  return { page, limit, skip: (page - 1) * limit };
};

// APPLY FOR JOB (Jobseeker only)
export const applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });

    if (existingApplication) {
      return res.status(400).json({ message: "Already applied for this job" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Resume is required" });
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      resume: `/uploads/resumes/${req.file.filename}`,
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY APPLICATIONS (Jobseeker)
export const getMyApplications = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status, keyword } = req.query;

    const query = { applicant: req.user._id };

    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate({
        path: "job",
        select: "title company location",
        match: keyword
          ? {
              $or: [
                { title: { $regex: keyword, $options: "i" } },
                { company: { $regex: keyword, $options: "i" } },
              ],
            }
          : {},
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const filteredApplications = applications.filter((a) => a.job);

    const total = await Application.countDocuments(query);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      applications: filteredApplications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET APPLICANTS FOR A JOB (Employer only)
export const getApplicantsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { page, limit, skip } = parsePagination(req.query);
    const { status, keyword } = req.query;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const query = { job: jobId };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate({
        path: "applicant",
        select: "name email",
        match: keyword
          ? {
              $or: [
                { name: { $regex: keyword, $options: "i" } },
                { email: { $regex: keyword, $options: "i" } },
              ],
            }
          : {},
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const filteredApplications = applications.filter((a) => a.applicant);
    const total = await Application.countDocuments(query);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      applications: filteredApplications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY JOB APPLICANTS (Employer dashboard)
export const getEmployerApplications = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status, jobId, keyword } = req.query;

    const employerJobs = await Job.find({ employer: req.user._id }).select("_id");
    const jobIds = employerJobs.map((job) => job._id);

    const query = { job: { $in: jobIds } };

    if (status) query.status = status;
    if (jobId) {
      const ownsRequestedJob = jobIds.some((id) => id.toString() === jobId);

      if (!ownsRequestedJob) {
        return res
          .status(403)
          .json({ message: "Not authorized to view applications for this job" });
      }

      query.job = jobId;
    }

    const applications = await Application.find(query)
      .populate({
        path: "applicant",
        select: "name email",
        match: keyword
          ? {
              $or: [
                { name: { $regex: keyword, $options: "i" } },
                { email: { $regex: keyword, $options: "i" } },
              ],
            }
          : {},
      })
      .populate("job", "title company location")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const filteredApplications = applications.filter((a) => a.applicant);
    const total = await Application.countDocuments(query);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      applications: filteredApplications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE APPLICATION STATUS (Employer only)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findById(id).populate("job");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    application.status = status;
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
