import { Router } from "express";
import { 
    updateProfileDetails, 
    updateProfileAvatar, 
    updateProfileCoverImage, 
    getProfileDetails,
    updateAccountDetails 
} from "../controllers/profile.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getProfileDetails);

router.route("/update-details").patch(updateProfileDetails);

router.route("/update-account").patch(updateAccountDetails);

router.route("/avatar").patch(
    upload.single("avatar"),
    updateProfileAvatar
);

router.route("/cover-image").patch(
    upload.single("coverImage"),
    updateProfileCoverImage
);

export default router;