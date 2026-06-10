import { Router } from "express";
import {
  analyzeProfile,
  listProfiles,
  getProfile,
} from "../controllers/profileController";

const router = Router();

router.get("/analyze/:username", analyzeProfile);
router.get("/profiles", listProfiles);
router.get("/profiles/:id", getProfile);

export default router;
