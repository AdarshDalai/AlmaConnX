import { Router } from "express";
import { 
  createJob, 
  getOfficerJobsPosted, 
  updateJob, 
  uploadJobAttachment, 
  getJobApplicants, 
  updateApplicantStatus 
} from "../controllers/officer.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyOfficer } from "../middlewares/role.middleware.js";

const router = Router();

router.use(verifyJWT);

router.use(verifyOfficer);

router.route("/jobs")
  .post(createJob)
  .get(getOfficerJobsPosted);

router.route("/jobs/:jobId")
  .patch(updateJob);

router.route("/jobs/:jobId/attachments")
  .post(upload.single("attachment"), uploadJobAttachment);

router.route("/jobs/:jobId/applicants")
  .get(getJobApplicants);

router.route("/jobs/:jobId/applicants/:applicantId/status")
  .patch(updateApplicantStatus);

export default router;