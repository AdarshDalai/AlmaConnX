import { Router } from "express";
import {
    getAvailableJobs,
    getJobDetails,
    applyForJob,
    getUserApplications
} from "../controllers/studentJob.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/available", getAvailableJobs);
router.get("/:jobId", getJobDetails);
router.post("/:jobId/apply", applyForJob);
router.get("/applications/me", getUserApplications);

export default router;
