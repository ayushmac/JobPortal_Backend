import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";


// GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json(users);
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
    const jobs = await Job.find().populate("employer", "name email");

    res.json(jobs);
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
    const applications = await Application.find()
      .populate("job", "title company")
      .populate("applicant", "name email");

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

