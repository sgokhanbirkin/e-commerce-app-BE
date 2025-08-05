import { Router } from "express";
import * as basketController from "../controllers/basketController";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

router.get("/", asyncHandler(basketController.list));
router.post("/", asyncHandler(basketController.add));
router.delete("/:id", asyncHandler(basketController.remove));

export default router;
