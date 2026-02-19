import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";


// SUPERADMIN STATS
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEmployers = await User.countDocuments({ role: "employer" });
    const totalJobseekers = await User.countDocuments({ role: "jobseeker" });
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();

    res.json({
      totalUsers,
      totalEmployers,
      totalJobseekers,
      totalJobs,
      totalApplications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getEmployerStats = async (req, res) => {
  try {
    const employerId = req.user._id;

    const totalJobs = await Job.countDocuments({ employer: employerId });

    const jobs = await Job.find({ employer: employerId }).select("_id");

    const jobIds = jobs.map(job => job._id);

    const totalApplications = await Application.countDocuments({
      job: { $in: jobIds },
    });

    res.json({
      totalJobs,
      totalApplications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getJobseekerStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalApplications = await Application.countDocuments({
      applicant: userId,
    });

    const accepted = await Application.countDocuments({
      applicant: userId,
      status: "accepted",
    });

    const rejected = await Application.countDocuments({
      applicant: userId,
      status: "rejected",
    });

    const pending = await Application.countDocuments({
      applicant: userId,
      status: "pending",
    });

    res.json({
      totalApplications,
      accepted,
      rejected,
      pending,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
