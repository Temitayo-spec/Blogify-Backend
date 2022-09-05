import { Router } from "express";
const router = Router();
import { contact } from "../controllers/contactController";

router.route("/").get(contact);

export default router;